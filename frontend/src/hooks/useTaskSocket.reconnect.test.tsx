import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";
vi.mock("@/firebase", () => ({ mockMode: false }));
import { useTaskSocket } from "./useTaskSocket";
import { EMPTY_PROFILE } from "@/lib/taskpilot/protocol";
class FakeSocket {
  static OPEN = 1;
  static sockets: FakeSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  send = vi.fn();
  constructor(public url: string) {
    FakeSocket.sockets.push(this);
  }
  close() {
    this.readyState = 3;
    this.onclose?.();
  }
  open() {
    this.readyState = 1;
    this.onopen?.();
  }
}
const getIdToken = vi.fn(async () => "test-token");
const user = { uid: "owner-id", getIdToken } as unknown as User;
describe("Real WebSocket connection lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeSocket.sockets = [];
    getIdToken.mockClear();
    vi.stubGlobal("WebSocket", FakeSocket);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it("refreshes the token and sends authentication before any task", async () => {
    const { result } = renderHook(() => useTaskSocket(user));
    await act(async () => {
      await Promise.resolve();
    });
    const socket = FakeSocket.sockets[0];
    expect(socket).toBeDefined();
    act(() => {
      socket?.open();
    });
    expect(getIdToken).toHaveBeenCalledWith(true);
    expect(socket?.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({ type: "auth", token: "test-token" }),
    );
    act(() => {
      result.current.run("Test request", EMPTY_PROFILE);
    });
    expect(socket?.send).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({ type: "task", task: "Test request", profile: EMPTY_PROFILE }),
    );
    act(() => {
      result.current.stop();
    });
    expect(socket?.send).toHaveBeenLastCalledWith(JSON.stringify({ type: "stop" }));
  });
  it("reconnects at most five times, even when each connection opens then drops", async () => {
    const { result } = renderHook(() => useTaskSocket(user));
    await act(async () => {
      await Promise.resolve();
    });
    for (let index = 0; index <= 5; index += 1) {
      const socket = FakeSocket.sockets[index];
      expect(socket).toBeDefined();
      act(() => {
        socket?.open();
        socket?.close();
      });
      if (index < 5)
        await act(async () => {
          await vi.advanceTimersByTimeAsync(Math.min(1000 * 2 ** index, 16000));
        });
    }
    expect(FakeSocket.sockets).toHaveLength(6);
    expect(getIdToken).toHaveBeenCalledTimes(6);
    expect(result.current.status).toBe("disconnected");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });
    expect(FakeSocket.sockets).toHaveLength(6);
  });
  it("ignores malformed messages and interrupts rather than replays a disconnected task", async () => {
    const { result } = renderHook(() => useTaskSocket(user));
    await act(async () => {
      await Promise.resolve();
    });
    const socket = FakeSocket.sockets[0];
    act(() => {
      socket?.open();
    });
    act(() => {
      result.current.run("Test request", EMPTY_PROFILE);
    });
    act(() => {
      socket?.onmessage?.({ data: "malformed" });
    });
    expect(result.current.steps).toHaveLength(0);
    act(() => {
      socket?.close();
    });
    expect(result.current.running).toBe(false);
    expect(result.current.error).toContain("interrupted");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    const next = FakeSocket.sockets[1];
    act(() => {
      next?.open();
    });
    expect(next?.send).toHaveBeenCalledTimes(1);
  });
});

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/firebase", () => ({ mockMode: true }));
import { useTaskSocket } from "./useTaskSocket";
import { EMPTY_PROFILE } from "@/lib/taskpilot/protocol";
describe("Mock task lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("streams steps then returns a result and finishes", () => {
    const { result } = renderHook(() => useTaskSocket(null));
    act(() => {
      result.current.run("Find the cheapest iPhone", EMPTY_PROFILE);
    });
    expect(result.current.running).toBe(true);
    expect(result.current.steps).toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(750);
    });
    expect(result.current.steps).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(9000);
    });
    expect(result.current.steps).toHaveLength(6);
    expect(result.current.result?.data["source"]).toBe("Flipkart");
    expect(result.current.running).toBe(false);
  });
  it("Enter/run cannot start a second task while running", () => {
    const { result } = renderHook(() => useTaskSocket(null));
    act(() => {
      result.current.run("First", EMPTY_PROFILE);
    });
    let accepted = true;
    act(() => {
      accepted = result.current.run("Second", EMPTY_PROFILE);
    });
    expect(accepted).toBe(false);
    expect(result.current.task).toBe("First");
  });
  it("Stop cancels every remaining mock message", () => {
    const { result } = renderHook(() => useTaskSocket(null));
    act(() => {
      result.current.run("Check my latest order on Myntra", EMPTY_PROFILE);
      vi.advanceTimersByTime(750);
    });
    act(() => {
      result.current.stop();
    });
    const count = result.current.steps.length;
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(result.current.running).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.steps).toHaveLength(count);
  });
  it("reset removes the previous result and run before another task", () => {
    const { result } = renderHook(() => useTaskSocket(null));
    act(() => {
      result.current.run("Fill out this registration form with my details", EMPTY_PROFILE);
      vi.advanceTimersByTime(20000);
    });
    expect(result.current.result).not.toBeNull();
    act(() => {
      result.current.reset();
    });
    expect(result.current.result).toBeNull();
    expect(result.current.steps).toHaveLength(0);
    expect(result.current.task).toBe("");
  });
  it("empty tasks do not start", () => {
    const { result } = renderHook(() => useTaskSocket(null));
    let accepted = true;
    act(() => {
      accepted = result.current.run("  ", EMPTY_PROFILE);
    });
    expect(accepted).toBe(false);
    expect(result.current.running).toBe(false);
  });
});

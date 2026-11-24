import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { mockMode } from "@/firebase";
import {
  MAX_RECONNECT_ATTEMPTS,
  makeMockFlow,
  parseServerMessage,
  type FeedStep,
  type Profile,
  type ServerMessage,
} from "@/lib/taskpilot/protocol";
export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";
export function useTaskSocket(user: User | null) {
  const [status, setStatus] = useState<ConnectionStatus>(mockMode ? "connected" : "disconnected");
  const [steps, setSteps] = useState<FeedStep[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Extract<ServerMessage, { type: "result" }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runningRef = useRef(false);
  const accept = useCallback((message: ServerMessage) => {
    if (!runningRef.current) return;
    if (message.type === "step") {
      setSteps((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          step: message.step,
          kind: message.kind,
          message: message.message,
          screenshot: message.screenshot,
          timestamp: Date.now(),
        },
      ]);
    } else if (message.type === "result") {
      setResult(message);
    } else if (message.type === "error") {
      setError(message.message);
      setSteps((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          step: previous.length + 1,
          kind: "error",
          message: message.message,
          timestamp: Date.now(),
        },
      ]);
      runningRef.current = false;
      setRunning(false);
      setEndedAt(Date.now());
    } else {
      runningRef.current = false;
      setRunning(false);
      setEndedAt(Date.now());
    }
  }, []);
  const failRunning = useCallback(() => {
    if (runningRef.current) {
      runningRef.current = false;
      setRunning(false);
      setEndedAt(Date.now());
      setError(
        "The connection was lost. This run was interrupted; reconnect and start a new task.",
      );
    }
  }, []);
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    if (mockMode || !user) return;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let current: WebSocket | null = null;
    function reconnect() {
      if (cancelled) return;
      if (attempts >= MAX_RECONNECT_ATTEMPTS) {
        setStatus("disconnected");
        setError(
          "Unable to reach the agent after 5 reconnect attempts. Check the backend, then reconnect.",
        );
        return;
      }
      setStatus("reconnecting");
      retry = setTimeout(
        () => {
          attempts += 1;
          void connect();
        },
        Math.min(1000 * 2 ** attempts, 16000),
      );
    }
    async function connect() {
      setStatus("reconnecting");
      try {
        if (!user) return;
        const token = await user.getIdToken(true);
        if (cancelled) return;
        current = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws");
        socket.current = current;
        const ws = current;
        // A handshake deadline also covers servers that never finish opening.
        const deadline = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) ws.close();
        }, 10000);
        ws.onopen = () => {
          clearTimeout(deadline);
          if (cancelled) {
            ws.close();
            return;
          }
          ws.send(JSON.stringify({ type: "auth", token }));
          setStatus("connected");
          setError(null);
        };
        ws.onmessage = (event) => {
          const message = parseServerMessage(event.data);
          if (message) accept(message);
        };
        ws.onerror = () => {
          setError("The browser agent is unavailable. Check your backend connection.");
        };
        ws.onclose = () => {
          clearTimeout(deadline);
          if (!cancelled) {
            failRunning();
            reconnect();
          }
        };
      } catch {
        if (!cancelled) {
          setError("Could not connect to the browser agent.");
          reconnect();
        }
      }
    }
    void connect();
    return () => {
      cancelled = true;
      clearTimeout(retry);
      current?.close();
      socket.current = null;
    };
  }, [user, accept, failRunning, retryKey]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );
  const stop = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (socket.current?.readyState === WebSocket.OPEN)
      socket.current.send(JSON.stringify({ type: "stop" }));
    runningRef.current = false;
    setRunning(false);
    setEndedAt(Date.now());
    setSteps((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        step: previous.length + 1,
        kind: "observation",
        message: "Task stopped by you. No further actions will be taken.",
        timestamp: Date.now(),
      },
    ]);
  }, []);
  const run = useCallback(
    (text: string, profile: Profile) => {
      if (!text.trim() || runningRef.current || status !== "connected") return false;
      if (!mockMode && socket.current?.readyState !== WebSocket.OPEN) {
        setStatus("disconnected");
        setError("The agent is disconnected. Please reconnect first.");
        return false;
      }
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setSteps([]);
      setResult(null);
      setError(null);
      setTask(text.trim());
      setStartedAt(Date.now());
      setEndedAt(null);
      runningRef.current = true;
      setRunning(true);
      if (mockMode) {
        timers.current = makeMockFlow(text.trim(), profile).map((message, index) =>
          setTimeout(() => accept(message), 750 + index * 1100),
        );
      } else {
        try {
          socket.current?.send(JSON.stringify({ type: "task", task: text.trim(), profile }));
        } catch {
          failRunning();
          return false;
        }
      }
      return true;
    },
    [status, accept, failRunning],
  );
  const reset = useCallback(() => {
    if (runningRef.current) return;
    setSteps([]);
    setResult(null);
    setError(null);
    setTask("");
    setStartedAt(null);
    setEndedAt(null);
  }, []);
  const reconnect = useCallback(() => {
    setError(null);
    setRetryKey((key) => key + 1);
  }, []);
  return {
    status,
    steps,
    running,
    result,
    error,
    task,
    startedAt,
    endedAt,
    run,
    stop,
    reset,
    reconnect,
  };
}

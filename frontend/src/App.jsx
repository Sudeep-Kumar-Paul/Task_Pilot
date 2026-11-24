import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getIdToken, signOutUser } from './firebase';
import Login from './components/Login';
import TaskInput from './components/TaskInput';
import AgentPanel from './components/AgentPanel';
import ResultsPanel from './components/ResultsPanel';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/agent';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [taskType, setTaskType] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cleanupWs = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const handleSubmitTask = useCallback(
    async (task) => {
      setSteps([]);
      setResult(null);
      setError(null);
      setIsRunning(true);
      setTaskType(task.taskType);

      try {
        const token = await getIdToken();
        if (!token) {
          setError('Authentication token not available. Please sign in again.');
          setIsRunning(false);
          return;
        }

        cleanupWs();
        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify(task));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'step':
                setSteps((prev) => [
                  ...prev,
                  {
                    step: data.step,
                    action: data.action,
                    reasoning: data.reasoning,
                    screenshot: data.screenshot,
                  },
                ]);
                break;

              case 'result':
                setResult(data.data);
                setIsRunning(false);
                cleanupWs();
                break;

              case 'error':
                setError(data.message || 'An error occurred during task execution.');
                setIsRunning(false);
                cleanupWs();
                break;

              default:
                break;
            }
          } catch {
            // ignore malformed messages
          }
        };

        ws.onerror = () => {
          setError('WebSocket connection error. Is the backend running?');
          setIsRunning(false);
        };

        ws.onclose = (event) => {
          if (event.code !== 1000 && isRunning) {
            setError('Connection to server lost.');
            setIsRunning(false);
          }
        };
      } catch (err) {
        setError(err.message || 'Failed to start task.');
        setIsRunning(false);
      }
    },
    [cleanupWs, isRunning],
  );

  useEffect(() => {
    return () => cleanupWs();
  }, [cleanupWs]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full thinking-dot" />
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full thinking-dot" />
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full thinking-dot" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Task<span className="text-indigo-400">Pilot</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={signOutUser}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">
            <span className="font-medium">Error:</span> {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 text-red-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <TaskInput onSubmitTask={handleSubmitTask} isRunning={isRunning} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <AgentPanel steps={steps} isRunning={isRunning} />
          <ResultsPanel result={result} taskType={taskType} />
        </div>
      </main>
    </div>
  );
}

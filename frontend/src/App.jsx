import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getIdToken, signOutUser } from './firebase';

import Navbar from './components/Navbar';
import HeroAndInput from './components/HeroAndInput';
import LiveActivity from './components/LiveActivity';
import AgentWorkspaceSidebar from './components/AgentWorkspaceSidebar';
import Footer from './components/Footer';
import AutofillModal from './components/AutofillModal';
import LoginModal from './components/LoginModal';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/agent';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);

  const [autofillProfile, setAutofillProfile] = useState({
    name: 'Sudeep Paul',
    email: 'sudeep@example.com',
    phone: '+1 (555) 234-5678',
    address: '123 Innovation Way, Suite 400',
  });

  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [taskType, setTaskType] = useState(null);
  const [currentTaskTitle, setCurrentTaskTitle] = useState('');
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

  const handleStopTask = useCallback(() => {
    cleanupWs();
    setIsRunning(false);
  }, [cleanupWs]);

  const handleRunTask = useCallback(
    async (taskPayload) => {
      // If user isn't logged in, prompt sign in first
      if (!user) {
        setIsLoginModalOpen(true);
        return;
      }

      setSteps([]);
      setResult(null);
      setError(null);
      setIsRunning(true);
      setTaskType(taskPayload.taskType);
      setCurrentTaskTitle(taskPayload.task);

      try {
        const token = await getIdToken();
        if (!token) {
          setError('Authentication token expired. Please sign in again.');
          setIsRunning(false);
          setIsLoginModalOpen(true);
          return;
        }

        cleanupWs();
        const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify(taskPayload));
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
            // ignore non-json messages
          }
        };

        ws.onerror = () => {
          setError('Failed to connect to backend agent on port 8000. Ensure python run.py is running.');
          setIsRunning(false);
        };

        ws.onclose = (event) => {
          if (event.code !== 1000 && isRunning) {
            setError('Connection to backend server closed.');
            setIsRunning(false);
          }
        };
      } catch (err) {
        setError(err.message || 'Failed to start agent task.');
        setIsRunning(false);
      }
    },
    [user, cleanupWs, isRunning],
  );

  useEffect(() => {
    return () => cleanupWs();
  }, [cleanupWs]);

  // Derived counts for sidebar metrics
  const actionCount = steps.filter((s) => {
    const act = (s.action || '').toLowerCase();
    return act === 'click' || act === 'type' || act === 'navigate' || act === 'scroll';
  }).length;

  const thinkingCount = steps.filter((s) => {
    const act = (s.action || '').toLowerCase();
    return act !== 'click' && act !== 'type' && act !== 'navigate' && act !== 'scroll';
  }).length;

  return (
    <div className="min-h-screen bg-[#090a0d] text-slate-200 flex flex-col font-sans selection:bg-[#f95721]/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSignOut={signOutUser}
        isConnected={!error}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error Notification Banner */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-between animate-fade-in">
            <div>
              <strong className="font-semibold">Notice:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-300 hover:text-white px-2 py-0.5 rounded text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout matching Lovable design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Hero, Input & Live Activity (8 of 12 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            <HeroAndInput
              onRunTask={handleRunTask}
              onStopTask={handleStopTask}
              isRunning={isRunning}
              onOpenAutofill={() => setIsAutofillModalOpen(true)}
              autofillProfile={autofillProfile}
            />

            <LiveActivity
              steps={steps}
              isRunning={isRunning}
              result={result}
              taskType={taskType}
              currentTaskTitle={currentTaskTitle}
              onReset={() => {
                setSteps([]);
                setResult(null);
                setCurrentTaskTitle('');
              }}
            />
          </div>

          {/* Right Column: Agent Workspace Sidebar (4 of 12 cols on desktop) */}
          <div className="lg:col-span-4">
            <AgentWorkspaceSidebar
              isRunning={isRunning}
              stepCount={steps.length}
              actionCount={actionCount}
              thinkingCount={thinkingCount}
              onOpenAutofill={() => setIsAutofillModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Autofill Profile Modal */}
      <AutofillModal
        isOpen={isAutofillModalOpen}
        onClose={() => setIsAutofillModalOpen(false)}
        profile={autofillProfile}
        onSaveProfile={(newProfile) => setAutofillProfile(newProfile)}
      />

      {/* Firebase Sign-in Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

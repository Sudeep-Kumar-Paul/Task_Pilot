import {
  ArrowUpRight,
  Brain,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Command,
  Globe2,
  Loader2,
  LockKeyhole,
  MousePointer2,
  RotateCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useRouter } from "@/context/RouterContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTaskSocket } from "@/hooks/useTaskSocket";
import { useProfile } from "@/hooks/useProfile";
import { getFirebase, mockMode } from "@/firebase";
import { Header } from "./Header";
import { TaskInput } from "./TaskInput";
import { StepFeed } from "./StepFeed";
import { ResultPanel } from "./ResultPanel";
import { ProfilePanel } from "./ProfilePanel";
export function Workspace() {
  const { user, loading, error: authIssue } = useAuth();
  const agent = useTaskSocket(user);
  const profile = useProfile(user);
  const [input, setInput] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(0);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const router = useRouter();
  useEffect(() => {
    if (!mockMode && !loading && !user) void navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!agent.running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [agent.running]);
  async function signOut() {
    try {
      if (agent.running) agent.stop();
      await router.options.context.queryClient.cancelQueries();
      router.options.context.queryClient.clear();
      const [{ auth }, { signOut }] = await Promise.all([getFirebase(), import("firebase/auth")]);
      await signOut(auth);
      await navigate({ to: "/auth", replace: true });
    } catch {
      setSignOutError("Could not sign out. Please try again.");
    }
  }
  if (!mockMode && (loading || !user))
    return (
      <div className="session-loading">
        <Loader2 size={25} className="spin" />
        <p>{authIssue ?? "Opening your workspace…"}</p>
      </div>
    );
  const elapsed = agent.startedAt
    ? Math.max(0, Math.floor(((agent.endedAt ?? now) - agent.startedAt) / 1000))
    : 0;
  const completed = Boolean(agent.result && !agent.running);
  const actions = agent.steps.filter((step) => step.kind === "action").length;
  const thoughts = agent.steps.filter((step) => step.kind === "thinking").length;
  function reset() {
    agent.reset();
    setInput("");
    document.querySelector<HTMLTextAreaElement>('[aria-label="Describe your task"]')?.focus();
  }
  return (
    <div className="app-shell">
      <Header
        status={agent.status}
        email={user?.email ?? null}
        signOut={() => void signOut()}
        openProfile={() => setProfileOpen(true)}
        signIn={() => void navigate({ to: "/auth" })}
      />
      <main className="main-workspace">
        <div className="workspace-topline">
          <div>
            <span className="breadcrumb-icon">
              <Command size={13} />
            </span>{" "}
            Workspace <ChevronRight size={12} />
            <span>New task</span>
          </div>
          <span className="session-label">
            <LockKeyhole size={12} />
            {mockMode ? "Demo workspace" : "Private workspace"}
          </span>
        </div>
        <TaskInput
          value={input}
          onChange={setInput}
          running={agent.running}
          connected={agent.status === "connected"}
          run={() => agent.run(input, profile.profile)}
          stop={agent.stop}
          openProfile={() => setProfileOpen(true)}
        />
        {(agent.error || signOutError) && (
          <div className="error-banner" role="alert">
            <CircleAlert size={17} />
            <span>{agent.error ?? signOutError}</span>
            {agent.status !== "connected" && !agent.running && (
              <Button variant="outline" size="sm" onClick={agent.reconnect}>
                <RotateCw size={13} />
                Reconnect
              </Button>
            )}
          </div>
        )}
        <div className="workspace-grid">
          <div className="main-column">
            <StepFeed
              steps={agent.steps}
              running={agent.running}
              task={agent.task}
              completed={completed}
            />
            {agent.result && (
              <ResultPanel result={agent.result} running={agent.running} reset={reset} />
            )}
          </div>
          <aside className="agent-sidebar">
            <div className="sidebar-heading">
              <h2>Agent workspace</h2>
              <span className="small-tag">{mockMode ? "MOCK" : "LIVE"}</span>
            </div>
            <div className="agent-identity">
              <span className="agent-avatar">
                <Zap size={21} fill="currentColor" strokeWidth={1.5} />
              </span>
              <div>
                <h3>TaskPilot agent</h3>
                <p>
                  <span className={`status-dot ${agent.running ? "pulsing" : ""}`} />
                  {agent.running
                    ? "Working on your task"
                    : completed
                      ? "Task completed"
                      : agent.status === "connected"
                        ? "Ready for your next task"
                        : "Waiting for connection"}
                </p>
              </div>
              <span className="identity-indicator">
                {completed ? <Check size={15} /> : <Sparkles size={16} />}
              </span>
            </div>
            <div className="agent-stats">
              <div>
                <span>
                  <Clock3 size={14} />
                  Elapsed
                </span>
                <strong>
                  {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
                  {String(elapsed % 60).padStart(2, "0")}
                </strong>
              </div>
              <div>
                <span>
                  <MousePointer2 size={14} />
                  Actions
                </span>
                <strong>{actions.toString().padStart(2, "0")}</strong>
              </div>
              <div>
                <span>
                  <Brain size={14} />
                  Thinking
                </span>
                <strong>{thoughts.toString().padStart(2, "0")}</strong>
              </div>
            </div>
            <div className="browser-status">
              <span className="browser-status-icon">
                <Globe2 size={18} />
              </span>
              <div>
                <span>{mockMode ? "Simulated browser" : "Browser connection"}</span>
                <p>
                  {agent.running
                    ? "Task in progress"
                    : completed
                      ? "Run finished"
                      : "Awaiting a task"}
                </p>
              </div>
              <span className={`status-dot ${agent.status !== "connected" ? "dot-muted" : ""}`} />
            </div>
            <div className="sidebar-separator" />
            <div className="run-details">
              <span className="sidebar-eyebrow">THIS SESSION</span>
              <div>
                <span>Environment</span>
                <span>{mockMode ? "Mock demo" : "Browser agent"}</span>
              </div>
              <div>
                <span>Connection</span>
                <span className="connection-value">
                  {agent.status === "connected"
                    ? "Connected"
                    : agent.status === "reconnecting"
                      ? "Reconnecting"
                      : "Disconnected"}
                </span>
              </div>
              <div>
                <span>Execution</span>
                <span>
                  {agent.running
                    ? "In progress"
                    : completed
                      ? "Completed"
                      : agent.task
                        ? "Stopped"
                        : "Not started"}
                </span>
              </div>
            </div>
            <div className="sidebar-separator" />
            <Button
              variant="ghost"
              className="profile-shortcut"
              onClick={() => setProfileOpen(true)}
            >
              <span className="profile-shortcut-icon">
                <UserRound size={16} />
              </span>
              <span>
                <strong>Autofill profile</strong>
                <small>
                  {profile.profile.name ? profile.profile.name : "Your details, when you need them"}
                </small>
              </span>
              <ArrowUpRight size={15} />
            </Button>
            <div className="sidebar-security">
              <ShieldCheck size={14} />
              <span>
                {mockMode ? "Sample data. Real-time experience." : "Your profile is yours alone."}
              </span>
            </div>
          </aside>
        </div>
        <footer className="workspace-footer">
          <span>
            <span className="footer-mark">
              <Zap size={12} fill="currentColor" />
            </span>
            Less busywork. More possibility.
          </span>
          <span>
            TaskPilot <span className="version-label">v0.1</span>
            <span className="footer-dot">·</span>Built to take action.
          </span>
        </footer>
      </main>
      {profileOpen && <ProfilePanel state={profile} close={() => setProfileOpen(false)} />}
    </div>
  );
}

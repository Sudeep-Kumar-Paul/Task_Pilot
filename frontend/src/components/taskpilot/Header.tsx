import { ArrowUpRight, ChevronDown, LogOut, Radio, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockMode } from "@/firebase";
import type { ConnectionStatus } from "@/hooks/useTaskSocket";
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-symbol">
        <Zap fill="currentColor" size={19} strokeWidth={1.5} />
      </span>
      <span>
        TaskPilot<span className="brand-period">.</span>
      </span>
    </span>
  );
}
export function Header({
  status,
  email,
  signOut,
  openProfile,
  signIn,
}: {
  status: ConnectionStatus;
  email: string | null;
  signOut: () => void;
  openProfile: () => void;
  signIn: () => void;
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <Brand />
          <span className="header-divider" />
          <span className="workspace-label">Workspace</span>
        </div>
        <div className="header-right">
          <span className={`connection connection--${status}`}>
            <span className="status-dot" />
            {status === "connected"
              ? "Agent connected"
              : status === "reconnecting"
                ? "Reconnecting"
                : "Disconnected"}
          </span>
          {mockMode ? (
            <>
              <span className="demo-tag">
                <Radio size={12} /> Demo mode
              </span>
              <Button variant="ghost" size="sm" onClick={signIn}>
                Sign in <ArrowUpRight size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="account-button" onClick={openProfile}>
                <span className="avatar">{(email ?? "U").slice(0, 1).toUpperCase()}</span>
                <span className="account-email">{email}</span>
                <ChevronDown size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Sign out"
                aria-label="Sign out"
                onClick={signOut}
              >
                <LogOut size={17} />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

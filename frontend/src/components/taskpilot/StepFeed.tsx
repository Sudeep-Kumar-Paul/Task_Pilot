import {
  Activity,
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  CircleAlert,
  Eye,
  Globe2,
  MousePointer2,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { mockMode } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { FeedStep } from "@/lib/taskpilot/protocol";
const kinds = {
  thinking: { icon: Brain, title: "Thinking" },
  action: { icon: MousePointer2, title: "Action" },
  observation: { icon: Eye, title: "Observation" },
  error: { icon: CircleAlert, title: "Error" },
  result: { icon: Check, title: "Result" },
};
export function StepCard({ step, active }: { step: FeedStep; active: boolean }) {
  const { icon: Icon, title } = kinds[step.kind];
  return (
    <li className={`timeline-item ${active ? "timeline-item--active" : ""}`}>
      <span className={`step-node step-node--${step.kind}`}>
        {active ? (
          <span className="active-pulse" />
        ) : step.kind === "error" ? (
          <CircleAlert size={13} />
        ) : (
          <Check size={12} />
        )}
      </span>
      <article className={`step-card step-card--${step.kind}`}>
        <div className="step-meta">
          <span className="step-number">STEP {String(step.step).padStart(2, "0")}</span>
          <span className={`step-kind step-kind--${step.kind}`}>
            <Icon size={12} />
            {title}
          </span>
          <time dateTime={new Date(step.timestamp).toISOString()}>
            {new Date(step.timestamp).toLocaleTimeString([], {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </time>
        </div>
        <p>{step.message}</p>
        {step.screenshot && (
          <div className="mt-2.5 rounded-lg overflow-hidden border border-[var(--border)] max-w-sm">
            <img
              src={`data:image/png;base64,${step.screenshot}`}
              alt={`Step ${step.step} screenshot`}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        )}
      </article>
    </li>
  );
}
export function StepFeed({
  steps,
  running,
  task,
  completed,
}: {
  steps: FeedStep[];
  running: boolean;
  task: string;
  completed: boolean;
}) {
  const { user } = useAuth();
  const scroll = useRef<HTMLDivElement>(null);
  const shouldFollow = useRef(true);
  const [follow, setFollow] = useState(true);
  useEffect(() => {
    if (shouldFollow.current && scroll.current)
      scroll.current.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
  }, [steps]);
  useEffect(() => {
    if (!task) {
      shouldFollow.current = true;
      setFollow(true);
    }
  }, [task]);
  return (
    <section className="feed-section">
      <div className="panel-heading">
        <h2>
          <Activity size={17} /> Live activity{" "}
          <span className="count-badge">{steps.length.toString().padStart(2, "0")}</span>
        </h2>
        <span className={`feed-state ${running ? "feed-state--running" : ""}`}>
          <span className="status-dot" />
          {running ? "RUNNING" : completed ? "COMPLETED" : task ? "STOPPED" : "STANDING BY"}
        </span>
      </div>
      {steps.length === 0 ? (
        <div className="feed-empty">
          <div className="browser-illustration" aria-hidden="true">
            <div className="illustration-top">
              <span />
              <span />
              <span />
              <div>
                <Globe2 size={10} /> taskpilot.agent
              </div>
            </div>
            <div className="illustration-content">
              <span className="illustration-line illustration-line--short" />
              <span className="illustration-line" />
              <span className="illustration-line illustration-line--mid" />
              <div className="illustration-cursor">
                <MousePointer2 size={25} fill="currentColor" strokeWidth={1.5} />
              </div>
              <span className="illustration-spark">
                <Sparkles size={18} />
              </span>
            </div>
            <span className="illustration-status">
              <span className="status-dot" /> {running ? "Planning your task" : "Ready to work"}
            </span>
          </div>
          <h3>{running ? "Getting things in motion…" : "Your next task starts here"}</h3>
          <p>
            {running
              ? "Waiting for the agent’s first step."
              : "A goal in your words. A plan. Then action."}
          </p>
          <div className="empty-workflow">
            <span>
              <Terminal size={14} />
              Describe
            </span>
            <ArrowRight size={14} />
            <span>
              <Brain size={14} />
              Plan
            </span>
            <ArrowRight size={14} />
            <span>
              <MousePointer2 size={14} />
              Execute
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="active-task">
            <span className="task-label">TASK</span>
            <p>{task}</p>
            {mockMode && <span className="small-tag">SIMULATED</span>}
          </div>
          <div
            className="feed-scroll"
            ref={scroll}
            onScroll={() => {
              if (!scroll.current) return;
              const el = scroll.current;
              shouldFollow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
              setFollow(shouldFollow.current);
            }}
            role="log"
            aria-label="Live task steps"
            aria-live="polite"
          >
            <ol className="timeline">
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  active={running && index === steps.length - 1}
                />
              ))}
            </ol>
          </div>
          {!follow && (
            <Button
              variant="secondary"
              size="sm"
              className="follow-button"
              onClick={() => {
                shouldFollow.current = true;
                setFollow(true);
                scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
              }}
            >
              <ChevronDown size={14} />
              Latest step
            </Button>
          )}
        </>
      )}
      <div className="feed-footer">
        <span>
          <span className="privacy-dot" />{" "}
          {mockMode || !user
            ? "Mock agent · No websites accessed"
            : "Private session · Firebase authenticated"}
        </span>
        <span>One step at a time.</span>
      </div>
    </section>
  );
}

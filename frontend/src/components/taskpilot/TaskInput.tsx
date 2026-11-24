import {
  ArrowUp,
  CornerDownLeft,
  Loader2,
  Package,
  ShoppingBag,
  Square,
  TextCursorInput,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { EXAMPLES } from "@/lib/taskpilot/protocol";
export function TaskInput({
  value,
  onChange,
  running,
  connected,
  run,
  stop,
  openProfile,
}: {
  value: string;
  onChange: (value: string) => void;
  running: boolean;
  connected: boolean;
  run: () => void;
  stop: () => void;
  openProfile: () => void;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    run();
  }
  const icons = { shopping: ShoppingBag, form: TextCursorInput, package: Package };
  return (
    <section className="task-section">
      <div className="section-eyebrow">
        <span className="tiny-line" /> YOUR BROWSER, ON AUTOPILOT
      </div>
      <h1>
        What’s the task?
        <span className="heading-spark">
          <WandSparkles size={26} strokeWidth={1.6} />
        </span>
      </h1>
      <p className="heading-subtitle">You set the goal. Your agent takes it from here.</p>
      <form
        className={`task-composer ${running ? "task-composer--running" : ""}`}
        onSubmit={submit}
      >
        <textarea
          ref={input}
          aria-label="Describe your task"
          placeholder="Find, fill, compare, check… what would you like done?"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={running}
          maxLength={5000}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              run();
            }
          }}
        />
        <div className="composer-bottom">
          <Button variant="ghost" size="sm" onClick={openProfile}>
            <UserRound size={15} /> Autofill profile
          </Button>
          <div className="composer-actions">
            <span className="enter-hint">
              <CornerDownLeft size={12} /> Enter to run
            </span>
            {running ? (
              <Button variant="destructive" onClick={stop}>
                <Square size={13} fill="currentColor" /> Stop task
              </Button>
            ) : (
              <Button type="submit" disabled={!value.trim() || !connected}>
                <span>Run task</span>
                <ArrowUp size={16} />
              </Button>
            )}
          </div>
        </div>
        {running && (
          <span className="composer-running">
            <Loader2 size={13} className="spin" /> Agent is working
          </span>
        )}
      </form>
      <div className="examples">
        <span className="examples-label">TRY A TASK</span>
        <div className="example-buttons">
          {EXAMPLES.map((example) => {
            const Icon = icons[example.icon];
            return (
              <Button
                key={example.id}
                variant="outline"
                size="sm"
                disabled={running}
                className={value === example.task ? "example-selected" : ""}
                onClick={() => {
                  onChange(example.task);
                  input.current?.focus();
                }}
                title={example.task}
              >
                <Icon size={14} />
                {example.title}
                <span className="example-arrow">↗</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, Check, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockMode } from "@/firebase";
import type { ServerMessage } from "@/lib/taskpilot/protocol";
export function ResultPanel({
  result,
  reset,
  running,
}: {
  result: Extract<ServerMessage, { type: "result" }>;
  reset: () => void;
  running: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(result.message);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  const data = result.data;
  return (
    <section className="result-panel" aria-label="Final result">
      <div className="result-top">
        <span className="result-label">
          <CheckCircle2 size={16} />
          TASK COMPLETE
        </span>
        {mockMode && <span className="small-tag">MOCK RESULT</span>}
      </div>
      <h3>{typeof data["highlight"] === "string" ? data["highlight"] : result.message}</h3>
      {typeof data["source"] === "string" && (
        <div className="result-source">
          {data["source"]}
          {typeof data["detail"] === "string" && (
            <>
              <span>·</span>
              {data["detail"]}
            </>
          )}
        </div>
      )}
      <p>{result.message}</p>
      {typeof data["savings"] === "string" && (
        <span className="result-savings">{data["savings"]}</span>
      )}
      <div className="result-actions">
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy result"}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset} disabled={running}>
          Run another task
          <ArrowRight size={14} />
        </Button>
      </div>
      {copyError && (
        <p className="error-text" role="alert">
          Could not copy. You can select and copy the result text.
        </p>
      )}
    </section>
  );
}

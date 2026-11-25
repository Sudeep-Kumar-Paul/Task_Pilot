import { ArrowRight, Check, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockMode } from "@/firebase";
import type { ServerMessage } from "@/lib/taskpilot/protocol";
import ShinyText from "@/components/bits/ShinyText/ShinyText";

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
  const highlightText = typeof data["highlight"] === "string" ? data["highlight"] : result.message;

  return (
    <section className="result-panel" aria-label="Final result">
      <div className="result-top">
        <span className="result-label">
          <CheckCircle2 size={16} />
          TASK COMPLETE
        </span>
        {mockMode && <span className="small-tag">MOCK RESULT</span>}
      </div>
      <h3>
        <ShinyText text={highlightText} speed={3} shineColor="#34d399" color="#10b981" />
      </h3>
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

      {Array.isArray(data["results"]) && data["results"].length > 0 && (
        <div className="mt-4 mb-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[#0d0d0d]">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase text-slate-400 bg-[#161616] border-b border-[var(--border)]">
              <tr>
                <th className="py-2 px-3">Store</th>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3">Price</th>
                <th className="py-2 px-3">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212121]">
              {(data["results"] as any[]).map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">{item.site}</td>
                  <td className="py-2.5 px-3 text-slate-300">{item.name}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{item.price}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
                      {item.in_stock ? "In Stock" : "Available"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

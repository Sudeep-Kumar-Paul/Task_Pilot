import React, { useState } from 'react';
import { Activity, Brain, MousePointer, Eye, CheckCircle2, Copy, RotateCcw, Maximize2, X } from 'lucide-react';

export default function LiveActivity({
  steps = [],
  isRunning,
  result,
  taskType,
  currentTaskTitle,
  onReset,
}) {
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [copied, setCopied] = useState(false);

  const stepCount = steps.length.toString().padStart(2, '0');

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          • RUNNING
        </span>
      );
    }
    if (result) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          • COMPLETED
        </span>
      );
    }
    return (
      <span className="text-xs text-slate-500 font-semibold tracking-wider">
        • STANDING BY
      </span>
    );
  };

  const getActionBadge = (action) => {
    const act = (action || '').toLowerCase();
    if (act === 'click' || act === 'type' || act === 'navigate' || act === 'scroll' || act === 'action') {
      return (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center gap-1">
          <MousePointer className="w-2.5 h-2.5" />
          Action
        </span>
      );
    }
    if (act === 'extract' || act === 'observation') {
      return (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Eye className="w-2.5 h-2.5" />
          Observation
        </span>
      );
    }
    if (act === 'done') {
      return (
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Done
        </span>
      );
    }
    return (
      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center gap-1">
        <Brain className="w-2.5 h-2.5" />
        Thinking
      </span>
    );
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#12151c] border border-[#212634] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-[#1b202c] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Live activity</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1b202c] text-slate-300 border border-[#272d3b]">
            {stepCount}
          </span>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Body Area */}
      <div className="p-5 flex-1 min-h-[340px] flex flex-col justify-between">
        {steps.length === 0 && !isRunning ? (
          /* Empty State (Matches Screenshot 2) */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
            {/* Mock browser card */}
            <div className="w-56 bg-[#161a22] border border-[#272d3b] rounded-xl p-3.5 shadow-2xl relative mb-6">
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#212634]">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="ml-auto text-[9px] text-slate-500 font-mono">taskpilot.agent</div>
              </div>
              <div className="pt-4 pb-2 space-y-2">
                <div className="h-2 w-28 bg-slate-700/60 rounded-full" />
                <div className="h-2 w-16 bg-slate-800 rounded-full" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready to work
                </span>
                <span className="text-[#f95721] text-xs">✨</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              Your next task starts here
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              A goal in your words. A plan. Then action.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#161a22] border border-[#212634] px-4 py-2 rounded-xl">
              <span>&gt;_ Describe</span>
              <span className="text-slate-600">→</span>
              <span>🧠 Plan</span>
              <span className="text-slate-600">→</span>
              <span>🚀 Execute</span>
            </div>
          </div>
        ) : (
          /* Active Steps Feed */
          <div className="space-y-4 flex-1">
            {/* Task Info Pill */}
            {currentTaskTitle && (
              <div className="text-[11px] font-mono text-slate-400 bg-[#181d27] border border-[#272d3b] px-3 py-1.5 rounded-lg flex items-center justify-between">
                <span className="truncate max-w-[80%]">
                  <strong className="text-slate-300">TASK:</strong> {currentTaskTitle}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">PLAYWRIGHT</span>
              </div>
            )}

            {/* Steps Timeline */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {steps.map((step, idx) => (
                <article
                  key={idx}
                  className="bg-[#161a22] border border-[#212634] hover:border-slate-700 rounded-xl p-3.5 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-300">
                        STEP {step.step.toString().padStart(2, '0')}
                      </span>
                      {getActionBadge(step.action)}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans mb-2">
                    {step.reasoning || `Executing action: ${step.action}`}
                  </p>

                  {/* Screenshot thumbnail if available */}
                  {step.screenshot && (
                    <div className="relative group rounded-lg overflow-hidden border border-[#272d3b] bg-black/40 mt-2">
                      <img
                        src={`data:image/png;base64,${step.screenshot}`}
                        alt={`Screenshot step ${step.step}`}
                        className="w-full h-32 object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => setSelectedScreenshot(step.screenshot)}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedScreenshot(step.screenshot)}
                        className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1 transition-colors"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>View browser</span>
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {isRunning && (
                <div className="flex items-center gap-2 p-3 bg-[#181d27]/60 border border-[#272d3b] rounded-xl text-xs text-slate-400 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#f95721] animate-ping" />
                  <span>Agent is thinking and driving Chromium…</span>
                </div>
              )}
            </div>

            {/* Final Result Card */}
            {result && (
              <div className="mt-4 p-4 bg-[#161d26] border border-emerald-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#212c38]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    TASK COMPLETE · RESULT
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResult}
                      className="text-xs text-slate-300 hover:text-white bg-[#1a2330] hover:bg-[#232f40] px-2.5 py-1 rounded-lg border border-[#272d3b] flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy result'}</span>
                    </button>
                    {onReset && (
                      <button
                        onClick={onReset}
                        className="text-xs text-slate-300 hover:text-white bg-[#1a2330] hover:bg-[#232f40] px-2.5 py-1 rounded-lg border border-[#272d3b] flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Run another</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Render structured result */}
                {result.type === 'price_comparison' || result.results ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white">
                      Price Comparison: {result.product || 'Product'}
                    </h4>
                    {result.recommendation && (
                      <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
                        💡 <strong>Recommendation:</strong> {result.recommendation}
                      </p>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="text-[10px] uppercase text-slate-400 bg-[#121820]">
                          <tr>
                            <th className="p-2">Store</th>
                            <th className="p-2">Product</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#212c38]">
                          {(result.results || []).map((item, i) => (
                            <tr key={i} className="hover:bg-[#1c2634]">
                              <td className="p-2 font-medium text-white">{item.site}</td>
                              <td className="p-2 truncate max-w-[140px]">{item.name}</td>
                              <td className="p-2 font-bold text-emerald-400">
                                {typeof item.price === 'string' && (item.price.startsWith('₹') || item.price.startsWith('$'))
                                  ? item.price
                                  : result.currency === '₹' || result.currency === 'INR'
                                    ? `₹${item.price}`
                                    : `$${item.price}`}
                              </td>
                              <td className="p-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                  {item.in_stock ? 'In Stock' : 'Available'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : result.type === 'order_status' || result.order_id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Order ID:</span>
                      <span className="font-mono text-xs font-bold text-white bg-[#121820] px-2 py-0.5 rounded">
                        {result.order_id || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{result.status || 'Out for delivery'}</span>
                    </div>
                    {result.estimated_delivery && (
                      <p className="text-xs text-slate-300">
                        <strong>Expected:</strong> {result.estimated_delivery}
                      </p>
                    )}
                    {result.details && (
                      <p className="text-xs text-slate-400">{result.details}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">
                      {result.confirmation || result.message || 'Task completed successfully.'}
                    </p>
                    <pre className="text-[11px] font-mono bg-black/40 p-2.5 rounded-lg overflow-x-auto text-slate-400">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer info bar */}
        <div className="pt-4 border-t border-[#1b202c] mt-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>• Live Playwright agent · Real browser</span>
          <span>One step at a time.</span>
        </div>
      </div>

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#12151c] border border-[#272d3b] rounded-2xl max-w-4xl w-full p-4 relative">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#212634]">
              <span className="text-xs font-mono font-bold text-slate-300">
                Playwright Headed Chromium Snapshot
              </span>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={`data:image/png;base64,${selectedScreenshot}`}
              alt="Browser Full Snapshot"
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg border border-[#272d3b]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

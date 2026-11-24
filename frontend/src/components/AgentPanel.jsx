import { useEffect, useRef } from 'react';

const ACTION_COLORS = {
  navigate: 'bg-blue-500/20 text-blue-400',
  click: 'bg-green-500/20 text-green-400',
  type: 'bg-yellow-500/20 text-yellow-400',
  scroll: 'bg-purple-500/20 text-purple-400',
  extract: 'bg-cyan-500/20 text-cyan-400',
  done: 'bg-emerald-500/20 text-emerald-400',
};

export default function AgentPanel({ steps, isRunning }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-h-[400px] max-h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
          <span className="text-base">🧠</span>
          Agent Steps
        </h3>
        {isRunning && (
          <span className="text-xs text-indigo-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Steps list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {steps.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm py-12">
            <span className="text-3xl mb-2">🤖</span>
            <p>No steps yet.</p>
            <p className="text-xs mt-1">Run a task to see the agent in action.</p>
          </div>
        )}

        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              {/* Step number badge */}
              <div className="flex-shrink-0 w-7 h-7 bg-indigo-600/30 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold">
                {step.step}
              </div>

              <div className="flex-1 min-w-0">
                {/* Action badge */}
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1.5 ${
                    ACTION_COLORS[step.action] || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {step.action}
                </span>

                {/* Reasoning */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {step.reasoning}
                </p>
              </div>

              {/* Screenshot thumbnail */}
              {step.screenshot && (
                <div className="flex-shrink-0 w-20 h-14 rounded border border-slate-700 overflow-hidden bg-slate-800">
                  <img
                    src={`data:image/png;base64,${step.screenshot}`}
                    alt={`Step ${step.step} screenshot`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-2 animate-fade-in">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full thinking-dot" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full thinking-dot" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full thinking-dot" />
            </div>
            <span className="text-xs text-slate-400">Agent is thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}

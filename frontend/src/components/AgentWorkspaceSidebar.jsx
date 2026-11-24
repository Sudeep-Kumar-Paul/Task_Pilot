import React, { useState, useEffect } from 'react';
import { Zap, Clock, Send, Brain, Globe, ShieldCheck, User, Sparkles } from 'lucide-react';

export default function AgentWorkspaceSidebar({
  isRunning,
  stepCount = 0,
  actionCount = 0,
  thinkingCount = 0,
  onOpenAutofill,
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Keep final time or reset on new run
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // Format elapsed mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusText = () => {
    if (isRunning) return 'Working on your task';
    if (stepCount > 0) return 'Task completed';
    return 'Ready for your next task';
  };

  const getExecutionStatus = () => {
    if (isRunning) return <span className="text-amber-400 font-semibold">In progress</span>;
    if (stepCount > 0) return <span className="text-emerald-400 font-semibold">Completed</span>;
    return <span className="text-slate-400">Not started</span>;
  };

  return (
    <aside className="space-y-4">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-white tracking-tight">Agent workspace</h2>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-[#161a22] border border-[#272d3b] px-2 py-0.5 rounded">
          LIVE
        </span>
      </div>

      {/* Main Agent Profile Card */}
      <div className="bg-[#12151c] border border-[#212634] rounded-2xl p-4 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f95721] flex items-center justify-center shadow-lg shadow-[#f95721]/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">TaskPilot agent</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRunning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span>{getStatusText()}</span>
              </p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-slate-500" />
        </div>

        {/* 3-Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1b202c]">
          {/* Elapsed */}
          <div className="bg-[#161a22] border border-[#212634] rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mb-1">
              <Clock className="w-3 h-3" />
              <span>Elapsed</span>
            </div>
            <div className="font-mono text-base font-bold text-white tracking-tight">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[#161a22] border border-[#212634] rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mb-1">
              <Send className="w-3 h-3" />
              <span>Actions</span>
            </div>
            <div className="font-mono text-base font-bold text-white tracking-tight">
              {actionCount.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Thinking */}
          <div className="bg-[#161a22] border border-[#212634] rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mb-1">
              <Brain className="w-3 h-3" />
              <span>Thinking</span>
            </div>
            <div className="font-mono text-base font-bold text-white tracking-tight">
              {thinkingCount.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Browser Indicator Card */}
        <div className="bg-[#161a22] border border-[#212634] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Chromium browser</p>
              <p className="text-[11px] text-slate-400">
                {isRunning ? 'Actively driving page' : 'Awaiting a task'}
              </p>
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
        </div>

        {/* Session Details */}
        <div className="space-y-2 pt-2 border-t border-[#1b202c]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            THIS SESSION
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Environment</span>
              <span className="text-slate-200 font-medium">Local Headed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Connection</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Execution</span>
              {getExecutionStatus()}
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI Model</span>
              <span className="text-[#f95721] font-medium font-mono text-[11px]">
                Gemini 3.8 Flash
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Autofill profile CTA Card */}
      <div
        onClick={onOpenAutofill}
        className="bg-[#12151c] hover:bg-[#161a22] border border-[#272d3b] hover:border-[#f95721]/50 rounded-2xl p-4 cursor-pointer transition-all group shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 group-hover:text-[#f95721] group-hover:bg-[#f95721]/10 flex items-center justify-center transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-[#f95721] transition-colors flex items-center gap-1">
                Autofill profile
                <span className="text-slate-500 group-hover:text-[#f95721] text-[10px]">↗</span>
              </h4>
              <p className="text-[11px] text-slate-400">Your details, when you need them</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer sample data note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Sample data. Real-time experience.</span>
      </div>
    </aside>
  );
}

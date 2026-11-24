import React from 'react';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#1b1f29] bg-[#0c0e13] mt-16 py-4">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Zap className="w-3.5 h-3.5 text-[#f95721] fill-[#f95721]" />
          <span>Less busywork. More possibility.</span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>TaskPilot</span>
          <span className="font-mono text-[10px] bg-[#161a22] border border-[#272d3b] px-1.5 py-0.5 rounded text-slate-400">
            v0.1
          </span>
          <span>·</span>
          <span>Built to take action.</span>
        </div>
      </div>
    </footer>
  );
}

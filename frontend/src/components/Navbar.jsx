import React from 'react';
import { Zap, Radio, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar({ user, onOpenLogin, onSignOut, isConnected }) {
  return (
    <header className="border-b border-[#1b1f29] bg-[#0c0e13]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f95721] flex items-center justify-center shadow-lg shadow-[#f95721]/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-tight">
              TaskPilot<span className="text-[#f95721]">.</span>
            </span>
            <span className="text-slate-600 font-light text-sm">|</span>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Workspace</span>
          </div>
        </div>

        {/* Right status badges & auth */}
        <div className="flex items-center gap-4">
          {/* Agent status */}
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent connected</span>
          </div>

          {/* Mode pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#f95721] font-medium bg-[#f95721]/10 border border-[#f95721]/25 px-2.5 py-1 rounded-full">
            <Radio className="w-3 h-3 text-[#f95721] animate-pulse" />
            <span>Live Playwright</span>
          </div>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden md:inline">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-xs text-slate-300 hover:text-white bg-[#161a22] hover:bg-[#1f2430] border border-[#272d3b] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="text-xs text-slate-200 hover:text-white bg-[#161a22] hover:bg-[#1f2430] border border-[#272d3b] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Sign in</span>
              <span className="text-slate-400">↗</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

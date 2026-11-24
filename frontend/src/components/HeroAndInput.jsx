import React, { useState } from 'react';
import { Sparkles, ArrowUp, User, Lock, Command, ShoppingBag, FileText, Package, Square } from 'lucide-react';

export default function HeroAndInput({
  onRunTask,
  onStopTask,
  isRunning,
  onOpenAutofill,
  autofillProfile,
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('price_comparison');

  const presets = [
    {
      id: 'price_comparison',
      name: 'Price comparison',
      icon: ShoppingBag,
      defaultPrompt: 'Find the cheapest iPhone 15 Pro across Amazon, Best Buy, and Walmart with a budget of $1000',
      params: { product_name: 'iPhone 15 Pro', budget: 1000 },
    },
    {
      id: 'form_autofill',
      name: 'Form autofill',
      icon: FileText,
      defaultPrompt: 'Navigate to https://httpbin.org/forms/post and fill the contact form with my profile details and submit',
      params: {
        target_url: 'https://httpbin.org/forms/post',
        fields: autofillProfile,
      },
    },
    {
      id: 'order_status',
      name: 'Order status',
      icon: Package,
      defaultPrompt: 'Check order status for order ID #MYN-284931 on the delivery portal and report expected arrival',
      params: {
        tracking_url: 'https://httpbin.org/status/200',
        order_id: 'MYN-284931',
      },
    },
  ];

  const handleSelectPreset = (preset) => {
    setPrompt(preset.defaultPrompt);
    setSelectedTaskType(preset.id);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;

    // Find if matching preset or fallback to selected type
    const preset = presets.find((p) => p.id === selectedTaskType) || presets[0];
    onRunTask({
      taskType: preset.id,
      task: prompt,
      params: {
        ...preset.params,
        customPrompt: prompt,
        fields: autofillProfile,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Command className="w-3.5 h-3.5 text-slate-400" />
          <span className="hover:text-slate-300 cursor-pointer">Workspace</span>
          <span>&gt;</span>
          <span className="text-slate-300 font-medium">New task</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Lock className="w-3 h-3" />
          <span>Demo workspace</span>
        </div>
      </div>

      {/* Hero Header */}
      <div>
        <p className="text-[11px] font-semibold tracking-wider text-[#f95721] uppercase mb-1.5 flex items-center gap-1.5">
          <span>—</span> YOUR BROWSER, ON AUTOPILOT
        </p>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What’s the task?
          </h1>
          <Sparkles className="w-6 h-6 text-[#f95721] animate-bounce-subtle" />
        </div>
        <p className="text-slate-400 text-sm mt-1">
          You set the goal. Your agent takes it from here.
        </p>
      </div>

      {/* Main Task Input Card */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-[#12151c] border border-[#212634] focus-within:border-[#f95721]/50 focus-within:ring-1 focus-within:ring-[#f95721]/20 rounded-2xl p-4 shadow-2xl transition-all"
      >
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder="Find, fill, compare, check… what would you like done?"
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base resize-none focus:outline-none leading-relaxed disabled:opacity-60"
        />

        <div className="pt-3 border-t border-[#1b202c] flex items-center justify-between">
          {/* Autofill profile trigger */}
          <button
            type="button"
            onClick={onOpenAutofill}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#181d27] hover:bg-[#202735] border border-[#272d3b] px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Autofill profile</span>
            {autofillProfile?.name && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Run / Stop Button & Shortcut hint */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              ↵ Enter to run
            </span>
            {isRunning ? (
              <button
                type="button"
                onClick={onStopTask}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop task</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="bg-[#f95721] hover:bg-[#ea4913] disabled:opacity-40 disabled:hover:bg-[#f95721] text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-[#f95721]/20 active:scale-[0.98]"
              >
                <span>Run task</span>
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase mr-1">
          TRY A TASK
        </span>
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedTaskType === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={isRunning}
              onClick={() => handleSelectPreset(preset)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[#1b202c] text-white border-[#f95721]/50 shadow-sm'
                  : 'bg-[#12151c] text-slate-300 border-[#212634] hover:bg-[#181d27] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-slate-400" />
              <span>{preset.name}</span>
              <span className="text-slate-500 text-[10px]">↗</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

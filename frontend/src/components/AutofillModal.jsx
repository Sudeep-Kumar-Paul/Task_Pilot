import React, { useState } from 'react';
import { X, User, ShieldCheck } from 'lucide-react';

export default function AutofillModal({ isOpen, onClose, profile, onSaveProfile }) {
  const [formData, setFormData] = useState(profile || {
    name: 'Sudeep Paul',
    email: 'sudeep@example.com',
    phone: '+1 (555) 234-5678',
    address: '123 Innovation Way, Suite 400',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12151c] border border-[#272d3b] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#f95721]/15 text-[#f95721] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Autofill profile</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Your details, ready when a form needs them.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#181d27] border border-[#272d3b] focus:border-[#f95721] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#181d27] border border-[#272d3b] focus:border-[#f95721] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              placeholder="e.g. jane@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Phone number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#181d27] border border-[#272d3b] focus:border-[#f95721] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors"
              placeholder="e.g. +1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#181d27] border border-[#272d3b] focus:border-[#f95721] rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors resize-none"
              placeholder="e.g. 123 Main St, City, Country"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Demo details stay in this session only.</span>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-[#f95721] hover:bg-[#ea4913] text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-[#f95721]/20"
          >
            Use these details
          </button>
        </form>
      </div>
    </div>
  );
}

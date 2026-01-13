
import React, { useState } from 'react';

interface SubmissionModalProps {
  isOpen: boolean;
  fileName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, fileName, onClose, onSubmit }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 p-4 rounded-full border border-white/10 shadow-xl">
           <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
           </svg>
        </div>

        <div className="text-center mb-8 pt-4">
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Finalize <span className="text-emerald-400">Submission</span></h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-4">
            You are about to push <span className="text-zinc-300">"{fileName}"</span> to the global cloud database.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Your Name / ID</label>
            <input
              autoFocus
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
              placeholder="e.g. John Doe - Admin"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Push to Cloud
            </button>
          </div>
        </form>
        
        <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-8">
          This data will be instantly visible on all connected devices.
        </p>
      </div>
    </div>
  );
};

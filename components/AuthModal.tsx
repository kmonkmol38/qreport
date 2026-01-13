
import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'Abbas@123') {
      onSuccess();
      setUsername('');
      setPassword('');
      setError('');
    } else {
      setError('Invalid credentials. Access Denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass-card rounded-[2.5rem] p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 p-4 rounded-full border border-white/10 shadow-xl">
           <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
           </svg>
        </div>

        <div className="text-center mb-8 pt-4">
          <h2 className="text-2xl font-black tracking-tighter text-white">ADMIN ACCESS</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Authorization Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Username</label>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
              placeholder="Enter Username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-bold"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-bold text-center animate-pulse pt-2">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

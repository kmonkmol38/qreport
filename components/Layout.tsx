
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6">
      {/* Header */}
      <header className="py-8 flex flex-col items-center justify-center">
        <div className="relative mb-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>
          <div className="relative bg-zinc-950 rounded-full p-3 border border-white/10">
            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-center tracking-tighter">
          SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">QR</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Cloud Linked v3.0</p>
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-zinc-900 mt-12">
        <p className="text-zinc-600 text-xs font-semibold tracking-widest Propper">
          Created by <span className="text-zinc-400 font-black">ALI- m.nharakkat@</span> – 2025
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 neon-border"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-lime-500"></div>
        </div>
      </footer>
    </div>
  );
};

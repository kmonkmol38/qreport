
import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import { SyncMetadata } from '../types';

interface DataStatusProps {
  count: number;
  metadata: SyncMetadata | null;
  onClear: () => void;
  onRefresh: () => void;
  lastSynced: string | null;
}

export const DataStatus: React.FC<DataStatusProps> = ({ count, metadata, onClear, onRefresh, lastSynced }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const isPending = metadata?.submitterName === 'PENDING PUSH';

  return (
    <div className="glass-card p-1 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden transition-all duration-500">
      {/* Top Bar: Submitter Info */}
      {metadata && (
        <div className={`${isPending ? 'bg-emerald-500/10' : 'bg-gradient-to-r from-cyan-500/10 to-transparent'} px-6 py-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 transition-colors`}>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-emerald-500 shadow-[0_0_8px_emerald]' : 'bg-cyan-500 shadow-[0_0_8px_cyan]'}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isPending ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {isPending ? 'Local Memory' : 'Cloud Network'}: {metadata.fileName}
            </span>
          </div>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
            {isPending ? 'Auto-Segmenting Enabled' : `By ${metadata.submitterName} @ ${metadata.timestamp}`}
          </span>
        </div>
      )}

      {/* Main Stats Bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full shadow-[0_0_12px] ${count > 0 ? (isPending ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-cyan-500 shadow-cyan-500/50 animate-pulse') : 'bg-red-500 shadow-red-500/50'}`}></div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Sync Pipeline</div>
            <div className="text-sm font-black flex items-center gap-2 text-white">
              {count > 0 ? `${count.toLocaleString()} Records` : 'Empty'}
              {lastSynced && !isPending && <span className="text-[9px] text-zinc-600 font-medium lowercase">/ synced {lastSynced}</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end gap-1 px-4 border-r border-white/5">
            <span className="text-[8px] font-black text-zinc-600 uppercase">Capacity</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-1 bg-cyan-500/30 rounded-full"></div>)}
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="p-3 rounded-xl bg-white/5 hover:bg-cyan-500/10 text-zinc-400 hover:text-cyan-400 transition-all border border-white/5"
            title="Force Sync"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>

          {count > 0 && (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-400 transition-colors px-4"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={() => { setIsAuthOpen(false); onClear(); }} 
      />
    </div>
  );
};

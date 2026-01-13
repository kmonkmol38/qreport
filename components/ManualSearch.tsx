
import React, { useState } from 'react';

interface ManualSearchProps {
  onSearch: (id: string) => void;
}

export const ManualSearch: React.FC<ManualSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full group shadow-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Empl. ID or Card No..."
        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-l-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 text-white placeholder-zinc-600 transition-all font-bold"
      />
      <button
        type="submit"
        className="bg-zinc-800 border border-zinc-800 border-l-0 rounded-r-2xl px-6 hover:bg-zinc-700 transition-colors group-hover:border-cyan-500/30"
      >
        <svg className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </form>
  );
};

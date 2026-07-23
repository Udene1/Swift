'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight } from 'lucide-react';

export default function TrackingSearchPage() {
  const [num, setNum] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (num.trim()) {
      router.push(`/track/${num.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
        <Package className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Track Your SwiftDeliver Package</h1>
        <p className="text-slate-400 text-sm">
          Enter your 8-character tracking number (e.g. SD849201) to view real-time location and download official PDF receipts.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter tracking number..."
          value={num}
          onChange={(e) => setNum(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm uppercase font-mono focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-1"
        >
          Track <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

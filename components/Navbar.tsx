'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, Search, Menu, X, ArrowRight, Truck } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickTracking, setQuickTracking] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTracking.trim()) {
      window.location.href = `/track/${quickTracking.trim().toUpperCase()}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Swift<span className="text-blue-500">Deliver</span>
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase -mt-1 font-mono">
                Global Logistics
              </span>
            </div>
          </Link>

          {/* Quick Track Input in Header */}
          <form onSubmit={handleQuickTrack} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Track number (e.g. SD849201)"
              value={quickTracking}
              onChange={(e) => setQuickTracking(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-full pl-4 pr-10 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              aria-label="Submit tracking search"
              className="absolute right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link
              href="/admin/login"
              className="bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Staff Portal
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleQuickTrack} className="relative w-full">
            <input
              type="text"
              placeholder="Track number (e.g. SD849201)"
              value={quickTracking}
              onChange={(e) => setQuickTracking(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-blue-600 text-white p-1.5 rounded-md"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-col space-y-3 font-medium text-slate-200 text-sm">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Staff Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

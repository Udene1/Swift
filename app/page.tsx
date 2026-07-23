'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Package, 
  ShieldCheck, 
  FileText, 
  Plane, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackingNumber.trim().toUpperCase();
    if (!cleaned) {
      setError('Please enter a valid tracking number');
      return;
    }
    setError('');
    setIsLoading(true);
    router.push(`/track/${cleaned}`);
  };

  const handleQuickSampleClick = (num: string) => {
    setTrackingNumber(num);
    setIsLoading(true);
    router.push(`/track/${num}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Background Glow Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Live Global Logistics & Customs Intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Track Parcels Worldwide in <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
              Real-Time Precision
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            SwiftDeliver provides instant tracking, transparent timeline movement history, customs clearance updates, and official downloadable PDF receipts.
          </p>

          {/* Search Box Card */}
          <div className="max-w-2xl mx-auto bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl glow-blue">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Tracking Number (e.g. SD849201)"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-12 pr-4 py-3.5 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Track Parcel
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <p className="mt-3 text-red-400 text-xs text-left px-2 font-medium">{error}</p>
            )}

            {/* Quick Demo Sample Pills */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center flex-wrap gap-2 text-xs text-slate-400 justify-center sm:justify-start">
              <span className="text-slate-400 font-medium">Try Demo Samples:</span>
              <button
                onClick={() => handleQuickSampleClick('SD849201')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-blue-900/40 text-blue-300 rounded-md border border-slate-700 font-mono transition-colors"
              >
                SD849201 (In Transit / Paid)
              </button>
              <button
                onClick={() => handleQuickSampleClick('SD301948')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 rounded-md border border-slate-700 font-mono transition-colors"
              >
                SD301948 (Customs Hold)
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase mb-1">
                <Clock className="w-4 h-4" /> On-Time Rate
              </div>
              <div className="text-2xl font-bold text-white">99.84%</div>
              <div className="text-slate-500 text-[11px]">Guaranteed dispatch SLAs</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase mb-1">
                <Plane className="w-4 h-4" /> Coverage
              </div>
              <div className="text-2xl font-bold text-white">185+</div>
              <div className="text-slate-500 text-[11px]">Countries connected</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase mb-1">
                <FileText className="w-4 h-4" /> PDF Receipts
              </div>
              <div className="text-2xl font-bold text-white">Instant</div>
              <div className="text-slate-500 text-[11px]">Official Tax & Shipping PDF</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase mb-1">
                <Lock className="w-4 h-4" /> Protected Admin
              </div>
              <div className="text-2xl font-bold text-white">Full Control</div>
              <div className="text-slate-500 text-[11px]">Live status & fee manager</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Companies & Recipients Trust SwiftDeliver
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Complete end-to-end visibility, automated tax receipts, and enterprise admin control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Movement History</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track your package location from departure origin to final recipient delivery step with exact timestamps and event notes.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-cyan-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Official Printable PDF Receipts</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Download separate official receipts for Shipping Freight Payments and Customs Duty Clearances instantly upon verification.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Resend Email Notifications</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Recipients receive automated confirmation emails with PDF receipts attached immediately when admin marks shipping or duty fees paid.
            </p>
          </div>

        </div>
      </section>

      {/* Admin Demo Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/30 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Protected Admin Dashboard
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Log in to Admin Panel to Manage Parcels
            </h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Create new parcels with auto-generated <span className="font-mono text-cyan-300 font-semibold">SDxxxxxx</span> numbers, update timeline events, edit fees, and toggle paid statuses.
            </p>
            <p className="text-xs text-slate-400 font-mono pt-1">
              Credentials: <span className="text-white bg-slate-800 px-2 py-0.5 rounded">admin</span> / <span className="text-white bg-slate-800 px-2 py-0.5 rounded">admin123</span>
            </p>
          </div>
          
          <a
            href="/admin/login"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all shrink-0 flex items-center gap-2"
          >
            Access Admin Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

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
            Global Express Delivery & Logistics Network
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Track Parcels Worldwide in <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
              Real-Time Precision
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            SwiftDeliver provides instant tracking, transparent movement history, customs clearance updates, and official PDF receipts.
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
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase mb-1">
                <Clock className="w-4 h-4" /> On-Time Rate
              </div>
              <div className="text-2xl font-bold text-white">99.84%</div>
              <div className="text-slate-500 text-[11px]">Guaranteed express SLAs</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase mb-1">
                <Plane className="w-4 h-4" /> Global Reach
              </div>
              <div className="text-2xl font-bold text-white">185+</div>
              <div className="text-slate-500 text-[11px]">Countries connected</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase mb-1">
                <FileText className="w-4 h-4" /> PDF Receipts
              </div>
              <div className="text-2xl font-bold text-white">Instant</div>
              <div className="text-slate-500 text-[11px]">Downloadable Tax & Shipping PDF</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase mb-1">
                <ShieldCheck className="w-4 h-4" /> Secure Tracking
              </div>
              <div className="text-2xl font-bold text-white">Encrypted</div>
              <div className="text-slate-500 text-[11px]">Verified logistics telemetry</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Customers & Enterprise Partners Trust SwiftDeliver
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Complete end-to-end visibility, automated customs documentation, and 24/7 delivery support.
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
            <h3 className="text-lg font-bold text-white">Automated Delivery Alerts</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Recipients receive automated email confirmation with PDF receipts attached immediately upon status and customs clearance updates.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

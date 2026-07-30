'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Package, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plane, 
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  Copy,
  Check,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Parcel, ParcelStatus } from '@/types/parcel';
import { generatePdfBlob } from '@/lib/pdf';

interface PageProps {
  params: Promise<{ trackingNumber: string }>;
}

export default function TrackingResultPage({ params }: PageProps) {
  const { trackingNumber } = use(params);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadingShippingPdf, setDownloadingShippingPdf] = useState(false);
  const [downloadingDutyPdf, setDownloadingDutyPdf] = useState(false);

  const fetchParcel = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/parcels/${trackingNumber}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Parcel tracking number not found in system.');
        setParcel(null);
      } else {
        setParcel(json.data);
      }
    } catch (err) {
      setError('Failed to connect to tracking server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcel();
  }, [trackingNumber]);

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async (type: 'shipping' | 'duty') => {
    if (!parcel) return;
    if (type === 'shipping' && parcel.shippingPaymentStatus !== 'Paid') return;
    if (type === 'duty' && parcel.customDutyPaymentStatus !== 'Paid') return;

    if (type === 'shipping') setDownloadingShippingPdf(true);
    else setDownloadingDutyPdf(true);

    try {
      // Direct API fetch or client fallback
      const res = await fetch(`/api/parcels/${parcel.trackingNumber}/receipt?type=${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SwiftDeliver_${type === 'shipping' ? 'Shipping_Receipt' : 'Duty_Clearance'}_${parcel.trackingNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Client-side fallback using jsPDF helper
        const blob = generatePdfBlob(parcel, type);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SwiftDeliver_${type === 'shipping' ? 'Shipping_Receipt' : 'Duty_Clearance'}_${parcel.trackingNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      // Fallback
      const blob = generatePdfBlob(parcel, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SwiftDeliver_${type === 'shipping' ? 'Shipping_Receipt' : 'Duty_Clearance'}_${parcel.trackingNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      if (type === 'shipping') setDownloadingShippingPdf(false);
      else setDownloadingDutyPdf(false);
    }
  };

  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In Transit':
      case 'Out for Delivery':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Customs Clearance':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'On Hold':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStepActiveIndex = (status: ParcelStatus): number => {
    switch (status) {
      case 'Pending': return 0;
      case 'Picked Up': return 1;
      case 'Customs Clearance': return 2;
      case 'In Transit': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      case 'On Hold': return 2;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-300 text-sm font-medium">Retrieving tracking details for {trackingNumber}...</p>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Parcel Not Found</h2>
          <p className="text-slate-400 text-sm">
            We could not find any registered parcel matching tracking number <span className="font-mono text-white font-bold">{trackingNumber}</span>.
          </p>
        </div>
        <div className="pt-4 flex justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const activeStep = getStepActiveIndex(parcel.status);
  const steps = ['Label Created', 'Picked Up', 'Customs Clearance', 'In Transit', 'Out for Delivery', 'Delivered'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Navigation & Refetch */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
        <button
          onClick={fetchParcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {/* Main Status Header Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 glow-blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">
                {parcel.trackingNumber}
              </h1>
              <button
                onClick={copyTracking}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy tracking number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <span>Origin: <strong className="text-slate-200">{parcel.origin}</strong></span>
              <span>→</span>
              <span>Destination: <strong className="text-slate-200">{parcel.destination}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${getStatusBadge(parcel.status)}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
              {parcel.status}
            </div>
          </div>

        </div>

        {/* Origin -> Current -> Destination Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>{parcel.origin}</span>
            <span className="text-blue-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Currently: {parcel.currentLocation}
            </span>
            <span>{parcel.destination}</span>
          </div>

          {/* Stepper Dots */}
          <div className="relative pt-2">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-700" 
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between -mt-3.5">
              {steps.map((st, i) => (
                <div key={st} className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    i <= activeStep 
                      ? 'bg-blue-600 border-blue-400 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                    {i <= activeStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${
                    i === activeStep ? 'text-white font-bold' : 'text-slate-500'
                  }`}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Location & Estimated Delivery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" /> Current Location
            </div>
            <p className="text-white text-sm font-bold">{parcel.currentLocation}</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-400" /> Estimated Delivery
            </div>
            <p className="text-white text-sm font-bold">{parcel.estimatedDelivery}</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" /> Weight & Contents
            </div>
            <p className="text-white text-sm font-bold">{parcel.weightKg} kg &bull; {parcel.description}</p>
          </div>

        </div>

      </div>

      {/* Financial Breakdown & PDF Receipt Downloads Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Fees & Official PDF Receipts
            </h2>
            <p className="text-slate-400 text-xs">
              Official downloadable invoices for shipping charges and customs tariff clearance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Shipping Fee */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Shipping & Handling Fee
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                parcel.shippingPaymentStatus === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {parcel.shippingPaymentStatus === 'Paid' ? 'PAID ✔' : 'UNPAID'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">${parcel.shippingFee.toFixed(2)}</span>
              <span className="text-xs text-slate-400">USD</span>
            </div>

            {parcel.shippingPaidAt && (
              <p className="text-[11px] text-slate-400">
                Paid on: {new Date(parcel.shippingPaidAt).toLocaleString()}
              </p>
            )}

            {parcel.shippingPaymentStatus === 'Paid' ? (
              <button
                onClick={() => handleDownloadPdf('shipping')}
                disabled={downloadingShippingPdf}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloadingShippingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Shipping Receipt...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Shipping Payment Receipt (PDF)
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-3 bg-slate-900 border border-slate-800/80 text-slate-400 text-xs font-medium rounded-xl flex items-center justify-center gap-2 shadow-inner">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Receipt Unavailable (Awaiting Payment Verification)</span>
              </div>
            )}
          </div>

          {/* Card 2: Custom Duty */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Custom Duty & Tariff Fee
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                parcel.customDutyPaymentStatus === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {parcel.customDutyPaymentStatus === 'Paid' ? 'DUTY CLEARED ✔' : 'UNPAID / ACTION REQ'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">${parcel.customDuty.toFixed(2)}</span>
              <span className="text-xs text-slate-400">USD</span>
            </div>

            {parcel.customDutyPaidAt ? (
              <p className="text-[11px] text-slate-400">
                Cleared on: {new Date(parcel.customDutyPaidAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-[11px] text-amber-400">
                Customs release pending duty payment verification.
              </p>
            )}

            {parcel.customDutyPaymentStatus === 'Paid' ? (
              <button
                onClick={() => handleDownloadPdf('duty')}
                disabled={downloadingDutyPdf}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloadingDutyPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Clearance Certificate...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Custom Duty Clearance Receipt (PDF)
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-3 bg-slate-900 border border-slate-800/80 text-slate-400 text-xs font-medium rounded-xl flex items-center justify-center gap-2 shadow-inner">
                <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Clearance Certificate Locked (Duty Unpaid)</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Movement Timeline Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Full Movement Timeline
            </h2>
            <p className="text-slate-400 text-xs">
              Chronological log of scanning checkpoints and customs milestones.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
            {parcel.timeline.length} Events
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {parcel.timeline.map((evt, idx) => (
            <div key={evt.id || idx} className="relative space-y-1 group">
              
              {/* Event Dot */}
              <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                idx === parcel.timeline.length - 1
                  ? 'bg-blue-600 border-cyan-300 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}>
                {idx === parcel.timeline.length - 1 ? '📍' : '✓'}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {evt.description}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getStatusBadge(evt.status)}`}>
                    {evt.status}
                  </span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> {evt.location}
              </p>

            </div>
          ))}
        </div>
      </div>

      {/* Customer / Sender Information Footer Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" /> Sender Information
          </span>
          <p className="text-slate-200 font-medium">{parcel.senderName}</p>
          <p>{parcel.senderEmail}</p>
          <p className="text-slate-400">{parcel.senderAddress}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" /> Recipient Information
          </span>
          <p className="text-slate-200 font-medium">{parcel.recipientName}</p>
          <p>{parcel.recipientEmail}</p>
          <p className="text-slate-400">{parcel.recipientAddress}</p>
        </div>
      </div>

    </div>
  );
}

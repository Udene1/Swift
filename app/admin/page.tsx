'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Package, 
  Search, 
  RefreshCw, 
  LogOut, 
  Edit, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  X,
  Filter,
  Send,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Parcel, ParcelStatus, PaymentStatus, CreateParcelInput } from '@/types/parcel';

export default function AdminDashboardPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateParcelInput>({
    senderName: '',
    senderEmail: '',
    senderAddress: '',
    recipientName: '',
    recipientEmail: '',
    recipientAddress: '',
    origin: '',
    destination: '',
    currentLocation: '',
    estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    weightKg: 2.5,
    description: 'Standard Logistics Freight',
    shippingFee: 120.00,
    customDuty: 45.00,
  });

  const [editForm, setEditForm] = useState<{
    status: ParcelStatus;
    currentLocation: string;
    shippingFee: number;
    shippingPaymentStatus: PaymentStatus;
    customDuty: number;
    customDutyPaymentStatus: PaymentStatus;
  }>({
    status: 'Pending',
    currentLocation: '',
    shippingFee: 0,
    shippingPaymentStatus: 'Unpaid',
    customDuty: 0,
    customDutyPaymentStatus: 'Unpaid',
  });

  const [timelineForm, setTimelineForm] = useState<{
    status: ParcelStatus;
    location: string;
    description: string;
  }>({
    status: 'In Transit',
    location: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/parcels');
      const json = await res.json();
      if (res.ok && json.success) {
        setParcels(json.data);
      }
    } catch (err) {
      showToast('Failed to fetch parcels list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Create Parcel Handler
  const handleCreateParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Parcel ${json.data.trackingNumber} created successfully!`, 'success');
        setIsCreateModalOpen(false);
        fetchParcels();
      } else {
        showToast(json.error || 'Failed to create parcel', 'error');
      }
    } catch (err) {
      showToast('Server error while creating parcel', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setEditForm({
      status: parcel.status,
      currentLocation: parcel.currentLocation,
      shippingFee: parcel.shippingFee,
      shippingPaymentStatus: parcel.shippingPaymentStatus,
      customDuty: parcel.customDuty,
      customDutyPaymentStatus: parcel.customDutyPaymentStatus,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Handler (triggers auto email + PDF generation when status changed to Paid)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/parcels/${selectedParcel.trackingNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        let msg = `Parcel ${selectedParcel.trackingNumber} updated successfully!`;
        if (json.notifications?.shippingEmailSent || json.notifications?.dutyEmailSent) {
          msg += ' Official PDF Receipt email sent to recipient.';
        }
        showToast(msg, 'success');
        setIsEditModalOpen(false);
        fetchParcels();
      } else {
        showToast(json.error || 'Failed to update parcel', 'error');
      }
    } catch (err) {
      showToast('Error updating parcel', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Timeline Modal
  const openTimelineModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setTimelineForm({
      status: parcel.status,
      location: parcel.currentLocation,
      description: `Package arrived at ${parcel.currentLocation}`,
    });
    setIsTimelineModalOpen(true);
  };

  // Save Timeline Entry
  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/parcels/${selectedParcel.trackingNumber}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timelineForm),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Timeline event added to ${selectedParcel.trackingNumber}`, 'success');
        setIsTimelineModalOpen(false);
        fetchParcels();
      } else {
        showToast(json.error || 'Failed to add event', 'error');
      }
    } catch (err) {
      showToast('Error adding timeline event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Payment Toggle
  const handleQuickTogglePayment = async (parcel: Parcel, field: 'shipping' | 'duty') => {
    const isShipping = field === 'shipping';
    const currentStatus = isShipping ? parcel.shippingPaymentStatus : parcel.customDutyPaymentStatus;
    const newStatus: PaymentStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';

    const updates = isShipping 
      ? { shippingPaymentStatus: newStatus } 
      : { customDutyPaymentStatus: newStatus };

    try {
      const res = await fetch(`/api/parcels/${parcel.trackingNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        let msg = `${isShipping ? 'Shipping Fee' : 'Custom Duty'} marked as ${newStatus} for ${parcel.trackingNumber}.`;
        if (newStatus === 'Paid') {
          msg += ' PDF receipt generated and emailed!';
        }
        showToast(msg, 'success');
        fetchParcels();
      }
    } catch (e) {
      showToast('Failed to toggle payment status', 'error');
    }
  };

  // Filtered parcels
  const filteredParcels = parcels.filter(p => {
    const matchesSearch = 
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      p.senderName.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && p.status === filterStatus;
  });

  // Calculate Metrics
  const totalParcels = parcels.length;
  const inTransitCount = parcels.filter(p => p.status === 'In Transit' || p.status === 'Out for Delivery').length;
  const customsCount = parcels.filter(p => p.status === 'Customs Clearance').length;
  const deliveredCount = parcels.filter(p => p.status === 'Delivered').length;
  const totalRevenue = parcels.reduce((acc, p) => {
    let sum = acc;
    if (p.shippingPaymentStatus === 'Paid') sum += p.shippingFee;
    if (p.customDutyPaymentStatus === 'Paid') sum += p.customDuty;
    return sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-2xl flex items-center gap-2 animate-bounce ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toastMessage.text}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Admin Control Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-mono font-semibold border border-blue-500/30">
              Admin Session Active
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            SwiftDeliver logistics manager & auto-receipt distribution center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchParcels}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create New Parcel
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 text-rose-300 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-blue-400" /> Total Parcels
          </div>
          <p className="text-2xl font-black text-white">{totalParcels}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> In Transit
          </div>
          <p className="text-2xl font-black text-cyan-400">{inTransitCount}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Customs Hold
          </div>
          <p className="text-2xl font-black text-amber-400">{customsCount}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Delivered
          </div>
          <p className="text-2xl font-black text-emerald-400">{deliveredCount}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1 col-span-2 md:col-span-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Paid Rev
          </div>
          <p className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</p>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Tracking #, Recipient, Sender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['ALL', 'In Transit', 'Customs Clearance', 'Delivered', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                filterStatus === st 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Parcels Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3.5 px-4">Tracking #</th>
                <th className="py-3.5 px-4">Status & Location</th>
                <th className="py-3.5 px-4">Sender / Recipient</th>
                <th className="py-3.5 px-4">Shipping Fee</th>
                <th className="py-3.5 px-4">Custom Duty</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No parcels found matching search filter.
                  </td>
                </tr>
              ) : (
                filteredParcels.map((parcel) => (
                  <tr key={parcel.id || parcel.trackingNumber} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Tracking # & Link */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/track/${parcel.trackingNumber}`}
                          className="font-mono font-bold text-blue-400 hover:underline flex items-center gap-1"
                          title="View public tracking page"
                        >
                          {parcel.trackingNumber}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </Link>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Est: {parcel.estimatedDelivery}</span>
                    </td>

                    {/* Status & Location */}
                    <td className="py-4 px-4 space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        parcel.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        parcel.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        parcel.status === 'Customs Clearance' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {parcel.status}
                      </span>
                      <p className="text-slate-400 text-[11px] truncate max-w-xs">{parcel.currentLocation}</p>
                    </td>

                    {/* Sender / Recipient */}
                    <td className="py-4 px-4 space-y-0.5">
                      <p className="text-white font-medium">{parcel.recipientName}</p>
                      <p className="text-slate-500 text-[10px]">From: {parcel.senderName}</p>
                    </td>

                    {/* Shipping Fee */}
                    <td className="py-4 px-4 space-y-1">
                      <span className="text-white font-mono font-bold">${parcel.shippingFee.toFixed(2)}</span>
                      <button
                        onClick={() => handleQuickTogglePayment(parcel, 'shipping')}
                        className={`block text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          parcel.shippingPaymentStatus === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/40'
                        }`}
                        title="Click to toggle paid status"
                      >
                        {parcel.shippingPaymentStatus === 'Paid' ? 'Paid ✔' : 'Mark Paid'}
                      </button>
                    </td>

                    {/* Custom Duty */}
                    <td className="py-4 px-4 space-y-1">
                      <span className="text-white font-mono font-bold">${parcel.customDuty.toFixed(2)}</span>
                      <button
                        onClick={() => handleQuickTogglePayment(parcel, 'duty')}
                        className={`block text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          parcel.customDutyPaymentStatus === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40'
                        }`}
                        title="Click to toggle paid status"
                      >
                        {parcel.customDutyPaymentStatus === 'Paid' ? 'Cleared ✔' : 'Mark Paid'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openTimelineModal(parcel)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-[11px] transition-colors flex items-center gap-1"
                          title="Add timeline checkpoint"
                        >
                          <Plus className="w-3 h-3 text-cyan-400" /> Event
                        </button>

                        <button
                          onClick={() => openEditModal(parcel)}
                          className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded font-semibold text-[11px] transition-colors flex items-center gap-1"
                          title="Edit parcel status & fees"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PARCEL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Register New Parcel (Auto SDxxxxxx)
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParcel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Sender Name *</label>
                  <input
                    type="text" required
                    value={createForm.senderName}
                    onChange={e => setCreateForm({ ...createForm, senderName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Sender Email</label>
                  <input
                    type="email"
                    value={createForm.senderEmail}
                    onChange={e => setCreateForm({ ...createForm, senderEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Sender Full Address</label>
                <input
                  type="text"
                  value={createForm.senderAddress}
                  onChange={e => setCreateForm({ ...createForm, senderAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Recipient Name *</label>
                  <input
                    type="text" required
                    value={createForm.recipientName}
                    onChange={e => setCreateForm({ ...createForm, recipientName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Recipient Email *</label>
                  <input
                    type="email" required
                    value={createForm.recipientEmail}
                    onChange={e => setCreateForm({ ...createForm, recipientEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Recipient Delivery Address</label>
                <input
                  type="text"
                  value={createForm.recipientAddress}
                  onChange={e => setCreateForm({ ...createForm, recipientAddress: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Origin City *</label>
                  <input
                    type="text" required
                    value={createForm.origin}
                    onChange={e => setCreateForm({ ...createForm, origin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Destination City *</label>
                  <input
                    type="text" required
                    value={createForm.destination}
                    onChange={e => setCreateForm({ ...createForm, destination: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Current Location</label>
                  <input
                    type="text"
                    value={createForm.currentLocation}
                    onChange={e => setCreateForm({ ...createForm, currentLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Est. Delivery Date</label>
                  <input
                    type="date"
                    value={createForm.estimatedDelivery}
                    onChange={e => setCreateForm({ ...createForm, estimatedDelivery: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Shipping Fee ($)</label>
                  <input
                    type="number" step="0.01"
                    value={createForm.shippingFee}
                    onChange={e => setCreateForm({ ...createForm, shippingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Custom Duty ($)</label>
                  <input
                    type="number" step="0.01"
                    value={createForm.customDuty}
                    onChange={e => setCreateForm({ ...createForm, customDuty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Package Description</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30"
                >
                  {submitting ? 'Creating...' : 'Create Parcel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PARCEL MODAL */}
      {isEditModalOpen && selectedParcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Parcel Details</h3>
                <p className="text-xs font-mono text-cyan-400">{selectedParcel.trackingNumber}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Current Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value as ParcelStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Customs Clearance">Customs Clearance</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Current Location Tag</label>
                <input
                  type="text" required
                  value={editForm.currentLocation}
                  onChange={e => setEditForm({ ...editForm, currentLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Shipping Fee ($)</label>
                  <input
                    type="number" step="0.01"
                    value={editForm.shippingFee}
                    onChange={e => setEditForm({ ...editForm, shippingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Shipping Payment</label>
                  <select
                    value={editForm.shippingPaymentStatus}
                    onChange={e => setEditForm({ ...editForm, shippingPaymentStatus: e.target.value as PaymentStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid (Auto Email PDF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Custom Duty ($)</label>
                  <input
                    type="number" step="0.01"
                    value={editForm.customDuty}
                    onChange={e => setEditForm({ ...editForm, customDuty: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold uppercase">Custom Duty Payment</label>
                  <select
                    value={editForm.customDutyPaymentStatus}
                    onChange={e => setEditForm({ ...editForm, customDutyPaymentStatus: e.target.value as PaymentStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid (Auto Email PDF)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30"
                >
                  {submitting ? 'Saving...' : 'Save & Trigger Receipts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TIMELINE EVENT MODAL */}
      {isTimelineModalOpen && selectedParcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Add Checkpoint Event</h3>
                <p className="text-xs font-mono text-cyan-400">{selectedParcel.trackingNumber}</p>
              </div>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTimelineEvent} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Event Status</label>
                <select
                  value={timelineForm.status}
                  onChange={e => setTimelineForm({ ...timelineForm, status: e.target.value as ParcelStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Customs Clearance">Customs Clearance</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Checkpoint Location</label>
                <input
                  type="text" required
                  placeholder="e.g. Frankfurt Cargo Depot"
                  value={timelineForm.location}
                  onChange={e => setTimelineForm({ ...timelineForm, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase">Event Description Note</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Package cleared customs inspection and departs on flight SD-401"
                  value={timelineForm.description}
                  onChange={e => setTimelineForm({ ...timelineForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTimelineModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30"
                >
                  {submitting ? 'Adding...' : 'Add Event to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

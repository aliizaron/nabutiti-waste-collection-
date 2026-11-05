/**
 * ResidentView Component
 * Household Collection Requests, GPS Map Picker, Illegal Dumping Reporter, and Complaint Filing
 * Design Variation 3: Deep carbon aesthetic, Cormorant Garamond headings, Space Mono metadata, Phosphor accents
 */

import React, { useState } from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { WasteCategory, WasteRequest } from '../types';
import { LeafletMap } from './LeafletMap';
import { 
  PlusCircle, 
  AlertOctagon, 
  MessageSquareWarning, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle, 
  X,
  XCircle,
  History,
  Search,
  Filter,
  RotateCcw
} from 'lucide-react';
import { CameraMediaPicker } from './CameraMediaPicker';

export const ResidentView: React.FC = () => {
  const { 
    currentUser, 
    currentResident, 
    requests, 
    complaints, 
    submitRequest, 
    cancelRequest,
    reportDumping, 
    lodgeComplaint,
    notificationPermission, 
    requestPermission 
  } = useWasteApp();

  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDumpingModal, setShowDumpingModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<WasteRequest | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<WasteRequest | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Request History Filter State
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Pending' | 'Collected' | 'Cancelled'>('All');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // New Request Form State
  const [wasteType, setWasteType] = useState<WasteCategory>('General');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState(currentResident?.landmark || 'Plot 14, Zone B, Kansanga Market Lane');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reqLat, setReqLat] = useState(0.28482);
  const [reqLng, setReqLng] = useState(32.60714);
  const [reqPhoto, setReqPhoto] = useState<string | null>(null);

  // Illegal Dumping Form State
  const [dumpLocationDesc, setDumpLocationDesc] = useState('');
  const [dumpLat, setDumpLat] = useState(0.2838);
  const [dumpLng, setDumpLng] = useState(32.6087);
  const [dumpPhoto, setDumpPhoto] = useState<string | null>(null);

  // Complaint Form State
  const [complaintText, setComplaintText] = useState('');
  const [selectedReqIdForComplaint, setSelectedReqIdForComplaint] = useState<number | undefined>(undefined);

  // Filter requests for current resident
  const myRequests = requests.filter(r => r.resident_id === currentResident?.id);
  const myComplaints = complaints.filter(c => c.resident_id === currentResident?.id);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !landmark) return;

    submitRequest({
      waste_type: wasteType,
      description,
      address_landmark: landmark,
      scheduled_date: scheduledDate,
      latitude: reqLat,
      longitude: reqLng,
      photo_path: reqPhoto || undefined
    });

    setDescription('');
    setReqPhoto(null);
    setShowRequestModal(false);
  };

  const handleReportDumping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dumpLocationDesc) return;

    reportDumping({
      location_desc: dumpLocationDesc,
      latitude: dumpLat,
      longitude: dumpLng,
      photo_path: dumpPhoto || undefined
    });

    setDumpLocationDesc('');
    setDumpPhoto(null);
    setShowDumpingModal(false);
  };

  const handleLodgeComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) return;

    lodgeComplaint({
      request_id: selectedReqIdForComplaint,
      complaint_text: complaintText
    });

    setComplaintText('');
    setSelectedReqIdForComplaint(undefined);
    setShowComplaintModal(false);
  };

  // Status badges with explicit Pending, Collected, and Cancelled indicators
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-amber-400 uppercase border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 rounded-md font-bold">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>PENDING</span>
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-sky-400 uppercase border border-sky-500/40 bg-sky-500/15 px-2.5 py-1 rounded-md font-bold">
            <Truck className="w-3 h-3 text-sky-400" />
            <span>ASSIGNED</span>
          </span>
        );
      case 'In_Progress':
        return (
          <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-purple-400 uppercase border border-purple-500/40 bg-purple-500/15 px-2.5 py-1 rounded-md font-bold">
            <Truck className="w-3 h-3 text-purple-400" />
            <span>IN PROGRESS</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-emerald-400 uppercase border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 rounded-md font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>COLLECTED</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-rose-400 uppercase border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 rounded-md font-bold">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>CANCELLED</span>
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-red-400 uppercase border border-red-500/40 bg-red-500/15 px-2.5 py-1 rounded-md font-bold">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>OVERDUE</span>
          </span>
        );
      default:
        return (
          <span className="font-mono-tech text-[10px] px-2.5 py-1 text-[var(--ink-secondary)] border border-[var(--border-bright)] uppercase rounded-md">
            {status}
          </span>
        );
    }
  };

  // Counts for Request History status indicators
  const pendingCount = myRequests.filter(r => r.status === 'Pending').length;
  const collectedCount = myRequests.filter(r => r.status === 'Completed').length;
  const cancelledCount = myRequests.filter(r => r.status === 'Cancelled').length;

  // Filtered requests for the Request History section
  const filteredHistory = myRequests.filter(r => {
    if (historyFilter === 'Pending' && r.status !== 'Pending') return false;
    if (historyFilter === 'Collected' && r.status !== 'Completed') return false;
    if (historyFilter === 'Cancelled' && r.status !== 'Cancelled') return false;

    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      const matchRef = `#wr-${String(r.id).padStart(4, '0')}`.includes(q) || String(r.id).includes(q);
      const matchType = r.waste_type.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchLandmark = r.address_landmark.toLowerCase().includes(q);
      const matchDate = r.scheduled_date.includes(q) || r.created_at.includes(q);
      const matchStatus = r.status.toLowerCase().includes(q);
      return matchRef || matchType || matchDesc || matchLandmark || matchDate || matchStatus;
    }
    return true;
  });

  const handleConfirmCancel = () => {
    if (!requestToCancel) return;
    cancelRequest(requestToCancel.id, cancelReason);
    setRequestToCancel(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Resident Welcome Banner */}
      <div className="v3-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-widest">[ RESIDENT PORTAL ]</span>
            <span className="text-[var(--ink-faint)]">&bull;</span>
            <span className="font-mono-tech text-[10px] text-[var(--ink-secondary)] uppercase">{currentResident?.zone_name}</span>
          </div>
          <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-[var(--ink)] mt-1">
            Welcome, {currentUser?.name}
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 flex items-center gap-3 font-mono-tech">
            <span>PLOT: <strong className="text-[var(--ink)]">{currentResident?.household_no}</strong></span>
            <span>&bull;</span>
            <span className="truncate max-w-sm"><MapPin className="w-3 h-3 inline text-[#5ef38c] mr-1" />{currentResident?.landmark}</span>
          </p>
        </div>

        {/* Action Buttons in Variation 3 styling */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-v3 btn-v3-primary"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Collection</span>
          </button>
          <button
            onClick={() => setShowDumpingModal(true)}
            className="btn-v3 text-red-400 border-red-500/40 hover:bg-red-950/40 hover:text-red-200"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Report Dump</span>
          </button>
          <button
            onClick={() => setShowComplaintModal(true)}
            className="btn-v3 text-[var(--ink-secondary)] border-[var(--border-bright)]"
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>Complaint</span>
          </button>
        </div>
      </div>

      {/* Web Notifications Status Alert Banner */}
      {notificationPermission !== 'granted' ? (
        <div className="p-4 bg-[var(--surface)] border border-[#5ef38c]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#5ef38c] animate-ping" />
            <div>
              <strong className="font-mono-tech text-[11px] text-[#5ef38c] uppercase">[ REAL-TIME PICKUP ALERTS ]</strong>
              <span className="text-[var(--ink-secondary)] ml-2 text-xs">
                Receive browser alerts when a hauler vehicle is dispatched or arrives at your compound.
              </span>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="btn-v3 btn-v3-primary text-xs py-1.5 px-3"
          >
            Enable Web Notifications
          </button>
        </div>
      ) : (
        <div className="p-3 bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-xs font-mono-tech text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5ef38c]" />
            <span>WEB NOTIFICATIONS ACTIVE: REAL-TIME SERVICE DISPATCH ALERTS ARMED</span>
          </div>
          <span className="text-[9px] text-[#5ef38c] uppercase tracking-wider">PUSH ENGAGED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Request History & Logistics Tracker */}
        <div className="lg:col-span-8 space-y-6">
          <div className="v3-card p-6">
            
            {/* Request History Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[var(--border)] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                    [ LOGISTICS ARCHIVE &amp; AUDIT TRAIL ]
                  </span>
                  <span className="text-[var(--ink-faint)]">&bull;</span>
                  <span className="font-mono-tech text-[10px] text-[var(--ink-muted)] uppercase">
                    HOUSEHOLD NO: {currentResident?.household_no}
                  </span>
                </div>
                <h3 className="font-syne font-bold text-2xl uppercase text-[var(--ink)] flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-400" />
                  <span>Request History</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold">
                  {myRequests.length} TOTAL LOGGED
                </span>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn-v3 btn-v3-primary text-xs py-1.5 px-3"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Request</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 font-mono-tech">
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl">
                <span className="text-[10px] text-[var(--ink-muted)] uppercase block">All Requests</span>
                <span className="font-syne font-bold text-xl text-[var(--ink)] block mt-0.5">{myRequests.length}</span>
                <span className="text-[9px] text-[var(--ink-muted)]">Recorded in database</span>
              </div>

              <div className="p-3 bg-[var(--surface-muted)] border border-amber-500/30 rounded-xl">
                <span className="text-[10px] text-amber-400 uppercase block flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3" />
                  <span>Pending</span>
                </span>
                <span className="font-syne font-bold text-xl text-amber-400 block mt-0.5">{pendingCount}</span>
                <span className="text-[9px] text-[var(--ink-muted)]">Awaiting hauler pickup</span>
              </div>

              <div className="p-3 bg-[var(--surface-muted)] border border-emerald-500/30 rounded-xl">
                <span className="text-[10px] text-emerald-400 uppercase block flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Collected</span>
                </span>
                <span className="font-syne font-bold text-xl text-emerald-400 block mt-0.5">{collectedCount}</span>
                <span className="text-[9px] text-[var(--ink-muted)]">Verified proof-of-work</span>
              </div>

              <div className="p-3 bg-[var(--surface-muted)] border border-rose-500/30 rounded-xl">
                <span className="text-[10px] text-rose-400 uppercase block flex items-center gap-1 font-bold">
                  <XCircle className="w-3 h-3" />
                  <span>Cancelled</span>
                </span>
                <span className="font-syne font-bold text-xl text-rose-400 block mt-0.5">{cancelledCount}</span>
                <span className="text-[9px] text-[var(--ink-muted)]">Retracted by resident</span>
              </div>
            </div>

            {/* Filter Tabs & Search Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border)]">
              {/* Status Filter Tabs (All, Pending, Collected, Cancelled) */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono-tech text-xs">
                <button
                  onClick={() => setHistoryFilter('All')}
                  className={`px-3 py-1.5 rounded-lg border uppercase transition cursor-pointer font-bold ${
                    historyFilter === 'All'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-[var(--surface-muted)] text-[var(--ink-secondary)] border-[var(--border)] hover:border-emerald-500'
                  }`}
                >
                  All ({myRequests.length})
                </button>

                <button
                  onClick={() => setHistoryFilter('Pending')}
                  className={`px-3 py-1.5 rounded-lg border uppercase transition cursor-pointer flex items-center gap-1 font-bold ${
                    historyFilter === 'Pending'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-[var(--surface-muted)] text-amber-400 border-amber-500/30 hover:border-amber-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Pending ({pendingCount})</span>
                </button>

                <button
                  onClick={() => setHistoryFilter('Collected')}
                  className={`px-3 py-1.5 rounded-lg border uppercase transition cursor-pointer flex items-center gap-1 font-bold ${
                    historyFilter === 'Collected'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-[var(--surface-muted)] text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Collected ({collectedCount})</span>
                </button>

                <button
                  onClick={() => setHistoryFilter('Cancelled')}
                  className={`px-3 py-1.5 rounded-lg border uppercase transition cursor-pointer flex items-center gap-1 font-bold ${
                    historyFilter === 'Cancelled'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-[var(--surface-muted)] text-rose-400 border-rose-500/30 hover:border-rose-400'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  <span>Cancelled ({cancelledCount})</span>
                </button>
              </div>

              {/* History Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter by ref, waste type, date..."
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] rounded-lg pl-8 pr-7 py-1.5 focus:border-emerald-500 outline-none font-mono-tech placeholder:text-[var(--ink-muted)]"
                />
                {historySearchQuery && (
                  <button 
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Request History Table */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-[var(--ink-muted)] font-mono-tech space-y-3">
                <Truck className="w-10 h-10 mx-auto text-[var(--ink-faint)]" />
                <p className="text-xs uppercase tracking-wide">
                  NO COLLECTION REQUESTS MATCH THE FILTER &quot;{historyFilter}&quot;
                  {historySearchQuery ? ` WITH SEARCH QUERY &quot;${historySearchQuery}&quot;` : ''}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  {(historyFilter !== 'All' || historySearchQuery) && (
                    <button
                      onClick={() => {
                        setHistoryFilter('All');
                        setHistorySearchQuery('');
                      }}
                      className="btn-v3 text-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="btn-v3 btn-v3-primary text-xs"
                  >
                    Log New Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--ink-muted)] font-mono-tech uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Waste Category</th>
                      <th className="py-2.5 px-3">Pickup Landmark</th>
                      <th className="py-2.5 px-3">Assigned Truck</th>
                      <th className="py-2.5 px-3">Status Indicator</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredHistory.map((req) => (
                      <tr key={req.id} className="hover:bg-[var(--surface-muted)]/60 transition group">
                        <td className="py-3 px-3 font-mono-tech">
                          <div className="font-bold text-[var(--ink)]">#WR-{String(req.id).padStart(4, '0')}</div>
                          <div className="text-[10px] text-[var(--ink-muted)]">Sched: {req.scheduled_date}</div>
                          <div className="text-[9px] text-[var(--ink-muted)] opacity-75">Log: {req.created_at.slice(0, 10)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[var(--ink)] inline-block">{req.waste_type}</span>
                          <div className="text-[11px] text-[var(--ink-muted)] truncate max-w-[140px]">{req.description}</div>
                        </td>
                        <td className="py-3 px-3 text-[var(--ink-secondary)]">
                          <div className="flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin className="w-3 h-3 text-[#5ef38c] shrink-0" />
                            <span>{req.address_landmark}</span>
                          </div>
                          <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">
                            {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {req.collector_name ? (
                            <div>
                              <div className="font-medium text-[var(--ink)]">{req.collector_name}</div>
                              <div className="font-mono-tech text-[10px] text-[#38bdf8]">{req.vehicle_reg_no}</div>
                            </div>
                          ) : (
                            <span className="font-mono-tech text-[11px] text-[var(--ink-muted)] italic">
                              {req.status === 'Cancelled' ? 'N/A (CANCELLED)' : 'PENDING DISPATCH'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedRequestForDetail(req)}
                              className="font-mono-tech text-[10px] uppercase text-emerald-400 hover:underline cursor-pointer bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded"
                              title="View full tracking timeline and notes"
                            >
                              [ VIEW ]
                            </button>

                            {(req.status === 'Pending' || req.status === 'Assigned') && (
                              <button
                                onClick={() => setRequestToCancel(req)}
                                className="font-mono-tech text-[10px] uppercase text-rose-400 hover:underline cursor-pointer bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded"
                                title="Cancel this pending waste collection request"
                              >
                                [ CANCEL ]
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Complaints and Local Contacts Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Complaints Log */}
          <div className="v3-card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
              <div>
                <span className="font-mono-tech text-[10px] text-[#fbbf24] uppercase tracking-wider block">[ CIVIC LOG ]</span>
                <h4 className="font-display italic text-xl font-semibold text-[var(--ink)]">Complaints & Feedback</h4>
              </div>
              <span className="font-mono-tech text-[10px] text-[var(--ink-muted)]">{myComplaints.length} FILED</span>
            </div>

            {myComplaints.length === 0 ? (
              <p className="text-xs font-mono-tech text-[var(--ink-muted)] py-3">NO COMPLAINTS FILED. ALL SERVICES OPERATIONAL.</p>
            ) : (
              <div className="space-y-3">
                {myComplaints.map(cmp => (
                  <div key={cmp.id} className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] text-xs space-y-2">
                    <div className="flex items-center justify-between font-mono-tech">
                      <span className="font-bold text-[var(--ink)]">#CMP-{cmp.id}</span>
                      <span className={`text-[10px] uppercase ${
                        cmp.status === 'Resolved' ? 'text-[#5ef38c]' : 'text-[#fbbf24]'
                      }`}>
                        [{cmp.status}]
                      </span>
                    </div>
                    <p className="text-[var(--ink-secondary)]">{cmp.complaint_text}</p>
                    {cmp.admin_response && (
                      <div className="p-2.5 bg-[var(--surface)] border border-[#5ef38c]/30 text-[11px]">
                        <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase block mb-0.5">Sanitation Desk Response:</span>
                        <span className="text-[var(--ink)]">{cmp.admin_response}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nabutiti Village Information Box */}
          <div className="v3-card p-6 space-y-3">
            <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-widest block">[ MUNICIPAL DESK ]</span>
            <h4 className="font-display italic text-xl font-semibold text-[var(--ink)]">Nabutiti Environmental Desk</h4>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans-body">
              Household collections occur thrice weekly. To avoid fines under Makindye Division sanitation bylaws, do not dump waste along drainage channels.
            </p>
            <div className="pt-3 border-t border-[var(--border)] font-mono-tech text-xs space-y-1 text-[var(--ink-muted)]">
              <div><strong className="text-[var(--ink)]">LC1 Office:</strong> +256 782 345 678</div>
              <div><strong className="text-[var(--ink)]">Sanitation Officer:</strong> +256 772 100 200</div>
            </div>
          </div>

        </div>

      </div>

      {/* 1. Request Waste Collection Modal (With Leaflet Coordinates Picker) */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ DISPATCH ORDER ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">Request Waste Collection</h3>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#5ef38c] mb-1">Waste Category</label>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value as WasteCategory)}
                    className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#5ef38c] outline-none"
                  >
                    <option value="Organic">Organic (Food scraps, vegetable peels)</option>
                    <option value="Recyclable">Recyclable (Bottles, cans, plastics)</option>
                    <option value="Hazardous">Hazardous (Chemicals, oils, batteries)</option>
                    <option value="General">General (Mixed household waste)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase text-[#5ef38c] mb-1">Scheduled Pickup Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#5ef38c] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#5ef38c] mb-1">Waste Description & Volume</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 2 large sacks of banana leaves and vegetable waste from weekend market"
                  rows={2}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#5ef38c] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#5ef38c] mb-1">Pickup Landmark / Address</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Plot 14, Zone B, Kansanga Market Lane"
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#5ef38c] outline-none"
                  required
                />
              </div>

              {/* Leaflet GPS Coordinates Pin Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono-tech text-xs">
                  <label className="text-[var(--ink-secondary)] uppercase text-[11px]">
                    PIN PICKUP COORDINATES ON MAP
                  </label>
                  <span className="text-[#5ef38c] text-[10px]">
                    {reqLat.toFixed(5)}, {reqLng.toFixed(5)}
                  </span>
                </div>
                <LeafletMap
                  mode="picker"
                  initialLat={reqLat}
                  initialLng={reqLng}
                  height="220px"
                  onLocationSelect={(lat, lng) => {
                    setReqLat(lat);
                    setReqLng(lng);
                  }}
                />
              </div>

              {/* Dual-Mode Media Picker: Live Camera Snapshot OR Device Storage */}
              <CameraMediaPicker
                label="Waste Photo (Live Camera Snapshot or Device Gallery)"
                onImageSelected={setReqPhoto}
              />

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-v3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-v3 btn-v3-primary text-xs"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Report Illegal Dumping Modal */}
      {showDumpingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-red-500/40 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-red-400 uppercase tracking-wider block">[ INCIDENT SURVEILLANCE ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">Report Illegal Dumping</h3>
              </div>
              <button onClick={() => setShowDumpingModal(false)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportDumping} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-red-400 mb-1">
                  Incident Description & Visual Severity
                </label>
                <textarea
                  value={dumpLocationDesc}
                  onChange={(e) => setDumpLocationDesc(e.target.value)}
                  placeholder="e.g. Continuous dumping of plastic bottles and mattress foam near the footbridge clogging storm runoff channel"
                  rows={3}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-red-400 outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono-tech text-xs">
                  <label className="text-[var(--ink-secondary)] uppercase text-[11px]">
                    PIN HOTSPOT LOCATION ON MAP
                  </label>
                  <span className="text-red-400 text-[10px]">
                    {dumpLat.toFixed(5)}, {dumpLng.toFixed(5)}
                  </span>
                </div>
                <LeafletMap
                  mode="picker"
                  initialLat={dumpLat}
                  initialLng={dumpLng}
                  height="220px"
                  onLocationSelect={(lat, lng) => {
                    setDumpLat(lat);
                    setDumpLng(lng);
                  }}
                />
              </div>

              {/* Dual-Mode Media Picker: Live Camera Snapshot OR Device Storage */}
              <CameraMediaPicker
                label="Incident Photo Evidence (Live Camera Snapshot or Device Gallery)"
                onImageSelected={setDumpPhoto}
              />

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowDumpingModal(false)}
                  className="btn-v3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-v3 text-xs text-red-400 border-red-500/50 hover:bg-red-500 hover:text-[#111113]"
                >
                  Submit Incident Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Lodge Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-[#fbbf24] uppercase tracking-wider block">[ CIVIC SERVICE ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">File Service Complaint</h3>
              </div>
              <button onClick={() => setShowComplaintModal(false)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLodgeComplaint} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#fbbf24] mb-1">Related Waste Order</label>
                <select
                  value={selectedReqIdForComplaint || ''}
                  onChange={(e) => setSelectedReqIdForComplaint(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#fbbf24] outline-none"
                >
                  <option value="">General Community Issue</option>
                  {myRequests.map(r => (
                    <option key={r.id} value={r.id}>
                      #WR-{String(r.id).padStart(4, '0')} ({r.waste_type} - {r.scheduled_date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#fbbf24] mb-1">Details of Issue or Delay</label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g. The collection truck passed through Zone B yesterday afternoon but skipped our compound lane."
                  rows={4}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#fbbf24] outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="btn-v3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-v3 btn-v3-primary text-xs"
                >
                  Submit to Sanitation Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Request Details & Status Timeline Modal */}
      {selectedRequestForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ TRACKING LOG ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
                  Order #WR-{String(selectedRequestForDetail.id).padStart(4, '0')}
                </h3>
              </div>
              <button onClick={() => setSelectedRequestForDetail(null)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <span className="font-mono-tech text-xs text-[#5ef38c] uppercase">{selectedRequestForDetail.waste_type} Waste</span>
                  <div className="text-xs text-[var(--ink-secondary)] mt-0.5">{selectedRequestForDetail.description}</div>
                </div>
                {getStatusBadge(selectedRequestForDetail.status)}
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 py-2 font-mono-tech">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 border border-[#5ef38c] bg-[#5ef38c] text-[#111113] flex items-center justify-center text-xs shrink-0 font-bold">1</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">ORDER SUBMITTED</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">{selectedRequestForDetail.created_at}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 border flex items-center justify-center text-xs shrink-0 font-bold ${
                    selectedRequestForDetail.collector_id ? 'border-[#38bdf8] bg-[#38bdf8] text-[#111113]' : 'border-[var(--border-bright)] text-[var(--ink-muted)]'
                  }`}>2</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">ASSIGNED TO TRUCK HAULER</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">
                      {selectedRequestForDetail.collector_name ? `${selectedRequestForDetail.collector_name} (${selectedRequestForDetail.vehicle_reg_no})` : 'Awaiting assignment'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 border flex items-center justify-center text-xs shrink-0 font-bold ${
                    selectedRequestForDetail.status === 'Completed' ? 'border-[#5ef38c] bg-[#5ef38c] text-[#111113]' : 'border-[var(--border-bright)] text-[var(--ink-muted)]'
                  }`}>3</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">PICKUP COMPLETED & VERIFIED</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">
                      {selectedRequestForDetail.completion_time ? `${selectedRequestForDetail.completion_time}` : 'Pending completion'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequestForDetail.collector_notes && (
                <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] text-xs">
                  <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase block mb-1">Collector Notes:</span>
                  <p className="text-[var(--ink-secondary)]">{selectedRequestForDetail.collector_notes}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRequestForDetail(null)}
                  className="btn-v3 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Cancel Request Confirmation Modal */}
      {requestToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-rose-500/40 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono-tech text-[10px] text-rose-400 uppercase tracking-widest font-bold block">
                    [ CONFIRM CANCELLATION ]
                  </span>
                  <h3 className="font-syne font-bold text-lg text-[var(--ink)] leading-tight">
                    Cancel Order #WR-{String(requestToCancel.id).padStart(4, '0')}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setRequestToCancel(null)}
                className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-mono-tech">
                  <span className="text-[var(--ink-muted)]">Category:</span>
                  <span className="font-bold text-[var(--ink)]">{requestToCancel.waste_type}</span>
                </div>
                <div className="flex justify-between font-mono-tech">
                  <span className="text-[var(--ink-muted)]">Scheduled Date:</span>
                  <span className="text-[var(--ink)]">{requestToCancel.scheduled_date}</span>
                </div>
                <div className="flex justify-between font-mono-tech">
                  <span className="text-[var(--ink-muted)]">Landmark:</span>
                  <span className="text-[var(--ink)] truncate max-w-[200px]">{requestToCancel.address_landmark}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[var(--ink-muted)] mb-1.5 font-bold">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Disposed of at Kansanga Market skip, composting material at home, or rescheduling..."
                  rows={3}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] rounded-xl p-3 focus:border-rose-500 outline-none font-mono-tech placeholder:text-[var(--ink-muted)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestToCancel(null)}
                  className="btn-v3 text-xs"
                >
                  Keep Request
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono-tech uppercase font-bold tracking-wider transition cursor-pointer shadow-md shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

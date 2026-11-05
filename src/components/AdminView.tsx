/**
 * AdminView Component
 * Dispatch Engine, Collector Fleet Management, Overdue Flagger, and Complaints Resolution
 * Design Variation 3: Deep carbon aesthetic, Cormorant Garamond headings, Space Mono metadata, Phosphor accents
 */

import React, { useState } from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { Complaint, WasteRequest } from '../types';
import { 
  ShieldCheck, 
  Cpu, 
  Truck, 
  CheckCircle2, 
  MessageSquare, 
  Eye, 
  X, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    currentUser, 
    requests, 
    collectors, 
    complaints, 
    assignRequest, 
    resolveComplaint, 
    toggleCollectorAvailability 
  } = useWasteApp();

  const [selectedCollectorByRequest, setSelectedCollectorByRequest] = useState<Record<number, number>>({});
  const [complaintToResolve, setComplaintToResolve] = useState<Complaint | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<'Resolved' | 'Under_Review'>('Resolved');
  const [proofDetailModal, setProofDetailModal] = useState<WasteRequest | null>(null);

  // Filter queues
  const pendingQueue = requests.filter(r => r.status === 'Pending' || r.status === 'Overdue');
  const completedQueue = requests.filter(r => r.status === 'Completed');
  const openComplaints = complaints.filter(c => c.status !== 'Resolved');

  const handleDispatch = (requestId: number) => {
    const collectorId = selectedCollectorByRequest[requestId] || collectors.find(c => c.is_available)?.id;
    if (collectorId) {
      assignRequest(requestId, collectorId);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintToResolve || !adminReplyText) return;

    resolveComplaint(complaintToResolve.id, resolutionStatus, adminReplyText);
    setComplaintToResolve(null);
    setAdminReplyText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Operations Banner */}
      <div className="v3-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-[10px] text-[#fbbf24] uppercase tracking-widest">[ DISPATCH & OPERATIONS DESK ]</span>
            <span className="text-[var(--ink-faint)]">&bull;</span>
            <span className="font-mono-tech text-[10px] text-[var(--ink-secondary)] uppercase">MAKINDYE DIVISION AUTHORITY</span>
          </div>
          <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-[var(--ink)] mt-1">
            {currentUser?.name} &bull; Sanitation Officer
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 font-mono-tech">
            SUPERVISING COLLECTION LOGISTICS AND DUMPING MITIGATION FOR NABUTITI VILLAGE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
          <div className="px-3 py-2 bg-[var(--surface-muted)] border border-[#fbbf24]/40 text-[#fbbf24]">
            {pendingQueue.length} ORDERS REQUIRING DISPATCH
          </div>
          <div className="px-3 py-2 bg-[var(--surface-muted)] border border-red-500/40 text-red-400">
            {openComplaints.length} UNRESOLVED COMPLAINTS
          </div>
        </div>
      </div>

      {/* Main Grid: Dispatch Engine & Fleet Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dispatch Engine Queue (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="v3-card p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
              <div>
                <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ DISPATCH LOGISTICS POOL ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#5ef38c]" />
                  <span>Dispatch Engine & Routing Pool</span>
                </h3>
              </div>
              <span className="font-mono-tech text-xs text-[#5ef38c] border border-[#5ef38c]/30 px-2.5 py-1">
                {pendingQueue.length} IN QUEUE
              </span>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="text-center py-10 text-[var(--ink-muted)] font-mono-tech">
                <CheckCircle2 className="w-10 h-10 mx-auto text-[#5ef38c] mb-3" />
                <p className="text-xs uppercase tracking-wide">ALL COLLECTION REQUESTS HAVE BEEN DISPATCHED</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--ink-muted)] font-mono-tech uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Order</th>
                      <th className="py-2.5 px-3">Resident & Zone</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Pickup Landmark</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Assign Truck</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {pendingQueue.map((req) => (
                      <tr key={req.id} className="hover:bg-[var(--surface-muted)]/60 transition">
                        <td className="py-3 px-3 font-mono-tech">
                          <div className="font-bold text-[var(--ink)]">#WR-{String(req.id).padStart(4, '0')}</div>
                          <div className="text-[10px] text-[var(--ink-muted)]">{req.scheduled_date}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[var(--ink)]">{req.resident_name}</div>
                          <div className="text-[11px] text-[var(--ink-muted)]">Plot {req.household_no} &bull; {req.zone_name}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[var(--ink)]">{req.waste_type}</span>
                          <div className="text-[11px] text-[var(--ink-muted)] truncate max-w-[130px]">{req.description}</div>
                        </td>
                        <td className="py-3 px-3 text-[var(--ink-secondary)] truncate max-w-[140px]">
                          {req.address_landmark}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-mono-tech text-[10px] px-2 py-0.5 uppercase border ${
                            req.status === 'Overdue' 
                              ? 'border-red-500/40 text-red-400 bg-red-950/20' 
                              : 'border-[#fbbf24]/40 text-[#fbbf24] bg-[#fbbf24]/10'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2 font-mono-tech">
                            <select
                              value={selectedCollectorByRequest[req.id] || collectors.find(c => c.is_available)?.id || ''}
                              onChange={(e) => setSelectedCollectorByRequest({
                                ...selectedCollectorByRequest,
                                [req.id]: Number(e.target.value)
                              })}
                              className="text-[10px] p-1.5 bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border-bright)] max-w-[140px] outline-none"
                            >
                              {collectors.map(c => (
                                <option key={c.id} value={c.id} disabled={!c.is_available}>
                                  {c.vehicle_reg_no} ({c.assigned_zone})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDispatch(req.id)}
                              className="btn-v3 btn-v3-primary text-xs py-1 px-2.5"
                            >
                              Dispatch
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Master Collection Oversight with Proof Photo Verification */}
          <div className="v3-card p-6">
            <div className="border-b border-[var(--border)] pb-3 mb-4">
              <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ AUDIT & VERIFICATION ]</span>
              <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
                Collection Proof & Verification Desk
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--ink-muted)] font-mono-tech uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-3">Ref</th>
                    <th className="py-2 px-3">Resident / Sub-Zone</th>
                    <th className="py-2 px-3">Collector / Vehicle</th>
                    <th className="py-2 px-3">Completion Time</th>
                    <th className="py-2 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {completedQueue.map(c => (
                    <tr key={c.id} className="hover:bg-[var(--surface-muted)]/60">
                      <td className="py-2.5 px-3 font-mono-tech font-bold text-[var(--ink)]">#WR-{String(c.id).padStart(4, '0')}</td>
                      <td className="py-2.5 px-3">
                        <div className="text-[var(--ink)]">{c.resident_name}</div>
                        <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">{c.zone_name}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-[var(--ink)]">{c.collector_name}</div>
                        <div className="font-mono-tech text-[10px] text-[#38bdf8]">{c.vehicle_reg_no}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono-tech text-[10px] text-[var(--ink-muted)]">{c.completion_time || 'Verified'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setProofDetailModal(c)}
                          className="font-mono-tech text-[10px] text-[#5ef38c] hover:underline uppercase inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>[ VIEW PROOF ]</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Collector Fleet & Resident Complaints (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Collector Fleet */}
          <div className="v3-card p-6">
            <span className="font-mono-tech text-[10px] text-[#38bdf8] uppercase tracking-widest block mb-1">[ FLEET MANAGEMENT ]</span>
            <h4 className="font-display italic text-2xl font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#38bdf8]" />
              <span>Waste Hauler Fleet</span>
            </h4>
            <div className="space-y-3 font-mono-tech">
              {collectors.map(c => (
                <div key={c.id} className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[var(--ink)] text-xs">{c.vehicle_reg_no}</div>
                    <div className="text-[11px] text-[var(--ink-secondary)]">ZONE: <strong className="text-[#38bdf8]">{c.assigned_zone}</strong></div>
                    <div className="text-[10px] text-[var(--ink-muted)] mt-1">
                      STATUS: <span className={c.is_available ? 'text-[#5ef38c] font-bold' : 'text-[var(--ink-muted)]'}>
                        {c.is_available ? 'ACTIVE SERVICE' : 'OFF DUTY'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCollectorAvailability(c.id)}
                    className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink)] cursor-pointer"
                    title="Toggle Duty"
                  >
                    {c.is_available ? (
                      <ToggleRight className="w-7 h-7 text-[#5ef38c]" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-[var(--ink-faint)]" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Open Complaints Resolution Desk */}
          <div className="v3-card p-6">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-3">
              <div>
                <span className="font-mono-tech text-[10px] text-red-400 uppercase tracking-wider block">[ RESOLUTION DESK ]</span>
                <h4 className="font-display italic text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-400" />
                  <span>Complaints Desk</span>
                </h4>
              </div>
              <span className="font-mono-tech text-[10px] text-red-400 border border-red-500/40 px-2 py-0.5">
                {openComplaints.length} OPEN
              </span>
            </div>

            {openComplaints.length === 0 ? (
              <p className="text-xs font-mono-tech text-[var(--ink-muted)] py-4">NO OPEN COMPLAINTS REQUIRING RESOLUTION.</p>
            ) : (
              <div className="space-y-3">
                {openComplaints.map(cmp => (
                  <div key={cmp.id} className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] text-xs space-y-2">
                    <div className="flex items-center justify-between font-mono-tech">
                      <span className="font-semibold text-[var(--ink)]">FROM: {cmp.resident_name}</span>
                      <span className="text-[10px] text-[#fbbf24] uppercase">
                        [{cmp.status}]
                      </span>
                    </div>
                    <p className="text-[var(--ink-secondary)]">{cmp.complaint_text}</p>
                    <button
                      onClick={() => setComplaintToResolve(cmp)}
                      className="btn-v3 w-full text-xs py-1.5"
                    >
                      Resolve & Send Reply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Complaint Resolution Modal */}
      {complaintToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-[#fbbf24] uppercase tracking-wider block">[ CIVIC ACTION ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
                  Resolve Complaint #CMP-{complaintToResolve.id}
                </h3>
              </div>
              <button onClick={() => setComplaintToResolve(null)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] text-xs space-y-1">
                <div className="font-bold text-[var(--ink)]">Resident: {complaintToResolve.resident_name}</div>
                <div className="text-[var(--ink-secondary)] italic">"{complaintToResolve.complaint_text}"</div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#fbbf24] mb-1">Status Update</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as 'Resolved' | 'Under_Review')}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2 focus:border-[#fbbf24] outline-none font-mono-tech"
                >
                  <option value="Resolved">Resolved (Corrective action implemented)</option>
                  <option value="Under_Review">Under Review (Forwarded to field supervisor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#fbbf24] mb-1">Official Written Response</label>
                <textarea
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="e.g. Field hauler UBE 418K has been re-routed to your lane this afternoon. Apologies for the delay."
                  rows={3}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#fbbf24] outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setComplaintToResolve(null)}
                  className="btn-v3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-v3 btn-v3-primary text-xs"
                >
                  Submit Official Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof Photo Inspection Modal */}
      {proofDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ AUDIT LOG ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
                  Proof Photo #WR-{String(proofDetailModal.id).padStart(4, '0')}
                </h3>
              </div>
              <button onClick={() => setProofDetailModal(null)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <img
                src={proofDetailModal.proof_photo || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'}
                alt="Proof"
                className="w-full h-48 object-cover border border-[var(--border)]"
              />
              <div className="font-mono-tech text-xs space-y-1 text-[var(--ink-secondary)]">
                <div><strong className="text-[var(--ink)]">Collector:</strong> {proofDetailModal.collector_name} ({proofDetailModal.vehicle_reg_no})</div>
                <div><strong className="text-[var(--ink)]">Completed:</strong> {proofDetailModal.completion_time || 'Recorded'}</div>
                <div><strong className="text-[var(--ink)]">Notes:</strong> {proofDetailModal.collector_notes || 'Cleaned and hauled to Kansanga depot.'}</div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setProofDetailModal(null)}
                  className="btn-v3 btn-v3-primary text-xs"
                >
                  Confirm Verified
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

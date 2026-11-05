/**
 * CollectorView Component
 * Daily Route Schedules, Leaflet Waypoints Map, Status Updates, Proof-of-Collection Upload,
 * and Offline IndexedDB Queue with Background Synchronization.
 * Design Variation 3: Deep carbon aesthetic, Cormorant Garamond headings, Space Mono metadata, Phosphor accents
 */

import React, { useState } from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { WasteRequest, RequestStatus } from '../types';
import { LeafletMap } from './LeafletMap';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  X, 
  Navigation, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database 
} from 'lucide-react';
import { CameraMediaPicker } from './CameraMediaPicker';

export const CollectorView: React.FC = () => {
  const { 
    currentUser, 
    currentCollector, 
    requests, 
    updateTaskStatus,
    effectiveOnline,
    toggleSimulateOffline,
    pendingOfflineUpdates,
    syncOfflineTasks,
    isSyncing
  } = useWasteApp();

  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<WasteRequest | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>('Completed');
  const [collectorNotes, setCollectorNotes] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);

  // Filter tasks assigned to this collector (Collector #1 / John Ssemwogerere by default)
  const myTasks = requests.filter(r => r.collector_id === currentCollector?.id || (!r.collector_id && currentCollector?.id === 1));

  const activeWaypoints = myTasks
    .filter(t => t.status !== 'Completed' && t.status !== 'Cancelled')
    .map(t => ({
      id: t.id,
      lat: t.latitude,
      lng: t.longitude,
      title: `${t.waste_type} (#WR-${String(t.id).padStart(4, '0')})`,
      subtitle: `${t.address_landmark} (${t.resident_name})`,
      status: t.status,
      type: 'collector' as const
    }));

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToUpdate) return;

    await updateTaskStatus(selectedTaskToUpdate.id, newStatus, collectorNotes, proofPhoto || undefined);
    setSelectedTaskToUpdate(null);
    setCollectorNotes('');
    setProofPhoto(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Collector Header with Connectivity Status */}
      <div className="v3-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-[10px] text-[#38bdf8] uppercase tracking-widest">[ HAULER DISPATCH ]</span>
            <span className="text-[var(--ink-faint)]">&bull;</span>
            <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase">ACTIVE FIELD DUTY</span>
          </div>
          <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-[var(--ink)] mt-1">
            {currentUser?.name}
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 flex items-center gap-3 font-mono-tech">
            <span>VEHICLE: <strong className="text-[var(--ink)]">{currentCollector?.vehicle_reg_no}</strong></span>
            <span>&bull;</span>
            <span>ASSIGNED SUB-ZONE: <strong className="text-[#38bdf8]">{currentCollector?.assigned_zone}</strong></span>
          </p>
        </div>

        {/* Connectivity & Offline Controls */}
        <div className="flex flex-wrap items-center gap-3 font-mono-tech">
          {/* Signal Indicator & Simulator */}
          <button
            onClick={() => toggleSimulateOffline()}
            className={`flex items-center gap-2 px-3 py-2 text-xs uppercase border transition cursor-pointer ${
              effectiveOnline
                ? 'bg-[var(--surface-muted)] text-[#5ef38c] border-[#5ef38c]/40 hover:border-[#5ef38c]'
                : 'bg-red-950/40 text-red-300 border-red-500/50 animate-pulse'
            }`}
            title="Toggle between online and simulated signal deadzone (e.g. Nabutiti Valley basin)"
          >
            {effectiveOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#5ef38c]" />
                <span>ONLINE (CELLULAR 4G)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span>OFFLINE (VALLEY DEADZONE)</span>
              </>
            )}
            <span className="text-[9px] text-[var(--ink-muted)] ml-1">[SWITCH]</span>
          </button>

          {/* Pending Sync Button */}
          {pendingOfflineUpdates.length > 0 && (
            <button
              onClick={() => syncOfflineTasks()}
              disabled={isSyncing || !effectiveOnline}
              className="btn-v3 btn-v3-primary text-xs py-2 px-3"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>SYNC {pendingOfflineUpdates.length} TASK(S)</span>
            </button>
          )}

          <div className="px-3 py-2 bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--ink)] text-xs flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{activeWaypoints.length} PICKUPS REMAINING</span>
          </div>
        </div>
      </div>

      {/* Offline Mode Alert Banner (if disconnected) */}
      {!effectiveOnline && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-200 font-mono-tech">
          <div className="flex items-center gap-3">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <strong className="text-[#fbbf24] uppercase">[ OFFLINE FIELD MODE &bull; SERVICE WORKER & INDEXEDDB ]</strong>
              <span className="text-[var(--ink-secondary)] ml-2 text-xs font-sans-body">
                You can record collection proofs and completion statuses without an internet connection. Changes queue locally in IndexedDB and synchronize upon reconnection.
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleSimulateOffline(false)}
            className="btn-v3 text-xs py-1 px-3 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-[#111113]"
          >
            Reconnect Now
          </button>
        </div>
      )}

      {/* IndexedDB Offline Queue Details (if updates are pending) */}
      {pendingOfflineUpdates.length > 0 && (
        <div className="p-4 bg-purple-950/30 border border-purple-500/40 flex items-center justify-between text-xs text-purple-200 font-mono-tech">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <strong className="text-[#c084fc] uppercase">[{pendingOfflineUpdates.length} OFFLINE UPDATE(S) IN INDEXEDDB]:</strong>
              <span className="text-[var(--ink-secondary)] ml-2 font-sans-body">
                Queued locally on device. Will flush to central Nabutiti MySQL DB.
              </span>
            </div>
          </div>
          {effectiveOnline && (
            <button
              onClick={() => syncOfflineTasks()}
              disabled={isSyncing}
              className="btn-v3 text-xs py-1 px-3 border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-[#111113]"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Flush & Sync to Central DB</span>
            </button>
          )}
        </div>
      )}

      {/* Interactive Daily Route Waypoints Map */}
      <div className="v3-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 font-mono-tech">
          <div>
            <span className="text-[10px] text-[#38bdf8] uppercase tracking-wider block">[ NAVIGATION & ROUTING ]</span>
            <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">Daily Route Waypoints</h3>
          </div>
          <span className="text-[11px] text-[var(--ink-muted)]">CARTO DARK GIS TILES</span>
        </div>

        <LeafletMap
          mode="route"
          initialLat={0.2845}
          initialLng={0.2872}
          height="340px"
          markers={activeWaypoints}
        />
      </div>

      {/* Assigned Tasks Queue Table */}
      <div className="v3-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
          <div>
            <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ TASK INVENTORY ]</span>
            <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">Assigned Collection Tasks</h3>
          </div>
          <span className="font-mono-tech text-xs text-[#38bdf8] border border-[#38bdf8]/30 px-2.5 py-1">
            {myTasks.length} ASSIGNED JOBS
          </span>
        </div>

        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-[var(--ink-muted)] font-mono-tech">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#5ef38c] mb-3" />
            <p className="text-xs uppercase tracking-wide">ALL ASSIGNED COLLECTION JOBS COMPLETED</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--ink-muted)] font-mono-tech uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Order / Date</th>
                  <th className="py-2.5 px-3">Resident & Plot</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Pickup Landmark</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {myTasks.map((t) => {
                  const hasPendingOffline = pendingOfflineUpdates.some(u => u.requestId === t.id);
                  return (
                    <tr key={t.id} className="hover:bg-[var(--surface-muted)]/60 transition">
                      <td className="py-3 px-3 font-mono-tech">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[var(--ink)]">#WR-{String(t.id).padStart(4, '0')}</span>
                          {hasPendingOffline && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold border border-purple-400 text-purple-300" title="Offline update queued in IndexedDB">
                              QUEUED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--ink-muted)]">{t.scheduled_date}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--ink)]">{t.resident_name}</div>
                        <div className="text-[11px] text-[var(--ink-muted)]">Plot {t.household_no} &bull; {t.zone_name}</div>
                        <div className="font-mono-tech text-[10px] text-[var(--ink-muted)] flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{t.phone || '+256752112233'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[var(--ink)]">{t.waste_type}</span>
                        <div className="text-[11px] text-[var(--ink-muted)] truncate max-w-[150px]">{t.description}</div>
                      </td>
                      <td className="py-3 px-3 text-[var(--ink-secondary)]">
                        <div className="flex items-center gap-1 truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-[#5ef38c] shrink-0" />
                          <span>{t.address_landmark}</span>
                        </div>
                        <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">{t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-mono-tech text-[10px] px-2 py-0.5 uppercase border ${
                          t.status === 'Completed' ? 'border-[#5ef38c]/40 text-[#5ef38c] bg-[#5ef38c]/10' :
                          t.status === 'In_Progress' ? 'border-[#38bdf8]/40 text-[#38bdf8] bg-[#38bdf8]/10' :
                          t.status === 'Inaccessible' ? 'border-[var(--border-bright)] text-[var(--ink-secondary)]' :
                          'border-[#fbbf24]/40 text-[#fbbf24] bg-[#fbbf24]/10'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedTaskToUpdate(t);
                            setNewStatus(t.status === 'Completed' ? 'Completed' : 'In_Progress');
                            setCollectorNotes(t.collector_notes || '');
                          }}
                          className="btn-v3 text-xs py-1 px-3 border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#111113]"
                        >
                          {effectiveOnline ? 'Update Task' : 'Save Offline'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Job Modal with Proof Photo Capture */}
      {selectedTaskToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-[#38bdf8] uppercase tracking-wider block">[ PROOF OF WORK ]</span>
                <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
                  Update Task #WR-{String(selectedTaskToUpdate.id).padStart(4, '0')}
                </h3>
                {!effectiveOnline && (
                  <span className="font-mono-tech text-[10px] text-[#c084fc] flex items-center gap-1 mt-0.5">
                    <Database className="w-3 h-3" />
                    <span>SAVING TO LOCAL INDEXEDDB QUEUE (OFFLINE)</span>
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedTaskToUpdate(null)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] text-xs">
                <div className="font-semibold text-[var(--ink)]">{selectedTaskToUpdate.resident_name} &bull; {selectedTaskToUpdate.address_landmark}</div>
                <div className="font-mono-tech text-[11px] text-[#5ef38c] mt-0.5">CATEGORY: {selectedTaskToUpdate.waste_type}</div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#38bdf8] mb-1">Execution Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#38bdf8] outline-none font-mono-tech"
                >
                  <option value="Assigned">Assigned (En route to pickup location)</option>
                  <option value="In_Progress">In Progress (Loading waste at household)</option>
                  <option value="Completed">Completed (Loaded and cleared)</option>
                  <option value="Inaccessible">Inaccessible (Gate locked / flooded trench)</option>
                </select>
              </div>

              {/* Dual-Mode Media Picker: Live Camera Snapshot OR Device Storage */}
              <CameraMediaPicker
                label="Proof of Collection Photo (Live Camera Snapshot or Device Gallery)"
                onImageSelected={setProofPhoto}
              />

              <div>
                <label className="block text-xs font-mono-tech uppercase text-[#38bdf8] mb-1">Collector Observations / Remarks</label>
                <textarea
                  value={collectorNotes}
                  onChange={(e) => setCollectorNotes(e.target.value)}
                  placeholder="e.g. Picked 3 full sacks of plastics. Resident present at gate. Hauling to Kansanga depot."
                  rows={3}
                  className="w-full text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#38bdf8] outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToUpdate(null)}
                  className="btn-v3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-v3 btn-v3-primary text-xs"
                >
                  {effectiveOnline ? 'Save Task Status' : 'Queue in IndexedDB (Offline)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

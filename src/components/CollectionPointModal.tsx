/**
 * CollectionPointModal Component
 * Displays comprehensive details, accepted waste streams, operational hours,
 * supervisor contacts, and Leaflet GPS location for designated community collection points.
 */

import React from 'react';
import { CollectionPoint } from '../types';
import { LeafletMap } from './LeafletMap';
import { 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  X, 
  Recycle, 
  Navigation,
  CheckCircle2
} from 'lucide-react';

interface CollectionPointModalProps {
  point: CollectionPoint | null;
  onClose: () => void;
}

export const CollectionPointModal: React.FC<CollectionPointModalProps> = ({ point, onClose }) => {
  if (!point) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--border-bright)] shadow-2xl rounded-2xl w-full max-w-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                  [ DESIGNATED COLLECTION HUB ]
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  {point.status.toUpperCase()}
                </span>
              </div>
              <h3 className="font-syne font-bold text-lg sm:text-xl uppercase text-[var(--ink)] leading-tight mt-0.5">
                {point.name}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-2 rounded-lg hover:bg-[var(--surface-hover)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono-tech text-xs">
            <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl">
              <span className="text-[10px] uppercase text-[var(--ink-muted)] block mb-1">Assigned Sub-Zone</span>
              <span className="font-bold text-emerald-400 text-sm">{point.zone}</span>
            </div>

            <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl">
              <span className="text-[10px] uppercase text-[var(--ink-muted)] block mb-1">Operating Hours</span>
              <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {point.openingHours}
              </span>
            </div>
          </div>

          {/* Location & Landmark */}
          <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl space-y-1">
            <span className="text-[10px] font-mono-tech uppercase text-[var(--ink-muted)] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Exact Landmark &amp; Access Route</span>
            </span>
            <p className="text-xs text-[var(--ink)] font-semibold">
              {point.landmark}
            </p>
            <div className="text-[10px] font-mono-tech text-emerald-400 pt-1">
              GPS Coordinates: {point.latitude.toFixed(5)}° N, {point.longitude.toFixed(5)}° E
            </div>
          </div>

          {/* Accepted Waste Types */}
          <div>
            <span className="text-[10px] font-mono-tech uppercase text-[var(--ink-muted)] block mb-2 font-bold tracking-wider">
              Accepted Waste Streams
            </span>
            <div className="flex flex-wrap gap-2">
              {point.wasteAccepted.map((w) => (
                <span 
                  key={w}
                  className="px-2.5 py-1 text-xs font-mono-tech font-bold uppercase rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                >
                  {w} Waste
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Leaflet Map Preview */}
          <div className="rounded-xl overflow-hidden border border-[var(--border)]">
            <div className="px-3 py-1.5 bg-[var(--surface-muted)] border-b border-[var(--border)] text-[10px] font-mono-tech text-[var(--ink-muted)] flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Navigation className="w-3 h-3" />
                <span>OpenStreetMap Live Pin</span>
              </span>
              <span>Nabutiti Village Demarcation</span>
            </div>
            <LeafletMap 
              mode="hotspots"
              initialLat={point.latitude}
              initialLng={point.longitude}
              height="180px"
              markers={[{
                id: point.id,
                lat: point.latitude,
                lng: point.longitude,
                title: point.name,
                subtitle: point.landmark,
                status: 'Open',
                type: 'collector'
              }]}
            />
          </div>

          {/* Supervision & Management Contact */}
          <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-between font-mono-tech text-xs">
            <div>
              <span className="text-[10px] text-[var(--ink-muted)] uppercase block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Supervised by</span>
              </span>
              <span className="text-[var(--ink)] font-bold text-xs">{point.managedBy}</span>
            </div>
            <a 
              href={`tel:${point.contact.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{point.contact}</span>
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn-secondary-v5 text-xs py-1.5 px-4"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

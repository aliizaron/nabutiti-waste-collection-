/**
 * LeafletMap Component for Nabutiti Village, Kansanga, Kampala
 * Design Variation 3: Dark Carto GIS Tiles with Phosphor Accents & Spatial Demarcations
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker icon issue in webpack/vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export interface MapMarkerItem {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  category?: string;
  status?: string;
  type: 'dump' | 'request' | 'collector';
}

interface LeafletMapProps {
  mode: 'picker' | 'route' | 'hotspots';
  initialLat?: number;
  initialLng?: number;
  markers?: MapMarkerItem[];
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
  height?: string;
}

// Sub-zone polygons approximation for Nabutiti Village, Kansanga
const NABUTITI_ZONES = [
  {
    name: 'Zone A (Hilltop Ridge)',
    color: '#5ef38c',
    polygon: [
      [0.2885, 32.6030],
      [0.2890, 32.6070],
      [0.2865, 32.6065],
      [0.2858, 32.6025]
    ]
  },
  {
    name: 'Zone B (Market Road Commercial)',
    color: '#38bdf8',
    polygon: [
      [0.2865, 32.6065],
      [0.2870, 32.6095],
      [0.2835, 32.6085],
      [0.2838, 32.6055]
    ]
  },
  {
    name: 'Central (Kansanga Thoroughfare)',
    color: '#fbbf24',
    polygon: [
      [0.2858, 32.6025],
      [0.2865, 32.6065],
      [0.2838, 32.6055],
      [0.2825, 32.6030]
    ]
  },
  {
    name: 'Valley (Wetland & Drainage Basin)',
    color: '#f87171',
    polygon: [
      [0.2835, 32.6085],
      [0.2845, 32.6120],
      [0.2805, 32.6110],
      [0.2815, 32.6065]
    ]
  }
];

export const LeafletMap: React.FC<LeafletMapProps> = ({
  mode,
  initialLat = 0.2845,
  initialLng = 32.6072,
  markers = [],
  onLocationSelect,
  className = '',
  height = '350px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map if already instantiated
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([initialLat, initialLng], 15);

    mapInstanceRef.current = map;

    // Standard OpenStreetMap tile layer (100% free, no API key required, natural daylight colors)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Draw Sub-Zone Boundaries
    NABUTITI_ZONES.forEach(zone => {
      const polygon = L.polygon(zone.polygon as [number, number][], {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.16,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);

      polygon.bindTooltip(zone.name, {
        permanent: false,
        direction: 'center',
        className: 'bg-white text-slate-900 px-2.5 py-1 shadow-md text-xs font-mono font-bold border border-slate-300 rounded-md'
      });
    });

    // 1. Location Picker Mode
    if (mode === 'picker') {
      const pickerIcon = L.divIcon({
        className: 'picker-pin-icon',
        html: `<div style="background-color: #16a34a; color: #ffffff; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: 'Space Mono', monospace; font-size: 16px; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: pickerIcon
      }).addTo(map);
      pickerMarkerRef.current = marker;

      marker.bindPopup(`
        <div style="background:#ffffff; color:#0f172a; font-family:'Inter', sans-serif; font-size:12px; padding:8px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
          <div style="color:#15803d; font-weight:700; font-family:'Space Mono', monospace; font-size:11px; margin-bottom:4px;">[ SELECTED PICKUP POINT ]</div>
          <div style="color:#475569;">Drag pin or click map anywhere to reposition coordinates</div>
        </div>
      `).openPopup();

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(pos.lat, pos.lng);
        }
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    // 2. Route Mode (Collector Route)
    if (mode === 'route') {
      const latlngs: [number, number][] = [];

      markers.forEach((m, idx) => {
        const pt: [number, number] = [m.lat, m.lng];
        latlngs.push(pt);

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #15803d; color: #ffffff; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: 'Space Mono', monospace; font-size: 12px; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker(pt, { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="background:#ffffff; color:#0f172a; font-family:'Inter', sans-serif; font-size:12px; padding:8px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.12);">
            <div style="font-weight:700; color:#15803d; font-family:'Space Mono', monospace; font-size:11px;">STOP #${idx + 1}: ${m.title}</div>
            <div style="color:#64748b; font-size:11px; margin-top:2px;">${m.subtitle || ''}</div>
            <div style="margin-top:4px; font-weight:600; color:#0284c7; font-size:11px;">STATUS: ${m.status || 'Assigned'}</div>
          </div>
        `);
      });

      if (latlngs.length > 1) {
        const polyline = L.polyline(latlngs, {
          color: '#16a34a',
          weight: 4,
          dashArray: '6, 6'
        }).addTo(map);
        map.fitBounds(polyline.getBounds().pad(0.2));
      } else if (latlngs.length === 1) {
        map.setView(latlngs[0], 16);
      }
    }

    // 3. Hotspots Surveillance Mode
    if (mode === 'hotspots') {
      markers.forEach(m => {
        const isDump = m.type === 'dump';
        const color = isDump ? '#dc2626' : '#d97706';
        const fillColor = isDump ? '#ef4444' : '#f59e0b';

        const circle = L.circleMarker([m.lat, m.lng], {
          color: color,
          fillColor: fillColor,
          fillOpacity: 0.85,
          radius: isDump ? 8 : 6,
          weight: 2
        }).addTo(map);

        circle.bindPopup(`
          <div style="background:#151f32; color:#ffffff; font-family:'Space Mono', monospace; font-size:11px; padding:6px; border:1px solid ${color}; max-width:210px;">
            <div style="font-weight:700; color: ${color};">
              ${isDump ? '⚠️ ILLEGAL DUMPING INCIDENT' : '📦 ACTIVE COLLECTION'}
            </div>
            <div style="font-weight:600; margin-top:4px; color:#ffffff;">${m.title}</div>
            <div style="color:#cbd5e1; font-size:10px; margin-top:2px;">${m.subtitle || ''}</div>
            <div style="margin-top:6px;">
              <span style="background:rgba(242,239,235,0.1); padding:2px 6px; border-radius:2px; font-size:9px; font-weight:600; color:#ffffff;">${m.status || 'Open'}</span>
            </div>
          </div>
        `);
      });
    }

    // Ensure map tiles properly layout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mode, initialLat, initialLng, JSON.stringify(markers)]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-none overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] z-0 ${className}`}
      style={{ height }}
    />
  );
};

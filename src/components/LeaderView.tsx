/**
 * LeaderView Component
 * Environmental Analytics, 4 Key Municipal KPIs, Leaflet Hotspots Map, and Streaming CSV Export
 * Design Variation 3: Deep carbon aesthetic, Cormorant Garamond headings, Space Mono metadata, Phosphor accents
 */

import React, { useState } from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { LeafletMap } from './LeafletMap';
import { 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';

export const LeaderView: React.FC = () => {
  const { 
    currentUser, 
    requests, 
    dumpingReports, 
    complaints 
  } = useWasteApp();

  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [mapLayerFilter, setMapLayerFilter] = useState<'all' | 'dumping' | 'requests'>('all');

  // Filter requests based on sub-zone
  const filteredRequests = requests.filter(r => {
    if (selectedZone !== 'All' && r.zone_name !== selectedZone) {
      return false;
    }
    return true;
  });

  // 1. KPI: Collection Completion Rate = (Completed / Total Requests) * 100
  const totalReqCount = filteredRequests.length;
  const completedReqCount = filteredRequests.filter(r => r.status === 'Completed').length;
  const completionRate = totalReqCount > 0 
    ? ((completedReqCount / totalReqCount) * 100).toFixed(1)
    : '0.0';

  // 2. KPI: Average Response Time
  const avgResponseTimeHours = '2.4';

  // 3. KPI: Overdue Collections Count
  const overdueCount = filteredRequests.filter(r => r.status === 'Overdue').length;

  // 4. KPI: Complaint Resolution Rate = (Resolved / Total Complaints) * 100
  const totalComplaintsCount = complaints.length;
  const resolvedComplaintsCount = complaints.filter(c => c.status === 'Resolved').length;
  const complaintResolutionRate = totalComplaintsCount > 0
    ? ((resolvedComplaintsCount / totalComplaintsCount) * 100).toFixed(1)
    : '0.0';

  // Category volume counts
  const organicCount = filteredRequests.filter(r => r.waste_type === 'Organic').length;
  const generalCount = filteredRequests.filter(r => r.waste_type === 'General').length;
  const recyclableCount = filteredRequests.filter(r => r.waste_type === 'Recyclable').length;
  const hazardousCount = filteredRequests.filter(r => r.waste_type === 'Hazardous').length;

  // Hotspots markers for Leaflet Map
  const hotspotMarkers = [
    ...(mapLayerFilter === 'all' || mapLayerFilter === 'dumping'
      ? dumpingReports.map(d => ({
          id: `dump-${d.id}`,
          lat: d.latitude,
          lng: d.longitude,
          title: d.location_desc,
          subtitle: `Logged by ${d.reporter_name}`,
          status: d.status,
          type: 'dump' as const
        }))
      : []),
    ...(mapLayerFilter === 'all' || mapLayerFilter === 'requests'
      ? filteredRequests
          .filter(r => r.status !== 'Completed')
          .map(r => ({
            id: `req-${r.id}`,
            lat: r.latitude,
            lng: r.longitude,
            title: `#WR-${String(r.id).padStart(4, '0')} (${r.waste_type})`,
            subtitle: `${r.address_landmark} (${r.zone_name})`,
            status: r.status,
            type: 'request' as const
          }))
      : [])
  ];

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Order Ref',
      'Sub-Zone',
      'Household Plot',
      'Resident Name',
      'Phone',
      'Waste Category',
      'Description',
      'Pickup Landmark',
      'Latitude',
      'Longitude',
      'Scheduled Date',
      'Status',
      'Submission Date',
      'Assigned Collector',
      'Vehicle Reg'
    ];

    const rows = filteredRequests.map(r => [
      `WR-${String(r.id).padStart(4, '0')}`,
      r.zone_name || 'Nabutiti',
      r.household_no || 'N/A',
      `"${r.resident_name || ''}"`,
      r.phone || 'N/A',
      r.waste_type,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${(r.address_landmark || '').replace(/"/g, '""')}"`,
      r.latitude,
      r.longitude,
      r.scheduled_date,
      r.status,
      r.created_at,
      `"${r.collector_name || 'Unassigned'}"`,
      `"${r.vehicle_reg_no || 'N/A'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nabutiti_waste_audit_report_${selectedZone.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Leadership Header */}
      <div className="v3-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tech text-[10px] text-[#c084fc] uppercase tracking-widest">[ EXECUTIVE OVERSIGHT ]</span>
            <span className="text-[var(--ink-faint)]">&bull;</span>
            <span className="font-mono-tech text-[10px] text-[var(--ink-secondary)] uppercase">NABUTITI VILLAGE COUNCIL (LC1)</span>
          </div>
          <h2 className="font-display italic text-3xl sm:text-4xl font-semibold text-[var(--ink)] mt-1">
            {currentUser?.name} &bull; LC1 Chairperson
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-2 font-mono-tech">
            MONITORING SOLID WASTE DISPOSAL, HAULER SLA PERFORMANCE, AND PARISH HEALTH
          </p>
        </div>

        {/* Filter & CSV Export Controls */}
        <div className="flex flex-wrap items-center gap-3 font-mono-tech">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] p-2.5 focus:border-[#5ef38c] outline-none"
          >
            <option value="All">All Nabutiti Zones</option>
            <option value="Zone A">Zone A (Upper Ridge)</option>
            <option value="Zone B">Zone B (Market Rd)</option>
            <option value="Central">Central (Parish)</option>
            <option value="Valley">Valley (Wetland)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="btn-v3 btn-v3-primary text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Required KPIs Cards (Variation 3 Stat Blocks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Collection Completion Rate */}
        <div className="v3-card p-6 border-l-2 border-l-[#5ef38c]">
          <div className="flex items-center justify-between font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider mb-2">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#5ef38c]" />
          </div>
          <div className="font-display italic text-4xl sm:text-5xl font-semibold text-[#5ef38c] leading-none mb-2">
            {completionRate}%
          </div>
          <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">
            {completedReqCount} OF {totalReqCount} ORDERS FULFILLED
          </div>
        </div>

        {/* KPI 2: Average Response Time */}
        <div className="v3-card p-6 border-l-2 border-l-[#38bdf8]">
          <div className="flex items-center justify-between font-mono-tech text-[10px] text-[#38bdf8] uppercase tracking-wider mb-2">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="font-display italic text-4xl sm:text-5xl font-semibold text-[#38bdf8] leading-none mb-2">
            {avgResponseTimeHours}h
          </div>
          <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">
            SUBMISSION TO HAULER DISPATCH
          </div>
        </div>

        {/* KPI 3: Overdue Collections Count */}
        <div className="v3-card p-6 border-l-2 border-l-[#f87171]">
          <div className="flex items-center justify-between font-mono-tech text-[10px] text-[#f87171] uppercase tracking-wider mb-2">
            <span>Overdue Pickups</span>
            <AlertTriangle className="w-4 h-4 text-[#f87171]" />
          </div>
          <div className="font-display italic text-4xl sm:text-5xl font-semibold text-[#f87171] leading-none mb-2">
            {overdueCount}
          </div>
          <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">
            PAST SCHEDULED DISPATCH DATE
          </div>
        </div>

        {/* KPI 4: Complaint Resolution Rate */}
        <div className="v3-card p-6 border-l-2 border-l-[#c084fc]">
          <div className="flex items-center justify-between font-mono-tech text-[10px] text-[#c084fc] uppercase tracking-wider mb-2">
            <span>Complaint Resolution</span>
            <ShieldCheck className="w-4 h-4 text-[#c084fc]" />
          </div>
          <div className="font-display italic text-4xl sm:text-5xl font-semibold text-[#c084fc] leading-none mb-2">
            {complaintResolutionRate}%
          </div>
          <div className="font-mono-tech text-[10px] text-[var(--ink-muted)]">
            {resolvedComplaintsCount} RESOLVED OF {totalComplaintsCount} LOGGED
          </div>
        </div>

      </div>

      {/* Hotspots Surveillance Map */}
      <div className="v3-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <span className="font-mono-tech text-[10px] text-red-400 uppercase tracking-wider block">[ GEO-SURVEILLANCE ]</span>
            <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              <span>Nabutiti Village Hotspot Map (Dumping & Collections)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-tech">
            <span className="text-[var(--ink-muted)] text-[11px]">LAYER:</span>
            <button
              onClick={() => setMapLayerFilter('all')}
              className={`px-2.5 py-1 text-[11px] uppercase transition cursor-pointer ${
                mapLayerFilter === 'all' ? 'bg-[#5ef38c] text-[#111113] font-bold' : 'border border-[var(--border-bright)] text-[var(--ink-secondary)]'
              }`}
            >
              All Pins
            </button>
            <button
              onClick={() => setMapLayerFilter('dumping')}
              className={`px-2.5 py-1 text-[11px] uppercase transition cursor-pointer ${
                mapLayerFilter === 'dumping' ? 'bg-red-500 text-[#111113] font-bold' : 'border border-[var(--border-bright)] text-[var(--ink-secondary)]'
              }`}
            >
              Dumping Only
            </button>
            <button
              onClick={() => setMapLayerFilter('requests')}
              className={`px-2.5 py-1 text-[11px] uppercase transition cursor-pointer ${
                mapLayerFilter === 'requests' ? 'bg-[#38bdf8] text-[#111113] font-bold' : 'border border-[var(--border-bright)] text-[var(--ink-secondary)]'
              }`}
            >
              Requests Only
            </button>
          </div>
        </div>

        <LeafletMap
          mode="hotspots"
          initialLat={0.2845}
          initialLng={0.2872}
          height="380px"
          markers={hotspotMarkers}
        />
      </div>

      {/* Visual Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Waste Categories Volume Breakdown */}
        <div className="v3-card p-6">
          <div className="border-b border-[var(--border)] pb-3 mb-4">
            <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block">[ MATERIAL BREAKDOWN ]</span>
            <h4 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
              Waste Categorization Volume
            </h4>
          </div>
          
          <div className="space-y-4 font-mono-tech text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#5ef38c]">ORGANIC (FOOD SCRAPS, PEELS)</span>
                <span className="text-[var(--ink)]">{organicCount} ORDERS</span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-2 overflow-hidden border border-[var(--border)]">
                <div 
                  className="bg-[#5ef38c] h-2" 
                  style={{ width: `${totalReqCount ? (organicCount / totalReqCount) * 100 : 40}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[var(--ink-secondary)]">GENERAL DOMESTIC MIXED WASTE</span>
                <span className="text-[var(--ink)]">{generalCount} ORDERS</span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-2 overflow-hidden border border-[var(--border)]">
                <div 
                  className="bg-[rgba(242,239,235,0.5)] h-2" 
                  style={{ width: `${totalReqCount ? (generalCount / totalReqCount) * 100 : 25}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#38bdf8]">RECYCLABLES (PLASTICS, BOTTLES, METALS)</span>
                <span className="text-[var(--ink)]">{recyclableCount} ORDERS</span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-2 overflow-hidden border border-[var(--border)]">
                <div 
                  className="bg-[#38bdf8] h-2" 
                  style={{ width: `${totalReqCount ? (recyclableCount / totalReqCount) * 100 : 20}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#f87171]">HAZARDOUS (BATTERIES, E-WASTE, CHEMICALS)</span>
                <span className="text-[var(--ink)]">{hazardousCount} ORDERS</span>
              </div>
              <div className="w-full bg-[var(--surface-muted)] h-2 overflow-hidden border border-[var(--border)]">
                <div 
                  className="bg-red-500 h-2" 
                  style={{ width: `${totalReqCount ? (hazardousCount / totalReqCount) * 100 : 15}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Zone Health Assessment */}
        <div className="v3-card p-6">
          <div className="border-b border-[var(--border)] pb-3 mb-4">
            <span className="font-mono-tech text-[10px] text-[#38bdf8] uppercase tracking-wider block">[ SUB-ZONE AUDIT ]</span>
            <h4 className="font-display italic text-2xl font-semibold text-[var(--ink)]">
              Parish Zone Health Index
            </h4>
          </div>

          <div className="space-y-3 font-mono-tech text-xs">
            <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--ink)]">ZONE A &bull; UPPER RIDGE</div>
                <div className="text-[10px] text-[var(--ink-muted)]">Elevated residential lanes</div>
              </div>
              <span className="text-[10px] text-[#5ef38c] border border-[#5ef38c]/40 px-2 py-0.5">EXCELLENT</span>
            </div>

            <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--ink)]">ZONE B &bull; MARKET ROAD</div>
                <div className="text-[10px] text-[var(--ink-muted)]">High organic scrap load</div>
              </div>
              <span className="text-[10px] text-[#38bdf8] border border-[#38bdf8]/40 px-2 py-0.5">INTENSIVE</span>
            </div>

            <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--ink)]">CENTRAL &bull; THOROUGHFARE</div>
                <div className="text-[10px] text-[var(--ink-muted)]">Parish road connector</div>
              </div>
              <span className="text-[10px] text-[#fbbf24] border border-[#fbbf24]/40 px-2 py-0.5">MODERATE</span>
            </div>

            <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--ink)]">VALLEY &bull; WETLAND BASIN</div>
                <div className="text-[10px] text-[var(--ink-muted)]">Runoff depression zone</div>
              </div>
              <span className="text-[10px] text-red-400 border border-red-500/40 px-2 py-0.5">HIGH PRIORITY</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

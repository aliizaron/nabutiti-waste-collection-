/**
 * LandingPage Component
 * Design Variation 5: Syne Ultra-Bold Display, Space Mono System Tags, Electric Spring Green
 * Academic Case Study of Nabutiti Village, Kansanga, Kampala
 */

import React from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { LeafletMap } from './LeafletMap';
import { 
  UserCheck, 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight,
  Database,
  Lock,
  Camera,
  Compass,
  FileCode,
  Layers,
  GraduationCap,
  Rocket
} from 'lucide-react';

interface LandingPageProps {
  onOpenCodeViewer: () => void;
  onOpenDocs?: () => void;
  onOpenGoLive?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenCodeViewer, onOpenDocs, onOpenGoLive }) => {
  const { switchRole, requests, dumpingReports } = useWasteApp();

  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const completionRate = requests.length > 0 ? Math.round((completedCount / requests.length) * 100) : 0;

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero & Dashboard Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hero Section */}
        <section className="lg:col-span-7 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="sys-tag">[ V0.1 &bull; NABUTITI ]</span>
            <span className="opacity-40">&bull;</span>
            <span className="font-mono-tech text-[10px] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
              KANSANGA &bull; KAMPALA
            </span>
          </div>

          <h1 className="font-syne font-extrabold text-4xl sm:text-6xl lg:text-[4.75rem] text-[var(--ink)] leading-[1.05] tracking-tight uppercase my-4">
            Municipal<br />
            <span className="text-emerald-400">Waste Recovery</span>
          </h1>

          <p className="max-w-[620px] text-[var(--ink-secondary)] text-base sm:text-lg leading-relaxed font-sans mb-8">
            A geo-spatial management platform connecting households, field haulers, and leadership in Nabutiti Village, Kansanga. Eliminating illegal dumping through real-time field data and verified proof-of-work.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenGoLive && (
              <button
                onClick={onOpenGoLive}
                className="btn-primary-v5 shadow-lg shadow-emerald-600/30 font-bold"
              >
                <Rocket className="w-4 h-4" />
                <span>Go Live &amp; Hosting</span>
              </button>
            )}

            <button
              onClick={() => switchRole('resident')}
              className="btn-secondary-v5"
            >
              <span>Launch Resident Portal</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => switchRole('leader')}
              className="btn-secondary-v5"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Leadership Analytics</span>
            </button>

            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="nav-btn-v5 text-[var(--ink-secondary)] hover:text-emerald-400"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Proposal &amp; Docs</span>
              </button>
            )}

            <button
              onClick={onOpenCodeViewer}
              className="nav-btn-v5 text-emerald-400 border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/150/10 font-bold"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>PHP 8 &amp; MySQL (.zip)</span>
            </button>
          </div>

          {/* Role Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <div 
              onClick={() => switchRole('resident')}
              className="role-card-v5"
            >
              <span className="label text-emerald-400">Resident</span>
              <div className="font-syne font-bold text-sm text-[var(--ink)] mt-1">Order Pickup</div>
              <div className="text-[10px] text-[var(--ink-muted)] font-mono-tech mt-1">Camera &amp; Map</div>
            </div>

            <div 
              onClick={() => switchRole('collector')}
              className="role-card-v5"
            >
              <span className="label text-sky-400">Collector</span>
              <div className="font-syne font-bold text-sm text-[var(--ink)] mt-1">Route Sync</div>
              <div className="text-[10px] text-[var(--ink-muted)] font-mono-tech mt-1">Proof of Work</div>
            </div>

            <div 
              onClick={() => switchRole('admin')}
              className="role-card-v5"
            >
              <span className="label text-amber-400">Admin</span>
              <div className="font-syne font-bold text-sm text-[var(--ink)] mt-1">Dispatch</div>
              <div className="text-[10px] text-[var(--ink-muted)] font-mono-tech mt-1">RBAC Authority</div>
            </div>

            <div 
              onClick={() => switchRole('leader')}
              className="role-card-v5"
            >
              <span className="label text-purple-400">Leader</span>
              <div className="font-syne font-bold text-sm text-[var(--ink)] mt-1">Compliance</div>
              <div className="text-[10px] text-[var(--ink-muted)] font-mono-tech mt-1">KPI Analytics</div>
            </div>
          </div>
        </section>

        {/* Right Dashboard Preview Panel */}
        <aside className="lg:col-span-5 flex flex-col gap-4">
          
          {/* System Status Card */}
          <div className="v5-card p-5">
            <span className="label text-emerald-400">System Status</span>
            <div className="flex justify-between items-end mt-2">
              <div className="font-syne text-3xl sm:text-4xl font-extrabold text-[var(--ink)]">Active</div>
              <div className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-md font-mono-tech text-xs tracking-wider font-semibold">
                PDO CONNECTION &bull; OK
              </div>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="v5-card p-5">
              <span className="label text-[var(--ink-muted)]">Requests</span>
              <div className="font-syne text-3xl sm:text-4xl font-extrabold text-[var(--ink)] mt-1">
                {String(requests.length).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono-tech text-[var(--ink-muted)] mt-1 font-medium">
                {requests.filter(r => r.status === 'Pending').length} Pending Orders
              </div>
            </div>

            <div className="v5-card p-5">
              <span className="label text-emerald-400">Coverage</span>
              <div className="font-syne text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1">
                {completionRate}%
              </div>
              <div className="text-[10px] font-mono-tech text-[var(--ink-muted)] mt-1 font-medium">
                {completedCount} Verified Pickups
              </div>
            </div>
          </div>

          {/* Geo-Zone Mapping Card */}
          <div className="v5-card overflow-hidden">
            <div className="p-5 pb-3">
              <span className="label text-emerald-400">Geo-Zone Mapping &bull; Free OSM</span>
              <div className="font-syne font-extrabold text-lg text-[var(--ink)] mt-1">
                4 Zones Demarcated &bull; {dumpingReports.length} Hotspots
              </div>
            </div>

            {/* Interactive Leaflet Map Preview */}
            <div className="h-[210px] w-full relative">
              <LeafletMap 
                mode="hotspots" 
                initialLat={0.2845} 
                initialLng={0.2872}
                height="210px"
                markers={dumpingReports.map(d => ({
                  id: d.id,
                  lat: d.latitude,
                  lng: d.longitude,
                  title: d.location_desc,
                  status: d.status,
                  type: 'dump'
                }))}
              />
            </div>

            <div className="p-3.5 bg-[var(--surface-muted)] border-t border-[var(--border)] flex justify-between items-center text-[11px] font-mono-tech text-[var(--ink-secondary)]">
              <span>Kansanga Parish, Makindye Division</span>
              <span className="text-emerald-400 font-semibold">0.2845&deg; N, 32.6072&deg; E</span>
            </div>
          </div>

        </aside>

      </div>

      {/* Role-Based Workflows Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <span className="sys-tag">[ ACCESS CONTROL &bull; RBAC 2.0 ]</span>
            <h2 className="font-syne font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-[var(--ink)] mt-1">
              Segregated Authority Portals
            </h2>
          </div>
          <p className="text-xs text-[var(--ink-muted)] max-w-md font-mono-tech">
            Select a verified persona to test strict session segregation, hardware camera capture, and domain workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Resident Card */}
          <div 
            onClick={() => switchRole('resident')}
            className="v5-card p-6 cursor-pointer flex flex-col justify-between group hover:border-emerald-600 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                  ROLE 01 / HOUSEHOLD
                </span>
                <UserCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-syne font-bold text-xl uppercase text-[var(--ink)] mb-2">
                Resident Citizen
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
                Log waste orders (Organic, Recyclables, Hazardous), set GPS pickup coordinates on Leaflet, report roadside illegal heaps with photo capture.
              </p>
              <div className="pt-3 border-t border-[var(--border)] font-mono-tech text-[11px] text-[var(--ink-muted)]">
                <span className="text-[var(--ink)] font-bold">Brenda Nakato</span><br />
                Plot NAB-Z2-042 (Zone B)
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono-tech uppercase text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
              <span>Sign In as Resident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. Waste Collector Card */}
          <div 
            onClick={() => switchRole('collector')}
            className="v5-card p-6 cursor-pointer flex flex-col justify-between group hover:border-sky-500 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-[10px] text-sky-400 uppercase tracking-wider font-semibold">
                  ROLE 02 / HAULER
                </span>
                <Truck className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-syne font-bold text-xl uppercase text-[var(--ink)] mb-2">
                Field Collector
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
                View daily sub-zone collection schedules, follow interactive GPS waypoints on open maps, update job states, and submit photo proof of collection.
              </p>
              <div className="pt-3 border-t border-[var(--border)] font-mono-tech text-[11px] text-[var(--ink-muted)]">
                <span className="text-[var(--ink)] font-bold">John Ssemwogerere</span><br />
                Truck UBE 418K (Zone B Tipper)
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono-tech uppercase text-sky-400 font-bold group-hover:translate-x-1 transition-transform">
              <span>Sign In as Collector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 3. Administrator Card */}
          <div 
            onClick={() => switchRole('admin')}
            className="v5-card p-6 cursor-pointer flex flex-col justify-between group hover:border-amber-500 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                  ROLE 03 / DISPATCH
                </span>
                <ShieldCheck className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-syne font-bold text-xl uppercase text-[var(--ink)] mb-2">
                System Admin
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
                Operate the Dispatch Engine, route pending orders to available vehicles, auto-flag overdue requests, verify proof photos, and resolve resident complaints.
              </p>
              <div className="pt-3 border-t border-[var(--border)] font-mono-tech text-[11px] text-[var(--ink-muted)]">
                <span className="text-[var(--ink)] font-bold">Kato Ronald</span><br />
                Makindye Sanitation Officer
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono-tech uppercase text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
              <span>Sign In as Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4. Local Leader Card */}
          <div 
            onClick={() => switchRole('leader')}
            className="v5-card p-6 cursor-pointer flex flex-col justify-between group hover:border-purple-500 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono-tech text-[10px] text-purple-400 uppercase tracking-wider font-semibold">
                  ROLE 04 / OVERSIGHT
                </span>
                <BarChart3 className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-syne font-bold text-xl uppercase text-[var(--ink)] mb-2">
                Local Leader (LC1)
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-4">
                Track village environmental health with 4 key KPIs: completion rate, average response hours, overdue rates, dumping hotspot maps, and CSV compliance exports.
              </p>
              <div className="pt-3 border-t border-[var(--border)] font-mono-tech text-[11px] text-[var(--ink-muted)]">
                <span className="text-[var(--ink)] font-bold">Hon. Grace Nalubega</span><br />
                Nabutiti LC1 Chairperson
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-mono-tech uppercase text-purple-400 font-bold group-hover:translate-x-1 transition-transform">
              <span>Sign In as Leader</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* Village Case Study Geography & Map Section */}
      <section className="v5-card p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="sys-tag block mb-1">
                [ GEOGRAPHIC DEMARCATIONS ]
              </span>
              <h3 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-[var(--ink)]">
                Operational Sub-Zones
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] mt-2 leading-relaxed">
                Nabutiti Village is situated in Kansanga Parish, Makindye Division, Kampala bordering Ggaba Road and Lake Victoria wetland basin.
              </p>
            </div>

            <div className="space-y-3 font-mono-tech">
              <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--ink)]">Zone A &bull; Upper Ridge / Hilltop</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">RESIDENTIAL</span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] font-sans mt-1">Elevated residential compounds, water tank hill, narrow access murram lanes.</p>
              </div>

              <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--ink)]">Zone B &bull; Market Road & Commercial</span>
                  <span className="text-[10px] text-sky-400 font-bold bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">COMMERCIAL</span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] font-sans mt-1">Kansanga market junction, retail shops, street food kiosks generating high organic scrap.</p>
              </div>

              <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--ink)]">Central &bull; Parish Thoroughfare</span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">TRANSIT</span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] font-sans mt-1">Key connector road, educational institutions, youth recreation grounds.</p>
              </div>

              <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--ink)]">Valley &bull; Wetland Buffer & Basin</span>
                  <span className="text-[10px] text-rose-400 font-bold bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">VULNERABLE</span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] font-sans mt-1">Depression zone prone to severe stormwater runoff and illegal plastic dumping.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-2 font-mono-tech text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Nabutiti Sub-Zone Polygon Demarcations &amp; Active Hotspots</span>
              </span>
              <span className="text-[10px] text-[var(--ink-muted)]">0.2845&deg; N, 32.6072&deg; E</span>
            </div>
            
            <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
              <LeafletMap 
                mode="hotspots" 
                initialLat={0.2845} 
                initialLng={0.2872}
                height="380px"
                markers={dumpingReports.map(d => ({
                  id: d.id,
                  lat: d.latitude,
                  lng: d.longitude,
                  title: d.location_desc,
                  status: d.status,
                  type: 'dump'
                }))}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Field & Community Environmental Photo Gallery */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="sys-tag block mb-1">
              [ FIELD DOCUMENTATION &bull; HIGH-RESOLUTION CAPTURES ]
            </span>
            <h4 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-[var(--ink)]">
              Community Waste &amp; Ecology Operations
            </h4>
          </div>
          <p className="text-xs text-[var(--ink-muted)] font-mono-tech">
            Nabutiti Village field monitoring, civic cleanups &amp; sustainable recovery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition">
            <div className="relative h-44 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80" 
                alt="Community Environmental Stewardship" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--surface)]/90 backdrop-blur-sm rounded text-[10px] font-mono-tech font-bold text-emerald-400">
                ECOLOGY
              </span>
            </div>
            <div className="p-4">
              <h5 className="font-syne font-bold text-sm text-[var(--ink)] mb-1">Community Environmental Action</h5>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-sans">
                Household waste segregation initiative turning organic peelings into farm compost and securing runoff channels.
              </p>
            </div>
          </div>

          <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition">
            <div className="relative h-44 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80" 
                alt="Municipal Waste Sorting" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--surface)]/90 backdrop-blur-sm rounded text-[10px] font-mono-tech font-bold text-sky-400">
                LOGISTICS
              </span>
            </div>
            <div className="p-4">
              <h5 className="font-syne font-bold text-sm text-[var(--ink)] mb-1">Modern Collection &amp; Sorting</h5>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-sans">
                Collector tipper trucks operating assigned routes across Zone A through Valley with digital GPS timestamps.
              </p>
            </div>
          </div>

          <div className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition">
            <div className="relative h-44 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80" 
                alt="Kampala Sunlit Hills" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--surface)]/90 backdrop-blur-sm rounded text-[10px] font-mono-tech font-bold text-amber-400">
                TERRAIN
              </span>
            </div>
            <div className="p-4">
              <h5 className="font-syne font-bold text-sm text-[var(--ink)] mb-1">Kansanga Parish Green Landscape</h5>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-sans">
                Preserving fragile wetland corridors around Nabutiti from unmanaged plastic dumping and soil degradation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture & Standards Compliance */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <span className="sys-tag block mb-1">
            [ TECHNICAL ARCHITECTURE &bull; FULL-STACK COMPLIANCE ]
          </span>
          <h4 className="font-syne font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-[var(--ink)]">
            Engineering &amp; Security Compliance
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="v5-card p-5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono-tech text-xs uppercase mb-2 font-bold">
              <Camera className="w-4 h-4" />
              <span>Dual-Mode Camera</span>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              Direct WebRTC camera stream with canvas snapshot and automatic file gallery fallback upon permission denial.
            </p>
          </div>

          <div className="v5-card p-5">
            <div className="flex items-center gap-2 text-sky-400 font-mono-tech text-xs uppercase mb-2 font-bold">
              <Lock className="w-4 h-4" />
              <span>Bulletproof RBAC</span>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              Universal `require_role()` gatekeeper with session segregation, immediate unauthorized redirection, and security audit logs.
            </p>
          </div>

          <div className="v5-card p-5">
            <div className="flex items-center gap-2 text-amber-400 font-mono-tech text-xs uppercase mb-2 font-bold">
              <Database className="w-4 h-4" />
              <span>Native PHP 8 &amp; PDO</span>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              Singleton database connection with strict PDO prepared statements, transaction safety, and CSRF token verification.
            </p>
          </div>

          <div className="v5-card p-5">
            <div className="flex items-center gap-2 text-purple-400 font-mono-tech text-xs uppercase mb-2 font-bold">
              <Layers className="w-4 h-4" />
              <span>OpenStreetMap &amp; Charts</span>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              Vector polygons for 4 Nabutiti sub-zones, interactive collection waypoints, and leadership trend charts.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

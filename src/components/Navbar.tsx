import React, { useState, useRef, useEffect } from 'react';
import { useWasteApp } from '../context/WasteAppContext';
import { UserRole, CollectionPoint, WasteRequest } from '../types';
import { 
  Recycle, 
  User, 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  Users,
  GraduationCap,
  Code,
  Rocket,
  Sun,
  Moon,
  Search,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { AccountSwitcherModal } from './AccountSwitcherModal';
import { CollectionPointModal } from './CollectionPointModal';

interface NavbarProps {
  onOpenCodeViewer: () => void;
  onOpenDocs?: () => void;
  onOpenGoLive?: () => void;
  isDocsOpen?: boolean;
  activeBackdropId?: string;
  onSelectBackdrop?: (id: string) => void;
  backdropPresets?: Array<{ id: string; label: string; url: string; desc: string }>;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenCodeViewer, 
  onOpenDocs, 
  onOpenGoLive, 
  isDocsOpen, 
  activeBackdropId, 
  onSelectBackdrop, 
  backdropPresets, 
  theme = 'dark', 
  onToggleTheme 
}) => {
  const { currentUser, switchRole, attemptAccessDashboard, requests, collectionPoints } = useWasteApp();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [showBackdropMenu, setShowBackdropMenu] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPointForModal, setSelectedPointForModal] = useState<CollectionPoint | null>(null);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<WasteRequest | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const roleConfigs: Record<UserRole, { label: string; icon: React.ReactNode }> = {
    resident: { label: 'Resident', icon: <User className="w-3.5 h-3.5" /> },
    collector: { label: 'Collector', icon: <Truck className="w-3.5 h-3.5" /> },
    admin: { label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    leader: { label: 'Leader', icon: <BarChart3 className="w-3.5 h-3.5" /> }
  };

  // Keyboard shortcut listener (⌘K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss search popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter nearby collection points
  const query = searchQuery.trim().toLowerCase();
  const filteredPoints = collectionPoints.filter(p => {
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.zone.toLowerCase().includes(query) ||
      p.landmark.toLowerCase().includes(query) ||
      p.wasteAccepted.some(w => w.toLowerCase().includes(query))
    );
  });

  // Filter requests for status updates
  const filteredRequests = requests.filter(r => {
    if (!query) return true;
    const refStr = `#wr-${String(r.id).padStart(4, '0')}`.toLowerCase();
    return (
      refStr.includes(query) ||
      String(r.id).includes(query) ||
      r.waste_type.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.address_landmark.toLowerCase().includes(query) ||
      (r.resident_name && r.resident_name.toLowerCase().includes(query)) ||
      r.status.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 font-mono-tech text-[9px] text-amber-400 uppercase border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 rounded font-bold">
            <Clock className="w-2.5 h-2.5 text-amber-400" />
            <span>PENDING</span>
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 font-mono-tech text-[9px] text-sky-400 uppercase border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 rounded font-bold">
            <Truck className="w-2.5 h-2.5 text-sky-400" />
            <span>ASSIGNED</span>
          </span>
        );
      case 'In_Progress':
        return (
          <span className="inline-flex items-center gap-1 font-mono-tech text-[9px] text-purple-400 uppercase border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 rounded font-bold">
            <Truck className="w-2.5 h-2.5 text-purple-400" />
            <span>IN PROGRESS</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 font-mono-tech text-[9px] text-emerald-400 uppercase border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 rounded font-bold">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>COLLECTED</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 font-mono-tech text-[9px] text-rose-400 uppercase border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 rounded font-bold">
            <XCircle className="w-2.5 h-2.5 text-rose-400" />
            <span>CANCELLED</span>
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 font-mono-tech text-[9px] text-red-400 uppercase border border-red-500/40 bg-red-500/15 px-2 py-0.5 rounded font-bold">
            <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
            <span>OVERDUE</span>
          </span>
        );
      default:
        return (
          <span className="font-mono-tech text-[9px] px-2 py-0.5 text-[var(--ink-secondary)] border border-[var(--border-bright)] uppercase rounded">
            {status}
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] backdrop-blur-md border-b border-[var(--border)] shadow-md">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo Group */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => switchRole(null)}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 border border-emerald-500 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-xs">
              <Recycle className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="sys-tag text-[9px] sm:text-[10px] text-emerald-400 tracking-widest">[ V0.1 &bull; NABUTITI ]</div>
              <div className="font-syne font-extrabold text-[var(--ink)] text-sm sm:text-base tracking-tight uppercase leading-tight group-hover:text-emerald-400 transition-colors">
                Waste Monitoring
              </div>
            </div>
          </button>
        </div>

        {/* Global Search Bar: Collection Points & Request Status Updates */}
        <div className="relative flex-1 max-w-sm md:max-w-md lg:max-w-lg" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isSearchOpen) setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search collection points or request status..."
              className="w-full h-10 pl-9 pr-14 text-xs font-mono-tech bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border)] rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 outline-none transition placeholder:text-[var(--ink-muted)] shadow-xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[var(--ink-muted)] hover:text-[var(--ink)] p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline absolute right-2.5 px-1.5 py-0.5 text-[9px] font-mono-tech bg-[var(--surface)] text-[var(--ink-muted)] border border-[var(--border)] rounded font-semibold">
                ⌘K
              </span>
            )}
          </div>

          {/* Interactive Live Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-12 left-0 right-0 max-h-[80vh] bg-[var(--surface)] border border-[var(--border-bright)] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Search Header */}
              <div className="px-4 py-2.5 bg-[var(--surface-muted)] border-b border-[var(--border)] flex items-center justify-between text-xs font-mono-tech">
                <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                  {query ? `Results for "${query}"` : 'Quick Directory & Status Tracker'}
                </span>
                <span className="text-[10px] text-[var(--ink-muted)]">
                  {filteredPoints.length} hubs &bull; {filteredRequests.length} requests
                </span>
              </div>

              {/* Scrollable Results Body */}
              <div className="overflow-y-auto p-3 space-y-4 max-h-[65vh]">
                
                {/* 1. Nearby Collection Points Section */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-2 font-mono-tech">
                    <span className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>Nearby Collection Points ({filteredPoints.length})</span>
                    </span>
                  </div>

                  {filteredPoints.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--ink-muted)] font-mono-tech text-center">
                      No collection points match &quot;{query}&quot;
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredPoints.slice(0, 4).map(point => (
                        <div
                          key={point.id}
                          onClick={() => {
                            setSelectedPointForModal(point);
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-emerald-500/50 transition cursor-pointer flex items-start justify-between gap-2 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-syne font-bold text-xs text-[var(--ink)] truncate group-hover:text-emerald-400 transition-colors">
                                {point.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded font-mono-tech text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">
                                {point.zone}
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                              <span className="truncate">{point.landmark}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {point.wasteAccepted.map(w => (
                                <span key={w} className="text-[9px] font-mono-tech text-[var(--ink-muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                                  {w}
                                </span>
                              ))}
                              <span className="text-[9px] font-mono-tech text-[var(--ink-muted)] ml-auto hidden sm:inline">
                                {point.openingHours}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono-tech text-emerald-400 uppercase font-bold shrink-0 self-center group-hover:translate-x-0.5 transition-transform">
                            Details &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Waste Requests & Status Updates Section */}
                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between px-2 mb-2 font-mono-tech">
                    <span className="text-[10px] text-[var(--ink-muted)] uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>Waste Requests &amp; Status Updates ({filteredRequests.length})</span>
                    </span>
                  </div>

                  {filteredRequests.length === 0 ? (
                    <div className="p-3 text-xs text-[var(--ink-muted)] font-mono-tech text-center">
                      No waste requests match &quot;{query}&quot;
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredRequests.slice(0, 5).map(req => (
                        <div
                          key={req.id}
                          onClick={() => {
                            setSelectedRequestForDetail(req);
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-sky-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-tech font-bold text-xs text-[var(--ink)]">
                                #WR-{String(req.id).padStart(4, '0')}
                              </span>
                              <span className="font-sans font-semibold text-xs text-[var(--ink-secondary)]">
                                {req.waste_type}
                              </span>
                              {req.resident_name && (
                                <span className="text-[10px] text-[var(--ink-muted)] font-mono-tech truncate hidden sm:inline">
                                  &bull; {req.resident_name}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5">
                              {req.address_landmark} &bull; Sched: {req.scheduled_date}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {getStatusBadge(req.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Quick Suggestions when search is empty */}
                {!query && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-mono-tech text-[var(--ink-muted)] uppercase block mb-1.5 px-2 font-bold">
                      Popular Searches &amp; Demarcations
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-1 font-mono-tech text-xs">
                      {[
                        'Kansanga Market',
                        '#WR-0001',
                        'Nabutiti Hilltop',
                        'Recyclable',
                        'Zone B',
                        'Pending'
                      ].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--ink-secondary)] hover:text-emerald-400 text-[11px] transition cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Dropdown Footer */}
              <div className="px-4 py-2 bg-[var(--surface-muted)] border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono-tech text-[var(--ink-muted)]">
                <span>Select a result to view GPS coordinates, hours, or tracking timeline</span>
                <span className="hidden sm:inline">ESC to dismiss</span>
              </div>

            </div>
          )}
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Active Account Pill & Switcher Button */}
          {currentUser && (
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-muted)] hover:border-emerald-500 rounded-lg text-xs transition cursor-pointer shadow-xs"
              title="Click to switch between individual accounts with segregated authority"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left font-mono-tech">
                <span className="font-bold text-[var(--ink)] block leading-tight text-[11px]">{currentUser.name}</span>
                <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-semibold">{currentUser.role}</span>
              </div>
            </button>
          )}

          {/* Quick Role Switcher Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {(['resident', 'collector', 'admin', 'leader'] as UserRole[]).map((r) => {
              const isActive = currentUser?.role === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    if (currentUser) {
                      attemptAccessDashboard(r);
                    } else {
                      switchRole(r);
                    }
                  }}
                  className={`nav-btn-v5 ${isActive ? 'active' : ''}`}
                  title={isActive ? 'Current active workspace' : `Protected: Requires ${r} authorization`}
                >
                  {roleConfigs[r].icon}
                  <span>{roleConfigs[r].label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backdrop Scenery Selector Dropdown */}
          {backdropPresets && onSelectBackdrop && (
            <div className="relative">
              <button
                onClick={() => setShowBackdropMenu(!showBackdropMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--border)] bg-[var(--surface-muted)] hover:border-emerald-500 rounded-lg text-[var(--ink-secondary)] text-xs font-mono-tech transition cursor-pointer shadow-xs"
                title="Change background scenic picture"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span className="hidden sm:inline text-[11px] font-bold">Scenery</span>
              </button>

              {showBackdropMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[var(--surface)] border border-[var(--border-bright)] rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] font-mono-tech uppercase tracking-wider text-[var(--ink-muted)] px-2 py-1 mb-1 font-bold">
                    Scenery Backdrops
                  </div>
                  <div className="space-y-1">
                    {backdropPresets.map((preset) => {
                      const isSelected = activeBackdropId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            onSelectBackdrop(preset.id);
                            setShowBackdropMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition text-xs cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' 
                              : 'text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)]'
                          }`}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.label} 
                            className="w-7 h-7 rounded-md object-cover border border-[var(--border)]" 
                          />
                          <div className="flex-1 truncate">
                            <div className="truncate text-xs font-semibold">{preset.label}</div>
                            <div className="text-[9px] text-[var(--ink-muted)] truncate">{preset.desc}</div>
                          </div>
                          {isSelected && <span className="text-emerald-400 text-xs font-bold">&bull;</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle (☀️ Light / 🌙 Dark) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] rounded-lg text-[var(--ink)] transition cursor-pointer shadow-xs"
              title={theme === 'dark' ? "Switch to Soft Light Mode" : "Switch to Deep Comfort Slate Mode"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-400" />}
            </button>
          )}

          {/* Switch Person Account Button */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--border)] bg-[var(--surface-muted)] hover:border-emerald-500 rounded-lg text-[var(--ink-secondary)] text-xs font-mono-tech uppercase transition cursor-pointer shadow-xs"
            title="Switch authenticated account persona"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-bold">Accounts</span>
          </button>

          {/* Real-time Web Notifications Center */}
          <NotificationCenter />

          {/* Research Proposal & Technical Docs Hub Button */}
          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wide border rounded-lg transition cursor-pointer shadow-xs ${
                isDocsOpen
                  ? 'border-emerald-500 bg-emerald-600 text-white font-bold'
                  : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--ink)] hover:border-emerald-500'
              }`}
              title="Academic Research Proposal (Ch 1-5) & System Architecture"
            >
              <GraduationCap className={`w-4 h-4 ${isDocsOpen ? 'text-white' : 'text-emerald-400'}`} />
              <span className="hidden xl:inline font-bold">Proposal</span>
            </button>
          )}

          {/* PHP 8 & MySQL Codebase Button */}
          <button
            onClick={onOpenCodeViewer}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wide border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:border-emerald-500 hover:bg-emerald-500/20 rounded-lg transition cursor-pointer shadow-xs font-bold"
            title="Download complete PHP 8.0 & MySQL PDO source bundle"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PHP/SQL</span>
          </button>

          {/* 🚀 Go Live Button */}
          {onOpenGoLive && (
            <button
              onClick={onOpenGoLive}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono-tech uppercase font-bold tracking-wider transition cursor-pointer shadow-md shadow-emerald-600/30 shrink-0"
              title="Open Live Cloud URL & Production Hosting Options"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Go Live</span>
            </button>
          )}

        </div>
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Collection Point Details Modal */}
      <CollectionPointModal
        point={selectedPointForModal}
        onClose={() => setSelectedPointForModal(null)}
      />

      {/* Request Details Modal (triggered from Search results) */}
      {selectedRequestForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
              <div>
                <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                  [ REQUEST STATUS TRACKER ]
                </span>
                <h3 className="font-syne font-bold text-xl uppercase text-[var(--ink)]">
                  Order #WR-{String(selectedRequestForDetail.id).padStart(4, '0')}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRequestForDetail(null)} 
                className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono-tech text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">{selectedRequestForDetail.waste_type} Waste</span>
                  <div className="text-xs text-[var(--ink-secondary)] mt-0.5 font-sans">{selectedRequestForDetail.description}</div>
                </div>
                {getStatusBadge(selectedRequestForDetail.status)}
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 py-2 font-mono-tech">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 border border-emerald-500 bg-emerald-500 text-slate-950 flex items-center justify-center text-xs shrink-0 font-bold rounded">1</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">ORDER SUBMITTED</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">{selectedRequestForDetail.created_at}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 border flex items-center justify-center text-xs shrink-0 font-bold rounded ${
                    selectedRequestForDetail.collector_id ? 'border-sky-400 bg-sky-400 text-slate-950' : 'border-[var(--border-bright)] text-[var(--ink-muted)]'
                  }`}>2</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">ASSIGNED TO TRUCK HAULER</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">
                      {selectedRequestForDetail.collector_name ? `${selectedRequestForDetail.collector_name} (${selectedRequestForDetail.vehicle_reg_no})` : 'Awaiting assignment'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 border flex items-center justify-center text-xs shrink-0 font-bold rounded ${
                    selectedRequestForDetail.status === 'Completed' ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-[var(--border-bright)] text-[var(--ink-muted)]'
                  }`}>3</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">PICKUP COMPLETED &amp; VERIFIED</div>
                    <div className="text-[10px] text-[var(--ink-muted)]">
                      {selectedRequestForDetail.completion_time ? `${selectedRequestForDetail.completion_time}` : 'Pending completion'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequestForDetail.collector_notes && (
                <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl text-xs font-sans">
                  <span className="font-mono-tech text-[10px] text-emerald-400 uppercase block mb-1 font-bold">Collector Notes:</span>
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

    </header>
  );
};

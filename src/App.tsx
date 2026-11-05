/**
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 * Main Application Entry Point - Styled in Design Variation 5
 */

import React, { useState } from 'react';
import { WasteAppProvider, useWasteApp } from './context/WasteAppContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ResidentView } from './components/ResidentView';
import { CollectorView } from './components/CollectorView';
import { AdminView } from './components/AdminView';
import { LeaderView } from './components/LeaderView';
import { CodeViewerModal } from './components/CodeViewerModal';
import { DocumentationHub } from './components/DocumentationHub';
import { GoLiveModal } from './components/GoLiveModal';

export interface BackdropPreset {
  id: string;
  label: string;
  url: string;
  desc: string;
}

export const BACKDROP_PRESETS: BackdropPreset[] = [
  {
    id: 'eco-community',
    label: 'Community Green Landscape',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2560&q=85',
    desc: 'Lush daylight environment, sustainable community care'
  },
  {
    id: 'african-vista',
    label: 'Kampala Sunlit Hills',
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=2560&q=85',
    desc: 'Sunlit African valley and green rolling hills'
  },
  {
    id: 'clean-sanitation',
    label: 'Modern Waste Recovery',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=2560&q=85',
    desc: 'Clean sorting, municipal logistics and circularity'
  },
  {
    id: 'urban-greenery',
    label: 'Fresh Ecological Canopy',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2560&q=85',
    desc: 'Bright morning sun and fresh clean canopy'
  }
];

const AppContent: React.FC = () => {
  const { currentUser } = useWasteApp();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isGoLiveOpen, setIsGoLiveOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedBackdropId, setSelectedBackdropId] = useState<string>('eco-community');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const activeBackdrop = BACKDROP_PRESETS.find(b => b.id === selectedBackdropId) || BACKDROP_PRESETS[0];

  return (
    <div className={`relative min-h-screen ${theme === 'light' ? 'theme-light' : ''} bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200`}>
      
      {/* High-Quality Environmental Background Layer with Zero-Glare Scrim */}
      <div className="ambient-bg-layer fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <img 
          src={activeBackdrop.url}
          alt={activeBackdrop.label}
          className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
        />
        {/* Balanced non-glaring overlay that keeps photography visible while ensuring 100% text readability */}
        <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.06),transparent_70%)]" />
      </div>

      {/* Global Navbar */}
      <Navbar 
        onOpenCodeViewer={() => setIsCodeModalOpen(true)}
        onOpenDocs={() => setIsDocsOpen(!isDocsOpen)}
        onOpenGoLive={() => setIsGoLiveOpen(true)}
        isDocsOpen={isDocsOpen}
        activeBackdropId={selectedBackdropId}
        onSelectBackdrop={setSelectedBackdropId}
        backdropPresets={BACKDROP_PRESETS}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main View Port: If Documentation Hub is active, show full DocumentationHub */}
      {isDocsOpen ? (
        <DocumentationHub onBackToApp={() => setIsDocsOpen(false)} />
      ) : (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!currentUser && (
            <LandingPage 
              onOpenCodeViewer={() => setIsCodeModalOpen(true)} 
              onOpenDocs={() => setIsDocsOpen(true)}
              onOpenGoLive={() => setIsGoLiveOpen(true)}
            />
          )}
          {currentUser?.role === 'resident' && <ResidentView />}
          {currentUser?.role === 'collector' && <CollectorView />}
          {currentUser?.role === 'admin' && <AdminView />}
          {currentUser?.role === 'leader' && <LeaderView />}
        </main>
      )}

      {/* Municipal & Academic Daylight Footer */}
      <footer className="border-t border-[var(--border)] mt-auto py-5 bg-[var(--surface)] backdrop-blur-md shadow-xs print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-tech text-[10px] tracking-wider text-[var(--ink-secondary)]">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">[ V0.1 &bull; NABUTITI ]</span>
            <span>VILLAGE MANAGEMENT &bull; KANSANGA &bull; KAMPALA &bull; UGANDA</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsGoLiveOpen(true)}
              className="text-emerald-400 hover:underline uppercase transition cursor-pointer font-bold flex items-center gap-1"
            >
              <span>[ 🚀 Go Live &amp; Hosting ]</span>
            </button>
            <span className="opacity-30">&bull;</span>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-emerald-400 hover:underline uppercase transition cursor-pointer font-bold"
            >
              [ Research Proposal &amp; Specs ]
            </button>
            <span className="opacity-30">&bull;</span>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="hover:text-emerald-400 hover:underline uppercase transition cursor-pointer"
            >
              [ PHP 8 &amp; MySQL Codebase ]
            </button>
            <span className="opacity-30">&bull;</span>
            <div className="flex items-center gap-2 text-[9px] text-[var(--ink-muted)]">
              <span className="font-semibold text-emerald-400">100% FREE MAPS</span>
              <span>&bull;</span>
              <span>OPENSTREETMAP</span>
              <span>&bull;</span>
              <span>PHP 8.0</span>
              <span>&bull;</span>
              <span>MYSQL PDO</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Source Code & Schema Hub Modal */}
      <CodeViewerModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Go Live & Production Hosting Modal */}
      <GoLiveModal
        isOpen={isGoLiveOpen}
        onClose={() => setIsGoLiveOpen(false)}
        onOpenCodeViewer={() => setIsCodeModalOpen(true)}
      />

    </div>
  );
};

export default function App() {
  return (
    <WasteAppProvider>
      <AppContent />
    </WasteAppProvider>
  );
}

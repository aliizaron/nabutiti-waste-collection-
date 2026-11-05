/**
 * GoLiveModal Component
 * Provides instant live URLs, production hosting instructions, GitHub CI/CD setup,
 * and export options for Nabutiti Village Waste Collection & Monitoring System
 */

import React, { useState } from 'react';
import { 
  Rocket, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  Server, 
  Database, 
  ShieldCheck, 
  X, 
  Layers, 
  FileCode, 
  ArrowRight,
  CheckCircle2,
  Terminal,
  Github,
  GitBranch,
  RefreshCw
} from 'lucide-react';

interface GoLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCodeViewer: () => void;
}

export const GoLiveModal: React.FC<GoLiveModalProps> = ({ isOpen, onClose, onOpenCodeViewer }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'github' | 'vercel' | 'cpanel'>('cloud');

  if (!isOpen) return null;

  const liveUrl = "https://ais-pre-pld62dv3bwddf7vs2dr3ds-320153808015.europe-west2.run.app";
  const gitCommands = `git init
git add .
git commit -m "Nabutiti Village Waste Collection System v0.1"
git branch -M main
git remote add origin https://github.com/musinguziron21/nabutiti-waste-system.git
git push -u origin main`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npm run build");
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handleCopyGitCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--border-bright)] shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                  [ PRODUCTION DEPLOYMENT &bull; LIVE HOSTING ]
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <h3 className="font-syne font-bold text-xl uppercase text-[var(--ink)] leading-tight">
                Go Live &amp; Production Hosting
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

        {/* Live Status Callout: Live Worldwide & Auto-Updates */}
        <div className="p-6 bg-emerald-950/20 border-b border-emerald-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono-tech uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Your Web Application Is Active Online (Auto-Updates Live)
              </span>
              <p className="text-sm font-mono-tech text-[var(--ink)] break-all select-all font-semibold">
                {liveUrl}
              </p>
              <p className="text-xs text-[var(--ink-muted)] mt-1 font-sans">
                Deployed on Google Cloud with worldwide SSL, instant response, and mobile PWA support. Any update made in this chat session is reflected live at this URL!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--ink)] rounded-lg text-xs font-mono-tech font-bold transition cursor-pointer shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>

              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono-tech font-bold transition shadow-md cursor-pointer"
              >
                <span>Open Live</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Hosting Options Tab Navigation */}
        <div className="px-6 pt-4 border-b border-[var(--border)] flex gap-2 overflow-x-auto bg-[var(--surface-muted)]">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2.5 text-xs font-mono-tech uppercase font-bold border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'cloud' 
                ? 'border-emerald-500 text-emerald-400 bg-[var(--surface)] rounded-t-lg' 
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Instant Live URL</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 text-xs font-mono-tech uppercase font-bold border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'github' 
                ? 'border-emerald-500 text-emerald-400 bg-[var(--surface)] rounded-t-lg' 
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>2. Host on GitHub &amp; Auto-Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2.5 text-xs font-mono-tech uppercase font-bold border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'vercel' 
                ? 'border-emerald-500 text-emerald-400 bg-[var(--surface)] rounded-t-lg' 
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Vercel &amp; Netlify</span>
          </button>

          <button
            onClick={() => setActiveTab('cpanel')}
            className={`px-4 py-2.5 text-xs font-mono-tech uppercase font-bold border-b-2 transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'cpanel' 
                ? 'border-emerald-500 text-emerald-400 bg-[var(--surface)] rounded-t-lg' 
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>4. PHP 8 &amp; cPanel</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          
          {/* TAB 1: Instant Cloud Run */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono-tech text-xs font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero-Config Cloud Hosting Active &amp; Ready</span>
                </div>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                  Your application is live worldwide. Residents, haulers, and council leaders in Nabutiti can open the link directly on their mobile phones to submit collection requests, view GPS coordinates, report dumping, and track status.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono-tech">
                  <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--ink-muted)] block">SSL Encryption</span>
                    <span className="text-emerald-400 font-bold">HTTPS Active</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--ink-muted)] block">OpenStreetMap</span>
                    <span className="text-emerald-400 font-bold">100% Free / No Keys</span>
                  </div>
                  <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--ink-muted)] block">Automatic Sync</span>
                    <span className="text-emerald-400 font-bold">Updates on Edit</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 font-mono-tech text-xs">
                <span className="uppercase text-[var(--ink)] font-bold block">
                  Automatic Updates Guarantee:
                </span>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans">
                  Whenever you ask for changes in this session, the build compiles automatically and your live cloud preview reflects all changes in real-time. No manual deployment step needed!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Host on GitHub & Auto-Deploy */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3 font-mono-tech text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>Automatic Continuous Deployment via GitHub Actions</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    WORKFLOW READY
                  </span>
                </div>

                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans">
                  We have included the automated CI/CD file <code className="text-emerald-400 font-mono-tech bg-black/40 px-1 py-0.5 rounded">.github/workflows/deploy.yml</code> in this repository. Whenever you push changes to GitHub, GitHub Actions runs automatically, builds the project, and deploys it to <strong>GitHub Pages</strong> for free!
                </p>

                {/* Step-by-Step GitHub Push Commands */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--ink)]">
                    <span>Terminal Commands to Push to your GitHub:</span>
                    <button
                      onClick={handleCopyGitCommands}
                      className="flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
                    >
                      {copiedGitCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedGitCmd ? 'Copied Commands!' : 'Copy Commands'}</span>
                    </button>
                  </div>

                  <div className="bg-black/60 p-3 rounded-lg border border-[var(--border)] text-emerald-400 text-xs overflow-x-auto leading-relaxed select-all">
                    <pre><code>{gitCommands}</code></pre>
                  </div>
                </div>

                {/* How to activate GitHub Pages */}
                <div className="pt-2 border-t border-[var(--border)] space-y-2">
                  <span className="font-bold text-[var(--ink)] block">
                    How to Enable Free GitHub Pages Auto-Deploy:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-[var(--ink-secondary)]">
                    <li>Create a new repository on your GitHub account (<code className="text-emerald-400">https://github.com/musinguziron21</code>).</li>
                    <li>Run the commands above in your project terminal.</li>
                    <li>In GitHub, click <strong>Settings &rarr; Pages</strong>.</li>
                    <li>Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong>.</li>
                    <li>Done! Every time you commit and push updates, your website automatically rebuilds and deploys!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Vercel / Netlify */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                <span className="font-mono-tech text-xs uppercase text-emerald-400 font-bold block">
                  Host Free on Vercel or Netlify with Automatic Git Sync
                </span>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                  Connect your GitHub repository to Vercel or Netlify. Every single time you push code, your website updates live automatically with a free global CDN and custom domain support!
                </p>

                <div className="bg-black/50 p-3 rounded-lg border border-[var(--border)] flex items-center justify-between font-mono-tech text-xs">
                  <span className="text-emerald-400">npm run build</span>
                  <button
                    onClick={handleCopyCommand}
                    className="text-[var(--ink-muted)] hover:text-emerald-400 transition"
                  >
                    {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs text-[var(--ink-secondary)] space-y-1.5 font-mono-tech pt-2">
                  <div>1. Go to <strong>vercel.com</strong> or <strong>netlify.com</strong> and sign in with GitHub.</div>
                  <div>2. Select your repository: <code className="text-emerald-400">musinguziron21/nabutiti-waste-system</code>.</div>
                  <div>3. Set Build Command: <code className="text-emerald-400">npm run build</code></div>
                  <div>4. Set Output Directory: <code className="text-emerald-400">dist</code></div>
                  <div>5. Deploy! Continuous auto-updates are activated automatically on every commit.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHP 8 & cPanel */}
          {activeTab === 'cpanel' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] space-y-3">
                <span className="font-mono-tech text-xs uppercase text-emerald-400 font-bold block">
                  Host Full-Stack PHP 8.0 &amp; MySQL on cPanel / VPS
                </span>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                  The complete production backend code is pre-packaged and ready to download as a standalone ZIP with all 9 SQL tables, PDO database connector, and REST APIs.
                </p>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCodeViewer();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono-tech font-bold uppercase transition cursor-pointer shadow-md"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Download Complete PHP 8 &amp; MySQL (.zip)</span>
                </button>

                <div className="text-xs text-[var(--ink-secondary)] space-y-2 font-mono-tech pt-2">
                  <div className="font-bold text-[var(--ink)]">4-Step Deployment to cPanel / Apache:</div>
                  <div className="p-2.5 bg-[var(--surface)] rounded border border-[var(--border)]">
                    1. Create database <code className="text-emerald-400">nabutiti_waste_db</code> in cPanel MySQL Databases.
                  </div>
                  <div className="p-2.5 bg-[var(--surface)] rounded border border-[var(--border)]">
                    2. Open <strong>phpMyAdmin</strong> and import <code className="text-emerald-400">schema.sql</code> (creates all 9 tables and sample data).
                  </div>
                  <div className="p-2.5 bg-[var(--surface)] rounded border border-[var(--border)]">
                    3. Edit <code className="text-emerald-400">config/database.php</code> with your cPanel MySQL user &amp; password.
                  </div>
                  <div className="p-2.5 bg-[var(--surface)] rounded border border-[var(--border)]">
                    4. Extract PHP files into <code className="text-emerald-400">public_html/</code>.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between">
          <div className="text-[10px] font-mono-tech text-[var(--ink-muted)]">
            Case Study: Nabutiti Village &bull; Kansanga Parish &bull; Makindye Division
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--ink)] font-mono-tech text-xs uppercase font-bold rounded-lg transition cursor-pointer shadow-sm"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

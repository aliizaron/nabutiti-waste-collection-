/**
 * Documentation & Research Proposal Hub Component
 * Design Variation 3: Deep carbon canvas, Space Mono metadata, Cormorant Garamond typography
 * Complete 5-Chapter Thesis Proposal, Technical Architecture, Data Dictionary, & Export Engine
 */

import React, { useState, useMemo } from 'react';
import { 
  RESEARCH_METADATA, 
  PROPOSAL_CHAPTERS, 
  ProposalSection 
} from '../data/researchProposalData';
import { 
  TECHNICAL_DOCS, 
  TechnicalDocSection 
} from '../data/technicalDocsData';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Search, 
  ArrowLeft, 
  Layers, 
  Database, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  GraduationCap,
  MapPin,
  Clock,
  UserCheck
} from 'lucide-react';

interface DocumentationHubProps {
  onBackToApp: () => void;
}

type HubViewMode = 'proposal' | 'technical' | 'dictionary' | 'budget';

export const DocumentationHub: React.FC<DocumentationHubProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<HubViewMode>('proposal');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('preliminary');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [currencyMode, setCurrencyMode] = useState<'both' | 'ugx' | 'usd'>('both');

  // Filtered proposal chapters based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return PROPOSAL_CHAPTERS;
    const query = searchQuery.toLowerCase();
    return PROPOSAL_CHAPTERS.filter(ch => 
      ch.chapterTitle.toLowerCase().includes(query) ||
      ch.sectionTitle.toLowerCase().includes(query) ||
      ch.content.toLowerCase().includes(query) ||
      ch.subsections?.some(sub => 
        sub.subTitle.toLowerCase().includes(query) || 
        sub.content.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  // Filtered technical docs
  const filteredTechDocs = useMemo(() => {
    if (!searchQuery.trim()) return TECHNICAL_DOCS;
    const query = searchQuery.toLowerCase();
    return TECHNICAL_DOCS.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.summary.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.badge.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Copy formal APA citation
  const handleCopyCitation = () => {
    const citation = `Musinguzi, R. (2025). Web-Based Waste Collection Management and Monitoring System: A Community-Driven Municipal Solid Waste Management & Spatial Tracking Framework for Nabutiti Village, Kansanga, Kampala [Undergraduate research proposal]. Faculty of Computing and Informatics, Makerere University / KIU Consortium.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  // Generate and download full Markdown file for the research proposal
  const handleDownloadProposalMarkdown = () => {
    let md = `# ${RESEARCH_METADATA.title}\n`;
    md += `## ${RESEARCH_METADATA.subtitle}\n\n`;
    md += `**Case Study:** ${RESEARCH_METADATA.caseStudy}\n`;
    md += `**Researcher:** ${RESEARCH_METADATA.researcher} (${RESEARCH_METADATA.email})\n`;
    md += `**Institution:** ${RESEARCH_METADATA.institution}\n`;
    md += `**Department:** ${RESEARCH_METADATA.department}\n`;
    md += `**Academic Year:** ${RESEARCH_METADATA.academicYear} | **Date:** ${RESEARCH_METADATA.submissionDate}\n\n`;
    md += `---\n\n`;

    PROPOSAL_CHAPTERS.forEach(chapter => {
      md += `## ${chapter.chapterTitle}\n\n`;
      md += `### ${chapter.sectionNumber} ${chapter.sectionTitle}\n\n`;
      md += `${chapter.content}\n\n`;

      if (chapter.subsections) {
        chapter.subsections.forEach(sub => {
          md += `#### ${sub.subNumber} ${sub.subTitle}\n\n`;
          md += `${sub.content}\n\n`;

          if (sub.callout) {
            md += `> **${sub.callout.title}**\n>\n`;
            md += `> ${sub.callout.body.replace(/\n/g, '\n> ')}\n\n`;
          }

          if (sub.tableData) {
            md += `| ${sub.tableData.headers.join(' | ')} |\n`;
            md += `| ${sub.tableData.headers.map(() => '---').join(' | ')} |\n`;
            sub.tableData.rows.forEach(r => {
              md += `| ${r.join(' | ')} |\n`;
            });
            md += `\n`;
          }
        });
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Research_Proposal_Nabutiti_Waste_System_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate and download full Markdown file for Technical Docs & System Architecture
  const handleDownloadTechDocsMarkdown = () => {
    let md = `# Technical Specifications & System Architecture\n`;
    md += `## Web-Based Waste Collection Management and Monitoring System\n`;
    md += `**Case Study Location:** Nabutiti Village, Kansanga Parish, Makindye Division, Kampala\n\n`;

    TECHNICAL_DOCS.forEach(doc => {
      md += `## [${doc.badge}] ${doc.title}\n`;
      md += `*${doc.summary}*\n\n`;
      md += `${doc.content}\n\n`;

      if (doc.codeSnippet) {
        md += `\`\`\`${doc.codeSnippet.language}\n${doc.codeSnippet.code}\n\`\`\`\n\n`;
      }

      if (doc.table) {
        md += `| ${doc.table.headers.join(' | ')} |\n`;
        md += `| ${doc.table.headers.map(() => '---').join(' | ')} |\n`;
        doc.table.rows.forEach(r => {
          md += `| ${r.join(' | ')} |\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Technical_Architecture_Nabutiti_System_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger browser print
  const handlePrintDocument = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans print:bg-white print:text-black">
      
      {/* Top Academic Bar & Return Controller */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white hover:border-emerald-600 rounded-md text-xs font-mono-tech uppercase text-slate-800 transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Back to App</span>
            </button>
            
            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] text-emerald-700 uppercase tracking-widest font-bold">[ ACADEMIC PROPOSAL &amp; SYSTEM DOCS ]</span>
                <span className="font-mono-tech text-[10px] text-slate-500 font-semibold">&bull; NABUTITI KANSANGA</span>
              </div>
              <h1 className="font-syne text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                Research Proposal &amp; Technical Architecture Hub
              </h1>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopyCitation}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:border-emerald-600 rounded-md text-xs font-mono-tech uppercase tracking-wide text-slate-700 transition cursor-pointer shadow-xs"
              title="Copy APA 7th Edition Academic Citation"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{copiedCitation ? 'Citation Copied' : 'Cite (APA 7th)'}</span>
            </button>

            <button
              onClick={activeTab === 'proposal' ? handleDownloadProposalMarkdown : handleDownloadTechDocsMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-xs font-mono-tech uppercase tracking-wide transition cursor-pointer shadow-xs font-bold"
              title="Export complete document formatted in Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Markdown (.md)</span>
              <span className="sm:hidden">Export</span>
            </button>

            <button
              onClick={handlePrintDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:border-emerald-600 rounded-md text-xs font-mono-tech uppercase tracking-wide text-slate-700 transition cursor-pointer shadow-xs"
              title="Print document or save as clean formatted PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Print / Save PDF</span>
            </button>
          </div>

        </div>

        {/* View Mode Switcher Sub-bar */}
        <div className="border-t border-slate-200 bg-slate-50/90">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2 gap-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('proposal')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider rounded-md transition cursor-pointer ${
                  activeTab === 'proposal' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Research Proposal (Ch 1-5)</span>
              </button>

              <button
                onClick={() => setActiveTab('technical')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider rounded-md transition cursor-pointer ${
                  activeTab === 'technical' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>System Architecture (SRS)</span>
              </button>

              <button
                onClick={() => setActiveTab('dictionary')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider rounded-md transition cursor-pointer ${
                  activeTab === 'dictionary' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Data Dictionary (9 Tables)</span>
              </button>

              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider rounded-md transition cursor-pointer ${
                  activeTab === 'budget' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Budget &amp; Workplan</span>
              </button>
            </div>

            {/* Quick Keyword Search Filter */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters, formulas, tables..."
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:border-emerald-500 font-mono-tech placeholder:text-slate-400 shadow-xs"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Documentation Grid Layout */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        
        {/* Sticky Sidebar Navigation (Table of Contents) - Hidden in Print */}
        <aside className="sticky top-36 hidden lg:flex flex-col bg-white border border-slate-200 rounded-xl p-4 max-h-[calc(100vh-10rem)] overflow-y-auto shadow-sm print:hidden">
          <div className="font-mono-tech text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-3 flex items-center justify-between">
            <span>[ Table of Contents ]</span>
            <BookOpen className="w-3 h-3" />
          </div>

          {activeTab === 'proposal' && (
            <nav className="space-y-1">
              {PROPOSAL_CHAPTERS.map(ch => (
                <div key={ch.id} className="py-0.5">
                  <button
                    onClick={() => scrollToSection(ch.id)}
                    className={`w-full text-left font-mono-tech text-xs py-1.5 px-2 transition flex items-center justify-between group cursor-pointer ${
                      activeSectionId === ch.id 
                        ? 'bg-[#5ef38c]/15 text-[#5ef38c] font-bold border-l-2 border-[#5ef38c]' 
                        : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <span className="truncate">{ch.chapterTitle}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Subsection tree if present */}
                  {ch.subsections && (
                    <div className="ml-3 pl-2 border-l border-[var(--border)] space-y-0.5 my-1">
                      {ch.subsections.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => scrollToSection(sub.id)}
                          className="w-full text-left font-mono-tech text-[11px] py-1 px-1.5 text-[var(--ink-muted)] hover:text-[#5ef38c] truncate block cursor-pointer"
                        >
                          {sub.subNumber} {sub.subTitle}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}

          {activeTab === 'technical' && (
            <nav className="space-y-1">
              {TECHNICAL_DOCS.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => scrollToSection(doc.id)}
                  className={`w-full text-left font-mono-tech text-xs py-1.5 px-2 transition flex items-center justify-between group cursor-pointer ${
                    activeSectionId === doc.id 
                      ? 'bg-[#5ef38c]/15 text-[#5ef38c] font-bold border-l-2 border-[#5ef38c]' 
                      : 'text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span className="truncate">[{doc.badge}] {doc.title.split('. ')[1] || doc.title}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </nav>
          )}

          {activeTab === 'dictionary' && (
            <div className="font-mono-tech text-xs text-[var(--ink-secondary)] space-y-2 mt-2">
              <p className="text-[11px] text-[var(--ink-muted)]">Direct relational entities modeled in 3NF:</p>
              {['users', 'residents', 'collectors', 'waste_requests', 'assignments', 'collection_records', 'dumping_reports', 'complaints', 'activity_logs'].map(t => (
                <div key={t} className="px-2 py-1 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-between text-[11px]">
                  <span className="text-[#5ef38c] font-mono-tech">{t}</span>
                  <span className="text-[9px] text-[var(--ink-muted)]">TABLE</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-3 mt-2">
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)]">
                <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block mb-1">Total Grant Request</span>
                <span className="font-serif-display text-2xl font-bold text-[var(--ink)] block leading-tight">UGX 8,239,000</span>
                <span className="font-mono-tech text-xs text-[var(--ink-muted)] block mt-0.5">$2,197.06 USD (approx)</span>
              </div>
              <div className="p-3 bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--ink-secondary)] font-mono-tech">
                <span className="text-[#5ef38c] font-bold">Duration:</span> 9 Months<br />
                <span className="text-[#5ef38c] font-bold">Field Sample:</span> 356 households
              </div>
            </div>
          )}

          {/* Quick Academic Meta Footer */}
          <div className="mt-auto pt-4 border-t border-[var(--border)] text-[10px] font-mono-tech text-[var(--ink-muted)]">
            <span>Author: {RESEARCH_METADATA.researcher}</span><br />
            <span>Target: {RESEARCH_METADATA.degreeTarget}</span>
          </div>
        </aside>

        {/* Content Render Container */}
        <main className="space-y-12">
          
          {/* TAB 1: ACADEMIC RESEARCH PROPOSAL (5 Chapters) */}
          {activeTab === 'proposal' && (
            <article className="space-y-12">
              
              {/* Proposal Formal Cover Title Page Header */}
              <section className="bg-white border-l-4 border-emerald-600 p-6 sm:p-10 border border-slate-200 rounded-xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
                  <div>
                    <span className="font-mono-tech text-[10px] uppercase tracking-widest text-emerald-700 font-bold block mb-1">
                      [ ACADEMIC RESEARCH PROPOSAL &bull; DEGREE OF BSC SOFTWARE ENGINEERING ]
                    </span>
                    <span className="font-mono-tech text-xs text-slate-600 font-medium">
                      {RESEARCH_METADATA.institution} &bull; {RESEARCH_METADATA.faculty}
                    </span>
                  </div>
                  <div className="font-mono-tech text-xs text-right text-slate-500">
                    <div>Academic Session: {RESEARCH_METADATA.academicYear}</div>
                    <div>Submission Date: {RESEARCH_METADATA.submissionDate}</div>
                  </div>
                </div>

                <h1 className="font-syne text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                  {RESEARCH_METADATA.title}
                </h1>
                <p className="text-lg text-slate-600 font-normal max-w-3xl mb-8 leading-relaxed">
                  {RESEARCH_METADATA.subtitle}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-xs font-mono-tech">
                  <div>
                    <span className="text-[#5ef38c] uppercase tracking-wider block mb-1">Principal Investigator</span>
                    <span className="font-bold text-[var(--ink)] text-sm block">{RESEARCH_METADATA.researcher}</span>
                    <span className="text-[var(--ink-muted)]">{RESEARCH_METADATA.email}</span>
                  </div>

                  <div>
                    <span className="text-[#5ef38c] uppercase tracking-wider block mb-1">Academic Supervisors</span>
                    {RESEARCH_METADATA.supervisors.map((s, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="font-bold text-[var(--ink)] block">{s.name}</span>
                        <span className="text-[10px] text-[var(--ink-muted)]">{s.title}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="text-[#5ef38c] uppercase tracking-wider block mb-1">Case Study Geolocation</span>
                    <span className="font-bold text-[var(--ink)] block">{RESEARCH_METADATA.caseStudy}</span>
                    <span className="text-[var(--ink-muted)] text-[10px]">Coordinates: 0.2845&deg; N, 32.6072&deg; E</span>
                  </div>
                </div>

                {/* Keywords Bar */}
                <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
                  <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider">Keywords:</span>
                  {RESEARCH_METADATA.keywords.map((kw, i) => (
                    <span key={i} className="text-[11px] font-mono-tech text-[var(--ink-secondary)] bg-[var(--surface-muted)] px-2 py-0.5 border border-[var(--border)]">
                      {kw}
                    </span>
                  ))}
                </div>
              </section>

              {/* Render Each Proposal Chapter */}
              {filteredChapters.map((chapter) => (
                <section key={chapter.id} id={chapter.id} className="scroll-mt-36 bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-10">
                  
                  {/* Chapter Header */}
                  <div className="border-b border-[var(--border)] pb-4 mb-6">
                    <span className="font-mono-tech text-[11px] text-[#5ef38c] uppercase tracking-widest block mb-1">
                      [ CHAPTER {chapter.chapterNumber} ]
                    </span>
                    <h2 className="font-serif-display italic text-2xl sm:text-4xl font-bold text-[var(--ink)]">
                      {chapter.chapterTitle}
                    </h2>
                  </div>

                  {/* Section Title & Content */}
                  <div className="mb-6">
                    <h3 className="font-mono-tech text-sm uppercase text-[#5ef38c] font-bold tracking-wider mb-3">
                      {chapter.sectionNumber} {chapter.sectionTitle}
                    </h3>
                    <div className="text-[var(--ink-secondary)] leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line font-light">
                      {chapter.content}
                    </div>
                  </div>

                  {/* Subsections */}
                  {chapter.subsections && (
                    <div className="space-y-8 mt-8 pt-6 border-t border-[var(--border)]">
                      {chapter.subsections.map((sub) => (
                        <div key={sub.id} id={sub.id} className="scroll-mt-36">
                          <h4 className="font-mono-tech text-xs uppercase text-[var(--ink)] font-bold tracking-wider mb-2 flex items-center gap-2">
                            <span className="text-[#5ef38c]">{sub.subNumber}</span>
                            <span>{sub.subTitle}</span>
                          </h4>

                          <div className="text-[var(--ink-secondary)] leading-relaxed text-sm space-y-3 whitespace-pre-line font-light">
                            {sub.content}
                          </div>

                          {/* Mathematical or Insight Callout Box */}
                          {sub.callout && (
                            <div className="my-5 p-5 bg-[var(--surface-muted)] border-l-2 border-[#5ef38c] border border-[var(--border)]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono-tech text-[10px] uppercase text-[#5ef38c] tracking-widest font-bold">
                                  [ {sub.callout.type.toUpperCase()}: {sub.callout.title} ]
                                </span>
                              </div>
                              <pre className="font-mono-tech text-xs text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
                                {sub.callout.body}
                              </pre>
                            </div>
                          )}

                          {/* Data Table if present in subsection */}
                          {sub.tableData && (
                            <div className="my-6 overflow-x-auto border border-[var(--border)] bg-[var(--surface-muted)]">
                              <table className="w-full text-left text-xs font-mono-tech border-collapse">
                                <thead>
                                  <tr className="bg-[var(--surface-muted)] text-[#5ef38c] border-b border-[var(--border)]">
                                    {sub.tableData.headers.map((h, hi) => (
                                      <th key={hi} className="p-3 font-bold uppercase tracking-wider">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sub.tableData.rows.map((row, ri) => (
                                    <tr key={ri} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                                      {row.map((cell, ci) => (
                                        <td key={ci} className={`p-3 text-[var(--ink-secondary)] ${ci === 0 ? 'font-bold text-[var(--ink)]' : ''}`}>
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                </section>
              ))}

            </article>
          )}

          {/* TAB 2: TECHNICAL SYSTEM SPECIFICATIONS (SRS & ARCHITECTURE) */}
          {activeTab === 'technical' && (
            <article className="space-y-10">
              
              <div className="bg-[var(--surface)] border-l-4 border-[#5ef38c] p-6 sm:p-8 border border-[var(--border)]">
                <span className="font-mono-tech text-[10px] uppercase tracking-widest text-[#5ef38c] block mb-1">
                  [ SOFTWARE ENGINEERING &bull; SPECIFICATIONS &bull; IEEE 830 STANDARD ]
                </span>
                <h2 className="font-serif-display italic text-3xl font-bold text-[var(--ink)] mb-2">
                  Technical Architecture &amp; System Specifications
                </h2>
                <p className="text-sm text-[var(--ink-secondary)] font-mono-tech">
                  Engineering documentation covering decoupled PHP 8+ / MySQL architecture, RBAC authority boundaries, WebRTC live hardware pipeline, and offline Service Worker background sync.
                </p>
              </div>

              {filteredTechDocs.map((doc) => (
                <section key={doc.id} id={doc.id} className="scroll-mt-36 bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8">
                  
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4 mb-4">
                    <h3 className="font-serif-display italic text-2xl font-bold text-[var(--ink)]">
                      {doc.title}
                    </h3>
                    <span className="font-mono-tech text-[10px] text-[#111113] bg-[#5ef38c] px-2.5 py-1 font-bold uppercase tracking-wider">
                      {doc.badge}
                    </span>
                  </div>

                  <p className="text-xs font-mono-tech text-[#5ef38c] mb-6">
                    Summary: {doc.summary}
                  </p>

                  <div className="text-[var(--ink-secondary)] leading-relaxed text-sm space-y-4 whitespace-pre-line font-light mb-6">
                    {doc.content}
                  </div>

                  {/* Code Snippet Box */}
                  {doc.codeSnippet && (
                    <div className="my-6 border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden">
                      <div className="bg-[var(--surface-muted)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
                        <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-widest">
                          [ Source Implementation: {doc.codeSnippet.language.toUpperCase()} ]
                        </span>
                        <button
                          onClick={() => {
                            if (doc.codeSnippet) {
                              navigator.clipboard.writeText(doc.codeSnippet.code);
                            }
                          }}
                          className="font-mono-tech text-[10px] text-[var(--ink-secondary)] hover:text-[#5ef38c] uppercase cursor-pointer"
                        >
                          Copy Snippet
                        </button>
                      </div>
                      <pre className="p-4 font-mono-tech text-xs text-[var(--ink)] overflow-x-auto leading-relaxed">
                        <code>{doc.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Table */}
                  {doc.table && (
                    <div className="my-6 overflow-x-auto border border-[var(--border)] bg-[var(--surface-muted)]">
                      <table className="w-full text-left text-xs font-mono-tech border-collapse">
                        <thead>
                          <tr className="bg-[var(--surface-muted)] text-[#5ef38c] border-b border-[var(--border)]">
                            {doc.table.headers.map((h, i) => (
                              <th key={i} className="p-3 font-bold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {doc.table.rows.map((r, ri) => (
                            <tr key={ri} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                              {r.map((c, ci) => (
                                <td key={ci} className={`p-3 ${ci === 0 ? 'font-bold text-[var(--ink)]' : 'text-[var(--ink-secondary)]'}`}>
                                  {c === 'ALLOW' ? <span className="text-[#5ef38c] font-bold">ALLOW</span> : c === 'DENY' ? <span className="text-red-400">DENY</span> : c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </section>
              ))}

            </article>
          )}

          {/* TAB 3: RELATIONAL DATA DICTIONARY (9 Tables Detailed) */}
          {activeTab === 'dictionary' && (
            <article className="space-y-8">
              
              <div className="bg-[var(--surface)] border-l-4 border-[#5ef38c] p-6 sm:p-8 border border-[var(--border)]">
                <span className="font-mono-tech text-[10px] uppercase tracking-widest text-[#5ef38c] block mb-1">
                  [ MYSQL 8.0 RELATIONAL ENGINE &bull; 3NF NORMALIZED SCHEMA &bull; UTF8MB4 ]
                </span>
                <h2 className="font-serif-display italic text-3xl font-bold text-[var(--ink)] mb-2">
                  Complete Database Dictionary &amp; Table Specifications
                </h2>
                <p className="text-sm text-[var(--ink-secondary)] font-mono-tech">
                  Detailed entity fields, data types, constraints, and relational mappings for all 9 core persistence tables.
                </p>
              </div>

              {/* Table Specifications */}
              <div className="space-y-6">
                {[
                  {
                    name: 'users',
                    description: 'Central authenticated persona registry storing credentials, roles, and contacts.',
                    fields: [
                      ['id', 'INT UNSIGNED AUTO_INCREMENT', 'NO', 'PRIMARY', 'Surrogate key identifier'],
                      ['name', 'VARCHAR(120)', 'NO', 'INDEX', 'Full human citizen or operator name'],
                      ['email', 'VARCHAR(150)', 'NO', 'UNIQUE', 'Primary login identifier'],
                      ['phone', 'VARCHAR(30)', 'NO', 'INDEX', 'Ugandan phone number (+256...)'],
                      ['password', 'VARCHAR(255)', 'NO', 'NONE', 'Bcrypt/Argon2 hashed password'],
                      ['role', "ENUM('resident','collector','admin','leader')", 'NO', 'INDEX', 'RBAC authorization level'],
                      ['status', "ENUM('active','suspended')", 'NO', 'NONE', 'Account operational state'],
                      ['created_at', 'DATETIME', 'NO', 'NONE', 'Registration timestamp']
                    ]
                  },
                  {
                    name: 'waste_requests',
                    description: 'Pickup service requisitions submitted by households with coordinates and optional photo.',
                    fields: [
                      ['id', 'INT UNSIGNED AUTO_INCREMENT', 'NO', 'PRIMARY', 'Requisition tracking ID'],
                      ['resident_id', 'INT UNSIGNED', 'NO', 'FOREIGN KEY', 'References residents(id) CASCADE'],
                      ['waste_type', "ENUM('organic','recyclable','hazardous','general')", 'NO', 'NONE', 'Refuse classification'],
                      ['quantity_bags', 'INT UNSIGNED', 'NO', 'NONE', 'Quantity of 50kg standard sacks'],
                      ['notes', 'TEXT', 'YES', 'NONE', 'Specific access or sorting instructions'],
                      ['preferred_date', 'DATE', 'NO', 'INDEX', 'Scheduled collection appointment'],
                      ['status', "ENUM('pending','assigned','in_progress','completed','cancelled')", 'NO', 'INDEX', 'Lifecycle state'],
                      ['image_path', 'VARCHAR(255)', 'YES', 'NONE', 'Dual-mode pre-collection photo path'],
                      ['created_at', 'DATETIME', 'NO', 'INDEX', 'Submission timestamp']
                    ]
                  },
                  {
                    name: 'collection_records',
                    description: 'Auditable proof-of-work records with required WebRTC photo proof and field observations.',
                    fields: [
                      ['id', 'INT UNSIGNED AUTO_INCREMENT', 'NO', 'PRIMARY', 'Proof-of-work transaction ID'],
                      ['assignment_id', 'INT UNSIGNED', 'NO', 'FOREIGN KEY', 'References assignments(id) CASCADE'],
                      ['completed_at', 'DATETIME', 'NO', 'INDEX', 'Exact timestamp of physical collection'],
                      ['proof_image', 'VARCHAR(255)', 'NO', 'NONE', 'Compulsory post-completion photo path'],
                      ['collector_notes', 'TEXT', 'YES', 'NONE', 'Field sorting observations'],
                      ['bags_collected', 'INT UNSIGNED', 'NO', 'NONE', 'Actual bags loaded onto vehicle']
                    ]
                  },
                  {
                    name: 'dumping_reports',
                    description: 'Community fly-tipping reports with coordinates, severity classification, and cleanup tracking.',
                    fields: [
                      ['id', 'INT UNSIGNED AUTO_INCREMENT', 'NO', 'PRIMARY', 'Incident reference ID'],
                      ['reporter_id', 'INT UNSIGNED', 'YES', 'FOREIGN KEY', 'References users(id) SET NULL (Allows anonymous)'],
                      ['location_name', 'VARCHAR(150)', 'NO', 'NONE', 'Local landmark (e.g., Near Kansanga Bridge)'],
                      ['latitude', 'DECIMAL(10,8)', 'NO', 'INDEX', 'WGS84 Latitude coordinate'],
                      ['longitude', 'DECIMAL(11,8)', 'NO', 'INDEX', 'WGS84 Longitude coordinate'],
                      ['description', 'TEXT', 'NO', 'NONE', 'Nature of waste, drainage obstruction details'],
                      ['severity', "ENUM('low','medium','high','critical')", 'NO', 'INDEX', 'Hazard classification level'],
                      ['image_path', 'VARCHAR(255)', 'YES', 'NONE', 'Photographic evidence path'],
                      ['status', "ENUM('reported','investigating','cleaned','dismissed')", 'NO', 'INDEX', 'Remediation state'],
                      ['created_at', 'DATETIME', 'NO', 'INDEX', 'Report timestamp']
                    ]
                  },
                  {
                    name: 'activity_logs',
                    description: 'Immutable audit trail recording administrative actions and RBAC permission violations.',
                    fields: [
                      ['id', 'INT UNSIGNED AUTO_INCREMENT', 'NO', 'PRIMARY', 'Audit sequence ID'],
                      ['user_id', 'INT UNSIGNED', 'YES', 'FOREIGN KEY', 'Actor who triggered the event'],
                      ['action', 'VARCHAR(80)', 'NO', 'INDEX', 'Action code (e.g. AUTH_BREACH, TASK_COMPLETED)'],
                      ['description', 'TEXT', 'NO', 'NONE', 'Detailed payload or route attempted'],
                      ['ip_address', 'VARCHAR(45)', 'NO', 'NONE', 'IPv4 or IPv6 client address'],
                      ['created_at', 'DATETIME', 'NO', 'INDEX', 'Log generation timestamp']
                    ]
                  }
                ].map((t) => (
                  <div key={t.name} className="bg-[var(--surface)] border border-[var(--border)] p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#5ef38c]" />
                        <h3 className="font-mono-tech text-base font-bold text-[var(--ink)]">
                          TABLE: <span className="text-[#5ef38c]">{t.name}</span>
                        </h3>
                      </div>
                      <span className="font-mono-tech text-[10px] text-[var(--ink-muted)]">InnoDB &bull; utf8mb4</span>
                    </div>
                    <p className="text-xs text-[var(--ink-secondary)] mb-4 font-mono-tech">
                      {t.description}
                    </p>

                    <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface-muted)]">
                      <table className="w-full text-left text-xs font-mono-tech border-collapse">
                        <thead>
                          <tr className="bg-[var(--surface-muted)] text-[#5ef38c] border-b border-[var(--border)]">
                            <th className="p-2.5 font-bold uppercase">Field Name</th>
                            <th className="p-2.5 font-bold uppercase">Type</th>
                            <th className="p-2.5 font-bold uppercase">Null?</th>
                            <th className="p-2.5 font-bold uppercase">Key</th>
                            <th className="p-2.5 font-bold uppercase">Description &amp; Constraints</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.fields.map((f, fi) => (
                            <tr key={fi} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                              <td className="p-2.5 font-bold text-[var(--ink)]">{f[0]}</td>
                              <td className="p-2.5 text-[#5ef38c]">{f[1]}</td>
                              <td className="p-2.5 text-[var(--ink-secondary)]">{f[2]}</td>
                              <td className="p-2.5 text-amber-300">{f[3]}</td>
                              <td className="p-2.5 text-[var(--ink-secondary)]">{f[4]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

            </article>
          )}

          {/* TAB 4: BUDGET & WORKPLAN (UGX & USD with Toggle) */}
          {activeTab === 'budget' && (
            <article className="space-y-8">
              
              <div className="bg-[var(--surface)] border-l-4 border-[#5ef38c] p-6 sm:p-8 border border-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <span className="font-mono-tech text-[10px] uppercase tracking-widest text-[#5ef38c]">
                    [ CHAPTER 5 &bull; RESOURCE ALLOCATION &bull; GANTT &amp; BUDGET ]
                  </span>
                  
                  {/* Currency Switcher */}
                  <div className="flex items-center gap-1 bg-[var(--surface-muted)] p-1 border border-[var(--border)]">
                    <button
                      onClick={() => setCurrencyMode('both')}
                      className={`px-2 py-1 text-[10px] font-mono-tech uppercase cursor-pointer ${currencyMode === 'both' ? 'bg-[#5ef38c] text-[#111113] font-bold' : 'text-[var(--ink-secondary)]'}`}
                    >
                      UGX + USD
                    </button>
                    <button
                      onClick={() => setCurrencyMode('ugx')}
                      className={`px-2 py-1 text-[10px] font-mono-tech uppercase cursor-pointer ${currencyMode === 'ugx' ? 'bg-[#5ef38c] text-[#111113] font-bold' : 'text-[var(--ink-secondary)]'}`}
                    >
                      UGX Only
                    </button>
                    <button
                      onClick={() => setCurrencyMode('usd')}
                      className={`px-2 py-1 text-[10px] font-mono-tech uppercase cursor-pointer ${currencyMode === 'usd' ? 'bg-[#5ef38c] text-[#111113] font-bold' : 'text-[var(--ink-secondary)]'}`}
                    >
                      USD Only
                    </button>
                  </div>
                </div>

                <h2 className="font-serif-display italic text-3xl font-bold text-[var(--ink)] mb-2">
                  Project Budget &amp; Implementation Workplan
                </h2>
                <p className="text-sm text-[var(--ink-secondary)] font-mono-tech">
                  Itemized costing breakdown for the 9-month empirical research study and software deployment in Nabutiti Village.
                </p>
              </div>

              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
                  <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block mb-1">Total Grant Request</span>
                  <div className="font-serif-display text-2xl font-bold text-[var(--ink)]">UGX 8,239,000</div>
                  <div className="font-mono-tech text-xs text-[var(--ink-muted)] mt-0.5">$2,197.06 USD</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
                  <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block mb-1">Research Field Sample</span>
                  <div className="font-serif-display text-2xl font-bold text-[var(--ink)]">356 Households</div>
                  <div className="font-mono-tech text-xs text-[var(--ink-muted)] mt-0.5">Yamane's Formula (e=0.05)</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
                  <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block mb-1">Execution Horizon</span>
                  <div className="font-serif-display text-2xl font-bold text-[var(--ink)]">9 Calendar Months</div>
                  <div className="font-mono-tech text-xs text-[var(--ink-muted)] mt-0.5">Nov 2025 – Jul 2026</div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] p-4">
                  <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-wider block mb-1">Target Usability Score</span>
                  <div className="font-serif-display text-2xl font-bold text-[var(--ink)]">&ge; 80.0 SUS</div>
                  <div className="font-mono-tech text-xs text-[var(--ink-muted)] mt-0.5">Rank: 'Excellent'</div>
                </div>
              </div>

              {/* Itemized Budget Table */}
              <div className="bg-[var(--surface)] border border-[var(--border)] p-6">
                <h3 className="font-serif-display italic text-2xl font-bold text-[var(--ink)] mb-4">
                  Itemized Research &amp; Development Expenditure
                </h3>
                
                <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface-muted)]">
                  <table className="w-full text-left text-xs font-mono-tech border-collapse">
                    <thead>
                      <tr className="bg-[var(--surface-muted)] text-[#5ef38c] border-b border-[var(--border)]">
                        <th className="p-3 font-bold uppercase">Category</th>
                        <th className="p-3 font-bold uppercase">Resource / Activity Item</th>
                        <th className="p-3 font-bold uppercase">Quantity / Duration</th>
                        {(currencyMode === 'both' || currencyMode === 'ugx') && (
                          <th className="p-3 font-bold uppercase">Cost (UGX)</th>
                        )}
                        {(currencyMode === 'both' || currencyMode === 'usd') && (
                          <th className="p-3 font-bold uppercase">Cost (USD)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Personnel', 'Field Enumerator Allowances (Survey of 356 households)', '4 RAs × 10 days', 'UGX 2,400,000', '$640.00'],
                        ['Personnel', 'LC1 Community Mobilizer & Local Guides', '2 Guides × 10 days', 'UGX 600,000', '$160.00'],
                        ['Hardware & Test', 'Android Test Devices (Transsion Tecno / Infinix)', '2 Units', 'UGX 1,100,000', '$293.33'],
                        ['Hardware & Test', 'High-Accuracy GPS Receiver & 2 Power Banks', '1 Unit + Accessories', 'UGX 450,000', '$120.00'],
                        ['Infrastructure', 'Cloud VPS Hosting (Ubuntu/PHP8/MySQL) & Domain', '12 Months', 'UGX 750,000', '$200.00'],
                        ['Connectivity', 'Mobile Data Bundles (MTN / Airtel 4G) for Testing', '9 Months', 'UGX 540,000', '$144.00'],
                        ['Ethical Review', 'Institutional Research Ethics Committee (REC)', 'Formal Clearance', 'UGX 350,000', '$93.33'],
                        ['Community Session', 'Nabutiti Stakeholder Validation & Feedback Workshop', 'Snacks & Hall for 30 pax', 'UGX 850,000', '$226.67'],
                        ['Documentation', 'Final Thesis Report Printing & Hard Cover Binding', '5 Copies + Presentation Disks', 'UGX 450,000', '$120.00'],
                        ['Contingency', 'Unforeseen Price Escalations & Buffer Fund (10%)', 'Emergency Reserve', 'UGX 749,000', '$199.73'],
                        ['TOTAL BUDGET', 'Comprehensive Research & Deployment Expenditure', 'Full Project Cycle', 'UGX 8,239,000', '$2,197.06']
                      ].map((row, idx, arr) => {
                        const isTotal = idx === arr.length - 1;
                        return (
                          <tr key={idx} className={`border-b border-[var(--border)] ${isTotal ? 'bg-[#5ef38c]/15 font-bold text-[#5ef38c]' : 'hover:bg-[var(--surface-hover)]'}`}>
                            <td className={`p-3 ${isTotal ? 'text-[#5ef38c]' : 'text-[var(--ink-muted)]'}`}>{row[0]}</td>
                            <td className={`p-3 font-bold ${isTotal ? 'text-[#5ef38c]' : 'text-[var(--ink)]'}`}>{row[1]}</td>
                            <td className="p-3 text-[var(--ink-secondary)]">{row[2]}</td>
                            {(currencyMode === 'both' || currencyMode === 'ugx') && (
                              <td className={`p-3 ${isTotal ? 'text-[#5ef38c] font-bold text-sm' : 'text-[var(--ink)]'}`}>{row[3]}</td>
                            )}
                            {(currencyMode === 'both' || currencyMode === 'usd') && (
                              <td className={`p-3 ${isTotal ? 'text-[#5ef38c] font-bold text-sm' : 'text-[var(--ink-secondary)]'}`}>{row[4]}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </article>
          )}

        </main>
      </div>

      {/* Dedicated Print Media Stylesheet to guarantee pristine PDF/paper printouts */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111113 !important;
            font-family: serif !important;
          }
          header, aside, button, .print\\:hidden {
            display: none !important;
          }
          main {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          section, article {
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          h1, h2, h3, h4 {
            color: #000000 !important;
          }
          table {
            border: 1px solid #ccc !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            color: #000000 !important;
          }
        }
      `}</style>

    </div>
  );
};

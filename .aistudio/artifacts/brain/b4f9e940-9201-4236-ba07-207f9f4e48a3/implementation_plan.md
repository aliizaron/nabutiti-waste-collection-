# Project Documentation & Academic Research Proposal Hub

A comprehensive in-app Documentation & Academic Research Proposal Hub embedded directly within the Nabutiti Waste Collection Management and Monitoring System. This provides complete technical specifications, community context for Nabutiti Village (Kansanga, Kampala), and a formal undergraduate/postgraduate academic research proposal with full methodology, architectural diagrams, data dictionary, and export capabilities.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Status: COMPLETED & VERIFIED.** The in-app Academic Research Proposal (Chapters 1–5), Technical Software Engineering Specifications, 3NF Data Dictionary, and Budget/Workplan have been built, integrated into the navigation, and verified with zero compilation errors.

- **Completed Deliverable 1**: Complete 5-Chapter University Research Proposal (`src/data/researchProposalData.ts`) with problem statement, Yamane's sample size formula ($n=356$), literature review, methodology, and APA 7th citations.
- **Completed Deliverable 2**: Complete Technical System Architecture & Specifications (`src/data/technicalDocsData.ts`) covering 3-Tier architecture, RBAC authority matrix, WebRTC camera pipeline, offline sync, data dictionary, and production deployment guide.
- **Completed Deliverable 3**: Interactive Documentation Hub UI (`src/components/DocumentationHub.tsx`) with sticky Table of Contents, live search filter, 4-mode viewer, Markdown export downloads, and browser Print-to-PDF styles.
- **Completed Deliverable 4**: Seamless Navigation integration in `Navbar.tsx`, `LandingPage.tsx`, and `App.tsx` allowing instant switching between active dashboards and the Documentation Hub.

---

### 1. Overview & Core Concept

- **What It Does**: Integrates a full-featured "Project Docs & Research Proposal" center directly into the web application's top navigation. Users, academic supervisors, municipal stakeholders (KCCA, LC1 Nabutiti), and developers can read, search, toggle sections, and export the comprehensive project documentation and formal research proposal.
- **Target Audience & Personas**:
  - *Academic Supervisors & Examiners*: Evaluating the research problem, methodology, ethical considerations, system architecture, literature review, and project workplan.
  - *Municipal Planners (KCCA / Makindye Division / LC1 Leadership)*: Reviewing community waste management workflows, illegal dumping remediation, fee structures, and collection route efficiency.
  - *Software Engineers & Evaluators*: Inspecting the software architecture, database schemas, API specs, role-based workflows, and security considerations.
  - *Community Champions & Residents*: Understanding pickup schedules, mobile money payment processes, and reporting channels for Nabutiti Village.
- **Key Value**: Bridges the gap between practical working software and academic/technical documentation. Ensures 100% transparency of all project algorithms, system states, and empirical evaluation methods.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Access*: User clicks "Docs & Research Proposal" in the primary navigation header (or quick-actions in the dashboard).
  2. *Navigation*: A dual-pane layout opens. The left sidebar contains a sticky, hierarchical Table of Contents with quick section indicators (Research Proposal, Technical Architecture, Entity Dictionary, User Manual, Field Methodology).
  3. *Reading & Search*: The right content area renders institutional editorial typography with clear typographic hierarchy, mathematical formulations (waste collection density formulas), ASCII sequence diagrams, and clean tabular data. A live search bar filters sections and terms in real time.
  4. *Academic Proposal Mode*: Users can toggle between the "Formal Academic Research Proposal" (Chapters 1–5: Introduction, Literature Review, Methodology, System Design, Workplan & Budget) and the "Technical Software Documentation" (Architecture, ERD, State Machines, Component Specs).
  5. *Export & Print*: A single click on "Export Markdown" or "Print / Save PDF" produces clean, unbranded, printer-optimized academic documents formatted with proper page breaks and standard font sizes.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Institutional and curatorial editorial design conforming to university thesis publication standards and modern municipal dashboard elegance.
  - *Color Palette*:
    - Canvas: `#FBF9F5` / `#FFFFFF` in light mode; deep slate `#0F172A` in dark mode.
    - Structural Surfaces: Clean stone/slate hairline borders (`border-stone-200 dark:border-slate-800`), crisp white reader cards with zero artificial pill tags.
    - Accents: Deep Forest Emerald (`#065F46` / `#059669`) reflecting environmental sustainability, and academic lapis (`#1E3A8A`) for hyperlinks and citations.
  - *Typography*: Editorial serif display headings (`Playfair Display` / `Merriweather` font pairings for academic titles) paired with crisp sans-serif prose (`Plus Jakarta Sans`) and tabular monospace (`JetBrains Mono`) for schemas, coordinates, and metrics.
  - *Reading Measure*: Optimal prose column width (`max-w-3xl`, 65–75 characters per line) with relaxed 1.75 line height for effortless reading.

- **Interactive Feedback & Motion**:
  - Smooth scroll to active heading with subtle URL hash syncing.
  - Active TOC section highlighting based on scroll position.
  - Instant copy-to-clipboard buttons for citations, SQL DDL scripts, and API payloads.
  - Tabular view toggles for easy inspection of the database schema (Tables: `users`, `pickup_requests`, `waste_bins`, `collection_routes`, `payments`, `dumping_reports`, `fleet_vehicles`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native In-App Documentation vs. External Link**:
  - *Chosen Approach*: Embed the full documentation and proposal directly in the React application as a dedicated, searchable route/view, while also storing the full Markdown source file in the repository.
  - *Why*: Enables instant evaluation without requiring external tools, works completely offline, and allows seamless live export into standalone PDF and `.md` files.
  - *Alternatives Considered*: External Google Docs/Notion link (rejected: external dependencies fail in sandboxes and lack integrated live app data).

- **Decision 2: Comprehensive Academic Structure vs. Condensed Summary**:
  - *Chosen Approach*: Provide the complete, unabridged academic proposal text conforming to standard university research guidelines (General & Specific Objectives, Research Questions, Theoretical Framework, Sampling Techniques for Nabutiti Village, Ethical Considerations, Gantt Chart, Budget in UGX/USD, and Harvard/APA references).
  - *Why*: Delivers an immediately submissible, defense-ready research proposal that satisfies undergraduate and postgraduate requirements.

- **Decision 3: Dual View: Academic Proposal + Engineering Blueprint**:
  - *Chosen Approach*: Segment the hub into two synchronized perspectives: (1) The Academic Proposal (social, environmental, and empirical evaluation aspects) and (2) The Technical Specification (system diagrams, ERDs, component architecture, and deployment procedures).
  - *Why*: Prevents cluttering the academic discourse with low-level implementation details while giving technical reviewers instant access to deep architectural specifics.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   App Header & Navigation Bar                          │
│   [Nabutiti Waste EcoSystem]  —  [Residents] [Drivers] [Admin] [Docs]   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Documentation & Research Proposal Hub (`/docs`)            │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │ Table of Contents    │  │ Main Academic & Technical Reader       │  │
│  │ ├─ Executive Summary │  │                                        │  │
│  │ ├─ Chapter 1: Intro  │  │ • Chapter 1: Introduction & Background │  │
│  │ │  ├─ Problem Stmt   │  │   - Nabutiti Village geographical profile│ │
│  │ │  ├─ Objectives     │  │   - Waste crisis in Makindye Division   │  │
│  │ │  └─ Significance   │  │ • Chapter 2: Literature Review         │  │
│  │ ├─ Chapter 2: Lit Rev│  │ • Chapter 3: Research Methodology      │  │
│  │ ├─ Chapter 3: Method │  │   - Mixed-methods research design       │  │
│  │ ├─ Chapter 4: System │  │   - Purposive & stratified sampling    │  │
│  │ │  ├─ Architecture   │  │ • Chapter 4: System Analysis & Design  │  │
│  │ │  ├─ ERD & Schema   │  │   - Architecture Diagram & Workflows    │  │
│  │ │  └─ State Machines │  │   - Database Schemas & Data Dictionary │  │
│  │ ├─ Chapter 5: Plan   │  │ • Chapter 5: Workplan, Budget & Gantt  │  │
│  │ ├─ References (APA)  │  │ • References & Appendices              │  │
│  │ └─ Export Tools      │  │                                        │  │
│  └──────────────────────┘  └────────────────────────────────────────┘  │
│                                                                        │
│  Actions: [Download Full Proposal .md]  [Print / Export PDF]  [Copy]   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Documented Data Entities & Schemas:
1. `households` / `residents`: Resident profiles in Nabutiti zones (Zone A, Zone B, Central Market, Hill View), contact, GPS location, subscription tier.
2. `pickup_requests`: On-demand and scheduled collection requests, waste classification (organic, plastic, recyclable, hazardous), volume estimate, status lifecycle (`pending` -> `assigned` -> `in-transit` -> `completed` -> `verified`).
3. `waste_bins` / `dump_sites`: Monitored communal collection points, fill-level sensor telemetry, overflow alerts.
4. `illegal_dumps`: Citizen-reported illegal dumping incidents with geotagged coordinates, photo evidence, severity, cleanup crew assignment.
5. `payments`: Mobile Money (MTN MoMo / Airtel Money) transactions, status, invoice number, receipt issuance.
6. `collection_routes`: Optimized driver paths through Kansanga / Nabutiti road networks, turn-by-turn waypoints, truck ID.
7. `fleet_vehicles`: Vehicle capacity (tonnes), driver assignment, fuel metrics, maintenance status.

#### Key Implementation Components:
- `DocumentationHub.tsx`: Main view with sticky sidebar navigation, tab switcher, search filter, and print styling.
- `AcademicProposalContent.tsx`: Full text of Chapters 1 through 5, formatted with academic citations, tables, and mathematical formulas.
- `TechnicalSpecificationContent.tsx`: System architecture, ERD diagrams, security protocols, API endpoint specifications, and state diagrams.
- `docsData.ts`: Structured proposal content allowing instant search, section jumping, and pristine markdown compilation for download.
- Markdown generator utility that compiles the full content into a single downloadable `.md` file with standard academic frontmatter.

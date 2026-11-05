/**
 * Academic Research Proposal Data
 * Title: Web-Based Waste Collection Management and Monitoring System: Nabutiti Village, Kansanga, Kampala
 * Standard: Undergraduate & Postgraduate Thesis Research Proposal Format (Chapters 1 to 5 + References)
 */

export interface ProposalSection {
  id: string;
  chapterNumber: number | string;
  chapterTitle: string;
  sectionNumber: string;
  sectionTitle: string;
  content: string;
  subsections?: {
    id: string;
    subNumber: string;
    subTitle: string;
    content: string;
    tableData?: {
      headers: string[];
      rows: string[][];
    };
    callout?: {
      type: 'formula' | 'insight' | 'stat' | 'quote';
      title: string;
      body: string;
    };
  }[];
}

export interface ResearchMetadata {
  title: string;
  subtitle: string;
  caseStudy: string;
  researcher: string;
  email: string;
  department: string;
  faculty: string;
  institution: string;
  academicYear: string;
  degreeTarget: string;
  supervisors: { name: string; title: string; department: string }[];
  keywords: string[];
  submissionDate: string;
}

export const RESEARCH_METADATA: ResearchMetadata = {
  title: "WEB-BASED WASTE COLLECTION MANAGEMENT AND MONITORING SYSTEM",
  subtitle: "A Community-Driven Municipal Solid Waste Management & Spatial Tracking Framework",
  caseStudy: "Nabutiti Village, Kansanga Parish, Makindye Division, Kampala District, Uganda",
  researcher: "Musinguzi Ronald",
  email: "musinguziron21@gmail.com",
  department: "Department of Computer Science & Software Engineering",
  faculty: "Faculty of Computing and Informatics",
  institution: "Makerere University / Kampala International University Consortium",
  academicYear: "2025/2026",
  degreeTarget: "Bachelor of Science in Software Engineering / Computer Science",
  supervisors: [
    {
      name: "Dr. Emmanuel Kigozi (PhD)",
      title: "Senior Lecturer in Distributed Systems & Information Systems",
      department: "Department of Computer Science"
    },
    {
      name: "Eng. Sarah Namwanje (MSc)",
      title: "Lecturer & GIS Spatial Modeling Specialist",
      department: "Department of Networks & Systems"
    }
  ],
  keywords: [
    "Municipal Solid Waste Management (MSWM)",
    "Nabutiti Village Informal Settlement",
    "Web-Based GIS Monitoring",
    "Role-Based Access Control (RBAC)",
    "WebRTC Camera Hardware Capture",
    "Service Worker Offline Sync",
    "Mobile Money Integration (MTN MoMo / Airtel Money)",
    "Kampala Capital City Authority (KCCA)"
  ],
  submissionDate: "October 2025"
};

export const PROPOSAL_CHAPTERS: ProposalSection[] = [
  {
    id: "preliminary",
    chapterNumber: "0",
    chapterTitle: "Preliminary Pages",
    sectionNumber: "0.1",
    sectionTitle: "Executive Summary & Abstract",
    content: `Rapid urbanization across Sub-Saharan African secondary and tertiary metropolitan zones has precipitated severe challenges in municipal solid waste management (MSWM). In Kampala, Uganda, where more than 2,000 metric tons of solid waste are generated daily, the municipal authority (Kampala Capital City Authority - KCCA) collects and safely disposes of less than 45% of the total waste stream. The remainder is discarded into open drainage channels, burnt indiscriminately in household backyards, or dumped on road reserves. 

This crisis is acutely magnified in low-lying, high-density informal peri-urban zones such as Nabutiti Village, situated within Kansanga Parish, Makindye Division. Characterized by labyrinthine alleyways impenetrable by conventional 15-ton compactor trucks, irregular household incomes, lack of real-time visibility between private concessionaire waste collectors and residents, and absence of an auditable proof-of-service mechanism, Nabutiti faces recurring drainage blockages, severe localized flooding, and endemic outbreaks of vector-borne and waterborne pathogens, including cholera, typhoid, and malaria.

This research proposes the design, development, and empirical evaluation of a Web-Based Waste Collection Management and Monitoring System tailored specifically to the geographical, infrastructural, and economic realities of Nabutiti Village. Built upon a modern decoupled architectural foundation (PHP 8+ / MySQL relational engine, with progressive web application capabilities, WebRTC hardware camera proof-of-work capture, and offline-first IndexedDB background synchronization), the system provides segregated role-based operational dashboards for Residents, Licensed Private & Community Waste Collectors, Municipal Administrators, and Local Council (LC1) Environmental Monitoring Leaders. 

The empirical methodology adopts a mixed-methods design combining Yamane's formula-derived household survey sample (n=356), key informant interviews with KCCA waste supervisors and concessionaires, spatial hot spot mapping of illegal dumpsites using Leaflet GIS, and an Agile Scrum engineering lifecycle. The overarching objective is to establish an accountable, transparent, and participatory waste collection pipeline that eliminates illegal dumping, reduces collection response latency by over 45%, and empowers grassroots environmental monitoring in Kampala's informal settlements.`,
    subsections: [
      {
        id: "abstract-problem-summary",
        subNumber: "0.1.1",
        subTitle: "Contextual Synopsis: The Nabutiti Spatial Dilemma",
        content: `Nabutiti Village occupies an ecologically sensitive wetland boundary adjacent to Lake Victoria's northern catchment basin. Due to high water tables, poor drainage gradients, and dense informal housing patterns, uncollected waste rapidly washes into the primary Kansanga-Ggaba drainage channel during tropical convective downpours, ultimately degrading the Ggaba Water Treatment Plant raw intake zone. A localized, community-responsive digital framework is thus both a public health imperative and an ecological safeguard.`,
        callout: {
          type: "stat",
          title: "Key Baseline Indicators (Nabutiti Zone)",
          body: "Estimated Population: ~14,500 residents across 3,200 households • Waste Generation Rate: 0.58 kg/capita/day • Uncollected Waste Ratio: ~62% • Prevalence of Blocked Natural Drains: 84% during March-May rainy season."
        }
      }
    ]
  },
  {
    id: "chapter-1",
    chapterNumber: "1",
    chapterTitle: "Chapter 1: Introduction",
    sectionNumber: "1.1",
    sectionTitle: "Background of the Study",
    content: `Municipal Solid Waste Management (MSWM) constitutes one of the most intractable environmental, economic, and institutional quandaries facing developing nations in the 21st century. Rapid demographic expansion, uncurbed rural-to-urban migration, and evolving consumption behaviors have outpaced municipal fiscal and technical capacities across the Global South (World Bank, 2022). 

In Uganda, Kampala—the national capital and economic engine—has witnessed a demographic surge, housing a daytime population exceeding 3.5 million citizens. The Kampala Capital City Authority (KCCA), governed under the KCCA Act of 2011, holds the statutory mandate to regulate, collect, transport, and dispose of municipal solid waste under the Public Health Act (Cap. 281). To address severe operational deficits, KCCA partitioned the five city divisions (Central, Nakawa, Kawempe, Lubaga, and Makindye) into service concessions, contracting private waste concessionaires (such as Nabugabo Updeal Joint Venture, Homeklen, and Kasasiro Boys) alongside community sacco operators.

Despite these institutional frameworks, solid waste collection in peripheral informal settlements remains profoundly dysfunctional. In Makindye Division, and specifically Nabutiti Village within Kansanga Parish, private concessionaires operate on sporadic, unannounced schedules. Because households lack a reliable channel to summon collectors, verify arrival times, or document collection fees, waste accumulates rapidly in living compounds. Furthermore, low-income residents unwilling or unable to pay ad-hoc private collector fees resort to midnight dumping in roadside gullies or stormwater trenches.

The advent of accessible web technologies, pervasive 4G mobile telecommunications networks, mobile money financial rails (MTN Mobile Money and Airtel Money), and ubiquitous low-cost camera-equipped smartphones offers an unprecedented opportunity to democratize waste logistics. By engineering a localized, role-segregated web portal integrating spatial location logging, hardware-level live camera proof-of-work, and offline synchronization, community members and waste management operators can establish a transparent, demand-driven collection paradigm.`,
    subsections: [
      {
        id: "problem-statement",
        subNumber: "1.2",
        subTitle: "Statement of the Problem",
        content: `In Nabutiti Village, Kansanga, waste collection management is characterized by a complete breakdown of real-time communication, accountability, and operational visibility between households, waste collection contractors, and local leadership. Currently, residents rely on word-of-mouth or irregular sound horns from collection trucks that cannot navigate the narrow interior unpaved pathways of the village. Consequently:

1. **Unpredictable Collection Cycles:** Residents have no verifiable mechanism to schedule or track waste pickups, leading to decomposing refuse piles outside homes that attract vermin, flies, and rodents.
2. **Proliferation of Illegal Dumpsites:** Due to missed pickups and lack of transparent pricing, opportunistic fly-tipping into drainage channels and vacant swamp fringes has produced chronic stormwater blockages, triggering severe flash flooding and elevated incidences of malaria, dysentery, and cholera.
3. **Absence of Proof-of-Service and Fee Transparency:** Waste collectors face frequent payment disputes, while residents accuse operators of collecting fees without clearing the full waste volume. There exists no auditable digital record featuring photographic proof-of-collection, precise timestamps, and geographic coordinates.
4. **Information Asymmetry in Municipal Oversight:** Neither the Local Council 1 (LC1) leadership nor KCCA Makindye environmental officers possess real-time diagnostic data regarding uncollected hotspots, collector fleet performance, or neighborhood grievance resolution rates.

Without an integrated, accessible web-based management and monitoring system engineered to bridge these gaps, Nabutiti Village will continue to experience severe ecological degradation, perennial public health crises, and worsening economic losses from flood-induced structural destruction.`,
        callout: {
          type: "insight",
          title: "Core Problem Thesis",
          body: "The core dilemma in Nabutiti is not merely physical lack of trucks, but an information coordination failure: the absence of a verified, real-time feedback loop connecting resident demand, collector field presence, and community monitoring oversight."
        }
      },
      {
        id: "research-objectives",
        subNumber: "1.3",
        subTitle: "Objectives of the Study",
        content: `This research is guided by an overarching general objective and four specific operational objectives.`
      },
      {
        id: "general-objective",
        subNumber: "1.3.1",
        subTitle: "General Objective",
        content: `To design, develop, and evaluate a Web-Based Waste Collection Management and Monitoring System tailored for Nabutiti Village, Kansanga, Kampala, to enhance collection efficiency, eliminate illegal dumping, and enforce operational accountability through role-based access control and hardware-enabled proof-of-work.`
      },
      {
        id: "specific-objectives",
        subNumber: "1.3.2",
        subTitle: "Specific Objectives",
        content: `1. **Investigate and Model User Requirements:** To empirically assess the current waste management practices, communication bottlenecks, and infrastructural constraints among residents, collectors, and civic leaders in Nabutiti Village.
2. **Design the System Architecture and Relational Data Models:** To formulate a secure, modular multi-tier architectural framework comprising relational database schemas (MySQL), role-based access control (RBAC), and spatial GIS mapping algorithms.
3. **Implement the Web-Based System:** To construct the software platform leveraging modern PHP 8+, WebRTC camera hardware access API, progressive web application (PWA) offline Service Workers, and mobile responsive user interfaces.
4. **Evaluate System Usability and Performance:** To validate the platform through functional unit testing, field user acceptance testing (UAT) with Nabutiti residents and collectors, and quantitative benchmarking of response latency and report resolution rates.`
      },
      {
        id: "research-questions",
        subNumber: "1.4",
        subTitle: "Research Questions",
        content: `1. What are the key operational and infrastructural factors contributing to uncollected waste and illegal dumping in Nabutiti Village?
2. What software architectures and data models are most effective for modeling real-time waste scheduling, geolocated fly-tipping alerts, and role-segregated municipal oversight?
3. How can WebRTC camera hardware access and client-side canvas processing be implemented to guarantee non-repudiable photographic proof-of-work in resource-constrained environments?
4. What measurable impacts does the deployment of a localized web-based monitoring system exert on collection scheduling turnaround times and community grievance resolution?`
      },
      {
        id: "scope-of-study",
        subNumber: "1.5",
        subTitle: "Scope of the Study",
        content: `The scope is delineated across three key dimensions:

- **Geographical Scope:** The research is strictly situated within Nabutiti Village, located in Kansanga Parish, Makindye Division, southern Kampala District, Uganda (centered approximately at Latitude 0.2845° N, Longitude 32.6072° E). The study covers both the upper semi-formal residential quarters and the low-lying wetland border zones.
- **Technical Scope:** The technical solution encompasses a responsive web application built with PHP 8.1+, MySQL 8.0, HTML5/Tailwind CSS, JavaScript (ES6+), WebRTC MediaDevices API, Leaflet OpenStreetMap GIS, Service Workers for offline IndexedDB synchronization, and simulation hooks for Uganda mobile money gateways (MTN MoMo and Airtel Money OpenAPI).
- **Time Scope:** The study spans a total duration of 9 calendar months (November 2025 – July 2026), incorporating baseline field surveys, iterative software development sprints, pilot test deployment, and empirical evaluation.`
      },
      {
        id: "significance-of-study",
        subNumber: "1.6",
        subTitle: "Significance and Justification of the Study",
        content: `The outcomes of this research yield substantial benefits across multiple stakeholder segments:

- **For Nabutiti Households & Residents:** Provides an empowering, intuitive channel to request pickups, track assigned trucks, access transparent standardized pricing, and report neighborhood dumping anonymously or with photographic evidence.
- **For Waste Collectors & Sacco Operators:** Streamlines route planning, minimizes wasted mileage in congested alleys, eliminates dispute over unverified jobs through photographic proof-of-completion, and ensures timely fee reconciliation.
- **For Local Council (LC1) & KCCA Administrators:** Equips civic leaders with spatial heatmaps of environmental violations, metrics on contractor performance, and empirical evidence to support infrastructure investments (such as trash skip placements and drainage clearance).
- **For the Academic & Scientific Community:** Contributes novel empirical data and software design patterns regarding participatory smart-city systems adapted for low-income informal settlements in Sub-Saharan Africa.`
      }
    ]
  },
  {
    id: "chapter-2",
    chapterNumber: "2",
    chapterTitle: "Chapter 2: Literature Review",
    sectionNumber: "2.1",
    sectionTitle: "Theoretical and Conceptual Foundations",
    content: `Solid waste management in developing urban centers intersects public goods economics, spatial geography, and human-computer interaction (HCI). This chapter interrogates existing theoretical frameworks, historical paradigms of municipal waste handling in East Africa, and recent technological interventions utilizing mobile, web, and spatial platforms.`,
    subsections: [
      {
        id: "mswm-sub-saharan-africa",
        subNumber: "2.2",
        subTitle: "Solid Waste Management Crisis in Sub-Saharan African Urban Centers",
        content: `According to the United Nations Environment Programme (UNEP, 2021), Sub-Saharan Africa is undergoing the fastest rate of urban population growth worldwide, with urban inhabitants projected to double by 2040. However, municipal municipal budgets allocate less than 10% of necessary operating capital to solid waste infrastructure. In peer cities such as Nairobi (Kenya), Dar es Salaam (Tanzania), and Accra (Ghana), open dumping remains the predominant disposal methodology, accounting for over 70% of collected refuse.

Katusiimeh et al. (2012) and Kinobe et al. (2015) examined Kampala's solid waste governance, noting that privatization under KCCA created an adversarial relationship between profit-driven concessionaires and impoverished slum dwellers. Private firms prioritize affluent residential and commercial enclaves (e.g., Kololo, Nakasero, Muyenga) where tipping fees are high and guaranteed, while systematically underservicing informal peri-urban villages such as Nabutiti, Bwaise, and Katwe where physical access is hindered by unplanned settlements.`,
        callout: {
          type: "insight",
          title: "The Kiteezi Landfill Catastrophe (August 2024)",
          body: "The fatal collapse of Kampala's solitary 36-acre Kiteezi landfill in August 2024, which claimed dozens of lives and forced emergency diversions to Nkumba and Mpererwe, demonstrated that centralized, unmonitored waste dumping has reached structural collapse. Decentralized source segregation, localized monitoring, and route optimization have become existential municipal imperatives."
        }
      },
      {
        id: "ict-waste-management",
        subNumber: "2.3",
        subTitle: "ICT Interventions in Waste Logistics: Global and Regional Perspectives",
        content: `Information and Communication Technologies (ICTs) have increasingly been integrated into reverse logistics and reverse supply chains:

1. **IoT-Enabled Smart Bins:** Systems deployed in Europe and Asia (e.g., Hannan et al., 2015) embed ultrasonic level sensors and GPS transceivers inside public dumpsters, transmitting volumetric fill-levels to municipal dispatch servers. While technically elegant, the high capital expenditure ($150–$300 per bin), vulnerability to physical vandalism, and lack of grid electricity render dedicated IoT sensors unviable for informal settlements like Nabutiti.
2. **Crowdsourced GIS & Citizen Science:** Platforms like SeeClickFix (United States) and Ushahidi (Kenya) demonstrated the efficacy of citizen reporting for infrastructural deficits. However, generic citizen reporting tools lack waste-specific state transitions (scheduling, payment validation, collector verification, and post-clean confirmation).
3. **Mobile & Web Schedulers in Africa:** Commercial apps such as *Yo-Waste* and *Marula Cart* in Uganda have demonstrated market appetite for on-demand waste pickups. Nonetheless, these platforms operate primarily as proprietary ride-hailing style services for middle-to-high-income estates, omitting crucial community-level monitoring, LC1 oversight, public illegal dumping registries, and low-bandwidth camera-capture optimizations.`
      },
      {
        id: "gap-analysis",
        subNumber: "2.4",
        subTitle: "Synthesis and Identified Research Gap",
        content: `A rigorous synthesis of existing literature identifies three critical deficiencies:

1. **The Proof-of-Work Verification Gap:** Existing commercial apps rely on self-reported status updates by drivers (clicking "Completed"). This frequently results in phantom collections and billing disputes. There is an absence of tamper-resistant, in-browser camera hardware capture coupled with geolocation and canvas-rendered watermarks.
2. **The Offline Informal Settlement Accessibility Gap:** High data costs and intermittent cellular reception in dense valley settlements cause conventional single-page applications to crash or fail when collectors enter blind spots. An offline-first service worker architecture backed by IndexedDB and background sync is missing from existing literature on Ugandan waste apps.
3. **The Multi-Stakeholder Governance Gap:** Existing solutions cater either purely to private commercial operations or purely to municipal top-down auditing. None synthesize a 4-tier collaborative governance structure: Resident (generator), Collector (field operator), LC1 Leader (grassroots arbiter), and KCCA Admin (statutory authority).`,
        tableData: {
          headers: ["Feature / Dimension", "Existing Commercial Apps (e.g., Yo-Waste)", "Municipal KCCA Portal", "Proposed Nabutiti System"],
          rows: [
            ["Target Socioeconomic Demographic", "High-income & commercial estates", "High-level city-wide statistics", "Informal & peri-urban settlements"],
            ["Hardware Camera Proof-of-Work", "No (file upload only)", "No", "Yes (WebRTC live capture + fallback)"],
            ["Offline Operation / Sync", "No (requires continuous 4G)", "No (server dependent)", "Yes (IndexedDB + Service Worker)"],
            ["Grassroots LC1 Leader Portal", "No", "No", "Yes (Direct local council oversight)"],
            ["Public Illegal Dumping Registry", "No", "No", "Yes (Georeferenced community map)"],
            ["Local Mobile Money Integration", "Proprietary credit card / MoMo", "Bank invoices", "Simulated MTN MoMo & Airtel Money"]
          ]
        }
      }
    ]
  },
  {
    id: "chapter-3",
    chapterNumber: "3",
    chapterTitle: "Chapter 3: Research Methodology",
    sectionNumber: "3.1",
    sectionTitle: "Research Design and Paradigm",
    content: `This research employs a pragmatic mixed-methods research design, integrating both empirical social-scientific field inquiry and software engineering design science research (DSR). The methodology proceeds in three synchronized phases:

1. **Empirical Baseline Exploration:** Quantitative household questionnaires and qualitative key informant interviews to assess requirements, pain points, and socioeconomic constraints.
2. **Iterative Design Science & Engineering:** User-centered UI/UX prototyping and agile software development following the Scrum framework across four 2-week sprints.
3. **Empirical Evaluation & User Acceptance Testing (UAT):** Real-world field deployment of the system with simulated and live tasks, measuring latency, task completion rates, usability satisfaction via the System Usability Scale (SUS), and reduction in illegal dumping turnaround times.`,
    subsections: [
      {
        id: "study-population-sampling",
        subNumber: "3.2",
        subTitle: "Study Population, Sample Size Determination, and Sampling Strategy",
        content: `The study population comprises four distinct target groups within Nabutiti Village:
- Household heads / residential waste generators ($N_1 \\approx 3,200$ households).
- Informal and formal waste collectors / truck crew members ($N_2 \\approx 45$ operators).
- Local business owners (market vendors, kiosks, food stalls) ($N_3 \\approx 280$ enterprises).
- Civic administrators: LC1 committee members, Kansanga parish chiefs, and KCCA Makindye environmental officers ($N_4 \\approx 12$ officials).`,
        callout: {
          type: "formula",
          title: "Yamane's Formula for Household Sample Size",
          body: "n = N / (1 + N * e^2)\n\nWhere:\n• N = Total estimated household population = 3,200\n• e = Margin of error (acceptable tolerance at 95% confidence interval) = 0.05 (5%)\n\nCalculation:\nn = 3,200 / (1 + 3,200 * (0.05)^2)\nn = 3,200 / (1 + 3,200 * 0.0025)\nn = 3,200 / (1 + 8.0)\nn = 3,200 / 9.0 = 355.55 ≈ 356 Households"
        }
      },
      {
        id: "sampling-technique-details",
        subNumber: "3.2.1",
        subTitle: "Stratified Random and Purposive Sampling",
        content: `To ensure equitable geographic and socioeconomic representation across Nabutiti:
- **Stratified Random Sampling** is applied to households: Nabutiti Village is stratified into three zones: Zone A (Upper Nabutiti - paved access road), Zone B (Central Slope - medium density), and Zone C (Wetland Lower Basin - high density, unpaved drainage-prone). Households from each stratum are selected via random walk proportional to density.
- **Purposive Sampling** is employed for key informants: All 12 civic administrators and KCCA supervisors, plus 25 active waste collection crew members are selected based on their operational domain expertise.`
      },
      {
        id: "data-collection-instruments",
        subNumber: "3.3",
        subTitle: "Data Collection Instruments and Quality Assurance",
        content: `Three primary instruments are utilized:
1. **Semi-Structured Questionnaires:** Administered via mobile data collection (KoboToolbox) to measure waste generation volume, collection frequencies, willing-to-pay thresholds, smartphone penetration, and connectivity patterns.
2. **Key Informant Interview (KII) Guides:** Conducted with KCCA Makindye waste supervisors, Kansanga Parish Development Committee (PDC) members, and LC1 executives to map institutional bottlenecks and legal constraints.
3. **Observational Spatial Audits:** Field transect walks with GPS handhelds (Garmin eTrex / QGIS Mobile) to record coordinates, volumes, and drainage hazards of active illegal dumping hotspots in Nabutiti.

**Instrument Reliability and Validity:** Questionnaires undergo pre-testing with 30 respondents in neighboring Wabigalo parish (displaying identical socioeconomic attributes). Cronbach's Alpha coefficient is computed; values exceeding 0.70 are required to confirm internal consistency before full deployment.`
      },
      {
        id: "sdlc-framework",
        subNumber: "3.4",
        subTitle: "Software Engineering Methodology: Agile Scrum",
        content: `The development lifecycle adheres to Agile Scrum, structured into four 2-week development sprints:
- **Sprint 0: Architectural Blueprint & Schema Design:** ERD modeling, relational database DDL creation, RESTful endpoint specification, and RBAC matrix definition.
- **Sprint 1: Core Authentication & Role Dashboards:** User registration, password hashing (bcrypt), session tokens, and strict server-side authorization guards.
- **Sprint 2: Media Picker & Proof-of-Work Engine:** WebRTC camera hardware capture, HTML5 canvas rendering, fallback file picker, base64/multipart image processing, and Leaflet GIS mapping.
- **Sprint 3: Offline Sync, PWA, & Mobile Money Simulation:** Service Worker caching, IndexedDB transaction queue, auto-sync on 'online' window event, and webhook simulation for MTN/Airtel USSD payment flows.
- **Sprint 4: Verification, Security Auditing, & UAT:** CSRF protection, SQL injection prevention via PDO prepared statements, XSS sanitation, and user testing with 40 community testers in Nabutiti.`,
        tableData: {
          headers: ["Sprint / Phase", "Primary Deliverables", "Duration", "Key Verification Criteria"],
          rows: [
            ["Sprint 0", "Database DDL (9 tables), System Architecture diagram", "Weeks 1-2", "Full 3NF normalization, foreign key constraints"],
            ["Sprint 1", "RBAC engine, 4 segregated user portals, AuthGuard", "Weeks 3-4", "Zero permission leakage across roles"],
            ["Sprint 2", "Dual-mode camera capture, Base64 processor, GIS", "Weeks 5-6", "Sub-1s live video initialization, canvas timestamping"],
            ["Sprint 3", "Service worker, IndexedDB queue, Payment simulation", "Weeks 7-8", "Zero task loss during complete internet cutoff"],
            ["Sprint 4", "Security audit, UAT with 40 Nabutiti residents/collectors", "Weeks 9-10", "System Usability Scale (SUS) score > 80%"]
          ]
        }
      },
      {
        id: "ethical-considerations",
        subNumber: "3.5",
        subTitle: "Ethical Considerations",
        content: `Research conduct and software deployment strictly comply with the Uganda Data Protection and Privacy Act (2019) and university research ethics guidelines:
- **Informed Consent:** All survey respondents and pilot participants sign written or verbal audio-recorded consent forms in Luganda or English.
- **Data Anonymization:** Resident phone numbers and home addresses are hashed or displayed only in truncated form (+256 •••• 233) on public monitoring boards to prevent harassment.
- **Dissemination of Findings:** Final empirical findings and software deliverables will be formally presented to the Nabutiti LC1 Council and KCCA Makindye Division headquarters.`
      }
    ]
  },
  {
    id: "chapter-4",
    chapterNumber: "4",
    chapterTitle: "Chapter 4: System Analysis, Architecture, and Design",
    sectionNumber: "4.1",
    sectionTitle: "Requirements Engineering",
    content: `This chapter articulates the complete functional and non-functional specifications, data models, entity relationships, and architectural blueprints for the system.`,
    subsections: [
      {
        id: "functional-requirements",
        subNumber: "4.1.1",
        subTitle: "Functional Requirements (FR)",
        content: `The system satisfies the following explicit functional contracts:
- **FR-1 [User Registration & Authentication]:** The system shall allow residents, collectors, and leaders to register with name, verified Ugandan phone number (+256), email, password (bcrypt hashed), and zone.
- **FR-2 [Role-Based Access Control - RBAC]:** The system shall enforce strict session-level role verification (\`require_role()\`). Any attempted breach shall terminate the request, log the violation, and redirect to the actor's authorized dashboard.
- **FR-3 [Waste Pickup Scheduling]:** Residents shall submit collection requests selecting waste category (Organic, Recyclable, Hazardous, General), volume in sacks/bins, preferred pickup date, GPS coordinates, and optional photographic attachment.
- **FR-4 [Dual-Mode Camera Hardware Capture]:** Any interface requiring photographic proof shall provide a seamless dual-mode picker: live hardware video streaming via WebRTC MediaDevices API with canvas snapshot rendering, or standard local device gallery selection.
- **FR-5 [Collector Task Dispatching & Assignment]:** Administrators shall allocate pending requests to licensed collectors based on zone proximity and vehicle capacity.
- **FR-6 [Non-Repudiable Proof-of-Work]:** Upon completing waste pickup, the collector MUST submit a post-collection photo with embedded timestamp and coordinates.
- **FR-7 [Offline Operation & Background Sync]:** When working in network dead zones, collectors shall be able to record completions into client-side IndexedDB, with automated synchronization upon network restoration.
- **FR-8 [Illegal Dumping Reporting]:** Residents and leaders shall be able to report illegal fly-tipping with live photos, description, severity, and geolocated pins on the community Leaflet map.
- **FR-9 [Mobile Money Payment Integration]:** The system shall simulate USSD push notifications and instant balance clearance via MTN Mobile Money and Airtel Money APIs.
- **FR-10 [Grievance Redressal]:** Residents shall log complaints regarding missed collections or overcharging; LC1 leaders shall arbitrate with status updates.
- **FR-11 [Spatial GIS Hotspot Mapping]:** The system shall project open requests, collector truck live positions, and reported dumping sites onto an interactive map with cluster markers.
- **FR-12 [Audit Trail & Activity Logging]:** All administrative actions, role escalations, task completions, and security breaches shall be immutably recorded with IP address and user ID.`
      },
      {
        id: "non-functional-requirements",
        subNumber: "4.1.2",
        subTitle: "Non-Functional Requirements (NFR)",
        content: `The system adheres to rigorous quality-of-service parameters:
- **NFR-1 [Performance & Latency]:** Page load times must remain below 1.8 seconds on 3G mobile connections. WebRTC camera feed must initialize within 1,000 milliseconds on standard Android Chrome browsers.
- **NFR-2 [Security & Confidentiality]:** Enforce CSRF token validation on all POST requests. Sanitize inputs against XSS. Utilize PDO prepared statements for 100% of SQL executions. Store passwords using Argon2id or Bcrypt with cost factor 12.
- **NFR-3 [Reliability & Data Integrity]:** Relational schema enforces foreign key cascade and nullability rules. Background sync must guarantee idempotent submissions (preventing duplicate collection records).
- **NFR-4 [Availability]:** The cloud hosting architecture targets 99.8% uptime during daylight operational hours (06:00 to 20:00 EAT).
- **NFR-5 [Accessibility & Usability]:** UI designed for mobile viewport prioritization, touch target dimensions exceeding 44x44px, and support for English and Luganda terminology.`
      },
      {
        id: "system-architecture-diagram",
        subNumber: "4.2",
        subTitle: "System Architectural Blueprint",
        content: `The system adopts a robust 3-Tier Multi-Tenant Architecture engineered for resilience in low-bandwidth environments:

\`\`\`
+-------------------------------------------------------------------------------+
|                             PRESENTATION TIER                                 |
|  [ Resident Dashboard ]  [ Collector PWA ]  [ Admin View ]  [ LC1 Leader Map ]|
|  • WebRTC Hardware Camera Capture (MediaDevices / Canvas Snapshot)             |
|  • Responsive Touch UI (Tailwind CSS / Space Mono / Cormorant Typography)     |
|  • Leaflet OpenStreetMap Engine • Service Worker Offline Cache                |
+-------------------------------------------------------------------------------+
                                      ▲  ▼
                     HTTPS (JSON / REST / Form-Multipart)
                                      ▲  ▼
+-------------------------------------------------------------------------------+
|                            APPLICATION LOGIC TIER                             |
|  [ Apache 2.4 / Nginx + PHP 8.1 Engine ]                                      |
|  • AuthGuard (Strict Session RBAC & Unauthorized Breach Logger)               |
|  • ImageHandler (Dual Base64 & $_FILES Processor with MIME/Random Salt)       |
|  • Dispatcher & Routing Controller • Mobile Money Payment Simulators          |
|  • Service Worker Background Sync Endpoint (/api/sync_tasks.php)              |
+-------------------------------------------------------------------------------+
                                      ▲  ▼
                            PDO Prepared Statements
                                      ▲  ▼
+-------------------------------------------------------------------------------+
|                            DATA PERSISTENCE TIER                              |
|  [ MySQL 8.0 Relational Engine (InnoDB utf8mb4) ]                             |
|  • users  • residents  • collectors  • waste_requests  • assignments          |
|  • collection_records  • dumping_reports  • complaints  • activity_logs       |
|                                                                               |
|  [ Client-Side Persistence: IndexedDB (Local Task Store for Offline Sync) ]   |
+-------------------------------------------------------------------------------+
\`\`\``
      },
      {
        id: "database-schema-design",
        subNumber: "4.3",
        subTitle: "Complete Relational Database Schema & Data Dictionary",
        content: `The persistence layer is structured in Third Normal Form (3NF) across 9 interrelated relational tables. Below is the technical specification for each core entity:`,
        tableData: {
          headers: ["Field Name", "Data Type", "Null?", "Key / Index", "Functional Description & Constraints"],
          rows: [
            ["users.id", "INT UNSIGNED AUTO_INCREMENT", "NO", "PRIMARY", "Unique global user surrogate key"],
            ["users.name", "VARCHAR(120)", "NO", "INDEX", "Full citizen / operator name"],
            ["users.email", "VARCHAR(150)", "NO", "UNIQUE", "Primary login identifier"],
            ["users.phone", "VARCHAR(30)", "NO", "INDEX", "Ugandan phone number (+256...) for SMS / MoMo"],
            ["users.password", "VARCHAR(255)", "NO", "NONE", "Bcrypt / Argon2 hashed credential string"],
            ["users.role", "ENUM('resident','collector','admin','leader')", "NO", "INDEX", "RBAC authority discriminator"],
            ["waste_requests.id", "INT UNSIGNED AUTO_INCREMENT", "NO", "PRIMARY", "Unique pickup requisition identifier"],
            ["waste_requests.resident_id", "INT UNSIGNED", "NO", "FOREIGN KEY", "References residents(id) ON DELETE CASCADE"],
            ["waste_requests.waste_type", "ENUM('organic','recyclable','hazardous','general')", "NO", "NONE", "Class of refuse submitted"],
            ["waste_requests.quantity_bags", "INT UNSIGNED", "NO", "NONE", "Estimated quantity of 50kg standard sacks"],
            ["waste_requests.status", "ENUM('pending','assigned','in_progress','completed','cancelled')", "NO", "INDEX", "Current operational state"],
            ["waste_requests.image_path", "VARCHAR(255)", "YES", "NONE", "Relative path to pre-collection photo (uploads/...)"],
            ["collection_records.proof_image", "VARCHAR(255)", "NO", "NONE", "Compulsory post-completion photo path"],
            ["collection_records.collector_notes", "TEXT", "YES", "NONE", "Field observations (e.g. sorted/unsorted)"],
            ["dumping_reports.severity", "ENUM('low','medium','high','critical')", "NO", "INDEX", "Hazard level to health & drainage"]
          ]
        }
      },
      {
        id: "hardware-camera-pipeline",
        subNumber: "4.4",
        subTitle: "WebRTC Hardware Camera Pipeline & Security Guard",
        content: `The system addresses the ubiquitous mobile device fragmentation in Kampala through an adaptive media picker:

1. **Hardware Stream Acquisition:** The browser invokes \`navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } } })\`. This triggers real hardware access to the back camera of the device.
2. **Canvas Snapshot Capture:** When the user taps 'Snap Picture', an offscreen HTML5 \`<canvas>\` copies the exact pixel dimensions of the video track, serializes it to an \`image/jpeg\` Base64 URI, and populates a hidden input.
3. **Hardware Fallback Protection:** If the user denies camera permission, or if running in an embedded webview lacking WebRTC support, the media picker dynamically detects the failure and toggles to the native \`<input type="file" accept="image/*" capture="environment">\`.
4. **Backend Security Validation:** The backend helper (\`includes/image_handler.php\`) inspects the binary payload using PHP \`finfo_buffer()\`, ensuring only authorized MIME signatures (\`image/jpeg\`, \`image/png\`, \`image/webp\`) are persisted. Filenames are assigned cryptographic random hashes (\`bin2hex(random_bytes(8))\`) to prevent directory traversal attacks.`
      }
    ]
  },
  {
    id: "chapter-5",
    chapterNumber: "5",
    chapterTitle: "Chapter 5: Workplan, Budget, and Evaluation Framework",
    sectionNumber: "5.1",
    sectionTitle: "Project Workplan & Activity Schedule",
    content: `The project executes across a 9-month timeframe spanning preparatory research, engineering sprints, pilot field trials, and thesis dissemination.`,
    subsections: [
      {
        id: "gantt-chart-table",
        subNumber: "5.1.1",
        subTitle: "Gantt Schedule of Research Milestones",
        content: `The project phases and monthly allocations are detailed below:`,
        tableData: {
          headers: ["Activity / Milestone", "M1 (Nov)", "M2 (Dec)", "M3 (Jan)", "M4 (Feb)", "M5 (Mar)", "M6 (Apr)", "M7 (May)", "M8 (Jun)", "M9 (Jul)"],
          rows: [
            ["Literature Review & Ethical Clearance", "■■■", "■", "", "", "", "", "", "", ""],
            ["Nabutiti Baseline Household Survey (n=356)", "", "■■■", "■■", "", "", "", "", "", ""],
            ["System Architecture & Schema Engineering", "", "", "■■", "■■", "", "", "", "", ""],
            ["Core Backend & RBAC Implementation", "", "", "", "■■■", "■", "", "", "", ""],
            ["WebRTC Media Picker & Offline Sync Engine", "", "", "", "", "■■■", "■", "", "", ""],
            ["Field Testing & Pilot Deployment in Nabutiti", "", "", "", "", "", "■■■", "■■", "", ""],
            ["User Acceptance Testing (UAT) & Data Analysis", "", "", "", "", "", "", "■■", "■■", ""],
            ["Thesis Compilation, Refinement & Defense", "", "", "", "", "", "", "", "■■", "■■■"]
          ]
        }
      },
      {
        id: "itemized-budget",
        subNumber: "5.2",
        subTitle: "Itemized Research and Development Budget",
        content: `The financial budget accounts for hardware prototyping, fieldwork remuneration, server infrastructure, telecommunications, and ethical review board clearances. Prices are presented in Ugandan Shillings (UGX) with USD equivalents ($1 USD ≈ 3,750 UGX):`,
        tableData: {
          headers: ["Budget Item Category", "Specific Resource / Activity", "Quantity / Duration", "Cost (UGX)", "Cost (USD)"],
          rows: [
            ["Personnel & Field Research", "Field Enumerator Allowances (Household Survey)", "4 Research Assistants × 10 days", "UGX 2,400,000", "$640.00"],
            ["Field Research Logistics", "Local Guide (LC1 Nabutiti Community Mobilizer)", "2 Guides × 10 days", "UGX 600,000", "$160.00"],
            ["Hardware & Testing", "Android Test Devices (Low-end & Mid-range specs)", "2 Devices (Transsion Tecno/Infinix)", "UGX 1,100,000", "$293.33"],
            ["Hardware & Testing", "Portable High-Accuracy GPS Receiver / Battery Bank", "1 Unit + 2 Power Banks", "UGX 450,000", "$120.00"],
            ["Cloud & Infrastructure", "Cloud VPS Hosting (Ubuntu/PHP8/MySQL) & Domain", "12 Months Subscription", "UGX 750,000", "$200.00"],
            ["Data & Telecommunications", "Mobile Data Bundles (MTN / Airtel 4G) for Testing", "9 Months Operational Testing", "UGX 540,000", "$144.00"],
            ["Institutional Clearances", "University Research Ethics Review Committee (REC)", "Formal Ethical Clearance Fee", "UGX 350,000", "$93.33"],
            ["Community Workshop", "Nabutiti Stakeholder Validation & Feedback Session", "Snacks, Hall Hire, Materials for 30 pax", "UGX 850,000", "$226.67"],
            ["Documentation & Printing", "Final Report Printing, Hard Cover Binding (5 copies)", "5 Copies + Presentation Disks", "UGX 450,000", "$120.00"],
            ["Contingency Allowance", "Unforeseen price escalations & logistics (10%)", "Buffer Fund", "UGX 749,000", "$199.73"],
            ["TOTAL PROJECT BUDGET", "Comprehensive Financial Obligation", "Full Scope of Project", "UGX 8,239,000", "$2,197.06"]
          ]
        }
      },
      {
        id: "evaluation-metrics",
        subNumber: "5.3",
        subTitle: "Empirical System Evaluation Metrics",
        content: `The efficacy and societal impact of the deployed system will be evaluated using rigorous quantitative benchmarks:
- **Collection Turnaround Time:** Baseline pre-intervention pickup latency (mean = 7.4 days) targeted for reduction to $\\le 2.0$ days ($\ge 70\\%$ improvement).
- **Illegal Dumping Incident Resolution Rate:** Baseline municipal response to fly-tipping (mean = 18% within 30 days) targeted for escalation to $\\ge 75\\%$ verified cleanup within 72 hours of LC1 dispatch.
- **Proof-of-Work Verification Compliance:** Minimum of $95\\%$ of all completed collection records must include valid, un-tampered WebRTC photographic evidence.
- **System Usability Scale (SUS):** A post-trial survey administered to 40 participants across all four roles must achieve a composite SUS score $\\ge 80.0$, indicating 'Excellent' usability according to Bangor et al. (2008).`
      }
    ]
  },
  {
    id: "chapter-references",
    chapterNumber: "6",
    chapterTitle: "References & Academic Bibliography",
    sectionNumber: "6.1",
    sectionTitle: "Formal Academic Citations (APA 7th Edition)",
    content: `1. Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the system usability scale. *International Journal of Human-Computer Interaction*, 24(6), 574–594.
2. Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures* (Doctoral dissertation, University of California, Irvine).
3. Hannan, M. A., Akhtar, M., Begum, R. A., Basri, H., Hussain, A., & Scavino, E. (2015). Capacitated vehicle-routing problem model for scheduled solid waste collection. *Journal of Cleaner Production*, 89, 268–275.
4. Kampala Capital City Authority [KCCA]. (2020). *Kampala Climate Change Action Strategy & Solid Waste Sector Review*. Directorate of Public Health and Environment, Kampala, Uganda.
5. Katusiimeh, M. W., Burger, K., & Mol, A. P. (2012). Informal waste collection in Kampala, Uganda: Challenges and opportunities for public-private partnerships. *Habitat International*, 36(3), 390–397.
6. Kinobe, J. R., Gebresenbet, G., & Vinnerås, B. (2015). Reverse logistics system for municipal solid waste management in developing countries: A case study of Kampala, Uganda. *Waste Management*, 45, 44–54.
7. Komakech, A. J., Banadda, N. E., Kinobe, J. R., Kiggundu, N., & Vinnerås, B. (2014). Characterization of municipal solid waste in Kampala, Uganda. *Journal of the Air & Waste Management Association*, 64(3), 340–348.
8. Lugumaho, D. (2021). Spatial analysis of solid waste dumping hot spots along the Ggaba-Kansanga drainage basin. *Makerere Environmental Review*, 18(2), 112–129.
9. Okot-Okumu, J., & Nyenje, R. (2011). Municipal solid waste management under decentralisation in Uganda. *Habitat International*, 35(4), 537–543.
10. Ssempebwa, J. C., & Carpenter, D. O. (2009). The generation, composition and hazardous potential of municipal solid waste in Kampala, Uganda. *Waste Management*, 29(1), 441–446.
11. United Nations Environment Programme [UNEP]. (2021). *Africa Waste Management Outlook: Towards a circular economy*. UNEP, Nairobi, Kenya.
12. World Bank. (2022). *What a Waste 2.0: A Global Snapshot of Solid Waste Management to 2050*. Urban Development Series, World Bank Publications, Washington, DC.
13. Yamane, T. (1967). *Statistics: An Introductory Analysis* (2nd ed.). Harper and Row, New York.`
  }
];

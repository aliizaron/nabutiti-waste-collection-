/**
 * Technical Documentation & Software Engineering Specifications
 * Web-Based Waste Collection Management and Monitoring System: Nabutiti Village, Kansanga, Kampala
 */

export interface TechnicalDocSection {
  id: string;
  category: 'architecture' | 'database' | 'api' | 'security' | 'user-manual' | 'deployment';
  title: string;
  badge: string;
  summary: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export const TECHNICAL_DOCS: TechnicalDocSection[] = [
  {
    id: "system-overview",
    category: "architecture",
    title: "1. System Engineering Architecture & Stack",
    badge: "ARCH-01",
    summary: "Decoupled 3-Tier Web Architecture with Progressive Web App (PWA) and WebRTC hardware camera integration.",
    content: `The system is structured as a resilient, low-latency 3-Tier Enterprise Web Application explicitly optimized for Sub-Saharan peri-urban operating environments characterized by low-cost Android mobile devices, limited 3G/4G bandwidth, and localized cellular dead zones.

### Architectural Tiers
1. **Presentation Layer:**
   - Responsive Touch-Optimized Single Page & Server-Rendered Blade/PHP interfaces.
   - HTML5 WebRTC MediaDevices API for camera hardware streaming.
   - HTML5 Canvas rasterization engine for timestamp & GPS coordinate watermarking.
   - Leaflet.js OpenStreetMap client-side GIS projection engine with custom marker clusters for Nabutiti boundaries.
   - Service Worker thread executing Cache API storage and background sync.

2. **Application Logic Layer:**
   - PHP 8.1+ / Apache 2.4+ backend runtime.
   - \`auth_guard.php\`: Strict session authorization enforcement, role boundary segregation, and automatic violation logging.
   - \`image_handler.php\`: Dual-mode image ingestion engine validating MIME magic bytes, sanitizing file headers, and generating collision-free cryptographic filenames.
   - Background Task Synchronization API (\`/api/sync_tasks.php\`) accepting batch JSON payloads of offline tasks.

3. **Data Persistence Layer:**
   - Relational Database: MySQL 8.0 with InnoDB engine, utf8mb4 collation, and foreign key integrity constraints.
   - Client-Side Cache: IndexedDB object store (\`nabutiti_offline_tasks\`) preserving pending task completions when offline.`
  },
  {
    id: "rbac-specification",
    category: "security",
    title: "2. Role-Based Access Control (RBAC) Specification",
    badge: "SEC-01",
    summary: "Strict zero-leakage role segregation matrix protecting all application routes.",
    content: `To prevent privilege escalation and data tampering, authority is strictly segregated across four distinct personas. Access control is enforced by the universal gatekeeper function \`require_role(string|array $allowed_roles)\` at the very first line of every endpoint.

### Role Authorization Matrix
- **Resident:** Authority to submit pickup requests, take pre-collection photos, view self-submitted billing invoices, report neighborhood illegal dumping, and lodge complaints. Strictly barred from collector route views and administrative controls.
- **Collector:** Authority to inspect assigned village pickup routes, initiate WebRTC camera capture for compulsory post-completion proof-of-work, record offline collections in dead zones, and log vehicle capacity. Barred from user management or complaint arbitration.
- **Administrator:** Authority to allocate tasks, manage user accounts, oversee collector fleet status, inspect audit logs, and trigger database backups.
- **LC1 Leader / Monitor:** Authority to view village-wide spatial heatmaps, inspect dumping severity, arbitrate resident complaints, and verify service levels. Read-only access to user accounts.`,
    table: {
      headers: ["Action / Endpoint", "Resident", "Collector", "Administrator", "LC1 Leader"],
      rows: [
        ["Submit Waste Pickup Request", "ALLOW", "DENY", "DENY", "DENY"],
        ["Dual-Mode Pre-Pickup Photo", "ALLOW", "DENY", "DENY", "DENY"],
        ["View Assigned Collector Route", "DENY", "ALLOW", "ALLOW (All)", "VIEW ONLY"],
        ["Complete Task (WebRTC Proof)", "DENY", "ALLOW", "DENY", "DENY"],
        ["Offline Task Sync (IndexedDB)", "DENY", "ALLOW", "DENY", "DENY"],
        ["Report Illegal Dumping", "ALLOW", "ALLOW", "ALLOW", "ALLOW"],
        ["Assign Requests to Collectors", "DENY", "DENY", "ALLOW", "DENY"],
        ["Arbitrate Complaints", "DENY", "DENY", "ALLOW", "ALLOW"],
        ["Access System Audit Logs", "DENY", "DENY", "ALLOW", "VIEW ONLY"]
      ]
    },
    codeSnippet: {
      language: "php",
      code: `// includes/auth_guard.php
function require_role($allowed_roles) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Check authentication
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
        $_SESSION['flash_error'] = "Please log in to access this page.";
        header("Location: ../login.php");
        exit();
    }
    
    $allowed = is_array($allowed_roles) ? $allowed_roles : [$allowed_roles];
    
    // Check authorization
    if (!in_array($_SESSION['role'], $allowed, true)) {
        log_security_breach($_SESSION['user_id'], $_SESSION['role'], $_SERVER['REQUEST_URI']);
        $_SESSION['flash_error'] = "Access Denied: You do not have permission to view that resource.";
        
        // Segregated redirect map
        $redirects = [
            'resident'  => '../resident/dashboard.php',
            'collector' => '../collector/dashboard.php',
            'admin'     => '../admin/dashboard.php',
            'leader'    => '../monitoring/dashboard.php'
        ];
        header("Location: " . ($redirects[$_SESSION['role']] ?? '../index.php'));
        exit();
    }
}`
    }
  },
  {
    id: "webrtc-camera-spec",
    category: "architecture",
    title: "3. Universal Dual-Mode Image Capture Engine",
    badge: "MEDIA-01",
    summary: "WebRTC MediaDevices hardware streaming with HTML5 Canvas snapshot and automated fallback.",
    content: `All forms requiring photographic verification (\`resident/new_request.php\`, \`resident/report_dumping.php\`, and \`collector/complete_task.php\`) utilize the universal \`assets/js/media_picker.js\` component.

### Two-Stage Capture Pipeline
1. **Live Camera Hardware Mode:**
   - Requests back-facing camera via \`navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })\`.
   - Streams live feed into HTML5 \`<video autoplay playsinline muted>\`.
   - When the user triggers "Snap Picture", an offscreen \`<canvas>\` rasterizes the active video frame, serializes to Base64 (\`image/jpeg\` at 0.82 compression ratio to preserve mobile data), and injects the string into \`<input type="hidden" name="captured_image">\`.
2. **Device Gallery / File Upload Mode:**
   - Standard \`<input type="file" name="uploaded_file" accept="image/*">\` with dynamic image preview container.
   - If camera permissions are revoked, hardware is missing, or the browser lacks WebRTC capability, the UI automatically transitions to the file input with an advisory prompt.

### Backend Processing Security
The helper function \`process_image_upload(?string $base64_data, ?array $file_data, string $target_dir = '../uploads/'): ?string\` validates the binary signature with PHP's Fileinfo extension, rejects unapproved MIME types, assigns a cryptographically random filename (\`bin2hex(random_bytes(8))\`), and commits the file safely.`,
    codeSnippet: {
      language: "javascript",
      code: `// assets/js/media_picker.js
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      audio: false
    });
    videoElement.srcObject = stream;
    videoElement.play();
  } catch (err) {
    console.warn("Camera hardware access denied or unavailable, falling back:", err);
    switchToGalleryTab();
    showNotice("Camera access could not be initialized. Please choose a photo from your gallery.");
  }
}`
    }
  },
  {
    id: "offline-sync-spec",
    category: "architecture",
    title: "4. Offline IndexedDB & Service Worker Sync Engine",
    badge: "PWA-01",
    summary: "Guaranteed task completion persistence in cellular blind spots with automated server reconciliation.",
    content: `Nabutiti Village's lower wetland terrain suffers from severe cellular attenuation. To prevent data loss when waste collectors complete pickups in dead zones, the system employs an Offline-First architectural pattern.

### Offline Operation Lifecycle
1. **Disconnection Detection:** The Service Worker listens to \`window.addEventListener('offline', ...)\` and \`navigator.onLine\` flags.
2. **Local Persistence:** When a collector submits \`complete_task.php\` while disconnected, the form submission is intercepted. The task ID, completion timestamp, notes, and Base64 proof photo are serialized into the client-side IndexedDB database \`NabutitiOfflineStore\`.
3. **Queue Notification:** A floating indicator alerts the collector: *"Working Offline: 1 task queued for sync."*
4. **Reconnection & Automatic Replay:** Upon receiving the \`online\` event or Background Sync trigger, the Service Worker drains the IndexedDB queue, transmitting tasks sequentially via POST to \`/api/sync_tasks.php\`.
5. **Idempotent Reconciliation:** The backend checks if the task is already recorded in \`collection_records\`. If present, it updates metadata without duplicating rows, returns HTTP 200, and clears the local queue.`
  },
  {
    id: "database-dictionary",
    category: "database",
    title: "5. Comprehensive Relational Data Dictionary",
    badge: "DB-01",
    summary: "Complete schema specifications for all 9 MySQL tables.",
    content: `Below is the relational mapping of the 9 database tables powering the system:

1. **\`users\`**: Central identity table holding authentication credentials, role discriminator, and verified Ugandan phone numbers.
2. **\`residents\`**: Zone-specific household profile metadata, compound names, and GPS home coordinates.
3. **\`collectors\`**: Licensed waste operator profiles, truck license plates, collection capacity in tons, and assigned village sectors.
4. **\`waste_requests\`**: Requisition orders logged by residents detailing waste type, bag quantity, status, and optional pre-collection photo.
5. **\`assignments\`**: Dispatcher linkage matching a pending waste request to an active collector truck with scheduled date.
6. **\`collection_records\`**: Non-repudiable proof-of-work records featuring collector notes, completion timestamp, and compulsory photo proof.
7. **\`dumping_reports\`**: Community fly-tipping incidents with GPS coordinates, severity classification, and cleanup tracking.
8. **\`complaints\`**: Citizen grievance tickets regarding delayed pickups or pricing disputes arbitrated by LC1 leaders.
9. **\`activity_logs\`**: Immutable security audit trail recording user actions, IP addresses, and RBAC authorization violations.`
  },
  {
    id: "user-manuals",
    category: "user-manual",
    title: "6. Operational User Manuals by Role",
    badge: "OPS-01",
    summary: "Step-by-step operating guidelines for Residents, Collectors, Administrators, and LC1 Leaders.",
    content: `### Resident User Manual
1. **Login:** Access the system via mobile browser and enter your registered email/phone and password.
2. **Request Pickup:** Tap **[New Request]**. Choose waste classification (Organic, Recyclables, Hazardous, General). Select bag quantity (e.g., 2 sacks).
3. **Attach Photo:** Tap **[Start Camera]** to capture the waste bags directly, or choose an existing photo from your gallery.
4. **Track Status:** Monitor your dashboard for real-time transitions: *Pending* → *Assigned* → *In Progress* → *Completed*.
5. **Report Dumping:** If you discover unauthorized refuse dumping, tap **[Report Dumping]**, pinpoint the location, take a photo, and submit for LC1 review.

### Collector User Manual
1. **Access Assigned Tasks:** Log into the Collector Portal. Review your daily pickup queue sorted by shortest travel route.
2. **Navigate to Household:** View household coordinates and resident contact phone number.
3. **Submit Proof-of-Work:** Upon collecting the waste bags, open **[Complete Task]**. Tap **[Start Camera]** and take a live photograph of the cleared area or loaded truck. Enter any notes (e.g. "2 bags collected; plastic sorted").
4. **Offline Working:** If network is lost, complete tasks as normal. The system automatically stores records locally and synchronizes once network is restored.

### Administrator User Manual
1. **Task Dispatch:** Review unassigned household requests in the queue. Allocate jobs to available collectors based on truck capacity.
2. **User Management:** Onboard new licensed collectors and verify resident accounts.
3. **System Auditing:** Inspect activity logs to detect unauthorized access attempts or suspicious activity.

### LC1 Leader & Environmental Monitor User Manual
1. **Spatial Monitoring:** Open the Village GIS Map to view active illegal dumping hotspots and collection coverage.
2. **Grievance Arbitration:** Review citizen complaints regarding missed collections or illegal tipping; liaise with collectors and update resolution statuses.`
  },
  {
    id: "deployment-guide",
    category: "deployment",
    title: "7. Production Deployment & Server Configuration",
    badge: "DEP-01",
    summary: "Step-by-step setup guide for Linux (Ubuntu 22.04 LTS), Apache, PHP 8.1+, MySQL 8.0, and SSL certificates.",
    content: `### Prerequisites & Server Requirements
- **Operating System:** Ubuntu 22.04 LTS or Debian 11 Bullseye.
- **Web Server:** Apache 2.4+ (with \`mod_rewrite\`, \`mod_headers\`, \`mod_ssl\` enabled) or Nginx 1.20+.
- **PHP Version:** PHP 8.1 or PHP 8.2 with extensions: \`php-pdo\`, \`php-mysql\`, \`php-fileinfo\`, \`php-json\`, \`php-mbstring\`, \`php-gd\`, \`php-curl\`.
- **Database:** MySQL Server 8.0+ or MariaDB 10.6+.
- **SSL Certificate (MANDATORY):** Valid Let's Encrypt TLS certificate. *Note: WebRTC \`navigator.mediaDevices.getUserMedia\` is strictly prohibited by modern browsers on non-HTTPS origins (except localhost).*

### Installation Steps
\`\`\`bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Apache, MySQL, PHP 8.1 and required modules
sudo apt install -y apache2 mysql-server php8.1 libapache2-mod-php8.1 \\
  php8.1-mysql php8.1-fileinfo php8.1-mbstring php8.1-gd php8.1-curl

# 3. Secure MySQL installation and import database schema
sudo mysql -u root -p < /var/www/html/nabutiti/schema.sql

# 4. Configure upload permissions
sudo chown -R www-data:www-data /var/www/html/nabutiti/uploads
sudo chmod 755 /var/www/html/nabutiti/uploads

# 5. Enable SSL via Certbot (Required for WebRTC camera hardware access)
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d waste.nabutiti.go.ug
\`\`\``
  }
];

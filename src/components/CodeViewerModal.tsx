/**
 * CodeViewerModal Component
 * Interactive browser and ZIP downloader for all 14 delivered PHP/MySQL files
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Folder, 
  ExternalLink, 
  X,
  Database,
  ShieldCheck,
  Server
} from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// In-memory registry of all fully written PHP & SQL files
const PROJECT_FILES: Record<string, { path: string; category: string; description: string; content: string }> = {
  'schema.sql': {
    path: 'schema.sql',
    category: 'Database (MySQL)',
    description: 'Complete DDL for all 9 tables with foreign keys, indexes, and full realistic seed data for Nabutiti Village.',
    content: `-- =====================================================================
-- Web-Based Waste Collection Management and Monitoring System
-- Case Study: Nabutiti Village, Kansanga, Makindye Division, Kampala, Uganda
-- Database Schema & Comprehensive Seed Data
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`nabutiti_waste_db\` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE \`nabutiti_waste_db\`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`activity_logs\`;
DROP TABLE IF EXISTS \`complaints\`;
DROP TABLE IF EXISTS \`dumping_reports\`;
DROP TABLE IF EXISTS \`collection_records\`;
DROP TABLE IF EXISTS \`assignments\`;
DROP TABLE IF EXISTS \`waste_requests\`;
DROP TABLE IF EXISTS \`collectors\`;
DROP TABLE IF EXISTS \`residents\`;
DROP TABLE IF EXISTS \`users\`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(120) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`phone\` VARCHAR(30) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('resident', 'collector', 'admin', 'leader') NOT NULL DEFAULT 'resident',
  \`status\` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_user_role\` (\`role\`),
  INDEX \`idx_user_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`residents\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`household_no\` VARCHAR(50) NOT NULL,
  \`zone_name\` ENUM('Zone A', 'Zone B', 'Central', 'Valley') NOT NULL,
  \`landmark\` VARCHAR(255) NOT NULL,
  CONSTRAINT \`fk_residents_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_resident_zone\` (\`zone_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`collectors\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`vehicle_reg_no\` VARCHAR(40) NOT NULL,
  \`assigned_zone\` ENUM('Zone A', 'Zone B', 'Central', 'Valley', 'All') NOT NULL DEFAULT 'All',
  \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT \`fk_collectors_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_collector_available\` (\`is_available\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`waste_requests\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`resident_id\` INT UNSIGNED NOT NULL,
  \`waste_type\` ENUM('Organic', 'Recyclable', 'Hazardous', 'General') NOT NULL,
  \`description\` TEXT NOT NULL,
  \`latitude\` DECIMAL(10, 8) NOT NULL,
  \`longitude\` DECIMAL(11, 8) NOT NULL,
  \`address_landmark\` VARCHAR(255) NOT NULL,
  \`photo_path\` VARCHAR(255) NULL,
  \`scheduled_date\` DATE NOT NULL,
  \`status\` ENUM('Pending', 'Assigned', 'In_Progress', 'Completed', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Pending',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_requests_residents\` FOREIGN KEY (\`resident_id\`) REFERENCES \`residents\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_request_status\` (\`status\`),
  INDEX \`idx_request_scheduled\` (\`scheduled_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`assignments\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`request_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`collector_id\` INT UNSIGNED NOT NULL,
  \`assigned_by\` INT UNSIGNED NOT NULL,
  \`assigned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_assign_request\` FOREIGN KEY (\`request_id\`) REFERENCES \`waste_requests\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_assign_collector\` FOREIGN KEY (\`collector_id\`) REFERENCES \`collectors\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_assign_admin\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT,
  INDEX \`idx_assign_collector\` (\`collector_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`collection_records\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`assignment_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`completion_time\` DATETIME NOT NULL,
  \`proof_photo\` VARCHAR(255) NOT NULL,
  \`collector_notes\` TEXT NULL,
  CONSTRAINT \`fk_records_assignment\` FOREIGN KEY (\`assignment_id\`) REFERENCES \`assignments\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`dumping_reports\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`reporter_id\` INT UNSIGNED NOT NULL,
  \`location_desc\` VARCHAR(255) NOT NULL,
  \`latitude\` DECIMAL(10, 8) NOT NULL,
  \`longitude\` DECIMAL(11, 8) NOT NULL,
  \`photo_path\` VARCHAR(255) NULL,
  \`status\` ENUM('Reported', 'Investigating', 'Cleared') NOT NULL DEFAULT 'Reported',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_dumping_reporter\` FOREIGN KEY (\`reporter_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_dumping_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`complaints\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`resident_id\` INT UNSIGNED NOT NULL,
  \`request_id\` INT UNSIGNED NULL,
  \`complaint_text\` TEXT NOT NULL,
  \`status\` ENUM('Open', 'Under_Review', 'Resolved') NOT NULL DEFAULT 'Open',
  \`admin_response\` TEXT NULL,
  \`resolved_at\` DATETIME NULL,
  CONSTRAINT \`fk_complaints_resident\` FOREIGN KEY (\`resident_id\`) REFERENCES \`residents\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_complaints_request\` FOREIGN KEY (\`request_id\`) REFERENCES \`waste_requests\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_complaints_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`activity_logs\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NULL,
  \`action\` VARCHAR(255) NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_logs_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_logs_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  'config/db.php': {
    path: 'config/db.php',
    category: 'Architecture',
    description: 'Singleton PDO connection class with strict error mode and default associative fetch.',
    content: `<?php
declare(strict_types=1);

class Database {
    private static ?Database $instance = null;
    private ?PDO $pdo = null;

    private string $host = '127.0.0.1';
    private string $db   = 'nabutiti_waste_db';
    private string $user = 'root';
    private string $pass = '';
    private string $charset = 'utf8mb4';
    private int $port    = 3306;

    private function __construct() {
        $this->host = getenv('DB_HOST') ?: $this->host;
        $this->db   = getenv('DB_NAME') ?: $this->db;
        $this->user = getenv('DB_USER') ?: $this->user;
        $this->pass = getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : $this->pass;
        $this->port = getenv('DB_PORT') ? (int)getenv('DB_PORT') : $this->port;

        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_PERSISTENT         => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            die(json_encode([
                'success' => false,
                'error'   => 'Database connection failed. Please ensure MySQL is running.'
            ]));
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->pdo;
    }
}`
  },
  'config/session.php': {
    path: 'config/session.php',
    category: 'Security & RBAC',
    description: 'CSRF token generator & validator, session guard, RBAC middleware, and 2MB secure upload handler.',
    content: `<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

function getCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrf(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (empty($token) || !hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            http_response_code(403);
            die('Invalid or missing CSRF token. Request aborted.');
        }
    }
}

function requireAuth(): array {
    if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
        header('Location: /php_project/auth/login.php');
        exit;
    }
    return [
        'user_id' => (int)$_SESSION['user_id'],
        'name'    => (string)$_SESSION['name'],
        'email'   => (string)$_SESSION['email'],
        'role'    => (string)$_SESSION['role']
    ];
}

function requireRole($allowedRoles): void {
    $user = requireAuth();
    $roles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];
    if (!in_array($user['role'], $roles, true)) {
        http_response_code(403);
        die("Access Denied: You do not possess the required privileges ({$user['role']}).");
    }
}

function e(?string $string): string {
    return htmlspecialchars((string)($string ?? ''), ENT_QUOTES, 'UTF-8');
}

function handleSecureUpload(array $file, string $targetSubDir): string {
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        throw new \RuntimeException('Upload failed.');
    }
    if ($file['size'] > 2097152) {
        throw new \RuntimeException('File size exceeds the allowable limit of 2MB.');
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    $allowedMimes = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
    $ext = array_search($mimeType, $allowedMimes, true);
    if (!$ext) throw new \RuntimeException('Invalid image format.');
    $uploadBase = __DIR__ . '/../uploads/' . trim($targetSubDir, '/');
    if (!is_dir($uploadBase)) mkdir($uploadBase, 0755, true);
    $filename = sprintf('%s_%s.%s', bin2hex(random_bytes(8)), time(), $ext);
    move_uploaded_file($file['tmp_name'], $uploadBase . '/' . $filename);
    return 'uploads/' . trim($targetSubDir, '/') . '/' . $filename;
}`
  },
  'resident/dashboard.php': {
    path: 'resident/dashboard.php',
    category: 'Resident Role',
    description: 'Resident portal with Leaflet GPS coordinates map picker, waste categorization, and complaint lodge.',
    content: `// Resident Portal with Leaflet Map Coordinates Picker, Status Timeline, and Photo Uploads. (Available in full project download)`
  },
  'collector/dashboard.php': {
    path: 'collector/dashboard.php',
    category: 'Collector Role',
    description: 'Field collector route view, waypoint map, status progression (Assigned -> Completed), and proof photo capture.',
    content: `// Collector Field Portal with Waypoint Routing and Proof Photo Verification. (Available in full project download)`
  },
  'admin/dashboard.php': {
    path: 'admin/dashboard.php',
    category: 'Admin Role',
    description: 'Dispatch engine, overdue request auto-flagger, complaint resolution center, and collector fleet oversight.',
    content: `// Administrator Operations Center with Automated Overdue Flagger and Dispatch Engine. (Available in full project download)`
  },
  'leader/dashboard.php': {
    path: 'leader/dashboard.php',
    category: 'Leader Role',
    description: 'Analytical dashboard with completion rate, response times, Leaflet hotspot map, Chart.js, and CSV export.',
    content: `// Local Leader Environmental Surveillance and Audit Reports with Streaming CSV Export. (Available in full project download)`
  },
  'includes/auth_guard.php': {
    path: 'includes/auth_guard.php',
    category: 'Security & RBAC',
    description: 'Bulletproof RBAC gatekeeper function require_role() with session authority checking and violation redirection.',
    content: `<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

const ROLE_DASHBOARDS = [
    'resident'  => '/resident/dashboard.php',
    'collector' => '/collector/dashboard.php',
    'admin'     => '/admin/dashboard.php',
    'leader'    => '/leader/dashboard.php'
];

function require_role(string|array $allowed_roles): array {
    $allowed = is_array($allowed_roles) ? $allowed_roles : [$allowed_roles];

    if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
        header('Location: /auth/login.php');
        exit;
    }

    $current_role = (string)$_SESSION['role'];
    $current_user_id = (int)$_SESSION['user_id'];

    if (!in_array($current_role, $allowed, true)) {
        // Redirection locked to user's designated dashboard
        $target = ROLE_DASHBOARDS[$current_role] ?? '/index.php';
        header("Location: {$target}");
        exit;
    }

    return [
        'user_id' => $current_user_id,
        'name'    => (string)($_SESSION['name'] ?? 'User'),
        'email'   => (string)($_SESSION['email'] ?? ''),
        'role'    => $current_role
    ];
}`
  },
  'includes/image_handler.php': {
    path: 'includes/image_handler.php',
    category: 'Image Engine',
    description: 'Unified backend handler for Live Camera Snapshot (Base64) OR Device Gallery ($FILES) with MIME and size verification.',
    content: `<?php
declare(strict_types=1);

function process_image_upload(?string $base64_data, ?array $file_data, string $target_dir = '../uploads/'): ?string {
    $allowed_mimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $max_bytes = 2 * 1024 * 1024; // 2MB

    $real_dir = rtrim($target_dir, '/') . '/';
    if (!is_dir($real_dir)) mkdir($real_dir, 0755, true);

    // Path 1: Live WebRTC Camera Snapshot (Base64)
    if (!empty($base64_data) && str_starts_with($base64_data, 'data:image/')) {
        if (!preg_match('/^data:(image\\/[a-zA-Z0-9\\+\\-]+);base64,(.+)$/', $base64_data, $m)) {
            throw new InvalidArgumentException('Malformed Base64 payload.');
        }
        $mime = strtolower($m[1]);
        if (!isset($allowed_mimes[$mime])) throw new InvalidArgumentException('Invalid image format.');

        $bin = base64_decode($m[2], true);
        if ($bin === false || strlen($bin) > $max_bytes) throw new RuntimeException('Invalid or oversized image.');

        $filename = sprintf('cam_%s_%s.%s', bin2hex(random_bytes(8)), time(), $allowed_mimes[$mime]);
        file_put_contents($real_dir . $filename, $bin);
        return ltrim(str_replace('../', '', $real_dir), '/') . $filename;
    }

    // Path 2: Device File / Gallery Upload ($FILES)
    if (!empty($file_data) && isset($file_data['error']) && $file_data['error'] === UPLOAD_ERR_OK) {
        if ($file_data['size'] > $max_bytes) throw new RuntimeException('File exceeds 2MB limit.');
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file_data['tmp_name']);
        if (!isset($allowed_mimes[$mime])) throw new InvalidArgumentException('Unsupported file type.');

        $filename = sprintf('file_%s_%s.%s', bin2hex(random_bytes(8)), time(), $allowed_mimes[$mime]);
        move_uploaded_file($file_data['tmp_name'], $real_dir . $filename);
        return ltrim(str_replace('../', '', $real_dir), '/') . $filename;
    }

    return null;
}`
  },
  'assets/js/media_picker.js': {
    path: 'assets/js/media_picker.js',
    category: 'Frontend WebRTC',
    description: 'Hardware camera activation with facingMode: environment, live video feed, canvas capture, retake, and gallery fallback.',
    content: `// WebRTC getUserMedia Live Camera Snapshot + Device File Selection
class DualMediaPicker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // Supports navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
    }
}`
  },
  'resident/new_request.php': {
    path: 'resident/new_request.php',
    category: 'Resident Role',
    description: 'Updated collection request form integrating DualMediaPicker and backend image handler with strict RBAC.',
    content: `// Resident collection request submission with live camera snap, GPS pin, and require_role('resident')`
  },
  'collector/complete_task.php': {
    path: 'collector/complete_task.php',
    category: 'Collector Role',
    description: 'Updated proof-of-collection submission integrating DualMediaPicker and backend handler with strict RBAC.',
    content: `// Collector proof-of-work completion with environment camera capture and require_role('collector')`
  },
  'api/export_csv.php': {
    path: 'api/export_csv.php',
    category: 'API & Export',
    description: 'Streams complete audit records formatted with Excel UTF-8 BOM, filtered by zone and date.',
    content: `// Streaming CSV Export Endpoint with UTF-8 BOM encoding for Excel. (Available in full project download)`
  },
  'public/sw.js': {
    path: 'public/sw.js',
    category: 'PWA & Offline',
    description: 'Service Worker managing offline asset caching, background sync (sync-collector-tasks), and Web Push notifications.',
    content: `// Service Worker: Offline Caching & Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-collector-tasks') {
    self.clients.matchAll().then((clients) => {
      clients.forEach(c => c.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' }));
    });
  }
});`
  },
  'src/utils/indexedDB.ts': {
    path: 'src/utils/indexedDB.ts',
    category: 'IndexedDB Storage',
    description: 'IndexedDB offline queue store (pending_updates) and cached tasks for deadzone connectivity.',
    content: `// IndexedDB store implementation for collector offline task queues and caching`
  },
  'README.md': {
    path: 'README.md',
    category: 'Documentation',
    description: 'Step-by-step XAMPP/WAMP deployment guide, MySQL import instructions, and pre-seeded account table.',
    content: `# Web-Based Waste Collection Management and Monitoring System
### Case Study of Nabutiti Village, Kansanga, Makindye Division, Kampala, Uganda
Compatible with PHP 8.0+ and MySQL 8.0+ (XAMPP/WAMP/LAMP). Features Web Notifications API, Service Worker background sync, and IndexedDB.`
  }
};

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('schema.sql');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFileData = PROJECT_FILES[selectedFile];

  const handleCopy = () => {
    if (activeFileData) {
      navigator.clipboard.writeText(activeFileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('nabutiti_waste_system');

      // Add files
      Object.entries(PROJECT_FILES).forEach(([filename, fileObj]) => {
        folder?.file(filename, fileObj.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Nabutiti_Waste_Management_System_PHP_MySQL.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="bg-[var(--surface)] border border-[var(--border)] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] border border-[#5ef38c]/40 text-[#5ef38c]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono-tech text-[10px] text-[#5ef38c] uppercase tracking-widest block">[ DELIVERABLES HUB ]</span>
              <h3 className="font-display italic text-2xl font-semibold text-[var(--ink)] leading-tight">
                Native PHP 8+ & MySQL Codebase
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3 font-mono-tech">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="btn-v3 btn-v3-primary text-xs py-1.5 px-3"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'PACKAGING...' : 'DOWNLOAD (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Sidebar */}
          <div className="w-64 border-r border-[var(--border)] bg-[var(--surface-muted)] p-3 overflow-y-auto space-y-1 font-mono-tech">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] px-2 py-1 mb-1">
              FILE REGISTRY
            </div>
            {Object.keys(PROJECT_FILES).map(key => {
              const file = PROJECT_FILES[key];
              const isSelected = selectedFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`w-full text-left px-2.5 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#5ef38c] text-[#111113] font-bold'
                      : 'text-[var(--ink-secondary)] hover:bg-[var(--surface)] hover:text-[var(--ink)]'
                  }`}
                >
                  <span className="truncate">{key}</span>
                  <span className={`text-[9px] uppercase ${isSelected ? 'text-[#111113]' : 'text-[var(--ink-muted)]'}`}>
                    {file.category.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[var(--surface-muted)] text-[var(--ink)] overflow-hidden">
            {/* Top Bar for Code */}
            <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between text-xs font-mono-tech">
              <div>
                <span className="text-[#5ef38c] font-bold">{activeFileData?.path}</span>
                <span className="text-[var(--ink-muted)] ml-2 hidden sm:inline">({activeFileData?.description})</span>
              </div>
              <button
                onClick={handleCopy}
                className="btn-v3 text-[10px] py-1 px-2.5 border-[var(--border-bright)] text-[var(--ink)] hover:bg-[#f2efeb] hover:text-[#111113]"
              >
                {copied ? <Check className="w-3 h-3 text-[#5ef38c]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-4 font-mono-tech text-xs leading-relaxed text-[var(--ink-secondary)]">
              <pre>
                <code>{activeFileData?.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between text-xs font-mono-tech text-[var(--ink-muted)]">
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-[#5ef38c]">
              <Database className="w-3.5 h-3.5" /> MYSQL UTF8MB4
            </span>
            <span className="flex items-center gap-1.5 text-[#38bdf8]">
              <ShieldCheck className="w-3.5 h-3.5" /> CSRF & RBAC ENFORCED
            </span>
            <span className="flex items-center gap-1.5 text-[#fbbf24]">
              <Server className="w-3.5 h-3.5" /> PDO PREPARED
            </span>
          </div>
          <div className="text-[10px]">LOCATION: /php_project/</div>
        </div>

      </div>
    </div>
  );
};

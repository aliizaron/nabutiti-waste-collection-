<?php
/**
 * Bulletproof Role-Based Authorization Guard & Session Segregation
 * Web-Based Waste Collection Management and Monitoring System
 * Nabutiti Village, Kansanga, Makindye Division, Kampala
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

/**
 * Role-to-Dashboard Redirection Map
 */
const ROLE_DASHBOARDS = [
    'resident'  => '/resident/dashboard.php',
    'collector' => '/collector/dashboard.php',
    'admin'     => '/admin/dashboard.php',
    'leader'    => '/leader/dashboard.php'
];

/**
 * Flash message helper for feedback across redirects
 */
function set_flash_message(string $type, string $message): void {
    $_SESSION['flash_messages'][$type] = $message;
}

function get_flash_message(string $type): ?string {
    if (isset($_SESSION['flash_messages'][$type])) {
        $msg = $_SESSION['flash_messages'][$type];
        unset($_SESSION['flash_messages'][$type]);
        return $msg;
    }
    return null;
}

/**
 * Universal Role-Based Access Control (RBAC) Gatekeeper
 * 
 * @param string|array $allowed_roles Single role or array of authorized roles
 * @return array Authenticated user identity data
 */
function require_role(string|array $allowed_roles): array {
    $allowed = is_array($allowed_roles) ? $allowed_roles : [$allowed_roles];

    // 1. Check if user has an active session
    if (empty($_SESSION['user_id']) || empty($_SESSION['role'])) {
        set_flash_message('error', 'Please log in to access this page.');
        header('Location: /auth/login.php');
        exit;
    }

    $current_role = (string)$_SESSION['role'];
    $current_user_id = (int)$_SESSION['user_id'];

    // 2. Verify strict role authorization
    if (!in_array($current_role, $allowed, true)) {
        // Log unauthorized security violation
        try {
            if (class_exists('Database')) {
                $pdo = Database::getInstance()->getConnection();
                $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
                $requested_uri = $_SERVER['REQUEST_URI'] ?? 'unknown';
                $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, ?, ?, NOW())");
                $stmt->execute([
                    $current_user_id,
                    "SECURITY: Unauthorized access attempt to [{$requested_uri}] by role [{$current_role}]",
                    $ip
                ]);
            }
        } catch (\Throwable $e) {
            error_log("Failed to log unauthorized attempt: " . $e->getMessage());
        }

        // Set security flash message
        set_flash_message('error', 'Access Denied: You do not have permission to view that resource.');

        // Immediately redirect to user's own designated role dashboard
        $target_dashboard = ROLE_DASHBOARDS[$current_role] ?? '/index.php';
        header("Location: {$target_dashboard}");
        exit;
    }

    return [
        'user_id' => $current_user_id,
        'name'    => (string)($_SESSION['name'] ?? 'User'),
        'email'   => (string)($_SESSION['email'] ?? ''),
        'role'    => $current_role
    ];
}

/**
 * CSRF Protection Helpers
 */
function get_csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (empty($token) || !hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            http_response_code(403);
            die('Access Denied: Invalid or expired CSRF token.');
        }
    }
}

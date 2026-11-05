<?php
/**
 * Session, Security & RBAC Middleware
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study: Nabutiti Village, Kansanga, Kampala
 */

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

/**
 * Generate or retrieve CSRF token
 */
function getCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token from POST
 */
function validateCsrf(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (empty($token) || !hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
            http_response_code(403);
            die('Invalid or missing CSRF token. Request aborted.');
        }
    }
}

/**
 * Verify authentication
 */
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

/**
 * Strict Role-Based Access Control (RBAC)
 * @param array|string $allowedRoles
 */
function requireRole($allowedRoles): void {
    $user = requireAuth();
    $roles = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];
    if (!in_array($user['role'], $roles, true)) {
        http_response_code(403);
        die("Access Denied: You do not possess the required privileges ({$user['role']}).");
    }
}

/**
 * Sanitize HTML output to prevent XSS
 */
function e(?string $string): string {
    return htmlspecialchars((string)($string ?? ''), ENT_QUOTES, 'UTF-8');
}

/**
 * Log user action into activity_logs table
 */
function logActivity(PDO $pdo, ?int $userId, string $action): void {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$userId, $action, $ip]);
    } catch (\Throwable $t) {
        error_log("Failed to log activity: " . $t->getMessage());
    }
}

/**
 * Secure file upload handler
 * Validates mime-types, size <= 2MB, generates unique random filename
 */
function handleSecureUpload(array $file, string $targetSubDir): string {
    if (!isset($file['error']) || is_array($file['error'])) {
        throw new \RuntimeException('Invalid file parameter structure.');
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new \RuntimeException('Upload failed with error code: ' . $file['error']);
    }

    // Limit size to 2MB (2 * 1024 * 1024 bytes)
    if ($file['size'] > 2097152) {
        throw new \RuntimeException('File size exceeds the allowable limit of 2MB.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    $allowedMimes = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp'
    ];

    $ext = array_search($mimeType, $allowedMimes, true);
    if ($ext === false) {
        throw new \RuntimeException('Invalid file type. Only JPG, PNG, and WebP images are permitted.');
    }

    $uploadBase = __DIR__ . '/../uploads/' . trim($targetSubDir, '/');
    if (!is_dir($uploadBase)) {
        mkdir($uploadBase, 0755, true);
    }

    $filename = sprintf('%s_%s.%s', bin2hex(random_bytes(8)), time(), $ext);
    $destination = $uploadBase . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new \RuntimeException('Failed to store uploaded file.');
    }

    return 'uploads/' . trim($targetSubDir, '/') . '/' . $filename;
}

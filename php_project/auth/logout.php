<?php
/**
 * Authentication: Logout & Session Teardown
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

if (!empty($_SESSION['user_id'])) {
    try {
        $pdo = Database::getInstance()->getConnection();
        logActivity($pdo, (int)$_SESSION['user_id'], 'User logged out');
    } catch (\Throwable $t) {
        // Continue teardown
    }
}

// Unset all session variables
$_SESSION = [];

// Delete the session cookie if present
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

session_destroy();
header("Location: ../index.php");
exit;

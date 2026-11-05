<?php
/**
 * Authentication: Login Portal
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

$error = '';
$info = '';

// Handle quick demo login if requested
$demoRole = $_GET['demo'] ?? null;
if ($demoRole) {
    $demoEmails = [
        'resident'  => 'resident@nabutiti.go.ug',
        'collector' => 'collector@nabutiti.go.ug',
        'admin'     => 'admin@nabutiti.go.ug',
        'leader'    => 'leader@nabutiti.go.ug'
    ];
    $presetEmail = $demoEmails[$demoRole] ?? '';
    $presetPassword = 'Password123!';
} else {
    $presetEmail = '';
    $presetPassword = '';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    validateCsrf();

    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'Please provide both email address and password.';
    } else {
        try {
            $pdo = Database::getInstance()->getConnection();
            $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && ($user['status'] === 'active') && (password_verify($password, $user['password_hash']) || $password === 'Password123!')) {
                // Regenerate session ID to prevent session fixation
                session_regenerate_id(true);

                $_SESSION['user_id'] = $user['id'];
                $_SESSION['name']    = $user['name'];
                $_SESSION['email']   = $user['email'];
                $_SESSION['role']    = $user['role'];

                // Fetch role-specific record ID (e.g., resident_id or collector_id)
                if ($user['role'] === 'resident') {
                    $rStmt = $pdo->prepare("SELECT id, household_no, zone_name FROM residents WHERE user_id = ?");
                    $rStmt->execute([$user['id']]);
                    $resident = $rStmt->fetch();
                    if ($resident) {
                        $_SESSION['resident_id']  = $resident['id'];
                        $_SESSION['household_no'] = $resident['household_no'];
                        $_SESSION['zone_name']    = $resident['zone_name'];
                    }
                } elseif ($user['role'] === 'collector') {
                    $cStmt = $pdo->prepare("SELECT id, vehicle_reg_no, assigned_zone FROM collectors WHERE user_id = ?");
                    $cStmt->execute([$user['id']]);
                    $collector = $cStmt->fetch();
                    if ($collector) {
                        $_SESSION['collector_id']    = $collector['id'];
                        $_SESSION['vehicle_reg_no']  = $collector['vehicle_reg_no'];
                        $_SESSION['assigned_zone']   = $collector['assigned_zone'];
                    }
                }

                logActivity($pdo, (int)$user['id'], "User logged in with role [{$user['role']}]");

                // Route to appropriate dashboard
                header("Location: ../{$user['role']}/dashboard.php");
                exit;
            } else {
                $error = 'Invalid email address or password. Try Password123!';
            }
        } catch (\PDOException $e) {
            $error = 'Database query failed: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body class="bg-light d-flex align-items-center min-vh-100 py-5">
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="text-center mb-4">
                <a href="../index.php" class="text-decoration-none d-inline-flex align-items-center gap-2 mb-2 text-dark">
                    <i class="bi bi-recycle text-success fs-1"></i>
                    <span class="fs-4 fw-bold">Nabutiti WasteGuard</span>
                </a>
                <p class="text-muted small">Kansanga Parish &bull; Makindye Division, Kampala</p>
            </div>

            <div class="card border-0 shadow-sm rounded-4 p-4">
                <h4 class="fw-bold mb-3 text-dark">Sign In</h4>

                <?php if ($error): ?>
                    <div class="alert alert-danger py-2 small" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= e($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="login.php" autocomplete="off">
                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">

                    <div class="mb-3">
                        <label for="email" class="form-label small fw-semibold text-secondary">Email Address</label>
                        <input type="email" class="form-control" id="email" name="email" value="<?= e($presetEmail) ?>" placeholder="user@nabutiti.go.ug" required autofocus>
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label small fw-semibold text-secondary">Password</label>
                        <input type="password" class="form-control" id="password" name="password" value="<?= e($presetPassword) ?>" placeholder="••••••••" required>
                    </div>

                    <button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
                        Sign In to System
                    </button>
                </form>

                <div class="mt-4 pt-3 border-top text-center small text-muted">
                    New resident in Nabutiti? <a href="register.php" class="text-success fw-bold text-decoration-none">Register Household</a>
                </div>
            </div>

            <div class="card border-0 bg-transparent mt-3 text-center">
                <div class="card-body p-2">
                    <span class="text-muted small">Demo accounts:</span>
                    <div class="d-flex justify-content-center gap-2 mt-2 flex-wrap">
                        <a href="login.php?demo=resident" class="badge text-bg-light border text-decoration-none py-1.5 px-2">Resident</a>
                        <a href="login.php?demo=collector" class="badge text-bg-light border text-decoration-none py-1.5 px-2">Collector</a>
                        <a href="login.php?demo=admin" class="badge text-bg-light border text-decoration-none py-1.5 px-2">Admin</a>
                        <a href="login.php?demo=leader" class="badge text-bg-light border text-decoration-none py-1.5 px-2">Leader</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>

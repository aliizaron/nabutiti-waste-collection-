<?php
/**
 * Resident Registration Portal
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    validateCsrf();

    $name         = trim($_POST['name'] ?? '');
    $email        = trim($_POST['email'] ?? '');
    $phone        = trim($_POST['phone'] ?? '');
    $password     = $_POST['password'] ?? '';
    $household_no = trim($_POST['household_no'] ?? '');
    $zone_name    = trim($_POST['zone_name'] ?? '');
    $landmark     = trim($_POST['landmark'] ?? '');

    $allowedZones = ['Zone A', 'Zone B', 'Central', 'Valley'];

    if (empty($name) || empty($email) || empty($phone) || empty($password) || empty($household_no) || empty($landmark)) {
        $error = 'All fields are mandatory for community resident registration.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please provide a valid email address.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters in length.';
    } elseif (!in_array($zone_name, $allowedZones, true)) {
        $error = 'Please select a valid Nabutiti Village sub-zone.';
    } else {
        try {
            $pdo = Database::getInstance()->getConnection();

            // Check if email already exists
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $checkStmt->execute([$email]);
            if ($checkStmt->fetch()) {
                $error = 'An account with this email address already exists in the system.';
            } else {
                $pdo->beginTransaction();

                $hash = password_hash($password, PASSWORD_BCRYPT);
                $uStmt = $pdo->prepare("INSERT INTO users (name, email, phone, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, 'resident', 'active', NOW())");
                $uStmt->execute([$name, $email, $phone, $hash]);
                $newUserId = (int)$pdo->lastInsertId();

                $rStmt = $pdo->prepare("INSERT INTO residents (user_id, household_no, zone_name, landmark) VALUES (?, ?, ?, ?)");
                $rStmt->execute([$newUserId, $household_no, $zone_name, $landmark]);

                logActivity($pdo, $newUserId, "Resident {$name} registered household {$household_no} in {$zone_name}");

                $pdo->commit();
                $success = 'Registration successful! You may now sign in with your email and password.';
            }
        } catch (\PDOException $e) {
            if ($pdo && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = 'Registration failed: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resident Registration - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body class="bg-light py-5">
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="text-center mb-4">
                <a href="../index.php" class="text-decoration-none d-inline-flex align-items-center gap-2 mb-2 text-dark">
                    <i class="bi bi-recycle text-success fs-1"></i>
                    <span class="fs-4 fw-bold">Nabutiti WasteGuard</span>
                </a>
                <p class="text-muted small">Resident Household Enrollment Portal &bull; Nabutiti Village, Kansanga</p>
            </div>

            <div class="card border-0 shadow-sm rounded-4 p-4">
                <h4 class="fw-bold mb-3 text-dark">Household Registration</h4>

                <?php if ($error): ?>
                    <div class="alert alert-danger py-2 small" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= e($error) ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="alert alert-success py-2 small" role="alert">
                        <i class="bi bi-check-circle-fill me-1"></i> <?= e($success) ?>
                        <div class="mt-2">
                            <a href="login.php" class="btn btn-sm btn-success">Proceed to Sign In</a>
                        </div>
                    </div>
                <?php else: ?>
                    <form method="POST" action="register.php" autocomplete="off">
                        <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">

                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label small fw-semibold text-secondary">Household Representative Name</label>
                                <input type="text" class="form-control" name="name" placeholder="e.g. Brenda Nakato" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-semibold text-secondary">Email Address</label>
                                <input type="email" class="form-control" name="email" placeholder="brenda@example.com" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-semibold text-secondary">Phone Number (MTN / Airtel)</label>
                                <input type="text" class="form-control" name="phone" placeholder="+256752112233" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-semibold text-secondary">Household Plot / LC Number</label>
                                <input type="text" class="form-control" name="household_no" placeholder="e.g. NAB-Z2-042" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-semibold text-secondary">Nabutiti Sub-Zone</label>
                                <select class="form-select" name="zone_name" required>
                                    <option value="" disabled selected>Select Zone</option>
                                    <option value="Zone A">Zone A (Upper Ridge / Hilltop)</option>
                                    <option value="Zone B">Zone B (Market Road / Commercial)</option>
                                    <option value="Central">Central (Parish Thoroughfare)</option>
                                    <option value="Valley">Valley (Wetland Buffer & Drainage)</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label small fw-semibold text-secondary">Local Landmark / Pickup Point Description</label>
                                <input type="text" class="form-control" name="landmark" placeholder="e.g. Near St. Kizito Primary gate, beside blue water tank" required>
                            </div>

                            <div class="col-12">
                                <label class="form-label small fw-semibold text-secondary">Account Password</label>
                                <input type="password" class="form-control" name="password" placeholder="Minimum 6 characters" required>
                            </div>

                            <div class="col-12 mt-4">
                                <button type="submit" class="btn btn-success w-100 py-2 fw-semibold">
                                    Complete Household Registration
                                </button>
                            </div>
                        </div>
                    </form>
                <?php endif; ?>

                <div class="mt-4 pt-3 border-top text-center small text-muted">
                    Already registered? <a href="login.php" class="text-success fw-bold text-decoration-none">Sign In here</a>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>

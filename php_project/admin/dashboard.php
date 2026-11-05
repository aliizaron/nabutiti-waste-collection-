<?php
/**
 * Administrator & Waste Management Officer Portal
 * Dispatch Engine, Overdue Flagger, CRUD & Verification
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireRole('admin');
$user = requireAuth();
$pdo = Database::getInstance()->getConnection();

$successMsg = '';
$errorMsg = '';

// Automated Overdue Flagger: Flag any pending or assigned request whose scheduled date < today
try {
    $flagOverdue = $pdo->prepare("
        UPDATE waste_requests 
        SET status = 'Overdue' 
        WHERE status IN ('Pending', 'Assigned', 'In_Progress') 
          AND scheduled_date < CURDATE()
    ");
    $flagOverdue->execute();
    $flaggedCount = $flagOverdue->rowCount();
} catch (\PDOException $e) {
    error_log("Overdue check error: " . $e->getMessage());
}

// Handle Dispatch Engine Assignment
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'assign_request') {
    validateCsrf();
    $requestId   = (int)($_POST['request_id'] ?? 0);
    $collectorId = (int)($_POST['collector_id'] ?? 0);

    if ($requestId <= 0 || $collectorId <= 0) {
        $errorMsg = 'Please select a valid request and available collector vehicle.';
    } else {
        try {
            $pdo->beginTransaction();

            // Insert or update assignment
            $assignStmt = $pdo->prepare("
                INSERT INTO assignments (request_id, collector_id, assigned_by, assigned_at)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    collector_id = VALUES(collector_id),
                    assigned_by  = VALUES(assigned_by),
                    updated_at   = NOW()
            ");
            $assignStmt->execute([$requestId, $collectorId, $user['user_id']]);

            // Mark request as Assigned
            $reqStmt = $pdo->prepare("UPDATE waste_requests SET status = 'Assigned' WHERE id = ?");
            $reqStmt->execute([$requestId]);

            logActivity($pdo, $user['user_id'], "Dispatched Request #{$requestId} to Collector #{$collectorId}");

            $pdo->commit();
            $successMsg = "Request #WR-{$requestId} successfully dispatched!";
        } catch (\PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $errorMsg = 'Dispatch failed: ' . $e->getMessage();
        }
    }
}

// Handle Complaint Resolution
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'resolve_complaint') {
    validateCsrf();
    $complaintId   = (int)($_POST['complaint_id'] ?? 0);
    $adminResponse = trim($_POST['admin_response'] ?? '');
    $compStatus    = $_POST['status'] ?? 'Resolved';

    if ($complaintId <= 0 || empty($adminResponse)) {
        $errorMsg = 'Please provide an official resolution response.';
    } else {
        try {
            $cStmt = $pdo->prepare("UPDATE complaints SET status = ?, admin_response = ?, resolved_at = NOW() WHERE id = ?");
            $cStmt->execute([$compStatus, $adminResponse, $complaintId]);

            logActivity($pdo, $user['user_id'], "Resolved complaint #{$complaintId}");
            $successMsg = "Complaint #CMP-{$complaintId} marked as {$compStatus}.";
        } catch (\PDOException $e) {
            $errorMsg = 'Failed to update complaint: ' . $e->getMessage();
        }
    }
}

// Handle Collector Availability Toggle
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'toggle_collector') {
    validateCsrf();
    $collectorId = (int)($_POST['collector_id'] ?? 0);
    $available   = (int)($_POST['is_available'] ?? 0);

    try {
        $tStmt = $pdo->prepare("UPDATE collectors SET is_available = ? WHERE id = ?");
        $tStmt->execute([$available, $collectorId]);
        $successMsg = "Collector availability updated.";
    } catch (\PDOException $e) {
        $errorMsg = 'Failed to update collector: ' . $e->getMessage();
    }
}

// Fetch Pending Requests Queue for Dispatch Engine
$pendingStmt = $pdo->query("
    SELECT wr.*, res.household_no, res.zone_name, u.name AS resident_name, u.phone AS resident_phone
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    JOIN users u ON res.user_id = u.id
    WHERE wr.status IN ('Pending', 'Overdue')
    ORDER BY wr.scheduled_date ASC, wr.id ASC
");
$pendingRequests = $pendingStmt->fetchAll();

// Fetch Active Collectors
$colStmt = $pdo->query("
    SELECT c.*, u.name AS collector_name, u.phone,
           (SELECT COUNT(*) FROM assignments a JOIN waste_requests wr ON a.request_id = wr.id WHERE a.collector_id = c.id AND wr.status IN ('Assigned', 'In_Progress')) AS active_workload
    FROM collectors c
    JOIN users u ON c.user_id = u.id
    WHERE u.status = 'active'
");
$collectors = $colStmt->fetchAll();

// Fetch All Requests for Oversight
$allReqStmt = $pdo->query("
    SELECT wr.*, res.household_no, res.zone_name, u_res.name AS resident_name,
           u_col.name AS collector_name, c.vehicle_reg_no,
           cr.proof_photo, cr.collector_notes, cr.completion_time
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    JOIN users u_res ON res.user_id = u_res.id
    LEFT JOIN assignments a ON wr.id = a.request_id
    LEFT JOIN collectors c ON a.collector_id = c.id
    LEFT JOIN users u_col ON c.user_id = u_col.id
    LEFT JOIN collection_records cr ON a.id = cr.assignment_id
    ORDER BY wr.created_at DESC
    LIMIT 50
");
$allRequests = $allReqStmt->fetchAll();

// Fetch Open Complaints
$compStmt = $pdo->query("
    SELECT c.*, res.household_no, res.zone_name, u.name AS resident_name, u.phone
    FROM complaints c
    JOIN residents res ON c.resident_id = res.id
    JOIN users u ON res.user_id = u.id
    WHERE c.status != 'Resolved'
    ORDER BY c.id DESC
");
$openComplaints = $compStmt->fetchAll();

// Statistics Counters
$totalCount = (int)$pdo->query("SELECT COUNT(*) FROM waste_requests")->fetchColumn();
$pendingCount = (int)$pdo->query("SELECT COUNT(*) FROM waste_requests WHERE status = 'Pending'")->fetchColumn();
$completedCount = (int)$pdo->query("SELECT COUNT(*) FROM waste_requests WHERE status = 'Completed'")->fetchColumn();
$overdueCount = (int)$pdo->query("SELECT COUNT(*) FROM waste_requests WHERE status = 'Overdue'")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administrator Dispatch - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        .status-badge { font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.65rem; border-radius: 9999px; }
        .stat-card { border-radius: 0.75rem; border: none; }
    </style>
</head>
<body class="bg-light pb-5">

    <!-- Top Navigation -->
    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-danger">
        <div class="container-fluid px-lg-4">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="../index.php">
                <i class="bi bi-shield-shaded text-danger fs-4"></i>
                <span>Nabutiti WasteGuard &bull; Administrator Operations</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small d-none d-md-inline">
                    <i class="bi bi-person-fill text-danger me-1"></i> <?= e($user['name']) ?> (Sanitation Officer)
                </span>
                <a href="../auth/logout.php" class="btn btn-outline-light btn-sm">Sign Out</a>
            </div>
        </div>
    </nav>

    <div class="container-fluid px-lg-4 mt-4">
        <!-- Alerts -->
        <?php if ($successMsg): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> <?= e($successMsg) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>
        <?php if ($errorMsg): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= e($errorMsg) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <!-- Top Statistics Metrics -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="card stat-card bg-white shadow-sm p-3 border-start border-4 border-warning">
                    <div class="text-secondary small fw-semibold">Pending Dispatch</div>
                    <div class="h3 fw-bold text-warning mb-0"><?= $pendingCount ?></div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card stat-card bg-white shadow-sm p-3 border-start border-4 border-danger">
                    <div class="text-secondary small fw-semibold">Overdue Requests</div>
                    <div class="h3 fw-bold text-danger mb-0"><?= $overdueCount ?></div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card stat-card bg-white shadow-sm p-3 border-start border-4 border-success">
                    <div class="text-secondary small fw-semibold">Completed Collections</div>
                    <div class="h3 fw-bold text-success mb-0"><?= $completedCount ?></div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card stat-card bg-white shadow-sm p-3 border-start border-4 border-primary">
                    <div class="text-secondary small fw-semibold">Total Requests Logged</div>
                    <div class="h3 fw-bold text-primary mb-0"><?= $totalCount ?></div>
                </div>
            </div>
        </div>

        <div class="row g-4 mb-4">
            <!-- Dispatch Engine: Pending & Overdue Queue -->
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-cpu-fill text-primary me-2"></i>Dispatch Engine Queue</h5>
                            <small class="text-muted">Unassigned and flagged overdue collections requiring vehicle routing</small>
                        </div>
                        <span class="badge bg-danger"><?= count($pendingRequests) ?> Orders In Queue</span>
                    </div>

                    <?php if (empty($pendingRequests)): ?>
                        <div class="text-center py-4 text-muted">
                            <i class="bi bi-check-all fs-2 text-success"></i>
                            <p class="mb-0 mt-1">All collection requests have been dispatched to field collectors!</p>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light small">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Resident / Household</th>
                                        <th>Waste Type</th>
                                        <th>Date & Landmark</th>
                                        <th>Status</th>
                                        <th>Dispatch Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($pendingRequests as $pr): ?>
                                        <tr>
                                            <td class="fw-bold">#WR-<?= str_pad((string)$pr['id'], 4, '0', STR_PAD_LEFT) ?></td>
                                            <td>
                                                <div class="fw-semibold"><?= e($pr['resident_name']) ?></div>
                                                <small class="text-muted"><?= e($pr['zone_name']) ?> &bull; Plot <?= e($pr['household_no']) ?></small>
                                            </td>
                                            <td><span class="badge bg-secondary"><?= e($pr['waste_type']) ?></span></td>
                                            <td class="small">
                                                <div><?= date('M d, Y', strtotime($pr['scheduled_date'])) ?></div>
                                                <span class="text-muted text-truncate d-inline-block" style="max-width: 140px;"><?= e($pr['address_landmark']) ?></span>
                                            </td>
                                            <td>
                                                <span class="badge bg-<?= $pr['status'] === 'Overdue' ? 'danger' : 'warning text-dark' ?>">
                                                    <?= e($pr['status']) ?>
                                                </span>
                                            </td>
                                            <td>
                                                <form method="POST" action="dashboard.php" class="d-flex gap-1">
                                                    <input type="hidden" name="action_type" value="assign_request">
                                                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">
                                                    <input type="hidden" name="request_id" value="<?= $pr['id'] ?>">

                                                    <select name="collector_id" class="form-select form-select-sm" style="max-width: 150px;" required>
                                                        <option value="" disabled selected>Select Truck</option>
                                                        <?php foreach ($collectors as $col): ?>
                                                            <?php if ($col['is_available']): ?>
                                                                <option value="<?= $col['id'] ?>">
                                                                    <?= e($col['collector_name']) ?> (<?= e($col['assigned_zone']) ?>)
                                                                </option>
                                                            <?php endif; ?>
                                                        <?php endforeach; ?>
                                                    </select>
                                                    <button type="submit" class="btn btn-sm btn-primary">Dispatch</button>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Collectors Management -->
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <h5 class="fw-bold text-dark mb-3">
                        <i class="bi bi-truck-front-fill text-success me-2"></i>Collector Fleet
                    </h5>
                    <div class="d-flex flex-column gap-3">
                        <?php foreach ($collectors as $c): ?>
                            <div class="border rounded-3 p-3 bg-white">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <div class="fw-bold text-dark"><?= e($c['collector_name']) ?></div>
                                    <span class="badge bg-<?= $c['is_available'] ? 'success' : 'secondary' ?>">
                                        <?= $c['is_available'] ? 'Active Duty' : 'Off Duty' ?>
                                    </span>
                                </div>
                                <div class="small text-muted mb-2">
                                    <i class="bi bi-card-text me-1"></i> Reg: <strong><?= e($c['vehicle_reg_no']) ?></strong><br>
                                    <i class="bi bi-geo me-1"></i> Zone: <?= e($c['assigned_zone']) ?> &bull; Active Jobs: <span class="badge bg-primary-subtle text-primary"><?= $c['active_workload'] ?></span>
                                </div>
                                <form method="POST" action="dashboard.php" class="d-inline">
                                    <input type="hidden" name="action_type" value="toggle_collector">
                                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">
                                    <input type="hidden" name="collector_id" value="<?= $c['id'] ?>">
                                    <input type="hidden" name="is_available" value="<?= $c['is_available'] ? 0 : 1 ?>">
                                    <button type="submit" class="btn btn-xs btn-outline-secondary btn-sm">
                                        Toggle to <?= $c['is_available'] ? 'Off Duty' : 'Active Duty' ?>
                                    </button>
                                </form>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Open Resident Complaints -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 class="fw-bold text-dark mb-3">
                <i class="bi bi-exclamation-circle text-danger me-2"></i>Resident Complaints Desk (<?= count($openComplaints) ?> Pending Resolution)
            </h5>
            <?php if (empty($openComplaints)): ?>
                <p class="text-muted small mb-0">No open complaints reported.</p>
            <?php else: ?>
                <div class="row g-3">
                    <?php foreach ($openComplaints as $comp): ?>
                        <div class="col-md-6">
                            <div class="border rounded-3 p-3 bg-white h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="fw-bold text-dark">Complaint #CMP-<?= $comp['id'] ?></span>
                                        <span class="badge bg-warning text-dark"><?= e($comp['status']) ?></span>
                                    </div>
                                    <small class="text-muted d-block mb-2">
                                        By <?= e($comp['resident_name']) ?> (Plot <?= e($comp['household_no']) ?>, <?= e($comp['zone_name']) ?>) &bull; <?= e($comp['phone']) ?>
                                    </small>
                                    <p class="small text-secondary mb-3"><?= e($comp['complaint_text']) ?></p>
                                </div>
                                <form method="POST" action="dashboard.php">
                                    <input type="hidden" name="action_type" value="resolve_complaint">
                                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">
                                    <input type="hidden" name="complaint_id" value="<?= $comp['id'] ?>">

                                    <div class="input-group input-group-sm">
                                        <input type="text" name="admin_response" class="form-control" placeholder="Action taken / Resolution note..." required>
                                        <select name="status" class="form-select" style="max-width: 130px;">
                                            <option value="Resolved">Resolved</option>
                                            <option value="Under_Review">Under Review</option>
                                        </select>
                                        <button class="btn btn-success" type="submit">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Master Collection Activity Logs & Proof Oversight -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold text-dark mb-3">Recent Collection Records & Verification Proof</h5>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                        <tr>
                            <th>Ref</th>
                            <th>Resident</th>
                            <th>Waste</th>
                            <th>Landmark</th>
                            <th>Collector</th>
                            <th>Status</th>
                            <th>Proof / Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($allRequests as $ar): ?>
                            <tr>
                                <td class="fw-bold">#WR-<?= str_pad((string)$ar['id'], 4, '0', STR_PAD_LEFT) ?></td>
                                <td>
                                    <div><?= e($ar['resident_name']) ?></div>
                                    <small class="text-muted"><?= e($ar['zone_name']) ?></small>
                                </td>
                                <td><span class="badge bg-dark"><?= e($ar['waste_type']) ?></span></td>
                                <td class="small"><?= e($ar['address_landmark']) ?></td>
                                <td class="small">
                                    <?= $ar['collector_name'] ? e($ar['collector_name']) : '<span class="text-muted">Unassigned</span>' ?>
                                </td>
                                <td>
                                    <span class="status-badge bg-light border text-dark"><?= e($ar['status']) ?></span>
                                </td>
                                <td class="small">
                                    <?php if ($ar['proof_photo']): ?>
                                        <span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-camera me-1"></i>Verified</span>
                                        <div class="text-muted text-truncate mt-1" style="max-width: 130px;"><?= e($ar['collector_notes'] ?? '') ?></div>
                                    <?php else: ?>
                                        <span class="text-muted">No proof yet</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

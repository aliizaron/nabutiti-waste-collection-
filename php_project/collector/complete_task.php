<?php
/**
 * Collector: Complete Task & Submit Proof of Work (Live Camera or Gallery Upload)
 * Web-Based Waste Collection Management and Monitoring System
 * Nabutiti Village, Kansanga, Makindye Division, Kampala
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_guard.php';
require_once __DIR__ . '/../includes/image_handler.php';

// Strict RBAC: Only authenticated collectors can submit proof of work
$user = require_role('collector');
$pdo = Database::getInstance()->getConnection();

// Fetch collector profile
$cStmt = $pdo->prepare("SELECT id, vehicle_reg_no, assigned_zone FROM collectors WHERE user_id = ?");
$cStmt->execute([$user['user_id']]);
$collector = $cStmt->fetch();

if (!$collector) {
    die("Collector profile not found for user ID {$user['user_id']}.");
}

$task_id = (int)($_GET['id'] ?? $_POST['request_id'] ?? 0);
if ($task_id <= 0) {
    set_flash_message('error', 'Invalid task identifier provided.');
    header('Location: /collector/dashboard.php');
    exit;
}

// Fetch task and verify collector assignment
$tStmt = $pdo->prepare("
    SELECT wr.*, a.id AS assignment_id, a.collector_id,
           res.household_no, res.zone_name,
           u_res.name AS resident_name, u_res.phone AS resident_phone
    FROM waste_requests wr
    JOIN assignments a ON wr.id = a.request_id
    JOIN residents res ON wr.resident_id = res.id
    JOIN users u_res ON res.user_id = u_res.id
    WHERE wr.id = ? AND a.collector_id = ?
");
$tStmt->execute([$task_id, $collector['id']]);
$task = $tStmt->fetch();

if (!$task) {
    set_flash_message('error', 'Task not found or not assigned to your vehicle.');
    header('Location: /collector/dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $collector_notes = trim($_POST['collector_notes'] ?? '');
    $status          = $_POST['status'] ?? 'Completed';

    $allowed_statuses = ['In_Progress', 'Completed', 'Inaccessible'];
    if (!in_array($status, $allowed_statuses, true)) {
        $error = 'Invalid status selected.';
    } else {
        try {
            $pdo->beginTransaction();

            // Process image proof via live camera or gallery upload
            $proof_path = process_image_upload(
                $_POST['captured_image'] ?? null,
                $_FILES['uploaded_file'] ?? null,
                '../uploads/proofs/'
            );

            if ($status === 'Completed' && empty($proof_path)) {
                throw new InvalidArgumentException('Proof of collection photo is required when marking a task as Completed.');
            }

            // Record proof of work in collection_records
            if ($status === 'Completed' && $proof_path) {
                $recStmt = $pdo->prepare("
                    INSERT INTO collection_records (assignment_id, completion_time, proof_photo, collector_notes)
                    VALUES (?, NOW(), ?, ?)
                    ON DUPLICATE KEY UPDATE
                        completion_time = NOW(),
                        proof_photo = VALUES(proof_photo),
                        collector_notes = VALUES(collector_notes)
                ");
                $recStmt->execute([$task['assignment_id'], $proof_path, $collector_notes]);
            }

            // Update waste request status
            $reqStmt = $pdo->prepare("UPDATE waste_requests SET status = ? WHERE id = ?");
            $reqStmt->execute([$status, $task['id']]);

            // Update assignment timestamp
            $assignStmt = $pdo->prepare("UPDATE assignments SET updated_at = NOW() WHERE id = ?");
            $assignStmt->execute([$task['assignment_id']]);

            // Log activity
            $logStmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, ?, ?, NOW())");
            $logStmt->execute([
                $user['user_id'],
                "Collector {$user['name']} marked Request #WR-{$task['id']} as [{$status}] with proof photo",
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);

            $pdo->commit();

            set_flash_message('success', "Task #WR-" . str_pad((string)$task['id'], 4, '0', STR_PAD_LEFT) . " updated to {$status} with verified photo proof.");
            header('Location: /collector/dashboard.php');
            exit;
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = 'Failed to update task: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Task #WR-<?= htmlspecialchars((string)$task['id'], ENT_QUOTES, 'UTF-8') ?> - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>
<body class="bg-light pb-5">

    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-primary">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/collector/dashboard.php">
                <i class="bi bi-truck text-primary fs-4"></i>
                <span>Nabutiti WasteGuard &bull; Field Collector</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small">
                    <i class="bi bi-person-badge text-primary me-1"></i> <?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8') ?>
                    <span class="text-white-50">(<?= htmlspecialchars($collector['vehicle_reg_no'], ENT_QUOTES, 'UTF-8') ?>)</span>
                </span>
                <a href="/auth/logout.php" class="btn btn-outline-light btn-sm">Sign Out</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4" style="max-width: 820px;">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
                <h4 class="fw-bold mb-0 text-dark">Submit Proof of Collection</h4>
                <p class="text-muted small mb-0">Order: <strong>#WR-<?= str_pad((string)$task['id'], 4, '0', STR_PAD_LEFT) ?></strong> &bull; <?= htmlspecialchars($task['waste_type'], ENT_QUOTES, 'UTF-8') ?> Waste</p>
            </div>
            <a href="/collector/dashboard.php" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-left me-1"></i> Back to Schedule
            </a>
        </div>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2 small" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>

        <!-- Household Info Summary Card -->
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white mb-3">
            <div class="row g-2 text-xs">
                <div class="col-sm-6">
                    <span class="text-secondary">Resident Representative:</span>
                    <strong class="d-block text-dark"><?= htmlspecialchars($task['resident_name'], ENT_QUOTES, 'UTF-8') ?> (Plot <?= htmlspecialchars($task['household_no'], ENT_QUOTES, 'UTF-8') ?>)</strong>
                    <span class="text-muted"><i class="bi bi-telephone me-1"></i><?= htmlspecialchars($task['resident_phone'], ENT_QUOTES, 'UTF-8') ?></span>
                </div>
                <div class="col-sm-6">
                    <span class="text-secondary">Sub-Zone & Landmark:</span>
                    <strong class="d-block text-dark"><?= htmlspecialchars($task['zone_name'], ENT_QUOTES, 'UTF-8') ?></strong>
                    <span class="text-muted"><i class="bi bi-geo-alt-fill text-danger me-1"></i><?= htmlspecialchars($task['address_landmark'], ENT_QUOTES, 'UTF-8') ?></span>
                </div>
            </div>
        </div>

        <!-- Form Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <form method="POST" action="complete_task.php" enctype="multipart/form-data">
                <input type="hidden" name="csrf_token" value="<?= get_csrf_token() ?>">
                <input type="hidden" name="request_id" value="<?= htmlspecialchars((string)$task['id'], ENT_QUOTES, 'UTF-8') ?>">

                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Update Task Execution Status</label>
                        <select class="form-select" name="status" required>
                            <option value="Completed" selected>Completed (Waste loaded into truck)</option>
                            <option value="In_Progress">In Progress (Currently loading at compound)</option>
                            <option value="Inaccessible">Inaccessible (Gate locked / flooded trench)</option>
                        </select>
                    </div>

                    <!-- Dual-Mode Media Picker: Live Camera Snapshot OR Device Storage -->
                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Proof of Collection Photo (Live Camera Snapshot or Device Storage)</label>
                        <div id="proof-media-picker" data-media-picker></div>
                    </div>

                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Collector Observations / Notes</label>
                        <textarea class="form-control" name="collector_notes" rows="3" placeholder="e.g. 2 sacks loaded into tipper UBE 418K, resident present, road muddy along drainage path."></textarea>
                    </div>

                    <div class="col-12 mt-4 pt-2 border-top d-flex justify-content-end gap-2">
                        <a href="/collector/dashboard.php" class="btn btn-light px-4">Cancel</a>
                        <button type="submit" class="btn btn-primary px-4 fw-semibold">
                            <i class="bi bi-check2-circle me-1"></i> Save & Verify Completion
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/assets/js/media_picker.js"></script>
</body>
</html>

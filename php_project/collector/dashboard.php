<?php
/**
 * Waste Collector Portal & Task Schedule
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireRole('collector');
$user = requireAuth();
$pdo = Database::getInstance()->getConnection();

// Fetch Collector Profile
$cStmt = $pdo->prepare("SELECT * FROM collectors WHERE user_id = ?");
$cStmt->execute([$user['user_id']]);
$collector = $cStmt->fetch();

if (!$collector) {
    die("Collector record not found for user account.");
}

$collectorId = (int)$collector['id'];
$successMsg = '';
$errorMsg = '';

// Handle Task Status Update & Proof Photo Upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'update_task') {
    validateCsrf();
    $assignmentId = (int)($_POST['assignment_id'] ?? 0);
    $requestId    = (int)($_POST['request_id'] ?? 0);
    $newStatus    = $_POST['status'] ?? '';
    $notes        = trim($_POST['collector_notes'] ?? '');

    $allowedStatuses = ['Assigned', 'In_Progress', 'Completed', 'Inaccessible'];

    if (!in_array($newStatus, $allowedStatuses, true)) {
        $errorMsg = 'Invalid status selected.';
    } else {
        try {
            $pdo->beginTransaction();

            // If completing, photo proof is required or captured
            $proofPhoto = null;
            if ($newStatus === 'Completed') {
                if (!empty($_FILES['proof_photo']['name'])) {
                    $proofPhoto = handleSecureUpload($_FILES['proof_photo'], 'proofs');
                } else {
                    // Fallback to placeholder if not uploaded
                    $proofPhoto = 'uploads/proofs/verified_pickup.jpg';
                }

                // Insert or replace into collection_records
                $recStmt = $pdo->prepare("
                    INSERT INTO collection_records (assignment_id, completion_time, proof_photo, collector_notes)
                    VALUES (?, NOW(), ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        completion_time = NOW(),
                        proof_photo = VALUES(proof_photo),
                        collector_notes = VALUES(collector_notes)
                ");
                $recStmt->execute([$assignmentId, $proofPhoto, $notes]);
            }

            // Update waste_requests status
            $reqUpdate = $pdo->prepare("UPDATE waste_requests SET status = ? WHERE id = ?");
            $reqUpdate->execute([$newStatus, $requestId]);

            // Update assignment timestamp
            $assignUpdate = $pdo->prepare("UPDATE assignments SET updated_at = NOW() WHERE id = ?");
            $assignUpdate->execute([$assignmentId]);

            logActivity($pdo, $user['user_id'], "Collector updated Request #{$requestId} to [{$newStatus}]");

            $pdo->commit();
            $successMsg = "Task #WR-{$requestId} status updated to {$newStatus}.";
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $errorMsg = 'Error updating task: ' . $e->getMessage();
        }
    }
}

// Fetch Assigned Tasks for this Collector
$tasksStmt = $pdo->prepare("
    SELECT a.id AS assignment_id, a.assigned_at,
           wr.id AS request_id, wr.waste_type, wr.description, wr.latitude, wr.longitude, 
           wr.address_landmark, wr.scheduled_date, wr.status, wr.created_at,
           u_res.name AS resident_name, u_res.phone AS resident_phone,
           res.household_no, res.zone_name,
           cr.proof_photo, cr.collector_notes, cr.completion_time
    FROM assignments a
    JOIN waste_requests wr ON a.request_id = wr.id
    JOIN residents res ON wr.resident_id = res.id
    JOIN users u_res ON res.user_id = u_res.id
    LEFT JOIN collection_records cr ON a.id = cr.assignment_id
    WHERE a.collector_id = ?
    ORDER BY FIELD(wr.status, 'In_Progress', 'Assigned', 'Pending', 'Overdue', 'Completed', 'Inaccessible'), wr.scheduled_date ASC
");
$tasksStmt->execute([$collectorId]);
$tasks = $tasksStmt->fetchAll();

// Prepare waypoints JSON for Leaflet Route Map
$waypoints = [];
foreach ($tasks as $t) {
    if ($t['status'] !== 'Completed' && $t['status'] !== 'Cancelled') {
        $waypoints[] = [
            'id'          => $t['request_id'],
            'assignment'  => $t['assignment_id'],
            'lat'         => (float)$t['latitude'],
            'lng'         => (float)$t['longitude'],
            'status'      => $t['status'],
            'waste_type'  => $t['waste_type'],
            'landmark'    => $t['address_landmark'],
            'resident'    => $t['resident_name'],
            'zone'        => $t['zone_name']
        ];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collector Route Portal - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        #routeMap { height: 380px; border-radius: 0.75rem; }
        .status-badge { font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.65rem; border-radius: 9999px; }
    </style>
</head>
<body class="bg-light pb-5">

    <!-- Top Navigation -->
    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-primary">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="../index.php">
                <i class="bi bi-truck text-primary fs-4"></i>
                <span>Nabutiti WasteGuard &bull; Field Collector</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small d-none d-md-inline">
                    <i class="bi bi-person-badge text-primary me-1"></i> <?= e($user['name']) ?> 
                    <span class="text-white-50">(<?= e($collector['vehicle_reg_no']) ?>)</span>
                </span>
                <a href="../auth/logout.php" class="btn btn-outline-light btn-sm">Sign Out</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
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

        <!-- Collector Header -->
        <div class="row align-items-center mb-4 g-3">
            <div class="col-md-7">
                <h4 class="fw-bold mb-1 text-dark">Daily Collection Route & Schedule</h4>
                <p class="text-muted small mb-0">
                    Vehicle: <strong><?= e($collector['vehicle_reg_no']) ?></strong> &bull; Assigned Sub-Zone: <span class="badge bg-secondary"><?= e($collector['assigned_zone']) ?></span>
                </p>
            </div>
            <div class="col-md-5 text-md-end">
                <span class="badge bg-primary fs-6 py-2 px-3">
                    <i class="bi bi-calendar-check me-1"></i> <?= count($waypoints) ?> Active Pickups Remaining
                </span>
            </div>
        </div>

        <!-- Interactive Route Map -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">
                    <i class="bi bi-map-fill text-primary me-2"></i>Nabutiti Village Pickup Waypoints
                </h6>
                <small class="text-muted">Click markers for pickup landmarks & direct updates</small>
            </div>
            <div id="routeMap"></div>
        </div>

        <!-- Task Schedule Table -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold text-dark mb-3">Assigned Pickup Queue</h5>

            <?php if (empty($tasks)): ?>
                <div class="text-center py-5 text-muted">
                    <i class="bi bi-check2-circle fs-1 text-success"></i>
                    <p class="mt-2 mb-0">No collection jobs currently assigned to your vehicle.</p>
                </div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light small">
                            <tr>
                                <th>Order / Date</th>
                                <th>Resident & Zone</th>
                                <th>Waste Category</th>
                                <th>Address & Landmark</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($tasks as $t): ?>
                                <tr>
                                    <td>
                                        <div class="fw-bold">#WR-<?= str_pad((string)$t['request_id'], 4, '0', STR_PAD_LEFT) ?></div>
                                        <small class="text-muted">For: <?= date('M d, Y', strtotime($t['scheduled_date'])) ?></small>
                                    </td>
                                    <td>
                                        <div class="fw-semibold text-dark"><?= e($t['resident_name']) ?></div>
                                        <div class="small text-muted">Plot <?= e($t['household_no']) ?> &bull; <span class="badge bg-light text-dark border"><?= e($t['zone_name']) ?></span></div>
                                        <div class="small text-muted"><i class="bi bi-telephone me-1"></i><?= e($t['resident_phone']) ?></div>
                                    </td>
                                    <td>
                                        <span class="badge bg-dark"><?= e($t['waste_type']) ?></span>
                                        <div class="small text-muted mt-1 text-truncate" style="max-width: 150px;"><?= e($t['description']) ?></div>
                                    </td>
                                    <td class="small">
                                        <div><i class="bi bi-geo-alt-fill text-danger me-1"></i><?= e($t['address_landmark']) ?></div>
                                        <span class="text-muted" style="font-size: 0.7rem;"><?= number_format($t['latitude'], 4) ?>, <?= number_format($t['longitude'], 4) ?></span>
                                    </td>
                                    <td>
                                        <?php
                                            $statusClasses = [
                                                'Assigned'    => 'bg-info-subtle text-info-emphasis border border-info',
                                                'In_Progress' => 'bg-primary-subtle text-primary-emphasis border border-primary',
                                                'Completed'   => 'bg-success-subtle text-success-emphasis border border-success',
                                                'Inaccessible'=> 'bg-secondary-subtle text-secondary border',
                                                'Overdue'     => 'bg-danger-subtle text-danger-emphasis border border-danger'
                                            ];
                                            $cls = $statusClasses[$t['status']] ?? 'bg-secondary text-white';
                                        ?>
                                        <span class="status-badge <?= $cls ?>">
                                            <?= str_replace('_', ' ', e($t['status'])) ?>
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#updateModal<?= $t['assignment_id'] ?>">
                                            <i class="bi bi-pencil-square me-1"></i> Update
                                        </button>
                                    </td>
                                </tr>

                                <!-- Update Status Modal for this Task -->
                                <div class="modal fade" id="updateModal<?= $t['assignment_id'] ?>" tabindex="-1">
                                    <div class="modal-dialog">
                                        <div class="modal-content rounded-4 border-0">
                                            <div class="modal-header border-bottom">
                                                <h5 class="modal-title fw-bold">Update Job #WR-<?= str_pad((string)$t['request_id'], 4, '0', STR_PAD_LEFT) ?></h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <form method="POST" action="dashboard.php" enctype="multipart/form-data">
                                                <input type="hidden" name="action_type" value="update_task">
                                                <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">
                                                <input type="hidden" name="assignment_id" value="<?= $t['assignment_id'] ?>">
                                                <input type="hidden" name="request_id" value="<?= $t['request_id'] ?>">

                                                <div class="modal-body">
                                                    <div class="mb-3">
                                                        <label class="form-label small fw-semibold">Execution Status</label>
                                                        <select class="form-select" name="status" id="statusSelect<?= $t['assignment_id'] ?>" required>
                                                            <option value="Assigned" <?= $t['status'] === 'Assigned' ? 'selected' : '' ?>>Assigned (En Route)</option>
                                                            <option value="In_Progress" <?= $t['status'] === 'In_Progress' ? 'selected' : '' ?>>In Progress (At Household)</option>
                                                            <option value="Completed" <?= $t['status'] === 'Completed' ? 'selected' : '' ?>>Completed (Waste Loaded)</option>
                                                            <option value="Inaccessible" <?= $t['status'] === 'Inaccessible' ? 'selected' : '' ?>>Inaccessible (Gate Locked / Muddy Road)</option>
                                                        </select>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label class="form-label small fw-semibold">Proof of Collection Photo (Required for Completed)</label>
                                                        <input type="file" class="form-control" name="proof_photo" accept="image/jpeg,image/png,image/webp">
                                                        <small class="text-muted">Take a photo of loaded bins or clean collection point.</small>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label class="form-label small fw-semibold">Collector Observations / Notes</label>
                                                        <textarea class="form-control" name="collector_notes" rows="3" placeholder="e.g. 3 sacks picked, resident Brenda present, road slippery due to rain."><?= e($t['collector_notes'] ?? '') ?></textarea>
                                                    </div>
                                                </div>
                                                <div class="modal-footer border-top">
                                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                                    <button type="submit" class="btn btn-primary">Save Task Progress</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const waypoints = <?= json_encode($waypoints) ?>;
        const map = L.map('routeMap').setView([0.2845, 32.6072], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        if (waypoints.length > 0) {
            const latlngs = [];
            waypoints.forEach(wp => {
                const pt = [wp.lat, wp.lng];
                latlngs.push(pt);

                const marker = L.marker(pt).addTo(map);
                marker.bindPopup(`
                    <div style="font-family: inherit; font-size: 13px;">
                        <strong>#WR-${wp.id} (${wp.waste_type})</strong><br>
                        <strong>Resident:</strong> ${wp.resident} (${wp.zone})<br>
                        <strong>Landmark:</strong> ${wp.landmark}<br>
                        <span class="badge bg-primary mt-1">${wp.status}</span>
                    </div>
                `);
            });

            // Draw route connection line if multiple points
            if (latlngs.length > 1) {
                const polyline = L.polyline(latlngs, {color: '#2563eb', weight: 4, dashArray: '6, 8'}).addTo(map);
                map.fitBounds(polyline.getBounds().pad(0.2));
            } else {
                map.setView(latlngs[0], 16);
            }
        }
    </script>
</body>
</html>

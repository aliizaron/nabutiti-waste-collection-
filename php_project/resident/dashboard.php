<?php
/**
 * Resident Dashboard & Request Portal
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireRole('resident');
$user = requireAuth();
$pdo = Database::getInstance()->getConnection();

$residentId = $_SESSION['resident_id'] ?? null;
if (!$residentId) {
    $rStmt = $pdo->prepare("SELECT id, household_no, zone_name, landmark FROM residents WHERE user_id = ?");
    $rStmt->execute([$user['user_id']]);
    $resRow = $rStmt->fetch();
    if ($resRow) {
        $residentId = $resRow['id'];
        $_SESSION['resident_id']  = $resRow['id'];
        $_SESSION['household_no'] = $resRow['household_no'];
        $_SESSION['zone_name']    = $resRow['zone_name'];
    }
}

$successMsg = '';
$errorMsg = '';

// Handle New Waste Collection Request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'submit_request') {
    validateCsrf();
    $wasteType    = $_POST['waste_type'] ?? '';
    $description  = trim($_POST['description'] ?? '');
    $latitude     = (float)($_POST['latitude'] ?? 0.2845);
    $longitude    = (float)($_POST['longitude'] ?? 32.6072);
    $addressLandmark = trim($_POST['address_landmark'] ?? '');
    $scheduledDate   = $_POST['scheduled_date'] ?? date('Y-m-d');

    $allowedTypes = ['Organic', 'Recyclable', 'Hazardous', 'General'];

    if (!in_array($wasteType, $allowedTypes, true) || empty($description) || empty($addressLandmark)) {
        $errorMsg = 'Please complete all required fields including waste type, description, and pickup landmark.';
    } else {
        $photoPath = null;
        if (!empty($_FILES['photo']['name'])) {
            try {
                $photoPath = handleSecureUpload($_FILES['photo'], 'requests');
            } catch (\Exception $e) {
                $errorMsg = 'Photo upload error: ' . $e->getMessage();
            }
        }

        if (!$errorMsg) {
            try {
                $stmt = $pdo->prepare("INSERT INTO waste_requests (resident_id, waste_type, description, latitude, longitude, address_landmark, photo_path, scheduled_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())");
                $stmt->execute([$residentId, $wasteType, $description, $latitude, $longitude, $addressLandmark, $photoPath, $scheduledDate]);
                
                logActivity($pdo, $user['user_id'], "Resident submitted new {$wasteType} collection request");
                $successMsg = 'Collection request submitted successfully! Your collection is now Pending dispatch.';
            } catch (\PDOException $e) {
                $errorMsg = 'Failed to submit request: ' . $e->getMessage();
            }
        }
    }
}

// Handle Illegal Dumping Report
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'report_dumping') {
    validateCsrf();
    $locationDesc = trim($_POST['location_desc'] ?? '');
    $dumpLat      = (float)($_POST['dump_latitude'] ?? 0.2845);
    $dumpLng      = (float)($_POST['dump_longitude'] ?? 32.6072);

    if (empty($locationDesc)) {
        $errorMsg = 'Please specify the exact location description of the illegal dump.';
    } else {
        $photoPath = null;
        if (!empty($_FILES['dump_photo']['name'])) {
            try {
                $photoPath = handleSecureUpload($_FILES['dump_photo'], 'dumping');
            } catch (\Exception $e) {
                $errorMsg = 'Dumping photo upload error: ' . $e->getMessage();
            }
        }

        if (!$errorMsg) {
            try {
                $stmt = $pdo->prepare("INSERT INTO dumping_reports (reporter_id, location_desc, latitude, longitude, photo_path, status, created_at) VALUES (?, ?, ?, ?, ?, 'Reported', NOW())");
                $stmt->execute([$user['user_id'], $locationDesc, $dumpLat, $dumpLng, $photoPath]);

                logActivity($pdo, $user['user_id'], "Reported illegal dumping at {$locationDesc}");
                $successMsg = 'Illegal dumping incident logged. Local monitoring officers have been alerted.';
            } catch (\PDOException $e) {
                $errorMsg = 'Failed to record incident: ' . $e->getMessage();
            }
        }
    }
}

// Handle Complaint Filing
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'lodge_complaint') {
    validateCsrf();
    $requestId     = !empty($_POST['request_id']) ? (int)$_POST['request_id'] : null;
    $complaintText = trim($_POST['complaint_text'] ?? '');

    if (empty($complaintText)) {
        $errorMsg = 'Please articulate the nature of your complaint or service delay.';
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO complaints (resident_id, request_id, complaint_text, status) VALUES (?, ?, ?, 'Open')");
            $stmt->execute([$residentId, $requestId, $complaintText]);

            logActivity($pdo, $user['user_id'], "Submitted service complaint");
            $successMsg = 'Complaint lodged with sanitation supervisor. Reference tracking created.';
        } catch (\PDOException $e) {
            $errorMsg = 'Failed to submit complaint: ' . $e->getMessage();
        }
    }
}

// Fetch Resident's Requests with Assignment Info
$reqStmt = $pdo->prepare("
    SELECT wr.*, 
           u_col.name AS collector_name, 
           c.vehicle_reg_no,
           cr.completion_time,
           cr.proof_photo
    FROM waste_requests wr
    LEFT JOIN assignments a ON wr.id = a.request_id
    LEFT JOIN collectors c ON a.collector_id = c.id
    LEFT JOIN users u_col ON c.user_id = u_col.id
    LEFT JOIN collection_records cr ON a.id = cr.assignment_id
    WHERE wr.resident_id = ?
    ORDER BY wr.created_at DESC
");
$reqStmt->execute([$residentId]);
$myRequests = $reqStmt->fetchAll();

// Fetch Resident's Complaints
$compStmt = $pdo->prepare("SELECT * FROM complaints WHERE resident_id = ? ORDER BY id DESC");
$compStmt->execute([$residentId]);
$myComplaints = $compStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resident Portal - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        #pickerMap, #dumpPickerMap { height: 260px; border-radius: 0.5rem; }
        .status-badge { font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.65rem; border-radius: 9999px; }
    </style>
</head>
<body class="bg-light pb-5">

    <!-- Top Navigation -->
    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-success">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="../index.php">
                <i class="bi bi-recycle text-success fs-4"></i>
                <span>Nabutiti WasteGuard</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small d-none d-md-inline">
                    <i class="bi bi-person-circle text-success me-1"></i> <?= e($user['name']) ?> 
                    <span class="text-white-50">(<?= e($_SESSION['household_no'] ?? 'Household') ?> &bull; <?= e($_SESSION['zone_name'] ?? 'Nabutiti') ?>)</span>
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

        <!-- Quick Action Bar -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
                <h4 class="fw-bold mb-0 text-dark">Resident Waste Portal</h4>
                <p class="text-muted small mb-0">Nabutiti Village, Kansanga &bull; Sub-Zone: <?= e($_SESSION['zone_name'] ?? 'Zone B') ?></p>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#requestModal">
                    <i class="bi bi-plus-circle me-1"></i> Request Collection
                </button>
                <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#dumpingModal">
                    <i class="bi bi-exclamation-octagon me-1"></i> Report Illegal Dump
                </button>
                <button class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#complaintModal">
                    <i class="bi bi-chat-left-dots me-1"></i> File Complaint
                </button>
            </div>
        </div>

        <div class="row g-4">
            <!-- Active Requests List -->
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold text-dark mb-0">My Collection Requests</h5>
                        <span class="text-muted small"><?= count($myRequests) ?> total logged</span>
                    </div>

                    <?php if (empty($myRequests)): ?>
                        <div class="text-center py-5 text-muted">
                            <i class="bi bi-trash fs-1 text-secondary opacity-50"></i>
                            <p class="mt-2 mb-0">You have not submitted any waste collection requests yet.</p>
                            <button class="btn btn-sm btn-success mt-3" data-bs-toggle="modal" data-bs-target="#requestModal">
                                Create First Request
                            </button>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light small">
                                    <tr>
                                        <th>Ref / Date</th>
                                        <th>Waste Type</th>
                                        <th>Pickup Details</th>
                                        <th>Assigned Truck</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($myRequests as $req): ?>
                                        <tr>
                                            <td>
                                                <div class="fw-bold">#WR-<?= str_pad((string)$req['id'], 4, '0', STR_PAD_LEFT) ?></div>
                                                <small class="text-muted"><?= date('M d, Y', strtotime($req['scheduled_date'])) ?></small>
                                            </td>
                                            <td>
                                                <span class="badge text-bg-secondary"><?= e($req['waste_type']) ?></span>
                                                <div class="small text-muted mt-1 text-truncate" style="max-width: 140px;"><?= e($req['description']) ?></div>
                                            </td>
                                            <td class="small">
                                                <div><i class="bi bi-geo-alt text-danger me-1"></i><?= e($req['address_landmark']) ?></div>
                                                <span class="text-muted" style="font-size: 0.7rem;"><?= number_format($req['latitude'], 4) ?>, <?= number_format($req['longitude'], 4) ?></span>
                                            </td>
                                            <td class="small">
                                                <?php if ($req['collector_name']): ?>
                                                    <span class="text-dark fw-semibold"><?= e($req['collector_name']) ?></span>
                                                    <div class="text-muted small"><?= e($req['vehicle_reg_no']) ?></div>
                                                <?php else: ?>
                                                    <span class="text-muted fst-italic">Awaiting dispatch</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>
                                                <?php
                                                    $statusClasses = [
                                                        'Pending'     => 'bg-warning-subtle text-warning-emphasis border border-warning',
                                                        'Assigned'    => 'bg-info-subtle text-info-emphasis border border-info',
                                                        'In_Progress' => 'bg-primary-subtle text-primary-emphasis border border-primary',
                                                        'Completed'   => 'bg-success-subtle text-success-emphasis border border-success',
                                                        'Overdue'     => 'bg-danger-subtle text-danger-emphasis border border-danger',
                                                        'Cancelled'   => 'bg-secondary-subtle text-secondary border'
                                                    ];
                                                    $cls = $statusClasses[$req['status']] ?? 'bg-secondary text-white';
                                                ?>
                                                <span class="status-badge <?= $cls ?>">
                                                    <?= str_replace('_', ' ', e($req['status'])) ?>
                                                </span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Complaints & Village Info Sidebar -->
            <div class="col-lg-4">
                <!-- Complaints Status -->
                <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h6 class="fw-bold text-dark mb-3">
                        <i class="bi bi-chat-left-text text-primary me-2"></i>My Complaints & Feedback
                    </h6>
                    <?php if (empty($myComplaints)): ?>
                        <p class="small text-muted mb-0">No complaints logged. Service running smoothly.</p>
                    <?php else: ?>
                        <div class="d-flex flex-column gap-3">
                            <?php foreach ($myComplaints as $cmp): ?>
                                <div class="border rounded-3 p-3 bg-light">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="badge bg-<?= $cmp['status'] === 'Resolved' ? 'success' : 'warning text-dark' ?>"><?= e($cmp['status']) ?></span>
                                        <small class="text-muted">#CMP-<?= $cmp['id'] ?></small>
                                    </div>
                                    <p class="small text-dark mb-2"><?= e($cmp['complaint_text']) ?></p>
                                    <?php if ($cmp['admin_response']): ?>
                                        <div class="border-top pt-2 mt-1 small bg-white p-2 rounded">
                                            <strong class="text-success d-block">Admin Response:</strong>
                                            <span class="text-muted"><?= e($cmp['admin_response']) ?></span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Community Hotline Card -->
                <div class="card border-0 shadow-sm rounded-4 p-4 bg-success text-white">
                    <h6 class="fw-bold mb-2">Nabutiti Village Sanitation Desk</h6>
                    <p class="small text-white-50 mb-3">Kansanga Parish Waste Monitoring Desk is open Mon - Sat (7:00 AM - 6:00 PM).</p>
                    <div class="small">
                        <div><i class="bi bi-telephone-fill me-2"></i> LC1 Office: +256 782 345 678</div>
                        <div class="mt-1"><i class="bi bi-truck me-2"></i> Dispatcher Kato: +256 772 100 200</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Request Modal with Map Pin Picker -->
    <div class="modal fade" id="requestModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content rounded-4 border-0">
                <div class="modal-header border-bottom">
                    <h5 class="modal-title fw-bold">Request Waste Collection</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST" action="dashboard.php" enctype="multipart/form-data">
                    <input type="hidden" name="action_type" value="submit_request">
                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">
                    <input type="hidden" name="latitude" id="reqLat" value="0.284820">
                    <input type="hidden" name="longitude" id="reqLng" value="32.607140">

                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-semibold">Waste Category</label>
                                <select class="form-select" name="waste_type" required>
                                    <option value="Organic">Organic (Food scraps, peels, garden waste)</option>
                                    <option value="Recyclable">Recyclable (Plastics, tins, paper, scrap)</option>
                                    <option value="Hazardous">Hazardous (Chemicals, batteries, oils)</option>
                                    <option value="General" selected>General (Mixed domestic solid waste)</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-semibold">Scheduled Date for Pickup</label>
                                <input type="date" class="form-control" name="scheduled_date" value="<?= date('Y-m-d') ?>" min="<?= date('Y-m-d') ?>" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Waste Description & Volume</label>
                                <textarea class="form-control" name="description" rows="2" placeholder="e.g., 2 large sacks of dry plastics and kitchen organic waste" required></textarea>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Pickup Landmark / Directions</label>
                                <input type="text" class="form-control" name="address_landmark" value="<?= e($_SESSION['landmark'] ?? '') ?>" placeholder="e.g. Next to Kansanga primary water pump" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Click on Map to Set Precise Pickup Coordinates</label>
                                <div id="pickerMap"></div>
                                <small class="text-muted d-block mt-1">Current Coordinates: <span id="coordsDisplay">0.28482, 32.60714</span> (Nabutiti Village, Kansanga)</small>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Optional Waste Photo (Max 2MB - JPG/PNG)</label>
                                <input type="file" class="form-control" name="photo" accept="image/jpeg,image/png,image/webp">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-top">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success">Submit Collection Order</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Illegal Dumping Report Modal -->
    <div class="modal fade" id="dumpingModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content rounded-4 border-0">
                <div class="modal-header border-bottom bg-danger text-white">
                    <h5 class="modal-title fw-bold"><i class="bi bi-exclamation-octagon me-2"></i>Report Illegal Waste Dumping</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST" action="dashboard.php" enctype="multipart/form-data">
                    <input type="hidden" name="action_type" value="report_dumping">
                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">
                    <input type="hidden" name="dump_latitude" id="dumpLat" value="0.283800">
                    <input type="hidden" name="dump_longitude" id="dumpLng" value="32.608700">

                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Location Description & Severity</label>
                                <textarea class="form-control" name="location_desc" rows="2" placeholder="e.g. Roadside garbage pile clogging the drainage ditch opposite the wooden footbridge" required></textarea>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Pin Dump Hotspot on Map</label>
                                <div id="dumpPickerMap"></div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-semibold">Upload Photo Evidence (Max 2MB)</label>
                                <input type="file" class="form-control" name="dump_photo" accept="image/jpeg,image/png,image/webp">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-top">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-danger">Submit Incident Report</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Complaint Modal -->
    <div class="modal fade" id="complaintModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content rounded-4 border-0">
                <div class="modal-header border-bottom">
                    <h5 class="modal-title fw-bold">Lodge Complaint or Feedback</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST" action="dashboard.php">
                    <input type="hidden" name="action_type" value="lodge_complaint">
                    <input type="hidden" name="csrf_token" value="<?= getCsrfToken() ?>">

                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Related Collection Order (Optional)</label>
                            <select class="form-select" name="request_id">
                                <option value="">General Service Complaint</option>
                                <?php foreach ($myRequests as $req): ?>
                                    <option value="<?= $req['id'] ?>">#WR-<?= str_pad((string)$req['id'], 4, '0', STR_PAD_LEFT) ?> (<?= e($req['waste_type']) ?> - <?= date('M d', strtotime($req['scheduled_date'])) ?>)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Complaint Details</label>
                            <textarea class="form-control" name="complaint_text" rows="4" placeholder="Detail any missed collection, delayed truck, or improper conduct..." required></textarea>
                        </div>
                    </div>
                    <div class="modal-footer border-top">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit to Admin</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Pickup Map Initializer
        let map, marker;
        const requestModal = document.getElementById('requestModal');
        requestModal.addEventListener('shown.bs.modal', function () {
            if (!map) {
                map = L.map('pickerMap').setView([0.284820, 32.607140], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                marker = L.marker([0.284820, 32.607140], {draggable: true}).addTo(map);
                marker.on('dragend', function (e) {
                    const pos = marker.getLatLng();
                    document.getElementById('reqLat').value = pos.lat.toFixed(6);
                    document.getElementById('reqLng').value = pos.lng.toFixed(6);
                    document.getElementById('coordsDisplay').innerText = pos.lat.toFixed(5) + ', ' + pos.lng.toFixed(5);
                });

                map.on('click', function(e) {
                    marker.setLatLng(e.latlng);
                    document.getElementById('reqLat').value = e.latlng.lat.toFixed(6);
                    document.getElementById('reqLng').value = e.latlng.lng.toFixed(6);
                    document.getElementById('coordsDisplay').innerText = e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5);
                });
            }
            map.invalidateSize();
        });

        // Dumping Map Initializer
        let dMap, dMarker;
        const dumpModal = document.getElementById('dumpingModal');
        dumpModal.addEventListener('shown.bs.modal', function() {
            if (!dMap) {
                dMap = L.map('dumpPickerMap').setView([0.283800, 32.608700], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(dMap);

                dMarker = L.marker([0.283800, 32.608700], {draggable: true}).addTo(dMap);
                dMarker.on('dragend', function() {
                    const pos = dMarker.getLatLng();
                    document.getElementById('dumpLat').value = pos.lat.toFixed(6);
                    document.getElementById('dumpLng').value = pos.lng.toFixed(6);
                });
                dMap.on('click', function(e) {
                    dMarker.setLatLng(e.latlng);
                    document.getElementById('dumpLat').value = e.latlng.lat.toFixed(6);
                    document.getElementById('dumpLng').value = e.latlng.lng.toFixed(6);
                });
            }
            dMap.invalidateSize();
        });
    </script>
</body>
</html>

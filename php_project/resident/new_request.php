<?php
/**
 * Resident: Submit Waste Collection Request (Dual-Mode Image Input & Strict RBAC)
 * Web-Based Waste Collection Management and Monitoring System
 * Nabutiti Village, Kansanga, Makindye Division, Kampala
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_guard.php';
require_once __DIR__ . '/../includes/image_handler.php';

// Strict RBAC: Only authenticated residents may access this portal
$user = require_role('resident');
$pdo = Database::getInstance()->getConnection();

// Fetch resident profile
$rStmt = $pdo->prepare("SELECT id, household_no, zone_name, landmark FROM residents WHERE user_id = ?");
$rStmt->execute([$user['user_id']]);
$resident = $rStmt->fetch();

if (!$resident) {
    die("Resident profile not found for account ID {$user['user_id']}.");
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $waste_type    = trim($_POST['waste_type'] ?? '');
    $description   = trim($_POST['description'] ?? '');
    $scheduled_date = trim($_POST['scheduled_date'] ?? date('Y-m-d'));
    $landmark      = trim($_POST['landmark'] ?? $resident['landmark']);
    $latitude      = (float)($_POST['latitude'] ?? 0.284820);
    $longitude     = (float)($_POST['longitude'] ?? 32.607140);

    $allowed_types = ['Organic', 'Recyclable', 'Hazardous', 'General'];

    if (!in_array($waste_type, $allowed_types, true)) {
        $error = 'Please select a valid waste category.';
    } elseif (empty($description)) {
        $error = 'Please provide a description of the waste volume and contents.';
    } elseif (empty($landmark)) {
        $error = 'Please specify a landmark or pickup point location.';
    } else {
        try {
            // Process Image: Handle live camera snapshot (Base64) OR device file ($_FILES)
            $photo_path = process_image_upload(
                $_POST['captured_image'] ?? null,
                $_FILES['uploaded_file'] ?? null,
                '../uploads/requests/'
            );

            // Insert waste request record into database
            $stmt = $pdo->prepare("
                INSERT INTO waste_requests 
                (resident_id, waste_type, description, latitude, longitude, address_landmark, photo_path, scheduled_date, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
            ");
            $stmt->execute([
                $resident['id'],
                $waste_type,
                $description,
                $latitude,
                $longitude,
                $landmark,
                $photo_path,
                $scheduled_date
            ]);

            $new_request_id = (int)$pdo->lastInsertId();

            // Activity Log
            $logStmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, ?, ?, NOW())");
            $logStmt->execute([
                $user['user_id'],
                "Resident {$user['name']} submitted {$waste_type} collection order #WR-{$new_request_id}",
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);

            set_flash_message('success', "Waste collection request #WR-" . str_pad((string)$new_request_id, 4, '0', STR_PAD_LEFT) . " submitted successfully! Our dispatch team is routing a collector.");
            header('Location: /resident/dashboard.php');
            exit;
        } catch (\Exception $e) {
            $error = 'Failed to submit collection request: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Collection Request - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        #pickerMap { height: 240px; border-radius: 0.5rem; }
    </style>
</head>
<body class="bg-light pb-5">

    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-success">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/resident/dashboard.php">
                <i class="bi bi-recycle text-success fs-4"></i>
                <span>Nabutiti WasteGuard &bull; Resident</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small">
                    <i class="bi bi-person-circle text-success me-1"></i> <?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8') ?>
                    <span class="text-white-50">(Plot <?= htmlspecialchars($resident['household_no'], ENT_QUOTES, 'UTF-8') ?> &bull; <?= htmlspecialchars($resident['zone_name'], ENT_QUOTES, 'UTF-8') ?>)</span>
                </span>
                <a href="/auth/logout.php" class="btn btn-outline-light btn-sm">Sign Out</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4" style="max-width: 820px;">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
                <h4 class="fw-bold mb-0 text-dark">Submit Waste Collection Request</h4>
                <p class="text-muted small mb-0">Nabutiti Village, Kansanga &bull; Household Zone: <strong><?= htmlspecialchars($resident['zone_name'], ENT_QUOTES, 'UTF-8') ?></strong></p>
            </div>
            <a href="/resident/dashboard.php" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-left me-1"></i> Back to Dashboard
            </a>
        </div>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2 small" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>

        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <form method="POST" action="new_request.php" enctype="multipart/form-data">
                <input type="hidden" name="csrf_token" value="<?= get_csrf_token() ?>">
                <input type="hidden" name="latitude" id="reqLat" value="0.284820">
                <input type="hidden" name="longitude" id="reqLng" value="32.607140">

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Waste Category</label>
                        <select class="form-select" name="waste_type" required>
                            <option value="Organic">Organic (Food scraps, peelings, garden scrap)</option>
                            <option value="Recyclable">Recyclable (Plastics, aluminum tins, cardboard)</option>
                            <option value="Hazardous">Hazardous (Old car batteries, oil cans, chemicals)</option>
                            <option value="General" selected>General (Mixed domestic municipal waste)</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label small fw-semibold text-secondary">Scheduled Pickup Date</label>
                        <input type="date" class="form-control" name="scheduled_date" value="<?= date('Y-m-d') ?>" min="<?= date('Y-m-d') ?>" required>
                    </div>

                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Waste Volume & Description</label>
                        <textarea class="form-control" name="description" rows="2" placeholder="e.g. 2 large sacks of plastic beverage bottles and dried garden trim" required></textarea>
                    </div>

                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Pickup Point / Landmark</label>
                        <input type="text" class="form-control" name="landmark" value="<?= htmlspecialchars($resident['landmark'], ENT_QUOTES, 'UTF-8') ?>" placeholder="e.g. Near St. Kizito Primary gate, beside blue water tank" required>
                    </div>

                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Pin Exact Pickup Point on Map (Click or drag pin)</label>
                        <div id="pickerMap"></div>
                        <small class="text-muted d-block mt-1">Coordinates: <span id="coordsDisplay">0.28482, 32.60714</span> (Nabutiti, Kansanga)</small>
                    </div>

                    <!-- Dual-Mode Media Picker: Live Camera Snapshot OR Device Storage -->
                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Waste Photo (Live Camera Snapshot or Device Storage)</label>
                        <div id="request-media-picker" data-media-picker></div>
                    </div>

                    <div class="col-12 mt-4 pt-2 border-top d-flex justify-content-end gap-2">
                        <a href="/resident/dashboard.php" class="btn btn-light px-4">Cancel</a>
                        <button type="submit" class="btn btn-success px-4 fw-semibold">
                            <i class="bi bi-send me-1"></i> Submit Collection Request
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="/assets/js/media_picker.js"></script>
    <script>
        // Initialize Leaflet Map coordinates picker
        const map = L.map('pickerMap').setView([0.284820, 32.607140], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([0.284820, 32.607140], { draggable: true }).addTo(map);

        function updateCoords(lat, lng) {
            document.getElementById('reqLat').value = lat.toFixed(6);
            document.getElementById('reqLng').value = lng.toFixed(6);
            document.getElementById('coordsDisplay').innerText = lat.toFixed(5) + ', ' + lng.toFixed(5);
        }

        marker.on('dragend', (e) => {
            const pos = marker.getLatLng();
            updateCoords(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
            marker.setLatLng(e.latlng);
            updateCoords(e.latlng.lat, e.latlng.lng);
        });
    </script>
</body>
</html>

<?php
/**
 * Resident: Report Illegal Waste Dumping (Dual-Mode Image Input & Strict RBAC)
 * Web-Based Waste Collection Management and Monitoring System
 * Nabutiti Village, Kansanga, Makindye Division, Kampala
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_guard.php';
require_once __DIR__ . '/../includes/image_handler.php';

// Strict RBAC: Any authenticated user (residents, leaders) may report illegal dumping
$user = require_role(['resident', 'leader', 'admin']);
$pdo = Database::getInstance()->getConnection();

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $location_desc = trim($_POST['location_desc'] ?? '');
    $latitude      = (float)($_POST['latitude'] ?? 0.283800);
    $longitude     = (float)($_POST['longitude'] ?? 32.608700);

    if (empty($location_desc)) {
        $error = 'Please provide a descriptive location and severity assessment for the dumping incident.';
    } else {
        try {
            // Process Image: Accepts live camera snapshot (Base64) OR device file ($_FILES)
            $photo_path = process_image_upload(
                $_POST['captured_image'] ?? null,
                $_FILES['uploaded_file'] ?? null,
                '../uploads/dumping/'
            );

            $stmt = $pdo->prepare("
                INSERT INTO dumping_reports 
                (reporter_id, location_desc, latitude, longitude, photo_path, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'Reported', NOW())
            ");
            $stmt->execute([
                $user['user_id'],
                $location_desc,
                $latitude,
                $longitude,
                $photo_path
            ]);

            $new_report_id = (int)$pdo->lastInsertId();

            // Activity Log
            $logStmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, created_at) VALUES (?, ?, ?, NOW())");
            $logStmt->execute([
                $user['user_id'],
                "Reported illegal dumping #DUMP-{$new_report_id} at '{$location_desc}'",
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]);

            set_flash_message('success', "Illegal dumping incident #DUMP-" . str_pad((string)$new_report_id, 4, '0', STR_PAD_LEFT) . " logged. Local monitoring officers have been alerted.");
            header('Location: /resident/dashboard.php');
            exit;
        } catch (\Exception $e) {
            $error = 'Failed to record dumping report: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Report Illegal Dumping - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>#dumpPickerMap { height: 240px; border-radius: 0.5rem; }</style>
</head>
<body class="bg-light pb-5">
    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-danger">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/resident/dashboard.php">
                <i class="bi bi-exclamation-octagon text-danger fs-4"></i>
                <span>Nabutiti WasteGuard &bull; Dumping Incident Desk</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small">
                    <i class="bi bi-person-circle text-danger me-1"></i> <?= htmlspecialchars($user['name'], ENT_QUOTES, 'UTF-8') ?>
                </span>
                <a href="/auth/logout.php" class="btn btn-outline-light btn-sm">Sign Out</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4" style="max-width: 820px;">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
                <h4 class="fw-bold mb-0 text-dark">Report Illegal Waste Dumping</h4>
                <p class="text-muted small mb-0">Help protect the Nabutiti drainage channels and wetland basin</p>
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
            <form method="POST" action="report_dumping.php" enctype="multipart/form-data">
                <input type="hidden" name="csrf_token" value="<?= get_csrf_token() ?>">
                <input type="hidden" name="latitude" id="dumpLat" value="0.283800">
                <input type="hidden" name="longitude" id="dumpLng" value="32.608700">

                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Location Description & Dumping Details</label>
                        <textarea class="form-control" name="location_desc" rows="3" placeholder="e.g. Discarded foam mattresses and construction debris piled near the wooden footbridge drainage stream" required></textarea>
                    </div>

                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Pin Exact Dumping Hotspot on Map (Click or drag pin)</label>
                        <div id="dumpPickerMap"></div>
                        <small class="text-muted d-block mt-1">Coordinates: <span id="coordsDisplay">0.28380, 32.60870</span> (Nabutiti, Kansanga)</small>
                    </div>

                    <!-- Dual-Mode Media Picker: Live Camera Snapshot OR Device Storage -->
                    <div class="col-12">
                        <label class="form-label small fw-semibold text-secondary">Incident Photo Evidence (Live Camera Snapshot or Device Gallery)</label>
                        <div id="dump-media-picker" data-media-picker></div>
                    </div>

                    <div class="col-12 mt-4 pt-2 border-top d-flex justify-content-end gap-2">
                        <a href="/resident/dashboard.php" class="btn btn-light px-4">Cancel</a>
                        <button type="submit" class="btn btn-danger px-4 fw-semibold">
                            <i class="bi bi-exclamation-octagon me-1"></i> Submit Dumping Report
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
        const map = L.map('dumpPickerMap').setView([0.283800, 32.608700], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([0.283800, 32.608700], { draggable: true }).addTo(map);

        function updateCoords(lat, lng) {
            document.getElementById('dumpLat').value = lat.toFixed(6);
            document.getElementById('dumpLng').value = lng.toFixed(6);
            document.getElementById('coordsDisplay').innerText = lat.toFixed(5) + ', ' + lng.toFixed(5);
        }

        marker.on('dragend', () => {
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

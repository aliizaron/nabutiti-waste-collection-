<?php
/**
 * Local Leader & Monitoring Officer Analytical Dashboard
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

requireRole('leader');
$user = requireAuth();
$pdo = Database::getInstance()->getConnection();

// Sub-Zone and Date Filter Handling
$selectedZone = $_GET['zone'] ?? 'All';
$startDate    = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate      = $_GET['end_date'] ?? date('Y-m-d');

// Base SQL Conditions
$whereParts = ["DATE(wr.created_at) BETWEEN ? AND ?"];
$params = [$startDate, $endDate];

if ($selectedZone !== 'All') {
    $whereParts[] = "res.zone_name = ?";
    $params[] = $selectedZone;
}
$whereSql = implode(' AND ', $whereParts);

// 1. KPI: Total Requests in range
$totalReqStmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM waste_requests wr 
    JOIN residents res ON wr.resident_id = res.id 
    WHERE {$whereSql}
");
$totalReqStmt->execute($params);
$totalRequests = (int)$totalReqStmt->fetchColumn();

// 2. KPI: Completed Collections in range
$compReqStmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM waste_requests wr 
    JOIN residents res ON wr.resident_id = res.id 
    WHERE {$whereSql} AND wr.status = 'Completed'
");
$compReqStmt->execute($params);
$completedRequests = (int)$compReqStmt->fetchColumn();

// Collection Completion Rate
$completionRate = $totalRequests > 0 ? round(($completedRequests / $totalRequests) * 100, 1) : 0.0;

// 3. KPI: Overdue Requests
$overdueStmt = $pdo->prepare("
    SELECT COUNT(*) 
    FROM waste_requests wr 
    JOIN residents res ON wr.resident_id = res.id 
    WHERE {$whereSql} AND wr.status = 'Overdue'
");
$overdueStmt->execute($params);
$overdueRequests = (int)$overdueStmt->fetchColumn();

// 4. KPI: Average Response Time (Hours from submission to assignment)
$respTimeStmt = $pdo->prepare("
    SELECT AVG(TIMESTAMPDIFF(MINUTE, wr.created_at, a.assigned_at)) / 60 AS avg_resp_hours
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    JOIN assignments a ON wr.id = a.request_id
    WHERE {$whereSql}
");
$respTimeStmt->execute($params);
$avgResponseHours = round((float)$respTimeStmt->fetchColumn(), 1);

// 5. KPI: Complaint Resolution Rate
$totalComplaints = (int)$pdo->query("SELECT COUNT(*) FROM complaints")->fetchColumn();
$resolvedComplaints = (int)$pdo->query("SELECT COUNT(*) FROM complaints WHERE status = 'Resolved'")->fetchColumn();
$complaintResolutionRate = $totalComplaints > 0 ? round(($resolvedComplaints / $totalComplaints) * 100, 1) : 0.0;

// Waste Types Breakdown for Chart.js
$wasteTypeStmt = $pdo->prepare("
    SELECT wr.waste_type, COUNT(*) as cnt 
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    WHERE {$whereSql}
    GROUP BY wr.waste_type
");
$wasteTypeStmt->execute($params);
$wasteTypesData = $wasteTypeStmt->fetchAll();

// Sub-Zones Breakdown for Chart.js
$zoneStatStmt = $pdo->query("
    SELECT res.zone_name, COUNT(wr.id) as total_requests,
           SUM(CASE WHEN wr.status = 'Completed' THEN 1 ELSE 0 END) as completed_count
    FROM residents res
    LEFT JOIN waste_requests wr ON res.id = wr.resident_id
    GROUP BY res.zone_name
");
$zoneStats = $zoneStatStmt->fetchAll();

// Fetch Hotspot Data for Leaflet (Illegal Dumping + Active Waste Requests)
$dumpingHotspots = $pdo->query("
    SELECT id, location_desc, latitude, longitude, status, created_at, photo_path
    FROM dumping_reports
    ORDER BY created_at DESC
")->fetchAll();

$openRequestPins = $pdo->query("
    SELECT wr.id, wr.waste_type, wr.address_landmark, wr.latitude, wr.longitude, wr.status, res.zone_name
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    WHERE wr.status IN ('Pending', 'Assigned', 'In_Progress', 'Overdue')
")->fetchAll();

// Audit Table Records
$auditStmt = $pdo->prepare("
    SELECT wr.id, wr.waste_type, wr.description, wr.scheduled_date, wr.status, wr.created_at,
           res.household_no, res.zone_name,
           u_res.name AS resident_name,
           u_col.name AS collector_name
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    JOIN users u_res ON res.user_id = u_res.id
    LEFT JOIN assignments a ON wr.id = a.request_id
    LEFT JOIN collectors c ON a.collector_id = c.id
    LEFT JOIN users u_col ON c.user_id = u_col.id
    WHERE {$whereSql}
    ORDER BY wr.created_at DESC
");
$auditStmt->execute($params);
$auditRecords = $auditStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leadership Monitoring - Nabutiti Waste System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        #hotspotMap { height: 420px; border-radius: 0.75rem; }
        .kpi-card { border-radius: 0.75rem; border: none; }
        .chart-container { position: relative; height: 260px; }
    </style>
</head>
<body class="bg-light pb-5">

    <!-- Top Navigation -->
    <nav class="navbar navbar-dark bg-dark sticky-top border-bottom border-info">
        <div class="container-fluid px-lg-4">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="../index.php">
                <i class="bi bi-bar-chart-line-fill text-info fs-4"></i>
                <span>Nabutiti WasteGuard &bull; Monitoring Officer</span>
            </a>
            <div class="d-flex align-items-center gap-3">
                <span class="text-white small d-none d-md-inline">
                    <i class="bi bi-award-fill text-info me-1"></i> <?= e($user['name']) ?> (LC1 Chairperson)
                </span>
                <a href="../auth/logout.php" class="btn btn-outline-light btn-sm">Sign Out</a>
            </div>
        </div>
    </nav>

    <div class="container-fluid px-lg-4 mt-4">

        <!-- Header & Filter Bar -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="row align-items-center g-3">
                <div class="col-lg-5">
                    <h4 class="fw-bold mb-1 text-dark">Nabutiti Village Environmental Monitoring</h4>
                    <p class="text-muted small mb-0">KPI metrics, dumping hotspot surveillance & audit compliance</p>
                </div>
                <div class="col-lg-7">
                    <form method="GET" action="dashboard.php" class="row g-2 justify-content-lg-end">
                        <div class="col-auto">
                            <label class="form-label small text-muted mb-0 d-block">Sub-Zone</label>
                            <select name="zone" class="form-select form-select-sm">
                                <option value="All" <?= $selectedZone === 'All' ? 'selected' : '' ?>>All Nabutiti Zones</option>
                                <option value="Zone A" <?= $selectedZone === 'Zone A' ? 'selected' : '' ?>>Zone A (Hilltop)</option>
                                <option value="Zone B" <?= $selectedZone === 'Zone B' ? 'selected' : '' ?>>Zone B (Market Rd)</option>
                                <option value="Central" <?= $selectedZone === 'Central' ? 'selected' : '' ?>>Central Parish</option>
                                <option value="Valley" <?= $selectedZone === 'Valley' ? 'selected' : '' ?>>Valley Wetland</option>
                            </select>
                        </div>
                        <div class="col-auto">
                            <label class="form-label small text-muted mb-0 d-block">From</label>
                            <input type="date" name="start_date" class="form-control form-control-sm" value="<?= e($startDate) ?>">
                        </div>
                        <div class="col-auto">
                            <label class="form-label small text-muted mb-0 d-block">To</label>
                            <input type="date" name="end_date" class="form-control form-control-sm" value="<?= e($endDate) ?>">
                        </div>
                        <div class="col-auto align-self-end">
                            <button type="submit" class="btn btn-sm btn-info text-white">Apply Filter</button>
                            <a href="../api/export_csv.php?zone=<?= urlencode($selectedZone) ?>&start_date=<?= urlencode($startDate) ?>&end_date=<?= urlencode($endDate) ?>" class="btn btn-sm btn-success">
                                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Export CSV
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- 4 Key Required KPIs -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card kpi-card bg-white shadow-sm p-3 border-start border-4 border-success">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-secondary small fw-semibold">Collection Completion Rate</span>
                        <i class="bi bi-check-circle text-success fs-5"></i>
                    </div>
                    <div class="h3 fw-bold text-success mb-1 mt-2"><?= $completionRate ?>%</div>
                    <small class="text-muted"><?= $completedRequests ?> of <?= $totalRequests ?> requests fulfilled</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card kpi-card bg-white shadow-sm p-3 border-start border-4 border-primary">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-secondary small fw-semibold">Average Response Time</span>
                        <i class="bi bi-stopwatch text-primary fs-5"></i>
                    </div>
                    <div class="h3 fw-bold text-primary mb-1 mt-2"><?= $avgResponseHours ?> hrs</div>
                    <small class="text-muted">From submission to dispatch</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card kpi-card bg-white shadow-sm p-3 border-start border-4 border-danger">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-secondary small fw-semibold">Overdue Collections Count</span>
                        <i class="bi bi-alarm text-danger fs-5"></i>
                    </div>
                    <div class="h3 fw-bold text-danger mb-1 mt-2"><?= $overdueRequests ?></div>
                    <small class="text-muted">Uncollected past scheduled date</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card kpi-card bg-white shadow-sm p-3 border-start border-4 border-info">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-secondary small fw-semibold">Complaint Resolution Rate</span>
                        <i class="bi bi-shield-check text-info fs-5"></i>
                    </div>
                    <div class="h3 fw-bold text-info mb-1 mt-2"><?= $complaintResolutionRate ?>%</div>
                    <small class="text-muted"><?= $resolvedComplaints ?> resolved of <?= $totalComplaints ?> logged</small>
                </div>
            </div>
        </div>

        <!-- Hotspot Map Section -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div>
                    <h5 class="fw-bold text-dark mb-0">
                        <i class="bi bi-geo-alt-fill text-danger me-2"></i>Nabutiti Village Hotspot Map (Dumping & Active Requests)
                    </h5>
                    <small class="text-muted">Real-time surveillance across Zone A, Zone B, Central, and Valley drainage wetlands</small>
                </div>
                <div class="d-flex gap-3 small">
                    <span class="d-flex align-items-center gap-1"><span class="badge bg-danger rounded-circle p-1"> </span> Illegal Dump</span>
                    <span class="d-flex align-items-center gap-1"><span class="badge bg-warning rounded-circle p-1"> </span> Pending Collection</span>
                </div>
            </div>
            <div id="hotspotMap"></div>
        </div>

        <!-- Visual Analytics with Chart.js -->
        <div class="row g-4 mb-4">
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h6 class="fw-bold text-dark mb-3">Waste Categories Collected (Volume Distribution)</h6>
                    <div class="chart-container">
                        <canvas id="wasteChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
                    <h6 class="fw-bold text-dark mb-3">Sub-Zone Collection Performance</h6>
                    <div class="chart-container">
                        <canvas id="zoneChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Filterable Audit Table -->
        <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark mb-0">Waste Audit Records</h5>
                <span class="badge bg-light border text-dark"><?= count($auditRecords) ?> records match criteria</span>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                        <tr>
                            <th>Ref</th>
                            <th>Sub-Zone / Plot</th>
                            <th>Resident</th>
                            <th>Waste Category</th>
                            <th>Scheduled Date</th>
                            <th>Assigned Collector</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($auditRecords as $rec): ?>
                            <tr>
                                <td class="fw-bold">#WR-<?= str_pad((string)$rec['id'], 4, '0', STR_PAD_LEFT) ?></td>
                                <td>
                                    <span class="badge bg-secondary-subtle text-dark border"><?= e($rec['zone_name']) ?></span>
                                    <small class="text-muted d-block">Plot: <?= e($rec['household_no']) ?></small>
                                </td>
                                <td><?= e($rec['resident_name']) ?></td>
                                <td><span class="badge bg-dark"><?= e($rec['waste_type']) ?></span></td>
                                <td class="small"><?= date('M d, Y', strtotime($rec['scheduled_date'])) ?></td>
                                <td class="small"><?= $rec['collector_name'] ? e($rec['collector_name']) : '<span class="text-muted">Unassigned</span>' ?></td>
                                <td>
                                    <span class="badge bg-light border text-dark"><?= e($rec['status']) ?></span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <script>
        // Leaflet Hotspot Map
        const map = L.map('hotspotMap').setView([0.2845, 32.6072], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Plot Illegal Dumping Incidents (Red Circle Markers)
        const dumpings = <?= json_encode($dumpingHotspots) ?>;
        dumpings.forEach(d => {
            const circle = L.circleMarker([d.latitude, d.longitude], {
                color: '#dc2626',
                fillColor: '#ef4444',
                fillOpacity: 0.8,
                radius: 10
            }).addTo(map);
            circle.bindPopup(`
                <div style="font-size: 13px;">
                    <strong style="color: #dc2626;"><i class="bi bi-exclamation-triangle-fill"></i> Illegal Dump Reported</strong><br>
                    <strong>Location:</strong> ${d.location_desc}<br>
                    <strong>Status:</strong> ${d.status}<br>
                    <small class="text-muted">Logged: ${d.created_at}</small>
                </div>
            `);
        });

        // Plot Active Waste Requests (Yellow Markers)
        const requests = <?= json_encode($openRequestPins) ?>;
        requests.forEach(r => {
            const circle = L.circleMarker([r.latitude, r.longitude], {
                color: '#d97706',
                fillColor: '#f59e0b',
                fillOpacity: 0.8,
                radius: 7
            }).addTo(map);
            circle.bindPopup(`
                <div style="font-size: 13px;">
                    <strong>#WR-${r.id} (${r.waste_type})</strong><br>
                    <strong>Zone:</strong> ${r.zone_name}<br>
                    <strong>Landmark:</strong> ${r.address_landmark}<br>
                    <span class="badge bg-warning text-dark mt-1">${r.status}</span>
                </div>
            `);
        });

        // Chart.js: Waste Types Distribution
        const wasteData = <?= json_encode($wasteTypesData) ?>;
        const wasteLabels = wasteData.map(d => d.waste_type);
        const wasteCounts = wasteData.map(d => parseInt(d.cnt));

        new Chart(document.getElementById('wasteChart'), {
            type: 'doughnut',
            data: {
                labels: wasteLabels.length ? wasteLabels : ['Organic', 'General', 'Recyclable', 'Hazardous'],
                datasets: [{
                    data: wasteCounts.length ? wasteCounts : [40, 25, 20, 15],
                    backgroundColor: ['#16a34a', '#475569', '#2563eb', '#dc2626'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });

        // Chart.js: Sub-Zone Collection Performance
        const zoneData = <?= json_encode($zoneStats) ?>;
        const zoneLabels = zoneData.map(d => d.zone_name);
        const totalByZone = zoneData.map(d => parseInt(d.total_requests || 0));
        const completedByZone = zoneData.map(d => parseInt(d.completed_count || 0));

        new Chart(document.getElementById('zoneChart'), {
            type: 'bar',
            data: {
                labels: zoneLabels.length ? zoneLabels : ['Zone A', 'Zone B', 'Central', 'Valley'],
                datasets: [
                    {
                        label: 'Total Requests',
                        data: totalByZone.length ? totalByZone : [10, 18, 12, 14],
                        backgroundColor: '#94a3b8'
                    },
                    {
                        label: 'Completed',
                        data: completedByZone.length ? completedByZone : [8, 14, 10, 9],
                        backgroundColor: '#16a34a'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { position: 'bottom' } }
            }
        });
    </script>
</body>
</html>

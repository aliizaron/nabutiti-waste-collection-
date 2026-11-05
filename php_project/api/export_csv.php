<?php
/**
 * API: Export Filtered Audit Report as CSV
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

// Allow admin and leader roles to export
requireRole(['admin', 'leader']);

$selectedZone = $_GET['zone'] ?? 'All';
$startDate    = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate      = $_GET['end_date'] ?? date('Y-m-d');

$pdo = Database::getInstance()->getConnection();

$whereParts = ["DATE(wr.created_at) BETWEEN ? AND ?"];
$params = [$startDate, $endDate];

if ($selectedZone !== 'All') {
    $whereParts[] = "res.zone_name = ?";
    $params[] = $selectedZone;
}
$whereSql = implode(' AND ', $whereParts);

$stmt = $pdo->prepare("
    SELECT wr.id AS request_id, 
           res.zone_name, 
           res.household_no, 
           u_res.name AS resident_name, 
           u_res.phone AS resident_phone,
           wr.waste_type, 
           wr.description, 
           wr.address_landmark,
           wr.latitude,
           wr.longitude,
           wr.scheduled_date, 
           wr.status, 
           wr.created_at,
           u_col.name AS collector_name,
           c.vehicle_reg_no,
           a.assigned_at,
           cr.completion_time,
           cr.collector_notes
    FROM waste_requests wr
    JOIN residents res ON wr.resident_id = res.id
    JOIN users u_res ON res.user_id = u_res.id
    LEFT JOIN assignments a ON wr.id = a.request_id
    LEFT JOIN collectors c ON a.collector_id = c.id
    LEFT JOIN users u_col ON c.user_id = u_col.id
    LEFT JOIN collection_records cr ON a.id = cr.assignment_id
    WHERE {$whereSql}
    ORDER BY wr.created_at DESC
");
$stmt->execute($params);
$rows = $stmt->fetchAll();

$filename = sprintf("nabutiti_waste_audit_%s_%s.csv", $selectedZone, date('Ymd_His'));

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');

// Write UTF-8 BOM for Excel compatibility
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Header columns
fputcsv($output, [
    'Order Ref',
    'Sub-Zone',
    'Household Plot',
    'Resident Name',
    'Phone',
    'Waste Type',
    'Description',
    'Pickup Landmark',
    'Latitude',
    'Longitude',
    'Scheduled Date',
    'Status',
    'Submission Time',
    'Assigned Collector',
    'Vehicle Reg No',
    'Assigned At',
    'Completion Time',
    'Collector Notes'
]);

foreach ($rows as $r) {
    fputcsv($output, [
        'WR-' . str_pad((string)$r['request_id'], 4, '0', STR_PAD_LEFT),
        $r['zone_name'],
        $r['household_no'],
        $r['resident_name'],
        $r['resident_phone'],
        $r['waste_type'],
        $r['description'],
        $r['address_landmark'],
        $r['latitude'],
        $r['longitude'],
        $r['scheduled_date'],
        $r['status'],
        $r['created_at'],
        $r['collector_name'] ?? 'Unassigned',
        $r['vehicle_reg_no'] ?? 'N/A',
        $r['assigned_at'] ?? 'N/A',
        $r['completion_time'] ?? 'N/A',
        $r['collector_notes'] ?? 'None'
    ]);
}

fclose($output);
exit;

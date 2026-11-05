<?php
/**
 * API: Get Hotspots GeoJSON / JSON
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = Database::getInstance()->getConnection();

    // Fetch Illegal Dumping Incidents
    $dumpings = $pdo->query("
        SELECT id, location_desc, latitude, longitude, photo_path, status, created_at 
        FROM dumping_reports 
        ORDER BY created_at DESC
    ")->fetchAll();

    // Fetch Active & Overdue Waste Requests
    $requests = $pdo->query("
        SELECT wr.id, wr.waste_type, wr.description, wr.latitude, wr.longitude, 
               wr.address_landmark, wr.status, wr.scheduled_date, res.zone_name
        FROM waste_requests wr
        JOIN residents res ON wr.resident_id = res.id
        WHERE wr.status IN ('Pending', 'Assigned', 'In_Progress', 'Overdue')
    ")->fetchAll();

    echo json_encode([
        'success'  => true,
        'dumpings' => $dumpings,
        'requests' => $requests,
        'center'   => ['lat' => 0.2845, 'lng' => 32.6072, 'village' => 'Nabutiti Village, Kansanga']
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

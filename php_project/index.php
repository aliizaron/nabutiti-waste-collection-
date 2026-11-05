<?php
/**
 * Landing Page & Case Study Overview
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study of Nabutiti Village, Kansanga, Kampala
 */

require_once __DIR__ . '/config/session.php';
$isLoggedIn = !empty($_SESSION['user_id']);
$userRole = $_SESSION['role'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nabutiti Village Waste Management & Monitoring System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        :root {
            --brand-green: #15803d;
            --brand-dark: #0f172a;
        }
        .hero-banner {
            background: linear-gradient(135deg, #14532d 0%, #166534 50%, #064e3b 100%);
            color: #ffffff;
            padding: 4.5rem 0 3.5rem;
        }
        .feature-card {
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .feature-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
        }
    </style>
</head>
<body class="bg-light">

    <!-- Header Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-success">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="index.php">
                <i class="bi bi-recycle text-success fs-4"></i>
                <span>Nabutiti WasteGuard</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navMenu">
                <ul class="navbar-nav ms-auto align-items-center gap-2">
                    <li class="nav-item"><a class="nav-link active" href="index.php">Home</a></li>
                    <?php if ($isLoggedIn): ?>
                        <li class="nav-item">
                            <a class="nav-link fw-semibold text-warning" href="<?= $userRole ?>/dashboard.php">
                                <i class="bi bi-speedometer2 me-1"></i> My Dashboard (<?= ucfirst($userRole) ?>)
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-outline-light btn-sm ms-2" href="auth/logout.php">Sign Out</a>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link" href="auth/login.php">Sign In</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-success btn-sm px-3 ms-2" href="auth/register.php">Resident Sign Up</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero-banner">
        <div class="container text-center text-lg-start">
            <div class="row align-items-center g-5">
                <div class="col-lg-7">
                    <p class="badge bg-success-subtle text-success-emphasis border border-success px-3 py-2 rounded-pill fs-6 mb-3">
                        <i class="bi bi-geo-alt-fill me-1"></i> Kansanga, Makindye Division, Kampala
                    </p>
                    <h1 class="display-5 fw-extrabold mb-3">
                        Waste Collection Management & Monitoring System
                    </h1>
                    <p class="lead text-white-50 mb-4">
                        A specialized digital infrastructure for Nabutiti Village addressing urban solid waste collection, dispatch coordination, illegal dumping prevention, and community environmental accountability.
                    </p>
                    <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                        <?php if ($isLoggedIn): ?>
                            <a href="<?= $userRole ?>/dashboard.php" class="btn btn-warning btn-lg px-4 fw-bold">
                                Go to <?= ucfirst($userRole) ?> Workspace
                            </a>
                        <?php else: ?>
                            <a href="auth/login.php" class="btn btn-warning btn-lg px-4 fw-bold">
                                Access System Portal
                            </a>
                            <a href="auth/register.php" class="btn btn-outline-light btn-lg px-4">
                                Register Household
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="card bg-white text-dark shadow-lg border-0 rounded-4 p-4">
                        <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
                            <i class="bi bi-person-badge text-success me-2"></i>Quick Role Access Demo
                        </h5>
                        <p class="small text-muted mb-3">Login with pre-seeded accounts (Password: <code>Password123!</code>):</p>
                        <div class="list-group list-group-flush gap-2">
                            <a href="auth/login.php?demo=resident" class="list-group-item list-group-item-action border rounded p-2.5 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold text-success"><i class="bi bi-house me-1"></i> Resident / Household</div>
                                    <div class="small text-secondary">resident@nabutiti.go.ug (Brenda, Zone B)</div>
                                </div>
                                <i class="bi bi-arrow-right-short fs-5 text-muted"></i>
                            </a>
                            <a href="auth/login.php?demo=collector" class="list-group-item list-group-item-action border rounded p-2.5 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold text-primary"><i class="bi bi-truck me-1"></i> Waste Collector</div>
                                    <div class="small text-secondary">collector@nabutiti.go.ug (John, Truck UBE 418K)</div>
                                </div>
                                <i class="bi bi-arrow-right-short fs-5 text-muted"></i>
                            </a>
                            <a href="auth/login.php?demo=admin" class="list-group-item list-group-item-action border rounded p-2.5 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold text-danger"><i class="bi bi-shield-check me-1"></i> Administrator</div>
                                    <div class="small text-secondary">admin@nabutiti.go.ug (Kato, Sanitation Officer)</div>
                                </div>
                                <i class="bi bi-arrow-right-short fs-5 text-muted"></i>
                            </a>
                            <a href="auth/login.php?demo=leader" class="list-group-item list-group-item-action border rounded p-2.5 d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="fw-bold text-info"><i class="bi bi-bar-chart-fill me-1"></i> Local Leader (LC1)</div>
                                    <div class="small text-secondary">leader@nabutiti.go.ug (Hon. Grace Nalubega)</div>
                                </div>
                                <i class="bi bi-arrow-right-short fs-5 text-muted"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Key Modules Section -->
    <main class="container py-5">
        <div class="row g-4 mb-5">
            <div class="col-md-3">
                <div class="feature-card bg-white p-4 h-100">
                    <div class="p-3 bg-success-subtle text-success rounded-3 d-inline-block mb-3">
                        <i class="bi bi-pin-map-fill fs-3"></i>
                    </div>
                    <h5 class="fw-bold mb-2">Household Requests</h5>
                    <p class="text-secondary small mb-0">Residents tag collection points with GPS pins, categorize waste (Organic, Recyclables, Hazardous, General), and track collection trucks.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="feature-card bg-white p-4 h-100">
                    <div class="p-3 bg-primary-subtle text-primary rounded-3 d-inline-block mb-3">
                        <i class="bi bi-geo-alt-fill fs-3"></i>
                    </div>
                    <h5 class="fw-bold mb-2">Collector Waypoints</h5>
                    <p class="text-secondary small mb-0">Collectors follow daily routes organized by Nabutiti sub-zones, record job statuses, and submit timestamped proof-of-service photos.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="feature-card bg-white p-4 h-100">
                    <div class="p-3 bg-danger-subtle text-danger rounded-3 d-inline-block mb-3">
                        <i class="bi bi-exclamation-triangle-fill fs-3"></i>
                    </div>
                    <h5 class="fw-bold mb-2">Dumping Hotspots</h5>
                    <p class="text-secondary small mb-0">Citizens report illegal roadside dumping, clogged drainage channels, and overflowing bins with real coordinates for prompt cleanup.</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="feature-card bg-white p-4 h-100">
                    <div class="p-3 bg-info-subtle text-info rounded-3 d-inline-block mb-3">
                        <i class="bi bi-graph-up-arrow fs-3"></i>
                    </div>
                    <h5 class="fw-bold mb-2">Leadership Analytics</h5>
                    <p class="text-secondary small mb-0">LC1 chairpersons and Makindye Division inspectors access real-time completion rates, overdue audits, and downloadable CSV compliance reports.</p>
                </div>
            </div>
        </div>

        <!-- Village Sub-Zones Profile -->
        <div class="card border-0 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
            <h4 class="fw-bold text-dark mb-1">Nabutiti Village Sub-Zones (Kansanga Parish)</h4>
            <p class="text-muted small mb-4">Operational zoning demarcations utilized by collectors and community health workers.</p>
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="border rounded-3 p-3 bg-light">
                        <span class="badge bg-success mb-2">Zone A</span>
                        <h6 class="fw-bold mb-1">Upper Ridge / Hilltop</h6>
                        <p class="small text-muted mb-0">Steep topography, water tank boundary, primarily residential compounds with narrow access roads.</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="border rounded-3 p-3 bg-light">
                        <span class="badge bg-primary mb-2">Zone B</span>
                        <h6 class="fw-bold mb-1">Market Road & Commercial</h6>
                        <p class="small text-muted mb-0">High-density zone containing grocery stalls, food kiosks, and schools bordering Kansanga center.</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="border rounded-3 p-3 bg-light">
                        <span class="badge bg-warning text-dark mb-2">Central</span>
                        <h6 class="fw-bold mb-1">Kansanga Parish Border</h6>
                        <p class="small text-muted mb-0">Transit thoroughfare with commercial apartments, youth centers, and heavy daily foot traffic.</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="border rounded-3 p-3 bg-light">
                        <span class="badge bg-danger mb-2">Valley</span>
                        <h6 class="fw-bold mb-1">Wetland Buffer & Basin</h6>
                        <p class="small text-muted mb-0">Ecologically vulnerable drainage basin prone to plastic blockages during heavy rainy seasons.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white-50 py-4 mt-5">
        <div class="container text-center small">
            <p class="mb-1 text-white">Nabutiti Village Waste Collection Management & Monitoring System</p>
            <p class="mb-0">Academic & Municipal Case Study &bull; Kansanga Parish &bull; Makindye Division, Kampala Capital City Authority (KCCA)</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

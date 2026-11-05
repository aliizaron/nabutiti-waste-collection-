# Web-Based Waste Collection Management and Monitoring System
### Case Study of Nabutiti Village, Kansanga, Makindye Division, Kampala, Uganda

This is a production-ready, pure native PHP 8+ and MySQL web application designed to manage community solid waste collection, collector logistics, illegal dumping surveillance, and local leadership environmental analytics.

---

## 1. System Requirements & Architecture
- **PHP:** 8.0 or higher with PDO and `pdo_mysql` extensions enabled.
- **Database:** MySQL 8.0+ or MariaDB 10.5+ with InnoDB support.
- **Web Server:** Apache 2.4+ (with `mod_rewrite`) or Nginx.
- **Frontend Stack:** Bootstrap 5.3, Bootstrap Icons, Leaflet.js (OpenStreetMap), Chart.js 4.4.
- **Security:** CSRF token verification on all POST requests, `password_hash()` (BCRYPT), parameterized PDO queries against SQL injection, strict RBAC middleware, and MIME-validated image uploads.

---

## 2. Deployment Instructions (XAMPP / WAMP / LAMP)

### Step 1: Copy Project Files
Place the `php_project` directory into your web server's root:
- **XAMPP:** `C:\xampp\htdocs\nabutiti_waste`
- **WAMP:** `C:\wamp64\www\nabutiti_waste`
- **Linux (Apache):** `/var/www/html/nabutiti_waste`

### Step 2: Import MySQL Database
1. Open phpMyAdmin (`http://localhost/phpmyadmin`) or your MySQL CLI:
   ```bash
   mysql -u root -p < schema.sql
   ```
2. This creates the database `nabutiti_waste_db` and seeds it with sub-zones, users, vehicles, and sample coordinates.

### Step 3: Configure Database Credentials
Open `config/db.php` and verify or set your database credentials:
```php
private string $host = '127.0.0.1';
private string $db   = 'nabutiti_waste_db';
private string $user = 'root';
private string $pass = ''; // your MySQL password
```
*(Alternatively, set environment variables `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`).*

### Step 4: Ensure Directory Permissions
Grant write permissions to the `uploads/` folder for proof photos and waste images:
```bash
chmod -R 775 uploads/
```

### Step 5: Launch in Browser
Visit: `http://localhost/nabutiti_waste/index.php`

---

## 3. Pre-Seeded User Accounts (All Passwords: `Password123!`)

| Role | Email | Name & Details |
|---|---|---|
| **Resident** | `resident@nabutiti.go.ug` | Brenda Nakato (Plot NAB-Z2-042, Zone B - Market Road) |
| **Waste Collector** | `collector@nabutiti.go.ug` | John Ssemwogerere (Truck UBE 418K, Zone B) |
| **Administrator** | `admin@nabutiti.go.ug` | Kato Ronald (Sanitation & Dispatch Officer) |
| **Local Leader (LC1)**| `leader@nabutiti.go.ug` | Hon. Grace Nalubega (Nabutiti LC1 Chairperson) |

---

## 4. Key Workflows & Features

1. **Resident Portal (`resident/dashboard.php`):**
   - Submit collection requests with GPS map pin picker on Nabutiti Village map.
   - Report illegal dumping heaps with geo-tagging and photo evidence.
   - Real-time status progression (`Pending` -> `Assigned` -> `In Progress` -> `Completed` / `Overdue`).
   - File service complaints and review admin replies.

2. **Collector Portal (`collector/dashboard.php`):**
   - View assigned daily route and waypoint markers in Nabutiti Village.
   - Update job execution states.
   - Upload proof-of-collection photos with field notes upon completion.

3. **Administrator Desk (`admin/dashboard.php`):**
   - Dispatch engine matching pending requests to available collector trucks.
   - Automated overdue flagger for requests uncollected past scheduled date.
   - Resolve resident complaints with official written responses.
   - Toggle collector availability.

4. **Local Leader Analytics (`leader/dashboard.php`):**
   - Real-time KPIs: Completion Rate %, Avg Response Time (hrs), Overdue Count, Complaint Resolution %.
   - Interactive Leaflet.js hotspot map highlighting dumping sites and active collection requests.
   - Chart.js breakdowns of waste categories (Organic, Recyclables, General, Hazardous).
   - Filterable audit table with one-click streaming CSV export (`api/export_csv.php`).

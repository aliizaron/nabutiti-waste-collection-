-- =====================================================================
-- Web-Based Waste Collection Management and Monitoring System
-- Case Study: Nabutiti Village, Kansanga, Makindye Division, Kampala, Uganda
-- Database Schema & Comprehensive Seed Data
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `nabutiti_waste_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `nabutiti_waste_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `dumping_reports`;
DROP TABLE IF EXISTS `collection_records`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `waste_requests`;
DROP TABLE IF EXISTS `collectors`;
DROP TABLE IF EXISTS `residents`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Users Table
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('resident', 'collector', 'admin', 'leader') NOT NULL DEFAULT 'resident',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Residents Profile Table
-- ---------------------------------------------------------------------
CREATE TABLE `residents` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `household_no` VARCHAR(50) NOT NULL,
  `zone_name` ENUM('Zone A', 'Zone B', 'Central', 'Valley') NOT NULL,
  `landmark` VARCHAR(255) NOT NULL,
  CONSTRAINT `fk_residents_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_resident_zone` (`zone_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Waste Collectors Profile Table
-- ---------------------------------------------------------------------
CREATE TABLE `collectors` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `vehicle_reg_no` VARCHAR(40) NOT NULL,
  `assigned_zone` ENUM('Zone A', 'Zone B', 'Central', 'Valley', 'All') NOT NULL DEFAULT 'All',
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT `fk_collectors_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_collector_available` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Waste Collection Requests Table
-- ---------------------------------------------------------------------
CREATE TABLE `waste_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `resident_id` INT UNSIGNED NOT NULL,
  `waste_type` ENUM('Organic', 'Recyclable', 'Hazardous', 'General') NOT NULL,
  `description` TEXT NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `address_landmark` VARCHAR(255) NOT NULL,
  `photo_path` VARCHAR(255) NULL,
  `scheduled_date` DATE NOT NULL,
  `status` ENUM('Pending', 'Assigned', 'In_Progress', 'Completed', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_requests_residents` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  INDEX `idx_request_status` (`status`),
  INDEX `idx_request_scheduled` (`scheduled_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Collector Assignments Table
-- ---------------------------------------------------------------------
CREATE TABLE `assignments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT UNSIGNED NOT NULL UNIQUE,
  `collector_id` INT UNSIGNED NOT NULL,
  `assigned_by` INT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assign_request` FOREIGN KEY (`request_id`) REFERENCES `waste_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assign_collector` FOREIGN KEY (`collector_id`) REFERENCES `collectors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assign_admin` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_assign_collector` (`collector_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Collection Records / Proof Table
-- ---------------------------------------------------------------------
CREATE TABLE `collection_records` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT UNSIGNED NOT NULL UNIQUE,
  `completion_time` DATETIME NOT NULL,
  `proof_photo` VARCHAR(255) NOT NULL,
  `collector_notes` TEXT NULL,
  CONSTRAINT `fk_records_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Illegal Dumping Reports Table
-- ---------------------------------------------------------------------
CREATE TABLE `dumping_reports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reporter_id` INT UNSIGNED NOT NULL,
  `location_desc` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `photo_path` VARCHAR(255) NULL,
  `status` ENUM('Reported', 'Investigating', 'Cleared') NOT NULL DEFAULT 'Reported',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_dumping_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_dumping_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Complaints Table
-- ---------------------------------------------------------------------
CREATE TABLE `complaints` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `resident_id` INT UNSIGNED NOT NULL,
  `request_id` INT UNSIGNED NULL,
  `complaint_text` TEXT NOT NULL,
  `status` ENUM('Open', 'Under_Review', 'Resolved') NOT NULL DEFAULT 'Open',
  `admin_response` TEXT NULL,
  `resolved_at` DATETIME NULL,
  CONSTRAINT `fk_complaints_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_request` FOREIGN KEY (`request_id`) REFERENCES `waste_requests` (`id`) ON DELETE SET NULL,
  INDEX `idx_complaints_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. Activity Logs Table
-- ---------------------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_logs_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Realistic Seed Data for Nabutiti Village, Kansanga, Kampala
-- Password for all seed users is: Password123!
-- Pre-hashed via PHP password_hash('Password123!', PASSWORD_BCRYPT)
-- $2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m
-- =====================================================================

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `status`, `created_at`) VALUES
(1, 'Kato Ronald', 'admin@nabutiti.go.ug', '+256772100200', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'admin', 'active', '2026-09-01 08:00:00'),
(2, 'Hon. Grace Nalubega', 'leader@nabutiti.go.ug', '+256782345678', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'leader', 'active', '2026-09-01 08:30:00'),
(3, 'John Ssemwogerere', 'collector@nabutiti.go.ug', '+256701987654', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'collector', 'active', '2026-09-02 09:00:00'),
(4, 'Peter Mukasa', 'peter.collector@nabutiti.go.ug', '+256703445566', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'collector', 'active', '2026-09-03 09:00:00'),
(5, 'Brenda Nakato', 'resident@nabutiti.go.ug', '+256752112233', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'resident', 'active', '2026-09-05 10:15:00'),
(6, 'David Sserunjogi', 'david.s@nabutiti.go.ug', '+256754889900', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'resident', 'active', '2026-09-06 11:20:00'),
(7, 'Sarah Namubiru', 'sarah.n@nabutiti.go.ug', '+256778991122', '$2y$10$wT2m7zB6kZ3j9fV4Y/mG..y6Hk9Zq9fW6Yt9uQv5E7r1s0o2p4i8m', 'resident', 'active', '2026-09-07 14:00:00');

-- Collectors profiles
INSERT INTO `collectors` (`id`, `user_id`, `vehicle_reg_no`, `assigned_zone`, `is_available`) VALUES
(1, 3, 'UBE 418K (Tipper Truck)', 'Zone B', 1),
(2, 4, 'UBA 902M (Tricycle Hauler)', 'Central', 1);

-- Residents profiles (Sub-zones of Nabutiti Village)
INSERT INTO `residents` (`id`, `user_id`, `household_no`, `zone_name`, `landmark`) VALUES
(1, 5, 'NAB-Z2-042', 'Zone B', 'Near Kansanga Market Road, behind St. Kizito Primary'),
(2, 6, 'NAB-VA-118', 'Valley', 'Lower Nabutiti Wetland boundary, near wooden footbridge'),
(3, 7, 'NAB-ZA-015', 'Zone A', 'Upper Nabutiti Ridge, next to Water Tank hill');

-- Waste collection requests (Coordinates anchored in Nabutiti / Kansanga, Kampala: 0.2845 N, 32.6072 E)
INSERT INTO `waste_requests` (`id`, `resident_id`, `waste_type`, `description`, `latitude`, `longitude`, `address_landmark`, `photo_path`, `scheduled_date`, `status`, `created_at`) VALUES
(1, 1, 'Organic', '3 bags of household peelings, banana leaves, and garden trim', 0.28482000, 32.60714000, 'Plot 14, Zone B, Kansanga Market Lane', 'uploads/requests/waste_sample1.jpg', '2026-10-18', 'Assigned', '2026-10-17 09:30:00'),
(2, 2, 'General', 'Commercial retail packaging and cardboard bundles', 0.28315000, 32.60940000, 'Valley Corner, near Footbridge kiosk', 'uploads/requests/waste_sample2.jpg', '2026-10-18', 'In_Progress', '2026-10-17 11:15:00'),
(3, 3, 'Recyclable', '120 crushed plastic mineral water bottles & aluminum beverage tins', 0.28720000, 32.60480000, 'Zone A Hilltop, opp. Community Water Stand', 'uploads/requests/waste_sample3.jpg', '2026-10-16', 'Completed', '2026-10-15 14:20:00'),
(4, 1, 'Hazardous', 'Used vehicle motor oil drums and discarded chemical containers', 0.28510000, 32.60680000, 'Garage corner near Zone B Junction', 'uploads/requests/waste_sample4.jpg', '2026-10-14', 'Overdue', '2026-10-13 16:45:00'),
(5, 2, 'Organic', 'Market stall organic scrap and rotten vegetables', 0.28290000, 32.61020000, 'Valley drainage culvert path', NULL, '2026-10-19', 'Pending', '2026-10-18 07:10:00');

-- Assignments
INSERT INTO `assignments` (`id`, `request_id`, `collector_id`, `assigned_by`, `assigned_at`) VALUES
(1, 1, 1, 1, '2026-10-17 14:00:00'),
(2, 2, 1, 1, '2026-10-17 14:05:00'),
(3, 3, 2, 1, '2026-10-15 16:30:00');

-- Collection records / Proof
INSERT INTO `collection_records` (`id`, `assignment_id`, `completion_time`, `proof_photo`, `collector_notes`) VALUES
(1, 3, '2026-10-16 11:45:00', 'uploads/proofs/proof_rec_03.jpg', 'Successfully picked up all 120 plastic bottles and aluminum tins. Dispatched to Kansanga recycling depot.');

-- Illegal dumping incident reports
INSERT INTO `dumping_reports` (`id`, `reporter_id`, `location_desc`, `latitude`, `longitude`, `photo_path`, `status`, `created_at`) VALUES
(1, 5, 'Persistent roadside open heap blocking drainage stream near Valley bridge', 0.28380000, 32.60870000, 'uploads/dumping/dump_01.jpg', 'Investigating', '2026-10-16 17:00:00'),
(2, 6, 'Construction rubble and discarded foam dumped at night in Zone A wetland', 0.28190000, 32.61110000, 'uploads/dumping/dump_02.jpg', 'Reported', '2026-10-17 08:30:00'),
(3, 7, 'Overfilled community bin spilling onto pedestrian footpath', 0.28650000, 32.60520000, 'uploads/dumping/dump_03.jpg', 'Cleared', '2026-10-12 10:00:00');

-- Complaints
INSERT INTO `complaints` (`id`, `resident_id`, `request_id`, `complaint_text`, `status`, `admin_response`, `resolved_at`) VALUES
(1, 1, 4, 'Hazardous oil containers were scheduled for pickup on October 14th but truck has not visited yet.', 'Open', NULL, NULL),
(2, 2, NULL, 'Drainage trench near our household is choking with plastic bags after Sunday downpour.', 'Under_Review', 'Inspection team dispatched under Makindye Division sanitation unit.', NULL);

-- Activity logs
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `ip_address`, `created_at`) VALUES
(1, 1, 'System database initialized with Nabutiti Village sub-zones', '127.0.0.1', '2026-09-01 08:00:00'),
(2, 5, 'Resident Brenda Nakato submitted waste collection request #1', '192.168.1.45', '2026-10-17 09:30:00'),
(3, 1, 'Administrator dispatched Request #1 to Collector John Ssemwogerere', '192.168.1.10', '2026-10-17 14:00:00'),
(4, 3, 'Collector John Ssemwogerere confirmed pickup for Request #3 with photo proof', '192.168.1.88', '2026-10-16 11:45:00'),
(5, 5, 'Resident reported illegal dumping at Valley drainage stream', '192.168.1.45', '2026-10-16 17:00:00');

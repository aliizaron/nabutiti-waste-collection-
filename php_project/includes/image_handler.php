<?php
/**
 * Unified Backend Image Handler (Dual Base64 Camera Capture / File Upload)
 * Web-Based Waste Collection Management and Monitoring System
 * Nabutiti Village, Kansanga, Makindye Division, Kampala
 */

declare(strict_types=1);

/**
 * Process either Base64 live camera snapshot OR standard multipart $_FILES upload
 * 
 * @param string|null $base64_data Raw Base64 string from canvas (data:image/jpeg;base64,...)
 * @param array|null  $file_data   $_FILES['uploaded_file'] array
 * @param string      $target_dir  Target subdirectory relative or absolute (e.g. '../uploads/requests/')
 * @return string|null Relative image path for database persistence or null if no image was provided
 * @throws InvalidArgumentException|RuntimeException on validation or write failure
 */
function process_image_upload(?string $base64_data, ?array $file_data, string $target_dir = '../uploads/'): ?string {
    $allowed_mimes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];
    $max_bytes = 2 * 1024 * 1024; // 2MB Limit

    // Normalize target directory path
    $real_target_dir = rtrim($target_dir, '/') . '/';
    if (!is_dir($real_target_dir)) {
        if (!mkdir($real_target_dir, 0755, true) && !is_dir($real_target_dir)) {
            throw new RuntimeException("Target upload directory could not be created: {$real_target_dir}");
        }
    }

    // -------------------------------------------------------------
    // Path 1: Process Live WebRTC Camera Snapshot (Base64 data URI)
    // -------------------------------------------------------------
    if (!empty($base64_data) && is_string($base64_data) && str_starts_with($base64_data, 'data:image/')) {
        // Parse data URI format: data:image/jpeg;base64,.....
        if (!preg_match('/^data:(image\/[a-zA-Z0-9\+\-]+);base64,(.+)$/', $base64_data, $matches)) {
            throw new InvalidArgumentException('Malformed Base64 image payload from camera snapshot.');
        }

        $mime_type = strtolower($matches[1]);
        $encoded_data = $matches[2];

        if (!array_key_exists($mime_type, $allowed_mimes)) {
            throw new InvalidArgumentException("Invalid camera snapshot format ({$mime_type}). Only JPG, PNG, and WebP are allowed.");
        }

        $binary_data = base64_decode($encoded_data, true);
        if ($binary_data === false) {
            throw new RuntimeException('Failed to decode Base64 image stream.');
        }

        if (strlen($binary_data) > $max_bytes) {
            throw new RuntimeException('Captured camera snapshot exceeds maximum permitted size of 2MB.');
        }

        // Verify binary MIME using finfo
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detected_mime = $finfo->buffer($binary_data);
        if (!array_key_exists($detected_mime, $allowed_mimes)) {
            throw new InvalidArgumentException("Binary stream verification failed for MIME type: {$detected_mime}");
        }

        $extension = $allowed_mimes[$detected_mime];
        $unique_name = sprintf('cam_%s_%s.%s', bin2hex(random_bytes(8)), time(), $extension);
        $full_path = $real_target_dir . $unique_name;

        if (file_put_contents($full_path, $binary_data) === false) {
            throw new RuntimeException("Failed to write camera image to disk: {$full_path}");
        }

        // Return path formatted for web serving / DB
        $clean_relative = ltrim(str_replace('../', '', $real_target_dir), '/');
        return $clean_relative . $unique_name;
    }

    // -------------------------------------------------------------
    // Path 2: Process Standard Device File / Gallery Upload ($_FILES)
    // -------------------------------------------------------------
    if (!empty($file_data) && isset($file_data['error']) && $file_data['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($file_data['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException("File upload failed with system error code: {$file_data['error']}");
        }

        if ($file_data['size'] > $max_bytes) {
            throw new RuntimeException('Uploaded file exceeds maximum permitted size of 2MB.');
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $uploaded_mime = $finfo->file($file_data['tmp_name']);

        if (!array_key_exists($uploaded_mime, $allowed_mimes)) {
            throw new InvalidArgumentException("Invalid file format ({$uploaded_mime}). Only JPG, PNG, and WebP files are allowed.");
        }

        $extension = $allowed_mimes[$uploaded_mime];
        $unique_name = sprintf('file_%s_%s.%s', bin2hex(random_bytes(8)), time(), $extension);
        $full_path = $real_target_dir . $unique_name;

        if (!move_uploaded_file($file_data['tmp_name'], $full_path)) {
            throw new RuntimeException("Failed to move uploaded file to target location: {$full_path}");
        }

        $clean_relative = ltrim(str_replace('../', '', $real_target_dir), '/');
        return $clean_relative . $unique_name;
    }

    // No image provided (optional fields)
    return null;
}

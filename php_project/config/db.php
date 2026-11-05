<?php
/**
 * Database Connection Singleton (PDO)
 * Web-Based Waste Collection Management and Monitoring System
 * Case Study: Nabutiti Village, Kansanga, Kampala
 */

declare(strict_types=1);

class Database {
    private static ?Database $instance = null;
    private ?PDO $pdo = null;

    private string $host = '127.0.0.1';
    private string $db   = 'nabutiti_waste_db';
    private string $user = 'root';
    private string $pass = '';
    private string $charset = 'utf8mb4';
    private int $port    = 3306;

    private function __construct() {
        // Read environment variables if available
        $this->host = getenv('DB_HOST') ?: $this->host;
        $this->db   = getenv('DB_NAME') ?: $this->db;
        $this->user = getenv('DB_USER') ?: $this->user;
        $this->pass = getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : $this->pass;
        $this->port = getenv('DB_PORT') ? (int)getenv('DB_PORT') : $this->port;

        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_PERSISTENT         => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            die(json_encode([
                'success' => false,
                'error'   => 'Database connection failed. Please ensure MySQL is running and schema.sql has been imported.'
            ]));
        }
    }

    // Prevent cloning and unserialization
    private function __clone() {}
    public function __wakeup() {
        throw new \Exception("Cannot unserialize singleton");
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->pdo;
    }
}

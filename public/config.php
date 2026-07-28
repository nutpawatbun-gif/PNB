<?php
/**
 * MCU University Web Portal - Database Configuration
 * กรุณาตั้งค่าข้อมูลการเชื่อต่อฐานข้อมูล MySQL / phpMyAdmin ของท่านที่นี่
 */

define('DB_HOST', 'localhost');      // หรือ '127.0.0.1' หรือ '202.28.52.21'
define('DB_USER', 'mcupnb');         // DB User ตามที่โฮสต์กำหนด
define('DB_PASS', 'p2CwYsWYA3zP9Uzw'); // DB Password 
define('DB_NAME', 'mcupnb');         // ชื่อ Database (หากต่างจากนี้สามารถแก้ไขได้)
define('DB_PORT', '3306');

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";port=" . DB_PORT . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "error" => "Database connection failed",
            "message" => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

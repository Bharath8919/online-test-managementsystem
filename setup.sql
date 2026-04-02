CREATE DATABASE IF NOT EXISTS online_test;
USE online_test;

CREATE TABLE IF NOT EXISTS signup_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    dob DATE,
    profession VARCHAR(255),
    info TEXT,
    role VARCHAR(50) DEFAULT 'Student'
);

CREATE TABLE IF NOT EXISTS contactus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    message TEXT,
    reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin if not exists
INSERT IGNORE INTO signup_details (email, password, username, role) 
VALUES ('admin@gmail.com', 'admin123', 'Kota Bharath', 'Admin');

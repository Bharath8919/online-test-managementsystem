require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initialize() {
    try {
        // Connect without a specific database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log("Connected to MySQL successfully. Creating database...");
        
        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS online_test');
        console.log("Database online_test created or already exists.");
        
        // Use the database
        await connection.query('USE online_test');

        // Create signup_details table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS signup_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                username VARCHAR(255),
                dob DATE,
                profession VARCHAR(255),
                info TEXT,
                role VARCHAR(50) DEFAULT 'Student'
            )
        `);
        console.log("Table signup_details created or already exists.");

        // Create contactus table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contactus (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(20),
                message TEXT,
                reply TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table contactus created or already exists.");

        // Insert Admin
        await connection.query(`
            INSERT IGNORE INTO signup_details (email, password, username, role) 
            VALUES ('admin@gmail.com', 'admin123', 'Kota Bharath', 'Admin')
        `);
        console.log("Default admin user ensured.");

        await connection.end();
        console.log("Database initialization complete!");
        process.exit(0);
    } catch (error) {
        console.error("Initialization Failed:", error);
        process.exit(1);
    }
}

initialize();

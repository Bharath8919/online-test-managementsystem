require('dotenv').config();
const mysql = require('mysql2/promise');

async function initialize() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'online_test'
        });

        console.log("Connected. Creating password_resets table...");
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (email),
                INDEX (token)
            )
        `);
        console.log("Table password_resets created or already exists.");

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Initialization Failed:", error);
        process.exit(1);
    }
}

initialize();

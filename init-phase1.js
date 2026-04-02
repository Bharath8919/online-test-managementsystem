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

        console.log("Connected. Creating test_results table...");
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS test_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_email VARCHAR(255) NOT NULL,
                exam_name VARCHAR(100) NOT NULL,
                score INT NOT NULL,
                total_questions INT NOT NULL,
                date_taken TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table test_results created or already exists.");

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Initialization Failed:", error);
        process.exit(1);
    }
}

initialize();

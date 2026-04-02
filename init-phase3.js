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

        console.log("Connected. Creating questions table...");
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_name VARCHAR(100) NOT NULL,
                question_text TEXT NOT NULL,
                option_a VARCHAR(255) NOT NULL,
                option_b VARCHAR(255) NOT NULL,
                option_c VARCHAR(255) NOT NULL,
                option_d VARCHAR(255) NOT NULL,
                correct_option CHAR(1) NOT NULL
            )
        `);
        console.log("Table questions created or already exists.");

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Initialization Failed:", error);
        process.exit(1);
    }
}

initialize();

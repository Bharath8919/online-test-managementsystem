const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Adding explanation column to questions table...');
    try {
        await connection.execute('ALTER TABLE questions ADD COLUMN explanation TEXT');
        console.log('Migration successful!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            throw err;
        }
    }
    await connection.end();
}

migrate().catch(err => console.error(err));

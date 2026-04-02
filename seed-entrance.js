const mysql = require('mysql2/promise');
require('dotenv').config();

const entranceQuestions = [
    // JEE Physics
    {
        exam_name: 'JEE_PHYSICS',
        question_text: 'The dimensions of Planck\'s constant are the same as that of:',
        option_a: 'Energy',
        option_b: 'Linear momentum',
        option_c: 'Angular momentum',
        option_d: 'Intensity',
        correct_option: 'c'
    },
    {
        exam_name: 'JEE_PHYSICS',
        question_text: 'A bullet is fired from a rifle. If the rifle recoils freely, the kinetic energy of the rifle is:',
        option_a: 'Less than that of the bullet',
        option_b: 'More than that of the bullet',
        option_c: 'Same as that of the bullet',
        option_d: 'Zero',
        correct_option: 'a'
    },
    // JEE Maths
    {
        exam_name: 'JEE_MATHS',
        question_text: 'The value of lim (x->0) (sin x / x) is:',
        option_a: '0',
        option_b: '1',
        option_c: 'Infinity',
        option_d: 'Undefined',
        correct_option: 'b'
    },
    // NEET Biology
    {
        exam_name: 'NEET_BIOLOGY',
        question_text: 'Which of the following is known as the powerhouse of the cell?',
        option_a: 'Nucleus',
        option_b: 'Ribosome',
        option_c: 'Mitochondria',
        option_d: 'Golgi body',
        correct_option: 'c'
    },
    // GATE CS
    {
        exam_name: 'GATE_CS',
        question_text: 'Which of the following data structures uses the FIFO principle?',
        option_a: 'Stack',
        option_b: 'Queue',
        option_c: 'Binary Tree',
        option_d: 'Hash Table',
        correct_option: 'b'
    }
];

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Seeding Entrance Exam questions...');

    for (const q of entranceQuestions) {
        await connection.execute(
            'INSERT INTO questions (exam_name, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [q.exam_name, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
        );
    }

    console.log('Seeding complete!');
    await connection.end();
}

seed().catch(err => console.error(err));

const mysql = require('mysql2/promise');
require('dotenv').config();

const questions = [
    // GATE CS
    {
        exam_name: 'GATE_CS',
        question_text: 'Which of the following problems is undecidable?',
        option_a: 'Membership problem for CFGs',
        option_b: 'Halting problem for Turing Machines',
        option_c: 'Emptiness problem for FSAs',
        option_d: 'Finiteness problem for Regular Languages',
        correct_option: 'b',
        explanation: 'The Halting Problem is a classic example of an undecidable problem in computability theory.'
    },
    {
        exam_name: 'GATE_CS',
        question_text: 'What is the time complexity to build a binary heap of n elements?',
        option_a: 'O(n log n)',
        option_b: 'O(n)',
        option_c: 'O(log n)',
        option_d: 'O(n^2)',
        correct_option: 'b',
        explanation: 'Using the bottom-up heap construction algorithm, it takes O(n) time to build a heap.'
    },
    // GATE ME
    {
        exam_name: 'GATE_ME',
        question_text: 'The Second Law of Thermodynamics defines which property?',
        option_a: 'Internal Energy',
        option_b: 'Enthalpy',
        option_c: 'Entropy',
        option_d: 'Pressure',
        correct_option: 'c',
        explanation: 'The Second Law of Thermodynamics introduces the concept of Entropy as a measure of disorder.'
    },
    {
        exam_name: 'GATE_ME',
        question_text: 'A fluid whose viscosity does not change with the rate of deformation is called:',
        option_a: 'Non-Newtonian fluid',
        option_b: 'Newtonian fluid',
        option_c: 'Ideal fluid',
        option_d: 'Thixotropic fluid',
        correct_option: 'b',
        explanation: 'Newtonian fluids follow Newton\'s law of viscosity, where shear stress is proportional to the rate of shear strain.'
    },
    // GATE ECE
    {
        exam_name: 'GATE_ECE',
        question_text: 'In an 8085 microprocessor, how many bits is the address bus?',
        option_a: '8-bit',
        option_b: '16-bit',
        option_c: '32-bit',
        option_d: '64-bit',
        correct_option: 'b',
        explanation: 'The 8085 is an 8-bit microprocessor but has a 16-bit address bus, allowing it to address 64KB of memory.'
    },
    {
        exam_name: 'GATE_ECE',
        question_text: 'The process of recovering a signal from its samples is known as:',
        option_a: 'Sampling',
        option_b: 'Quantization',
        option_c: 'Reconstruction',
        option_d: 'Aliasing',
        correct_option: 'c',
        explanation: 'Signal reconstruction is the process of converting a discrete-time signal back into a continuous-time signal.'
    }
];

async function seed() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'online_test'
        });

        console.log('Seeding GATE questions...');
        for (const q of questions) {
            await connection.query(
                'INSERT INTO questions (exam_name, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [q.exam_name, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.explanation]
            );
        }
        console.log('Successfully seeded GATE questions!');
    } catch (err) {
        console.error('Error seeding questions:', err);
    } finally {
        if (connection) await connection.end();
    }
}

seed();

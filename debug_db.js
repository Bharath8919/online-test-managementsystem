const db = require('./db');
const { resilientQuery } = require('./resilience');

async function checkQuestions() {
    try {
        const rows = await resilientQuery('SELECT exam_name, COUNT(*) as count FROM questions GROUP BY exam_name');
        console.log('Question counts by exam_name:');
        console.log(JSON.stringify(rows, null, 2));

        const samples = await resilientQuery('SELECT * FROM questions LIMIT 5');
        console.log('\nSample questions:');
        console.log(JSON.stringify(samples, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkQuestions();

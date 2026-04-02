require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'online_test'
        });

        console.log("Connected. Seeding questions...");

        const physics = [
            ["PHYSICS", "Distance is a vector quantity and displacement is a scalar quantity ?", "True", "False", "-", "-", "b"],
            ["PHYSICS", "Which of following statement is Incorrect?", "An object with a negative velocity will be represented on a position-time graph by a line with a negative slope", "None of these", "An object with a positive velocity will be represented on a position-time graph by a line with a positive slope", "both a & c", "d"],
            ["PHYSICS", "A uniform sold sphere rolls on the horizontal surface at 20 m/s.it then rolls up the incline of 30°.If friction losses are negligible what will be the value of h where sphere stops on the incline", "30m", "28m", "28.6m", "None of these", "c"],
            ["PHYSICS", "Two balls of different masses are dropped from the same point at same time.Which is of the following is false?", "Both the balls will reach the ground in same time", "Both the balls will strike the ground with the same speed", "None of these", "Heavier ball will hit the ground first", "d"],
            ["PHYSICS", "Scalar product of two vector P and Q is zero.?", "either P = 0 or Q = 0 or P is perpendicular to Q", "either P = 0 or Q = 0", "P is perpendicular to Q", "P and Q are parallel", "a"],
            ["PHYSICS", "A car goes around a curve of radius r at speed v and experiences a centripetal acceleration a. If the car is to go around the same curve at a speed 4v, the required centripetal acceleration is?", "2a", "16a", "4a", "awrong", "b"],
            ["PHYSICS", "A canon fires ball at an angles 400.The ball would have landed at the same place if it were fired at any angle", "30 °", "60 °", "50 °", "None of these", "c"],
            ["PHYSICS", "For a wheel spinning with constant angular acceleration on an axis through its center, the ratio of the speed of a point on the rim to the speed of a point halfway between the center and the rim is:", "4", "1/2", "1/4", "2", "d"],
            ["PHYSICS", "A person makes a round-trip journey, finishing where he started. The displacement for the trip is 0 and the distance is some nonzero value.", "True", "False", "-", "-", "a"],
            ["PHYSICS", "If mass-energy equivalence is taken into account, when water is cooled to from ice, the mass of water should", "remain unchanged", "first increase then decrease", "decrease", "increase", "c"]
        ];

        const maths = [
            ["MATHS", "If X and Y are two sets such that n(X) = 17, n(Y) = 23 and n(X ∪ Y) = 38, find n(X ∩Y)?", "5", "2", "7", "4.5", "a"],
            ["MATHS", "In a survey it was found that 21 people liked product A, 26 liked product B and 29 liked product C. If 14 people liked products A and B, 12 people liked products C and A, 14 people liked products B and C and 8 liked all the three products. Find how many liked product C only.", "4", "11", "10", "12", "b"],
            ["MATHS", "In a regular graph of 15 vertices the sum of the degree of the vertices is 60. Then the degree of each vertex is", "16", "6", "4", "32", "c"],
            ["MATHS", "The last digit of number 7^886", "8", "3", "7", "9", "d"],
            ["MATHS", "A die is rolled. If X denotes the number of positive divisors of the outcome then the range of the random variable X is:", "{1, 2, 3, 4}", "{1, 2, 4}", "{1, 4}", "{1, 2}", "a"],
            ["MATHS", "A and B are two events such that P (A) ≠ 0. Find P (B|A), if A is a subset of B?", "3", "1", "5", "2", "b"],
            ["MATHS", "Let P and Q be the points on the line joining A(–2, 5) and B(3, 1) such that AP = PQ = QB, then the mid point of PQ is?", "(1/2,2)", "(1/3,3)", "(1/2,3)", "(1,3)", "c"],
            ["MATHS", "As per principle of mathematical induction for all n N n (n + 1) (n + 5) is a multiple of?", "4", "1", "2", "3", "d"],
            ["MATHS", "There are 4 cards numbered 1, 3, 5 and 7, one number on one card. Two cards are drawn at random without replacement. Let X denote the sum of the numbers on the two drawn cards. The mean of X is?", "8", "10", "11", "16", "a"],
            ["MATHS", "If the straight line mx – y = 1 + 2x intersects the circle x^2 + y^2 = 1 at least at one point, then the set of values of m is", "(-4/3,4/3)", "(0,4/3)", "(-4/3,0)", "all of these", "d"]
        ];

        const chemistry = [
            ["CHEMISTRY", "Two gaseous samples were analysed. One contained 1.2 g of carbon and 3.2 g of oxygen. The other contained 27.3% carbon and 72.7% oxygen. The experimental data are in accordance with?", "Law of reciprocal proportions.", "Law of conservation of mass.", "Law of constant proportions", "None", "a"],
            ["CHEMISTRY", "2.76 g of silver carbonate (atomic mass of Ag = 108 ) on being heated strongly yields a residue weighing?", "2.33g", "2.48g", "2.22g", "2.54g", "c"],
            ["CHEMISTRY", "A metallic contains 60% of the metal. The equivalent weight of the metal is", "14", "11", "12", "16", "c"],
            ["CHEMISTRY", "At STP, 5.6 litres of a gas weights 8 g. The vapour density of the gas is", "8", "32", "4", "16", "d"],
            ["CHEMISTRY", "Which of the following is a compound?", "Milk", "Brass", "Graphite", "22 carat Gold", "c"],
            ["CHEMISTRY", "_____ is the unit of luminous intensity.", "Frequency", "Candela", "Intensity co - efficient", "Lumina", "b"],
            ["CHEMISTRY", "Number of moles of water in 1 L of water with density 1 g/cc are", "50.33", "48.9", "55.56", "55.22", "c"],
            ["CHEMISTRY", "The number of moles of sodium oxide in 620 g of it is", "1 mole", "100 moles", "8 moles", "10 moles", "d"],
            ["CHEMISTRY", "______ reactant is the reactant that reacts completely but limits further progress of the reaction", "Limiting", "Reducing", "Oxidising", "Excess", "a"],
            ["CHEMISTRY", "The starting material which takes part in chemical reaction is called", "Product", "Catalyst", "starter", "Rectant", "d"]
        ];

        const allQuestions = [...physics, ...maths, ...chemistry];

        for (const q of allQuestions) {
            await connection.query(
                `INSERT INTO questions (exam_name, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                q
            );
        }

        console.log("Seeding complete. 30 questions added.");
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Seeding Failed:", error);
        process.exit(1);
    }
}

seed();

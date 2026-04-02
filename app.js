require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const { resilientQuery, getHealthStatus } = require('./resilience');
const { globalLimiter, authLimiter, apiLimiter } = require('./rate-limiter');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Setup (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");
const aiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Ethereal Email Setup for Testing
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
    } else {
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: { user: account.user, pass: account.pass }
        });
        console.log("Nodemailer Test Account Ready.");
    }
});

var app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store IO in app to use in routes
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => console.log('User disconnected'));
});
// User state is now managed via express-session
app.use(bodyParser.json());

/* app.use(express.static('HTML'));
app.use(express.static('IMAGES'));
app.use(express.static('CSS')); */

app.use(express.static(__dirname + '/public'));

// --- Resilience: Global Rate Limiter ---
app.use(globalLimiter);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'online-test-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/Views"));

// Role-based Access Control Middleware
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'Admin') {
        next();
    } else {
        res.status(403).send("<h1>Access Denied</h1><p>You must be an Admin to view this page.</p><a href='/Login'>Please Login as Admin</a>");
    }
}

function requireLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/Login');
    }
}

app.get('/', function(req, res) {
    res.render('Home');
});
app.get('/Login', function(req, res) {
    res.render('Login');
});
app.get('/home_1', function(req, res) {
    res.render('home_1');
});
app.get('/Contactus', function(req, res) {
    res.render('Contactus');
});

app.get('/forgot-password', function(req, res) {
    res.render('ForgotPassword');
});

// For Signup (Rate Limited)
app.post('/signup', authLimiter, async function(req, res) {
    const { email, password, password1, username, dob, profession, info } = req.body;
    
    if (password !== password1) {
        return res.send("<script>alert('Passwords do not match'); window.location.href='/Login';</script>");
    }

    try {
        const existing = await resilientQuery('SELECT * FROM signup_details WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.send("<script>alert('Email already exists'); window.location.href='/Login';</script>");
        }

        await resilientQuery(
            'INSERT INTO signup_details (email, password, username, dob, profession, info, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, password, username, dob, profession, info, 'Student']
        );
        res.redirect('/Login');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// for contact us form (Circuit Breaker protected)
app.post('/contactus', async function(req, res) {
    const { name, email, phone, message } = req.body;

    try {
        await resilientQuery(
            'INSERT INTO contactus (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone, message]
        );
        res.redirect('/HTML/Success.html');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// For Login (Rate Limited + Circuit Breaker)
app.post('/login', authLimiter, async function(req, res) {
    const { email, password } = req.body;
    
    try {
        const users = await resilientQuery('SELECT * FROM signup_details WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.send("<script>alert('Invalid Email or Password'); window.location.href='/Login';</script>");
        }

        const user = users[0];
        if (user.password !== password) {
            return res.send("<script>alert('Invalid Email or Password'); window.location.href='/Login';</script>");
        }

        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        if (user.role === 'Admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/home_1');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// Logout Route
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

// After editing user details by user
app.get('/dir_profile', async function(req, res) {
    if (!req.session.user) return res.redirect('/Login');
    try {
        const users = await resilientQuery('SELECT * FROM signup_details WHERE email = ?', [req.session.user.email]);
        res.render("UserProfile", { data: users[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// updating the details of a user by user
app.post('/userdetails', async function(req, res) {
    if (!req.session.user) return res.redirect('/Login');
    const { username, email, dob, profession, info } = req.body;

    try {
        await resilientQuery(
            'UPDATE signup_details SET username = ?, email = ?, dob = ?, profession = ?, info = ? WHERE email = ?',
            [username, email, dob, profession, info, req.session.user.email]
        );
        // Update session data as well
        req.session.user.username = username;
        req.session.user.email = email;
        res.redirect('home_1');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});


// Admin Routes (Protected + Circuit Breaker)
app.get('/admin', requireAdmin, async function(req, res) {
    try {
        const admins = await resilientQuery('SELECT * FROM signup_details WHERE role = "Admin"');
        const allUsers = await resilientQuery('SELECT * FROM signup_details');
        const health = getHealthStatus();
        res.render('Admin', { 
            admins: admins,
            totalUsers: allUsers.length,
            health: health
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/user_display', requireAdmin, async function(req, res) {
    try {
        const result = await resilientQuery('SELECT * FROM signup_details');
        res.render("userdisplay", { data: result });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/message_display', requireAdmin, async function(req, res) {
    try {
        const result = await resilientQuery('SELECT * FROM contactus');
        res.render("messagesdisplay", { data: result });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/AddUser', requireAdmin, function(req, res) {
    res.render('AddUser');
});

app.get('/reply', requireAdmin, function(req, res) {
    res.render('message_reply');
});

// Admin Post Actions (Circuit Breaker protected)
app.post('/del', requireAdmin, async function(req, res) {
    const delEmail = req.body.delete;
    try {
        await resilientQuery('DELETE FROM signup_details WHERE email = ?', [delEmail]);
        res.redirect('/user_display');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.post('/delmsg', requireAdmin, async function(req, res) {
    const delEmail = req.body.delete;
    try {
        await resilientQuery('DELETE FROM contactus WHERE email = ?', [delEmail]);
        res.redirect('/message_display');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.post('/reply', requireAdmin, async function(req, res) {
    const { email, message, reply } = req.body;

    try {
        await resilientQuery(
            'UPDATE contactus SET reply = ? WHERE email = ? AND message = ?',
            [reply, email, message]
        );
        res.redirect('/message_display');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.post('/addusers', requireAdmin, async function(req, res) {
    const { email, password, username, dob, profession, info } = req.body;

    try {
        await resilientQuery(
            'INSERT INTO signup_details (email, password, username, dob, profession, info, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, password, username, dob, profession, info, 'Student']
        );
        res.redirect('/user_display');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.post('/forgot-password', authLimiter, async function(req, res) {
    const { email } = req.body;

    try {
        const users = await resilientQuery('SELECT * FROM signup_details WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.send("<script>alert('Email not found'); window.location.href='/forgot-password';</script>");
        }
        
        // Generate Token
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
        
        await resilientQuery('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expiresAt]);
        
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        
        // Send Email
        if (transporter) {
            let info = await transporter.sendMail({
                from: '"Online Test System" <admin@onlinetest.com>',
                to: email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Click this link to set a new password: ${resetLink} \nThis link expires in 1 hour.`,
                html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to set a new password</a></p><p>This link expires in 1 hour.</p>`
            });
            console.log('Password Reset URL: %s', nodemailer.getTestMessageUrl(info));
        }

        res.send("<script>alert('A password reset link has been sent to your email (check console URL).'); window.location.href='/Login';</script>");
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/reset-password', async function(req, res) {
    const { token } = req.query;
    if (!token) {
        return res.send("<script>alert('Invalid or missing token.'); window.location.href='/Login';</script>");
    }
    
    try {
        const resets = await resilientQuery('SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()', [token]);
        if (resets.length === 0) {
            return res.send("<script>alert('Token is invalid or has expired.'); window.location.href='/forgot-password';</script>");
        }
        res.render('ResetPassword', { token });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.post('/reset-password', async function(req, res) {
    const { token, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
        return res.send(`<script>alert('Passwords do not match'); window.location.href='/reset-password?token=${token}';</script>`);
    }

    try {
        const resets = await resilientQuery('SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()', [token]);
        if (resets.length === 0) {
            return res.send("<script>alert('Token is invalid or has expired.'); window.location.href='/forgot-password';</script>");
        }
        
        const email = resets[0].email;
        await resilientQuery('UPDATE signup_details SET password = ? WHERE email = ?', [newPassword, email]);
        await resilientQuery('DELETE FROM password_resets WHERE email = ?', [email]); // Consume tokens
        
        res.send("<script>alert('Password updated successfully! Please login.'); window.location.href='/Login';</script>");
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// --- Advanced Features: Phase 1 ---

// API Rates (Score saving, etc.)
app.post('/save-score', apiLimiter, async function(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { score, total, exam_name } = req.body;
    try {
        await resilientQuery(
            'INSERT INTO test_results (user_email, exam_name, score, total_questions) VALUES (?, ?, ?, ?)',
            [req.session.user.email, exam_name, score, total]
        );
        
        // Broadcast achievement if score is high
        const percentage = (score / total) * 100;
        if (percentage >= 80) {
            req.app.get('io').emit('new-achievement', {
                username: req.session.user.username,
                exam: exam_name,
                score: Math.round(percentage)
            });
        }

        res.json({ success: true, message: 'Score saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Service temporarily unavailable' });
    }
});

app.get('/my-progress', requireLogin, async function(req, res) {
    try {
        const results = await resilientQuery(
            'SELECT * FROM test_results WHERE user_email = ? ORDER BY date_taken DESC',
            [req.session.user.email]
        );
        res.render('MyProgress', { results });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/leaderboard', async function(req, res) {
    try {
        const topScores = await resilientQuery(`
            SELECT t.user_email, s.username, t.exam_name, MAX(t.score) as max_score, t.total_questions, MAX(t.date_taken) as last_attempt
            FROM test_results t
            JOIN signup_details s ON t.user_email = s.email
            GROUP BY t.user_email, s.username, t.exam_name, t.total_questions
            ORDER BY max_score DESC
            LIMIT 50
        `);
        res.render('Leaderboard', { topScores });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/admin/questions', requireAdmin, async function(req, res) {
    try {
        const questions = await resilientQuery('SELECT * FROM questions ORDER BY exam_name, id ASC');
        res.render('AdminQuestions', { questions });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// AI Question Generation Route
app.post('/admin/generate-ai-questions', requireAdmin, async (req, res) => {
    const { topic } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        return res.status(500).json({ error: "Gemini API Key not configured in .env. Please add GEMINI_API_KEY." });
    }

    const prompt = `Generate a challenging multiple-choice question about "${topic}" for a mock test. 
    Return the response ONLY as a JSON object with this exact structure:
    {
        "questions": [
            {
                "question_text": "text",
                "option_a": "choice A",
                "option_b": "choice B",
                "option_c": "choice C",
                "option_d": "choice D",
                "correct_option": "a, b, c, or d",
                "explanation": "step-by-step explanation"
            }
        ]
    }`;

    try {
        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON if AI surrounds it with markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI did not return valid JSON");
        const jsonData = JSON.parse(jsonMatch[0]);
        
        res.json(jsonData);
    } catch (err) {
        console.error('AI Gen Error:', err);
        res.status(500).json({ error: "Failed to generate question: " + err.message });
    }
});

app.post('/admin/add-question', requireAdmin, async function(req, res) {
    const { exam_name, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
    try {
        await resilientQuery(`
            INSERT INTO questions (exam_name, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [exam_name, question_text, option_a, option_b, option_c, option_d, correct_option, explanation]);
        
        // Notify students of new question
        req.app.get('io').emit('new-question', { exam: exam_name });

        res.redirect('/admin/questions');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.post('/admin/delete-question', requireAdmin, async function(req, res) {
    const { question_id } = req.body;
    try {
        await resilientQuery('DELETE FROM questions WHERE id = ?', [question_id]);
        res.redirect('/admin/questions');
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

app.get('/admin/analytics', requireAdmin, async function(req, res) {
    try {
        // 1. Exam Popularity
        const popularity = await resilientQuery('SELECT exam_name, COUNT(*) as count FROM test_results GROUP BY exam_name');

        // 2. Daily Trend (last 30 days)
        const dailyTrend = await resilientQuery(`
            SELECT DATE_FORMAT(date_taken, '%Y-%m-%d') as date, COUNT(*) as count 
            FROM test_results 
            GROUP BY date 
            ORDER BY date ASC 
            LIMIT 30
        `);

        // 3. Performance Distribution
        const performanceResults = await resilientQuery('SELECT score, total_questions FROM test_results');
        let performance = { high: 0, medium: 0, low: 0 };
        performanceResults.forEach(r => {
            const ratio = r.score / r.total_questions;
            if (ratio >= 0.8) performance.high++;
            else if (ratio >= 0.5) performance.medium++;
            else performance.low++;
        });

        // 4. Subject-wise Average Scores
        const subjectAverages = await resilientQuery(`
            SELECT exam_name, AVG((score / total_questions) * 100) as avg_percentage 
            FROM test_results 
            GROUP BY exam_name
        `);

        res.render('AdminAnalytics', { popularity, dailyTrend, performance, subjectAverages });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// --- Dynamic Mock Test Routes ---
app.get('/mock-test/:category', requireLogin, async (req, res) => {
    let category = req.params.category.toUpperCase();
    // Map legacy filenames to category names if needed
    if (category === 'PHYMOC') category = 'PHYSICS';
    if (category === 'MOC') category = 'MATHS';
    if (category === 'CHYMOCK') category = 'CHEMISTRY';

    try {
        const questions = await resilientQuery('SELECT * FROM questions WHERE exam_name = ?', [category]);
        if (questions.length === 0) {
            return res.send(`<script>alert('No questions found for ${category}. Our team is working on adding them!'); window.location.href='/home_1';</script>`);
        }
        res.render('exam', { subject_title: category, questions });
    } catch (err) {
        console.error(err);
        res.status(500).send("Service temporarily unavailable. Please try again.");
    }
});

// Health Monitoring Endpoint
app.get('/health', (req, res) => {
    res.json(getHealthStatus());
});

// Legacy redirects
app.get('/HTML/phymoc.html', (req, res) => res.redirect('/mock-test/PHYSICS'));
app.get('/HTML/moc.html', (req, res) => res.redirect('/mock-test/MATHS'));
app.get('/HTML/chymock.html', (req, res) => res.redirect('/mock-test/CHEMISTRY'));
app.get('/HTML/gatemock_cs.html', (req, res) => res.redirect('/mock-test/GATE_CS'));
app.get('/HTML/gatemock_me.html', (req, res) => res.redirect('/mock-test/GATE_ME'));
app.get('/HTML/gatemock_ece.html', (req, res) => res.redirect('/mock-test/GATE_ECE'));

// Start Server
server.listen(3000, function() {
    console.log("Server listening at http://localhost:3000");
});
/**
 * Rate Limiter Module
 * Node.js equivalent of Resilience4j @RateLimiter using 'express-rate-limit'
 * 
 * Three tiers:
 *   1. Global   — 100 req/min per IP (all routes)
 *   2. Auth     — 10 req/15min per IP (login, signup, forgot-password)
 *   3. API      — 30 req/min per IP (score saving, data endpoints)
 */
const rateLimit = require('express-rate-limit');

// --- Global Rate Limiter ---
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,      // 1 minute
    max: 100,                  // 100 requests per minute per IP
    standardHeaders: true,     // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,      // Disable the `X-RateLimit-*` headers
    message: {
        status: 429,
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please wait a moment and try again.',
        retryAfter: '60 seconds'
    },
    handler: (req, res, next, options) => {
        console.log(`\x1b[31m[RATE LIMITER] 🚫 Global limit exceeded for IP: ${req.ip}\x1b[0m`);
        res.status(429).send(`
            <div style="text-align:center; padding:50px; font-family:Arial,sans-serif;">
                <h1 style="color:#e74c3c;">⚠️ Too Many Requests</h1>
                <p style="font-size:18px;">You've made too many requests. Please wait a moment.</p>
                <p style="color:#7f8c8d;">Rate Limit: ${options.max} requests per minute</p>
                <a href="javascript:history.back()" style="color:#3498db; font-size:16px;">← Go Back</a>
            </div>
        `);
    }
});

// --- Auth Rate Limiter (Login, Signup, Forgot Password) ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: {
        status: 429,
        error: 'Too Many Authentication Attempts',
        message: 'Too many login/signup attempts. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        console.log(`\x1b[31m[RATE LIMITER] 🔒 Auth limit exceeded for IP: ${req.ip}\x1b[0m`);
        res.status(429).send(`
            <div style="text-align:center; padding:50px; font-family:Arial,sans-serif;">
                <h1 style="color:#e74c3c;">🔒 Too Many Attempts</h1>
                <p style="font-size:18px;">You've made too many login/signup attempts.</p>
                <p style="color:#7f8c8d;">Please try again after 15 minutes.</p>
                <a href="/" style="color:#3498db; font-size:16px;">← Back to Home</a>
            </div>
        `);
    }
});

// --- API Rate Limiter (Score saving, data endpoints) ---
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,      // 1 minute
    max: 30,                   // 30 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        error: 'API Rate Limit Exceeded',
        message: 'Too many API requests. Please slow down.',
        retryAfter: '60 seconds'
    },
    handler: (req, res, next, options) => {
        console.log(`\x1b[31m[RATE LIMITER] 📡 API limit exceeded for IP: ${req.ip}\x1b[0m`);
        res.status(429).json({
            status: 429,
            error: 'API Rate Limit Exceeded',
            message: 'Too many API requests. Please slow down and try again.',
            retryAfter: '60 seconds'
        });
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    apiLimiter
};

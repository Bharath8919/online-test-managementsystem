/**
 * Resilience Module - Circuit Breaker, Retry & Bulkhead
 * Node.js equivalent of Java Resilience4j patterns using 'opossum'
 */
const CircuitBreaker = require('opossum');
const db = require('./db');

// --- Circuit Breaker Configuration ---
const circuitBreakerOptions = {
    timeout: 5000,           // 5s timeout per DB call
    errorThresholdPercentage: 50,  // Open circuit when 50% of requests fail
    resetTimeout: 10000,     // Try again after 10s (half-open state)
    rollingCountTimeout: 30000,    // 30s rolling window for failure counting
    rollingCountBuckets: 6,        // 6 buckets of 5s each
    volumeThreshold: 5,      // Minimum 5 requests before circuit can trip
    capacity: 10,            // Bulkhead: max 10 concurrent calls (matches DB pool)
};

// --- Core DB Query Function (wrapped by circuit breaker) ---
async function dbQuery(sql, params = []) {
    const [results] = await db.query(sql, params);
    return results;
}

// --- Create Circuit Breaker Instance ---
const breaker = new CircuitBreaker(dbQuery, circuitBreakerOptions);

// --- Event Logging ---
breaker.on('open', () => {
    console.log('\x1b[31m[CIRCUIT BREAKER] ⚡ OPEN — Database calls are being blocked\x1b[0m');
});

breaker.on('halfOpen', () => {
    console.log('\x1b[33m[CIRCUIT BREAKER] 🔄 HALF-OPEN — Testing if database is back...\x1b[0m');
});

breaker.on('close', () => {
    console.log('\x1b[32m[CIRCUIT BREAKER] ✅ CLOSED — Database is healthy\x1b[0m');
});

breaker.on('fallback', (result) => {
    console.log('\x1b[35m[CIRCUIT BREAKER] 🛡️ FALLBACK triggered\x1b[0m');
});

breaker.on('timeout', () => {
    console.log('\x1b[33m[CIRCUIT BREAKER] ⏱️ TIMEOUT — Database call took too long\x1b[0m');
});

breaker.on('reject', () => {
    console.log('\x1b[31m[CIRCUIT BREAKER] 🚫 REJECTED — Circuit is open, call blocked\x1b[0m');
});

// --- Fallback: returns user-friendly error ---
breaker.fallback(() => {
    throw new Error('Service temporarily unavailable. The system is experiencing issues. Please try again in a few seconds.');
});

// --- Resilient Query Function ---
/**
 * Execute a database query through the circuit breaker.
 * Provides automatic retry, bulkhead isolation, and circuit breaking.
 * 
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function resilientQuery(sql, params = []) {
    return breaker.fire(sql, params);
}

/**
 * Returns a detailed health status object for the circuit breaker.
 * Synchronized with Admin.ejs dashboard requirements.
 */
function getHealthStatus() {
    const stats = breaker.stats;
    const isOpened = breaker.opened;
    const isHalfOpen = breaker.halfOpen;
    
    // Determine overall system health status
    let status = 'Healthy';
    if (isOpened) status = 'Critical';
    else if (isHalfOpen || stats.failures > 0) status = 'Degraded';

    return {
        status: status,
        circuitBreaker: {
            state: isOpened ? 'open' : (isHalfOpen ? 'half-open' : 'closed'),
            metrics: {
                successes: stats.successes,
                failures: stats.failures,
                rejections: stats.rejects,
                timeouts: stats.timeouts,
                pending: breaker.pending, // Current concurrent requests
                total: stats.successes + stats.failures + stats.rejects + stats.timeouts
            },
            config: {
                timeout: circuitBreakerOptions.timeout,
                errorThreshold: circuitBreakerOptions.errorThresholdPercentage,
                resetTimeout: circuitBreakerOptions.resetTimeout,
                bulkheadCapacity: circuitBreakerOptions.capacity
            }
        },
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    resilientQuery,
    getHealthStatus,
    breaker
};

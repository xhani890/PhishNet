// ===============================================
// PhishNet Health Check Script
// Version: 1.0
// Created: July 25, 2025
// Description: Health check script for Docker containers
// ===============================================

const http = require('http');

const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3001,
    path: '/health',
    method: 'GET',
    timeout: 5000
};

const request = http.request(options, (response) => {
    console.log(`Health check status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
        process.exit(0); // Healthy
    } else {
        process.exit(1); // Unhealthy
    }
});

request.on('error', (error) => {
    console.error('Health check failed:', error.message);
    process.exit(1); // Unhealthy
});

request.on('timeout', () => {
    console.error('Health check timed out');
    request.destroy();
    process.exit(1); // Unhealthy
});

request.end();

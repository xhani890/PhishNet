#!/usr/bin/env node

/**
 * Frontend Mock Server
 * Provides mock API endpoints for frontend development without database dependency
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockCampaigns = [
  {
    id: 1,
    name: "Sample Phishing Campaign",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    targets: 50,
    opened: 12,
    clicked: 3
  }
];

const mockTemplates = [
  {
    id: 1,
    name: "Corporate Login",
    subject: "Account Verification Required",
    html: "<h1>Please verify your account</h1>"
  }
];

// Mock API Routes
app.get('/api/campaigns', (req, res) => {
  res.json({ campaigns: mockCampaigns });
});

app.get('/api/templates', (req, res) => {
  res.json({ templates: mockTemplates });
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalCampaigns: 5,
    activeCampaigns: 2,
    totalTargets: 250,
    successRate: 15.2
  });
});

app.post('/api/campaigns', (req, res) => {
  const newCampaign = {
    id: mockCampaigns.length + 1,
    ...req.body,
    created_at: new Date().toISOString(),
    status: 'draft'
  };
  mockCampaigns.push(newCampaign);
  res.json({ campaign: newCampaign });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend mock server running' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Mock endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎭 Frontend Mock Server running on port ${PORT}`);
  console.log(`🌐 Mock API available at http://localhost:${PORT}/api/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`\n🔧 Frontend Development Mode:`);
  console.log(`   - No database required`);
  console.log(`   - Mock data for UI development`);
  console.log(`   - CORS enabled for localhost:5173`);
});

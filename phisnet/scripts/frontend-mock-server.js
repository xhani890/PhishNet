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

// Additional mock data for dashboard components
const mockPhishingMetrics = [
  { date: '2024-01-01', opens: 45, clicks: 12, submissions: 3 },
  { date: '2024-01-02', opens: 52, clicks: 18, submissions: 5 },
  { date: '2024-01-03', opens: 38, clicks: 9, submissions: 2 },
  { date: '2024-01-04', opens: 61, clicks: 23, submissions: 7 },
  { date: '2024-01-05', opens: 49, clicks: 15, submissions: 4 }
];

const mockThreats = [
  { id: 1, type: 'Phishing', level: 'High', count: 12, trend: 'up' },
  { id: 2, type: 'Malware', level: 'Medium', count: 8, trend: 'down' },
  { id: 3, type: 'Social Engineering', level: 'High', count: 15, trend: 'up' }
];

const mockRiskUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', riskScore: 85, incidents: 3 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', riskScore: 72, incidents: 2 }
];

const mockTrainings = [
  { id: 1, title: 'Phishing Awareness', completion: 78, required: true },
  { id: 2, title: 'Password Security', completion: 92, required: true },
  { id: 3, title: 'Data Protection', completion: 65, required: false }
];

const mockGroups = [
  { id: 1, name: 'Marketing Team', targetCount: 25, lastUpdated: '2024-01-01' },
  { id: 2, name: 'Sales Team', targetCount: 18, lastUpdated: '2024-01-02' }
];

const mockTargets = [
  { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', position: 'Manager' },
  { id: 2, firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com', position: 'Developer' }
];

const mockUsers = [
  { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@example.com', roles: ['Admin'] },
  { id: 2, firstName: 'Regular', lastName: 'User', email: 'user@example.com', roles: ['User'] }
];

const mockProfiles = [
  { id: 1, name: 'Primary SMTP', host: 'smtp.example.com', port: 587, isDefault: true },
  { id: 2, name: 'Backup SMTP', host: 'backup.example.com', port: 587, isDefault: false }
];

const mockLandingPages = [
  { id: 1, name: 'Login Page', pageType: 'login', url: '/landing/login', isActive: true },
  { id: 2, name: 'Survey Page', pageType: 'survey', url: '/landing/survey', isActive: true }
];

// Mock API Routes
app.get('/api/campaigns', (req, res) => {
  res.json({ campaigns: mockCampaigns });
});

app.get('/api/templates', (req, res) => {
  res.json({ templates: mockTemplates });
});

// Dashboard data endpoints
app.get('/api/dashboard/phishing-metrics', (req, res) => {
  res.json(mockPhishingMetrics);
});

app.get('/api/dashboard/threats', (req, res) => {
  res.json(mockThreats);
});

app.get('/api/dashboard/risk-users', (req, res) => {
  res.json(mockRiskUsers);
});

app.get('/api/dashboard/trainings', (req, res) => {
  res.json(mockTrainings);
});

// Groups and targets
app.get('/api/groups', (req, res) => {
  res.json(mockGroups);
});

app.get('/api/targets', (req, res) => {
  res.json(mockTargets);
});

// Users
app.get('/api/users', (req, res) => {
  res.json(mockUsers);
});

app.get('/api/roles', (req, res) => {
  res.json([
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Viewer' }
  ]);
});

// SMTP Profiles
app.get('/api/smtp-profiles', (req, res) => {
  res.json(mockProfiles);
});

// Landing Pages
app.get('/api/landing-pages', (req, res) => {
  res.json(mockLandingPages);
});

// Reports
app.get('/api/reports', (req, res) => {
  res.json({
    campaigns: mockCampaigns,
    users: mockUsers,
    summary: {
      totalEmails: 150,
      delivered: 142,
      opened: 89,
      clicked: 23,
      reported: 5
    }
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalCampaigns: 5,
    activeCampaigns: 2,
    campaignChange: 15,
    totalTargets: 250,
    successRate: 15.2,
    successRateChange: 2.1,
    totalUsers: 45,
    newUsers: 8,
    trainingCompletion: 78.5,
    trainingCompletionChange: 5.2
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

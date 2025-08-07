/**
 * Shared TypeScript Types for PhishNet Frontend
 * This file contains type definitions used across the frontend application
 */

// Campaign Types
export interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  created_at: string;
  targets: number;
  opened: number;
  clicked: number;
  organizationId?: string;
}

// Template Types
export interface Template {
  id: number;
  name: string;
  subject: string;
  html: string;
  text?: string;
  organizationId?: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  organizationId: string;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTargets: number;
  successRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
}

// Frontend-specific types
export interface MockApiConfig {
  baseUrl: string;
  timeout: number;
  mockData: boolean;
}

export interface FrontendConfig {
  apiUrl: string;
  appName: string;
  version: string;
  devMode: boolean;
  mockData: boolean;
}

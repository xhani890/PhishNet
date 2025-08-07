/**
 * API Response Types for PhishNet Frontend
 * This file contains type definitions for all API responses
 */

import type { 
  Campaign, 
  Template, 
  User, 
  DashboardStats, 
  DataPoint, 
  Threat, 
  RiskUser, 
  Training,
  Group,
  Target,
  SmtpProfile,
  LandingPage
} from './index';

// Generic API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
}

// Specific API Response Types
export interface CampaignsResponse {
  campaigns: Campaign[];
}

export interface TemplatesResponse {
  templates: Template[];
}

export interface UsersResponse extends Array<User> {}

export interface GroupsResponse extends Array<Group> {}

export interface TargetsResponse extends Array<Target> {}

export interface SmtpProfilesResponse extends Array<SmtpProfile> {}

export interface LandingPagesResponse extends Array<LandingPage> {}

export interface RolesResponse extends Array<{
  id: number;
  name: string;
}> {}

// Dashboard API Response Types
export interface DashboardStatsResponse extends DashboardStats {}

export interface PhishingMetricsResponse extends Array<DataPoint> {}

export interface ThreatsResponse extends Array<Threat> {}

export interface RiskUsersResponse extends Array<RiskUser> {}

export interface TrainingsResponse extends Array<Training> {}

// Reports API Response Type
export interface ReportsResponse {
  campaigns: Campaign[];
  users: User[];
  summary: {
    totalEmails: number;
    delivered: number;
    opened: number;
    clicked: number;
    reported: number;
  };
}

// Campaign Results Response
export interface CampaignResult {
  id: number;
  campaignId: number;
  targetId: number;
  sent: boolean;
  opened: boolean;
  clicked: boolean;
  submitted: boolean;
  timestamp: string;
}

export interface CampaignResultsResponse extends Array<CampaignResult> {}

// Enhanced Campaign type with additional properties
export interface CampaignWithDetails extends Campaign {
  scheduledAt?: string;
  createdAt: string;
  endDate?: string;
  targetGroup?: string;
  totalTargets?: number;
  emailTemplate?: { name: string };
  landingPage?: { name: string };
  smtpProfile?: { name: string };
  createdBy?: string;
}

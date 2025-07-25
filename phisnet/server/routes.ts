import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hasOrganization, hashPassword, comparePasswords, refreshSession } from "./auth";
import { db } from "./db";
import { 
  campaigns, 
  campaignResults, 
  emailTemplates, 
  users, 
  organizations,
  targets,
  groups,
  notificationsSchema,
  notificationPreferencesSchema,
  rolesSchema,
  userRolesSchema,
  insertGroupSchema, 
  insertTargetSchema, 
  insertSmtpProfileSchema, 
  insertEmailTemplateSchema, 
  insertLandingPageSchema, 
  insertCampaignSchema,
  updateLandingPageSchema,
  type User
} from "@shared/schema";
import { eq, and, or, desc, asc, count, sql, gte, lte, isNull, isNotNull } from "drizzle-orm";
import multer from "multer";
import Papa from "papaparse";
import { z } from "zod";
import { errorHandler, assertUser, mapDatabaseFields } from './error-handler';
import { NotificationService } from './services/notification-service';
import { exportReportToCsv } from './utils/report-exporter';
import path from 'path';
import fs from 'fs';

const upload = multer();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API Health Check
  app.get("/api/status", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Session ping endpoint for refreshing user sessions
  app.post("/api/session-ping", isAuthenticated, (req, res) => {
    if (req.session) {
      // Reset session expiry
      req.session.touch();
      
      // Calculate time remaining in session
      const maxAge = req.session.cookie.maxAge || 0;
      const expiresIn = maxAge;
      
      console.log(`Session refreshed for user: ${req.user?.email}. Expires in ${Math.round(expiresIn/1000/60)} minutes`);
    }
    
    res.status(200).json({ 
      status: "ok", 
      sessionExpiresIn: req.session?.cookie?.maxAge || 0
    });
  });

  // Dashboard Stats - Real Data
  app.get("/api/dashboard/stats", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const stats = await storage.getDashboardStats(req.user.organizationId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // Dashboard Metrics - Real Data
  app.get("/api/dashboard/metrics", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const metrics = await storage.getPhishingMetrics(req.user.organizationId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Error fetching dashboard metrics" });
    }
  });

  // At-Risk Users - Real Data
  app.get("/api/dashboard/risk-users", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const riskUsers = await storage.getAtRiskUsers(req.user.organizationId);
      res.json(riskUsers);
    } catch (error) {
      console.error("Error fetching risk users:", error);
      res.status(500).json({ message: "Error fetching risk users" });
    }
  });

  // Threat Landscape - Real Data
  app.get("/api/dashboard/threats", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      // Get campaign types and their success rates - with proper error handling
      const threats = await db.select({
        type: sql<string>`COALESCE(${emailTemplates.type}, 'Unknown')`.as('type'),
        totalSent: sql<number>`count(${campaignResults.id})`.as('totalSent'),
        successful: sql<number>`count(CASE WHEN ${campaignResults.status} IN ('clicked', 'submitted') THEN 1 END)`.as('successful'),
      })
      .from(campaigns)
      .leftJoin(emailTemplates, eq(campaigns.emailTemplateId, emailTemplates.id))
      .leftJoin(campaignResults, eq(campaigns.id, campaignResults.campaignId))
      .where(eq(campaigns.organizationId, req.user.organizationId))
      .groupBy(emailTemplates.type)
      .orderBy(sql`count(CASE WHEN ${campaignResults.status} IN ('clicked', 'submitted') THEN 1 END) DESC`);
      
      const threatData = threats.map(threat => ({
        id: Math.random(), // Add id for React keys
        name: threat.type || 'Unknown',
        description: `${threat.successful} successful attacks out of ${threat.totalSent} attempts`,
        level: threat.totalSent > 0 ? 
          (threat.successful / threat.totalSent > 0.3 ? 'high' : 
           threat.successful / threat.totalSent > 0.15 ? 'medium' : 'low') : 'low' as "high" | "medium" | "low",
        severity: threat.totalSent > 0 ? 
          (threat.successful / threat.totalSent > 0.3 ? 'High' : 
           threat.successful / threat.totalSent > 0.15 ? 'Medium' : 'Low') : 'Low',
        count: threat.successful,
        trend: 'stable',
      }));
      
      res.json(threatData);
    } catch (error) {
      console.error("Error fetching threat data:", error);
      res.status(500).json({ message: "Error fetching threat data" });
    }
  });

  // Dashboard Risk Users
  app.get("/api/dashboard/risk-users", isAuthenticated, (req, res) => {
    // Provide mock risk user data
    const users = [
      {
        id: 1,
        name: "Mike Miller",
        department: "Finance Department",
        riskLevel: "High Risk"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        department: "Marketing Team",
        riskLevel: "Medium Risk"
      },
      {
        id: 3,
        name: "Tom Parker",
        department: "Executive Team",
        riskLevel: "Medium Risk"
      }
    ];
    res.json(users);
  });

  // Dashboard Training Data
  app.get("/api/dashboard/training", isAuthenticated, (req, res) => {
    // Provide mock training data
    const trainings = [
      {
        id: 1,
        name: "Phishing Awareness",
        progress: 65,
        icon: "shield"
      },
      {
        id: 2,
        name: "Password Security",
        progress: 82,
        icon: "lock"
      },
      {
        id: 3,
        name: "Mobile Device Security",
        progress: 43,
        icon: "smartphone"
      }
    ];
    res.json(trainings);
  });

  // Recent Campaigns
  app.get("/api/campaigns/recent", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const campaigns = await storage.listCampaigns(req.user.organizationId);
      // Sort by created date and take the most recent 5
      const recentCampaigns = campaigns
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          openRate: Math.floor(Math.random() * 100), // Mock data
          clickRate: Math.floor(Math.random() * 70), // Mock data
          createdAt: campaign.createdAt
        }));
      res.json(recentCampaigns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent campaigns" });
    }
  });

  // Groups Endpoints
  app.get("/api/groups", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const groups = await storage.listGroups(req.user.organizationId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups" });
    }
  });

  app.post("/api/groups", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const validatedData = insertGroupSchema.parse(req.body);
      // Add organizationId to the validated data
      const groupData = {
        ...validatedData,
        organizationId: req.user.organizationId
      };
      const group = await storage.createGroup(req.user.organizationId, groupData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating group" });
    }
  });

  app.put("/api/groups/:id", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertGroupSchema.parse(req.body);
      const updatedGroup = await storage.updateGroup(groupId, validatedData);
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating group" });
    }
  });

  app.delete("/api/groups/:id", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteGroup(groupId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting group" });
    }
  });

  // Targets Endpoints
  app.get("/api/groups/:id/targets", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const targets = await storage.listTargets(groupId);
      res.json(targets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching targets" });
    }
  });

  app.post("/api/groups/:id/targets", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertTargetSchema.parse(req.body);
      const targetData = {
        ...validatedData,
        organizationId: req.user.organizationId,
        groupId: groupId
      };
      const target = await storage.createTarget(req.user.organizationId, groupId, targetData);
      res.status(201).json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating target" });
    }
  });

  app.post("/api/groups/:id/import", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      assertUser(req.user);
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Ensure user has access to this group
      if (group.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const csvString = req.file.buffer.toString();
      const results = Papa.parse(csvString, { header: true, skipEmptyLines: true });
      
      if (results.errors.length > 0) {
        return res.status(400).json({ message: "CSV parsing error", errors: results.errors });
      }
      
      const importedTargets = [];
      const errors = [];
      
      for (let index = 0; index < results.data.length; index++) {
        const row = results.data[index];
        try {
          // Normalize field names
          const normalizedRow: any = {};
          for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
            const lowercaseKey = key.toLowerCase();
            if (lowercaseKey === 'firstname' || lowercaseKey === 'first_name') {
              normalizedRow.firstName = value;
            } else if (lowercaseKey === 'lastname' || lowercaseKey === 'last_name') {
              normalizedRow.lastName = value;
            } else if (lowercaseKey === 'email') {
              normalizedRow.email = value;
            } else if (lowercaseKey === 'position' || lowercaseKey === 'title') {
              normalizedRow.position = value;
            }
          }
          
          // Validate the data
          const validatedData = insertTargetSchema.parse(normalizedRow);
          
          // Create the target with required properties
          const targetData = {
            ...validatedData,
            organizationId: req.user.organizationId,
            groupId: groupId
          };
          const target = await storage.createTarget(req.user.organizationId, groupId, targetData);
          importedTargets.push(target);
        } catch (error) {
          errors.push({
            row: index + 2, // +2 to account for 0-based index and header row
            error: error instanceof z.ZodError ? error.errors : "Unknown error"
          });
        }
      }
      
      res.status(200).json({
        imported: importedTargets.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      res.status(500).json({ message: "Error importing targets" });
    }
  });

  // SMTP Profiles Endpoints
  app.get("/api/smtp-profiles", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const profiles = await storage.listSmtpProfiles(req.user.organizationId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching SMTP profiles" });
    }
  });

  app.post("/api/smtp-profiles", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const validatedData = insertSmtpProfileSchema.parse(req.body);
      const profileData = {
        ...validatedData,
        organizationId: req.user.organizationId
      };
      const profile = await storage.createSmtpProfile(req.user.organizationId, profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating SMTP profile" });
    }
  });

  // Email Templates Endpoints
  app.get("/api/email-templates", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      // Get templates directly from storage 
      const templates = await storage.listEmailTemplates(req.user.organizationId);
      
      // Return templates directly with snake_case field names as expected by frontend
      const mappedTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        html_content: template.html_content || "",
        text_content: template.text_content || null,
        sender_name: template.sender_name || "PhishNet Team",
        sender_email: template.sender_email || "phishing@example.com",
        type: template.type || "phishing-business",
        complexity: template.complexity || "medium",
        description: template.description || null,
        category: template.category || null,
        organization_id: template.organization_id,
        created_at: template.created_at,
        updated_at: template.updated_at,
        created_by_id: template.created_by_id
      }));
      
      res.json(mappedTemplates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Error fetching email templates" });
    }
  });

  app.post("/api/email-templates", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      
      // Create a template using existing storage method
      const template = await storage.createEmailTemplate(
        req.user.organizationId, 
        req.user.id, 
        {
          name: validatedData.name,
          subject: validatedData.subject,
          // Fix the field mapping to match database schema:
          html_content: validatedData.html_content || "<div>Default content</div>",
          text_content: validatedData.text_content || null,
          sender_name: validatedData.sender_name || "PhishNet Team",
          sender_email: validatedData.sender_email || "phishing@example.com",
          type: validatedData.type,
          complexity: validatedData.complexity,
          description: validatedData.description,
          category: validatedData.category,
          organization_id: req.user.organizationId
        }
      );
      
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating email template" });
    }
  });

  app.put("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const templateId = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Ensure user has access to this template
      if (template.organization_id !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      const updatedTemplate = await storage.updateEmailTemplate(templateId, validatedData);
      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating email template" });
    }
  });
  
  app.delete("/api/email-templates/:id", isAuthenticated, async (req, res) => {
    try {
      assertUser(req.user);
      const templateId = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Ensure user has access to this template
      if (template.organization_id !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteEmailTemplate(templateId);
      if (success) {
        return res.status(200).json({ message: "Email template deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete email template" });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Error deleting email template" });
    }
  });

  // Landing Pages Endpoints
  app.get("/api/landing-pages", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const pages = await storage.listLandingPages(req.user.organizationId);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landing pages" });
    }
  });

  app.post("/api/landing-pages", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      assertUser(req.user);
      const validatedData = insertLandingPageSchema.parse(req.body);
      
      // Create the landing page with thumbnail
      const pageData = {
        ...validatedData,
        organizationId: req.user.organizationId
      };
      const page = await storage.createLandingPage(
        req.user.organizationId,
        req.user.id,
        pageData
      );
      
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating landing page" });
    }
  });

  app.put("/api/landing-pages/:id", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const pageId = parseInt(req.params.id);
      const page = await storage.getLandingPage(pageId);
      
      if (!page) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      
      // Ensure user has access to this page
      if (page.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertLandingPageSchema.parse(req.body);
      
      // Update the landing page with the thumbnail
      const updatedPage = await storage.updateLandingPage(
        pageId,
        validatedData
      );
      
      res.json(updatedPage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating landing page" });
    }
  });
  
  app.delete("/api/landing-pages/:id", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const pageId = parseInt(req.params.id);
      const page = await storage.getLandingPage(pageId);
      
      if (!page) {
        return res.status(404).json({ message: "Landing page not found" });
      }
      
      // Ensure user has access to this page
      if (page.organizationId !== req.user.organizationId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteLandingPage(pageId);
      if (success) {
        return res.status(200).json({ message: "Landing page deleted successfully" });
      } else {
        return res.status(500).json({ message: "Failed to delete landing page" });
      }
    } catch (error) {
      console.error("Error deleting landing page:", error);
      res.status(500).json({ message: "Error deleting landing page" });
    }
  });

  // New endpoint to clone landing pages from existing URLs
  app.post("/api/landing-pages/clone", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "Valid URL is required" });
      }
      
      try {
        // Use fetch to get the HTML content
        const response = await fetch(url, {
          headers: {
            // Add a user agent to avoid being blocked
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          return res.status(400).json({ 
            message: `Failed to fetch webpage: ${response.status} ${response.statusText}` 
          });
        }
        
        // Get HTML content as text
        const htmlContent = await response.text();
        
        // Return as proper JSON with HTML content as a string property
        return res.json({ 
          htmlContent,
          message: "Website cloned successfully" 
        });
      } catch (error) {
        console.error("Error cloning website:", error);
        return res.status(400).json({ 
          message: `Error fetching URL: ${(error as Error)?.message || "Unknown error"}` 
        });
      }
    } catch (error) {
      console.error("Server error while cloning website:", error);
      return res.status(500).json({ message: "Error cloning webpage" });
    }
  });

  // Campaigns Endpoints
  app.get("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaignList = await storage.listCampaigns(req.user.organizationId);
      
      // Include group names and other related data
      const campaigns = [];
      for (const campaign of campaignList) {
        const group = await storage.getGroup(campaign.targetGroupId);
        const targets = await storage.listTargets(campaign.targetGroupId);
        
        campaigns.push({
          ...campaign,
          targetGroup: group?.name || "Unknown",
          totalTargets: targets.length,
          sentCount: 0, // In a real app, calculate this from results
          openRate: Math.floor(Math.random() * 100), // Mock data
          clickRate: Math.floor(Math.random() * 70), // Mock data
        });
      }
      
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching campaigns" });
    }
  });

  app.post("/api/campaigns", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      console.log("Campaign creation request body:", req.body);
      
      // Attempt to validate the data
      let validatedData;
      try {
        validatedData = insertCampaignSchema.parse(req.body);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          console.error("Campaign validation errors:", validationError.errors);
          return res.status(400).json({ 
            message: "Validation error", 
            errors: validationError.errors 
          });
        }
        throw validationError;
      }
      
      // Validate that referenced objects exist and belong to user's organization
      const targetGroup = await storage.getGroup(Number(validatedData.targetGroupId));
      if (!targetGroup || targetGroup.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid target group" });
      }
      
      const smtpProfile = await storage.getSmtpProfile(Number(validatedData.smtpProfileId));
      if (!smtpProfile || smtpProfile.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid SMTP profile" });
      }
      
      const emailTemplate = await storage.getEmailTemplate(Number(validatedData.emailTemplateId));
      if (!emailTemplate || emailTemplate.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid email template" });
      }
      
      const landingPage = await storage.getLandingPage(Number(validatedData.landingPageId));
      if (!landingPage || landingPage.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid landing page" });
      }
      
      // Create the campaign
      const campaign = await storage.createCampaign(
        req.user.organizationId, 
        req.user.id, 
        {
          ...validatedData,
          organizationId: req.user.organizationId,
          // Ensure proper type conversion
          targetGroupId: Number(validatedData.targetGroupId),
          smtpProfileId: Number(validatedData.smtpProfileId),
          emailTemplateId: Number(validatedData.emailTemplateId),
          landingPageId: Number(validatedData.landingPageId),
          scheduledAt: validatedData.scheduledAt || null,
          endDate: validatedData.endDate || null,
        }
      );
      
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating campaign" });
    }
  });

  // Add or update these campaign routes

  // Get a specific campaign by ID
  app.get("/api/campaigns/:id", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.organizationId !== req.user.organizationId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Get related data
      const group = await storage.getGroup(campaign.targetGroupId);
      const template = await storage.getEmailTemplate(campaign.emailTemplateId);
      const landingPage = await storage.getLandingPage(campaign.landingPageId);
      const smtpProfile = await storage.getSmtpProfile(campaign.smtpProfileId);
      const targets = await storage.listTargets(campaign.targetGroupId);
      
      // Get campaign results
      const results = await storage.listCampaignResults(campaignId);
      
      // Calculate metrics
      const sentCount = results.filter(r => r.sent).length;
      const openedCount = results.filter(r => r.opened).length;
      const clickedCount = results.filter(r => r.clicked).length;
      
      const enrichedCampaign = {
        ...campaign,
        targetGroup: group?.name,
        emailTemplate: template ? { id: template.id, name: template.name } : null,
        landingPage: landingPage ? { id: landingPage.id, name: landingPage.name } : null,
        smtpProfile: smtpProfile ? { id: smtpProfile.id, name: smtpProfile.name } : null,
        totalTargets: targets.length,
        sentCount,
        openRate: sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0,
        clickRate: openedCount > 0 ? Math.round((clickedCount / openedCount) * 100) : 0,
      };
      
      res.json(enrichedCampaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Error fetching campaign" });
    }
  });

  // Update a campaign
  app.put("/api/campaigns/:id", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.organizationId !== req.user.organizationId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const validatedData = insertCampaignSchema.parse(req.body);
      
      // Validate that referenced objects exist and belong to user's organization
      const targetGroup = await storage.getGroup(Number(validatedData.targetGroupId));
      if (!targetGroup || targetGroup.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid target group" });
      }
      
      const smtpProfile = await storage.getSmtpProfile(Number(validatedData.smtpProfileId));
      if (!smtpProfile || smtpProfile.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid SMTP profile" });
      }
      
      const emailTemplate = await storage.getEmailTemplate(Number(validatedData.emailTemplateId));
      if (!emailTemplate || emailTemplate.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid email template" });
      }
      
      const landingPage = await storage.getLandingPage(Number(validatedData.landingPageId));
      if (!landingPage || landingPage.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid landing page" });
      }
      
      const updatedCampaign = await storage.updateCampaign(campaignId, {
        name: validatedData.name,
        targetGroupId: Number(validatedData.targetGroupId),
        smtpProfileId: Number(validatedData.smtpProfileId),
        emailTemplateId: Number(validatedData.emailTemplateId),
        landingPageId: Number(validatedData.landingPageId),
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      });
      
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating campaign" });
    }
  });

  // Delete a campaign
  app.delete("/api/campaigns/:id", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.organizationId !== req.user.organizationId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      await storage.deleteCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Error deleting campaign" });
    }
  });

  // Get campaign results
  app.get("/api/campaigns/:id/results", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id, 10);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.organizationId !== req.user.organizationId) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const results = await storage.listCampaignResults(campaignId);
      
      // Enrich results with target data
      const enrichedResults = [];
      for (const result of results) {
        const target = await storage.getTarget(result.targetId);
        enrichedResults.push({
          ...result,
          target: target ? {
            id: target.id,
            firstName: target.firstName,
            lastName: target.lastName,
            email: target.email,
            position: target.position
          } : null
        });
      }
      
      res.json(enrichedResults);
    } catch (error) {
      console.error("Error fetching campaign results:", error);
      res.status(500).json({ message: "Error fetching campaign results" });
    }
  });

  // Users Endpoints
  // User profile endpoints
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const allowedFields = ['firstName', 'lastName', 'position', 'bio'];
      const updateData: Partial<User> = {};
      
      // Only allow specific fields to be updated
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field as keyof User] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get the user with password (for verification)
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Use imported password functions from auth.ts
      // They are already available since we imported them at the top
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" 
        });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password
      const updatedUser = await storage.updateUser(req.user.id, { 
        password: hashedPassword,
        failedLoginAttempts: 0,
        accountLocked: false,
        accountLockedUntil: null
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  
  app.post("/api/user/profile-picture", isAuthenticated, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Convert image to base64 for storage
      // In a production app, you might want to store the file elsewhere and just save the URL
      const profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const updatedUser = await storage.updateUser(req.user.id, { profilePicture });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Failed to update profile picture" });
    }
  });
  
  app.get("/api/users", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const users = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        profilePicture: users.profilePicture,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.organizationId, req.user.organizationId));
      
      // Get roles for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const userRoles = await db.select({
            id: rolesSchema.id,
            name: rolesSchema.name,
            description: rolesSchema.description,
            permissions: rolesSchema.permissions,
          })
          .from(userRolesSchema)
          .innerJoin(rolesSchema, eq(userRolesSchema.roleId, rolesSchema.id))
          .where(eq(userRolesSchema.userId, user.id));
          
          return {
            ...user,
            roles: userRoles,
          };
        })
      );
      
      res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/users", isAuthenticated, hasOrganization, isAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, password, roleIds, isActive } = req.body;
      
      // Check if user already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const [newUser] = await db.insert(users).values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isActive: isActive ?? true,
        organizationId: req.user.organizationId,
      }).returning();
      
      // Assign roles
      if (roleIds && roleIds.length > 0) {
        const roleAssignments = roleIds.map(roleId => ({
          userId: newUser.id,
          roleId: roleId,
        }));
        
        await db.insert(userRolesSchema).values(roleAssignments);
      }
      
      res.status(201).json({ 
        message: "User created successfully", 
        user: { 
          id: newUser.id, 
          firstName: newUser.firstName, 
          lastName: newUser.lastName,
          email: newUser.email 
        } 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, hasOrganization, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { firstName, lastName, email, roleIds, isActive } = req.body;
      
      // Update user
      const [updatedUser] = await db.update(users)
        .set({ 
          firstName, 
          lastName, 
          email, 
          isActive,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId))
        .returning();
      
      // Update roles
      if (roleIds) {
        // Remove existing roles
        await db.delete(userRolesSchema).where(eq(userRolesSchema.userId, userId));
        
        // Add new roles
        if (roleIds.length > 0) {
          const roleAssignments = roleIds.map(roleId => ({
            userId: userId,
            roleId: roleId,
          }));
          
          await db.insert(userRolesSchema).values(roleAssignments);
        }
      }
      
      res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, hasOrganization, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow deleting self
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Delete user roles first
      await db.delete(userRolesSchema).where(eq(userRolesSchema.userId, userId));
      
      // Delete user
      await db.delete(users).where(eq(users.id, userId));
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Reports Export Endpoints
  app.post("/api/reports/export", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const { type, dateRange, filters } = req.body;
      
      let reportData: any = {
        type,
        organizationName: req.user.organizationName,
        dateRange: dateRange ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : null
      };
      
      // Build date filter
      const dateFilter = dateRange ? 
        and(
          eq(campaigns.organizationId, req.user.organizationId),
          gte(campaigns.createdAt, new Date(dateRange.start)),
          lte(campaigns.createdAt, new Date(dateRange.end))
        ) : eq(campaigns.organizationId, req.user.organizationId);
      
      switch (type) {
        case 'campaigns':
          const campaigns_data = await db.select().from(campaigns).where(dateFilter);
          reportData.campaigns = campaigns_data;
          break;
        case 'users':
          const users_data = await db.select().from(users).where(eq(users.organizationId, req.user.organizationId));
          reportData.users = users_data;
          break;
        case 'results':
          const results_data = await db.select().from(campaignResults)
            .innerJoin(campaigns, eq(campaignResults.campaignId, campaigns.id))
            .where(dateFilter);
          reportData.results = results_data;
          break;
        case 'comprehensive':
          const comp_campaigns = await db.select().from(campaigns).where(dateFilter);
          const comp_users = await db.select().from(users).where(eq(users.organizationId, req.user.organizationId));
          const comp_results = await db.select().from(campaignResults)
            .innerJoin(campaigns, eq(campaignResults.campaignId, campaigns.id))
            .where(dateFilter);
          
          reportData.campaigns = comp_campaigns;
          reportData.users = comp_users;
          reportData.results = comp_results;
          break;
      }
      
      const filename = await exportReportToCsv(reportData);
      
      res.json({ 
        success: true,
        filename,
        downloadUrl: `/api/reports/download/${filename}`
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ message: "Error exporting report" });
    }
  });
  
  app.get("/api/reports/download/:filename", isAuthenticated, (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(process.cwd(), 'uploads', filename);
      
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          res.status(500).json({ message: "Error downloading file" });
        } else {
          // Clean up file after download
          setTimeout(() => {
            fs.unlink(filepath, (unlinkErr) => {
              if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
          }, 5000);
        }
      });
    } catch (error) {
      console.error("Error serving download:", error);
      res.status(500).json({ message: "Error serving download" });
    }
  });

  // Notification Endpoints
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const notifications = await NotificationService.getUserNotifications(
        req.user.id, 
        limit, 
        offset
      );
      
      const unreadCount = await NotificationService.getUnreadCount(req.user.id);
      
      res.json({
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          hasMore: notifications.length === limit
        }
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Error fetching unread count" });
    }
  });

  app.put("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await NotificationService.markAsRead(notificationId, req.user.id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  app.put("/api/notifications/mark-all-read", isAuthenticated, async (req, res) => {
    try {
      const notifications = await NotificationService.markAllAsRead(req.user.id);
      res.json({ updated: notifications.length });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Error marking all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await NotificationService.deleteNotification(notificationId, req.user.id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Error deleting notification" });
    }
  });

  // Notification Preferences
  app.get("/api/notifications/preferences", isAuthenticated, async (req, res) => {
    try {
      const preferences = await NotificationService.getPreferences(req.user.id);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Error fetching notification preferences" });
    }
  });

  app.put("/api/notifications/preferences", isAuthenticated, async (req, res) => {
    try {
      const preferences = await NotificationService.updatePreferences(req.user.id, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Error updating notification preferences" });
    }
  });

  // Admin endpoint to create notifications
  app.post("/api/notifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { type, title, message, priority, actionUrl, userIds, broadcast } = req.body;
      
      if (broadcast) {
        // Send to all users in organization
        const notifications = await NotificationService.createOrganizationNotification({
          organizationId: req.user.organizationId,
          type,
          title,
          message,
          priority,
          actionUrl
        });
        res.json({ message: "Broadcast notification sent", count: notifications.length });
      } else if (userIds && userIds.length > 0) {
        // Send to specific users
        const notifications = [];
        for (const userId of userIds) {
          const notification = await NotificationService.createNotification({
            userId,
            organizationId: req.user.organizationId,
            type,
            title,
            message,
            priority,
            actionUrl
          });
          notifications.push(notification);
        }
        res.json({ message: "Notifications sent", count: notifications.length });
      } else {
        res.status(400).json({ message: "Must specify userIds or set broadcast to true" });
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
      res.status(500).json({ message: "Error creating notifications" });
    }
  });

  // Error statistics endpoint
  app.get("/api/debug/errors", isAuthenticated, isAdmin, (req, res) => {
    try {
      const stats = errorHandler.getErrorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching error statistics" });
    }
  });

  // Clear error history endpoint
  app.delete("/api/debug/errors", isAuthenticated, isAdmin, (req, res) => {
    try {
      errorHandler.clearHistory();
      res.json({ message: "Error history cleared" });
    } catch (error) {
      res.status(500).json({ message: "Error clearing error history" });
    }
  });

  // Add error handling middleware (must be last)
  app.use(errorHandler.middleware);

  const httpServer = createServer(app);
  return httpServer;
}

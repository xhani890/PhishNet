import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hasOrganization, hashPassword, comparePasswords, refreshSession } from "./auth";
import { db, pool } from "./db"; // Add pool import here
import { eq } from "drizzle-orm";
import multer from "multer";
import Papa from "papaparse";
import { insertGroupSchema, insertTargetSchema, insertSmtpProfileSchema, insertEmailTemplateSchema, insertLandingPageSchema, insertCampaignSchema, emailTemplates, User } from "@shared/schema";
import { z } from "zod";

// Set up file upload middleware
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server first
  const server = createServer(app);
  
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

  // Dashboard Stats
  app.get("/api/dashboard/stats", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.user.organizationId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // Dashboard Metrics (Mock data for chart)
  app.get("/api/dashboard/metrics", isAuthenticated, (req, res) => {
    // Provide mock data for the phishing success rate chart
    const data = [
      { date: "Jan", rate: 42 },
      { date: "Feb", rate: 38 },
      { date: "Mar", rate: 45 },
      { date: "Apr", rate: 39 },
      { date: "May", rate: 33 },
      { date: "Jun", rate: 28 },
      { date: "Jul", rate: 32 },
    ];
    res.json(data);
  });

  // Dashboard Threat Data
  app.get("/api/dashboard/threats", isAuthenticated, (req, res) => {
    // Provide mock threat data
    const threats = [
      {
        id: 1,
        name: "Credential Phishing",
        description: "Recent campaigns target Microsoft 365 users with fake login pages.",
        level: "high"
      },
      {
        id: 2,
        name: "Invoice Fraud",
        description: "Finance departments targeted with fake invoice attachments containing malware.",
        level: "medium"
      },
      {
        id: 3,
        name: "CEO Fraud",
        description: "Impersonation attacks requesting urgent wire transfers or gift card purchases.",
        level: "medium"
      }
    ];
    res.json(threats);
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
      const groups = await storage.listGroups(req.user.organizationId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups" });
    }
  });

  app.post("/api/groups", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(req.user.organizationId, validatedData);
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
      const target = await storage.createTarget(req.user.organizationId, groupId, validatedData);
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
      
      for (const [index, row] of results.data.entries()) {
        try {
          // Normalize field names
          const normalizedRow: any = {};
          for (const [key, value] of Object.entries(row)) {
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
          
          // Create the target
          const target = await storage.createTarget(req.user.organizationId, groupId, validatedData);
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
      const profiles = await storage.listSmtpProfiles(req.user.organizationId);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching SMTP profiles" });
    }
  });

  app.post("/api/smtp-profiles", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSmtpProfileSchema.parse(req.body);
      const profile = await storage.createSmtpProfile(req.user.organizationId, validatedData);
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
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      
      // Create a template using existing storage method
      const template = await storage.createEmailTemplate(
        req.user.organizationId, 
        req.user.id, 
        {
          name: validatedData.name,
          subject: validatedData.subject,
          htmlContent: validatedData.html_content || validatedData.htmlContent || "<div>Default content</div>",
          textContent: validatedData.text_content || validatedData.textContent,
          senderName: validatedData.sender_name || validatedData.senderName,
          senderEmail: validatedData.sender_email || validatedData.senderEmail,
          type: validatedData.type,
          complexity: validatedData.complexity,
          description: validatedData.description,
          category: validatedData.category
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
      const templateId = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Ensure user has access to this template
      if (template.organizationId !== req.user.organizationId) {
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
      const templateId = parseInt(req.params.id);
      const template = await storage.getEmailTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      
      // Ensure user has access to this template
      if (template.organizationId !== req.user.organizationId) {
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
      const pages = await storage.listLandingPages(req.user.organizationId);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landing pages" });
    }
  });

  app.post("/api/landing-pages", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const validatedData = insertLandingPageSchema.parse(req.body);
      
      // Create the landing page with thumbnail
      const page = await storage.createLandingPage(
        req.user.organizationId, 
        req.user.id, 
        validatedData
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
      
      const validatedData = updateLandingPageSchema.parse(req.body);
      
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
          message: `Error fetching URL: ${error.message || "Unknown error"}` 
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
      console.log("User organization ID:", req.user.organizationId);
      
      // Create a custom validation schema that accepts strings for dates
      const campaignValidationSchema = z.object({
        name: z.string().min(1, "Campaign name is required"),
        targetGroupId: z.number().or(z.string().transform(val => parseInt(val))),
        smtpProfileId: z.number().or(z.string().transform(val => parseInt(val))),
        emailTemplateId: z.number().or(z.string().transform(val => parseInt(val))),
        landingPageId: z.number().or(z.string().transform(val => parseInt(val))),
        scheduledAt: z.string().optional().nullable().or(z.literal('')),
        endDate: z.string().optional().nullable().or(z.literal('')),
      });
      
      // Attempt to validate the data with the custom schema
      let validatedData;
      try {
        validatedData = campaignValidationSchema.parse(req.body);
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
      
      console.log("Validated data:", validatedData);
      
      // Validate that referenced objects exist and belong to user's organization
      const targetGroup = await storage.getGroup(Number(validatedData.targetGroupId));
      console.log("Target group found:", targetGroup ? `ID ${targetGroup.id}, Org ${targetGroup.organizationId}` : "NOT FOUND");
      if (!targetGroup || targetGroup.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid target group" });
      }
      
      const smtpProfile = await storage.getSmtpProfile(Number(validatedData.smtpProfileId));
      console.log("SMTP profile found:", smtpProfile ? `ID ${smtpProfile.id}, Org ${smtpProfile.organizationId}` : "NOT FOUND");
      if (!smtpProfile || smtpProfile.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid SMTP profile" });
      }
      
      const emailTemplate = await storage.getEmailTemplate(Number(validatedData.emailTemplateId));
      console.log("Email template found:", emailTemplate ? `ID ${emailTemplate.id}, Org ${emailTemplate.organizationId}` : "NOT FOUND");
      if (!emailTemplate) {
        return res.status(400).json({ message: "Email template not found" });
      }
      if (emailTemplate.organizationId !== req.user.organizationId) {
        console.log(`Email template organization mismatch: Template org ${emailTemplate.organizationId}, User org ${req.user.organizationId}`);
        return res.status(400).json({ message: "Invalid email template - organization mismatch" });
      }
      
      const landingPage = await storage.getLandingPage(Number(validatedData.landingPageId));
      console.log("Landing page found:", landingPage ? `ID ${landingPage.id}, Org ${landingPage.organizationId}` : "NOT FOUND");
      if (!landingPage || landingPage.organizationId !== req.user.organizationId) {
        return res.status(400).json({ message: "Invalid landing page" });
      }
      
      // Convert string dates to Date objects or null
      const scheduledAt = validatedData.scheduledAt && validatedData.scheduledAt !== "" 
        ? new Date(validatedData.scheduledAt) 
        : null;
      const endDate = validatedData.endDate && validatedData.endDate !== "" 
        ? new Date(validatedData.endDate) 
        : null;
      
      console.log("All validations passed, creating campaign...");
      
      // Create the campaign with properly formatted data
      const campaign = await storage.createCampaign(
        req.user.organizationId, 
        req.user.id, 
        {
          name: validatedData.name,
          targetGroupId: Number(validatedData.targetGroupId),
          smtpProfileId: Number(validatedData.smtpProfileId),
          emailTemplateId: Number(validatedData.emailTemplateId),
          landingPageId: Number(validatedData.landingPageId),
          scheduledAt,
          endDate,
        }
      );
      
      console.log("Campaign created successfully:", campaign);
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

  // Get a specific campaign by ID
  app.get("/api/campaigns/:id", isAuthenticated, hasOrganization, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id, 10);
      console.log(`Fetching campaign with ID: ${campaignId} for org: ${req.user.organizationId}`);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        console.log(`Campaign not found for ID: ${campaignId}`);
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.organizationId !== req.user.organizationId) {
        console.log(`Access denied for campaign ID: ${campaignId}. Campaign org: ${campaign.organizationId}, User org: ${req.user.organizationId}`);
        return res.status(403).json({ message: "Access denied" });
      }
      
      console.log(`Campaign found and returning:`, campaign);
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Error fetching campaign" });
    }
  });

  // Update a specific campaign by ID
app.put("/api/campaigns/:id", isAuthenticated, hasOrganization, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign || campaign.organizationId !== req.user.organizationId) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    // Create a custom validation schema that accepts strings for dates
    const campaignValidationSchema = z.object({
      name: z.string().min(1, "Campaign name is required"),
      targetGroupId: z.number().or(z.string().transform(val => parseInt(val))),
      smtpProfileId: z.number().or(z.string().transform(val => parseInt(val))),
      emailTemplateId: z.number().or(z.string().transform(val => parseInt(val))),
      landingPageId: z.number().or(z.string().transform(val => parseInt(val))),
      scheduledAt: z.string().optional().nullable().or(z.literal('')),
      endDate: z.string().optional().nullable().or(z.literal('')),
    });
    
    const validatedData = campaignValidationSchema.parse(req.body);
    
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
    
    // Convert string dates to Date objects or null
    const scheduledAt = validatedData.scheduledAt && validatedData.scheduledAt !== "" 
      ? new Date(validatedData.scheduledAt) 
      : null;
    const endDate = validatedData.endDate && validatedData.endDate !== "" 
      ? new Date(validatedData.endDate) 
      : null;
    
    const updatedCampaign = await storage.updateCampaign(campaignId, {
      name: validatedData.name,
      targetGroupId: Number(validatedData.targetGroupId),
      smtpProfileId: Number(validatedData.smtpProfileId),
      emailTemplateId: Number(validatedData.emailTemplateId),
      landingPageId: Number(validatedData.landingPageId),
      scheduledAt,
      endDate,
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

// Delete a specific campaign by ID
app.delete("/api/campaigns/:id", isAuthenticated, hasOrganization, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    console.log(`Attempting to delete campaign with ID: ${campaignId} for org: ${req.user.organizationId}`);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }
    
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      console.log(`Campaign not found for ID: ${campaignId}`);
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.organizationId !== req.user.organizationId) {
      console.log(`Access denied for campaign ID: ${campaignId}. Campaign org: ${campaign.organizationId}, User org: ${req.user.organizationId}`);
      return res.status(403).json({ message: "Access denied" });
    }
    
    console.log(`Deleting campaign: ${campaign.name} (ID: ${campaignId})`);
    
    const success = await storage.deleteCampaign(campaignId);
    
    if (success) {
      console.log(`Campaign ${campaignId} deleted successfully`);
      return res.status(200).json({ message: "Campaign deleted successfully" });
    } else {
      console.error(`Failed to delete campaign ${campaignId}`);
      return res.status(500).json({ message: "Failed to delete campaign" });
    }
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Error deleting campaign" });
  }
});

// Get campaign results
app.get("/api/campaigns/:id/results", isAuthenticated, hasOrganization, async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }
    
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign || campaign.organizationId !== req.user.organizationId) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const results = await storage.listCampaignResults(campaignId);
    res.json(results);
  } catch (error) {
    console.error("Error fetching campaign results:", error);
    res.status(500).json({ message: "Error fetching campaign results" });
  }
});

// Add the debug endpoint
app.get("/api/debug/email-templates", isAuthenticated, async (req, res) => {
  try {
    console.log("Debug: Fetching all email templates for user org:", req.user.organizationId);
    
    // Get all templates from database
    const result = await pool.query(
      'SELECT id, name, organization_id FROM email_templates ORDER BY id'
    );
    
    console.log("Debug: All email templates in database:", result.rows);
    
    // Get templates for user's organization
    const userTemplates = result.rows.filter(t => t.organization_id === req.user.organizationId);
    console.log("Debug: Templates for user's organization:", userTemplates);
    
    res.json({
      allTemplates: result.rows,
      userTemplates: userTemplates,
      userOrgId: req.user.organizationId
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Return the server instance
return server;
}

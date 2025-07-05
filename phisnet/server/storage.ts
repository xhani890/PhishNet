import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { db, pool } from './db';
import { eq, and, count } from 'drizzle-orm';
import { 
  users, 
  organizations, 
  groups, 
  targets, 
  smtpProfiles, 
  emailTemplates, 
  landingPages, 
  campaigns, 
  campaignResults, 
  passwordResetTokens,
  type User,
  type Organization,
  type Group,
  type Target,
  type SmtpProfile,
  type EmailTemplate,
  type LandingPage,
  type Campaign,
  type CampaignResult,
  type PasswordResetToken,
  type InsertUser,
  type InsertOrganization,
  type InsertGroup,
  type InsertTarget,
  type InsertSmtpProfile,
  type InsertEmailTemplate,
  type InsertLandingPage,
  type InsertCampaign,
  type InsertCampaignResult,
  type InsertPasswordResetToken
} from '@shared/schema';

// Create PostgreSQL session store
const PostgresSessionStore = ConnectPgSimple(session);

export interface IStorage {
  sessionStore: any;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(organizationId: number): Promise<User[]>;
  
  // Organization methods
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByName(name: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;
  listOrganizations(): Promise<Organization[]>;
  
  // Group methods
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(organizationId: number, group: InsertGroup): Promise<Group>;
  updateGroup(id: number, data: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  listGroups(organizationId: number): Promise<(Group & { targetCount: number })[]>;
  
  // Target methods
  getTarget(id: number): Promise<Target | undefined>;
  createTarget(organizationId: number, groupId: number, target: InsertTarget): Promise<Target>;
  updateTarget(id: number, data: Partial<Target>): Promise<Target | undefined>;
  deleteTarget(id: number): Promise<boolean>;
  listTargets(groupId: number): Promise<Target[]>;
  
  // SMTP Profile methods
  getSmtpProfile(id: number): Promise<SmtpProfile | undefined>;
  createSmtpProfile(organizationId: number, profile: InsertSmtpProfile): Promise<SmtpProfile>;
  updateSmtpProfile(id: number, data: Partial<SmtpProfile>): Promise<SmtpProfile | undefined>;
  deleteSmtpProfile(id: number): Promise<boolean>;
  listSmtpProfiles(organizationId: number): Promise<SmtpProfile[]>;
  
  // Email Template methods
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  createEmailTemplate(organizationId: number, userId: number, template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: number): Promise<boolean>;
  listEmailTemplates(organizationId: number): Promise<EmailTemplate[]>;
  
  // Landing Page methods
  getLandingPage(id: number): Promise<LandingPage | undefined>;
  createLandingPage(organizationId: number, userId: number, page: InsertLandingPage): Promise<LandingPage>;
  updateLandingPage(id: number, data: Partial<LandingPage>): Promise<LandingPage | undefined>;
  deleteLandingPage(id: number): Promise<boolean>;
  listLandingPages(organizationId: number): Promise<LandingPage[]>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(organizationId: number, userId: number, campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  listCampaigns(organizationId: number): Promise<Campaign[]>;
  
  // Campaign Result methods
  getCampaignResult(id: number): Promise<CampaignResult | undefined>;
  createCampaignResult(result: InsertCampaignResult): Promise<CampaignResult>;
  updateCampaignResult(id: number, data: Partial<CampaignResult>): Promise<CampaignResult | undefined>;
  deleteCampaignResult(id: number): Promise<boolean>;
  listCampaignResults(campaignId: number): Promise<CampaignResult[]>;
  
  // Password Reset Token methods
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<boolean>;
  
  // Dashboard stats
  getDashboardStats(organizationId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // ALWAYS use database session store - no fallback to memory
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'session',
      createTableIfMissing: true,
      ttl: 30 * 60 // 30 minutes in seconds
    });
    
    console.log('Database session store initialized with 30 minute TTL');
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  async listUsers(organizationId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }
  
  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }
  
  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.name, name));
    return org;
  }
  
  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [newOrg] = await db.insert(organizations).values(org).returning();
    return newOrg;
  }
  
  async updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined> {
    const [updatedOrg] = await db.update(organizations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();
    return updatedOrg;
  }
  
  async deleteOrganization(id: number): Promise<boolean> {
    await db.delete(organizations).where(eq(organizations.id, id));
    return true;
  }
  
  async listOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }
  
  // Group methods
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }
  
  async createGroup(organizationId: number, group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values({
      name: group.name,
      description: group.description,
      organizationId,
    }).returning();
    return newGroup;
  }
  
  async updateGroup(id: number, data: Partial<Group>): Promise<Group | undefined> {
    const [updatedGroup] = await db.update(groups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }
  
  async deleteGroup(id: number): Promise<boolean> {
    await db.delete(groups).where(eq(groups.id, id));
    return true;
  }
  
  async listGroups(organizationId: number): Promise<(Group & { targetCount: number })[]> {
    const groupList = await db.select().from(groups).where(eq(groups.organizationId, organizationId));
    
    const groupsWithCounts = await Promise.all(
      groupList.map(async (group) => {
        const targetCount = await db.select({ count: count() })
          .from(targets)
          .where(eq(targets.groupId, group.id));
        
        return {
          ...group,
          targetCount: targetCount[0]?.count || 0,
        };
      })
    );
    
    return groupsWithCounts;
  }
  
  // Target methods
  async getTarget(id: number): Promise<Target | undefined> {
    const [target] = await db.select().from(targets).where(eq(targets.id, id));
    return target;
  }
  
  async createTarget(organizationId: number, groupId: number, target: InsertTarget): Promise<Target> {
    const [newTarget] = await db.insert(targets).values({
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      position: target.position,
      groupId,
      organizationId,
    }).returning();
    return newTarget;
  }
  
  async updateTarget(id: number, data: Partial<Target>): Promise<Target | undefined> {
    const [updatedTarget] = await db.update(targets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(targets.id, id))
      .returning();
    return updatedTarget;
  }
  
  async deleteTarget(id: number): Promise<boolean> {
    await db.delete(targets).where(eq(targets.id, id));
    return true;
  }
  
  async listTargets(groupId: number): Promise<Target[]> {
    return await db.select().from(targets).where(eq(targets.groupId, groupId));
  }
  
  // SMTP Profile methods
  async getSmtpProfile(id: number): Promise<SmtpProfile | undefined> {
    const [profile] = await db.select().from(smtpProfiles).where(eq(smtpProfiles.id, id));
    return profile;
  }
  
  async createSmtpProfile(organizationId: number, profile: InsertSmtpProfile): Promise<SmtpProfile> {
    const [newProfile] = await db.insert(smtpProfiles).values({
      name: profile.name,
      host: profile.host,
      port: profile.port,
      username: profile.username,
      password: profile.password,
      fromEmail: profile.fromEmail,
      fromName: profile.fromName,
      organizationId,
    }).returning();
    return newProfile;
  }
  
  async updateSmtpProfile(id: number, data: Partial<SmtpProfile>): Promise<SmtpProfile | undefined> {
    const [updatedProfile] = await db.update(smtpProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(smtpProfiles.id, id))
      .returning();
    return updatedProfile;
  }
  
  async deleteSmtpProfile(id: number): Promise<boolean> {
    await db.delete(smtpProfiles).where(eq(smtpProfiles.id, id));
    return true;
  }
  
  async listSmtpProfiles(organizationId: number): Promise<SmtpProfile[]> {
    return await db.select().from(smtpProfiles).where(eq(smtpProfiles.organizationId, organizationId));
  }
  
  // Email Template methods
  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    try {
      console.log(`Getting email template with ID: ${id}`);
      
      // Use direct database query to ensure we get the correct data
      const result = await pool.query(
        'SELECT * FROM email_templates WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log(`No email template found with ID: ${id}`);
        return undefined;
      }
      
      const dbTemplate = result.rows[0];
      console.log(`Raw email template data from DB:`, dbTemplate);
      
      // Map database fields to application model
      const template = {
        id: dbTemplate.id,
        name: dbTemplate.name,
        subject: dbTemplate.subject,
        htmlContent: dbTemplate.html_content,
        textContent: dbTemplate.text_content,
        senderName: dbTemplate.sender_name,
        senderEmail: dbTemplate.sender_email,
        type: dbTemplate.type,
        complexity: dbTemplate.complexity,
        description: dbTemplate.description,
        category: dbTemplate.category,
        organizationId: dbTemplate.organization_id,
        createdById: dbTemplate.created_by_id,
        createdAt: dbTemplate.created_at,
        updatedAt: dbTemplate.updated_at,
      };
      
      console.log(`Mapped email template data:`, template);
      return template;
    } catch (error) {
      console.error("Error getting email template:", error);
      throw error;
    }
  }
  
  async createEmailTemplate(organizationId: number, userId: number, template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates).values({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      senderName: template.senderName,
      senderEmail: template.senderEmail,
      type: template.type,
      complexity: template.complexity,
      description: template.description,
      category: template.category,
      organizationId,
      createdById: userId,
    }).returning();
    return newTemplate;
  }
  
  async updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    const [updatedTemplate] = await db.update(emailTemplates)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return true;
  }
  
  async listEmailTemplates(organizationId: number): Promise<EmailTemplate[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM email_templates WHERE organization_id = $1`,
        [organizationId]
      );
      
      // Map database rows to application model
      return result.rows.map(dbTemplate => ({
        id: dbTemplate.id,
        name: dbTemplate.name,
        subject: dbTemplate.subject,
        html_content: dbTemplate.html_content || dbTemplate.html || '',
        text_content: dbTemplate.text_content || dbTemplate.text || null,
        sender_name: dbTemplate.sender_name || '',
        sender_email: dbTemplate.sender_email || dbTemplate.envelope_sender || '',
        organization_id: dbTemplate.organization_id,
        created_at: dbTemplate.created_at,
        updated_at: dbTemplate.updated_at,
        created_by_id: dbTemplate.created_by_id,
        type: dbTemplate.type || null,
        complexity: dbTemplate.complexity || null,
        description: dbTemplate.description || null,
        category: dbTemplate.category || null
      }));
    } catch (error) {
      console.error("Error fetching email templates:", error);
      throw error;
    }
  }
  
  // Landing Page methods
  async getLandingPage(id: number): Promise<LandingPage | undefined> {
    const [page] = await db.select().from(landingPages).where(eq(landingPages.id, id));
    return page;
  }
  
  async createLandingPage(organizationId: number, userId: number, page: InsertLandingPage): Promise<LandingPage> {
    const [newPage] = await db.insert(landingPages).values({
      name: page.name,
      description: page.description,
      htmlContent: page.htmlContent,
      redirectUrl: page.redirectUrl,
      pageType: page.pageType,
      thumbnail: page.thumbnail,
      organizationId,
      createdById: userId,
    }).returning();
    return newPage;
  }
  
  async updateLandingPage(id: number, data: Partial<LandingPage>): Promise<LandingPage | undefined> {
    const [updatedPage] = await db.update(landingPages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(landingPages.id, id))
      .returning();
    return updatedPage;
  }
  
  async deleteLandingPage(id: number): Promise<boolean> {
    await db.delete(landingPages).where(eq(landingPages.id, id));
    return true;
  }
  
  async listLandingPages(organizationId: number): Promise<LandingPage[]> {
    return await db.select().from(landingPages).where(eq(landingPages.organizationId, organizationId));
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    try {
      console.log(`Getting campaign with ID: ${id}`);
      
      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
      
      if (!campaign) {
        console.log(`No campaign found with ID: ${id}`);
        return undefined;
      }
      
      console.log(`Campaign found:`, campaign);
      return campaign;
    } catch (error) {
      console.error("Error getting campaign:", error);
      throw error;
    }
  }
  
  async createCampaign(organizationId: number, userId: number, campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values({
      name: campaign.name,
      targetGroupId: campaign.targetGroupId,
      smtpProfileId: campaign.smtpProfileId,
      emailTemplateId: campaign.emailTemplateId,
      landingPageId: campaign.landingPageId,
      scheduledAt: campaign.scheduledAt,
      endDate: campaign.endDate,
      status: "Draft",
      organizationId,
      createdById: userId,
    }).returning();
    return newCampaign;
  }
  
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const [updatedCampaign] = await db.update(campaigns)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
    return true;
  }
  
  async listCampaigns(organizationId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.organizationId, organizationId));
  }
  
  // Campaign Result methods
  async getCampaignResult(id: number): Promise<CampaignResult | undefined> {
    const [result] = await db.select().from(campaignResults).where(eq(campaignResults.id, id));
    return result;
  }
  
  async createCampaignResult(result: InsertCampaignResult): Promise<CampaignResult> {
    const [newResult] = await db.insert(campaignResults).values(result).returning();
    return newResult;
  }
  
  async updateCampaignResult(id: number, data: Partial<CampaignResult>): Promise<CampaignResult | undefined> {
    const [updatedResult] = await db.update(campaignResults)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(campaignResults.id, id))
      .returning();
    return updatedResult;
  }
  
  async deleteCampaignResult(id: number): Promise<boolean> {
    await db.delete(campaignResults).where(eq(campaignResults.id, id));
    return true;
  }
  
  async listCampaignResults(campaignId: number): Promise<CampaignResult[]> {
    return await db.select().from(campaignResults).where(eq(campaignResults.campaignId, campaignId));
  }
  
  // Password Reset Token methods
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [newToken] = await db.insert(passwordResetTokens).values(token).returning();
    return newToken;
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }
  
  async deletePasswordResetToken(token: string): Promise<boolean> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return true;
  }
  
  // Dashboard stats
  async getDashboardStats(organizationId: number): Promise<any> {
    try {
      const [campaignCount] = await db.select({ count: count() }).from(campaigns).where(eq(campaigns.organizationId, organizationId));
      const [userCount] = await db.select({ count: count() }).from(users).where(eq(users.organizationId, organizationId));
      const [groupCount] = await db.select({ count: count() }).from(groups).where(eq(groups.organizationId, organizationId));
      
      return {
        totalCampaigns: campaignCount.count || 0,
        totalUsers: userCount.count || 0,
        totalGroups: groupCount.count || 0,
        activeCampaigns: 0, // This would need more complex logic
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();



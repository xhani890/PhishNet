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

// Define interface for storage implementation
interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { organizationId: number }): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(organizationId: number): Promise<User[]>;
  
  // Password reset methods
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: number): Promise<boolean>;
  
  // Organization methods
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByName(name: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  
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
  
  // Campaign Results methods
  getCampaignResult(id: number): Promise<CampaignResult | undefined>;
  createCampaignResult(result: InsertCampaignResult): Promise<CampaignResult>;
  updateCampaignResult(id: number, data: Partial<CampaignResult>): Promise<CampaignResult | undefined>;
  listCampaignResults(campaignId: number): Promise<CampaignResult[]>;
  
  // Dashboard methods
  getDashboardStats(organizationId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
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
  
  async createUser(user: InsertUser & { organizationId: number }): Promise<User> {
    try {
      console.log('Creating user:', {
        ...user,
        password: '[REDACTED]'  // Don't log the password
      });

      const [newUser] = await db.insert(users).values({
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin ?? false,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        failedLoginAttempts: 0,
        accountLocked: false
      }).returning();

      console.log('User created successfully:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
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
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }
  
  async listUsers(organizationId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }
  
  // Password reset methods
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const id = this.currentId++;
    const now = new Date();
    const newToken = {
      id,
      userId,
      token,
      expiresAt,
      used: false,
      createdAt: now
    };
    this.passwordResetTokens.set(id, newToken);
    return newToken;
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false)
      )
    );
    return resetToken;
  }
  
  async markPasswordResetTokenUsed(id: number): Promise<boolean> {
    const [updated] = await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    return !!updated;
  }
  
  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }
  
  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.name, name));
    return organization;
  }
  
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db.insert(organizations).values({
      name: organization.name,
    }).returning();
    return newOrganization;
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
    // First get all groups
    const groupsList = await db.select().from(groups).where(eq(groups.organizationId, organizationId));
    
    // Then get target counts for each group
    const result = [];
    for (const group of groupsList) {
      const [countResult] = await db
        .select({ count: count() })
        .from(targets)
        .where(eq(targets.groupId, group.id));
      
      result.push({
        ...group,
        targetCount: Number(countResult.count) || 0
      });
    }
    
    return result;
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
      fromName: profile.fromName,
      fromEmail: profile.fromEmail,
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
      const result = await pool.query(
        `SELECT * FROM email_templates WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        console.log(`No template found with ID ${id}`);
        return undefined;
      }
      
      // Map the DB result back to our application model
      const dbTemplate = result.rows[0];
      console.log(`Found template: ${dbTemplate.id} - ${dbTemplate.name}`);
      
      return {
        id: dbTemplate.id,
        name: dbTemplate.name,
        subject: dbTemplate.subject,
        html_content: dbTemplate.html_content,
        text_content: dbTemplate.text_content,
        sender_name: dbTemplate.sender_name,
        sender_email: dbTemplate.sender_email,
        organizationId: dbTemplate.organization_id, // Make sure this property exists
        organization_id: dbTemplate.organization_id, // Add this for backwards compatibility
        created_at: dbTemplate.created_at,
        updated_at: dbTemplate.updated_at,
        created_by_id: dbTemplate.created_by_id
      };
    } catch (error) {
      console.error("Error getting template:", error);
      return undefined;
    }
  }
  
  async createEmailTemplate(organizationId: number, userId: number, template: InsertEmailTemplate): Promise<EmailTemplate> {
    try {
      const result = await pool.query(
        `INSERT INTO email_templates 
         (name, subject, html_content, text_content, sender_name, sender_email, organization_id, created_by_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [
          template.name,
          template.subject,
          template.htmlContent,
          template.textContent || null,
          template.senderName,
          template.senderEmail,
          organizationId,
          userId
        ]
      );

      // Map the DB result back to our application model
      const dbTemplate = result.rows[0];
      return {
        id: dbTemplate.id,
        name: dbTemplate.name,
        subject: dbTemplate.subject,
        htmlContent: dbTemplate.html_content,
        textContent: dbTemplate.text_content,
        senderName: dbTemplate.sender_name,
        senderEmail: dbTemplate.sender_email,
        organizationId: dbTemplate.organization_id,
        createdAt: dbTemplate.created_at,
        updatedAt: dbTemplate.updated_at,
        createdById: dbTemplate.created_by_id
      };
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  }
  
  async updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate | undefined> {
    try {
      // Map application model to database model
      const dbData: any = {};
      
      if (data.name) dbData.name = data.name;
      if (data.subject) dbData.subject = data.subject;
      if (data.html_content) dbData.html_content = data.html_content;
      if (data.text_content) dbData.text_content = data.text_content;
      if (data.sender_name) dbData.sender_name = data.sender_name;
      if (data.sender_email) dbData.sender_email = data.sender_email;
      dbData.updated_at = new Date();
      
      // Convert to SQL update format
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCounter = 1;
      
      Object.entries(dbData).forEach(([key, value]) => {
        updateFields.push(`${key} = $${paramCounter}`);
        updateValues.push(value);
        paramCounter++;
      });
      
      updateValues.push(id);
      
      const result = await pool.query(
        `UPDATE email_templates SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
        updateValues
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const dbTemplate = result.rows[0];
      return {
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
        type: data.type || null,
        complexity: data.complexity || null,
        description: data.description || null,
        category: data.category || null
      };
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  }
  
  async deleteEmailTemplate(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `DELETE FROM email_templates WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
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
      console.error("Error listing templates:", error);
      return [];
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
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }
  
  async createCampaign(organizationId: number, userId: number, campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values({
      name: campaign.name,
      targetGroupId: Number(campaign.targetGroupId),
      smtpProfileId: Number(campaign.smtpProfileId),
      emailTemplateId: Number(campaign.emailTemplateId),
      landingPageId: Number(campaign.landingPageId),
      scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : null,
      endDate: campaign.endDate ? new Date(campaign.endDate) : null,
      createdById: userId,
      organizationId,
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
  
  async createCampaignResult(organizationId: number, result: InsertCampaignResult): Promise<CampaignResult> {
    const [newResult] = await db.insert(campaignResults).values({
      campaignId: result.campaignId,
      targetId: result.targetId,
      sent: result.sent,
      sentAt: result.sentAt,
      opened: result.opened,
      openedAt: result.openedAt,
      clicked: result.clicked,
      clickedAt: result.clickedAt,
      submitted: result.submitted,
      submittedAt: result.submittedAt,
      submittedData: result.submittedData,
      organizationId,
    }).returning();
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
  
  async listCampaignResults(campaignId: number): Promise<CampaignResult[]> {
    return await db.select().from(campaignResults).where(eq(campaignResults.campaignId, campaignId));
  }
  
  // Dashboard methods
  async getDashboardStats(organizationId: number): Promise<any> {
    // Get count of active campaigns
    const activeCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(and(
        eq(campaigns.organizationId, organizationId),
        eq(campaigns.status, "Active")
      ));
    
    // Get user count
    const userCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, organizationId));
    
    // Get campaign metrics
    // In a real implementation, you would calculate more detailed metrics
    // For now, we'll return a simple mock data
    
    return {
      activeCampaigns: Number(activeCampaigns[0].count) || 0,
      campaignChange: 12, // Mock data
      successRate: 32.8, // Mock data
      successRateChange: 5.2, // Mock data
      totalUsers: Number(userCount[0].count) || 0,
      newUsers: 3, // Mock data
      trainingCompletion: 78, // Mock data
      trainingCompletionChange: 8, // Mock data
    };
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();



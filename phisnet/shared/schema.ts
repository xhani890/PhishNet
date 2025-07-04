import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations table (for multi-tenancy)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
  position: text("position"),
  bio: text("bio"),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lastFailedLogin: timestamp("last_failed_login"),
  accountLocked: boolean("account_locked").default(false).notNull(),
  accountLockedUntil: timestamp("account_locked_until"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  organizationName: text("organization_name").notNull().default("None"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  position: true,
  bio: true,
  profilePicture: true,
  isAdmin: true,
  organizationName: true,
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create a custom schema with strong password validation
export const userValidationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
  isAdmin: z.boolean().optional(),
  organizationName: z.string().optional(),
});

// Groups table (for targets/recipients)
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
});

// Targets table (email recipients)
export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  position: text("position"),
  groupId: integer("group_id").references(() => groups.id, { onDelete: 'cascade' }).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTargetSchema = createInsertSchema(targets).pick({
  firstName: true,
  lastName: true,
  email: true,
  position: true,
});

// SMTP Profiles table
export const smtpProfiles = pgTable("smtp_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSmtpProfileSchema = createInsertSchema(smtpProfiles).pick({
  name: true,
  host: true,
  port: true,
  username: true,
  password: true,
  fromName: true,
  fromEmail: true,
});

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  html_content: text("html_content").notNull(),
  text_content: text("text_content"),
  sender_name: text("sender_name").notNull(),
  sender_email: text("sender_email").notNull(),
  organization_id: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_by_id: integer("created_by_id").references(() => users.id),
});

// Schema for our application's internal model
export const insertEmailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  text_content: z.string().optional(),
  sender_name: z.string().min(1, "Sender name is required"),
  sender_email: z.string().email("Invalid email format").min(1, "Sender email is required"),
  type: z.string().optional(),
  complexity: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

// Landing Pages table
export const landingPages = pgTable("landing_pages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  htmlContent: text("html_content").notNull(),
  redirectUrl: text("redirect_url"),
  pageType: text("page_type").notNull(), // login, form, educational
  thumbnail: text("thumbnail"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id),
});

export const insertLandingPageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  htmlContent: z.string().min(1),
  redirectUrl: z.string().optional().nullable(),
  pageType: z.string().default("login"),
  thumbnail: z.string().optional().nullable(),
});

export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;

export const updateLandingPageSchema = insertLandingPageSchema.partial();

export type LandingPage = {
  id: number;
  name: string;
  description: string | null;
  htmlContent: string;
  redirectUrl: string | null;
  pageType: string;
  thumbnail: string | null;
  organizationId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
};

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Draft"), // Draft, Scheduled, Active, Completed
  targetGroupId: integer("target_group_id").references(() => groups.id, { onDelete: 'restrict' }).notNull(),
  smtpProfileId: integer("smtp_profile_id").references(() => smtpProfiles.id, { onDelete: 'restrict' }).notNull(),
  emailTemplateId: integer("email_template_id").references(() => emailTemplates.id, { onDelete: 'restrict' }).notNull(),
  landingPageId: integer("landing_page_id").references(() => landingPages.id, { onDelete: 'restrict' }).notNull(),
  scheduledAt: timestamp("scheduled_at"),
  endDate: timestamp("end_date"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  targetGroupId: true,
  smtpProfileId: true,
  emailTemplateId: true,
  landingPageId: true,
  scheduledAt: true,
  endDate: true,
});

// Campaign Results table
export const campaignResults = pgTable("campaign_results", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  targetId: integer("target_id").references(() => targets.id, { onDelete: 'cascade' }).notNull(),
  sent: boolean("sent").default(false).notNull(),
  sentAt: timestamp("sent_at"),
  opened: boolean("opened").default(false).notNull(),
  openedAt: timestamp("opened_at"),
  clicked: boolean("clicked").default(false).notNull(),
  clickedAt: timestamp("clicked_at"),
  submitted: boolean("submitted").default(false).notNull(),
  submittedAt: timestamp("submitted_at"),
  submittedData: jsonb("submitted_data"),
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignResultSchema = createInsertSchema(campaignResults).pick({
  campaignId: true,
  targetId: true,
  sent: true,
  sentAt: true,
  opened: true,
  openedAt: true,
  clicked: true,
  clickedAt: true,
  submitted: true,
  submittedAt: true,
  submittedData: true,
});

// Export types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Target = typeof targets.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;

export type SmtpProfile = typeof smtpProfiles.$inferSelect;
export type InsertSmtpProfile = z.infer<typeof insertSmtpProfileSchema>;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type LandingPage = typeof landingPages.$inferSelect;
export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CampaignResult = typeof campaignResults.$inferSelect;
export type InsertCampaignResult = z.infer<typeof insertCampaignResultSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot exceed 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

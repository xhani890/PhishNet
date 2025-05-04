import { Template } from "../models/Template.js";
import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const createTemplate = async (req, res) => {
  try {
    const { userId, name, subject, html, text, type, complexity, description } = req.body;
    
    const template = await Template.create({
      userId,
      name,
      subject,
      html,
      text: text || '',
      type,
      complexity,
      description,
      envelopeSender: process.env.EMAIL_FROM
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create template'
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.findAll({
      where: { userId: req.user.id }
    });
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template'
    });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, subject, html, text, type, complexity, description } = req.body;
    
    const [updated] = await Template.update({
      name,
      subject,
      html,
      text,
      type,
      complexity,
      description
    }, {
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template'
    });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const deleted = await Template.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template'
    });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    const { email, firstName, lastName, subject, content } = req.body;
    
    if (!email || !subject || !content || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const renderedContent = content
      .replace(/{{\.FirstName}}/g, firstName)
      .replace(/{{\.LastName}}/g, lastName)
      .replace(/{{\.Email}}/g, email);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `[TEST] ${subject}`,
      html: renderedContent
    });

    res.json({ 
      success: true, 
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to send test email'
    });
  }
};
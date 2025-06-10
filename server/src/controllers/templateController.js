import { Template } from "../models/Template.js";  // Use named import directly
import { transporter, sendTestEmail } from "../services/emailService.js";
import { config } from "dotenv";

config();

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
      description,
      modifiedDate: new Date() // Update modification date
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

export const sendTestEmailHandler = async (req, res) => {
  try {
    const { recipientEmail, subject, htmlContent } = req.body;
    
    if (!recipientEmail || !subject || !htmlContent) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }
    
    const metadata = {
      type: req.body.type || 'phishing',
      complexity: req.body.complexity || 'medium'
    };

    // Use the service function
    await sendTestEmail({
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      templateName: req.body.name || 'Test Template',
      metadata: metadata
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

export const healthCheck = async (req, res) => {
  try {
    // Count the total number of templates
    const count = await Template.count();
    
    res.json({
      success: true,
      message: 'Template API is working correctly',
      data: {
        totalTemplates: count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in template health check:', error);
    res.status(500).json({
      success: false,
      message: 'Template API health check failed'
    });
  }
};
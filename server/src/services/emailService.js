// server/src/services/emailService.js
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

// Configure email transport
export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  rateLimit: true,
  maxConnections: 1,
  maxMessages: 5
});

export const sendTestEmail = async ({ to, subject, html, templateName, metadata }) => {
  const mailOptions = {
    from: `"PhishNet" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: `[TEST] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #FF6B00; color: white; padding: 10px; text-align: center; margin-bottom: 20px;">
          <strong>TEST EMAIL FROM PHISHNET</strong> - Not a real phishing attempt
        </div>
        <div style="border: 1px solid #ddd; padding: 20px; margin-bottom: 20px;">
          ${html}
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
          <p>This is a test email sent from PhishNet.</p>
          <p>Test Date: ${new Date().toLocaleString()}</p>
          ${metadata ? `<p>Template Type: ${metadata.type || 'N/A'}</p>
          <p>Complexity: ${metadata.complexity || 'N/A'}</p>` : ''}
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
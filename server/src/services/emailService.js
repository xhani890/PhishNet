// server/src/services/emailService.js
const nodemailer = require('nodemailer');

// Configure your email transport (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = {
  sendTestEmail: async ({ to, subject, html, templateName, metadata }) => {
    const mailOptions = {
      from: `"PhishNet" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>PhishNet Template Test: ${templateName}</h2>
          <div style="border: 1px solid #ddd; padding: 20px; margin-top: 20px;">
            ${html}
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
            <p>This is a test email sent from PhishNet.</p>
            <p>Template Type: ${metadata?.type || 'N/A'}</p>
            <p>Complexity: ${metadata?.complexity || 'N/A'}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  }
};
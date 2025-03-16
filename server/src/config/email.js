import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Function to Send Emails (Now Uses HTML Properly)
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"PhishNet Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html, // ✅ Ensure HTML is used instead of plain text
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
  }
};

export default sendEmail;

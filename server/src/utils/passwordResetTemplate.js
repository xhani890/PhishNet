const passwordResetTemplate = (userName, resetLink) => {
    return `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <img src="https://i.postimg.cc/TyXMXWxm/logo.jpg" alt="PhishNet Logo" style="width: 50px; height: 50px; margin-bottom: 10px;">
          <h2 style="color: #333;">Hello, ${userName}!</h2>
          <p style="color: #666; font-size: 14px;">
            You recently requested to reset your password. Click the button below to proceed:
          </p>
          <a href="${resetLink}" style="display: inline-block; background: #ff6600; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link is valid for 15 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `;
  };
  
  export default passwordResetTemplate;
  
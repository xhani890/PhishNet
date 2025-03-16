export const passwordResetTemplate = (userName, resetLink) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password - PhishNet</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center; }
        .container { max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; 
                     box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); text-align: center; margin: auto; }
        .logo-container { text-align: center; margin: 20px auto; }
        .logo { width: 50px; height: 50px; border-radius: 10px; display: block; margin: 0 auto; } /* ✅ Centered small logo */
        .button { display: inline-block; background-color: #ff6600; color: #ffffff; padding: 12px 20px; 
                  text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-top: 20px; }
        .footer { font-size: 12px; color: #666666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="https://i.postimg.cc/TyXMXWxm/logo.jpg" alt="PhishNet Logo" class="logo"> <!-- ✅ Small & Centered -->
        </div>
        <h2 style="color: #ff6600;">🔑 Password Reset Request</h2>
        <p style="color: #333333;">Hello, <strong>${userName}</strong></p>
        <p style="color: #555555;">We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${resetLink}" class="button">Reset My Password</a>
        <p style="color: #777777;">This link is valid for <strong>15 minutes</strong>.</p>
        <p style="color: #999999;">If you didn't request this, you can ignore this email. Your account remains secure.</p>
        <hr>
        <p class="footer">© 2025 PhishNet Inc. All Rights Reserved.</p>
    </div>
</body>
</html>
`;

/**
 * Generate verification email template
 * @param {string} name 
 * @param {string} url 
 * @returns {string}
 */
const getVerificationEmailTemplate = (name, url) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 24px; text-align: center; }
    .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">RestaurantOS AI</div>
    <p>Hi ${name},</p>
    <p>Thank you for signing up for RestaurantOS AI. Please click the button below to verify your email address:</p>
    <a href="${url}" class="button" target="_blank">Verify Email</a>
    <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If the button above does not work, copy and paste this link into your browser: <br/>${url}</p>
    <p>Best regards,<br/>The RestaurantOS AI Team</p>
    <div class="footer">&copy; ${new Date().getFullYear()} RestaurantOS AI. All rights reserved.</div>
  </div>
</body>
</html>
`;

/**
 * Generate password reset email template
 * @param {string} name 
 * @param {string} url 
 * @returns {string}
 */
const getPasswordResetTemplate = (name, url) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 24px; text-align: center; }
    .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">RestaurantOS AI</div>
    <p>Hi ${name},</p>
    <p>You requested a password reset for your RestaurantOS AI account. Click the button below to change your password:</p>
    <a href="${url}" class="button" target="_blank">Reset Password</a>
    <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If the button above does not work, copy and paste this link into your browser: <br/>${url}</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>Best regards,<br/>The RestaurantOS AI Team</p>
    <div class="footer">&copy; ${new Date().getFullYear()} RestaurantOS AI. All rights reserved.</div>
  </div>
</body>
</html>
`;

/**
 * Generate OTP verification email template
 * @param {string} name 
 * @param {string} code 
 * @returns {string}
 */
const getOTPTemplate = (name, code) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 24px; text-align: center; }
    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #0f172a; margin: 32px 0; background-color: #f1f5f9; padding: 16px; border-radius: 8px; border: 1px dashed #cbd5e1; }
    .footer { font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">RestaurantOS AI</div>
    <p>Hi ${name},</p>
    <p>Please use the following One-Time Password (OTP) to complete your verification process. This OTP is valid for 10 minutes:</p>
    <div class="otp-code">${code}</div>
    <p>If you did not request this OTP, please change your password immediately or contact support.</p>
    <p>Best regards,<br/>The RestaurantOS AI Team</p>
    <div class="footer">&copy; ${new Date().getFullYear()} RestaurantOS AI. All rights reserved.</div>
  </div>
</body>
</html>
`;

module.exports = {
  getVerificationEmailTemplate,
  getPasswordResetTemplate,
  getOTPTemplate
};

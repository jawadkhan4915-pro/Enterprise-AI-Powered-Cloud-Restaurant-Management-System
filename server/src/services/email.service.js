const transporter = require('../config/mailer');
const config = require('../config/env');
const logger = require('../config/logger');
const {
  getVerificationEmailTemplate,
  getPasswordResetTemplate,
  getOTPTemplate
} = require('../utils/email.templates');

/**
 * Send an email
 * @param {string} to 
 * @param {string} subject 
 * @param {string} html 
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.debug(`Email sent successfully. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    // Do not throw error here, so that system logic doesn't crash if SMTP is not active during local testing.
  }
};

/**
 * Send verification email
 * @param {string} to 
 * @param {string} name 
 * @param {string} token 
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, name, token) => {
  const subject = 'Verify your RestaurantOS AI Account';
  const url = `${config.clientUrl}/verify-email?token=${token}`;
  const html = getVerificationEmailTemplate(name, url);
  return sendEmail(to, subject, html);
};

/**
 * Send password reset email
 * @param {string} to 
 * @param {string} name 
 * @param {string} token 
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, name, token) => {
  const subject = 'Reset your RestaurantOS AI Password';
  const url = `${config.clientUrl}/reset-password?token=${token}`;
  const html = getPasswordResetTemplate(name, url);
  return sendEmail(to, subject, html);
};

/**
 * Send OTP login / verification email
 * @param {string} to 
 * @param {string} name 
 * @param {string} code 
 * @returns {Promise}
 */
const sendOTPEmail = async (to, name, code) => {
  const subject = 'Your RestaurantOS AI OTP Code';
  const html = getOTPTemplate(name, code);
  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendOTPEmail,
};

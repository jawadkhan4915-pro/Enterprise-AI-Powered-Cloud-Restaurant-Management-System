const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('./logger');

let transporter;

if (config.env === 'test') {
  transporter = {
    sendMail: async (mailOptions) => {
      logger.info(`Test Email Sent: ${JSON.stringify(mailOptions)}`);
      return { messageId: 'test-message-id' };
    }
  };
} else if (
  !config.email.smtp.auth.user ||
  config.email.smtp.auth.user === 'placeholder@gmail.com' ||
  !config.email.smtp.auth.pass ||
  config.email.smtp.auth.pass === 'placeholderpass'
) {
  logger.warn('SMTP user/pass not configured. Emails will be logged to console.');
  transporter = {
    sendMail: async (mailOptions) => {
      logger.info('========== EMAIL LOG START ==========');
      logger.info(`From: ${mailOptions.from}`);
      logger.info(`To: ${mailOptions.to}`);
      logger.info(`Subject: ${mailOptions.subject}`);
      logger.info(`Body: ${mailOptions.text || mailOptions.html}`);
      logger.info('========== EMAIL LOG END ============');
      return { messageId: 'logged-to-console-id' };
    }
  };
} else {
  transporter = nodemailer.createTransport(config.email.smtp);
  transporter.verify((error) => {
    if (error) {
      logger.warn(`SMTP Server verification failed: ${error.message}. Falling back to logging emails to console.`);
      transporter = {
        sendMail: async (mailOptions) => {
          logger.info('========== EMAIL LOG START ==========');
          logger.info(`From: ${mailOptions.from}`);
          logger.info(`To: ${mailOptions.to}`);
          logger.info(`Subject: ${mailOptions.subject}`);
          logger.info(`Body: ${mailOptions.text || mailOptions.html}`);
          logger.info('========== EMAIL LOG END ============');
          return { messageId: 'logged-to-console-id' };
        }
      };
    } else {
      logger.info('SMTP Server is ready to take messages.');
    }
  });
}

module.exports = transporter;

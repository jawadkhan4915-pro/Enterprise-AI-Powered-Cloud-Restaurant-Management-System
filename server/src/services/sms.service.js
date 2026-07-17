const logger = require('../config/logger');
const NotificationLog = require('../models/NotificationLog.model');

/**
 * Sends a Twilio SMS or logs to console as a mock fallback
 * @param {string} to - Recipient phone number
 * @param {string} body - SMS body content
 * @param {string} type - Notification type (e.g. 'receipt', 'booking_confirmed')
 * @returns {Promise<object>} - Object with status and messageId
 */
const sendSMS = async (to, body, type) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  let status = 'sent';
  let messageId = 'simulated-sms-id';

  const hasTwilioConfig = sid && token && from && sid !== 'placeholder' && token !== 'placeholder';

  if (!hasTwilioConfig) {
    status = 'logged';
    logger.info('========== SMS LOG START ==========');
    logger.info(`To: ${to}`);
    logger.info(`Type: ${type}`);
    logger.info(`Body: ${body}`);
    logger.info('========== SMS LOG END ============');
  } else {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const params = new URLSearchParams({
        To: to,
        From: from,
        Body: body
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API returned status ${response.status}: ${errorText}`);
      }

      const resJson = await response.json();
      messageId = resJson.sid;
      logger.debug(`Twilio SMS sent successfully. Message SID: ${messageId}`);
    } catch (error) {
      status = 'failed';
      logger.error(`Error sending SMS via Twilio to ${to}: ${error.message}`);
    }
  }

  // Save audit log inside Mongoose database
  try {
    await NotificationLog.create({
      recipient: to,
      channel: 'sms',
      type,
      status,
      body,
    });
  } catch (logError) {
    logger.error(`Failed to create NotificationLog for SMS to ${to}: ${logError.message}`);
  }

  return { status, messageId };
};

module.exports = {
  sendSMS,
};

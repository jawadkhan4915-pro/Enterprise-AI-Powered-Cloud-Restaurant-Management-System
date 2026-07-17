const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const NotificationLog = require('../models/NotificationLog.model');

const getNotificationLogs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const items = await NotificationLog.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await NotificationLog.countDocuments({});

  res.send(new ApiResponse(200, {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }, 'Notification logs retrieved successfully'));
});

const sendTestNotification = catchAsync(async (req, res) => {
  const { channel, recipient, type } = req.body;
  if (!channel || !recipient || !type) {
    throw new ApiError(400, 'Channel, recipient, and type are required');
  }

  if (channel === 'email') {
    const emailService = require('../services/email.service');
    if (type === 'receipt') {
      const dummyOrder = {
        orderNumber: 'ORD-TEST-9999',
        items: [
          { name: 'Salmon Fillet', quantity: 2, price: 18.00 },
          { name: 'Coca-Cola Can', quantity: 3, price: 0.90 }
        ],
        subTotal: 38.70,
        discount: { amount: 5.00 },
        tax: { rate: 10, amount: 3.37 },
        grandTotal: 37.07,
        paymentMethod: 'card',
        completedAt: new Date()
      };
      await emailService.sendOrderReceiptEmail(recipient, 'Test Customer', dummyOrder, 'London Central HQ');
    } else if (type === 'booking_confirmed') {
      const dummyReservation = {
        customerName: 'Test Customer',
        customerPhone: '+44 7911 123456',
        partySize: 4,
        reservationTime: new Date(Date.now() + 86400000),
        notes: 'Near window table, please.'
      };
      await emailService.sendReservationEmail(
        recipient,
        dummyReservation,
        'London Central HQ',
        `Your reservation at London Central HQ is confirmed for 4 guests on ${new Date(Date.now() + 86400000).toLocaleString()}.`,
        'test_email'
      );
    } else {
      throw new ApiError(400, 'Invalid notification type for email test');
    }
  } else if (channel === 'sms') {
    const smsService = require('../services/sms.service');
    let body = '';
    if (type === 'booking_confirmed') {
      body = `Hello Test Customer, your reservation at London Central HQ is confirmed for 4 guests.`;
    } else if (type === 'booking_seated') {
      body = `Hello Test Customer, you have been seated at Table #3. Enjoy your meal!`;
    } else {
      body = `This is a test SMS alert from RestaurantOS AI system.`;
    }
    await smsService.sendSMS(recipient, body, 'test_sms');
  } else {
    throw new ApiError(400, 'Invalid notification channel');
  }

  res.send(new ApiResponse(200, null, 'Test notification triggered successfully'));
});

module.exports = {
  getNotificationLogs,
  sendTestNotification,
};

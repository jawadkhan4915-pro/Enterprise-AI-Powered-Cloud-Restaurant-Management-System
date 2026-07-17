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

const getReceiptEmailTemplate = (order, branchName) => {
  const dateStr = new Date(order.completedAt || order.updatedAt).toLocaleString();
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: #334155;">
        ${item.name}
        ${item.selectedVariant?.name ? `<br/><span style="font-size: 11px; color: #64748b;">Variant: ${item.selectedVariant.name}</span>` : ''}
        ${item.selectedAddOns?.length ? `<br/><span style="font-size: 11px; color: #64748b;">Add-ons: ${item.selectedAddOns.map(a => a.name).join(', ')}</span>` : ''}
      </td>
      <td style="padding: 8px 0; font-size: 14px; color: #334155; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 0; font-size: 14px; color: #334155; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
      .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 8px; text-align: center; }
      .invoice-header { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px; font-weight: 500; }
      .meta { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; font-size: 13px; color: #475569; }
      .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .receipt-table th { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; text-align: left; font-size: 12px; color: #475569; font-weight: 700; text-transform: uppercase; }
      .totals { border-top: 2px solid #e2e8f0; padding-top: 16px; font-size: 13px; color: #475569; }
      .totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .totals-grand { font-size: 16px; font-weight: bold; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; }
      .footer { font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">RestaurantOS AI</div>
      <div class="invoice-header">TAX INVOICE / RECEIPT</div>
      
      <div class="meta">
        <div>
          <strong>Order:</strong> ${order.orderNumber}<br/>
          <strong>Date:</strong> ${dateStr}
        </div>
        <div style="text-align: right;">
          <strong>Branch:</strong> ${branchName || 'London Central'}<br/>
          ${order.tableId?.number ? `<strong>Table:</strong> Table #${order.tableId.number}` : `<strong>Type:</strong> ${order.orderType}`}
        </div>
      </div>

      <table width="100%" class="receipt-table">
        <thead>
          <tr>
            <th style="padding-bottom: 8px;">Item Description</th>
            <th style="padding-bottom: 8px; text-align: center; width: 60px;">Qty</th>
            <th style="padding-bottom: 8px; text-align: right; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>$${order.subTotal.toFixed(2)}</span>
        </div>
        ${order.discount?.amount ? `
        <div class="totals-row" style="color: #ef4444;">
          <span>Discount:</span>
          <span>-$${order.discount.amount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="totals-row">
          <span>VAT Tax (${order.tax?.rate || 10}%):</span>
          <span>$${order.tax?.amount.toFixed(2)}</span>
        </div>
        ${order.serviceCharge?.amount ? `
        <div class="totals-row">
          <span>Service Charge:</span>
          <span>$${order.serviceCharge.amount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="totals-row totals-grand">
          <span>Grand Total:</span>
          <span>$${order.grandTotal.toFixed(2)}</span>
        </div>
        <div class="totals-row" style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #64748b;">
          <span>Payment Method:</span>
          <span style="text-transform: uppercase;">${order.paymentMethod || 'CASH'}</span>
        </div>
      </div>

      <p style="text-align: center; margin-top: 32px; font-size: 14px; font-weight: 600; color: #10b981;">Thank you for dining with us!</p>
      <div class="footer">&copy; ${new Date().getFullYear()} RestaurantOS AI. All rights reserved.</div>
    </div>
  </body>
  </html>
  `;
};

const getReservationEmailTemplate = (reservation, branchName, statusMessage) => {
  const dateStr = new Date(reservation.reservationTime).toLocaleString();
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
      .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 24px; text-align: center; }
      .details { background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
      .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
      .details-label { font-weight: 600; color: #64748b; }
      .details-value { font-weight: bold; color: #0f172a; }
      .footer { font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">RestaurantOS AI</div>
      <p>Hi ${reservation.customerName},</p>
      <p>${statusMessage}</p>
      <div class="details">
        <div class="details-row">
          <span class="details-label">Branch:</span>
          <span class="details-value">${branchName || 'London Central'}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Date & Time:</span>
          <span class="details-value">${dateStr}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Party Size:</span>
          <span class="details-value">${reservation.partySize} guests</span>
        </div>
        ${reservation.tableId && reservation.tableId.number ? `
        <div class="details-row">
          <span class="details-label">Table:</span>
          <span class="details-value">Table #${reservation.tableId.number}</span>
        </div>
        ` : ''}
        ${reservation.notes ? `
        <div class="details-row" style="margin-top: 12px; border-top: 1px solid #cbd5e1; padding-top: 8px;">
          <span class="details-label">Notes:</span>
          <span class="details-value" style="font-weight: 500; font-style: italic;">${reservation.notes}</span>
        </div>
        ` : ''}
      </div>
      <p>If you need to make changes or cancel your booking, please call us directly.</p>
      <p>Best regards,<br/>The RestaurantOS AI Team</p>
      <div class="footer">&copy; ${new Date().getFullYear()} RestaurantOS AI. All rights reserved.</div>
    </div>
  </body>
  </html>
  `;
};

module.exports = {
  getVerificationEmailTemplate,
  getPasswordResetTemplate,
  getOTPTemplate,
  getReceiptEmailTemplate,
  getReservationEmailTemplate
};

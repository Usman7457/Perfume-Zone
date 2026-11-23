import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transport with environment variables.
 * Default placeholders are provided in .env
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'perfumezone.store.uk@gmail.com';
  const pass = process.env.SMTP_PASS || 'dummy_gmail_app_password_placeholder';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Format currency symbol
 */
function getCurrencySymbol(code = 'GBP') {
  if (code === 'EUR') return '€';
  if (code === 'USD') return '$';
  return '£';
}

/**
 * Send Order Placement notification email to store admin (usman.nxg@gmail.com)
 * and customer order confirmation copy.
 */
export async function sendOrderConfirmationEmail(order) {
  if (!order || !order.id) {
    console.warn('[Email] Invalid order passed to sendOrderConfirmationEmail');
    return { ok: false, error: 'Invalid order' };
  }

  const notificationTarget = process.env.NOTIFICATION_EMAIL || 'usman.nxg@gmail.com';
  const senderEmail = process.env.SMTP_USER || 'perfumezone.store.uk@gmail.com';
  const customerEmail = order.email;
  const currencySymbol = getCurrencySymbol(order.currency);
  const totalFormatted = `${currencySymbol}${Number(order.total || 0).toFixed(2)}`;

  const paymentPlatformLabel =
    order.paymentPlatform ||
    (order.paymentMethod === 'googlepay' ? 'Google Pay (UK)' :
     order.paymentMethod === 'paypal' ? 'PayPal Express' :
     order.paymentMethod === 'klarna' ? 'Klarna (Pay in 3)' :
     order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe / Credit & Debit Card');

  const itemsRowsHtml = (Array.isArray(order.items) ? order.items : [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; font-size: 14px; color: #111827;">
          <strong>${item.title || 'Luxury Perfume'}</strong>
          <br/>
          <span style="font-size: 12px; color: #6b7280;">Brand: ${item.brand || 'Perfume Zone'} • Size: ${item.size || '100ml'}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #111827;">${item.qty || 1}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #111827;">${currencySymbol}${Number(item.price || 0).toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">
          ${currencySymbol}${((Number(item.price || 0)) * (Number(item.qty || 1))).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const shippingAddr = order.shippingAddress || {};
  const formattedAddress = [
    shippingAddr.address,
    shippingAddr.apartment,
    shippingAddr.city,
    shippingAddr.postcode,
    shippingAddr.country || 'United Kingdom'
  ]
    .filter(Boolean)
    .join(', ');

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation #${order.id}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
    <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      
      <!-- Brand Header -->
      <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 700;">PERFUME ZONE</h1>
        <p style="color: #c5a880; margin: 4px 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">London • Luxury Fragrances UK</p>
      </div>

      <!-- Notification Banner -->
      <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 16px 24px; text-align: center;">
        <span style="font-size: 18px; font-weight: 700; color: #166534;">🎉 New Order Received #${order.id}</span>
        <p style="margin: 4px 0 0; font-size: 14px; color: #15803d;">Total: <strong>${totalFormatted}</strong> • Payment Platform: <strong>${paymentPlatformLabel}</strong></p>
      </div>

      <div style="padding: 24px;">
        <!-- Order & Payment Summary Cards -->
        <div style="display: table; width: 100%; margin-bottom: 24px;">
          <div style="display: table-cell; width: 50%; vertical-align: top; padding-right: 12px;">
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
              <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Order Details</h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Order ID:</strong> ${order.id}<br/>
                <strong>Status:</strong> ${order.status || 'Confirmed'}<br/>
                <strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString('en-GB')}<br/>
                <strong>Currency:</strong> ${order.currency || 'GBP'} (${currencySymbol})
              </p>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; vertical-align: top; padding-left: 12px;">
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
              <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Payment Information</h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Payment Platform:</strong> <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${paymentPlatformLabel}</span><br/>
                <strong>Method Code:</strong> ${order.paymentMethod || 'card'}<br/>
                <strong>Payment Status:</strong> <span style="color: #16a34a; font-weight: 600;">Authorized / Paid</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Customer & Shipping -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Customer & Delivery Address</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            <strong>Customer:</strong> ${order.customerName || 'Customer'}<br/>
            <strong>Email:</strong> ${order.email}<br/>
            ${shippingAddr.phone ? `<strong>Phone:</strong> ${shippingAddr.phone}<br/>` : ''}
            <strong>Shipping Method:</strong> ${order.shippingMethod || 'Royal Mail Tracked'}<br/>
            <strong>Delivery Address:</strong> ${formattedAddress}
          </p>
        </div>

        <!-- Line Items Table -->
        <h3 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #111827;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left; font-size: 12px; color: #4b5563; text-transform: uppercase;">
              <th style="padding: 8px;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div style="width: 250px; margin-left: auto; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #4b5563;">
            <span>Subtotal:</span>
            <span>${currencySymbol}${Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #4b5563;">
            <span>Shipping:</span>
            <span>${Number(order.shippingCost || 0) === 0 ? 'FREE' : `${currencySymbol}${Number(order.shippingCost).toFixed(2)}`}</span>
          </div>
          ${
            Number(order.discount || 0) > 0
              ? `
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #16a34a;">
            <span>Discount (${order.couponCode || 'PROMO'}):</span>
            <span>-${currencySymbol}${Number(order.discount).toFixed(2)}</span>
          </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; font-weight: 700; color: #111827; border-top: 2px solid #111827; margin-top: 4px;">
            <span>Grand Total:</span>
            <span>${totalFormatted}</span>
          </div>
        </div>

        <!-- Footer Notice -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0 0 4px;">This order notification was automatically dispatched to <strong>${notificationTarget}</strong>.</p>
          <p style="margin: 0;">Perfume Zone UK • Premium Fragrance Hub London</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const recipients = [notificationTarget];
  if (customerEmail && !recipients.includes(customerEmail)) {
    recipients.push(customerEmail);
  }

  const mailOptions = {
    from: `"Perfume Zone UK" <${senderEmail}>`,
    to: recipients.join(', '),
    subject: `🛒 New Order #${order.id} Placed: ${totalFormatted} (${paymentPlatformLabel})`,
    html: htmlContent
  };

  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✅ Order confirmation email successfully delivered to ${recipients.join(', ')} (Message ID: ${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    // Graceful fallback when using dummy credentials or when network/auth is pending
    console.warn(`[Email] ⚠️ SMTP dispatch notice: ${err.message}`);
    console.log(`[Email Simulation] ----------------------------------------------------`);
    console.log(`[Email Simulation] Target Recipient: ${notificationTarget}`);
    console.log(`[Email Simulation] Order ID:         #${order.id}`);
    console.log(`[Email Simulation] Customer:         ${order.customerName} (${order.email})`);
    console.log(`[Email Simulation] Total:            ${totalFormatted}`);
    console.log(`[Email Simulation] Payment Platform: ${paymentPlatformLabel}`);
    console.log(`[Email Simulation] Note: To send live emails, add your real Gmail App Password to SMTP_PASS in server/.env`);
    console.log(`[Email Simulation] ----------------------------------------------------`);
    return { ok: false, error: err.message, simulated: true };
  }
}

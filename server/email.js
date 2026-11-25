import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transport with environment variables.
 * Default placeholders are provided in .env
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'usman.nxg@gmail.com';
  // Strip spaces if user provided Google App Password with spaces (e.g. "abcd efgh ijkl mnop")
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');

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
          ${Number(order.discount || 0) > 0
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

/**
 * Send Contact Us Form inquiry notification to store owner (usman.nxg@gmail.com)
 * with direct Reply-To header and auto-confirmation copy to customer.
 */
export async function sendContactInquiryEmail(inquiry) {
  if (!inquiry || !inquiry.email || !inquiry.name) {
    console.warn('[Email] Invalid contact inquiry passed to sendContactInquiryEmail');
    return { ok: false, error: 'Invalid contact inquiry' };
  }

  const notificationTarget = process.env.NOTIFICATION_EMAIL || 'usman.nxg@gmail.com';
  const senderEmail = process.env.SMTP_USER || 'usman.nxg@gmail.com';
  const dateFormatted = new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Contact Inquiry: ${inquiry.subject || 'Customer Support'}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
    <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      
      <!-- Brand Header -->
      <div style="background-color: #1a1a1a; padding: 22px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; font-weight: 700;">PERFUME ZONE</h1>
        <p style="color: #c5a880; margin: 4px 0 0; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">London • Fragrance Concierge &amp; Support</p>
      </div>

      <!-- Banner -->
      <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 14px 20px; text-align: center;">
        <span style="font-size: 16px; font-weight: 700; color: #166534;">💬 New Contact Form Inquiry Received</span>
        <p style="margin: 3px 0 0; font-size: 13px; color: #15803d;">Subject: <strong>${inquiry.subject || 'General Inquiry'}</strong></p>
      </div>

      <div style="padding: 24px;">
        <!-- Sender Information -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Sender Information</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">
            <strong>Full Name:</strong> ${inquiry.name}<br/>
            <strong>Email:</strong> <a href="mailto:${inquiry.email}" style="color: #0369a1; text-decoration: none;">${inquiry.email}</a><br/>
            <strong>Phone:</strong> ${inquiry.phone || '<span style="color: #9ca3af;">Not provided</span>'}<br/>
            <strong>Date Received:</strong> ${dateFormatted}<br/>
            <strong>Topic / Subject:</strong> <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 13px;">${inquiry.subject || 'General'}</span>
          </p>
        </div>

        <!-- Inquiry Message Box -->
        <h3 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151;">Message Body</h3>
        <div style="background-color: #faf8f5; border: 1px solid #d8c7a6; border-left: 4px solid #c5a880; border-radius: 4px; padding: 16px; margin-bottom: 24px; font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap;">
${inquiry.message}
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #1e40af;">
          💡 <strong>Direct Reply:</strong> Click "Reply" in your email client to send an immediate response directly to <strong>${inquiry.email}</strong>.
        </div>

        <!-- Footer Notice -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0 0 4px;">Delivered to <strong>${notificationTarget}</strong> via Perfume Zone Live SMTP.</p>
          <p style="margin: 0;">Perfume Zone UK • Unit 38 Marlands Shopping Centre, Civic Centre Road, Southampton, SO14 7SJ</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"Perfume Zone Concierge" <${senderEmail}>`,
    to: notificationTarget,
    replyTo: inquiry.email,
    subject: `📩 New Contact Inquiry from ${inquiry.name}: ${inquiry.subject || 'Customer Support'}`,
    html: htmlContent
  };

  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✅ Contact inquiry email successfully delivered to ${notificationTarget} (Message ID: ${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`[Email] ⚠️ Contact form SMTP dispatch error: ${err.message}`);
    return { ok: false, error: err.message, simulated: true };
  }
}

/**
 * Send Newsletter Subscription notification to store owner (usman.nxg@gmail.com)
 * and welcome coupon code copy to the new subscriber.
 */
export async function sendNewsletterSubscriptionEmail(subscriber) {
  if (!subscriber || !subscriber.email) {
    console.warn('[Email] Invalid subscriber data passed to sendNewsletterSubscriptionEmail');
    return { ok: false, error: 'Invalid subscriber data' };
  }

  const notificationTarget = process.env.NOTIFICATION_EMAIL || 'usman.nxg@gmail.com';
  const senderEmail = process.env.SMTP_USER || 'usman.nxg@gmail.com';
  const subscriberEmail = subscriber.email.trim().toLowerCase();
  const source = subscriber.source || 'footer';
  const dateFormatted = new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' });

  // 1. Notification to Store Admin
  const adminHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Newsletter Subscriber</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      
      <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; font-weight: 700;">PERFUME ZONE</h1>
        <p style="color: #c5a880; margin: 4px 0 0; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Newsletter &amp; Marketing Subscribers</p>
      </div>

      <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 14px 20px; text-align: center;">
        <span style="font-size: 16px; font-weight: 700; color: #166534;">🎉 New Newsletter Subscriber</span>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 18px;">
          <p style="margin: 0; font-size: 15px; line-height: 1.8;">
            <strong>Subscriber Email:</strong> <a href="mailto:${subscriberEmail}" style="color: #0369a1; font-weight: 600;">${subscriberEmail}</a><br/>
            <strong>Subscription Source:</strong> <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 13px;">${source.toUpperCase()}</span><br/>
            <strong>Joined At:</strong> ${dateFormatted}<br/>
            <strong>Status:</strong> <span style="color: #16a34a; font-weight: 700;">Active / Subscribed</span>
          </p>
        </div>

        <p style="font-size: 13px; color: #4b5563; margin: 0 0 16px;">
          This customer has opted into the Perfume Zone Circle and can now receive VIP promotional launches and private sale invitations.
        </p>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0;">Dispatched automatically to <strong>${notificationTarget}</strong>.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // 2. Welcome Email to the Subscriber
  const subscriberWelcomeHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Welcome to the Perfume Zone Circle</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      
      <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 700;">PERFUME ZONE</h1>
        <p style="color: #c5a880; margin: 4px 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">London • Luxury Arabian Fragrances</p>
      </div>

      <div style="padding: 28px 24px;">
        <h2 style="font-size: 20px; color: #111827; margin: 0 0 12px;">Welcome to the Perfume Zone Circle ✨</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 20px;">
          Thank you for subscribing! As a valued member of our inner fragrance circle, you will enjoy priority access to new Arabian extrait arrivals, private artisan oud batches, and exclusive seasonal promotions.
        </p>

        <!-- Promo Code Highlight Box -->
        <div style="background-color: #faf8f5; border: 1.5px dashed #c5a880; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 12px; font-weight: 700; color: #92400e; letter-spacing: 1px; text-transform: uppercase;">Your Exclusive Welcome Gift</span>
          <div style="font-size: 26px; font-weight: 800; color: #111827; letter-spacing: 2px; margin: 8px 0;">PERFUME10</div>
          <p style="font-size: 13px; color: #6b7280; margin: 0;">Use code <strong>PERFUME10</strong> at checkout for <strong>10% off</strong> your first order + Free UK delivery over £50.</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://perfumezone.uk/collections/all" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 28px; border-radius: 4px; font-weight: 600; text-decoration: none; font-size: 14px;">
            Explore Fragrance Library →
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
          <p style="margin: 0 0 4px;">Perfume Zone UK • Unit 38 Marlands Shopping Centre, Civic Centre Road, Southampton, SO14 7SJ</p>
          <p style="margin: 0;">You received this email because you subscribed on perfumezone.uk.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const transporter = getMailTransporter();

    // Send admin notification
    await transporter.sendMail({
      from: `"Perfume Zone VIP" <${senderEmail}>`,
      to: notificationTarget,
      subject: `📬 New Newsletter Subscriber: ${subscriberEmail}`,
      html: adminHtml
    });

    // Send subscriber welcome email (non-blocking if customer email invalid)
    transporter.sendMail({
      from: `"Perfume Zone UK" <${senderEmail}>`,
      to: subscriberEmail,
      subject: `✨ Welcome to the Perfume Zone Circle (10% Off: PERFUME10)`,
      html: subscriberWelcomeHtml
    }).catch((err) => {
      console.warn(`[Email] Notice sending welcome email to subscriber: ${err.message}`);
    });

    console.log(`[Email] ✅ Newsletter subscription notification dispatched to ${notificationTarget} for ${subscriberEmail}`);
    return { ok: true };
  } catch (err) {
    console.warn(`[Email] ⚠️ Newsletter SMTP dispatch notice: ${err.message}`);
    return { ok: false, error: err.message, simulated: true };
  }
}

/**
 * Send Wholesale / B2B Trade Application notification to store owner (usman.nxg@gmail.com)
 * with direct Reply-To header and confirmation copy to applicant.
 */
export async function sendWholesaleInquiryEmail(wholesale) {
  if (!wholesale || !wholesale.businessName || !wholesale.email) {
    console.warn('[Email] Invalid wholesale application data passed to sendWholesaleInquiryEmail');
    return { ok: false, error: 'Invalid wholesale application data' };
  }

  const notificationTarget = process.env.NOTIFICATION_EMAIL || 'usman.nxg@gmail.com';
  const senderEmail = process.env.SMTP_USER || 'usman.nxg@gmail.com';
  const applicantEmail = wholesale.email.trim().toLowerCase();
  const dateFormatted = new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' });

  const adminHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New B2B Wholesale Application: ${wholesale.businessName}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      
      <div style="background-color: #1a1a1a; padding: 22px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; font-weight: 700;">PERFUME ZONE</h1>
        <p style="color: #c5a880; margin: 4px 0 0; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">B2B &amp; Trade Distribution UK</p>
      </div>

      <div style="background-color: #fefce8; border-bottom: 1px solid #fef08a; padding: 14px 20px; text-align: center;">
        <span style="font-size: 16px; font-weight: 700; color: #854d0e;">💼 New B2B Trade Application Received</span>
        <p style="margin: 3px 0 0; font-size: 13px; color: #a16207;">Business: <strong>${wholesale.businessName}</strong></p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Business Credentials</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">
            <strong>Company / Store Name:</strong> ${wholesale.businessName}<br/>
            <strong>Contact Person:</strong> ${wholesale.contactName || '<span style="color: #9ca3af;">Not provided</span>'}<br/>
            <strong>Business Email:</strong> <a href="mailto:${applicantEmail}" style="color: #0369a1; text-decoration: none;">${applicantEmail}</a><br/>
            <strong>Telephone:</strong> ${wholesale.phone || '<span style="color: #9ca3af;">Not provided</span>'}<br/>
            <strong>Website / Storefront:</strong> ${wholesale.website ? `<a href="${wholesale.website}" target="_blank" style="color: #0369a1;">${wholesale.website}</a>` : '<span style="color: #9ca3af;">Not provided</span>'}<br/>
            <strong>Country / Region:</strong> ${wholesale.country || 'United Kingdom'}<br/>
            <strong>Estimated Order Value:</strong> <span style="display: inline-block; background-color: #f0fdf4; color: #166534; font-weight: 700; padding: 2px 8px; border-radius: 4px;">${wholesale.estimatedOrderValue || 'Not specified'}</span><br/>
            <strong>Application Date:</strong> ${dateFormatted}
          </p>
        </div>

        ${wholesale.message ? `
        <h3 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151;">Brands / Fragrance Families of Interest</h3>
        <div style="background-color: #faf8f5; border: 1px solid #d8c7a6; border-left: 4px solid #c5a880; border-radius: 4px; padding: 14px; margin-bottom: 20px; font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap;">
${wholesale.message}
        </div>` : ''}

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #1e40af;">
          💡 <strong>Direct Reply:</strong> Click "Reply" in your email client to contact <strong>${wholesale.businessName}</strong> (${applicantEmail}) directly.
        </div>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0 0 4px;">Delivered to <strong>${notificationTarget}</strong> via Perfume Zone Live SMTP.</p>
          <p style="margin: 0;">Perfume Zone UK • Central B2B Logistics London</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  // Applicant Confirmation Copy
  const applicantHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Trade Application Received — Perfume Zone Wholesale UK</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #111827;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      
      <div style="background-color: #1a1a1a; padding: 22px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; font-weight: 700;">PERFUME ZONE</h1>
        <p style="color: #c5a880; margin: 4px 0 0; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Wholesale &amp; Trade Distribution UK</p>
      </div>

      <div style="padding: 24px;">
        <h2 style="font-size: 18px; color: #111827; margin: 0 0 12px;">Trade Application Received</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px;">
          Dear ${wholesale.contactName || wholesale.businessName},
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px;">
          Thank you for applying for a trade wholesale account with Perfume Zone UK. Our dedicated B2B trade account managers have received your credentials for <strong>${wholesale.businessName}</strong> and are currently reviewing your application.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 20px;">
          You will receive our comprehensive trade pricing sheet, minimum order guidelines, and brand catalog within 1–2 business days.
        </p>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; font-size: 13px; color: #374151;">
          <strong>Direct Trade Concierge:</strong> wholesale@perfumezone.uk | +44 (0) 20 7946 0991
        </div>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 14px; font-size: 12px; color: #9ca3af; text-align: center;">
          <p style="margin: 0;">Perfume Zone UK • Central Logistics Hub London</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const transporter = getMailTransporter();

    // 1. Send Admin Notification
    await transporter.sendMail({
      from: `"Perfume Zone B2B" <${senderEmail}>`,
      to: notificationTarget,
      replyTo: applicantEmail,
      subject: `💼 New B2B Wholesale Application: ${wholesale.businessName}`,
      html: adminHtml
    });

    // 2. Send Applicant Acknowledgment
    transporter.sendMail({
      from: `"Perfume Zone Wholesale" <${senderEmail}>`,
      to: applicantEmail,
      subject: `Trade Application Received — Perfume Zone Wholesale UK`,
      html: applicantHtml
    }).catch((err) => {
      console.warn(`[Email] Notice sending wholesale acknowledgment to applicant: ${err.message}`);
    });

    console.log(`[Email] ✅ Wholesale application notification dispatched to ${notificationTarget} for ${wholesale.businessName}`);
    return { ok: true };
  } catch (err) {
    console.warn(`[Email] ⚠️ Wholesale SMTP dispatch notice: ${err.message}`);
    return { ok: false, error: err.message, simulated: true };
  }
}

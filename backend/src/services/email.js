import nodemailer from 'nodemailer';
import { formatPrice } from '../utils/format.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatOrderDate(date) {
  if (!date) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(date));
}

function getItemProductId(item) {
  if (!item?.product) return '';
  if (item.product._id) return item.product._id.toString();
  if (item.product.toString) return item.product.toString();
  return '';
}

function getAddressLines(shippingAddress = {}) {
  const lineOne = shippingAddress.address;
  const lineTwo = [shippingAddress.city, shippingAddress.state, shippingAddress.zip]
    .filter(Boolean)
    .join(', ');
  return [lineOne, lineTwo].filter(Boolean);
}

function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

/**
 * Universal Email Sender:
 * 1. Tries Brevo REST API (HTTPS POST - 100% reliable on Hostinger & cloud servers)
 * 2. Falls back to SMTP (Nodemailer)
 * 3. Falls back to console log in dev
 */
export async function sendEmailDirect({ to, subject, html, text }) {
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'reazafsha0@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'AAAN Cart Enterprises';

  // 1. Try Brevo REST API (Fastest & most reliable)
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey.trim(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
          textContent: text || 'Please view this email in an HTML-compatible client.'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[Brevo API] Email dispatched to ${to} (MessageId: ${result.messageId})`);
        return true;
      } else {
        const errBody = await response.text();
        console.warn(`[Brevo API Warning] (${response.status}): ${errBody}. Falling back to SMTP...`);
      }
    } catch (apiErr) {
      console.warn(`[Brevo API Error]: ${apiErr.message}. Falling back to SMTP...`);
    }
  }

  // 2. Try Nodemailer / SMTP
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"${senderName}" <${senderEmail}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`[SMTP] Email dispatched to ${to}`);
      return true;
    } catch (smtpErr) {
      console.error(`[SMTP Error]: ${smtpErr.message}`);
    }
  }

  // 3. Dev / Console Fallback
  console.log(`[Email Mock/Dev] Email to: ${to} | Subject: ${subject}`);
  return true;
}

/**
 * Send 6-Digit OTP for Signup Email Verification or Password Reset
 */
export async function sendOtp(email, code, subject = 'Your AAAN Cart verification code', title = 'Verify your email address') {
  if (!email) return false;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px;">
      <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 32px; border: 1.5px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); text-align: center;">
        
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; background: #ECFDF5; border-radius: 16px; margin-bottom: 16px;">
          <span style="font-size: 26px;">🌿</span>
        </div>

        <h2 style="color: #0F172A; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">AAAN CART</h2>
        <p style="color: #64748B; margin: 0 0 24px 0; font-size: 14px;">${title}</p>

        <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 16px; padding: 24px 16px; margin-bottom: 24px;">
          <p style="color: #475569; margin: 0 0 10px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your 6-Digit Verification Code</p>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #0066FF; font-family: monospace; margin: 6px 0;">${code}</div>
          <p style="color: #94A3B8; font-size: 12px; margin: 10px 0 0 0;">⏱️ Valid for 10 minutes</p>
        </div>

        <p style="color: #64748B; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">
          Enter this verification code in the AAAN Cart app to complete your verification and access your account.
        </p>

        <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 20px 0;" />
        <p style="color: #94A3B8; font-size: 11px; margin: 0;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
    </body>
    </html>`;

  const text = `AAAN Cart Verification Code: ${code}. Valid for 10 minutes.`;

  return sendEmailDirect({
    to: email,
    subject: subject,
    html: html,
    text: text
  });
}

/**
 * Send Itemized Order Receipt
 */
export async function sendOrderReceipt(order, userEmail) {
  const email = order.shippingAddress?.email || userEmail;
  if (!email) return false;

  const orderNumber = order.orderNumber || order._id?.toString() || 'Order';
  const safeOrderNumber = escapeHtml(orderNumber);
  const items = order.items || [];

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: #0F172A; font-weight: 600;">
        ${escapeHtml(item.name || '3D Wall Decal')}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #F1F5F9; text-align: center; font-size: 14px; color: #64748B;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #F1F5F9; text-align: right; font-size: 14px; color: #0F172A; font-weight: 700;">
        ${formatPrice(item.price * (item.quantity || 1))}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; padding: 24px; margin: 0;">
      <div style="max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 28px; border: 1.5px solid #E2E8F0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="font-size: 24px;">🌿</span>
          <h2 style="margin: 0; color: #0F172A;">AAAN CART</h2>
        </div>
        <h3 style="color: #0066FF; margin: 0 0 10px 0;">Payment Confirmed — Order #${safeOrderNumber}</h3>
        <p style="color: #64748B; font-size: 14px; margin-bottom: 20px;">Thank you for your order! Your 3D Wall Decals are being carefully packed in rigid protective tubes.</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #F8FAFC;">
              <th style="padding: 8px; text-align: left; font-size: 12px; color: #64748B; text-transform: uppercase;">Item</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; color: #64748B; text-transform: uppercase;">Qty</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; color: #64748B; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="border-top: 2px solid #E2E8F0; padding-top: 12px; text-align: right;">
          <p style="margin: 0; font-size: 18px; font-weight: 800; color: #0F172A;">Total Paid: ${formatPrice(order.total)}</p>
        </div>
      </div>
    </body>
    </html>`;

  return sendEmailDirect({
    to: email,
    subject: `Order Confirmed: ${orderNumber} - AAAN Cart`,
    html: html,
    text: `Order ${orderNumber} confirmed. Total: ${formatPrice(order.total)}`
  });
}

/**
 * Email Service
 * Sends verification emails using Nodemailer.
 * Config is loaded from backend/.env
 */

const nodemailer = require('nodemailer');

// Build transporter from environment variables
const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for others
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10s — fail fast if SMTP is unreachable
    socketTimeout:     15000, // 15s — abort if connection hangs
    greetingTimeout:   10000, // 10s
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const FROM     = process.env.EMAIL_FROM || 'BOCRA Portal <noreply@bocra.org.bw>';

/**
 * Send an email verification link to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} toName  - Recipient's display name
 * @param {string} token   - Verification token (URL-safe)
 */
async function sendVerificationEmail(toEmail, toName, token) {
    const link = `${BASE_URL}/api/auth/verify/${token}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; margin: 0; padding: 20px; }
        .card { background: #fff; max-width: 520px; margin: 40px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #003580, #0055cc); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: -0.3px; }
        .header p  { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .body p { color: #333; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: block; width: fit-content; margin: 24px auto; background: #003580; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .link-fallback { background: #f5f5f7; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 12px; color: #555; margin-top: 20px; }
        .footer { border-top: 1px solid #eee; padding: 20px 32px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>BOCRA Customer Portal</h1>
          <p>Botswana Communications Regulatory Authority</p>
        </div>
        <div class="body">
          <p>Hello <strong>${toName}</strong>,</p>
          <p>Thank you for registering. Please verify your email address to activate your account and access portal services.</p>
          <a href="${link}" class="btn">✓ Verify Email Address</a>
          <p>This link will expire in <strong>24 hours</strong>.</p>
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <div class="link-fallback">
            <strong>If the button doesn't work, copy this link:</strong><br>
            ${link}
          </div>
        </div>
        <div class="footer">
          © 2026 BOCRA · Gaborone, Botswana · standards@bocra.org.bw
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
        from:    FROM,
        to:      `${toName} <${toEmail}>`,
        subject: 'Verify your BOCRA Portal email address',
        html,
        text: `Hello ${toName},\n\nPlease verify your email by visiting:\n${link}\n\nThis link expires in 24 hours.\n\n— BOCRA Portal`,
    });
}

/**
 * Verify transporter config (called at startup for early feedback).
 */
async function verifyTransport() {
    try {
        await transporter.verify();
        console.log('  ✅ Email service connected successfully.');
    } catch (err) {
        console.warn('  ⚠️  Email service NOT connected:', err.message);
        console.warn('     → Update SMTP settings in backend/.env to enable email verification.');
    }
}

/**
 * Send a complaint-received confirmation email.
 * @param {string} toEmail
 * @param {string} toName
 * @param {{ ref, category, service_provider, location, status }} complaint
 */
async function sendComplaintConfirmation(toEmail, toName, complaint) {
    const { ref, category, service_provider, location, status } = complaint;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; margin: 0; padding: 20px; }
        .card { background: #fff; max-width: 580px; margin: 40px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #003580, #0055cc); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p  { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .body p { color: #333; line-height: 1.6; margin: 0 0 16px; }
        .ref-box { background: #f0f9ff; border-left: 5px solid #2563eb; padding: 16px 20px; border-radius: 8px; margin: 20px 0; }
        .ref-box .label { font-size: 13px; color: #555; margin-bottom: 4px; }
        .ref-box .ref   { font-size: 22px; font-weight: 700; color: #1e40af; letter-spacing: 1px; }
        .ref-box .badge { display: inline-block; margin-top: 8px; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .summary { background: #f9fafb; border-radius: 8px; padding: 16px 20px; font-size: 14px; color: #444; }
        .summary dt { font-weight: 600; color: #111; margin-top: 8px; }
        .summary dd { margin: 2px 0 0 0; }
        .footer { border-top: 1px solid #eee; padding: 20px 32px; font-size: 12px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>BOCRA Customer Portal</h1>
          <p>Botswana Communications Regulatory Authority</p>
        </div>
        <div class="body">
          <p>Dear <strong>${toName}</strong>,</p>
          <p>Thank you for submitting your complaint. We have received it and our team will begin reviewing it shortly.</p>
          <div class="ref-box">
            <div class="label">Your Complaint Reference Number</div>
            <div class="ref">${ref}</div>
            <span class="badge">Status: ${status}</span>
          </div>
          <p>You can track the progress of your complaint by visiting the portal and entering reference <strong>${ref}</strong> in the "Track Complaint" section.</p>
          <dl class="summary">
            <dt>Service Provider</dt><dd>${service_provider || '—'}</dd>
            <dt>Category</dt><dd>${category}</dd>
            ${location ? `<dt>Location</dt><dd>${location}</dd>` : ''}
          </dl>
          <p style="margin-top:20px; font-size:13px; color:#555;">You will be notified by email when your complaint status changes.</p>
        </div>
        <div class="footer">
          © 2026 BOCRA &middot; Gaborone, Botswana &middot; standards@bocra.org.bw
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
        from:    FROM,
        to:      `${toName} <${toEmail}>`,
        subject: `BOCRA Complaint Received — Reference ${ref}`,
        html,
        text: `Dear ${toName},\n\nYour complaint has been received.\nReference: ${ref}\nStatus: ${status}\n\nTrack it on the BOCRA portal.\n\n— BOCRA Support`,
    });
}

module.exports = { sendVerificationEmail, sendComplaintConfirmation, verifyTransport };

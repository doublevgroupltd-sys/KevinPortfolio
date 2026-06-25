import nodemailer from "nodemailer";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const hasSmtpConfig = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

/**
 * Sends the contact form notification email. Falls back to a structured
 * console.log when SMTP credentials are not configured (demo mode), so
 * the rest of the app behaves identically either way.
 */
export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || "you@example.com";

  const mailOptions = {
    from: `"Portfolio Contact Form" <${process.env.SMTP_USER || "noreply@example.com"}>`,
    to: receiver,
    replyTo: payload.email,
    subject: `[Portfolio] ${payload.subject}`,
    text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
    html: `<p><strong>From:</strong> ${payload.name} (${payload.email})</p><p>${payload.message.replace(
      /\n/g,
      "<br/>"
    )}</p>`,
  };

  if (!transporter) {
    console.log("📧 [DEMO MODE] Contact email simulated (no SMTP configured):");
    console.log(JSON.stringify(mailOptions, null, 2));
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send contact email:", err);
    // Do not throw - the message is already saved to the database.
  }
}

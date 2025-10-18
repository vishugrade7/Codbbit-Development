'use server';

import * as nodemailer from 'nodemailer';

interface FeedbackEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendFeedbackEmail(
  data: FeedbackEmailData
): Promise<{ success: boolean; error?: string }> {
  const { ZOHO_SMTP_HOST, ZOHO_SMTP_PORT, ZOHO_SMTP_USER, ZOHO_SMTP_PASS } =
    process.env;

  if (
    !ZOHO_SMTP_HOST ||
    !ZOHO_SMTP_PORT ||
    !ZOHO_SMTP_USER ||
    !ZOHO_SMTP_PASS
  ) {
    console.error('Zoho Mail environment variables not set');
    return {
      success: false,
      error: 'Server email configuration is incomplete.',
    };
  }

  const transport = nodemailer.createTransport({
    host: ZOHO_SMTP_HOST,
    port: parseInt(ZOHO_SMTP_PORT, 10),
    auth: {
      user: ZOHO_SMTP_USER,
      pass: ZOHO_SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Codbbit Feedback" <noreply@codbbit.com>`,
    to: 'codbbit@gmail.com',
    subject: `New Feedback: ${data.subject}`,
    html: `
      <h2>New Feedback Submission</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr>
      <h3>Message:</h3>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: 'There was an issue sending your feedback. Please try again later.',
    };
  }
}


'use server';

import * as nodemailer from 'nodemailer';
import type { Attachment } from 'nodemailer/lib/mailer';

export async function sendFeedbackEmail(
  formData: FormData
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

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const attachmentFiles = formData.getAll('attachments') as File[];
  
  if (!name || !email || !subject || !message) {
    return { success: false, error: 'Missing required fields.' };
  }

  const transport = nodemailer.createTransport({
    host: ZOHO_SMTP_HOST,
    port: parseInt(ZOHO_SMTP_PORT, 10),
    auth: {
      user: ZOHO_SMTP_USER,
      pass: ZOHO_SMTP_PASS,
    },
  });
  
  const attachments: Attachment[] = [];
  if (attachmentFiles && attachmentFiles.length > 0) {
    for (const file of attachmentFiles) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
            filename: file.name,
            content: buffer,
            contentType: file.type,
        });
      }
    }
  }

  const mailOptions = {
    from: `"Codbbit Feedback" <noreply@codbbit.com>`,
    to: 'codbbit@gmail.com',
    subject: `New Feedback: ${subject}`,
    html: `
      <h2>New Feedback Submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
    attachments: attachments,
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

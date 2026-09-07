import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_YOUR_KEY');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, email, sector, description } = body;

    // 1. Send Admin Alert Email to You
    const adminEmailPromise = resend.emails.send({
      from: 'VerifiedAIHub System <notifications@verifiedaihub.com>',
      to: ['solfar55@gmail.com'],
      subject: `🚨 New Tool Submission Pending Review: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #f8fafc;">
          <h2 style="color: #1e3a8a; margin-top: 0; margin-bottom: 12px;">New Tool Submission Received</h2>
          <p style="color: #334155; font-size: 14px; margin-bottom: 20px;">
            A new healthcare AI tool has been submitted to the <strong>VerifiedAIHub</strong> directory queue.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">
            <tbody>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #1e3a8a; width: 140px; vertical-align: top;">Tool Name:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #1e3a8a; vertical-align: top;">Website URL:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb;">${url}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #1e3a8a; vertical-align: top;">Submitter Email:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e3a8a; vertical-align: top;">Sector:</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${sector}</td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; font-weight: bold; color: #1e3a8a; vertical-align: top;">Description:</td>
                <td style="padding: 12px 16px; color: #0f172a; line-height: 1.5;">${description}</td>
              </tr>
            </tbody>
          </table>

          <div style="padding: 14px 16px; background-color: #dbeafe; border-radius: 6px; border: 1px solid #bfdbfe; color: #1e3a8a; font-size: 13px; line-height: 1.4;">
            <strong>Security Notice:</strong> To review, approve, or reject this entry, open your browser and log into your administrator console securely.
          </div>
        </div>
      `,
    });

    // 2. Send Confirmation Email to the Submitter
    const userEmailPromise = resend.emails.send({
      from: 'VerifiedAIHub <notifications@verifiedaihub.com>',
      to: [email],
      subject: `Submission Received: ${name} on VerifiedAIHub`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #1e3a8a; margin-top: 0; margin-bottom: 12px;">Thank you for your submission!</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">
            We received your request to list <strong>${name}</strong> on the <strong>VerifiedAIHub</strong> directory.
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">
            Our compliance team will review the details and verification status (HIPAA, SOC2, FDA) before publishing your listing.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 13px;">
            If you have questions or need to update your tool details, reply directly to this email or reach out via <a href="https://verifiedaihub.com" style="color: #2563eb;">verifiedaihub.com</a>.
          </p>
        </div>
      `,
    });

    // Run both dispatches in parallel
    const [adminRes, userRes] = await Promise.all([adminEmailPromise, userEmailPromise]);

    if (adminRes.error) {
      console.error('Admin Email Error:', adminRes.error);
    }
    if (userRes.error) {
      console.error('User Confirmation Email Error:', userRes.error);
    }

    return NextResponse.json({ success: true, adminRes, userRes });
  } catch (err: any) {
    console.error('Server Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

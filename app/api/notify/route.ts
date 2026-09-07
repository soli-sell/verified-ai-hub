import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const body = await req.json();
    const { name, url, category, pricing, description, submitter_email, hipaa_compliant, soc2_compliant, fda_cleared } = body;

    // 1. Send Admin Notification Email
    await resend.emails.send({
      from: 'Verified AI Hub <notifications@verifiedaihub.com>',
      to: ['solfar55@gmail.com'],
      subject: `🚨 New AI Tool Submission: ${name}`,
      html: `
        <h2>New AI Tool Pending Review</h2>
        <p><strong>Tool Name:</strong> ${name}</p>
        <p><strong>Website:</strong> <a href="${url}">${url}</a></p>
        <p><strong>Submitter Email:</strong> ${submitter_email || 'N/A'}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Pricing:</strong> ${pricing}</p>
        <p><strong>Description:</strong> ${description}</p>
        <h3>Verified Badges:</h3>
        <ul>
          <li>HIPAA: ${hipaa_compliant ? '✅ Yes' : '❌ No'}</li>
          <li>SOC 2: ${soc2_compliant ? '✅ Yes' : '❌ No'}</li>
          <li>FDA Cleared: ${fda_cleared ? '✅ Yes' : '❌ No'}</li>
        </ul>
        <hr />
        <p><a href="https://verifiedaihub.com/admin">Click here to open Admin Panel and review</a></p>
      `,
    });

    // 2. Send Auto-Receipt Email to Vendor (if email provided)
    if (submitter_email) {
      await resend.emails.send({
        from: 'Verified AI Hub <notifications@verifiedaihub.com>',
        to: [submitter_email],
        subject: `Submission Received: ${name} - Verified AI Hub`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; color: #1e293b;">
            <h2 style="color: #1d4ed8;">Thank you for submitting ${name}!</h2>
            <p>We have received your listing request for <strong>Verified AI Hub</strong>.</p>
            <p>Our clinical and technical moderation team manually reviews every submission to maintain high standards across Healthcare, Life Sciences, and Biotech tools.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Submitted Tool:</strong> ${name}</p>
              <p style="margin: 4px 0;"><strong>Website:</strong> ${url}</p>
              <p style="margin: 4px 0;"><strong>Category:</strong> ${category}</p>
            </div>
            <p>We will notify you at this email address as soon as your listing is approved and live in the directory.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b;">Verified AI Hub Team | <a href="https://verifiedaihub.com">verifiedaihub.com</a></p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

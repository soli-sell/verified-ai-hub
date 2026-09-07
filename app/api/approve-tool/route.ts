import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const body = await req.json();
    const { id, name, url, submitter_email } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }

    // 1. Update status to 'approved' in Supabase
    const { error: dbError } = await supabase
      .from('tools')
      .update({ status: 'approved' })
      .eq('id', id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Send Approval Email to Vendor
    if (submitter_email) {
      await resend.emails.send({
        from: 'Verified AI Hub <notifications@verifiedaihub.com>',
        to: [submitter_email],
        subject: `🎉 Listing Approved: ${name} is live on Verified AI Hub!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; color: #1e293b; padding: 20px;">
            <h2 style="color: #047857; margin-top: 0;">Great news! ${name} is now live!</h2>
            <p>Your AI solution has been reviewed and approved by our clinical and technical moderation team.</p>
            <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Tool Name:</strong> ${name}</p>
              <p style="margin: 4px 0;"><strong>Official Link:</strong> <a href="${url}">${url}</a></p>
              <p style="margin: 4px 0;"><strong>Status:</strong> ✅ Verified & Active</p>
            </div>
            <p>You can view your active listing on our primary directory at <a href="https://verifiedaihub.com">verifiedaihub.com</a>.</p>
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

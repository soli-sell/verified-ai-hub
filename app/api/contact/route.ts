import { Resend } from "resend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { message: "RESEND_API_KEY environment variable is missing" } },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const body = await req.json();
    const name = String(body.name || "Visitor");
    const email = String(body.email || "");
    const message = String(body.message || "");

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: { message: "Email and message are required" } },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Verified AI Hub <support@verifiedaihub.com>",
      to: ["support@verifiedaihub.com"],
      subject: "New Contact Submission from " + name,
      replyTo: email,
      html: "<h2>New Contact Submission</h2><p><strong>Name:</strong> " + name + "</p><p><strong>Email:</strong> " + email + "</p><p><strong>Message:</strong></p><p style=\"background: #f1f5f9; padding: 12px; border-radius: 6px;\">" + message + "</p>",
    });

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: { message: errorMsg } }, { status: 500 });
  }
}

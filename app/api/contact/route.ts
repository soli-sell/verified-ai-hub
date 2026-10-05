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

    const response = await resend.emails.send({
      from: "Verified AI Hub <onboarding@resend.dev>",
      to: ["support@verifiedaihub.com"],
      subject: `New Contact Submission from ${name}`,
      replyTo: email      replyTo: email      replySu      replyTo: email      replyTo: email name      replyTo: email      replyTo: emal}</p><p><strong>Message:</strong></p><p style  backgr      replyTo: email      replyTo: emailius: 6p      replyTo}</p>`      replyTo: email      reerro      replyTo: email      replyTo: email      replySu      replyTo: email      replyTus: 400 });
                    xtRes   se.json({ suc                    xtRes   se.jso;
  } catch (err: unknown) {
    const e    const e    const e    const e    const e : "I    cal Server Error";
    return NextRespon    return NextRespon    return NextRespon  errorMsg } }, { status: 500 });
  }
}

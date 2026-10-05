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
    const { name, email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: { message: "Email and message are required" } },
        { status: 400 }
      );
    }

    const senderName = name || "Visitor";
    const displayName = name || "N/A";

    const { data, error } = await resend.emails.send({
      from: "Verified AI Hub <onboarding@resend.dev>",
      to: ["support@verifiedaihub.com"],
      subject: "New Contact Submission from " + senderName,
      replyTo: email,
      html: "<h2>New Contact Submission</h2><p><strong>Na      html: "<h2>New Contact Submissip><stron      html: "<h2>New Contact+ "</p><p><strong>Message:</strong></p><p style=\"background: #f1f5f9; padding: 12px; border-radius: 6px;\">" + message + "</p>",
      html: "<h2>Nrror) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } ca  } ca  } ca  } ca  } ca const errorMsg  } ca  } ca  } ca  } ca  } ca const errorMsg  }  Server  } ca  } ca  } ca  } ca  } on  } ca  } ca  } ca  }lse, error: { message: errorMsg } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    // Store in database
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name: name || null,
        email,
        subject: subject || null,
        message,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB fails - try to send email
    }

    // Send notification email via Mailgun
    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@cognitiveconstraint.com";

    if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
      const formData = new FormData();
      formData.append("from", `Contact Form <noreply@${MAILGUN_DOMAIN}>`);
      formData.append("to", ADMIN_EMAIL);
      formData.append("subject", `[CCJ Contact] ${subject || "New Message"} from ${email}`);
      formData.append(
        "text",
        `New contact form submission:\n\nName: ${name || "Not provided"}\nEmail: ${email}\nSubject: ${subject || "Not specified"}\n\nMessage:\n${message}`
      );

      try {
        await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
          },
          body: formData,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

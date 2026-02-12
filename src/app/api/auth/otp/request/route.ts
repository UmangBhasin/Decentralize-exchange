import { NextResponse } from "next/server";
import { Resend } from "resend";
import { issueOtp } from "@/lib/otp-store";

const resendKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

export async function POST(request: Request) {
  try {
    if (!resendKey || !resendFrom) {
      return NextResponse.json(
        { error: "Email provider not configured." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const result = issueOtp(email);

    if (!result.ok) {
      return NextResponse.json(
        { error: "Too many requests.", retryAfter: result.retryAfter },
        { status: 429 }
      );
    }

    // In development, return OTP in response for testing
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log(`[DEV] OTP for ${email}: ${result.code}`);
    }

    const resend = new Resend(resendKey);
    const emailResult = await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: "Your Exchange OTP Code",
      text: `Your OTP code is ${result.code}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px;">
          <p>Your OTP code is:</p>
          <h2 style="letter-spacing: 0.2em;">${result.code}</h2>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("Resend result:", emailResult);

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error);
      return NextResponse.json(
        { error: `Email error: ${emailResult.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      expiresAt: result.expiresAt,
      ...(isDev && { devCode: result.code }) // Include OTP in dev mode
    });
  } catch (error) {
    console.error("OTP send error:", error);
    const message = error instanceof Error ? error.message : "Failed to send OTP.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

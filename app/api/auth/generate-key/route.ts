import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getMailgunClient() {
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  if (!MAILGUN_API_KEY) return null;
  const mailgun = new Mailgun(FormData);
  return mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY,
  });
}

function generateCode(): string {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const mg = getMailgunClient();
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
  const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@cognitiveconstraint.com';
  
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const code = generateCode();

    // Delete any existing codes for this email
    await supabase
      .from('access_codes')
      .delete()
      .eq('email', normalizedEmail);

    // Insert new code
    const { error } = await supabase
      .from('access_codes')
      .insert({
        email: normalizedEmail,
        code: code,
      });

    if (error) {
      console.error('Error inserting code:', error);
      return NextResponse.json(
        { error: 'Failed to generate access code' },
        { status: 500 }
      );
    }

    // Send email with code (only if Mailgun is configured)
    if (mg) {
      try {
        await mg.messages.create(MAILGUN_DOMAIN, {
          from: FROM_EMAIL,
          to: normalizedEmail,
          subject: 'Your Cognitive Constraint Journal Access Code',
          text: `Your access code is: ${code}\n\nThis code expires in 15 minutes.`,
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
              <h2 style="color: #000;">Cognitive Constraint Journal</h2>
              <p>Your access code is:</p>
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000;">${code}</p>
              <p style="color: #666;">This code expires in 15 minutes.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails in development
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: 'Failed to send access code email' },
            { status: 500 }
          );
        }
      }
    } else {
      console.log('Mailgun not configured, skipping email send');
    }

    console.log(`Access code for ${normalizedEmail}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Access code sent to your email',
      // Only show code in dev if email sending fails
      ...(process.env.NODE_ENV === 'development' && { code }),
    });
  } catch (error) {
    console.error('Error generating key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

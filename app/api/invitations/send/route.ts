import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

function getMailgunClient() {
  const mailgun = new Mailgun(FormData);
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || '',
  });
}

function getInviteEmailHTML(role: string): string {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const roleText = role === 'reviewer' 
    ? 'peer review submissions' 
    : 'submit your research';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #000; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 40px; text-align: center;">
                  <h1 style="color: #fff; margin: 0 0 20px 0; font-size: 28px; font-weight: 700;">
                    Cognitive Constraint Journal
                  </h1>
                  <p style="color: #ccc; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    You've been invited to join the Cognitive Constraint Journal as a ${role}.
                  </p>
                  <div style="background-color: rgba(255,255,255,0.1); border-radius: 6px; padding: 24px; margin-bottom: 30px;">
                    <p style="color: #fff; margin: 0; font-size: 16px; line-height: 1.6;">
                      As a ${role}, you'll be able to ${roleText} for our open-access cognitive science journal.
                    </p>
                  </div>
                  <a href="${SITE_URL}/portal" style="display: inline-block; background-color: #fff; color: #000; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Login to Portal
                  </a>
                  <p style="color: #888; margin: 30px 0 0 0; font-size: 14px;">
                    Use your email address to sign in. You'll receive a one-time access code.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: rgba(255,255,255,0.05); text-align: center;">
                  <p style="color: #666; margin: 0; font-size: 12px;">
                    Cognitive Constraint Journal — Radical Hard Science
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST() {
  const supabase = getSupabase();
  const mg = getMailgunClient();
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
  const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@cognitiveconstraint.com';
  
  try {
    // Get pending invitations (not yet sent)
    const { data: pendingInvitations, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .is('invite_sent_at', null);

    if (fetchError) {
      console.error('Error fetching pending invitations:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending invitations' },
        { status: 500 }
      );
    }

    if (!pendingInvitations || pendingInvitations.length === 0) {
      return NextResponse.json(
        { error: 'No pending invitations to send' },
        { status: 400 }
      );
    }

    let sent = 0;
    const errors: string[] = [];

    for (const invitation of pendingInvitations) {
      try {
        await mg.messages.create(MAILGUN_DOMAIN, {
          from: FROM_EMAIL,
          to: invitation.email,
          subject: "You're Invited to Cognitive Constraint Journal",
          html: getInviteEmailHTML(invitation.role),
        });

        // Update invitation as sent
        await supabase
          .from('invitations')
          .update({ invite_sent_at: new Date().toISOString() })
          .eq('id', invitation.id);

        sent++;
      } catch (emailError) {
        console.error(`Failed to send to ${invitation.email}:`, emailError);
        errors.push(invitation.email);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

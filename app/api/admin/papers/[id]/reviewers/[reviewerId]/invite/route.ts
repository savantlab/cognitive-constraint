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
  const mailgun = new Mailgun(FormData);
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || '',
  });
}

// POST /api/admin/papers/[id]/reviewers/[reviewerId]/invite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewerId: string }> }
) {
  const { id: paperId, reviewerId } = await params;
  const supabase = getSupabase();
  const mg = getMailgunClient();
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
  const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@cognitiveconstraint.com';
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Get the reviewer record
  const { data: reviewer, error: reviewerError } = await supabase
    .from('paper_reviewers')
    .select('*')
    .eq('id', reviewerId)
    .single();

  if (reviewerError || !reviewer) {
    return NextResponse.json(
      { error: 'Reviewer not found' },
      { status: 404 }
    );
  }

  // Get the paper
  const { data: paper, error: paperError } = await supabase
    .from('papers')
    .select('title, abstract')
    .eq('id', paperId)
    .single();

  if (paperError || !paper) {
    return NextResponse.json(
      { error: 'Paper not found' },
      { status: 404 }
    );
  }

  try {
    await mg.messages.create(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: reviewer.reviewer_email,
      subject: `Peer Review Invitation: ${paper.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #000; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 40px; text-align: center;">
                      <h1 style="color: #fff; margin: 0 0 20px 0; font-size: 24px;">
                        Peer Review Invitation
                      </h1>
                      <p style="color: #ccc; margin: 0 0 30px 0; font-size: 16px;">
                        You've been invited to review a paper for the Cognitive Constraint Journal.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px; background-color: #fff;">
                      <h2 style="margin: 0 0 15px 0; color: #000; font-size: 20px;">
                        ${paper.title}
                      </h2>
                      <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
                        ${paper.abstract.substring(0, 300)}${paper.abstract.length > 300 ? '...' : ''}
                      </p>
                      <a href="${SITE_URL}/portal" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
                        Login to Review
                      </a>
                      <p style="color: #999; font-size: 13px; margin: 25px 0 0 0;">
                        Sign in with your email to access the review portal.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f5f5f5; text-align: center;">
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
      `,
    });

    // Update the invited_at timestamp
    await supabase
      .from('paper_reviewers')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', reviewerId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

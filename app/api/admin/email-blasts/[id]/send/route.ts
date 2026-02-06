import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@cognitiveconstraint.com';

// POST /api/admin/email-blasts/[id]/send - Send the email blast
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get the blast
  const { data: blast, error: blastError } = await supabase
    .from('email_blasts')
    .select('*')
    .eq('id', id)
    .single();

  if (blastError || !blast) {
    return NextResponse.json(
      { error: 'Email blast not found' },
      { status: 404 }
    );
  }

  // Update status to sending
  await supabase
    .from('email_blasts')
    .update({ status: 'sending' })
    .eq('id', id);

  // Get recipients
  let recipients: string[] = [];

  if (blast.recipient_type === 'custom' && blast.custom_emails) {
    recipients = blast.custom_emails;
  } else {
    let query = supabase.from('users').select('email');
    
    if (blast.recipient_type === 'reviewers') {
      query = query.eq('role', 'reviewer');
    } else if (blast.recipient_type === 'authors') {
      query = query.eq('role', 'author');
    }
    
    const { data: users } = await query;
    recipients = users?.map(u => u.email) || [];
  }

  // Also include invited users who have accepted
  if (blast.recipient_type !== 'custom') {
    let invQuery = supabase
      .from('invitations')
      .select('email')
      .not('accepted_at', 'is', null);
    
    if (blast.recipient_type === 'reviewers') {
      invQuery = invQuery.eq('role', 'reviewer');
    } else if (blast.recipient_type === 'authors') {
      invQuery = invQuery.eq('role', 'author');
    }
    
    const { data: invitations } = await invQuery;
    const invEmails = invitations?.map(i => i.email) || [];
    
    // Merge and dedupe
    recipients = [...new Set([...recipients, ...invEmails])];
  }

  // Update recipient count
  await supabase
    .from('email_blasts')
    .update({ recipient_count: recipients.length })
    .eq('id', id);

  // Send emails
  let sentCount = 0;
  let failedCount = 0;

  for (const email of recipients) {
    try {
      await mg.messages.create(MAILGUN_DOMAIN, {
        from: FROM_EMAIL,
        to: email,
        subject: blast.subject,
        html: blast.html_content,
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send to ${email}:`, error);
      failedCount++;
    }
  }

  // Update blast status
  await supabase
    .from('email_blasts')
    .update({
      status: failedCount === recipients.length ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
      failed_count: failedCount,
    })
    .eq('id', id);

  return NextResponse.json({
    success: true,
    sent: sentCount,
    failed: failedCount,
    total: recipients.length,
  });
}

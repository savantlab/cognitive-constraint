import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/admin/invoices/[id]/send - Send invoice via email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Get the invoice
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );
  }

  // Build email content
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const invoiceUrl = `${siteUrl}/invoice/${invoice.id}`;
  
  const emailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Invoice ${invoice.invoice_number}</h1>
      <p>Dear ${invoice.bill_to_name},</p>
      <p>Please find your invoice from the Cognitive Constraint Journal.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px;"><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
        <p style="margin: 0 0 10px;"><strong>Description:</strong> ${invoice.description}</p>
        ${invoice.subscription_period ? `<p style="margin: 0 0 10px;"><strong>Period:</strong> ${invoice.subscription_period}</p>` : ''}
        <p style="margin: 0 0 10px;"><strong>Amount Due:</strong> $${Number(invoice.amount).toFixed(2)} ${invoice.currency}</p>
        <p style="margin: 0;"><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
      
      <p><a href="${invoiceUrl}" style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Invoice</a></p>
      
      ${invoice.memo ? `<p style="color: #666; margin-top: 20px;">${invoice.memo}</p>` : ''}
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #666; font-size: 14px;">
        Cognitive Constraint Journal<br/>
        For questions, please contact us at journal@cognitiveconstraint.org
      </p>
    </div>
  `;

  // Send via Mailgun if configured
  const mailgunKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;

  if (mailgunKey && mailgunDomain) {
    try {
      const formData = new FormData();
      formData.append('from', `Cognitive Constraint Journal <billing@${mailgunDomain}>`);
      formData.append('to', invoice.bill_to_email);
      formData.append('subject', `Invoice ${invoice.invoice_number} - Cognitive Constraint Journal`);
      formData.append('html', emailHtml);

      const response = await fetch(
        `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`api:${mailgunKey}`).toString('base64')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        console.error('Mailgun error:', await response.text());
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: 500 }
        );
      }
    } catch (err) {
      console.error('Email error:', err);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } else {
    console.log('Mailgun not configured, would send to:', invoice.bill_to_email);
    console.log('Invoice URL:', invoiceUrl);
  }

  // Update invoice status to sent
  await supabase
    .from('invoices')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', id);

  return NextResponse.json({ success: true, sent_to: invoice.bill_to_email });
}

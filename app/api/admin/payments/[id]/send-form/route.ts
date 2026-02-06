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

// POST /api/admin/payments/[id]/send-form - Send payment form email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();
  const mg = getMailgunClient();
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || '';
  const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'noreply@cognitiveconstraint.com';

  // Get the payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();

  if (paymentError || !payment) {
    return NextResponse.json(
      { error: 'Payment not found' },
      { status: 404 }
    );
  }

  // Get required forms for this payment type
  const { data: forms } = await supabase
    .from('payment_forms')
    .select('*')
    .eq('is_active', true)
    .contains('required_for', [payment.type]);

  const formLinks = forms?.map(f => `<li><a href="${f.url}">${f.name}</a>${f.description ? ` - ${f.description}` : ''}</li>`).join('') || '';

  const typeLabel = payment.type.replace('_', ' ');
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: payment.currency }).format(payment.amount);

  try {
    await mg.messages.create(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: payment.email,
      subject: `Payment Form Required - Cognitive Constraint Journal`,
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
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px; background-color: #000; text-align: center;">
                      <h1 style="color: #fff; margin: 0; font-size: 24px;">Cognitive Constraint Journal</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #000;">Payment Form Required</h2>
                      <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                        You have a pending payment of <strong>${amount}</strong> for <strong>${typeLabel}</strong>.
                      </p>
                      <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                        Before we can process your payment, please complete the following required form(s):
                      </p>
                      ${formLinks ? `<ul style="color: #333; line-height: 2;">${formLinks}</ul>` : '<p style="color: #666;">No forms are currently required. We will contact you with payment details.</p>'}
                      <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Once you complete the form(s), your payment will be processed within 5-7 business days.
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

    // Update payment status
    await supabase
      .from('payments')
      .update({ 
        status: 'form_sent',
        form_sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending form email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

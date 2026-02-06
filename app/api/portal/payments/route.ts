import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PortalSession {
  email: string;
  role: string;
  institution: string;
}

async function getPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const portalCookie = cookieStore.get('ccj_portal');
  
  if (!portalCookie) return null;
  
  try {
    return JSON.parse(portalCookie.value);
  } catch {
    return null;
  }
}

// GET - get user's payments and payment info
export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payments for this user
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('email', session.email)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    // Get payment info
    const { data: paymentInfo } = await supabase
      .from('user_payment_info')
      .select('*')
      .eq('email', session.email)
      .single();

    // Calculate totals
    const totalEarned = payments?.reduce((sum, p) => 
      p.status === 'paid' ? sum + parseFloat(p.amount) : sum, 0) || 0;
    const pendingPayments = payments?.reduce((sum, p) => 
      ['pending', 'form_sent', 'form_completed', 'processing'].includes(p.status) 
        ? sum + parseFloat(p.amount) : sum, 0) || 0;

    return NextResponse.json({
      payments: payments || [],
      paymentInfo: paymentInfo || null,
      totalEarned,
      pendingPayments,
    });
  } catch (error) {
    console.error('Error in payments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - update payment info/method
export async function PUT(request: NextRequest) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      paymentMethod,
      venmoHandle,
      paypalEmail,
      cashappTag,
      zelleEmail,
      wireTransfer,
      mailingAddress,
    } = body;

    // Validate payment method
    const validMethods = ['venmo', 'paypal', 'cashapp', 'wire_transfer', 'check', 'zelle'];
    if (paymentMethod && !validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Build payment_details for wire/check
    let paymentDetails = null;
    if (paymentMethod === 'wire_transfer' && wireTransfer) {
      paymentDetails = wireTransfer;
    } else if (paymentMethod === 'check' && mailingAddress) {
      paymentDetails = { mailing_address: mailingAddress };
    }

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.email)
      .single();

    // Upsert payment info
    const { error } = await supabase
      .from('user_payment_info')
      .upsert({
        email: session.email,
        user_id: user?.id || null,
        payment_method: paymentMethod || null,
        venmo_handle: venmoHandle || null,
        paypal_email: paypalEmail || null,
        cashapp_tag: cashappTag || null,
        zelle_email: zelleEmail || null,
        payment_details: paymentDetails,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });

    if (error) {
      console.error('Error updating payment info:', error);
      return NextResponse.json({ error: 'Failed to update payment info' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payment info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

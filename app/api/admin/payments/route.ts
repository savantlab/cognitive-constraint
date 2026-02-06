import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/payments - List all payments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }

  return NextResponse.json({ payments: data });
}

// POST /api/admin/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const { email, type, amount, notes, reference_id, reference_type } = await request.json();

    if (!email || !type || !amount) {
      return NextResponse.json(
        { error: 'Email, type, and amount are required' },
        { status: 400 }
      );
    }

    // Look up user by email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        email: email.toLowerCase(),
        user_id: user?.id || null,
        type,
        amount,
        notes,
        reference_id,
        reference_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ payment: data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

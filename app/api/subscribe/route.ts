import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// POST /api/subscribe - Public endpoint to subscribe to notifications
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, source } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email address' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      email: email.toLowerCase().trim(),
      name: name || null,
      source: source || 'website',
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate email
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Successfully subscribed',
    subscriber: { id: data.id, email: data.email }
  });
}

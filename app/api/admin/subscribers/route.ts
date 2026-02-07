import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/admin/subscribers - List all subscribers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }

  return NextResponse.json({ subscribers: data });
}

// POST /api/admin/subscribers - Add a subscriber
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, institution, category, source } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({
      email: email.toLowerCase().trim(),
      name,
      institution,
      category,
      source: source || 'admin',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }
    console.error('Error adding subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to add subscriber' },
      { status: 500 }
    );
  }

  return NextResponse.json({ subscriber: data });
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/payment-forms - List all payment forms
export async function GET() {
  const { data, error } = await supabase
    .from('payment_forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }

  return NextResponse.json({ forms: data });
}

// POST /api/admin/payment-forms - Create a new payment form
export async function POST(request: NextRequest) {
  try {
    const { name, description, url, required_for } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('payment_forms')
      .insert({
        name,
        description,
        url,
        required_for: required_for || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      return NextResponse.json(
        { error: 'Failed to create form' },
        { status: 500 }
      );
    }

    return NextResponse.json({ form: data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

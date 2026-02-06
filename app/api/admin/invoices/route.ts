import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/invoices - List all invoices
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('invoices')
    .select('*, subscribers(email, name, institution)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }

  return NextResponse.json({ invoices: data });
}

// POST /api/admin/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Generate invoice number
  const { data: seqData } = await supabase.rpc('nextval', { seq_name: 'invoice_number_seq' });
  const invoiceNumber = `CCJ-${seqData || Date.now()}`;
  
  // Calculate due date (30 days from issue date by default)
  const issueDate = body.issue_date || new Date().toISOString().split('T')[0];
  const dueDate = body.due_date || new Date(new Date(issueDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      subscriber_id: body.subscriber_id || null,
      bill_to_name: body.bill_to_name,
      bill_to_email: body.bill_to_email,
      bill_to_institution: body.bill_to_institution,
      bill_to_address: body.bill_to_address,
      bill_to_city: body.bill_to_city,
      bill_to_state: body.bill_to_state,
      bill_to_zip: body.bill_to_zip,
      bill_to_country: body.bill_to_country,
      description: body.description,
      subscription_period: body.subscription_period,
      category: body.category,
      amount: body.amount,
      currency: body.currency || 'USD',
      status: 'draft',
      issue_date: issueDate,
      due_date: dueDate,
      memo: body.memo,
      notes: body.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }

  return NextResponse.json({ invoice: data });
}

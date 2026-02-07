import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/admin/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('invoices')
    .select('*, subscribers(email, name, institution)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ invoice: data });
}

// PATCH /api/admin/invoices/[id] - Update invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Copy allowed fields
  const allowedFields = [
    'bill_to_name', 'bill_to_email', 'bill_to_institution', 'bill_to_address',
    'bill_to_city', 'bill_to_state', 'bill_to_zip', 'bill_to_country',
    'description', 'subscription_period', 'category', 'amount', 'currency',
    'status', 'po_number', 'payment_method', 'payment_reference', 'payment_date',
    'issue_date', 'due_date', 'memo', 'notes'
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  // Handle status changes
  if (body.status === 'sent' && !body.sent_at) {
    updateData.sent_at = new Date().toISOString();
  }
  if (body.status === 'paid' && !body.paid_at) {
    updateData.paid_at = new Date().toISOString();
    updateData.payment_date = body.payment_date || new Date().toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }

  return NextResponse.json({ invoice: data });
}

// DELETE /api/admin/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

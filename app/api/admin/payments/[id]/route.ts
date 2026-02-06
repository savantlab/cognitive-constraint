import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH /api/admin/payments/[id] - Update payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: 'Payment ID is required' },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  
  if (body.status) {
    updateData.status = body.status;
    
    // Set timestamps based on status
    if (body.status === 'form_sent') {
      updateData.form_sent_at = new Date().toISOString();
    } else if (body.status === 'form_completed') {
      updateData.form_completed_at = new Date().toISOString();
    } else if (body.status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }
  }
  
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }

  return NextResponse.json({ payment: data });
}

// DELETE /api/admin/payments/[id] - Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

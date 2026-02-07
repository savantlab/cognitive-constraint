import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// PATCH /api/admin/subscribers/[id] - Update subscriber
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, category } = body;

  const updateData: Record<string, unknown> = {};
  
  if (status) {
    updateData.status = status;
    if (status === 'unsubscribed') {
      updateData.unsubscribed_at = new Date().toISOString();
    }
  }
  
  if (category !== undefined) {
    updateData.category = category;
  }

  const { data, error } = await supabase
    .from('subscribers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }

  return NextResponse.json({ subscriber: data });
}

// DELETE /api/admin/subscribers/[id] - Delete subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

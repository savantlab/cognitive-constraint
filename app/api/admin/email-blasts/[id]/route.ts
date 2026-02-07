import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

// DELETE /api/admin/email-blasts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from('email_blasts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting email blast:', error);
    return NextResponse.json(
      { error: 'Failed to delete email blast' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/email-blasts/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();
  const body = await request.json();

  const { data, error } = await supabase
    .from('email_blasts')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating email blast:', error);
    return NextResponse.json(
      { error: 'Failed to update email blast' },
      { status: 500 }
    );
  }

  return NextResponse.json({ blast: data });
}

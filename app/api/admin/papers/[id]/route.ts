import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE /api/admin/papers/[id] - Delete a paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Paper ID is required' },
      { status: 400 }
    );
  }

  // First delete related records
  await supabase.from('validations').delete().eq('paper_id', id);
  await supabase.from('replications').delete().eq('paper_id', id);

  // Then delete the paper
  const { error } = await supabase
    .from('papers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting paper:', error);
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// GET /api/admin/papers/[id] - Get a single paper
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('papers')
    .select('*, authors(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching paper:', error);
    return NextResponse.json(
      { error: 'Paper not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ paper: data });
}

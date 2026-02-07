import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// DELETE /api/admin/papers/[id]/reviewers/[reviewerId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewerId: string }> }
) {
  const { reviewerId } = await params;

  const { error } = await supabase
    .from('paper_reviewers')
    .delete()
    .eq('id', reviewerId);

  if (error) {
    console.error('Error removing reviewer:', error);
    return NextResponse.json(
      { error: 'Failed to remove reviewer' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/papers/[id]/reviewers/[reviewerId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewerId: string }> }
) {
  const { reviewerId } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) {
    updateData.status = body.status;
    if (body.status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    } else if (body.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
  }
  if (body.review_notes !== undefined) {
    updateData.review_notes = body.review_notes;
  }

  const { data, error } = await supabase
    .from('paper_reviewers')
    .update(updateData)
    .eq('id', reviewerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating reviewer:', error);
    return NextResponse.json(
      { error: 'Failed to update reviewer' },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviewer: data });
}

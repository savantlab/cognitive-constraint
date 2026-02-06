import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/papers/[id]/reviewers - List reviewers for a paper
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paperId } = await params;

  const { data, error } = await supabase
    .from('paper_reviewers')
    .select('*')
    .eq('paper_id', paperId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviewers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviewers: data });
}

// POST /api/admin/papers/[id]/reviewers - Add reviewers to a paper
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paperId } = await params;

  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'At least one email is required' },
        { status: 400 }
      );
    }

    // Look up user IDs for the emails
    const reviewersToInsert = [];
    for (const email of emails) {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Try to find user
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      reviewersToInsert.push({
        paper_id: paperId,
        reviewer_email: normalizedEmail,
        reviewer_id: user?.id || null,
      });
    }

    const { data, error } = await supabase
      .from('paper_reviewers')
      .upsert(reviewersToInsert, {
        onConflict: 'paper_id,reviewer_email',
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      console.error('Error adding reviewers:', error);
      return NextResponse.json(
        { error: 'Failed to add reviewers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviewers: data, added: reviewersToInsert.length }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

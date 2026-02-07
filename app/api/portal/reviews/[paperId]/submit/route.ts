import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface PortalSession {
  email: string;
  role: string;
  institution: string;
}

async function getPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const portalCookie = cookieStore.get('ccj_portal');
  
  if (!portalCookie) return null;
  
  try {
    return JSON.parse(portalCookie.value);
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'reviewer') {
      return NextResponse.json({ error: 'Only reviewers can submit reviews' }, { status: 403 });
    }

    const { paperId } = await params;
    const { content, recommendation, confidenceLevel, isAnonymous } = await request.json();

    if (!content || !recommendation) {
      return NextResponse.json(
        { error: 'Content and recommendation are required' },
        { status: 400 }
      );
    }

    // Get the user record for this reviewer
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify reviewer is assigned to this paper
    const { data: assignment, error: assignError } = await supabase
      .from('paper_reviewers')
      .select('id, status')
      .eq('paper_id', paperId)
      .eq('reviewer_email', session.email)
      .single();

    if (assignError || !assignment) {
      return NextResponse.json(
        { error: 'You are not assigned to review this paper' },
        { status: 403 }
      );
    }

    // Create or update the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .upsert({
        paper_id: paperId,
        reviewer_id: user.id,
        content,
        recommendation,
        confidence_level: confidenceLevel || 'medium',
        is_anonymous: isAnonymous ?? true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'paper_id,reviewer_id',
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // Update paper_reviewers status
    await supabase
      .from('paper_reviewers')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        review_id: review.id,
      })
      .eq('id', assignment.id);

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - fetch existing review for this paper
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperId } = await params;

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!user) {
      return NextResponse.json({ review: null });
    }

    // Get existing review
    const { data: review } = await supabase
      .from('reviews')
      .select('*')
      .eq('paper_id', paperId)
      .eq('reviewer_id', user.id)
      .single();

    return NextResponse.json({ review: review || null });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/app/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET - get proposal with matching reviewers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        author:authors (
          id,
          name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Get all reviewers with expertise
    const { data: reviewers } = await supabase
      .from('reviewer_expertise')
      .select(`
        *,
        user:users (
          id,
          email,
          name,
          institution
        )
      `)
      .eq('availability_status', 'available');

    // Calculate match scores
    const matchedReviewers = (reviewers || []).map((reviewer) => {
      let score = 0;
      const reasons: string[] = [];

      // Check research area match
      if (reviewer.research_areas?.includes(proposal.research_area)) {
        score += 40;
        reasons.push(`Research area: ${proposal.research_area}`);
      }

      // Check keyword overlap
      const proposalKeywords = proposal.keywords || [];
      const reviewerKeywords = reviewer.keywords || [];
      const keywordMatches = proposalKeywords.filter((k: string) => 
        reviewerKeywords.some((rk: string) => 
          rk.toLowerCase().includes(k.toLowerCase()) || 
          k.toLowerCase().includes(rk.toLowerCase())
        )
      );
      if (keywordMatches.length > 0) {
        score += Math.min(keywordMatches.length * 15, 30);
        reasons.push(`Keywords: ${keywordMatches.join(', ')}`);
      }

      // Boost for higher h-index
      if (reviewer.h_index && reviewer.h_index >= 10) {
        score += 10;
        reasons.push(`h-index: ${reviewer.h_index}`);
      }

      // Boost for experience
      if (reviewer.years_experience && reviewer.years_experience >= 5) {
        score += 10;
        reasons.push(`${reviewer.years_experience} years experience`);
      }

      // Check capacity
      const hasCapacity = (reviewer.current_reviews_count || 0) < (reviewer.max_concurrent_reviews || 3);
      if (!hasCapacity) {
        score = Math.max(0, score - 20);
        reasons.push('At capacity');
      }

      return {
        ...reviewer,
        match_score: score,
        match_reasons: reasons,
        has_capacity: hasCapacity,
      };
    }).sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({ proposal, matchedReviewers });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - update proposal status, funding, etc.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, fundingAmount, adminNotes } = body;

  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status !== 'draft' && status !== 'submitted') {
        updateData.reviewed_at = new Date().toISOString();
      }
    }

    if (fundingAmount !== undefined) {
      updateData.funding_amount = fundingAmount;
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating proposal:', error);
      return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

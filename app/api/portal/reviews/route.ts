import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'reviewer') {
      return NextResponse.json({ error: 'Only reviewers can access this endpoint' }, { status: 403 });
    }

    // Get papers assigned to this reviewer
    const { data: assignments, error } = await supabase
      .from('paper_reviewers')
      .select(`
        id,
        status,
        invited_at,
        accepted_at,
        completed_at,
        review_id,
        paper:papers (
          id,
          title,
          abstract,
          status,
          created_at
        )
      `)
      .eq('reviewer_email', session.email)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

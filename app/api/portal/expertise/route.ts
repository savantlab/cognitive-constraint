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

// GET - get reviewer's expertise profile
export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!user) {
      return NextResponse.json({ expertise: null });
    }

    // Get expertise profile
    const { data: expertise } = await supabase
      .from('reviewer_expertise')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ expertise: expertise || null });
  } catch (error) {
    console.error('Error fetching expertise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - update reviewer's expertise profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'reviewer') {
      return NextResponse.json({ error: 'Only reviewers can set expertise' }, { status: 403 });
    }

    const body = await request.json();
    const {
      researchAreas,
      keywords,
      hIndex,
      publicationsCount,
      yearsExperience,
      institution,
      availabilityStatus,
      maxConcurrentReviews,
      bio,
    } = body;

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert expertise profile
    const { error } = await supabase
      .from('reviewer_expertise')
      .upsert({
        user_id: user.id,
        research_areas: researchAreas || [],
        keywords: keywords || [],
        h_index: hIndex || null,
        publications_count: publicationsCount || null,
        years_experience: yearsExperience || null,
        institution: institution || null,
        availability_status: availabilityStatus || 'available',
        max_concurrent_reviews: maxConcurrentReviews || 3,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error updating expertise:', error);
      return NextResponse.json({ error: 'Failed to update expertise' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expertise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

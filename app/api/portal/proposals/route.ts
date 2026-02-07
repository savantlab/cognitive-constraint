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

// GET - list user's proposals
export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get author record
    const { data: author } = await supabase
      .from('authors')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!author) {
      return NextResponse.json({ proposals: [] });
    }

    // Get proposals
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('author_id', author.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
    }

    return NextResponse.json({ proposals: proposals || [] });
  } catch (error) {
    console.error('Error in proposals API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - create new proposal
export async function POST(request: NextRequest) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      abstract,
      methodologySummary,
      expectedContribution,
      researchArea,
      keywords,
      estimatedLength,
      isDraft,
    } = body;

    if (!title || !abstract || !researchArea) {
      return NextResponse.json(
        { error: 'Title, abstract, and research area are required' },
        { status: 400 }
      );
    }

    // Get or create author record
    let { data: author } = await supabase
      .from('authors')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!author) {
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('email', session.email)
        .single();

      const { data: newAuthor, error: authorError } = await supabase
        .from('authors')
        .insert({
          email: session.email,
          name: user?.name || session.email.split('@')[0],
        })
        .select('id')
        .single();

      if (authorError) {
        console.error('Error creating author:', authorError);
        return NextResponse.json({ error: 'Failed to create author record' }, { status: 500 });
      }
      author = newAuthor;
    }

    // Create proposal
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        author_id: author.id,
        title,
        abstract,
        methodology_summary: methodologySummary || null,
        expected_contribution: expectedContribution || null,
        research_area: researchArea,
        keywords: keywords || [],
        estimated_length: estimatedLength || null,
        status: isDraft ? 'draft' : 'submitted',
        submitted_at: isDraft ? null : new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating proposal:', error);
      return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
    }

    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

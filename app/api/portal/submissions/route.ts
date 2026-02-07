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

// GET - list user's submissions
export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create author record for this email
    let { data: author } = await supabase
      .from('authors')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!author) {
      // No submissions yet
      return NextResponse.json({ submissions: [] });
    }

    // Get papers by this author
    const { data: submissions, error } = await supabase
      .from('papers')
      .select(`
        id,
        title,
        abstract,
        status,
        created_at,
        updated_at,
        published_at,
        validation_score
      `)
      .eq('author_id', author.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error in submissions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - create new submission
export async function POST(request: NextRequest) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, abstract, content, researchArea, keywords, authors } = await request.json();

    if (!title || !abstract || !content) {
      return NextResponse.json(
        { error: 'Title, abstract, and content are required' },
        { status: 400 }
      );
    }

    // Parse keywords from comma-separated string to array
    const keywordsArray = keywords
      ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];

    // Parse authors from newline-separated string to array
    const authorsArray = authors
      ? authors.split('\n').map((a: string) => a.trim()).filter(Boolean)
      : [];

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('email', session.email)
      .single();

    // Get or create author record
    let { data: author, error: authorError } = await supabase
      .from('authors')
      .select('id')
      .eq('email', session.email)
      .single();

    if (!author) {
      // Create author record
      const { data: newAuthor, error: createError } = await supabase
        .from('authors')
        .insert({
          email: session.email,
          name: user?.name || session.email.split('@')[0],
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating author:', createError);
        return NextResponse.json({ error: 'Failed to create author record' }, { status: 500 });
      }
      author = newAuthor;
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Create paper
    const { data: paper, error: paperError } = await supabase
      .from('papers')
      .insert({
        title,
        abstract,
        content,
        slug,
        author_id: author.id,
        status: 'SUBMITTED',
        research_area: researchArea || null,
        keywords: keywordsArray.length > 0 ? keywordsArray : null,
        authors_list: authorsArray.length > 0 ? authorsArray : null,
      })
      .select()
      .single();

    if (paperError) {
      console.error('Error creating paper:', paperError);
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, paper });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

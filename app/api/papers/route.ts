import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey);

type PaperStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'PUBLISHED' | 'DISPUTED';

// GET /api/papers - List all published papers (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') || 'PUBLISHED';
  const status = statusParam as PaperStatus;
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, error, count } = await supabase
    .from('papers')
    .select('*, authors(*)', { count: 'exact' })
    .eq('status', status)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    papers: data,
    total: count,
    limit,
    offset,
  });
}

// POST /api/papers - Create a new paper (requires auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, abstract, content, author_id, keywords, topics, status } = body;

    if (!title || !abstract || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, abstract, content, author_id' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const serviceClient = getServiceClient();
    
    const insertData = {
      title,
      slug,
      abstract,
      content,
      author_id,
      status: status || 'DRAFT',
      validation_score: 0,
      keywords: keywords || [],
      topics: topics || [],
      published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
    };
    
    const { data, error } = await serviceClient
      .from('papers')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ paper: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PATCH /api/papers - Update paper status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, keywords, topics } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    
    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status;
      if (status === 'PUBLISHED') {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (keywords) updateData.keywords = keywords;
    if (topics) updateData.topics = topics;
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await serviceClient
      .from('papers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ paper: data });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

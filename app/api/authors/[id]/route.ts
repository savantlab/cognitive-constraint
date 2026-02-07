import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey);

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/authors/[id] - Get a single author with their papers
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('authors')
    .select('*, papers(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ author: data });
}

// PATCH /api/authors/[id] - Update an author
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const allowedFields = ['name', 'orcid', 'bio'];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Validate ORCID format if provided
    if (updates.orcid && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(updates.orcid as string)) {
      return NextResponse.json(
        { error: 'Invalid ORCID format. Expected: 0000-0000-0000-0000' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    const { data, error } = await serviceClient
      .from('authors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Author not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ author: data });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

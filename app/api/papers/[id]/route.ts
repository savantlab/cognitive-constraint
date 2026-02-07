import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey);

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/papers/[id] - Get a single paper by ID or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Try to find by ID first, then by slug
  let query = supabase
    .from('papers')
    .select('*, authors(*), validations(*), replications(*)');

  // Check if id is a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ paper: data });
}

// PATCH /api/papers/[id] - Update a paper
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const allowedFields = ['title', 'abstract', 'content', 'status', 'doi'];
    
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // If title is updated, regenerate slug
    if (updates.title) {
      updates.slug = (updates.title as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // If status changes to PUBLISHED, set published_at
    if (updates.status === 'PUBLISHED') {
      updates.published_at = new Date().toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const serviceClient = getServiceClient();
    const { data, error } = await serviceClient
      .from('papers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ paper: data });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/papers/[id] - Delete a paper (soft delete by setting status)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const serviceClient = getServiceClient();
  
  // For academic integrity, we don't actually delete papers
  // Instead, we could archive them or mark as withdrawn
  // For now, we'll do a hard delete for drafts only
  
  const { data: paper } = await serviceClient
    .from('papers')
    .select('status')
    .eq('id', id)
    .single();

  if (!paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  if (paper.status !== 'DRAFT') {
    return NextResponse.json(
      { error: 'Only draft papers can be deleted. Published papers must be withdrawn.' },
      { status: 403 }
    );
  }

  const { error } = await serviceClient
    .from('papers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

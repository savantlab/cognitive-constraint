import { NextRequest, NextResponse } from 'next/server';
import { supabase, getServiceClient } from '@repo/db/client';
import type { UpdateTables } from '@repo/db/types';

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

    const updates: UpdateTables<'authors'> = {};
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

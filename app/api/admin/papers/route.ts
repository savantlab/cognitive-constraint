import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/admin/papers - List all papers (any status)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('papers')
    .select('*, authors(*)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }

  return NextResponse.json({ papers: data });
}

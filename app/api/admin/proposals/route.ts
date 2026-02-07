import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/app/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET - list all proposals with author info
export async function GET() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select(`
        *,
        author:authors (
          id,
          name,
          email
        )
      `)
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

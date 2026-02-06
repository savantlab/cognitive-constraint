import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey);

// GET /api/replications - List replications (optionally filter by paper)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('paper_id');
  const success = searchParams.get('success');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('replications')
    .select('*, papers(id, title, slug), authors!replicator_id(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (paperId) {
    query = query.eq('paper_id', paperId);
  }

  if (success !== null) {
    query = query.eq('success', success === 'true');
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    replications: data,
    total: count,
    limit,
    offset,
  });
}

// POST /api/replications - Submit a new replication attempt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paper_id, replicator_id, success, code_url, notes } = body;

    if (!paper_id || !replicator_id || success === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: paper_id, replicator_id, success' },
        { status: 400 }
      );
    }

    // Validate code_url if provided
    if (code_url) {
      try {
        new URL(code_url);
      } catch {
        return NextResponse.json(
          { error: 'Invalid code_url format' },
          { status: 400 }
        );
      }
    }

    const serviceClient = getServiceClient();

    // Check if paper exists
    const { data: paper } = await serviceClient
      .from('papers')
      .select('id, status')
      .eq('id', paper_id)
      .single();

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    if (paper.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot replicate a draft paper' },
        { status: 400 }
      );
    }

    // Insert replication
    const insertData = {
      paper_id,
      replicator_id,
      success: Boolean(success),
      code_url: code_url || null,
      notes: notes || null,
    };
    
    const { data: replication, error } = await serviceClient
      .from('replications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get replication stats for this paper
    const { data: stats } = await serviceClient
      .from('replications')
      .select('success')
      .eq('paper_id', paper_id);

    const totalReplications = stats?.length || 0;
    const successfulReplications = stats?.filter(r => r.success).length || 0;
    const replicationRate = totalReplications > 0 
      ? (successfulReplications / totalReplications * 100).toFixed(1) 
      : null;

    return NextResponse.json({
      replication,
      stats: {
        total: totalReplications,
        successful: successfulReplications,
        failed: totalReplications - successfulReplications,
        rate: replicationRate ? `${replicationRate}%` : null,
      },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey);

type ValidationType = 'MATHEMATICAL_PROOF' | 'COMPUTATIONAL_REPLICATION' | 'EXPERT_REVIEW' | 'REFUTATION_ATTEMPT';

// GET /api/validations - List validations (optionally filter by paper)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paperId = searchParams.get('paper_id');
  const typeParam = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('validations')
    .select('*, papers(id, title, slug), authors!validator_id(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (paperId) {
    query = query.eq('paper_id', paperId);
  }

  if (typeParam) {
    query = query.eq('type', typeParam as ValidationType);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    validations: data,
    total: count,
    limit,
    offset,
  });
}

// POST /api/validations - Submit a new validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paper_id, validator_id, type, result, notes } = body;

    if (!paper_id || !validator_id || !type || !result) {
      return NextResponse.json(
        { error: 'Missing required fields: paper_id, validator_id, type, result' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['MATHEMATICAL_PROOF', 'COMPUTATIONAL_REPLICATION', 'EXPERT_REVIEW', 'REFUTATION_ATTEMPT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate result
    const validResults = ['CONFIRMED', 'DISPUTED', 'FAILED'];
    if (!validResults.includes(result)) {
      return NextResponse.json(
        { error: `Invalid result. Must be one of: ${validResults.join(', ')}` },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    // Check if paper exists and is in a reviewable state
    const { data: paper } = await serviceClient
      .from('papers')
      .select('id, status, validation_score')
      .eq('id', paper_id)
      .single();

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    if (paper.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot validate a draft paper' },
        { status: 400 }
      );
    }

    // Insert validation
    const insertData = {
      paper_id,
      validator_id,
      type,
      result,
      notes: notes || null,
    };
    
    const { data: validation, error } = await serviceClient
      .from('validations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update paper validation score
    // Score calculation: +1 for CONFIRMED, -1 for DISPUTED, 0 for FAILED
    const scoreChange = result === 'CONFIRMED' ? 1 : result === 'DISPUTED' ? -1 : 0;
    const newScore = (paper.validation_score || 0) + scoreChange;

    // If multiple disputes, mark paper as DISPUTED
    const { count: disputeCount } = await serviceClient
      .from('validations')
      .select('*', { count: 'exact', head: true })
      .eq('paper_id', paper_id)
      .eq('result', 'DISPUTED');

    const updates: Record<string, unknown> = {
      validation_score: newScore,
      updated_at: new Date().toISOString(),
    };

    // Mark as disputed if 2+ disputes
    if ((disputeCount || 0) >= 2 && paper.status === 'PUBLISHED') {
      updates.status = 'DISPUTED';
    }

    await serviceClient
      .from('papers')
      .update(updates)
      .eq('id', paper_id);

    return NextResponse.json({ validation }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

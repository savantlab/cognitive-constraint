import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paperId } = await params;
    
    // Check if user is authenticated
    const cookieStore = await cookies();
    const accessCookie = cookieStore.get('ccj_access');
    
    if (!accessCookie?.value) {
      return NextResponse.json(
        { error: 'Authentication required to validate papers' },
        { status: 401 }
      );
    }

    // Decode email from cookie
    let email: string;
    try {
      const decoded = Buffer.from(accessCookie.value, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      email = parts[0] || '';
      if (!email) throw new Error('No email found');
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Check if user has already validated this paper
    const { data: existingValidation } = await supabase
      .from('validations')
      .select('id')
      .eq('paper_id', paperId)
      .eq('validator_email', email)
      .single();

    if (existingValidation) {
      return NextResponse.json(
        { error: 'You have already validated this paper' },
        { status: 400 }
      );
    }

    // Add validation
    const { error } = await supabase
      .from('validations')
      .insert({
        paper_id: paperId,
        validator_email: email,
      });

    if (error) {
      console.error('Error inserting validation:', error);
      return NextResponse.json(
        { error: 'Failed to add validation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Validation added',
    });
  } catch (error) {
    console.error('Error validating paper:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

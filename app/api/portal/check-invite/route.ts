import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is in invitations table and invite was sent
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', normalizedEmail)
      .not('invite_sent_at', 'is', null)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'This email is not invited to the portal' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      role: invitation.role,
      institution: invitation.institution,
    });
  } catch (error) {
    console.error('Error checking invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

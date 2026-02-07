import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify the code
    const { data: accessCode, error: codeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code.toUpperCase())
      .single();

    if (codeError || !accessCode) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      );
    }

    // Check if code is expired (15 minutes)
    const codeAge = Date.now() - new Date(accessCode.created_at).getTime();
    if (codeAge > 15 * 60 * 1000) {
      // Delete expired code
      await supabase
        .from('access_codes')
        .delete()
        .eq('id', accessCode.id);

      return NextResponse.json(
        { error: 'Code has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Get invitation to confirm role
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'This email is not invited to the portal' },
        { status: 403 }
      );
    }

    // Mark invitation as accepted if not already
    if (!invitation.accepted_at) {
      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      // Create or update user record
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          email: normalizedEmail,
          role: invitation.role,
          institution: invitation.institution,
        }, {
          onConflict: 'email',
        });

      if (userError) {
        console.error('Error creating user:', userError);
      }
    }

    // Delete used code
    await supabase
      .from('access_codes')
      .delete()
      .eq('id', accessCode.id);

    // Set portal cookie with user info
    const cookieStore = await cookies();
    const portalSession = {
      email: normalizedEmail,
      role: invitation.role,
      institution: invitation.institution,
    };

    cookieStore.set('ccj_portal', JSON.stringify(portalSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      role: invitation.role,
    });
  } catch (error) {
    console.error('Error verifying portal access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

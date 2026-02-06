import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    const normalizedCode = code.toUpperCase().trim();

    // Find the code
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', normalizedCode)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      );
    }

    // Mark as verified
    await supabase
      .from('access_codes')
      .update({ verified: true })
      .eq('id', data.id);

    // Track reader - upsert to readers table
    const userAgent = request.headers.get('user-agent') || '';
    const { data: existingReader } = await supabase
      .from('readers')
      .select('id, access_count')
      .eq('email', normalizedEmail)
      .single();

    if (existingReader) {
      // Update existing reader
      await supabase
        .from('readers')
        .update({
          last_access_at: new Date().toISOString(),
          access_count: (existingReader.access_count || 0) + 1,
          user_agent: userAgent,
        })
        .eq('id', existingReader.id);
    } else {
      // Create new reader
      await supabase
        .from('readers')
        .insert({
          email: normalizedEmail,
          user_agent: userAgent,
        });
    }

    // Set a cookie to track verification
    const cookieStore = await cookies();
    const accessToken = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString('base64');
    
    cookieStore.set('ccj_access', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 48, // 48 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Access granted',
    });
  } catch (error) {
    console.error('Error verifying key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

interface PortalSession {
  email: string;
  role: string;
  institution: string;
}

async function getPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const portalCookie = cookieStore.get('ccj_portal');
  
  if (!portalCookie) return null;
  
  try {
    return JSON.parse(portalCookie.value);
  } catch {
    return null;
  }
}

// GET - get user profile
export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user record
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Also get author record if exists (for ORCID, bio)
    const { data: author } = await supabase
      .from('authors')
      .select('orcid, bio')
      .eq('email', session.email)
      .single();

    return NextResponse.json({
      profile: {
        ...user,
        orcid: author?.orcid || null,
        bio: author?.bio || null,
      },
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, institution, orcid, bio } = await request.json();

    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        name,
        institution,
      })
      .eq('email', session.email);

    if (userError) {
      console.error('Error updating user:', userError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Update or create author record if orcid or bio provided
    if (orcid !== undefined || bio !== undefined) {
      const { data: existingAuthor } = await supabase
        .from('authors')
        .select('id')
        .eq('email', session.email)
        .single();

      if (existingAuthor) {
        await supabase
          .from('authors')
          .update({ orcid, bio })
          .eq('email', session.email);
      } else if (name) {
        await supabase
          .from('authors')
          .insert({
            email: session.email,
            name,
            orcid,
            bio,
          });
      }
    }

    // Update session cookie with new institution
    if (institution !== undefined) {
      const cookieStore = await cookies();
      const updatedSession = {
        ...session,
        institution: institution || session.institution,
      };
      cookieStore.set('ccj_portal', JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

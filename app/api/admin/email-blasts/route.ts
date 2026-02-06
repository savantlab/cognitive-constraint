import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/admin/email-blasts - List all email blasts
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_blasts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching email blasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email blasts' },
      { status: 500 }
    );
  }

  return NextResponse.json({ blasts: data });
}

// POST /api/admin/email-blasts - Create a new email blast
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const { subject, html_content, recipient_type, custom_emails, paper_id, scheduled_for, status } = body;

    if (!subject || !html_content) {
      return NextResponse.json(
        { error: 'Subject and HTML content are required' },
        { status: 400 }
      );
    }

    // Calculate recipient count
    let recipientCount = 0;
    if (recipient_type === 'custom' && custom_emails) {
      recipientCount = custom_emails.length;
    } else {
      // Count users based on recipient type
      let query = supabase.from('users').select('id', { count: 'exact' });
      if (recipient_type === 'reviewers') {
        query = query.eq('role', 'reviewer');
      } else if (recipient_type === 'authors') {
        query = query.eq('role', 'author');
      }
      const { count } = await query;
      recipientCount = count || 0;
    }

    const { data, error } = await supabase
      .from('email_blasts')
      .insert({
        subject,
        html_content,
        recipient_type,
        custom_emails,
        paper_id,
        scheduled_for: scheduled_for || null,
        status: status || 'draft',
        recipient_count: recipientCount,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating email blast:', error);
      return NextResponse.json(
        { error: 'Failed to create email blast' },
        { status: 500 }
      );
    }

    return NextResponse.json({ blast: data }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

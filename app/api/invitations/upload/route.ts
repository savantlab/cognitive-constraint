import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseCSV(text: string): { email: string; institution: string; role: string }[] {
  const lines = text.trim().split('\n');
  const results: { email: string; institution: string; role: string }[] = [];

  // Skip header row if it looks like a header
  const startIndex = lines[0]?.toLowerCase().includes('email') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Handle both comma and semicolon separators
    const parts = trimmedLine.includes(';') ? trimmedLine.split(';') : trimmedLine.split(',');
    const email = parts[0]?.trim().toLowerCase();
    const institution = parts[1]?.trim() || '';
    const role = (parts[2]?.trim().toLowerCase() || 'reviewer');

    // Validate email
    if (email && email.includes('@')) {
      // Validate role
      const validRole = ['reviewer', 'author'].includes(role) ? role : 'reviewer';
      results.push({ email, institution, role: validRole });
    }
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const invitations = parseCSV(text);

    if (invitations.length === 0) {
      return NextResponse.json(
        { error: 'No valid emails found in CSV' },
        { status: 400 }
      );
    }

    // Get existing emails to avoid duplicates
    const { data: existing } = await supabase
      .from('invitations')
      .select('email');

    const existingEmails = new Set((existing || []).map(e => e.email));

    // Filter out duplicates
    const newInvitations = invitations.filter(i => !existingEmails.has(i.email));

    if (newInvitations.length === 0) {
      return NextResponse.json(
        { error: 'All emails already exist in the system' },
        { status: 400 }
      );
    }

    // Insert new invitations
    const { error } = await supabase
      .from('invitations')
      .insert(newInvitations.map(i => ({
        email: i.email,
        institution: i.institution,
        role: i.role,
      })));

    if (error) {
      console.error('Error inserting invitations:', error);
      return NextResponse.json(
        { error: 'Failed to save invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: newInvitations.length,
      skipped: invitations.length - newInvitations.length,
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

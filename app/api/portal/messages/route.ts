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

// GET - get user's message threads
export async function GET() {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isReviewer = session.role === 'reviewer';

    // Get user/author ID
    let threads = [];

    if (isReviewer) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.email)
        .single();

      if (user) {
        const { data } = await supabase
          .from('review_threads')
          .select(`
            *,
            paper:papers (id, title),
            author:authors (id, name, email),
            messages:review_messages (id, content, sender_type, is_read, created_at)
          `)
          .eq('reviewer_id', user.id)
          .order('updated_at', { ascending: false });
        
        threads = data || [];
      }
    } else {
      const { data: author } = await supabase
        .from('authors')
        .select('id')
        .eq('email', session.email)
        .single();

      if (author) {
        const { data } = await supabase
          .from('review_threads')
          .select(`
            *,
            paper:papers (id, title),
            reviewer:users (id, name, email),
            messages:review_messages (id, content, sender_type, is_read, created_at)
          `)
          .eq('author_id', author.id)
          .order('updated_at', { ascending: false });
        
        threads = data || [];
      }
    }

    // Count unread messages
    const unreadCount = threads.reduce((count, thread) => {
      const unread = thread.messages?.filter((m: { is_read: boolean; sender_type: string }) => 
        !m.is_read && m.sender_type !== (isReviewer ? 'reviewer' : 'author')
      ).length || 0;
      return count + unread;
    }, 0);

    return NextResponse.json({ threads, unreadCount });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - send a message in a thread
export async function POST(request: NextRequest) {
  try {
    const session = await getPortalSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId, content, messageType } = await request.json();

    if (!threadId || !content) {
      return NextResponse.json({ error: 'Thread ID and content required' }, { status: 400 });
    }

    const isReviewer = session.role === 'reviewer';

    // Get sender ID
    let senderId;
    if (isReviewer) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.email)
        .single();
      senderId = user?.id;
    } else {
      const { data: author } = await supabase
        .from('authors')
        .select('id')
        .eq('email', session.email)
        .single();
      senderId = author?.id;
    }

    if (!senderId) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    // Verify thread access
    const { data: thread } = await supabase
      .from('review_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Create message
    const { data: message, error } = await supabase
      .from('review_messages')
      .insert({
        thread_id: threadId,
        sender_type: isReviewer ? 'reviewer' : 'author',
        sender_id: senderId,
        content,
        message_type: messageType || 'general',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update thread timestamp
    await supabase
      .from('review_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

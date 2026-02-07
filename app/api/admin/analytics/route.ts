import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30'; // days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(range));

  try {
    // Get readers (end-users who verified access)
    const { data: readers, error: readersError } = await supabase
      .from('readers')
      .select('*')
      .order('last_access_at', { ascending: false });

    if (readersError) {
      console.error('Readers error:', readersError);
      throw readersError;
    }

    // Get invited users (reviewers/authors from users table)
    const { data: invitedUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Get invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('*')
      .order('invited_at', { ascending: false });

    if (invitationsError) throw invitationsError;

    // Get page views for the date range
    const { data: pageViews, error: viewsError } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (viewsError) throw viewsError;

    // Get daily stats
    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (statsError) throw statsError;

    // Aggregate stats
    const totalReaders = readers?.length || 0;
    const totalInvitedUsers = invitedUsers?.length || 0;
    const totalInvitations = invitations?.length || 0;
    const acceptedInvitations = invitations?.filter(i => i.accepted_at)?.length || 0;

    // Group page views by date for chart
    const viewsByDate: Record<string, number> = {};
    pageViews?.forEach(view => {
      const date = view.created_at.split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    // Fill in missing dates
    const chartData: { date: string; views: number; uniqueVisitors: number; newReaders: number }[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0] as string;
      const stat = dailyStats?.find(s => s.date === dateStr);
      chartData.push({
        date: dateStr,
        views: stat?.total_views || viewsByDate[dateStr] || 0,
        uniqueVisitors: stat?.unique_visitors || 0,
        newReaders: stat?.new_readers || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Reader stats breakdown
    const readersWithStats = readers?.map(reader => ({
      id: reader.id,
      email: reader.email,
      firstAccess: reader.first_access_at,
      lastAccess: reader.last_access_at,
      accessCount: reader.access_count,
      papersViewed: reader.papers_viewed || 0,
      deviceType: getDeviceType(reader.user_agent),
    })) || [];

    return NextResponse.json({
      summary: {
        totalReaders,
        totalInvitedUsers,
        totalInvitations,
        acceptedInvitations,
        pendingInvitations: totalInvitations - acceptedInvitations,
      },
      chartData,
      readers: readersWithStats,
      invitedUsers: invitedUsers?.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
      })) || [],
      invitations: invitations?.map(i => ({
        id: i.id,
        email: i.email,
        institution: i.institution,
        invitedAt: i.invited_at,
        acceptedAt: i.accepted_at,
        status: i.accepted_at ? 'accepted' : 'pending',
      })) || [],
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}

function getDeviceType(userAgent: string | null): string {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}

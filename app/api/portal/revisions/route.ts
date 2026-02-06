import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

interface PortalSession {
  email: string;
  role: string;
}

async function getSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const portal = cookieStore.get("ccj_portal");
  if (!portal) return null;
  try {
    return JSON.parse(portal.value);
  } catch {
    return null;
  }
}

// GET - Fetch revisions for a paper
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paperId = request.nextUrl.searchParams.get("paperId");

  const supabase = getSupabase();

  // Get user
  const { data: user } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", session.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let query = supabase
    .from("paper_revisions")
    .select(`
      id,
      paper_id,
      version_number,
      file_url,
      cover_letter,
      status,
      created_at,
      reviewer_feedback,
      papers!inner (
        id,
        title,
        author_id
      )
    `)
    .order("version_number", { ascending: false });

  if (paperId) {
    query = query.eq("paper_id", paperId);
  }

  // Filter based on role - authors see their own, reviewers see assigned
  if (session.role === "author") {
    query = query.eq("papers.author_id", user.id);
  } else if (session.role === "reviewer") {
    // Get papers assigned to this reviewer
    const { data: assignments } = await supabase
      .from("paper_reviewers")
      .select("paper_id")
      .eq("reviewer_id", user.id);

    const assignedPaperIds = assignments?.map((a) => a.paper_id) || [];
    if (assignedPaperIds.length === 0) {
      return NextResponse.json({ revisions: [] });
    }
    query = query.in("paper_id", assignedPaperIds);
  }

  const { data: revisions, error } = await query;

  if (error) {
    console.error("Error fetching revisions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revisions: revisions || [] });
}

// POST - Submit a new revision
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { paperId, fileUrl, coverLetter } = body;

  if (!paperId || !fileUrl) {
    return NextResponse.json(
      { error: "Paper ID and file URL are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Get user
  const { data: user } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", session.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify user owns this paper (if author)
  const { data: paper } = await supabase
    .from("papers")
    .select("id, author_id, title")
    .eq("id", paperId)
    .single();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  if (session.role === "author" && paper.author_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Get latest version number
  const { data: latestRevision } = await supabase
    .from("paper_revisions")
    .select("version_number")
    .eq("paper_id", paperId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latestRevision?.version_number || 0) + 1;

  // Create new revision
  const { data: revision, error } = await supabase
    .from("paper_revisions")
    .insert({
      paper_id: paperId,
      version_number: nextVersion,
      file_url: fileUrl,
      cover_letter: coverLetter || null,
      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating revision:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update paper's current revision
  await supabase
    .from("papers")
    .update({ current_revision_id: revision.id })
    .eq("id", paperId);

  return NextResponse.json({ revision });
}

// PUT - Update revision (for reviewer feedback)
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { revisionId, status, reviewerFeedback } = body;

  if (!revisionId) {
    return NextResponse.json(
      { error: "Revision ID is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Get user
  const { data: user } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", session.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only reviewers can update revision status/feedback
  if (session.role !== "reviewer") {
    return NextResponse.json(
      { error: "Only reviewers can update revisions" },
      { status: 403 }
    );
  }

  // Verify reviewer is assigned to this paper
  const { data: revision } = await supabase
    .from("paper_revisions")
    .select("paper_id")
    .eq("id", revisionId)
    .single();

  if (!revision) {
    return NextResponse.json({ error: "Revision not found" }, { status: 404 });
  }

  const { data: assignment } = await supabase
    .from("paper_reviewers")
    .select("id")
    .eq("paper_id", revision.paper_id)
    .eq("reviewer_id", user.id)
    .single();

  if (!assignment) {
    return NextResponse.json(
      { error: "Not assigned to this paper" },
      { status: 403 }
    );
  }

  // Update revision
  const updateData: Record<string, string> = {};
  if (status) updateData.status = status;
  if (reviewerFeedback) updateData.reviewer_feedback = reviewerFeedback;

  const { data: updated, error } = await supabase
    .from("paper_revisions")
    .update(updateData)
    .eq("id", revisionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating revision:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revision: updated });
}

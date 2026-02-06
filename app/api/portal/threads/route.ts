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

// POST - Create a new thread (author contacting editor or reviewer contacting author)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { paperId, initialMessage } = body;

  if (!paperId) {
    return NextResponse.json({ error: "Paper ID is required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Get current user
  const { data: user } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", session.email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get paper details
  const { data: paper } = await supabase
    .from("papers")
    .select("id, title, author_id")
    .eq("id", paperId)
    .single();

  if (!paper) {
    return NextResponse.json({ error: "Paper not found" }, { status: 404 });
  }

  let reviewerId: string;
  let authorId: string;

  if (session.role === "author") {
    // Author wants to contact an assigned reviewer
    // Find the lead editor or first assigned reviewer
    const { data: assignment } = await supabase
      .from("paper_reviewers")
      .select("reviewer_id")
      .eq("paper_id", paperId)
      .eq("can_communicate", true)
      .order("is_lead_editor", { ascending: false })
      .limit(1)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: "No editor assigned to this paper yet" },
        { status: 400 }
      );
    }

    authorId = user.id;
    reviewerId = assignment.reviewer_id;
  } else if (session.role === "reviewer") {
    // Reviewer wants to contact author
    // Verify they're assigned to this paper
    const { data: assignment } = await supabase
      .from("paper_reviewers")
      .select("id")
      .eq("paper_id", paperId)
      .eq("reviewer_id", user.id)
      .eq("can_communicate", true)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: "You are not assigned to this paper" },
        { status: 403 }
      );
    }

    reviewerId = user.id;
    authorId = paper.author_id;
  } else {
    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  }

  // Check if thread already exists
  const { data: existingThread } = await supabase
    .from("review_threads")
    .select("id")
    .eq("paper_id", paperId)
    .eq("reviewer_id", reviewerId)
    .eq("author_id", authorId)
    .single();

  let threadId: string;

  if (existingThread) {
    threadId = existingThread.id;
  } else {
    // Create new thread
    const { data: newThread, error: threadError } = await supabase
      .from("review_threads")
      .insert({
        paper_id: paperId,
        reviewer_id: reviewerId,
        author_id: authorId,
        subject: `Discussion: ${paper.title}`,
        status: "active",
      })
      .select("id")
      .single();

    if (threadError) {
      console.error("Error creating thread:", threadError);
      return NextResponse.json(
        { error: "Failed to create thread" },
        { status: 500 }
      );
    }
    threadId = newThread.id;
  }

  // If initial message provided, send it
  if (initialMessage) {
    const { error: msgError } = await supabase.from("review_messages").insert({
      thread_id: threadId,
      sender_id: user.id,
      sender_type: session.role,
      content: initialMessage,
      message_type: "feedback",
    });

    if (msgError) {
      console.error("Error sending initial message:", msgError);
    }
  }

  return NextResponse.json({ threadId, success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/app/lib/admin-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

// POST - Assign a reviewer to a proposal and create communication thread
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: proposalId } = await params;
  const body = await request.json();
  const { reviewerId, isLeadEditor } = body;

  if (!reviewerId) {
    return NextResponse.json(
      { error: "Reviewer ID is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Get the reviewer's email
  const { data: reviewer, error: reviewerError } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", reviewerId)
    .single();

  if (reviewerError || !reviewer) {
    return NextResponse.json({ error: "Reviewer not found" }, { status: 404 });
  }

  // Get the proposal to find the author
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("id, title, author_id")
    .eq("id", proposalId)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Check if a paper exists for this proposal, if not create one
  let paperId: string;
  const { data: existingPaper } = await supabase
    .from("papers")
    .select("id")
    .eq("proposal_id", proposalId)
    .single();

  if (existingPaper) {
    paperId = existingPaper.id;
  } else {
    // Create a paper for this proposal
    const { data: newPaper, error: paperError } = await supabase
      .from("papers")
      .insert({
        title: proposal.title,
        author_id: proposal.author_id,
        proposal_id: proposalId,
        status: "under_review",
      })
      .select("id")
      .single();

    if (paperError) {
      console.error("Error creating paper:", paperError);
      return NextResponse.json(
        { error: "Failed to create paper" },
        { status: 500 }
      );
    }
    paperId = newPaper.id;
  }

  // Assign the reviewer to the paper
  const { error: assignError } = await supabase.from("paper_reviewers").upsert(
    {
      paper_id: paperId,
      reviewer_id: reviewerId,
      reviewer_email: reviewer.email,
      is_lead_editor: isLeadEditor || false,
      can_communicate: true,
      status: "assigned",
      invited_at: new Date().toISOString(),
    },
    {
      onConflict: "paper_id,reviewer_email",
    }
  );

  if (assignError) {
    console.error("Error assigning reviewer:", assignError);
    return NextResponse.json(
      { error: "Failed to assign reviewer" },
      { status: 500 }
    );
  }

  // Check if a thread already exists between this reviewer and author for this paper
  const { data: existingThread } = await supabase
    .from("review_threads")
    .select("id")
    .eq("paper_id", paperId)
    .eq("reviewer_id", reviewerId)
    .eq("author_id", proposal.author_id)
    .single();

  if (!existingThread) {
    // Create a new communication thread
    const { error: threadError } = await supabase.from("review_threads").insert({
      paper_id: paperId,
      reviewer_id: reviewerId,
      author_id: proposal.author_id,
      subject: `Review: ${proposal.title}`,
      status: "active",
    });

    if (threadError) {
      console.error("Error creating thread:", threadError);
      // Don't fail the whole operation, just log it
    }
  }

  // Update proposal status if still submitted
  const { data: currentProposal } = await supabase
    .from("proposals")
    .select("status")
    .eq("id", proposalId)
    .single();

  if (currentProposal?.status === "submitted") {
    await supabase
      .from("proposals")
      .update({ status: "under_review" })
      .eq("id", proposalId);
  }

  return NextResponse.json({
    success: true,
    paperId,
    message: "Reviewer assigned and communication thread created",
  });
}

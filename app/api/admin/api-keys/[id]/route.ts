import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/admin-auth";
import { revokeApiKey } from "@/app/lib/api-auth";

// DELETE /api/admin/api-keys/[id] - Revoke an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await revokeApiKey(id);

  if (!success) {
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

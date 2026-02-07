import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
} from "@/app/lib/api-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// POST /api/auth/token - Get access token (login or refresh)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, email, refresh_token } = body;

    // Refresh token grant
    if (grant_type === "refresh_token") {
      if (!refresh_token) {
        return NextResponse.json(
          { error: "refresh_token is required" },
          { status: 400 }
        );
      }

      const result = await validateRefreshToken(refresh_token);
      if (!result.valid) {
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        );
      }

      // Get user info
      const { data: user } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("id", result.userId)
        .single();

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 401 }
        );
      }

      const accessToken = await generateAccessToken(
        user.id,
        user.email,
        user.role
      );

      return NextResponse.json({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: 900, // 15 minutes
      });
    }

    // Email grant (for initial login - sends magic link or returns tokens for invited users)
    if (grant_type === "email") {
      if (!email) {
        return NextResponse.json(
          { error: "email is required" },
          { status: 400 }
        );
      }

      // Check if user exists
      const { data: user } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", email.toLowerCase())
        .single();

      if (!user) {
        return NextResponse.json(
          { error: "User not found. Contact admin for access." },
          { status: 401 }
        );
      }

      // Generate tokens
      const accessToken = await generateAccessToken(
        user.id,
        user.email,
        user.role
      );

      const ipAddress = request.headers.get("x-forwarded-for") || 
                        request.headers.get("x-real-ip") || 
                        "unknown";
      const deviceInfo = request.headers.get("user-agent") || "unknown";

      const refreshToken = await generateRefreshToken(
        user.id,
        deviceInfo,
        ipAddress
      );

      return NextResponse.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 900,
      });
    }

    return NextResponse.json(
      { error: "Invalid grant_type. Use 'email' or 'refresh_token'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/token - Revoke refresh token (logout)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: "refresh_token is required" },
        { status: 400 }
      );
    }

    await revokeRefreshToken(refresh_token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

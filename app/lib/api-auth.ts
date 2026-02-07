import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// ============ API Key Functions ============

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const prefix = "ccj_live_";
  const randomPart = randomBytes(24).toString("base64url");
  const key = `${prefix}${randomPart}`;
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  keyId?: string;
  scopes?: string[];
  error?: string;
}> {
  if (!key) {
    return { valid: false, error: "No API key provided" };
  }

  const hash = hashApiKey(key);

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, scopes, expires_at, revoked_at, rate_limit")
    .eq("key_hash", hash)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid API key" };
  }

  if (data.revoked_at) {
    return { valid: false, error: "API key has been revoked" };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "API key has expired" };
  }

  // Update last_used_at
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { valid: true, keyId: data.id, scopes: data.scopes };
}

export async function createApiKey(
  name: string,
  scopes: string[] = [],
  expiresAt?: Date
): Promise<{ key: string; id: string } | null> {
  const { key, hash, prefix } = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      name,
      key_hash: hash,
      key_prefix: prefix,
      scopes,
      expires_at: expiresAt?.toISOString() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create API key:", error);
    return null;
  }

  return { key, id: data.id };
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId);

  return !error;
}

export async function logApiUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  ipAddress?: string
): Promise<void> {
  await supabase.from("api_key_usage").insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
    ip_address: ipAddress,
  });
}

// ============ JWT Functions ============

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function generateAccessToken(
  userId: string,
  email: string,
  role: string = "user"
): Promise<string> {
  const token = await new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("15m") // Short-lived access token
    .sign(JWT_SECRET);

  return token;
}

export async function generateRefreshToken(
  userId: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 day refresh token

  await supabase.from("refresh_tokens").insert({
    user_id: userId,
    token_hash: hash,
    device_info: deviceInfo,
    ip_address: ipAddress,
    expires_at: expiresAt.toISOString(),
  });

  return token;
}

export async function validateAccessToken(token: string): Promise<{
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      valid: true,
      payload: payload as unknown as JWTPayload,
    };
  } catch (error) {
    return { valid: false, error: "Invalid or expired token" };
  }
}

export async function validateRefreshToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  const hash = createHash("sha256").update(token).digest("hex");

  const { data, error } = await supabase
    .from("refresh_tokens")
    .select("user_id, expires_at, revoked_at")
    .eq("token_hash", hash)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid refresh token" };
  }

  if (data.revoked_at) {
    return { valid: false, error: "Refresh token has been revoked" };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "Refresh token has expired" };
  }

  return { valid: true, userId: data.user_id };
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  const hash = createHash("sha256").update(token).digest("hex");

  const { error } = await supabase
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", hash);

  return !error;
}

export async function revokeAllUserTokens(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("revoked_at", null);

  return !error;
}

// ============ Middleware Helpers ============

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export function hasScope(userScopes: string[], requiredScope: string): boolean {
  // Check for exact match or wildcard
  return userScopes.some(
    (scope) =>
      scope === requiredScope ||
      scope === "*" ||
      (scope.endsWith(":*") &&
        requiredScope.startsWith(scope.slice(0, -1)))
  );
}

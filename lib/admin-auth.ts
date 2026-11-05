
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "ek_admin_session";

const SESSION_DURATION = 7 * 24 * 60 * 60;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be at least 32 characters"
    );
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

function safeCompare(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) return false;

  return timingSafeEqual(first, second);
}

export function verifyAdminPassword(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword || !password) return false;

  return safeCompare(password, expectedPassword);
}

export function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const signature = sign(String(expiresAt));

  return `${expiresAt}.${signature}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) return false;

  try {
    const [expiresAt, signature] = token.split(".");

    if (!expiresAt || !signature) return false;

    const expiry = Number(expiresAt);

    if (!Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
      return false;
    }

    const expectedSignature = sign(expiresAt);

    return safeCompare(signature, expectedSignature);
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Please login first.",
      },
      { status: 401 }
    );
  }

  return null;
}

export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION;

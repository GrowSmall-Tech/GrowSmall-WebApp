/**
 * Edge-safe admin session tokens (HMAC-SHA256).
 * Signing material uses ADMIN_EMAIL + ADMIN_PASSWORD (server-only).
 */

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_VERSION = 1 as const;
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export type AdminSessionPayload = {
  v: typeof SESSION_VERSION;
  exp: number;
};

function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(data: string): string {
  const pad = data.length % 4 === 0 ? "" : "=".repeat(4 - (data.length % 4));
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return atob(b64);
}

function hexFromBuffer(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bufferFromHex(hex: string): ArrayBuffer {
  const pairs = hex.match(/.{1,2}/g);
  if (!pairs) return new ArrayBuffer(0);
  return new Uint8Array(pairs.map((b) => Number.parseInt(b, 16))).buffer;
}

async function importHmacKey(secretMaterial: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(secretMaterial);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function getSecretMaterial(): string {
  const email = process.env.ADMIN_EMAIL ?? process.env.ADMIN_ID ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return `${email}:${password}:growsmall-admin-v${SESSION_VERSION}`;
}

export async function createAdminSessionToken(): Promise<string> {
  const payload: AdminSessionPayload = {
    v: SESSION_VERSION,
    exp: Date.now() + MAX_AGE_SEC * 1000,
  };
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const key = await importHmacKey(getSecretMaterial());
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadStr),
  );
  return `${payloadStr}.${hexFromBuffer(sig)}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadStr, sigHex] = parts;
  if (!payloadStr || !sigHex) return false;

  let key: CryptoKey;
  try {
    key = await importHmacKey(getSecretMaterial());
  } catch {
    return false;
  }

  let sigBuf: ArrayBuffer;
  try {
    sigBuf = bufferFromHex(sigHex);
  } catch {
    return false;
  }

  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBuf,
    new TextEncoder().encode(payloadStr),
  );
  if (!ok) return false;

  let parsed: AdminSessionPayload;
  try {
    parsed = JSON.parse(base64UrlDecode(payloadStr)) as AdminSessionPayload;
  } catch {
    return false;
  }

  if (parsed.v !== SESSION_VERSION) return false;
  if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return false;
  return true;
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

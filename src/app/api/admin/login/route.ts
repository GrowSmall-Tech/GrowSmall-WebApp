import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin/session";

function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Admin authentication is not configured." },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (
    !safeEqualString(email, adminEmail) ||
    !safeEqualString(password, adminPassword)
  ) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return res;
}

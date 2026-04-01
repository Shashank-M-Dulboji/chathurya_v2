// app/auth/callback/route.ts
// Supabase redirects here after email confirmation / invite link click.
// Exchanges the code for a session then sends user to complete-signup or dashboard.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_code`);
  }

  // Check if this user already has a member record
  const { data: existingMember } = await supabase
    .from("members")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (existingMember) {
    // Already onboarded → go to dashboard
    return NextResponse.redirect(`${origin}/portal/dashboard`);
  }

  // New member via invite → complete signup
  // Pass uid from user metadata if present (set during invite)
  const uid = data.user.user_metadata?.uid ?? "";
  const token = data.user.user_metadata?.invite_token ?? "";

  return NextResponse.redirect(
    `${origin}/auth/complete-signup?uid=${uid}&token=${token}`
  );
}

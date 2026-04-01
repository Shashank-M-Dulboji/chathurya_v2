// app/api/admin/invite/route.ts
// Edge Route: Generate invite tokens + send emails (leads only)

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateUID } from "@/lib/utils";

// POST /api/admin/invite — single invite or bulk from CSV rows
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || !["Lead", "Core"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { emails, name }: { emails: string[]; name?: string } = body;

  if (!emails?.length) {
    return NextResponse.json({ error: "emails required" }, { status: 400 });
  }

  const results = [];

  for (const email of emails) {
    const token = generateUID(24); // Long secure token for invite links
    const uid = generateUID(6);    // Short NFC UID

    // Insert invite token
    const { error: tokenError } = await supabase
      .from("invite_tokens")
      .insert({
        token,
        email: email.toLowerCase(),
        created_by: user.id,
      });

    if (tokenError) {
      results.push({ email, status: "error", message: tokenError.message });
      continue;
    }

    // Send invite email via Supabase Auth invite
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: { invite_token: token, uid },
      }
    );

    if (inviteError) {
      results.push({ email, status: "error", message: inviteError.message });
    } else {
      results.push({ email, status: "sent", token, uid });
    }
  }

  return NextResponse.json({ results });
}

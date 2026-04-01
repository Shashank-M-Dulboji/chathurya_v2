// app/api/admin/nfc-redirect/route.ts
// Leads can instantly change where ALL cards redirect

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET — fetch current redirect target
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_config")
    .select("value, updated_at")
    .eq("key", "nfc_redirect_override")
    .single();

  return NextResponse.json({ target: data?.value ?? null, updatedAt: data?.updated_at });
}

// POST — set or clear redirect target
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members").select("role").eq("id", user.id).single();

  if (!member || !["Lead", "Core"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { target } = await req.json();
  // target = null to reset to member profiles, or a URL string to override

  const { error } = await supabase
    .from("site_config")
    .update({
      value: target ?? null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "nfc_redirect_override");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    target: target ?? null,
    message: target
      ? `All NFC cards now redirect to: ${target}`
      : "NFC cards restored to member profiles",
  });
}

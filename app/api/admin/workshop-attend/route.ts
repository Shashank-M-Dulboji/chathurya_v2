// app/api/admin/workshop-attend/route.ts
// Called from admin panel to flip all NFC cards to point to the attendance check-in page

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members").select("role").eq("id", user.id).single();
  if (!member || !["Lead", "Core"].includes(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workshopId, activate } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chathurya.vercel.app";

  const target = activate ? `${appUrl}/attend/${workshopId}` : null;

  await supabase.from("site_config")
    .update({ value: target, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("key", "nfc_redirect_override");

  return NextResponse.json({
    success: true,
    message: activate
      ? `NFC cards now redirect to attendance check-in`
      : `NFC cards restored to member profiles`,
    target,
  });
}

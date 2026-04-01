import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = { title: "Admin — Chathurya" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: me } = await supabase
    .from("members")
    .select("id, uid, full_name, role")
    .eq("id", user.id)
    .single();

  if (!me || !["Lead", "Core"].includes(me.role)) redirect("/portal/dashboard");

  // All members with profiles
  const { data: members } = await supabase
    .from("members")
    .select("id, uid, full_name, email, role, batch_year, is_active, created_at, profiles(xp_total, avatar_url, archetype_primary, streak_count)")
    .order("created_at", { ascending: false });

  // Current NFC redirect setting
  const { data: nfcConfig } = await supabase
    .from("site_config")
    .select("value, updated_at")
    .eq("key", "nfc_redirect_override")
    .single();

  return (
    <AdminClient
      me={me}
      members={members ?? []}
      nfcRedirect={nfcConfig?.value ?? null}
    />
  );
}

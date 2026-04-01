import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import NFCCardClient from "./NFCCardClient";

export const metadata: Metadata = { title: "My NFC Card" };

export default async function NFCCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, uid, full_name, role, batch_year, profiles(avatar_url, xp_total, archetype_primary)")
    .eq("id", user.id)
    .single();

  if (!member) redirect("/auth/login");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chathurya.vercel.app";
  const profileUrl = `${appUrl}/u/${member.uid}`;

  return <NFCCardClient member={member} profileUrl={profileUrl} />;
}

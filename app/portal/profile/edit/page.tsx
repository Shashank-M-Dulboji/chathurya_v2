import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ProfileEditClient from "./ProfileEditClient";

export const metadata: Metadata = { title: "Edit Profile" };

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: member } = await supabase
    .from("members")
    .select(`id, uid, full_name, role, batch_year, profiles(*)`)
    .eq("id", user.id)
    .single();

  if (!member) redirect("/auth/login");

  return <ProfileEditClient member={member} />;
}

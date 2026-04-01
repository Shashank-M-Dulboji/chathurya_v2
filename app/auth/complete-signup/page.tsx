import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CompleteSignupClient from "./CompleteSignupClient";

export const metadata: Metadata = { title: "Complete Your Profile — Chathurya" };

export default async function CompleteSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; token?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Must be logged in (Supabase session set by callback route)
  if (!user) redirect("/auth/login");

  // Already completed signup
  const { data: existing } = await supabase
    .from("members")
    .select("id, uid")
    .eq("id", user.id)
    .single();

  if (existing) redirect("/portal/dashboard");

  const params = await searchParams;

  return (
    <CompleteSignupClient
      userId={user.id}
      userEmail={user.email ?? ""}
      suggestedUid={params.uid ?? ""}
      inviteToken={params.token ?? ""}
    />
  );
}

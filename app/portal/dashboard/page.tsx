import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch member + profile data
  const { data: member } = await supabase
    .from("members")
    .select(`
      id, uid, full_name, role, batch_year,
      profiles (
        avatar_url, bio, visibility_mode,
        archetype_primary, xp_total, streak_count
      ),
      badges ( badge_type, badge_name, category, earned_at ),
      attendance ( workshop_id, checked_in_at, xp_earned )
    `)
    .eq("id", user.id)
    .single();

  if (!member) redirect("/auth/login");

  // Fetch leaderboard (top 10)
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select("member_id, xp_total, archetype_primary, members!inner(full_name, uid, role)")
    .order("xp_total", { ascending: false })
    .limit(10);

  // Find my rank
  const { count: myRank } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("xp_total", member.profiles?.xp_total ?? 0);

  return (
    <DashboardClient
      member={{
        id: member.id,
        uid: member.uid,
        fullName: member.full_name,
        role: member.role,
        batchYear: member.batch_year,
        avatarUrl: member.profiles?.avatar_url,
        bio: member.profiles?.bio,
        visibilityMode: member.profiles?.visibility_mode ?? "public",
        archetypePrimary: member.profiles?.archetype_primary,
        xpTotal: member.profiles?.xp_total ?? 0,
        streakCount: member.profiles?.streak_count ?? 0,
        badgeCount: member.badges?.length ?? 0,
        workshopsAttended: member.attendance?.length ?? 0,
        rank: (myRank ?? 0) + 1,
      }}
      leaderboard={leaderboard ?? []}
    />
  );
}

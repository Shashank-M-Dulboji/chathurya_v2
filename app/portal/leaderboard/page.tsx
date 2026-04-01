import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, uid, full_name, role, profiles(avatar_url, xp_total)")
    .eq("id", user.id)
    .single();

  if (!member) redirect("/auth/login");

  // Full leaderboard
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select(`
      member_id, xp_total, streak_count, archetype_primary, avatar_url,
      members!inner(full_name, uid, role, batch_year)
    `)
    .order("xp_total", { ascending: false })
    .limit(100);

  // My rank
  const { count: myRank } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("xp_total", member.profiles?.xp_total ?? 0);

  return (
    <LeaderboardClient
      currentUserId={user.id}
      currentUserRank={(myRank ?? 0) + 1}
      leaderboard={leaderboard ?? []}
      member={member}
    />
  );
}

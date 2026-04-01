import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import AttendClient from "./AttendClient";

interface Props {
  params: Promise<{ workshopId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workshopId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .select("title")
    .eq("id", workshopId)
    .single();
  return { title: data?.title ? `Check In — ${data.title}` : "Workshop Check-In" };
}

export default async function AttendPage({ params }: Props) {
  const { workshopId } = await params;
  const supabase = await createClient();

  // Fetch workshop
  const { data: workshop } = await supabase
    .from("workshops")
    .select("id, title, workshop_date, location, xp_reward, late_xp_reward, is_published")
    .eq("id", workshopId)
    .single();

  if (!workshop || !workshop.is_published) notFound();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  let member = null;
  let alreadyAttended = false;

  if (user) {
    const { data: m } = await supabase
      .from("members")
      .select("id, uid, full_name, profiles(xp_total, avatar_url)")
      .eq("id", user.id)
      .single();

    member = m;

    if (m) {
      const { data: existing } = await supabase
        .from("attendance")
        .select("id, checked_in_at, is_late, xp_earned")
        .eq("member_id", m.id)
        .eq("workshop_id", workshopId)
        .single();
      alreadyAttended = !!existing;
    }
  }

  return (
    <AttendClient
      workshop={workshop}
      member={member}
      alreadyAttended={alreadyAttended}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EndorseClient from "./EndorseClient";

interface Props { params: Promise<{ uid: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  return { title: `Endorse — ${uid}` };
}

export default async function EndorsePage({ params }: Props) {
  const { uid } = await params;
  const supabase = await createClient();

  // Get the member being endorsed
  const { data: target } = await supabase
    .from("members")
    .select("id, uid, full_name, role, profiles(avatar_url, skills_raw)")
    .eq("uid", uid)
    .single();

  if (!target) notFound();

  // Get current user (endorser) — may not be logged in
  const { data: { user } } = await supabase.auth.getUser();
  let endorser = null;
  let existingEndorsements: string[] = [];

  if (user) {
    const { data } = await supabase
      .from("members")
      .select("id, full_name")
      .eq("id", user.id)
      .single();
    endorser = data;

    // Skills already endorsed by this user for this target
    const { data: existing } = await supabase
      .from("endorsements")
      .select("skill")
      .eq("endorser_id", user.id)
      .eq("endorsed_id", target.id);

    existingEndorsements = existing?.map((e) => e.skill) ?? [];
  }

  return (
    <EndorseClient
      target={{
        id: target.id,
        uid: target.uid,
        fullName: target.full_name,
        role: target.role,
        avatarUrl: target.profiles?.avatar_url ?? null,
        skills: target.profiles?.skills_raw ?? [],
      }}
      endorser={endorser}
      existingEndorsements={existingEndorsements}
    />
  );
}

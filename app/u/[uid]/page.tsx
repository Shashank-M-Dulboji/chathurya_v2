import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ProfileView from "./ProfileView";

interface Props {
  params: Promise<{ uid: string }>;
}

// Fetch member data server-side
async function getMemberByUID(uid: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select(`
      id,
      uid,
      full_name,
      role,
      batch_year,
      profiles (
        bio,
        github_url,
        linkedin_url,
        portfolio_url,
        avatar_url,
        visibility_mode,
        archetype_primary,
        archetype_secondary,
        xp_total,
        streak_count
      ),
      badges (
        badge_type,
        badge_name,
        category,
        is_secret,
        earned_at
      ),
      endorsements!endorsed_id (
        skill,
        endorser_id
      )
    `)
    .eq("uid", uid)
    .single();

  if (error || !data) return null;
  return data;
}

// Dynamic redirect: check if admin has overridden the redirect target
async function getDynamicRedirect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "nfc_redirect_override")
    .single();
  return data?.value || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const member = await getMemberByUID(uid);

  if (!member || member.profiles?.visibility_mode === "ghost") {
    return { title: "Mystery Member" };
  }

  return {
    title: `${member.full_name} — Chathurya SDC`,
    description: member.profiles?.bio || `${member.role} @ Chathurya SDC`,
  };
}

export default async function NFCProfilePage({ params }: Props) {
  const { uid } = await params;

  // Check for dynamic override first
  const dynamicRedirect = await getDynamicRedirect();
  if (dynamicRedirect) {
    // Server-side redirect to wherever admin set
    return Response.redirect(dynamicRedirect) as never;
  }

  const member = await getMemberByUID(uid);

  if (!member) {
    notFound();
  }

  const visibilityMode = member.profiles?.visibility_mode ?? "public";

  // Ghost mode — mystery page
  if (visibilityMode === "ghost") {
    return <GhostMode />;
  }

  // Aggregate endorsements by skill
  const endorsementsBySkill: Record<string, number> = {};
  member.endorsements?.forEach(({ skill }: { skill: string }) => {
    endorsementsBySkill[skill] = (endorsementsBySkill[skill] || 0) + 1;
  });

  return (
    <ProfileView
      member={{
        uid: member.uid,
        fullName: member.full_name,
        role: member.role,
        batchYear: member.batch_year,
        bio: member.profiles?.bio,
        githubUrl: member.profiles?.github_url,
        linkedinUrl: member.profiles?.linkedin_url,
        portfolioUrl: member.profiles?.portfolio_url,
        avatarUrl: member.profiles?.avatar_url,
        visibilityMode,
        archetypePrimary: member.profiles?.archetype_primary,
        archetypeSecondary: member.profiles?.archetype_secondary,
        xpTotal: member.profiles?.xp_total ?? 0,
        streakCount: member.profiles?.streak_count ?? 0,
        badges: member.badges ?? [],
        endorsementsBySkill,
      }}
    />
  );
}

function GhostMode() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="bg-grid absolute inset-0 opacity-100" />
      <div className="relative z-10 text-center corner-marks p-12 max-w-sm">
        {/* Logo */}
        <svg width="60" height="36" viewBox="0 0 120 72" fill="none" className="logo-flicker mx-auto mb-8">
          <ellipse cx="80" cy="36" rx="30" ry="30" stroke="#dcf763" strokeWidth="9" fill="none" />
          <ellipse cx="80" cy="36" rx="13" ry="13" fill="#0a0a0a" />
          <path d="M52 12 C34 12, 8 22, 8 36 C8 50, 34 60, 52 60" stroke="#dcf763" strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="49" y="27" width="10" height="18" fill="#0a0a0a" />
        </svg>

        <p className="font-mono text-[11px] text-neon/60 tracking-widest mb-4">
          IDENTITY: CLASSIFIED
        </p>
        <h1 className="font-michroma font-bold text-3xl text-off-white mb-4">
          This member prefers to stay in the shadows.
        </h1>
        <p className="font-mono text-xs text-muted leading-relaxed">
          Find them at the next Chathurya workshop.
        </p>
        <div className="mt-8 h-px bg-neon/20" />
        <p className="font-mono text-[10px] text-slate mt-4 tracking-widest">
          CHATHURYA SDC · TAP AGAIN LATER
        </p>
      </div>
    </main>
  );
}

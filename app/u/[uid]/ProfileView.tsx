"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Globe, Zap, Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const ARCHETYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  builder:    { emoji: "🛠", label: "The Builder",    color: "text-neon" },
  scholar:    { emoji: "📚", label: "The Scholar",    color: "text-blue-400" },
  connector:  { emoji: "🤝", label: "The Connector",  color: "text-purple-400" },
  speaker:    { emoji: "🎤", label: "The Speaker",    color: "text-amber-400" },
  debugger:   { emoji: "🐛", label: "The Debugger",   color: "text-red-400" },
  creative:   { emoji: "🎨", label: "The Creative",   color: "text-pink-400" },
  shadow:     { emoji: "👻", label: "The Shadow",     color: "text-muted" },
};

const BADGE_ICONS: Record<string, string> = {
  workshop: "◈",
  building: "◉",
  community: "◐",
  special: "★",
  secret: "?",
};

interface ProfileViewProps {
  member: {
    uid: string;
    fullName: string;
    role: string;
    batchYear: number;
    bio?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    avatarUrl?: string | null;
    visibilityMode: string;
    archetypePrimary?: string | null;
    archetypeSecondary?: string | null;
    xpTotal: number;
    streakCount: number;
    badges: Array<{
      badge_type: string;
      badge_name: string;
      category: string;
      is_secret: boolean;
      earned_at: string;
    }>;
    endorsementsBySkill: Record<string, number>;
  };
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProfileView({ member }: ProfileViewProps) {
  const archetype = member.archetypePrimary
    ? ARCHETYPE_CONFIG[member.archetypePrimary]
    : null;

  const topSkills = Object.entries(member.endorsementsBySkill)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  const visibleBadges = member.badges
    .filter((b) => !b.is_secret)
    .slice(0, 9);

  return (
    <main className="min-h-screen bg-black">
      {/* Grid bg */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-60" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-between px-4 bg-black/90 border-b border-border backdrop-blur-sm">
        <Link href="/" className="font-mono text-[10px] text-neon/60 tracking-widest hover:text-neon transition-colors">
          ← CHATHURYA SDC
        </Link>
        <span className="font-mono text-[10px] text-muted tracking-widest">
          /u/{member.uid}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "status-dot",
            member.visibilityMode === "public" ? "active" :
            member.visibilityMode === "networking" ? "idle" : "ghost"
          )} />
          <span className="font-mono text-[10px] text-muted">{member.visibilityMode.toUpperCase()}</span>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-16"
      >
        {/* ── HERO ── */}
        <motion.div variants={itemVariants} className="flex items-start gap-5 mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-sm border-2 border-neon/60 overflow-hidden bg-surface">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.fullName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-michroma font-bold text-2xl text-neon bg-dark">
                  {member.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* XP indicator */}
            <div className="absolute -bottom-2 -right-2 bg-neon text-black font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
              {member.xpTotal >= 1000 ? `${(member.xpTotal / 1000).toFixed(1)}K` : member.xpTotal} XP
            </div>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h1 className="font-michroma font-bold text-2xl text-off-white leading-tight truncate">
              {member.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="font-mono text-[11px] text-neon/80 tracking-wide uppercase">
                {member.role}
              </span>
              <span className="font-mono text-[11px] text-border">·</span>
              <span className="font-mono text-[11px] text-muted">
                Batch {member.batchYear}
              </span>
            </div>

            {/* Archetype */}
            {archetype && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-sm">{archetype.emoji}</span>
                <span className={cn("font-mono text-[11px] tracking-wide", archetype.color)}>
                  {archetype.label}
                </span>
                {member.archetypeSecondary && ARCHETYPE_CONFIG[member.archetypeSecondary] && (
                  <>
                    <span className="font-mono text-[11px] text-border">+</span>
                    <span className="font-mono text-[11px] text-muted">
                      {ARCHETYPE_CONFIG[member.archetypeSecondary].label}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── STREAK + STATS ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 mb-6">
          {[
            { icon: <Zap size={14} className="text-neon" />, value: member.xpTotal.toLocaleString(), label: "XP" },
            { icon: <Flame size={14} className="text-orange-400" />, value: `${member.streakCount}🔥`, label: "Streak" },
            { icon: <Award size={14} className="text-neon" />, value: member.badges.length, label: "Badges" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="card-neon rounded-sm p-3 flex flex-col items-center gap-1">
              {icon}
              <span className="font-michroma font-bold text-lg text-off-white leading-none">{value}</span>
              <span className="font-mono text-[10px] text-muted tracking-widest">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── BIO ── */}
        {member.bio && (
          <motion.div variants={itemVariants} className="mb-6">
            <p className="text-light text-sm leading-relaxed">{member.bio}</p>
          </motion.div>
        )}

        {/* ── SOCIAL LINKS ── */}
        {(member.githubUrl || member.linkedinUrl || member.portfolioUrl) && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8">
            {member.githubUrl && (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 card-neon rounded-sm px-3 py-2 text-xs font-mono text-light hover:text-neon transition-colors group"
              >
                <Github size={14} className="group-hover:text-neon transition-colors" />
                GitHub
              </a>
            )}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 card-neon rounded-sm px-3 py-2 text-xs font-mono text-light hover:text-neon transition-colors group"
              >
                <Linkedin size={14} className="group-hover:text-neon transition-colors" />
                LinkedIn
              </a>
            )}
            {member.portfolioUrl && (
              <a
                href={member.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 card-neon rounded-sm px-3 py-2 text-xs font-mono text-light hover:text-neon transition-colors group"
              >
                <Globe size={14} className="group-hover:text-neon transition-colors" />
                Portfolio
              </a>
            )}
          </motion.div>
        )}

        {/* ── SKILLS & ENDORSEMENTS ── */}
        {topSkills.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <SectionLabel>Skills & Endorsements</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-3">
              {topSkills.map(([skill, count]) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 bg-dark border border-border rounded-sm px-2.5 py-1.5 hover:border-neon/30 transition-colors cursor-default"
                >
                  <span className="font-mono text-[11px] text-neon">{skill}</span>
                  {count > 1 && (
                    <span className="font-mono text-[10px] text-muted">×{count}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── BADGES ── */}
        {visibleBadges.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <SectionLabel>Achievements</SectionLabel>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {visibleBadges.map((badge) => (
                <div
                  key={badge.badge_type}
                  className="card-neon rounded-sm p-3 flex flex-col items-center gap-1.5 text-center"
                  title={badge.badge_name}
                >
                  <span className="text-neon text-xl font-mono">
                    {BADGE_ICONS[badge.category] || "◆"}
                  </span>
                  <span className="font-mono text-[10px] text-muted leading-tight">
                    {badge.badge_name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ENDORSE CTA (networking mode only hides full profile but shows endorse) ── */}
        {member.visibilityMode !== "ghost" && (
          <motion.div variants={itemVariants}>
            <div className="border border-neon/20 rounded-sm p-4 bg-dark/50 flex flex-col items-center gap-3 text-center">
              <p className="font-mono text-xs text-muted">
                Tap to endorse <span className="text-light">{member.fullName.split(" ")[0]}</span> for a skill
              </p>
              <Link
                href={`/endorse/${member.uid}`}
                className="btn-neon px-6 py-2.5 rounded-sm font-mono text-xs tracking-widest"
              >
                ENDORSE A SKILL →
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <motion.div variants={itemVariants} className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate tracking-widest">
            CHATHURYA SDC · SESHADRIPURAM
          </span>
          <Link
            href="/"
            className="font-mono text-[10px] text-neon/50 hover:text-neon transition-colors tracking-widest"
          >
            JOIN THE CLUB →
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] text-neon/60 tracking-widest uppercase">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

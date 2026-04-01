"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Zap, Flame, Award, BarChart2, QrCode } from "lucide-react";
import { cn, formatXP, getInitials } from "@/lib/utils";
import PortalShell from "@/components/PortalShell";

const ARCHETYPE_CONFIG: Record<string, { emoji: string; label: string }> = {
  builder:   { emoji: "🛠", label: "Builder"   },
  scholar:   { emoji: "📚", label: "Scholar"   },
  connector: { emoji: "🤝", label: "Connector" },
  speaker:   { emoji: "🎤", label: "Speaker"   },
  debugger:  { emoji: "🐛", label: "Debugger"  },
  creative:  { emoji: "🎨", label: "Creative"  },
  shadow:    { emoji: "👻", label: "Shadow"    },
};

interface Member {
  id: string; uid: string; fullName: string; role: string; batchYear: number;
  avatarUrl?: string | null; archetypePrimary?: string | null;
  xpTotal: number; streakCount: number; badgeCount: number;
  workshopsAttended: number; rank: number;
}

interface LeaderboardEntry {
  member_id: string; xp_total: number; archetype_primary: string | null;
  members: { full_name: string; uid: string; role: string } | null;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardClient({ member, leaderboard }: {
  member: Member;
  leaderboard: LeaderboardEntry[];
}) {
  const archetype = member.archetypePrimary ? ARCHETYPE_CONFIG[member.archetypePrimary] : null;

  return (
    <PortalShell
      memberId={member.id}
      memberName={member.fullName}
      memberRole={member.role}
      memberUid={member.uid}
      avatarUrl={member.avatarUrl}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 max-w-5xl mx-auto"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="font-mono text-[10px] text-neon/50 tracking-widest mb-1">// WELCOME_BACK</p>
          <h1 className="font-michroma text-3xl text-off-white leading-tight">
            {member.fullName.toUpperCase()}
          </h1>
          {archetype && (
            <p className="font-mono text-xs text-[#555] mt-1">
              {archetype.emoji} {archetype.label} · {member.role} · Batch {member.batchYear}
            </p>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: <Zap size={13} className="text-neon" />, value: formatXP(member.xpTotal), label: "XP EARNED" },
            { icon: <span className="font-mono text-xs text-[#555]">#</span>, value: member.rank, label: "RANK" },
            { icon: <Flame size={13} className="text-orange-400" />, value: `${member.streakCount}🔥`, label: "STREAK" },
            { icon: <Award size={13} className="text-neon" />, value: member.badgeCount, label: "BADGES" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="border border-[#1a1a1a] bg-[#080808] p-4 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">{icon}</div>
              <p className="font-michroma text-2xl text-off-white leading-none">{value}</p>
              <p className="font-mono text-[9px] text-[#444] tracking-widest">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* NFC card + leaderboard */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* NFC card preview */}
          <motion.div variants={itemVariants} className="border border-[#1a1a1a] bg-[#080808] p-5">
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Your NFC Card</p>
            <div className="border border-[#222] bg-black p-4 mb-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-sm opacity-40 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-[13px] relative">
                    <Image src="/logo.png" alt="" fill className="object-contain logo-flicker" />
                  </div>
                  <span className="font-michroma text-[9px] text-off-white tracking-widest">CHATHURYA</span>
                </div>
                <p className="font-michroma text-sm text-neon">{member.fullName}</p>
                <p className="font-mono text-[9px] text-[#444] mt-0.5">{member.role} · {member.uid}</p>
              </div>
              <svg width="30" height="24" viewBox="0 0 30 24" fill="none" className="relative z-10 opacity-40">
                {[5, 9, 13].map((r) => (
                  <path key={r}
                    d={`M${15-r} ${24-r*0.55} Q15 ${24-r*1.4} ${15+r} ${24-r*0.55}`}
                    stroke="#dcf763" strokeWidth="1.5" strokeLinecap="round" fill="none"
                  />
                ))}
              </svg>
            </div>
            <div className="flex gap-2">
              <Link href={`/u/${member.uid}`} target="_blank"
                className="flex-1 text-center btn-ghost py-2.5 rounded-none font-mono text-[10px] tracking-widest">
                View Profile →
              </Link>
              <Link href="/portal/nfc"
                className="flex-1 text-center btn-neon py-2.5 rounded-none font-michroma text-[10px] tracking-widest">
                My QR Code →
              </Link>
            </div>
          </motion.div>

          {/* Leaderboard snippet */}
          <motion.div variants={itemVariants} className="border border-[#1a1a1a] bg-[#080808] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase">Leaderboard</p>
              <Link href="/portal/leaderboard" className="font-mono text-[9px] text-[#444] hover:text-neon transition-colors">
                VIEW ALL →
              </Link>
            </div>
            <div className="space-y-1.5">
              {leaderboard.slice(0, 6).map((entry, i) => {
                const isMe = entry.member_id === member.id;
                const emoji = entry.archetype_primary ? ARCHETYPE_CONFIG[entry.archetype_primary]?.emoji ?? "" : "";
                return (
                  <div key={entry.member_id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2",
                      isMe ? "bg-neon/8 border border-neon/15" : "hover:bg-white/[0.015] transition-colors"
                    )}
                  >
                    <span className={cn("font-michroma text-xs w-5 text-center flex-shrink-0",
                      i === 0 ? "text-neon" : i === 1 ? "text-[#777]" : i === 2 ? "text-[#7a5c3a]" : "text-[#333]"
                    )}>{i + 1}</span>
                    <span className={cn("font-mono text-[10px] flex-1 truncate", isMe ? "text-neon" : "text-[#777]")}>
                      {emoji} {entry.members?.full_name ?? "—"}{isMe && " (you)"}
                    </span>
                    <span className="font-mono text-[10px] text-[#444] flex-shrink-0">
                      {formatXP(entry.xp_total)} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div variants={itemVariants}>
          <p className="font-mono text-[9px] text-[#333] tracking-widest uppercase mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Edit Profile",   href: "/portal/profile/edit", icon: "◈" },
              { label: "Workshops",      href: "/portal/workshops",    icon: "◉" },
              { label: "Skill Tree",     href: "/portal/skills",       icon: "◐" },
              { label: "Resource Vault", href: "/portal/resources",    icon: "◬" },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className="border border-[#1a1a1a] bg-[#080808] p-4 flex items-center gap-3 hover:border-neon/20 transition-all group"
              >
                <span className="font-mono text-neon/60 group-hover:text-neon transition-colors text-lg leading-none">
                  {action.icon}
                </span>
                <span className="font-mono text-[10px] text-[#555] group-hover:text-light transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PortalShell>
  );
}

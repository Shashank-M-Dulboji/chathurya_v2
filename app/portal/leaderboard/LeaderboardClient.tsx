"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn, formatXP, getInitials } from "@/lib/utils";
import PortalShell from "@/components/PortalShell";
import { Flame } from "lucide-react";

const ARCHETYPE_EMOJI: Record<string, string> = {
  builder: "🛠", scholar: "📚", connector: "🤝",
  speaker: "🎤", debugger: "🐛", creative: "🎨", shadow: "👻",
};

interface LeaderboardEntry {
  member_id: string;
  xp_total: number;
  streak_count: number;
  archetype_primary: string | null;
  avatar_url: string | null;
  members: { full_name: string; uid: string; role: string; batch_year: number | null } | null;
}

function Avatar({ url, name, size = 36 }: { url?: string | null; name: string; size?: number }) {
  return (
    <div
      className="rounded-none border border-[#2a2a2a] bg-surface overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image src={url} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        <span className="font-michroma font-bold text-neon" style={{ fontSize: size * 0.3 }}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

function Podium({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId: string }) {
  if (entries.length < 3) return null;
  const [second, first, third] = [entries[1], entries[0], entries[2]];

  return (
    <div className="flex items-end justify-center gap-3 mb-10 mt-4">
      {/* 2nd */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col items-center gap-2"
      >
        <Avatar url={second.avatar_url} name={second.members?.full_name ?? "?"} size={48} />
        <p className={cn("font-michroma text-xs truncate max-w-[80px] text-center", second.member_id === currentUserId ? "text-neon" : "text-light")}>
          {second.members?.full_name.split(" ")[0]}
        </p>
        <p className="font-mono text-[10px] text-[#555]">{formatXP(second.xp_total)} XP</p>
        <div className="w-20 flex items-center justify-center border-t border-l border-r border-[#2a2a2a] bg-[#0d0d0d] py-4 rounded-none">
          <span className="font-michroma text-xl text-[#888]">②</span>
        </div>
      </motion.div>

      {/* 1st */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col items-center gap-2 -mt-4"
      >
        <div className="relative">
          <Avatar url={first.avatar_url} name={first.members?.full_name ?? "?"} size={60} />
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-neon flex items-center justify-center">
            <span className="font-michroma text-[8px] text-black font-bold">①</span>
          </div>
        </div>
        <p className={cn("font-michroma text-xs truncate max-w-[90px] text-center", first.member_id === currentUserId ? "text-neon" : "text-off-white")}>
          {first.members?.full_name.split(" ")[0]}
        </p>
        <p className="font-mono text-[10px] text-neon">{formatXP(first.xp_total)} XP</p>
        <div className="w-24 flex items-center justify-center border-t border-l border-r border-neon/20 bg-neon/5 py-6 rounded-none">
          <span className="font-michroma text-2xl text-neon">①</span>
        </div>
      </motion.div>

      {/* 3rd */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col items-center gap-2"
      >
        <Avatar url={third.avatar_url} name={third.members?.full_name ?? "?"} size={44} />
        <p className={cn("font-michroma text-xs truncate max-w-[80px] text-center", third.member_id === currentUserId ? "text-neon" : "text-light")}>
          {third.members?.full_name.split(" ")[0]}
        </p>
        <p className="font-mono text-[10px] text-[#555]">{formatXP(third.xp_total)} XP</p>
        <div className="w-20 flex items-center justify-center border-t border-l border-r border-[#2a2a2a] bg-[#0d0d0d] py-3 rounded-none">
          <span className="font-michroma text-xl text-[#7a5c3a]">③</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function LeaderboardClient({
  currentUserId, currentUserRank, leaderboard: initial, member
}: {
  currentUserId: string;
  currentUserRank: number;
  leaderboard: LeaderboardEntry[];
  member: { id: string; uid: string; full_name: string; role: string; profiles: { avatar_url?: string | null } | null };
}) {
  const [entries, setEntries] = useState(initial);
  const [filter, setFilter] = useState<"all" | "batch">("all");
  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles"
      }, (payload) => {
        setEntries((prev) =>
          prev
            .map((e) => e.member_id === payload.new.member_id ? { ...e, xp_total: payload.new.xp_total } : e)
            .sort((a, b) => b.xp_total - a.xp_total)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const myEntry = entries.find((e) => e.member_id === currentUserId);
  const myRank = entries.findIndex((e) => e.member_id === currentUserId) + 1;

  return (
    <PortalShell
      memberId={member.id}
      memberName={member.full_name}
      memberRole={member.role}
      memberUid={member.uid}
      avatarUrl={member.profiles?.avatar_url}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="font-mono text-[10px] text-neon/60 tracking-widest mb-1">// LEADERBOARD</p>
          <div className="flex items-end justify-between">
            <h1 className="font-michroma text-2xl text-off-white">Rankings</h1>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-neon"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[10px] text-[#444] tracking-widest">LIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Your rank card */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-neon/20 bg-neon/5 p-4 flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <span className="font-michroma text-xl text-neon">#{myRank || currentUserRank}</span>
              <div>
                <p className="font-mono text-xs text-neon">Your Rank</p>
                <p className="font-mono text-[10px] text-[#555]">{formatXP(myEntry.xp_total)} XP</p>
              </div>
            </div>
            {myEntry.streak_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-orange-400" />
                <span className="font-mono text-xs text-orange-400">{myEntry.streak_count} day streak</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Podium */}
        <Podium entries={entries.slice(0, 3)} currentUserId={currentUserId} />

        {/* Full list */}
        <div className="border border-[#181818] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[40px_1fr_80px_70px] gap-2 px-4 py-2.5 border-b border-[#181818] bg-[#080808]">
            <span className="font-mono text-[9px] text-[#333] tracking-widest">#</span>
            <span className="font-mono text-[9px] text-[#333] tracking-widest">MEMBER</span>
            <span className="font-mono text-[9px] text-[#333] tracking-widest text-right">XP</span>
            <span className="font-mono text-[9px] text-[#333] tracking-widest text-right">STREAK</span>
          </div>

          <AnimatePresence>
            {entries.map((entry, i) => {
              const isMe = entry.member_id === currentUserId;
              const name = entry.members?.full_name ?? "Unknown";
              const emoji = entry.archetype_primary ? ARCHETYPE_EMOJI[entry.archetype_primary] ?? "" : "";

              return (
                <motion.div
                  key={entry.member_id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "grid grid-cols-[40px_1fr_80px_70px] gap-2 px-4 py-3 border-b border-[#111] items-center transition-colors",
                    isMe ? "bg-neon/[0.04] border-l-2 border-l-neon/40" : "hover:bg-white/[0.015]",
                    i < 3 ? "bg-[#0a0a0a]" : ""
                  )}
                >
                  {/* Rank */}
                  <span className={cn(
                    "font-michroma text-sm",
                    i === 0 ? "text-neon" : i === 1 ? "text-[#888]" : i === 2 ? "text-[#7a5c3a]" : "text-[#333]"
                  )}>
                    {i + 1}
                  </span>

                  {/* Member */}
                  <Link href={`/u/${entry.members?.uid}`} className="flex items-center gap-2.5 min-w-0 group">
                    <Avatar url={entry.avatar_url} name={name} size={28} />
                    <div className="min-w-0">
                      <p className={cn(
                        "font-mono text-xs truncate group-hover:text-neon transition-colors",
                        isMe ? "text-neon" : "text-light"
                      )}>
                        {emoji} {name}
                        {isMe && <span className="text-[#444] ml-1">(you)</span>}
                      </p>
                      <p className="font-mono text-[9px] text-[#333]">
                        {entry.members?.role} · {entry.members?.batch_year}
                      </p>
                    </div>
                  </Link>

                  {/* XP */}
                  <span className={cn("font-mono text-xs text-right", isMe ? "text-neon" : "text-[#555]")}>
                    {formatXP(entry.xp_total)}
                  </span>

                  {/* Streak */}
                  <div className="flex items-center justify-end gap-1">
                    {entry.streak_count > 0 && (
                      <>
                        <Flame size={10} className="text-orange-400/60" />
                        <span className="font-mono text-[10px] text-[#555]">{entry.streak_count}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </PortalShell>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, CalendarDays, MapPin, Zap } from "lucide-react";
import { toast } from "sonner";
import { formatXP } from "@/lib/utils";

interface Workshop {
  id: string; title: string; workshop_date: string;
  location: string | null; xp_reward: number; late_xp_reward: number;
}

interface Member {
  id: string; uid: string; full_name: string;
  profiles: { xp_total: number; avatar_url: string | null } | null;
}

type State = "idle" | "loading" | "success" | "already" | "error";

function isLate(workshopDate: string): boolean {
  const now = new Date();
  const start = new Date(workshopDate);
  // Late if checking in more than 10 minutes after workshop date
  return (now.getTime() - start.getTime()) > 10 * 60 * 1000;
}

export default function AttendClient({
  workshop, member, alreadyAttended,
}: {
  workshop: Workshop;
  member: Member | null;
  alreadyAttended: boolean;
}) {
  const [state, setState] = useState<State>(alreadyAttended ? "already" : "idle");
  const [xpEarned, setXpEarned] = useState(0);
  const [late, setLate] = useState(false);
  const supabase = createClient();

  async function handleCheckIn() {
    if (!member) {
      // Not logged in — redirect to login, come back here
      window.location.href = `/auth/login?redirectTo=/attend/${workshop.id}`;
      return;
    }

    setState("loading");
    const isLateCheckIn = isLate(workshop.workshop_date);
    setLate(isLateCheckIn);
    const xp = isLateCheckIn ? workshop.late_xp_reward : workshop.xp_reward;

    // Insert attendance
    const { error } = await supabase.from("attendance").insert({
      member_id: member.id,
      workshop_id: workshop.id,
      checked_in_at: new Date().toISOString(),
      is_late: isLateCheckIn,
      xp_earned: xp,
    });

    if (error) {
      if (error.code === "23505") {
        setState("already");
        return;
      }
      toast.error(error.message);
      setState("error");
      return;
    }

    // Award XP
    await supabase.from("xp_transactions").insert({
      member_id: member.id,
      amount: xp,
      reason: `Attended: ${workshop.title}`,
      reference_id: workshop.id,
    });

    setXpEarned(xp);
    setState("success");
  }

  const workshopDate = new Date(workshop.workshop_date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      {/* Animated scan line on idle */}
      {state === "idle" && (
        <motion.div
          className="fixed left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(220,247,99,0.3), transparent)" }}
          animate={{ y: ["-5vh", "105vh"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        />
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Chathurya" className="logo-flicker" style={{ width: 48, height: "auto" }} />
          </Link>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Idle: Show workshop + check-in button ── */}
          {(state === "idle" || state === "loading") && (
            <motion.div key="idle"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>

              <div className="border border-[#1a1a1a] bg-[#080808] p-6 mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#dcf763]/40 to-transparent" />

                <p className="font-mono text-[10px] text-[#dcf763]/60 tracking-widest mb-3 uppercase">
                  Workshop Check-In
                </p>
                <h1 className="font-michroma text-lg text-[#ebebeb] mb-4 leading-snug">
                  {workshop.title}
                </h1>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-[#555]">
                    <CalendarDays size={12} />
                    <span className="font-mono text-[10px]">{workshopDate}</span>
                  </div>
                  {workshop.location && (
                    <div className="flex items-center gap-2 text-[#555]">
                      <MapPin size={12} />
                      <span className="font-mono text-[10px]">{workshop.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#555]">
                    <Zap size={12} />
                    <span className="font-mono text-[10px]">
                      {workshop.xp_reward} XP on time · {workshop.late_xp_reward} XP if late
                    </span>
                  </div>
                </div>

                {member && (
                  <div className="flex items-center gap-2.5 p-3 border border-[#1a1a1a] bg-black mb-5">
                    <div className="w-8 h-8 border border-[#2a2a2a] bg-[#111] flex items-center justify-center font-michroma text-[10px] text-[#dcf763]">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-[#ebebeb]">{member.full_name}</p>
                      <p className="font-mono text-[9px] text-[#444]">
                        {formatXP(member.profiles?.xp_total ?? 0)} XP total
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckIn}
                  disabled={state === "loading"}
                  className="btn-neon w-full py-4 font-michroma text-sm tracking-widest rounded-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {state === "loading"
                    ? <><Loader2 size={15} className="animate-spin" /> Checking in...</>
                    : member
                    ? "TAP TO CHECK IN →"
                    : "LOGIN TO CHECK IN →"
                  }
                </button>
              </div>

              {!member && (
                <p className="font-mono text-[10px] text-[#333] text-center">
                  You need to be logged in as a Chathurya member
                </p>
              )}
            </motion.div>
          )}

          {/* ── Success ── */}
          {state === "success" && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="border border-[#dcf763]/20 bg-[#080808] p-10 text-center relative">
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#dcf763]/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#dcf763]/30" />

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }} className="mb-5">
                  <CheckCircle2 size={52} className="text-[#dcf763] mx-auto" />
                </motion.div>

                <h2 className="font-michroma text-xl text-[#ebebeb] mb-2">Checked In!</h2>
                <p className="font-mono text-xs text-[#555] mb-1">
                  {member?.full_name.split(" ")[0]} · {workshop.title}
                </p>

                {late && (
                  <p className="font-mono text-[10px] text-[#666] mb-3">
                    Marked as late — partial XP awarded
                  </p>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-[#dcf763]/10 border border-[#dcf763]/20 px-6 py-3 mb-8"
                >
                  <Zap size={14} className="text-[#dcf763]" />
                  <span className="font-michroma text-lg text-[#dcf763]">+{xpEarned} XP</span>
                </motion.div>

                <div className="flex gap-3">
                  <Link href="/portal/dashboard"
                    className="flex-1 btn-neon py-3 font-michroma text-xs tracking-widest rounded-none text-center">
                    Dashboard →
                  </Link>
                  <Link href={`/u/${member?.uid}`}
                    className="flex-1 btn-ghost py-3 font-michroma text-xs tracking-widest rounded-none text-center">
                    My Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Already attended ── */}
          {state === "already" && (
            <motion.div key="already"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>
              <div className="border border-[#2a2a2a] bg-[#080808] p-8 text-center">
                <div className="w-12 h-12 border border-[#dcf763]/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={24} className="text-[#dcf763]/60" />
                </div>
                <h2 className="font-michroma text-lg text-[#ebebeb] mb-2">Already Checked In</h2>
                <p className="font-mono text-xs text-[#555] mb-6">
                  You&apos;re already registered for {workshop.title}.
                </p>
                <Link href="/portal/dashboard"
                  className="btn-ghost w-full py-3 font-michroma text-xs tracking-widest rounded-none text-center block">
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          {state === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="border border-red-500/20 bg-[#080808] p-8 text-center">
                <p className="font-michroma text-lg text-red-400 mb-2">Check-in failed</p>
                <p className="font-mono text-xs text-[#555] mb-6">Something went wrong. Try again.</p>
                <button onClick={() => setState("idle")}
                  className="btn-ghost w-full py-3 font-michroma text-xs tracking-widest rounded-none">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

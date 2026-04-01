"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { generateUID } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const BATCH_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

const STEPS = ["Identity", "Profile", "Welcome"];

interface Props {
  userId: string;
  userEmail: string;
  suggestedUid: string;
  inviteToken: string;
}

export default function CompleteSignupClient({
  userId, userEmail, suggestedUid, inviteToken,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 — Identity
  const [fullName, setFullName] = useState("");
  const [batchYear, setBatchYear] = useState(CURRENT_YEAR);

  // Step 1 — Profile
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  async function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setStep(1);
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const uid = suggestedUid || generateUID(6);
      const skillsArray = skills
        .split(/[,;]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20);

      // 1. Create member record
      const { error: memberError } = await supabase.from("members").insert({
        id: userId,
        uid,
        email: userEmail,
        full_name: fullName.trim(),
        role: "Member",
        batch_year: batchYear,
        invite_token: null, // clear it
      });

      if (memberError) {
        // uid collision — generate a new one
        if (memberError.code === "23505") {
          toast.error("UID collision, retrying...");
          setLoading(false);
          return;
        }
        throw memberError;
      }

      // 2. Update profile (auto-created by DB trigger)
      await supabase.from("profiles").update({
        bio: bio.trim() || null,
        github_url: github.trim() || null,
        linkedin_url: linkedin.trim() || null,
        skills_raw: skillsArray,
        visibility_mode: "public",
      }).eq("member_id", userId);

      // 3. Award founding member badge + XP
      await supabase.from("badges").insert({
        member_id: userId,
        badge_type: "founding_member",
        badge_name: "Founding Member",
        category: "special",
        is_secret: false,
        context: "Joined Chathurya SDC",
      });

      await supabase.from("xp_transactions").insert({
        member_id: userId,
        amount: 100,
        reason: "Welcome to Chathurya!",
      });

      // 4. Mark invite token as used
      if (inviteToken) {
        await supabase.from("invite_tokens")
          .update({ used_at: new Date().toISOString() })
          .eq("token", inviteToken);
      }

      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16 relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 border font-michroma text-[10px] transition-all ${
                i < step ? "border-neon bg-neon text-black" :
                i === step ? "border-neon text-neon" :
                "border-[#2a2a2a] text-[#444]"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`font-mono text-[10px] tracking-widest hidden sm:block ${
                i === step ? "text-[#999]" : "text-[#333]"
              }`}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-[#1a1a1a] mx-1" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 0: Identity ── */}
          {step === 0 && (
            <motion.div key="identity"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}>
              <div className="border border-[#1a1a1a] bg-[#080808] p-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="Chathurya" className="logo-flicker" style={{ width: 56, height: "auto" }} />
                </div>

                <p className="font-mono text-[10px] text-[#dcf763]/60 tracking-widest mb-1 text-center">
                  STEP 01 / 02
                </p>
                <h1 className="font-michroma text-xl text-[#ebebeb] text-center mb-1">
                  Welcome to Chathurya
                </h1>
                <p className="font-mono text-[10px] text-[#555] text-center mb-8">
                  {userEmail}
                </p>

                <form onSubmit={handleIdentitySubmit} className="space-y-5">
                  <div>
                    <label className="font-mono text-[10px] text-[#444] tracking-widest block mb-2 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Priya Sharma"
                      required
                      autoFocus
                      className="input-dark w-full px-4 py-3 rounded-none font-inter text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[#444] tracking-widest block mb-2 uppercase">
                      Batch Year
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BATCH_YEARS.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setBatchYear(year)}
                          className={`py-2.5 font-mono text-xs border transition-all rounded-none ${
                            batchYear === year
                              ? "border-[#dcf763] bg-[#dcf763]/10 text-[#dcf763]"
                              : "border-[#1a1a1a] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!fullName.trim()}
                    className="btn-neon w-full py-3.5 font-michroma text-xs tracking-widest rounded-none disabled:opacity-40"
                  >
                    Continue →
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <motion.div key="profile"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}>
              <div className="border border-[#1a1a1a] bg-[#080808] p-8">
                <p className="font-mono text-[10px] text-[#dcf763]/60 tracking-widest mb-1 text-center">
                  STEP 02 / 02
                </p>
                <h1 className="font-michroma text-xl text-[#ebebeb] text-center mb-1">
                  Build Your Profile
                </h1>
                <p className="font-mono text-[10px] text-[#555] text-center mb-8">
                  All optional — you can edit later
                </p>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="font-mono text-[10px] text-[#444] tracking-widest block mb-2 uppercase">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={200}
                      rows={2}
                      placeholder="Full-stack dev building cool stuff. BCA final year."
                      className="input-dark w-full px-4 py-3 rounded-none font-inter text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[#444] tracking-widest block mb-2 uppercase">
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="react, python, figma, node.js"
                      className="input-dark w-full px-4 py-3 rounded-none font-mono text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] text-[#444] tracking-widest block mb-2 uppercase">
                        GitHub
                      </label>
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="github.com/you"
                        className="input-dark w-full px-3 py-2.5 rounded-none font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-[#444] tracking-widest block mb-2 uppercase">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/in/you"
                        className="input-dark w-full px-3 py-2.5 rounded-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="btn-ghost px-5 py-3.5 font-michroma text-xs tracking-widest rounded-none"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-neon flex-1 py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {loading
                        ? <><Loader2 size={13} className="animate-spin" /> Creating account...</>
                        : "Complete Setup →"
                      }
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Welcome ── */}
          {step === 2 && (
            <motion.div key="welcome"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <div className="border border-[#dcf763]/20 bg-[#080808] p-10 text-center relative">
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#dcf763]/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#dcf763]/30" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="mb-6"
                >
                  <CheckCircle2 size={52} className="text-[#dcf763] mx-auto" />
                </motion.div>

                <h2 className="font-michroma text-2xl text-[#ebebeb] mb-2">
                  You&apos;re in.
                </h2>
                <p className="font-mono text-xs text-[#555] mb-2 leading-relaxed">
                  Welcome to Chathurya, <span className="text-[#999]">{fullName.split(" ")[0]}</span>.
                </p>
                <p className="font-mono text-[10px] text-[#444] mb-8 leading-relaxed">
                  You&apos;ve earned the <span className="text-[#dcf763]">Founding Member</span> badge and{" "}
                  <span className="text-[#dcf763]">100 XP</span> just for showing up.
                </p>

                <button
                  onClick={() => router.push("/portal/dashboard")}
                  className="btn-neon px-8 py-3.5 font-michroma text-xs tracking-widest rounded-none w-full"
                >
                  Enter Dashboard →
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="font-mono text-[9px] text-[#333] text-center mt-6">
          Having trouble?{" "}
          <Link href="/" className="text-[#555] hover:text-[#dcf763] transition-colors">
            Return to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}

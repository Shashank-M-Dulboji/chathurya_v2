"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Python", "Node.js",
  "SQL", "Git", "Tailwind CSS", "FastAPI", "Django", "Machine Learning",
  "UI/UX", "Figma", "C++", "Java", "DevOps", "Linux", "Public Speaking",
  "Technical Writing", "Problem Solving", "Mentoring",
];

interface Props {
  target: {
    id: string; uid: string; fullName: string; role: string;
    avatarUrl: string | null; skills: string[];
  };
  endorser: { id: string; full_name: string } | null;
  existingEndorsements: string[];
}

export default function EndorseClient({ target, endorser, existingEndorsements }: Props) {
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  // Merge target's self-reported skills with common ones, deduplicated
  const allSkills = [...new Set([...target.skills, ...COMMON_SKILLS])];

  function toggleSkill(skill: string) {
    if (existingEndorsements.includes(skill)) return; // already endorsed
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function addCustom() {
    const s = customSkill.trim();
    if (!s || selected.includes(s)) return;
    setSelected((prev) => [...prev, s]);
    setCustomSkill("");
  }

  async function handleEndorse() {
    if (!endorser) {
      toast.error("You need to be logged in to endorse.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Select at least one skill.");
      return;
    }
    setLoading(true);

    const rows = selected.map((skill) => ({
      endorser_id: endorser.id,
      endorsed_id: target.id,
      skill,
    }));

    const { error } = await supabase.from("endorsements").insert(rows);

    if (error) {
      toast.error(error.code === "23505" ? "You've already endorsed some of these." : error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16 relative">
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back */}
        <Link
          href={`/u/${target.uid}`}
          className="flex items-center gap-1.5 font-mono text-[10px] text-[#444] hover:text-neon transition-colors mb-8"
        >
          <ArrowLeft size={11} /> Back to profile
        </Link>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Corner marks */}
              <div className="relative border border-[#1a1a1a] p-10 bg-[#080808]">
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-neon/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-neon/30" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="mb-6"
                >
                  <CheckCircle2 size={48} className="text-neon mx-auto" />
                </motion.div>

                <h2 className="font-michroma text-xl text-off-white mb-2">Endorsed!</h2>
                <p className="font-mono text-xs text-[#555] leading-relaxed mb-2">
                  You endorsed{" "}
                  <span className="text-light">{target.fullName.split(" ")[0]}</span> for:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mb-8">
                  {selected.map((s) => (
                    <span key={s} className="skill-pill">{s}</span>
                  ))}
                </div>
                <Link
                  href={`/u/${target.uid}`}
                  className="btn-neon px-6 py-3 font-michroma text-xs tracking-widest rounded-none inline-block"
                >
                  Back to Profile →
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Target member card */}
              <div className="border border-[#1a1a1a] bg-[#080808] p-5 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 border border-[#2a2a2a] bg-surface overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {target.avatarUrl ? (
                    <Image src={target.avatarUrl} alt={target.fullName} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <span className="font-michroma font-bold text-neon text-sm">
                      {getInitials(target.fullName)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-michroma text-sm text-off-white">{target.fullName}</p>
                  <p className="font-mono text-[10px] text-[#444]">{target.role}</p>
                </div>
              </div>

              <h1 className="font-michroma text-lg text-off-white mb-1">
                Endorse {target.fullName.split(" ")[0]}
              </h1>
              <p className="font-mono text-[10px] text-[#444] mb-6 leading-relaxed">
                Select skills they&apos;ve demonstrated in workshops or projects.
              </p>

              {/* Skill grid */}
              <div className="flex flex-wrap gap-2 mb-5">
                {allSkills.map((skill) => {
                  const isSelected = selected.includes(skill);
                  const alreadyDone = existingEndorsements.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      disabled={alreadyDone}
                      className={cn(
                        "font-mono text-[10px] px-2.5 py-1.5 border rounded-none transition-all",
                        alreadyDone
                          ? "border-[#1a1a1a] text-[#333] cursor-not-allowed"
                          : isSelected
                          ? "border-neon bg-neon/10 text-neon"
                          : "border-[#2a2a2a] text-[#555] hover:border-[#3a3a3a] hover:text-light"
                      )}
                    >
                      {alreadyDone && "✓ "}{skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                  placeholder="Add another skill..."
                  className="input-dark flex-1 px-3 py-2.5 rounded-none font-mono text-xs"
                  maxLength={40}
                />
                <button onClick={addCustom} className="btn-ghost px-4 rounded-none font-mono text-xs">
                  Add
                </button>
              </div>

              {/* Selected display */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5 p-3 border border-neon/10 bg-neon/[0.03]">
                  {selected.map((s) => (
                    <span key={s} className="skill-pill">{s}</span>
                  ))}
                </div>
              )}

              {/* Not logged in warning */}
              {!endorser && (
                <div className="border border-[#2a2a2a] p-3 mb-5 font-mono text-[10px] text-[#555]">
                  <Link href="/auth/login" className="text-neon hover:underline">Log in</Link>
                  {" "}to submit your endorsement.
                </div>
              )}

              <button
                onClick={handleEndorse}
                disabled={loading || selected.length === 0 || !endorser}
                className="btn-neon w-full py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading
                  ? <><Loader2 size={13} className="animate-spin" /> Submitting...</>
                  : `Endorse ${selected.length > 0 ? `(${selected.length})` : ""} →`
                }
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

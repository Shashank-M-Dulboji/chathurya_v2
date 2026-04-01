"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function JoinSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    // In production: POST to /api/invite-request
    // Stores the email and notifies leads via Supabase
    await new Promise((r) => setTimeout(r, 1000));

    setSubmitted(true);
    setLoading(false);
    toast.success("Invite request sent! We'll get back to you.");
  }

  return (
    <section id="join" ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-animated-glow pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] text-neon/60 tracking-widest mb-4">
            // join.chathurya()
          </p>
          <h2 className="font-michroma font-bold text-display-md text-off-white mb-4 leading-none">
            READY TO BUILD?
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-10 max-w-md mx-auto">
            Chathurya is invite-only. Drop your email and a lead will reach out.
            Your NFC card ships when you attend your first workshop.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 border-2 border-neon rounded-sm flex items-center justify-center">
                <span className="text-neon font-michroma font-bold text-xl">✓</span>
              </div>
              <p className="font-mono text-sm text-neon">Request received.</p>
              <p className="font-mono text-xs text-muted">We&apos;ll email you at {email}</p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-neon flex-1 px-4 py-3.5 rounded-sm font-mono text-black"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-neon px-6 py-3.5 rounded-sm font-mono text-sm tracking-widest whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> SENDING...</>
                ) : (
                  "REQUEST INVITE →"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

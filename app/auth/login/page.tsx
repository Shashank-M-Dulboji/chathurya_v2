"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Step = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // ── Step 1: Send OTP ──────────────────────────────────────
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // Invite-only — no new accounts
      },
    });

    if (error) {
      toast.error(error.message === "Signups not allowed for otp"
        ? "This email isn't registered. Request an invite first."
        : error.message
      );
    } else {
      toast.success(`OTP sent to ${email}`);
      setStep("otp");
    }

    setLoading(false);
  }

  // ── Step 2: Verify OTP ────────────────────────────────────
  async function handleVerifyOTP() {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: "email",
    });

    if (error) {
      toast.error("Invalid or expired code. Try again.");
      setOtp(["", "", "", "", "", ""]);
    } else {
      toast.success("Access granted.");
      router.push("/portal/dashboard");
      router.refresh();
    }

    setLoading(false);
  }

  // Handle OTP input boxes
  function handleOtpInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    // Auto-submit when all 6 entered
    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      setTimeout(() => handleVerifyOTP(), 100);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      {/* Grid background */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      {/* Center card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm corner-marks p-1"
      >
        <div className="bg-dark border border-border p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Chathurya"
                className="logo-flicker"
                style={{ width: 56, height: 36, objectFit: "contain", display: "block" }}
              />
            </Link>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 justify-center mb-6">
            {(["email", "otp"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${step === s ? "bg-neon" : "bg-border"}`} />
                {i < 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-mono text-[11px] text-neon/70 tracking-widest mb-1 text-center">
                  STEP 01 / 02
                </p>
                <h1 className="font-michroma font-bold text-xl text-off-white text-center mb-1">
                  ACCESS SYSTEM
                </h1>
                <p className="font-mono text-[11px] text-muted text-center mb-8 tracking-wide">
                  Enter your member email
                </p>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] text-muted tracking-widest block mb-2">
                      EMAIL_ADDRESS
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      required
                      className="input-neon w-full px-4 py-3 rounded-sm font-mono text-black"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="btn-neon w-full py-3.5 rounded-sm font-mono text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={14} className="animate-spin" /> SENDING OTP...</>
                    ) : (
                      "SEND CODE →"
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="font-mono text-[10px] text-muted">
                    Not a member?{" "}
                    <Link href="/#join" className="text-neon/70 hover:text-neon transition-colors">
                      Request an invite
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-mono text-[11px] text-neon/70 tracking-widest mb-1 text-center">
                  STEP 02 / 02
                </p>
                <h1 className="font-michroma font-bold text-xl text-off-white text-center mb-1">
                  VERIFY IDENTITY
                </h1>
                <p className="font-mono text-[11px] text-muted text-center mb-2 tracking-wide">
                  6-digit code sent to
                </p>
                <p className="font-mono text-xs text-neon text-center mb-8">{email}</p>

                {/* OTP boxes */}
                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`
                        w-11 h-12 text-center input-neon rounded-sm font-michroma font-bold text-lg
                        ${digit ? "border-neon/60 text-neon" : ""}
                      `}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.some((d) => !d)}
                  className="btn-neon w-full py-3.5 rounded-sm font-mono text-sm tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" /> VERIFYING...</>
                  ) : (
                    "GRANT ACCESS →"
                  )}
                </button>

                <button
                  onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
                  className="w-full text-center font-mono text-[10px] text-muted hover:text-light transition-colors mt-4"
                >
                  ← Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corner marks extra */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-neon/50" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-neon/50" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-neon/50" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-neon/50" />
      </motion.div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const BOOT_LINES = [
  "INITIALIZING CHATHURYA OS...",
  "LOADING MEMBER NETWORK...",
  "NFC SUBSYSTEM READY",
  "LEADERBOARD ENGINE ONLINE",
  "ACCESS GRANTED",
];

function BootOverlay() {
  const [lines, setLines] = useState<string[]>([]);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const addLine = () => {
      if (idx < BOOT_LINES.length) {
        setLines((p) => [...p, BOOT_LINES[idx++]]);
        setTimeout(addLine, 180);
      } else {
        setTimeout(() => setFading(true), 300);
        setTimeout(() => setGone(true), 900);
      }
    };
    setTimeout(addLine, 50);
  }, []);

  if (gone) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "all" }}>
      <div className="font-mono text-xs space-y-2 w-72">
        {lines.map((line, i) => (
          <div key={i} className={`flex items-center gap-2 ${i === lines.length - 1 ? "text-[#dcf763]" : "text-[#444]"}`}>
            <span className="text-[#dcf763]">›</span>{line}
          </div>
        ))}
        {lines.length < BOOT_LINES.length && <span className="text-[#dcf763] animate-pulse">█</span>}
      </div>
    </div>
  );
}

function ScanLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(220,247,99,0.18), transparent)" }}
        animate={{ y: ["-5vh", "105vh"] }} transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 2 }} />
      <motion.div className="absolute top-0 bottom-0 w-px"
        style={{ background: "linear-gradient(180deg, transparent, rgba(220,247,99,0.08), transparent)" }}
        animate={{ x: ["-5vw", "105vw"] }} transition={{ duration: 9, repeat: Infinity, ease: "linear", repeatDelay: 3 }} />
    </div>
  );
}

function Rings() {
  return (
    <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {[80, 160, 240, 340].map((size, i) => (
        <motion.div key={size} className="absolute border border-[#dcf763] rounded-none"
          style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
          animate={{ opacity: [0.06, 0.02, 0.06] }} transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </div>
  );
}

const NODES = [
  { x: "8%", y: "22%", label: "NFC" }, { x: "88%", y: "16%", label: "XP" },
  { x: "5%", y: "68%", label: "SKILLS" }, { x: "90%", y: "72%", label: "BADGES" },
  { x: "14%", y: "46%", label: "100+" }, { x: "83%", y: "46%", label: "20+ WS" },
];

function EdgeNodes() {
  return (
    <>
      {NODES.map((node, i) => (
        <motion.div key={i} className="absolute hidden lg:flex items-center gap-1.5"
          style={{ left: node.x, top: node.y }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}>
          <motion.div className="w-1.5 h-1.5 rounded-full bg-[#dcf763]"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity }} />
          <span className="font-mono text-[10px] text-[#555] tracking-widest">{node.label}</span>
        </motion.div>
      ))}
    </>
  );
}

function Corners() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute top-20 left-6 w-8 h-8 border-t border-l border-[#dcf763]/30" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="absolute top-20 right-6 w-8 h-8 border-t border-r border-[#dcf763]/30" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="absolute bottom-16 left-6 w-8 h-8 border-b border-l border-[#dcf763]/30" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="absolute bottom-16 right-6 w-8 h-8 border-b border-r border-[#dcf763]/30" />
    </div>
  );
}

function Ticker() {
  const text = "BUILD · LEARN · SHIP  ·  NFC-POWERED IDENTITY  ·  INVITE ONLY  ·  SESHADRIPURAM COLLEGE  ·  BENGALURU  ·  EST. 2025  ·  100+ MEMBERS  ·  20+ WORKSHOPS  ·  ";
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 border-t border-[#1a1a1a] overflow-hidden flex items-center bg-black/60">
      <motion.div className="flex whitespace-nowrap font-mono text-[10px] text-[#333] tracking-[0.15em]"
        animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {[text, text].map((t, i) => <span key={i}>{t}</span>)}
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const d = { status: 0.2, logo: 0.35, title: 0.5, sub: 0.65, desc: 0.75, cta: 0.9, pills: 1.05 };

  return (
    <>
      <BootOverlay />
      <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 46%, rgba(220,247,99,0.04) 0%, transparent 70%)" }} />
        <ScanLines /><Rings /><Corners /><EdgeNodes />

        <motion.div style={{ y: contentY }}
          className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-12">

          {/* Status */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d.status, duration: 0.5 }}
            className="flex items-center gap-2 mb-10">
            <motion.span className="w-1.5 h-1.5 rounded-full bg-[#dcf763]"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="font-mono text-[11px] text-[#555] tracking-[0.2em] uppercase">System Online · Seshadripuram College</span>
          </motion.div>

          {/* Logo — the actual logo.png you drop in public/ */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: d.logo, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative mb-10">
            <motion.div className="absolute -inset-8 border border-[#dcf763]/10 rounded-none"
              animate={{ opacity: [0.5, 0.15, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Chathurya" className="logo-flicker"
              style={{ width: 140, height: "auto", display: "block" }} />
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d.title, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mb-4 overflow-hidden">
            <h1 className="glitch font-michroma text-[clamp(52px,11vw,108px)] text-[#ebebeb] leading-none tracking-[-0.02em] uppercase select-none"
              data-text="CHATHURYA">CHATHURYA</h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d.sub, duration: 0.5 }}
            className="flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-[#dcf763]/30" />
            <p className="font-mono text-[11px] text-[#dcf763] tracking-[0.3em] uppercase">Student Developers Club</p>
            <div className="h-px w-10 bg-[#dcf763]/30" />
          </motion.div>

          {/* Description */}
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d.desc, duration: 0.5 }}
            className="max-w-md text-[#666] text-[15px] leading-relaxed mb-10">
            Not a college club.{" "}
            <span className="text-[#999]">A developer community OS</span>
            {" "}— NFC identity cards, gamified learning, and a network that outlasts your degree.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d.cta, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-12">
            <Link href="#join" className="btn-neon px-8 py-4 font-michroma text-[12px] tracking-[0.12em] w-56 text-center rounded-none">
              Request Invite →
            </Link>
            <Link href="#about" className="btn-ghost px-8 py-4 font-michroma text-[12px] tracking-[0.1em] w-56 text-center rounded-none">
              Learn More
            </Link>
          </motion.div>

          {/* Pills */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d.pills, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2">
            {["next.js 15", "supabase", "typescript", "nfc ntag216", "framer motion"].map((t) => (
              <span key={t} className="skill-pill">{t}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <span className="font-mono text-[9px] text-[#333] tracking-[0.3em]">SCROLL</span>
            <div className="w-px h-10 bg-gradient-to-b from-[#dcf763]/25 to-transparent mx-auto mt-1" />
          </motion.div>
        </motion.div>

        <Ticker />
      </section>
    </>
  );
}

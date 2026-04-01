"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const WHAT_WE_DO = [
  { icon: "◈", title: "Build Real Projects", desc: "Ship working software, not just tutorials. Every member has a project portfolio." },
  { icon: "◉", title: "Run Workshops", desc: "Hands-on sessions on web dev, ML, DevOps, design — taught by members, for members." },
  { icon: "◐", title: "Network Deeply", desc: "NFC-powered connections. Meet people who'll be your teammates at hackathons and your referrals in industry." },
];

const CODE_LINES = [
  { token: "const", rest: " chathurya = {", color: "text-blue-400" },
  { token: "  mission:", rest: " \"build · learn · ship\",", color: "text-neon" },
  { token: "  members:", rest: " 100+,", color: "text-purple-400" },
  { token: "  founded:", rest: " 2025,", color: "text-orange-400" },
  { token: "  location:", rest: " \"Seshadripuram, Bengaluru\",", color: "text-neon" },
  { token: "  stack:", rest: " [\"Next.js\", \"Supabase\", \"NFC\"],", color: "text-blue-400" },
  { token: "  culture:", rest: " \"maker-first, always\"", color: "text-green-400" },
  { token: "}", rest: "", color: "text-off-white" },
];

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-16"
        >
          <span className="font-mono text-[11px] text-neon/60 tracking-widest">02</span>
          <div className="h-px w-8 bg-neon/30" />
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">About</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Code block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-dark border border-border rounded-sm overflow-hidden">
              {/* Editor header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-neon/60" />
                <span className="font-mono text-[10px] text-muted ml-2 tracking-wide">
                  chathurya.config.ts
                </span>
              </div>

              {/* Code */}
              <div className="p-6 font-mono text-sm leading-7">
                {CODE_LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                    className="flex"
                  >
                    <span className="text-muted select-none w-6 mr-4 text-right text-xs leading-7">
                      {i + 1}
                    </span>
                    <span className={line.color}>{line.token}</span>
                    <span className="text-light">{line.rest}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tagline below code */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-6 text-muted text-sm leading-relaxed font-light"
            >
              We&apos;re not a lecture hall extension. Every workshop ends with something built.
              Every member has a public portfolio. Every NFC tap tells a story.
            </motion.p>
          </motion.div>

          {/* Right: Feature cards */}
          <div className="space-y-4">
            {WHAT_WE_DO.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="card-neon rounded-sm p-6 group cursor-default"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-2xl text-neon group-hover:scale-110 transition-transform leading-none mt-0.5">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-michroma font-bold text-lg text-off-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

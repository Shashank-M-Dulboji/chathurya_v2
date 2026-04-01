"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 100, suffix: "+", label: "Active Members" },
  { value: 20,  suffix: "+", label: "Workshops Run"  },
  { value: 3,   suffix: "",  label: "Lead Organizers" },
  { value: "∞", suffix: "",  label: "Learning Potential" },
];

function CountUp({ target, suffix }: { target: number | string; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || typeof target === "string") return;
    let start = 0;
    const duration = 1400;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  if (typeof target === "string") return <span ref={ref}>{target}</span>;
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="border-y border-[#1a1a1a] bg-[#080808] relative overflow-hidden">
      {/* Neon line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon/30 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1a1a1a]">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex flex-col items-center justify-center py-10 px-6 gap-2 relative group"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 bg-neon/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

            <span className="font-michroma text-3xl md:text-4xl text-neon leading-none">
              <CountUp target={stat.value} suffix={stat.suffix} />
            </span>
            <span className="font-mono text-[10px] text-[#444] tracking-[0.2em] uppercase text-center">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon/20 to-transparent" />
    </section>
  );
}

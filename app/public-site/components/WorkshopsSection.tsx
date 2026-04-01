"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CalendarDays, Users, ArrowUpRight } from "lucide-react";

// Static placeholder workshops — replace with Supabase fetch
const PAST_WORKSHOPS = [
  {
    id: "1",
    date: "Mar 2025",
    title: "Intro to Next.js 15",
    tags: ["React", "TypeScript", "SSR"],
    attendees: 34,
    hasResources: true,
  },
  {
    id: "2",
    date: "Feb 2025",
    title: "Supabase — Backend for Frontend Devs",
    tags: ["Supabase", "PostgreSQL", "Auth"],
    attendees: 28,
    hasResources: true,
  },
  {
    id: "3",
    date: "Jan 2025",
    title: "Git Internals & Open Source Workflow",
    tags: ["Git", "GitHub", "CLI"],
    attendees: 41,
    hasResources: true,
  },
  {
    id: "4",
    date: "Dec 2024",
    title: "Machine Learning from Scratch",
    tags: ["Python", "ML", "NumPy"],
    attendees: 22,
    hasResources: false,
  },
  {
    id: "5",
    date: "Nov 2024",
    title: "Building REST APIs with FastAPI",
    tags: ["Python", "FastAPI", "REST"],
    attendees: 31,
    hasResources: true,
  },
  {
    id: "6",
    date: "Oct 2024",
    title: "UI/UX Design for Developers",
    tags: ["Figma", "Design", "CSS"],
    attendees: 38,
    hasResources: false,
  },
];

export default function WorkshopsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="workshops" ref={ref} className="relative py-24 px-6 bg-dark border-y border-border">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="font-mono text-[11px] text-neon/60 tracking-widest">03</span>
              <div className="h-px w-8 bg-neon/30" />
              <span className="font-mono text-[11px] text-muted tracking-widest uppercase">Workshops</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-michroma font-bold text-display-md text-off-white"
            >
              WHAT WE&apos;VE BUILT
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-1.5 font-mono text-xs text-muted hover:text-neon transition-colors cursor-pointer"
          >
            VIEW ALL <ArrowUpRight size={12} />
          </motion.div>
        </div>

        {/* Workshop grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAST_WORKSHOPS.map((workshop, i) => (
            <motion.div
              key={workshop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="card-neon rounded-sm p-5 group cursor-default"
            >
              {/* Date + resources */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-muted">
                  <CalendarDays size={11} />
                  <span className="font-mono text-[10px] tracking-wide">{workshop.date}</span>
                </div>
                {workshop.hasResources && (
                  <span className="font-mono text-[9px] bg-neon/10 text-neon border border-neon/20 px-2 py-0.5 rounded-sm">
                    RESOURCES
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-michroma font-bold text-base text-off-white leading-snug mb-3 group-hover:text-neon transition-colors">
                {workshop.title}
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {workshop.tags.map((tag) => (
                  <span key={tag} className="skill-pill">{tag}</span>
                ))}
              </div>

              {/* Attendee count */}
              <div className="flex items-center gap-1.5 text-muted">
                <Users size={11} />
                <span className="font-mono text-[10px]">{workshop.attendees} attended</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Member exclusive note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 border border-neon/15 rounded-sm p-4 flex items-center gap-4"
        >
          <span className="font-mono text-xl text-neon/40">◈</span>
          <div>
            <p className="font-mono text-xs text-neon/70 tracking-wide mb-0.5">MEMBER EXCLUSIVE</p>
            <p className="text-sm text-muted">
              Slides, source code, and recordings from all workshops are available in the{" "}
              <span className="text-light">member portal</span> after you join.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

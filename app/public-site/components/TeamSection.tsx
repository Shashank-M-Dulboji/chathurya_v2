"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Globe } from "lucide-react";

// Populated by leads — update this array with real data
// Or fetch from Supabase: members where role IN ('Lead', 'Core') AND visibility = 'public'
const TEAM: Array<{
  name: string;
  role: string;
  batchYear: number;
  bio: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  archetype: string;
}> = [
  {
    name: "Nandan",
    role: "Club Lead",
    batchYear: 2025,
    bio: "Full-stack dev. Built the Chathurya community OS from scratch. Obsessed with developer tooling and edge computing.",
    archetype: "🛠 Builder",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Lead 2",
    role: "Core Lead",
    batchYear: 2025,
    bio: "Your co-lead's bio here. Update the TEAM array in TeamSection.tsx with real data.",
    archetype: "📚 Scholar",
  },
  {
    name: "Lead 3",
    role: "Core Lead",
    batchYear: 2025,
    bio: "Another lead's bio. Replace with real name and details.",
    archetype: "🤝 Connector",
  },
];

function MemberCard({
  member,
  index,
  inView,
}: {
  member: (typeof TEAM)[number];
  index: number;
  inView: boolean;
}) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border border-[#1a1a1a] bg-[#080808] p-6 group hover:border-[#dcf763]/20 transition-all duration-300 relative"
    >
      {/* Top accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dcf763]/0 to-transparent group-hover:via-[#dcf763]/40 transition-all duration-500" />

      {/* Avatar */}
      <div className="w-16 h-16 border border-[#2a2a2a] group-hover:border-[#dcf763]/30 transition-colors bg-[#111] flex items-center justify-center mb-5 relative overflow-hidden">
        {member.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-michroma font-bold text-xl text-[#dcf763]">{initials}</span>
        )}
        {/* Scan line on hover */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-[#dcf763]/30 opacity-0 group-hover:opacity-100"
          animate={{ y: [-20, 80] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Info */}
      <div className="mb-4">
        <h3 className="font-michroma text-base text-[#ebebeb] mb-0.5">{member.name}</h3>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] text-[#dcf763]">{member.role}</span>
          <span className="font-mono text-[10px] text-[#333]">·</span>
          <span className="font-mono text-[10px] text-[#444]">Batch {member.batchYear}</span>
        </div>
        <span className="font-mono text-[10px] text-[#555]">{member.archetype}</span>
      </div>

      <p className="font-inter text-xs text-[#666] leading-relaxed mb-5 line-clamp-3">
        {member.bio}
      </p>

      {/* Social links */}
      {(member.github || member.linkedin || member.portfolio) && (
        <div className="flex items-center gap-3">
          {member.github && (
            <a href={member.github} target="_blank" rel="noopener noreferrer"
              className="text-[#444] hover:text-[#dcf763] transition-colors">
              <Github size={14} />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-[#444] hover:text-[#dcf763] transition-colors">
              <Linkedin size={14} />
            </a>
          )}
          {member.portfolio && (
            <a href={member.portfolio} target="_blank" rel="noopener noreferrer"
              className="text-[#444] hover:text-[#dcf763] transition-colors">
              <Globe size={14} />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function TeamSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="team" ref={ref} className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="font-mono text-[11px] text-[#dcf763]/60 tracking-widest">05</span>
          <div className="h-px w-8 bg-[#dcf763]/30" />
          <span className="font-mono text-[11px] text-[#555] tracking-widest uppercase">Team</span>
        </motion.div>

        <div className="flex items-end justify-between mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-michroma text-[clamp(28px,5vw,54px)] text-[#ebebeb] leading-none"
          >
            THE LEADS
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="font-mono text-[10px] text-[#333] tracking-widest hidden md:block"
          >
            SESHADRIPURAM COLLEGE · BENGALURU
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} inView={inView} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-3"
        >
          <div className="flex-1 h-px bg-[#111]" />
          <span className="font-mono text-[10px] text-[#333] tracking-widest">
            + {"{"}100+{"}"} MEMBERS IN THE NETWORK
          </span>
          <div className="flex-1 h-px bg-[#111]" />
        </motion.div>
      </div>
    </section>
  );
}

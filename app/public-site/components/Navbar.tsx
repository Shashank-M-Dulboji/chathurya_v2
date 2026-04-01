"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#workshops", label: "Workshops" },
  { href: "#team", label: "Team" },
  { href: "#join", label: "Join" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-black/90 backdrop-blur-md border-b border-[#1e1e1e]" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Chathurya" width={36} height={22} className="logo-flicker" style={{ display: "block" }} />
            <span className="font-michroma text-sm tracking-[0.12em] text-[#ebebeb] group-hover:text-[#dcf763] transition-colors uppercase">
              Chathurya
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className="font-inter text-xs text-[#666] hover:text-[#ebebeb] transition-colors tracking-[0.1em] uppercase">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link href="/auth/login" className="font-inter text-xs text-[#666] hover:text-[#ebebeb] transition-colors tracking-[0.08em] uppercase">
              Login
            </Link>
            <Link href="#join" className="btn-neon px-5 py-2.5 text-[11px] font-michroma tracking-[0.1em] rounded-none">
              Request Invite →
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-[#666] hover:text-[#dcf763] transition-colors p-1"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black/98 border-b border-[#1e1e1e] backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <Link href={link.href} onClick={() => setMenuOpen(false)}
                    className="block py-3 font-michroma text-sm text-[#888] hover:text-[#dcf763] transition-colors tracking-[0.1em] uppercase border-b border-[#1a1a1a]">
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/auth/login" className="btn-ghost px-5 py-3 text-xs font-michroma tracking-widest text-center rounded-none">Member Login</Link>
                <Link href="#join" className="btn-neon px-5 py-3 text-xs font-michroma tracking-widest text-center rounded-none">Request Invite →</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

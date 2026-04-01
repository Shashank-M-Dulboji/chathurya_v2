"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, User, BookOpen, Trophy, QrCode,
  Settings, LogOut, Menu, X, Award, Users
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

interface PortalShellProps {
  children: React.ReactNode;
  memberId: string;
  memberName: string;
  memberRole: string;
  memberUid: string;
  avatarUrl?: string | null;
  isLead?: boolean;
}

function NavItem({
  href, icon, label, active
}: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 font-mono text-[11px] tracking-wide transition-all rounded-none group relative",
        active
          ? "text-neon bg-neon/8 border-l border-neon"
          : "text-[#555] hover:text-[#999] hover:bg-white/[0.02] border-l border-transparent"
      )}
    >
      <span className={cn("transition-colors", active ? "text-neon" : "group-hover:text-[#777]")}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default function PortalShell({
  children, memberId, memberName, memberRole, memberUid, avatarUrl, isLead = false
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV = [
    { href: "/portal/dashboard",    icon: <LayoutDashboard size={14} />, label: "Dashboard" },
    { href: `/u/${memberUid}`,      icon: <User size={14} />,            label: "My Profile" },
    { href: "/portal/profile/edit", icon: <Settings size={14} />,        label: "Edit Profile" },
    { href: "/portal/workshops",    icon: <BookOpen size={14} />,        label: "Workshops"  },
    { href: "/portal/leaderboard",  icon: <Trophy size={14} />,          label: "Leaderboard" },
    { href: "/portal/nfc",          icon: <QrCode size={14} />,          label: "NFC Card"    },
    { href: "/portal/skills",       icon: <Award size={14} />,           label: "Skill Tree"  },
    ...(isLead ? [{ href: "/admin", icon: <Users size={14} />, label: "Admin Panel" }] : []),
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-[#181818]">
        <div className="w-7 h-[18px] relative flex-shrink-0">
          <Image src="/logo.png" alt="Chathurya" fill className="object-contain" />
        </div>
        <span className="font-michroma text-xs tracking-widest text-off-white">CHATHURYA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="font-mono text-[9px] text-[#333] tracking-widest px-3 py-2 uppercase">Portal</p>
        {NAV.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href || (item.href !== "/portal/dashboard" && pathname.startsWith(item.href))}
          />
        ))}
      </nav>

      {/* Member footer */}
      <div className="p-3 border-t border-[#181818]">
        <Link
          href={`/u/${memberUid}`}
          className="flex items-center gap-2.5 p-2 hover:bg-white/[0.02] rounded-none transition-colors mb-2 group"
        >
          <div className="w-7 h-7 rounded-none border border-[#2a2a2a] bg-surface overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={28} height={28} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-michroma text-[9px] text-neon">
                {getInitials(memberName)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-off-white truncate leading-none">{memberName}</p>
            <p className="font-mono text-[9px] text-[#444] mt-0.5">{memberRole}</p>
          </div>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 font-mono text-[10px] text-[#444] hover:text-red-500 transition-colors rounded-none hover:bg-red-500/5"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 border-r border-[#181818] bg-[#080808] fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-black/95 border-b border-[#181818] flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-4 relative">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>
          <span className="font-michroma text-xs tracking-widest text-off-white">CHATHURYA</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-[#555] hover:text-neon transition-colors">
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-52 bg-[#080808] border-r border-[#181818] z-50 flex flex-col"
            >
              <div className="absolute top-3 right-3">
                <button onClick={() => setMobileOpen(false)} className="text-[#555] hover:text-neon transition-colors p-1">
                  <X size={16} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 lg:ml-52 min-h-screen">
        {/* Top bar */}
        <div className="h-14 border-b border-[#181818] flex items-center justify-between px-6 sticky top-0 bg-black/95 backdrop-blur-sm z-30">
          <p className="font-mono text-[9px] text-[#333] tracking-[0.2em] hidden sm:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short", day: "numeric", month: "short", year: "numeric"
            }).toUpperCase()}
          </p>
          <div className="flex items-center gap-1.5 ml-auto">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-neon"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-mono text-[9px] text-[#444] tracking-widest">ONLINE</span>
          </div>
        </div>

        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-dark px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + tagline */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Chathurya" style={{ width: 32, height: 20, objectFit: "contain" }} />
          <div>
            <p className="font-michroma font-bold text-sm text-off-white leading-none">CHATHURYA</p>
            <p className="font-mono text-[9px] text-muted tracking-widest mt-0.5">&lt;STUDENT DEVELOPERS CLUB&gt;</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8">
          {[
            { href: "#about", label: "About" },
            { href: "#workshops", label: "Workshops" },
            { href: "/auth/login", label: "Member Login" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] text-muted hover:text-neon transition-colors tracking-widest uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* College */}
        <div className="text-right">
          <p className="font-mono text-[10px] text-slate tracking-wide">
            SESHADRIPURAM COLLEGE
          </p>
          <p className="font-mono text-[10px] text-slate/60 tracking-wide">
            BENGALURU · EST. 2025
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
        <p className="font-mono text-[9px] text-slate/50 tracking-widest">
          © 2025–2026 CHATHURYA SDC. ALL RIGHTS RESERVED.
        </p>
        <p className="font-mono text-[9px] text-slate/50 tracking-widest">
          BUILT WITH ∞ BY MEMBERS, FOR MEMBERS.
        </p>
      </div>
    </footer>
  );
}

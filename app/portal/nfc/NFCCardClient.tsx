"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Copy, Check, Download, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import PortalShell from "@/components/PortalShell";

const ARCHETYPE_EMOJI: Record<string, string> = {
  builder: "🛠", scholar: "📚", connector: "🤝",
  speaker: "🎤", debugger: "🐛", creative: "🎨", shadow: "👻",
};

interface Props {
  member: {
    id: string; uid: string; full_name: string; role: string; batch_year: number | null;
    profiles: { avatar_url?: string | null; xp_total?: number; archetype_primary?: string | null } | null;
  };
  profileUrl: string;
}

export default function NFCCardClient({ member, profileUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#dcf763", light: "#0a0a0a" },
      errorCorrectionLevel: "M",
    }).then(setQrDataUrl);
  }, [profileUrl]);

  function copyUrl() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("URL copied");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `chathurya-qr-${member.uid}.png`;
    a.click();
    toast.success("QR downloaded");
  }

  const archetypeEmoji = member.profiles?.archetype_primary
    ? ARCHETYPE_EMOJI[member.profiles.archetype_primary] ?? ""
    : "";

  const STEPS = [
    { num: "01", title: "Install NFC Tools Pro", body: "Free app on iOS and Android. No account needed." },
    { num: "02", title: "Open → Write → Add Record", body: "Tap + Add a record → URL → paste your profile URL below." },
    { num: "03", title: "Tap NTAG216 to write", body: "Hold your phone over the blank card for ~1 second. Done." },
    { num: "04", title: "Test by tapping", body: "Tap any NFC-enabled phone — your profile should open instantly." },
  ];

  return (
    <PortalShell
      memberId={member.id} memberName={member.full_name}
      memberRole={member.role} memberUid={member.uid}
      avatarUrl={member.profiles?.avatar_url}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="font-mono text-[10px] text-neon/60 tracking-widest mb-1">// NFC_CARD</p>
          <h1 className="font-michroma text-2xl text-off-white">My NFC Card</h1>
          <p className="font-mono text-xs text-[#444] mt-1">UID: {member.uid}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Card preview */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Card Preview</p>

            {/* The card */}
            <div className="relative w-full aspect-[1.586/1] bg-[#080808] border border-[#222] overflow-hidden p-5 flex flex-col justify-between group">
              {/* Corner marks */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-neon/30" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-neon/30" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-neon/30" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-neon/30" />

              {/* Subtle grid */}
              <div className="absolute inset-0 bg-grid-sm opacity-60 pointer-events-none" />

              {/* Top row */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-4 relative">
                    <Image src="/logo.png" alt="" fill className="object-contain logo-flicker" />
                  </div>
                  <span className="font-michroma text-[10px] text-off-white tracking-wider">CHATHURYA</span>
                </div>
                {/* NFC symbol */}
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none" className="opacity-40">
                  {[5, 9, 13].map((r) => (
                    <path key={r}
                      d={`M${14 - r} ${22 - r * 0.55} Q14 ${22 - r * 1.4} ${14 + r} ${22 - r * 0.55}`}
                      stroke="#dcf763" strokeWidth="1.4" strokeLinecap="round" fill="none"
                    />
                  ))}
                </svg>
              </div>

              {/* Member info */}
              <div className="relative z-10">
                <p className="font-michroma text-base text-off-white leading-tight mb-0.5">
                  {member.full_name}
                </p>
                <p className="font-mono text-[10px] text-[#555] tracking-wide">
                  {archetypeEmoji} {member.role.toUpperCase()} · {member.batch_year}
                </p>
              </div>

              {/* Bottom row: QR + uid */}
              <div className="flex items-end justify-between relative z-10">
                {qrDataUrl && (
                  <div className="w-12 h-12 bg-[#0a0a0a]">
                    <Image src={qrDataUrl} alt="QR" width={48} height={48} className="w-full h-full" />
                  </div>
                )}
                <div className="text-right">
                  <p className="font-mono text-[8px] text-[#333] tracking-widest">NFC UID</p>
                  <p className="font-michroma text-[10px] text-neon tracking-wider">{member.uid}</p>
                </div>
              </div>
            </div>

            <p className="font-mono text-[9px] text-[#333] mt-2 text-center tracking-widest">
              DESIGN PREVIEW — PRINT AT LOCAL SHOP
            </p>
          </motion.div>

          {/* Right: QR + URL */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {/* Big QR */}
            <div>
              <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Your QR Code</p>
              <div className="flex justify-center">
                {qrDataUrl ? (
                  <div className="border border-[#222] p-4 bg-[#080808] inline-block">
                    <Image src={qrDataUrl} alt="QR Code" width={160} height={160} className="block" />
                  </div>
                ) : (
                  <div className="w-[160px] h-[160px] border border-[#1a1a1a] bg-surface flex items-center justify-center">
                    <span className="font-mono text-[10px] text-[#333]">generating...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile URL */}
            <div>
              <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">
                Write This URL to NFC
              </p>
              <div className="flex items-center gap-2 border border-[#222] bg-surface px-3 py-2.5">
                <span className="font-mono text-[11px] text-neon flex-1 truncate">{profileUrl}</span>
                <button onClick={copyUrl} className="text-[#555] hover:text-neon transition-colors flex-shrink-0">
                  {copied ? <Check size={14} className="text-neon" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={downloadQR} className="btn-ghost flex-1 py-2.5 text-xs font-michroma tracking-widest rounded-none flex items-center justify-center gap-2">
                <Download size={13} /> Download QR
              </button>
              <a
                href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex-1 py-2.5 text-xs font-michroma tracking-widest rounded-none flex items-center justify-center gap-2"
              >
                <Smartphone size={13} /> NFC Tools
              </a>
            </div>
          </motion.div>
        </div>

        {/* How to write NFC steps */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[10px] text-[#444] tracking-widest uppercase">How to Write Your Card</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="border border-[#1a1a1a] bg-[#080808] p-4 flex gap-3"
              >
                <span className="font-michroma text-xs text-neon/40 flex-shrink-0 mt-0.5">{step.num}</span>
                <div>
                  <p className="font-michroma text-xs text-off-white mb-1">{step.title}</p>
                  <p className="font-mono text-[10px] text-[#555] leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 border border-neon/10 bg-neon/[0.03] p-4">
            <p className="font-mono text-xs text-neon/60 mb-1">// NTAG216 CHIP</p>
            <p className="font-mono text-[10px] text-[#555] leading-relaxed">
              Your card uses the NTAG216 (868 bytes · 13.56 MHz ISO14443A Type 2).
              It works with all iPhones from 7+ and Android phones with NFC enabled.
              No app needed to tap — just tap and the browser opens automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </PortalShell>
  );
}

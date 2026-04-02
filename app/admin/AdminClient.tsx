"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users, Send, Radio, Upload, Search,
  CheckCircle2, XCircle, LayoutDashboard, Loader2, X, ChevronDown
} from "lucide-react";
import Papa from "papaparse";
import { cn, formatXP, getInitials } from "@/lib/utils";
import PortalShell from "@/components/PortalShell";

type Tab = "members" | "invite" | "nfc" | "import";

interface Member {
  id: string; uid: string; full_name: string; email: string;
  role: string; batch_year: number | null; is_active: boolean; created_at: string;
  profiles: { xp_total?: number; avatar_url?: string | null; archetype_primary?: string | null } | null;
}

export default function AdminClient({
  me, members: initialMembers, nfcRedirect: initialRedirect
}: {
  me: { id: string; uid: string; full_name: string; role: string };
  members: Member[];
  nfcRedirect: string | null;
}) {
  const [tab, setTab] = useState<Tab>("members");
  const [members] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [nfcRedirect, setNfcRedirect] = useState(initialRedirect ?? "");
  const [nfcLoading, setNfcLoading] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResults, setInviteResults] = useState<Array<{ email: string; status: string }>>([]);
  const [csvData, setCsvData] = useState<Array<{ name: string; email: string; batch_year?: string; role?: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.uid.toLowerCase().includes(search.toLowerCase())
  );

  // ── NFC Redirect ──────────────────────────────────────────
  async function saveNFCRedirect() {
    setNfcLoading(true);
    const res = await fetch("/api/admin/nfc-redirect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: nfcRedirect.trim() || null }),
    });
    const data = await res.json();
    if (data.error) toast.error(data.error);
    else toast.success(data.message);
    setNfcLoading(false);
  }

  // ── Invite ────────────────────────────────────────────────
  async function sendInvites() {
    const emails = inviteEmails
      .split(/[\n,;]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));

    if (emails.length === 0) { toast.error("Enter valid emails"); return; }
    setInviteLoading(true);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const data = await res.json();
    setInviteResults(data.results ?? []);
    setInviteLoading(false);
    toast.success(`Processed ${emails.length} invite(s)`);
  }

  // ── CSV Import ────────────────────────────────────────────
  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvData(result.data as typeof csvData);
        toast.success(`Parsed ${result.data.length} rows`);
      },
    });
  }

  async function importCSV() {
    if (csvData.length === 0) return;
    const emails = csvData.map((r) => r.email).filter(Boolean);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const data = await res.json();
    toast.success(`Sent ${data.results?.length ?? 0} invites from CSV`);
    setCsvData([]);
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "members", label: "Members", icon: <Users size={13} /> },
    { id: "invite",  label: "Invite",  icon: <Send size={13} /> },
    { id: "nfc",     label: "NFC Redirect", icon: <Radio size={13} /> },
    { id: "import",  label: "CSV Import",   icon: <Upload size={13} /> },
  ];

  return (
    <PortalShell memberId={me.id} memberName={me.full_name} memberRole={me.role} memberUid={me.uid} isLead>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[9px] text-neon/60 tracking-widest">// ADMIN_PANEL</span>
            <span className="font-mono text-[9px] bg-neon/10 text-neon border border-neon/20 px-2 py-0.5 rounded-sm">
              {me.role.toUpperCase()}
            </span>
          </div>
          <h1 className="font-michroma text-2xl text-off-white">Admin Dashboard</h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: "Total Members", value: members.length },
            { label: "Active",        value: members.filter((m) => m.is_active).length },
            { label: "Leads + Core",  value: members.filter((m) => ["Lead","Core"].includes(m.role)).length },
            { label: "NFC Override",  value: initialRedirect ? "ON" : "OFF" },
          ].map(({ label, value }) => (
            <div key={label} className="border border-[#1a1a1a] bg-[#080808] p-4">
              <p className="font-michroma text-xl text-neon leading-none mb-1">{value}</p>
              <p className="font-mono text-[9px] text-[#444] tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#1a1a1a] mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-mono text-[11px] tracking-wide transition-all border-b-2",
                tab === t.id
                  ? "text-neon border-neon"
                  : "text-[#444] border-transparent hover:text-[#777]"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Members Tab ── */}
          {tab === "members" && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Search */}
              <div className="flex items-center gap-3 border border-[#1a1a1a] bg-[#080808] px-4 py-2.5 mb-4">
                <Search size={13} className="text-[#444]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or UID..."
                  className="bg-transparent flex-1 font-mono text-xs text-off-white placeholder-[#333] outline-none"
                />
                <span className="font-mono text-[10px] text-[#333]">{filtered.length}</span>
              </div>

              {/* Table */}
              <div className="border border-[#1a1a1a] overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_80px_80px_60px] gap-2 px-4 py-2.5 bg-[#080808] border-b border-[#1a1a1a]">
                  {["MEMBER", "ROLE", "UID", "XP", "STATUS"].map((h) => (
                    <span key={h} className="font-mono text-[9px] text-[#333] tracking-widest">{h}</span>
                  ))}
                </div>

                {filtered.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className="grid grid-cols-[1fr_120px_80px_80px_60px] gap-2 px-4 py-3 border-b border-[#0f0f0f] items-center hover:bg-white/[0.015] transition-colors"
                  >
                    <Link href={`/u/${m.uid}`} className="flex items-center gap-2.5 min-w-0 group">
                      <div className="w-7 h-7 border border-[#2a2a2a] bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                        {m.profiles?.avatar_url ? (
                          <Image src={m.profiles.avatar_url} alt="" width={28} height={28} className="object-cover" />
                        ) : (
                          <span className="font-michroma text-[9px] text-neon">{getInitials(m.full_name)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-light truncate group-hover:text-neon transition-colors">{m.full_name}</p>
                        <p className="font-mono text-[9px] text-[#333] truncate">{m.email}</p>
                      </div>
                    </Link>
                    <span className={cn(
                      "font-mono text-[10px]",
                      m.role === "Lead" ? "text-neon" : m.role === "Core" ? "text-blue-400" : "text-[#555]"
                    )}>{m.role}</span>
                    <span className="font-mono text-[10px] text-[#444]">{m.uid}</span>
                    <span className="font-mono text-[10px] text-[#555]">{formatXP(m.profiles?.xp_total ?? 0)}</span>
                    <span>
                      {m.is_active
                        ? <CheckCircle2 size={13} className="text-neon/60" />
                        : <XCircle size={13} className="text-[#444]" />}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Invite Tab ── */}
          {tab === "invite" && (
            <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl space-y-5">
              <div>
                <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">Email Addresses</p>
                <textarea
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  rows={6}
                  placeholder={"priya@example.com\narjun@example.com\nrohan@example.com"}
                  className="input-dark w-full px-4 py-3 rounded-none font-mono text-xs resize-none"
                />
                <p className="font-mono text-[9px] text-[#333] mt-1.5">One per line, or comma/semicolon separated</p>
              </div>

              <button
                onClick={sendInvites}
                disabled={inviteLoading || !inviteEmails.trim()}
                className="btn-neon px-8 py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center gap-2 disabled:opacity-40"
              >
                {inviteLoading ? <><Loader2 size={13} className="animate-spin" /> Sending...</> : "Send Invites →"}
              </button>

              {/* Results */}
              {inviteResults.length > 0 && (
                <div className="border border-[#1a1a1a] divide-y divide-[#0f0f0f]">
                  {inviteResults.map((r) => (
                    <div key={r.email} className="flex items-center justify-between px-4 py-2.5">
                      <span className="font-mono text-[10px] text-light">{r.email}</span>
                      <span className={cn("font-mono text-[10px]", r.status === "sent" ? "text-neon" : "text-red-500")}>
                        {r.status === "sent" ? "✓ Sent" : "✗ Error"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── NFC Redirect Tab ── */}
          {tab === "nfc" && (
            <motion.div key="nfc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl space-y-5">
              <div className="border border-neon/10 bg-neon/[0.03] p-4">
                <p className="font-mono text-xs text-neon/70 mb-1">// HOW IT WORKS</p>
                <p className="font-mono text-[10px] text-[#555] leading-relaxed">
                  When a member taps their NFC card, normally it opens their profile.
                  Set a URL below to override ALL cards to redirect there instead.
                  Clear it to restore normal behaviour. Takes effect instantly.
                </p>
              </div>

              <div>
                <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">
                  Redirect Target URL
                </p>
                <input
                  type="url"
                  value={nfcRedirect}
                  onChange={(e) => setNfcRedirect(e.target.value)}
                  placeholder="https://example.com/rsvp  (leave empty to restore profiles)"
                  className="input-dark w-full px-4 py-3 rounded-none font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Workshop RSVP",
                  "This week's article",
                  "Scavenger hunt start",
                  "Event form",
                ].map((preset) => (
                  <button
                    key={preset}
                    className="btn-ghost px-3 py-1.5 text-[10px] font-mono tracking-wide rounded-none"
                    onClick={() => toast.info(`Paste your ${preset.toLowerCase()} URL in the field above`)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveNFCRedirect}
                  disabled={nfcLoading}
                  className="btn-neon px-8 py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center gap-2 disabled:opacity-40"
                >
                  {nfcLoading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : "Save Redirect →"}
                </button>
                {nfcRedirect && (
                  <button
                    onClick={() => { setNfcRedirect(""); }}
                    className="btn-ghost px-5 py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center gap-2"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>

              {initialRedirect && (
                <div className="border border-[#1a1a1a] p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-neon flex-shrink-0" />
                  <div>
                    <p className="font-mono text-[9px] text-[#444] tracking-widest uppercase mb-0.5">Currently Active</p>
                    <p className="font-mono text-[10px] text-neon truncate">{initialRedirect}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── CSV Import Tab ── */}
          {tab === "import" && (
            <motion.div key="import" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl space-y-5">
              <div className="border border-[#1a1a1a] p-4 bg-[#080808]">
                <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-2">Expected CSV Format</p>
                <pre className="font-mono text-[10px] text-neon/60 leading-relaxed">
{`name,email,batch_year,role
"Priya Sharma","priya@college.edu",2023,"Member"
"Arjun Kumar","arjun@college.edu",2022,"Member"`}
                </pre>
                <p className="font-mono text-[9px] text-[#333] mt-2">
                  Export your Google Form responses as CSV — only email column is required.
                </p>
              </div>

              <div>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn-ghost w-full py-8 font-mono text-xs tracking-widest rounded-none border-dashed flex flex-col items-center gap-2"
                >
                  <Upload size={20} className="text-[#444]" />
                  Click to select CSV file
                </button>
              </div>

              {csvData.length > 0 && (
                <>
                  <div className="border border-[#1a1a1a] overflow-hidden max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-[#080808] border-b border-[#1a1a1a] sticky top-0">
                      {["NAME","EMAIL","BATCH"].map((h) => (
                        <span key={h} className="font-mono text-[9px] text-[#333] tracking-widest">{h}</span>
                      ))}
                    </div>
                    {csvData.slice(0, 20).map((row, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2.5 border-b border-[#0f0f0f]">
                        <span className="font-mono text-[10px] text-light truncate">{row.name}</span>
                        <span className="font-mono text-[10px] text-[#555] truncate">{row.email}</span>
                        <span className="font-mono text-[10px] text-[#444]">{row.batch_year}</span>
                      </div>
                    ))}
                    {csvData.length > 20 && (
                      <p className="font-mono text-[9px] text-[#333] text-center py-2">
                        ...and {csvData.length - 20} more
                      </p>
                    )}
                  </div>

                  <button
                    onClick={importCSV}
                    className="btn-neon w-full py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center justify-center gap-2"
                  >
                    <Send size={13} /> Send {csvData.length} Invites →
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortalShell>
  );
}

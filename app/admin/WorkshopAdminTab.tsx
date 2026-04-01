"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Radio, Plus, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Workshop {
  id: string;
  title: string;
  workshop_date: string;
  location: string | null;
  xp_reward: number;
  is_published: boolean;
}

export default function WorkshopAdminTab({
  workshops: initial,
}: {
  workshops: Workshop[];
}) {
  const supabase = createClient();
  const [workshops, setWorkshops] = useState(initial);
  const [activeAttend, setActiveAttend] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Create workshop form state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [xpReward, setXpReward] = useState(100);

  async function toggleAttendance(workshopId: string) {
    const isActive = activeAttend === workshopId;
    setLoadingId(workshopId);

    const res = await fetch("/api/admin/workshop-attend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workshopId, activate: !isActive }),
    });

    const data = await res.json();
    if (data.success) {
      setActiveAttend(isActive ? null : workshopId);
      toast.success(data.message);
    } else {
      toast.error(data.error);
    }
    setLoadingId(null);
  }

  async function createWorkshop(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setCreating(true);

    const { data, error } = await supabase.from("workshops").insert({
      title: title.trim(),
      workshop_date: date,
      location: location.trim() || null,
      xp_reward: xpReward,
      late_xp_reward: Math.floor(xpReward / 2),
      is_published: true,
    }).select().single();

    if (error) {
      toast.error(error.message);
    } else if (data) {
      setWorkshops((prev) => [data, ...prev]);
      setTitle(""); setDate(""); setLocation(""); setXpReward(100);
      setShowCreate(false);
      toast.success("Workshop created");
    }
    setCreating(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* NFC attendance info box */}
      <div className="border border-[#dcf763]/10 bg-[#dcf763]/[0.03] p-4">
        <div className="flex items-start gap-3">
          <Radio size={14} className="text-[#dcf763]/60 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-mono text-xs text-[#dcf763]/70 mb-1">// NFC ATTENDANCE MODE</p>
            <p className="font-mono text-[10px] text-[#555] leading-relaxed">
              Click <span className="text-[#ebebeb]">Activate NFC</span> next to a workshop to redirect ALL member cards
              to the attendance check-in page. Members tap their card at the entrance and are checked in instantly.
              Click again to restore profiles.
            </p>
          </div>
        </div>
      </div>

      {/* Create new workshop */}
      <div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 btn-ghost px-4 py-2.5 rounded-none font-michroma text-xs tracking-widest"
        >
          <Plus size={13} /> New Workshop
        </button>

        {showCreate && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={createWorkshop}
            className="border border-[#1a1a1a] bg-[#080808] p-5 mt-3 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="font-mono text-[9px] text-[#444] tracking-widest uppercase block mb-2">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Intro to Next.js 15" required
                  className="input-dark w-full px-3 py-2.5 rounded-none font-inter text-sm" />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[#444] tracking-widest uppercase block mb-2">Date</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required
                  className="input-dark w-full px-3 py-2.5 rounded-none font-mono text-xs" />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[#444] tracking-widest uppercase block mb-2">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="CS Lab 3, Block A"
                  className="input-dark w-full px-3 py-2.5 rounded-none font-mono text-xs" />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[#444] tracking-widest uppercase block mb-2">
                  XP Reward (on-time)
                </label>
                <input type="number" value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))}
                  min={10} max={500} step={10}
                  className="input-dark w-full px-3 py-2.5 rounded-none font-mono text-xs" />
              </div>
              <div className="flex items-end">
                <p className="font-mono text-[10px] text-[#444]">
                  Late XP: <span className="text-[#dcf763]">{Math.floor(xpReward / 2)}</span> (auto, half of on-time)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating}
                className="btn-neon px-6 py-2.5 font-michroma text-xs tracking-widest rounded-none flex items-center gap-2 disabled:opacity-40">
                {creating ? <><Loader2 size={12} className="animate-spin" /> Creating...</> : "Create Workshop →"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="btn-ghost px-4 py-2.5 font-michroma text-xs tracking-widest rounded-none">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Workshop list */}
      <div className="space-y-2">
        {workshops.length === 0 && (
          <p className="font-mono text-xs text-[#444] text-center py-8">No workshops yet. Create one above.</p>
        )}

        {workshops.map((ws) => {
          const isActive = activeAttend === ws.id;
          const isLoading = loadingId === ws.id;
          const wsDate = new Date(ws.workshop_date).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          });

          return (
            <div key={ws.id}
              className={`border p-4 flex items-center justify-between gap-4 transition-all ${
                isActive ? "border-[#dcf763]/30 bg-[#dcf763]/5" : "border-[#1a1a1a] bg-[#080808]"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-michroma text-sm text-[#ebebeb] truncate mb-1">{ws.title}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[#444]">
                    <CalendarDays size={10} />
                    <span className="font-mono text-[9px]">{wsDate}</span>
                  </div>
                  {ws.location && (
                    <span className="font-mono text-[9px] text-[#333]">{ws.location}</span>
                  )}
                  <span className="font-mono text-[9px] text-[#dcf763]/60">{ws.xp_reward} XP</span>
                </div>
              </div>

              <button
                onClick={() => toggleAttendance(ws.id)}
                disabled={isLoading || (activeAttend !== null && activeAttend !== ws.id)}
                className={`flex items-center gap-2 px-4 py-2 font-michroma text-[10px] tracking-widest rounded-none border transition-all flex-shrink-0 disabled:opacity-30 ${
                  isActive
                    ? "border-[#dcf763] bg-[#dcf763] text-black"
                    : "border-[#2a2a2a] text-[#555] hover:border-[#dcf763]/40 hover:text-[#dcf763]"
                }`}
              >
                {isLoading
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Radio size={11} className={isActive ? "animate-pulse" : ""} />
                }
                {isActive ? "NFC ACTIVE" : "Activate NFC"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

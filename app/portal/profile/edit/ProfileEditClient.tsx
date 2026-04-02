"use client";

import { useState, useRef, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Loader2, Plus, X, Github, Linkedin, Globe, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import PortalShell from "@/components/PortalShell";

const VISIBILITY_OPTIONS = [
  { value: "public",     label: "Public",     desc: "Full profile visible on NFC tap" },
  { value: "networking", label: "Networking",  desc: "Name + role only, no details" },
  { value: "ghost",      label: "Ghost",       desc: "Mystery page — no info shown" },
];

const ARCHETYPE_OPTIONS = [
  { value: "builder",   label: "🛠 Builder",   desc: "Ships projects consistently" },
  { value: "scholar",   label: "📚 Scholar",   desc: "Attends everything, reads deeply" },
  { value: "connector", label: "🤝 Connector", desc: "Bridges people and subgroups" },
  { value: "speaker",   label: "🎤 Speaker",   desc: "Leads talks and workshops" },
  { value: "debugger",  label: "🐛 Debugger",  desc: "Helps others solve problems" },
  { value: "creative",  label: "🎨 Creative",  desc: "Design, UI/UX, visual work" },
  { value: "shadow",    label: "👻 Shadow",    desc: "High skill, low visibility" },
];

interface ProfileEditClientProps {
  member: {
    id: string; uid: string; full_name: string; role: string; batch_year: number | null;
    profiles: {
      bio?: string | null; github_url?: string | null; linkedin_url?: string | null;
      portfolio_url?: string | null; avatar_url?: string | null;
      visibility_mode?: string | null; archetype_primary?: string | null;
      skills_raw?: string[] | null;
    } | null;
  };
}

export default function ProfileEditClient({ member }: ProfileEditClientProps) {
  const p = member.profiles;
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [bio, setBio] = useState(p?.bio ?? "");
  const [github, setGithub] = useState(p?.github_url ?? "");
  const [linkedin, setLinkedin] = useState(p?.linkedin_url ?? "");
  const [portfolio, setPortfolio] = useState(p?.portfolio_url ?? "");
  const [visibility, setVisibility] = useState(p?.visibility_mode ?? "public");
  const [archetype, setArchetype] = useState(p?.archetype_primary ?? "");
  const [skills, setSkills] = useState<string[]>(p?.skills_raw ?? []);
  const [newSkill, setNewSkill] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(p?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${member.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) { toast.error(error.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl);
    setUploading(false);
    toast.success("Avatar uploaded");
  }

  function addSkill() {
    const s = newSkill.trim().toLowerCase();
    if (!s || skills.includes(s) || skills.length >= 20) return;
    setSkills([...skills, s]);
    setNewSkill("");
  }

  async function handleSave() {
    startTransition(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio: bio.trim() || null,
          github_url: github.trim() || null,
          linkedin_url: linkedin.trim() || null,
          portfolio_url: portfolio.trim() || null,
          visibility_mode: visibility as "public" | "networking" | "ghost",
          archetype_primary: archetype || null,
          skills_raw: skills,
          avatar_url: avatarUrl || null,
        })
        .eq("member_id", member.id);

      if (error) { toast.error(error.message); return; }
      toast.success("Profile saved");
      router.push(`/u/${member.uid}`);
    });
  }

  return (
    <PortalShell memberId={member.id} memberName={member.full_name} memberRole={member.role} memberUid={member.uid}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 font-mono text-xs text-[#555] hover:text-neon transition-colors mb-8"
        >
          <ArrowLeft size={12} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div>
            <p className="font-mono text-[10px] text-neon/60 tracking-widest mb-1">// PROFILE.EDIT()</p>
            <h1 className="font-michroma text-2xl text-off-white">Edit Profile</h1>
          </div>

          {/* ── Avatar ── */}
          <Section label="Avatar">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-sm border border-border bg-surface overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-michroma font-bold text-xl text-neon">
                    {getInitials(member.full_name)}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <Loader2 size={16} className="text-neon animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 btn-ghost px-4 py-2.5 text-xs font-mono rounded-none mb-2"
                  disabled={uploading}
                >
                  <Camera size={13} /> Upload Photo
                </button>
                <p className="font-mono text-[10px] text-[#444]">JPG or PNG · Max 2MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </Section>

          {/* ── Bio ── */}
          <Section label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Full-stack dev obsessed with developer tooling. Final year BCA. Building in public."
              className="input-dark w-full px-4 py-3 rounded-none font-inter text-sm resize-none"
            />
            <p className="font-mono text-[10px] text-[#444] mt-1.5 text-right">{bio.length}/200</p>
          </Section>

          {/* ── Social Links ── */}
          <Section label="Social Links">
            <div className="space-y-3">
              {[
                { icon: <Github size={14} />, value: github, setter: setGithub, placeholder: "https://github.com/username" },
                { icon: <Linkedin size={14} />, value: linkedin, setter: setLinkedin, placeholder: "https://linkedin.com/in/username" },
                { icon: <Globe size={14} />, value: portfolio, setter: setPortfolio, placeholder: "https://yourportfolio.dev" },
              ].map(({ icon, value, setter, placeholder }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[#444]">{icon}</span>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="input-dark flex-1 px-3 py-2.5 rounded-none font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* ── Skills ── */}
          <Section label={`Skills (${skills.length}/20)`}>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
              {skills.map((skill) => (
                <span key={skill} className="skill-pill flex items-center gap-1.5 pr-1.5">
                  {skill}
                  <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="text-neon/50 hover:text-neon transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="javascript, react, python..."
                className="input-dark flex-1 px-3 py-2.5 rounded-none font-mono text-xs"
                maxLength={30}
              />
              <button onClick={addSkill} className="btn-ghost px-3 py-2.5 rounded-none">
                <Plus size={14} />
              </button>
            </div>
          </Section>

          {/* ── Archetype ── */}
          <Section label="Developer Archetype">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ARCHETYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setArchetype(archetype === opt.value ? "" : opt.value)}
                  className={cn(
                    "text-left p-3 border rounded-none transition-all",
                    archetype === opt.value
                      ? "border-neon/50 bg-neon/8 text-neon"
                      : "border-border bg-surface text-[#555] hover:border-border-light hover:text-light"
                  )}
                >
                  <p className="font-mono text-xs mb-0.5">{opt.label}</p>
                  <p className="font-inter text-[10px] text-[#444] leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* ── Visibility ── */}
          <Section label="NFC Card Visibility">
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 border rounded-none transition-all text-left",
                    visibility === opt.value
                      ? "border-neon/40 bg-neon/5"
                      : "border-border bg-surface hover:border-border-light"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 flex-shrink-0",
                    visibility === opt.value ? "border-neon bg-neon" : "border-[#444]"
                  )} />
                  <div>
                    <p className={cn("font-michroma text-xs", visibility === opt.value ? "text-neon" : "text-light")}>
                      {opt.label}
                    </p>
                    <p className="font-mono text-[10px] text-[#444] mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* ── Save ── */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="btn-neon px-8 py-3.5 font-michroma text-xs tracking-widest rounded-none flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : "Save Profile →"}
            </button>
            <button
              onClick={() => router.back()}
              className="btn-ghost px-6 py-3.5 font-michroma text-xs tracking-widest rounded-none"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </PortalShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-[#444] tracking-widest uppercase">{label}</span>
        <div className="flex-1 h-px bg-[#1a1a1a]" />
      </div>
      {children}
    </div>
  );
}

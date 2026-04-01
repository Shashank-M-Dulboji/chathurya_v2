# CHATHURYA — Student Developers Club

> NFC Ecosystem · Member Portal · Community OS

Built on **Next.js 15 + Supabase + TypeScript + Tailwind CSS + Framer Motion**

---

## QUICK START (Day 1 of sprint)

### 1. Clone & install

```bash
# 1. Download this project
cd chathurya
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `chathurya`, pick a region close to Bengaluru (`ap-south-1`)
3. **SQL Editor** → New query → paste contents of `supabase/schema.sql` → Run
4. **Storage** → Create buckets:
   - `avatars` (public)
   - `gallery` (public)
   - `workshop-resources` (private)
5. **Settings → API** → copy URL and anon key

### 3. Environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 4. Add fonts

Place your Ronzino font files in `public/fonts/`:
```
public/
  fonts/
    ronzino.woff2        ← your WOFF2 file
    ronzino.otf          ← your OTF file
    ronzino-bold.woff2   ← bold variant
    ronzino-bold.otf
```

> If you only have one weight, duplicate it for both regular and bold.

### 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## PROJECT STRUCTURE

```
chathurya/
├── app/
│   ├── public-site/          # Public marketing website
│   │   ├── page.tsx          # Homepage (Hero, About, Workshops, Join)
│   │   └── components/
│   │       ├── Navbar.tsx
│   │       ├── Hero.tsx      # Glitch logo + particle bg
│   │       ├── StatsBar.tsx  # Animated counters
│   │       ├── AboutSection.tsx
│   │       ├── WorkshopsSection.tsx
│   │       ├── JoinSection.tsx
│   │       └── Footer.tsx
│   │
│   ├── u/[uid]/              # NFC profile pages (public)
│   │   ├── page.tsx          # Server component — fetches member data
│   │   └── ProfileView.tsx   # Client component — renders profile
│   │
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx      # Email + OTP 2FA login
│   │
│   ├── portal/               # Auth-gated member portal
│   │   └── dashboard/
│   │       ├── page.tsx      # Server component — fetches data
│   │       └── DashboardClient.tsx
│   │
│   ├── api/
│   │   └── admin/
│   │       ├── invite/route.ts        # Bulk invite API
│   │       └── nfc-redirect/route.ts  # Dynamic NFC redirect control
│   │
│   ├── globals.css           # Design system: fonts, animations, utilities
│   └── layout.tsx            # Root layout
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client (use in "use client")
│   │   └── server.ts         # Server client (use in Server Components)
│   └── utils.ts              # cn(), formatXP(), generateUID(), etc.
│
├── middleware.ts              # Auth protection + session refresh
├── types/database.ts          # Supabase TypeScript types
├── supabase/schema.sql        # Complete DB schema + RLS policies
├── tailwind.config.ts         # Full design system tokens
└── .env.example
```

---

## NFC CARD SETUP

### Writing cards with NFC Tools Pro

1. Install **NFC Tools Pro** (free, iOS/Android)
2. Open app → **Write** → **Add a record** → **URL**
3. Enter: `https://chathurya.vercel.app/u/MEMBER_UID`
   - Replace `MEMBER_UID` with the member's 6-char uid from the database
4. Tap the NTAG216 card to write
5. Test by tapping with a phone — should open the profile

### Generating QR codes for card printing

```bash
# Install qrcode CLI
npm install -g qrcode

# Generate QR for one member
qrcode "https://chathurya.vercel.app/u/xK9mP2" -o member-xK9mP2.png

# Or use the /portal/nfc page in the app (generates QR in browser)
```

### Printing cards

Search "NFC PVC card printing Bengaluru" — SP Road area shops do Variable Data Printing (VDP).
Provide them:
1. Your card design (Figma/PNG)
2. A CSV with `uid, member_name, qr_data` per row
3. They print unique QR per card at no extra cost

**Estimated cost:** ₹60–90/card for 100 cards

---

## DEPLOY TO VERCEL

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "init: chathurya v1"
git remote add origin https://github.com/YOUR_USERNAME/chathurya.git
git push -u origin main

# 2. Go to vercel.com → New Project → Import your repo

# 3. Add environment variables in Vercel dashboard:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    NEXT_PUBLIC_APP_URL=https://chathurya.vercel.app

# 4. Deploy — auto-deploys on every push to main
```

---

## ADDING THE FIRST LEAD ACCOUNT

Since it's invite-only, the first account needs a manual setup:

```sql
-- In Supabase SQL Editor:

-- 1. Create the member record (after you sign up via Supabase Auth)
INSERT INTO members (id, uid, email, full_name, role, batch_year)
VALUES (
  auth.uid(),  -- Your Supabase auth user ID
  'YOURUID',   -- Pick a 6-char uid for yourself
  'your@email.com',
  'Your Name',
  'Lead',
  2024
);

-- 2. Your profile is auto-created by the trigger
-- 3. You can now use the admin panel to invite others
```

---

## ONBOARDING 100 EXISTING MEMBERS

1. Export your Google Form responses as CSV
2. CSV format expected:
   ```
   name,email,batch_year,role
   "Priya Sharma","priya@example.com",2023,"Member"
   ```
3. Go to Admin Dashboard → Bulk Import → Upload CSV
4. System generates UIDs + invite tokens + sends emails in batch
5. Members sign in, create profiles, get their NFC cards

---

## 10-DAY SPRINT CHECKLIST

```
Day 1: [ ] npm install  [ ] Supabase project setup  [ ] schema.sql run  [ ] Vercel deploy skeleton
Day 2: [ ] Auth flow working  [ ] OTP email received  [ ] Login → dashboard
Day 3: [ ] Profile create/edit  [ ] Avatar upload working  [ ] /u/[uid] renders
Day 4: [ ] NFC write tested on phone  [ ] Ghost mode works  [ ] Dynamic redirect tested
Day 5: [ ] Bulk import working  [ ] Invite emails sent  [ ] Admin panel member list
Day 6: [ ] XP transactions  [ ] Badge award  [ ] Leaderboard realtime
Day 7: [ ] Hero + About + Workshops sections live
Day 8: [ ] Framer Motion animations  [ ] Mobile tested  [ ] Glitch effect smooth
Day 9: [ ] Full QA on iOS/Android/Chrome/Safari  [ ] NFC tap-to-profile flow
Day 10:[ ] Cards written + printed  [ ] 3 leads onboarded  [ ] 100 invites sent
```

---

## PAGES TO BUILD NEXT (post-sprint)

| Page | Route | Priority |
|------|-------|----------|
| Profile edit | `/portal/profile/edit` | High |
| Workshop RSVP | `/portal/workshops` | High |
| Endorse peer | `/endorse/[uid]` | High |
| Skill tree | `/portal/skills` | Medium |
| NFC QR page | `/portal/nfc` | Medium |
| Resource vault | `/portal/resources` | Medium |
| Admin panel | `/admin` | High |
| Leaderboard | `/portal/leaderboard` | Medium |

---

## DESIGN NOTES

**Fonts:** Ronzino (display + headings), Inter (body), JetBrains Mono (code/labels)

**Colors:**
| Token | Value | Use |
|-------|-------|-----|
| `neon` | `#dcf763` | Primary accent, CTAs |
| `black` | `#0a0a0a` | Background |
| `dark` | `#111111` | Cards, sidebar |
| `surface` | `#1a1a1a` | Inputs, hover states |
| `off-white` | `#f1f2ee` | Primary text |
| `muted` | `#848c8e` | Secondary text |
| `slate` | `#435058` | Tertiary text |

**Design inspiration:** zkpass.org (typography scale, ALL-CAPS headings) + ctxdc.com (code-syntax UI aesthetic)

---

Built with ∞ by Chathurya SDC · Seshadripuram College · Bengaluru

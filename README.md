# ⚡ Upday — Habit · Task · Planner

All-in-one daily productivity PWA dibangun dengan React + Vite + Supabase.

---

## 🚀 Quick Start (VSCode)

### 1. Clone & Install
```bash
git clone https://github.com/USERNAME/upday.git
cd upday
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```
Buka `.env` dan isi:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Dapatkan dari: Supabase Dashboard → Settings → API

### 3. Setup Database Supabase
1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor**
3. Copy seluruh isi `supabase-schema.sql` → Paste → **Run**
4. Semua tabel, RLS, dan trigger otomatis terbuat

### 4. Jalankan Dev Server
```bash
npm run dev
```
Buka `http://localhost:5173`

---

## 📁 Struktur Project

```
upday/
├── src/
│   ├── components/
│   │   ├── ui/          # Shared UI (AppLayout, Sheet, Toggle, dll)
│   │   ├── home/        # Home screen components
│   │   ├── planner/     # Planner & timeline
│   │   ├── habits/      # Habit tracker
│   │   ├── tasks/       # Task manager
│   │   ├── stats/       # Statistics
│   │   └── modals/      # Shared modals
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase client, theme constants
│   ├── pages/           # Route-level pages + AppRouter
│   ├── stores/          # Zustand global state
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   └── styles/          # globals.css
├── public/
│   └── icons/           # PWA icons (192x192, 512x512)
├── supabase-schema.sql  # Jalankan di Supabase SQL Editor
├── vercel.json
├── vite.config.ts
└── .env.example
```

---

## 🌐 Deploy ke Vercel

### Cara 1 — Via GitHub (Recommended)
1. Push ke GitHub: `git push origin main`
2. Buka [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Klik **Deploy** → selesai!

### Cara 2 — Via CLI
```bash
npm i -g vercel
vercel --prod
```

---

## 📱 Install sebagai APK di Android

1. Buka URL Vercel di **Chrome Android**
2. Tap menu ⋮ → **"Add to Home screen"**
3. Konfirmasi → app terinstall seperti APK native!

---

## 🛠️ Tech Stack

| Layer       | Tech                        |
|-------------|----------------------------|
| Frontend    | React 18 + TypeScript       |
| Build       | Vite 5                      |
| Styling     | Tailwind CSS v3             |
| Database    | Supabase (PostgreSQL)       |
| Auth        | Supabase Auth               |
| State       | Zustand                     |
| Routing     | React Router v6             |
| PWA         | vite-plugin-pwa             |
| Deploy      | Vercel                      |

---

## 📋 Fitur

- ✅ Task + subtask + prioritas + recurring + reminder
- 📅 Planner harian mirip Google Calendar (drag & drop)
- 🔥 Habit tracker + streak + freeze + kalender history
- 📊 Stats & productivity score
- ☀️ Daily briefing otomatis
- 🌙 Dark / Light mode
- 📱 PWA — installable di Android
- 🔒 Auth per user (Supabase RLS)

# Adaptivly — Deployment Guide

## Overview

This guide walks you through deploying Adaptivly to production using:
- **Supabase** — Database + Auth (free tier)
- **Railway** — Full-stack hosting (free tier)
- **Gemini API** — AI features (free quota)
- **Judge0 RapidAPI** — Code execution (free tier)

---

## Step 1 — Supabase Setup (15 min)

### 1.1 Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and click **New project**
2. Choose a name, region, and strong database password
3. Wait for the project to provision (~2 minutes)

### 1.2 Run Database Migrations

In the Supabase dashboard → **SQL Editor** → **New query**:

**Run these in order:**
1. Copy & paste contents of `supabase/migrations/001_schema.sql` → Run
2. Copy & paste contents of `supabase/migrations/002_functions.sql` → Run
3. Copy & paste contents of `supabase/seed.sql` → Run (seeds 10 problems)

### 1.3 Get your API keys

**Project Settings → API:**
- `SUPABASE_URL` → Project URL (e.g. `https://abcxyz.supabase.co`)
- `SUPABASE_ANON_KEY` → `anon` key (public — safe for frontend)
- `SUPABASE_SERVICE_KEY` → `service_role` key (secret — server only)

### 1.4 Enable Google OAuth (optional)

**Authentication → Providers → Google:**
1. Enable Google provider
2. Add your Google OAuth credentials (from [console.cloud.google.com](https://console.cloud.google.com))
3. Add redirect URL: `https://your-app.railway.app/dashboard`

---

## Step 2 — Get API Keys

### Google Gemini (AI Tutor, YouTube Summarizer, Mock Interviews)
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key → `GEMINI_API_KEY`

> Free tier: 15 requests/minute, 1M tokens/day — sufficient for development and light production use.

### Judge0 (Code Execution)
1. Go to [https://rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up and subscribe to the free plan
3. Copy your **RapidAPI key** → `JUDGE0_API_KEY`

> Free tier: 100 requests/day. For heavier usage, self-host Judge0 via Docker.

---

## Step 3 — Local Development Setup

### 3.1 Create `.env` file

```bash
# Copy the example file
cp .env.example .env
```

Fill in your keys in `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

GEMINI_API_KEY=your-gemini-key

JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key

APP_URL=http://localhost:3000
```

### 3.2 Start dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Step 4 — Railway Deployment

### 4.1 Install Railway CLI (optional)

```bash
npm install -g @railway/cli
railway login
```

### 4.2 Deploy via GitHub (recommended)

1. Push your code to GitHub
2. Go to [https://railway.app](https://railway.app) → **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your repository

### 4.3 Set Environment Variables in Railway

In your Railway project → **Variables**, add:

```
SUPABASE_URL          = https://your-project.supabase.co
SUPABASE_ANON_KEY     = your-anon-key
SUPABASE_SERVICE_KEY  = your-service-role-key

VITE_SUPABASE_URL     = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key

GEMINI_API_KEY        = your-gemini-key

JUDGE0_API_URL        = https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY        = your-rapidapi-key

APP_URL               = https://your-app.railway.app
NODE_ENV              = production
```

### 4.4 Configure Build & Start Commands

Railway should auto-detect from `railway.toml`, but verify in **Settings → Build**:
- **Build command:** `npm run build`
- **Start command:** `node .output/server/index.mjs`

### 4.5 Set Custom Domain (optional)

**Settings → Domains → Add Custom Domain**

---

## Step 5 — Update Supabase Auth Redirect URLs

After Railway assigns your URL (e.g. `https://adaptivly.railway.app`):

1. Supabase → **Authentication → URL Configuration**
2. Add to **Redirect URLs:**
   - `https://adaptivly.railway.app/dashboard`
   - `https://adaptivly.railway.app/verify-email`

---

## Architecture Diagram

```
Browser (React)
    ↓ VITE_SUPABASE_ANON_KEY
Supabase Auth ←→ AuthProvider (JWT token)
    ↓ token passed to createServerFn()
Nitro Server (Railway)
    ├── server/functions/auth.ts      → Supabase Auth
    ├── server/functions/dashboard.ts → Supabase DB
    ├── server/functions/practice.ts  → Supabase DB + Judge0
    ├── server/functions/ai-tutor.ts  → Supabase DB + Gemini
    ├── server/functions/youtube.ts   → youtube-transcript + Gemini
    ├── server/functions/flashcards.ts → Supabase DB (SM-2)
    ├── server/functions/notes.ts     → Supabase DB
    ├── server/functions/planner.ts   → Supabase DB
    ├── server/functions/analytics.ts → Supabase DB
    ├── server/functions/mock-interviews.ts → Supabase DB + Gemini
    └── server/functions/achievements.ts   → Supabase DB
         ↓ SUPABASE_SERVICE_KEY
    Supabase PostgreSQL (hosted)
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `Missing SUPABASE_URL` error | Make sure `.env` exists and has been filled in |
| `UNAUTHORIZED` from server functions | User's JWT has expired — they need to log in again |
| AI Tutor returns error | Check `GEMINI_API_KEY` is set and has quota |
| Code execution fails | Check `JUDGE0_API_KEY` is set; free tier is 100/day |
| Build fails on Railway | Check Railway build logs; ensure `npm run build` works locally first |
| Auth redirect loops | Verify Supabase redirect URL includes your Railway domain |

---

## File Structure Added

```
src/
  hooks/use-auth.tsx              ← Client session hook
  server/
    db.ts                         ← Supabase server client
    auth.ts                       ← JWT validation helpers
    functions/
      auth.ts                     ← Sign up/in/out
      dashboard.ts                ← Stats, heatmap, recommendations
      practice.ts                 ← Problems, code run/submit
      ai-tutor.ts                 ← Chat sessions, Gemini responses
      youtube.ts                  ← Transcript + AI summary
      flashcards.ts               ← SM-2 spaced repetition
      notes.ts                    ← Note CRUD + search
      planner.ts                  ← Task scheduling
      analytics.ts                ← All chart data
      mock-interviews.ts          ← AI interview sessions
      achievements.ts             ← Badge system

supabase/
  migrations/
    001_schema.sql               ← All tables + RLS
    002_functions.sql            ← SQL helper functions
  seed.sql                       ← 10 seed problems

railway.toml                     ← Railway deployment config
.env.example                     ← Environment variable template
DEPLOYMENT.md                    ← This file
```

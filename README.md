# 🚀 Adaptivly — Adaptive AI Learning & Technical Interview Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.168-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://aistudio.google.com/)
[![Judge0](https://img.shields.io/badge/Judge0-Code_Execution-000000?style=for-the-badge&logo=codeforces&logoColor=white)](https://judge0.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

---

## 📌 Project Header & Overview

### Business Logic & Purpose

**Adaptivly** is an end‑to‑end, AI‑powered adaptive learning ecosystem and technical interview preparation platform. It continuously monitors user performance, error patterns, speed metrics, and topic accuracy to construct personalized learning trajectories. Powered by **Google Gemini 2.5**, **Judge0 Code Execution Engine**, **Supabase PostgreSQL**, and now a **FastAPI gateway** that serves an adaptive difficulty model trained with a Random Forest classifier.

---

### ✨ Core User‑Facing Features

- 🎯 **Adaptive Dashboard & Performance Heatmap** – real‑time streaks, contribution heatmaps, XP levels, and Gemini‑generated learning recommendations.
- 💻 **Interactive Multi‑Language Coding IDE** – Monaco editor, Judge0 sandbox, runtime/memory metrics.
- 🤖 **24/7 Context‑Aware Gemini CS Tutor** – explain code, optimize complexity, debug errors, system‑design advice.
- 🎙️ **AI Technical Mock Interviewer** – multi‑turn interview sessions with automated grading.
- 📺 **YouTube Video to Interactive Study Guide** – transcript extraction → Gemini summary → auto‑generated quizzes.
- 🎴 **SM‑2 Spaced‑Repetition Flashcards** – AI‑generated cards, mastery analytics.
- 📅 **Intelligent Study Planner** – priority queues, deadlines, streak triggers.
- 📊 **Diagnostic Assessments & Learning Paths** – baseline quizzes → curriculum roadmaps.
- 🏆 **Gamification & Leaderboards** – XP, streak retention, achievement badges.

---

## 🧭 Adaptive Recommendation Service (New)

A lightweight **FastAPI** service (`main.py`) has been added to expose the trained Random Forest model (`adaptive_model.pkl`). It provides a `POST /predict` endpoint that receives telemetry (`past_accuracy`, `avg_runtime_ms`, `current_difficulty`) and returns a recommended difficulty tier (1 = Easy, 2 = Medium, 3 = Hard). The server‑side action `getAdaptiveRecommendation` in `src/server-actions/adaptive-dashboard.ts` now:

1. Queries the Supabase `submissions` table for live telemetry.
2. Calls the FastAPI gateway (`http://localhost:8000/predict`).
3. Passes the recommendation to Google Gemini, which crafts a personalized tutoring message.

This decouples the ML inference layer from the Nitro server, allowing independent scaling and easier experimentation.

---

## 🛠️ Tech Stack & Ecosystem

| Layer | Technology / Library | Version | Purpose & Integration |
|---|---|---|---|
| **Frontend Framework** | [React](https://react.dev/) | `^19.2.0` | Core UI rendering library using functional components & hooks |
| **Routing & SSR** | [TanStack React Router](https://tanstack.com/router) | `^1.170.16` | Type‑safe file‑based routing and layout management |
| **Full‑Stack Framework** | [TanStack React Start](https://tanstack.com/start) | `^1.168.26` | SSR framework powered by Nitro server engine |
| **State & Data Fetching** | [TanStack React Query](https://tanstack.com/query) | `^5.101.1` | Asynchronous server‑state caching, invalidation & optimistic updates |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) | `^4.2.1` | Utility‑first styling engine |
| **UI Component Library** | [Radix UI Primitives](https://www.radix-ui.com/) | `Latest` | Accessible, unstyled UI primitives |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) | `^4.7.0` | VS Code‑powered browser editor |
| **Data Visualization** | [Recharts](https://recharts.org/) | `^2.15.4` | Responsive SVG charts |
| **Forms & Validation** | React Hook Form + Zod | `^7.71.2` / `^3.24.2` | Type‑safe form management |
| **Icons & Notifications** | Lucide React + Sonner | `^0.575.0` / `^2.0.7` | SVG icons & toast manager |
| **Backend Runtime** | Nitro Engine | `3.0.260603-beta` | Server engine powering TanStack Start functions |
| **Language & Compiler** | TypeScript | `^5.8.3` | End‑to‑end static typing |
| **Database & Auth** | Supabase PostgreSQL | `^2.110.8` | Row‑Level Security & Auth JWTs |
| **AI Intelligence** | Google Gemini API | `^2.13.0` / `^0.24.1` | Tutoring, interview grading, recommendations |
| **Code Execution API** | Judge0 CE API | RapidAPI | Sandbox execution |
| **Video Processing** | YouTube Transcript | `^1.3.1` | Transcript scraping |
| **FastAPI Service** | FastAPI + Uvicorn | `0.111.0` / `0.25.0` | Adaptive difficulty model serving |
| **Build & Bundler** | Vite | `^8.0.16` | Frontend build tool |
| **Hosting & DevOps** | Railway PaaS | `railway.toml` | Production deployment |

---

## 💻 Local Setup & Environment Guide (Updated)

### 📋 Prerequisites

- **Node.js** `v20+` (or `v22+` recommended)
- **Package Manager**: `npm` (v10+) or **Bun** (v1.1+)
- **Python** `3.11+` (for the FastAPI service)
- **Git** (latest)
- **Supabase Account** – free tier project
- **Google Gemini API Key**
- **Judge0 RapidAPI Key**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/adaptivly-mastered.git
cd adaptivly-mastered
```

### 2️⃣ Install JavaScript/TypeScript Dependencies
```bash
npm install   # or `bun install`
```

### 3️⃣ Install Python Dependencies (FastAPI Service)
```bash
python -m venv .venv
source .venv/bin/activate   # on Windows: .venv\Scripts\activate
pip install fastapi uvicorn joblib scikit-learn pandas datasets
```

### 4️⃣ Environment Variables Configuration
```bash
cp .env.example .env
# Edit `.env` and fill in the values (Supabase, Gemini, Judge0, etc.)
```
Key additions for the new service:
```env
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
```

### 5️⃣ Database Setup & SQL Migrations
1. Open your Supabase dashboard.
2. In **SQL Editor → New query**, run the migration files in `./supabase/migrations/` **in order** (001 → 004 → 005).
3. Run `supabase/seed.sql` to load initial problems and starter code.

### 6️⃣ Train / Load the Adaptive Model (one‑time step)
The repository already contains a pre‑trained `adaptive_model.pkl`. If you wish to re‑train:
```bash
python train_knowledge_tracing.py
```
The script will output `adaptive_model.pkl` in the project root.

### 7️⃣ Run the FastAPI Gateway (in a separate terminal)
```bash
uvicorn main:app --host $FASTAPI_HOST --port $FASTAPI_PORT
# default: http://localhost:8000
```
You should see a Swagger UI at `http://localhost:8000/docs`.

### 8️⃣ Launch the Adaptivly Development Server
```bash
npm run dev   # or `bun run dev`
```
Open **http://localhost:3000** in your browser. The dashboard will now fetch difficulty recommendations from the FastAPI service.

---

## 🚀 Deployment Guide (Updated)

### Containerisation
A multi‑stage Dockerfile is recommended:
1. **Stage 1** – Build the React/TanStack assets with `npm run build`.
2. **Stage 2** – Install Python dependencies and copy `adaptive_model.pkl`.
3. **Stage 3** – Run both Nitro (Node) and FastAPI (Python) processes using a lightweight process manager like `supervisord` or `pm2`.

Sample snippets (add to `Dockerfile`):
```dockerfile
# Stage 1 – Frontend build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 – Python env for FastAPI
FROM python:3.11-slim AS pybuilder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY adaptive_model.pkl .
COPY main.py .

# Stage 3 – Runtime
FROM alpine:3.20
WORKDIR /app
# Copy built assets
COPY --from=builder /app/.output .output
# Copy Python env
COPY --from=pybuilder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=pybuilder /app .
EXPOSE 3000 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 & node .output/server/index.mjs"]
```

### Railway (or similar PaaS) Adjustments
1. Add two environment variables for the FastAPI service (`FASTAPI_HOST`, `FASTAPI_PORT`).
2. In the Railway `build` step, ensure both `npm run build` **and** `pip install` are executed.
3. Expose ports `3000` (Nitro) and `8000` (FastAPI) in the Railway service configuration.
4. Set the **Service URL** for the front‑end to point to the same host (e.g., `https://your-app.up.railway.app`) – the FastAPI endpoint will be reachable at `https://your-app.up.railway.app/predict` because it runs on the same container.

### CI/CD Checks
- Run `npm run lint && python -m pycodestyle .` to ensure both JS/TS and Python code style compliance.
- Include a smoke test that hits `/predict` with a sample payload and asserts a `200` response.

---

## 📂 Codebase Directory Map (excerpt)

```
adaptivly-mastered/
├── main.py                     # FastAPI gateway for adaptive difficulty
├── adaptive_model.pkl          # Trained Random Forest model
├── train_knowledge_tracing.py  # Training script (Python)
├── src/
│   ├── server-actions/
│   │   └── adaptive-dashboard.ts   # Updated to call FastAPI & Gemini
│   └── ... (other modules unchanged)
└── README.md                  # Updated documentation (this file)
```

---

## 🌐 Production Deployment Guide

Adaptivly is built on **TanStack Start** with the **Nitro server engine**, enabling seamless deployment across modern cloud platforms such as **Vercel** and **Railway**.

---

### 🔺 Option 1: Deploying to Vercel (Recommended)

Vercel provides zero-configuration global edge distribution, automated SSL, and preview deployments for every pull request.

#### Step 1: Import Project to Vercel
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`adaptivly-mastered`) and click **"Import"**.

#### Step 2: Configure Build & Output Settings
Under **Project Settings** in Vercel:
- **Framework Preset**: Select **`Other`** *(do not select Vite or Next.js — TanStack Start utilizes Nitro)*.
- **Root Directory**: `./` (or leave default if the repository root contains `package.json`).
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty or `.output` *(Nitro automatically outputs to `.vercel/output` when the preset is configured)*.
- **Install Command**: `npm install`
- **Node.js Version**: **`20.x`** or higher (configured in Vercel General Settings).

#### Step 3: Add Environment Variables
In the **Environment Variables** section of your Vercel project, configure the following keys:

| Key | Example Value | Description |
|---|---|---|
| `NITRO_PRESET` | `vercel` | **Critical**: Tells the Nitro build engine to output native Vercel Serverless Functions |
| `DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS` | `1` | **Required on Vercel**: Bypasses Vercel's npm security proxy check (CVE-2026-102989 / E403 block on `@tanstack/start-server-core`) |
| `VITE_SUPABASE_URL` | `https://xyz.supabase.co` | Your Supabase project REST endpoint (client & server) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase public anonymous API key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY`| `eyJhbGciOi...` | Supabase privileged service key (server-only) |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio API key for Gemini 2.5 Flash |
| `JUDGE0_API_URL` | `https://judge0-ce.p.rapidapi.com` | Judge0 Code Execution API URL |
| `JUDGE0_API_KEY` | `your-rapidapi-key` | RapidAPI key for sandbox code test execution |
| `APP_URL` | `https://your-app.vercel.app` | Canonical production domain URL |

> [!IMPORTANT]
> - **`NITRO_PRESET=vercel`**: Required for TanStack Start to package server functions into Vercel's native `.vercel/output` structure.
> - **`DANGEROUSLY_DEPLOY_VULNERABLE_TANSTACK_START_XSS=1`**: Vercel actively blocks `npm install` with `npm error 403 Forbidden` for `@tanstack/start-server-core@1.169.17` due to advisory GHSA-qx66-fv34-fjm8. Adding this environment variable instructs Vercel's build container to bypass the proxy block and complete installation.

#### Step 4: Configure Supabase Auth Redirects
Once Vercel generates your production URL (e.g., `https://adaptivly.vercel.app`):
1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**.
2. Set **Site URL** to:
   ```
   https://your-app.vercel.app
   ```
3. In **Redirect URLs**, add the following wildcard patterns to support preview deployments and production callbacks:
   ```
   https://your-app.vercel.app/**
   https://*.vercel.app/**
   ```

#### Step 5: Deploy & Verify
1. Click **"Deploy"**. Vercel will run `npm install`, compile the Vite client assets, build the Nitro server bundle, and assign a production domain.
2. Once the build finishes, open the live link and test:
   - User Sign-Up / Login (verifies Supabase Auth & JWT cookie exchange).
   - Code IDE submission (verifies Judge0 sandbox API).
   - AI Tutor query (verifies Gemini API server function).

---

### 🚂 Option 2: Deploying to Railway (PaaS Container)

The project includes a ready-to-use [`railway.toml`](railway.toml) configuration for continuous containerized deployment:

1. Create a new project on [Railway](https://railway.app/).
2. Select **"Deploy from GitHub repo"** and choose `adaptivly-mastered`.
3. Add the required environment variables in Railway's **Variables** tab (same list as above, with `PORT=3000` and `APP_URL=https://<your-railway-domain>`).
4. Railway will automatically detect `railway.toml`, build via Nixpacks using `npm run build`, and run the production server with:
   ```bash
   node .output/server/index.mjs
   ```

---

### 🛡️ Production Verification & Sanity Checklist

Before sharing your production deployment, run through this quick sanity check:

- [ ] **Supabase RLS Policies**: Ensure SQL migrations `001_schema.sql` through `005_add_profile_onboarding_columns.sql` and `seed.sql` have been executed.
- [ ] **Auth Cookies & Sessions**: Verify users can register, choose their initial daily goal, and navigate to the dashboard without session drops.
- [ ] **Code Execution (Judge0)**: Test submitting Python and C++ code solutions to ensure RapidAPI quota is healthy.
- [ ] **AI Video Summarizer**: Test pasting a YouTube URL to confirm serverless transcript extraction and Gemini markdown generation work without timeout issues.
- [ ] **Responsive Bento Grid**: Verify the Bento dashboard scales cleanly from mobile (single column) to desktop (asymmetric 8/4 grid).

---

## 📜 License & Credits

Adaptivly is released under the MIT License. Special thanks to the open‑source communities behind React, TanStack, Supabase, FastAPI, Scikit‑Learn, and Google Gemini.

---
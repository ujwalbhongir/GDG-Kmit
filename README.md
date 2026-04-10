# ⚡ AgentX 2.0 — AI-Powered Productivity Toolkit

> **Your complete AI productivity suite.** Weather, Tasks, CSV Analytics, AI Search, Goal Tracking, and Email Notifications — all beautifully integrated into a sleek 6-tool dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GDG-KMIT/AgentX-2.0)

---

## ⚡ Quick Start (5 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/GDG-KMIT/AgentX-2.0.git
cd AgentX-2.0
npm install
```

### 2. Configure Environment (`.env.local`)
The project utilizes a `.env.local` file for credentials. 

```env
# Gemini AI (Required)
# Get a free key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_api_key_here

# Optional: Email Notifications
# Requires a Gmail address + App Password
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — your productivity toolkit is live! ⚡

---

## 🛠️ The 6-Tool Suite

AgentX 2.0 features a completely redesigned responsive **Tool-First Dashboard** with 6 powerful native modules. 

### 🌤️ Weather
Real-time weather for any city worldwide using the free [wttr.in](https://wttr.in) API.
- Temperature, feels-like, humidity, wind speed, UV index
- Recent city history for quick re-checks
- No API key required

### ✅ Tasks
Smart task management with AI-powered priority tips.
- Add, complete, and delete tasks
- **AI generates a priority tip** for every new task via Gemini
- Visual progress bar showing completion rate

### 📊 CSV Analytics
Paste CSV data and get instant AI-driven analysis.
- Row/column count, data summary
- Key insights and patterns detected
- Actionable recommendations

### 🔍 AI Search
Search any topic and get structured, intelligent summaries.
- Comprehensive 2-3 sentence answers
- Key points breakdown
- Related topics (clickable for deeper searches)

### 🎯 Goal Tracking AI
Set a goal — AI builds your personalized step-by-step roadmap.
- Gemini breaks your goal into 4-7 actionable steps
- Each step features a timeframe, priority level, and checkpoints
- Track your overall completion percentage

### 📧 Email Alerts
Get smart reminders and full goal progress reports delivered to your inbox.
- Schedule Goal Progress Reports
- Request comprehensive Daily Activity Summaries
- Beautifully formatted HTML emails sent directly via NodeMailer

---

## 🏗️ Architecture

```text
┌─────────────────┐                       ┌──────────────────┐
│   User Browser  │  POST /api/*          │  Next.js API      │
│   (React App)   │ ─────────────────►    │  Routes           │
│   (LocalStorage)│ ◄─────────────────    │                   │
└─────────────────┘   JSON response       └────────┬──────────┘
                                                    │
                                     ┌──────────────┼──────────────┐
                                     │              │              │
                                     ▼              ▼              ▼
                              ┌──────────┐  ┌──────────┐  ┌──────────┐
                              │  Gemini  │  │  wttr.in │  │  Gmail   │
                              │  (AI)    │  │ (Weather)│  │  (SMTP)  │
                              └──────────┘  └──────────┘  └──────────┘
```

---

## 🎨 Design System & State Management

AgentX 2.0 is a strictly client-side stateless application. It leverages **LocalStorage** for all memory rather than an active Database, making it lightweight and lightning fast. 

The styling architecture is built centrally inside `globals.css` using dynamic responsive layouts and a strictly tokenized color system:

| Token | Color | Usage |
|-------|-------|-------|
| `--bg` | `#0f1117` | Page background |
| `--surface` | `#151921` | Panels, overlays |
| `--card` | `#1a1f2b` | Tool Cards, inputs |
| `--accent` | `#0d9488` | Primary teal |
| `--text` | `#e4e7ec` | Primary text |

**Font:** Inter (Google Fonts)

---

## 🙏 Built With

- **[Google Gemini](https://ai.google.dev/)** — AI intelligence
- **[Next.js 15](https://nextjs.org/)** — React App Router Framework
- **[Nodemailer](https://nodemailer.com/)** — Email dispatch system
- **[Vercel](https://vercel.com/)** — Deployment

<p align="center">
  Built with ⚡ by <a href="https://github.com/GDG-KMIT">GDG KMIT</a>
</p>

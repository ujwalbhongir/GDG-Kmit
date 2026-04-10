/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                      AGENTX 2.0 CONFIGURATION                       ║
 * ║                                                                     ║
 * ║  This is the SINGLE SOURCE OF TRUTH for your entire application.    ║
 * ║  Change branding, swap AI models, toggle features, or customize     ║
 * ║  the tool suite — all without touching any React component code.    ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

const agentConfig = {

  // ─── BRANDING ───────────────────────────────────────────────────────
  // These values are reflected in the header, welcome screen,
  // meta tags, email templates, and throughout the UI.
  name: "AgentX 2.0",
  emoji: "⚡",
  tagline: "AI-Powered Productivity Toolkit",
  description:
    "Manage weather, tasks, data analytics, intelligent search, goal tracking, and email alerts — all in one place.",

  // ─── AI MODEL ───────────────────────────────────────────────────────
  // The Gemini model used by ALL AI-powered tools:
  //   • Task priority tips   (/api/chat)
  //   • CSV Analytics        (/api/tools/csv)
  //   • AI Search            (/api/tools/search)
  //   • Goal Tracking AI     (/api/goals)
  //
  // Recommended options:
  //   "gemini-2.5-flash-lite"  — Fast & free-tier friendly (default)
  //   "gemini-2.0-flash"       — Balanced speed + quality
  //   "gemini-2.5-pro"         — Most capable, higher quota usage
  model: "gemini-2.5-flash-lite",

  // ─── TOOL SUITE ─────────────────────────────────────────────────────
  // All 6 tools rendered on the dashboard grid.
  //   id    → Internal route key (must match the activeTool logic in page.js)
  //   icon  → Emoji displayed on the card and workspace header
  //   title → Card heading
  //   desc  → One-line subtitle under the title
  //   color → Accent color for the left-border highlight & icon background
  tools: [
    { id: "weather", icon: "🌤️", title: "Weather",        desc: "Real-time weather for any city worldwide",              color: "#60a5fa" },
    { id: "tasks",   icon: "✅",  title: "Tasks",          desc: "Manage tasks with AI-powered priority tips",            color: "#34d399" },
    { id: "csv",     icon: "📊",  title: "CSV Analytics",  desc: "Paste data and get instant AI-driven analysis",         color: "#fbbf24" },
    { id: "search",  icon: "🔍",  title: "AI Search",      desc: "Intelligent search with structured summaries",          color: "#0d9488" },
    { id: "goals",   icon: "🎯",  title: "Goal Tracking",  desc: "Set goals and get AI-powered step-by-step roadmaps",   color: "#a78bfa" },
    { id: "email",   icon: "📧",  title: "Email Alerts",   desc: "Get goal reports and daily summaries in your inbox",    color: "#f472b6" },
  ],

  // ─── EXTERNAL SERVICES ─────────────────────────────────────────────
  // Weather API — free, no key needed.
  weatherAPI: "https://wttr.in",

  // ─── EMAIL TEMPLATES ───────────────────────────────────────────────
  // Styling tokens used in the server-rendered HTML email templates
  // sent via /api/email. Matches the app's dark-mode aesthetic.
  email: {
    senderName: "AgentX 2.0 ⚡",
    accentColor: "#0d9488",
    bgColor: "#0c0c11",
    cardColor: "#17171f",
    borderColor: "#1f1f2e",
    textColor: "#a8a8bc",
    dimColor: "#6b6b82",
  },

};

export default agentConfig;

"use client";
import { useState, useEffect, useCallback } from "react";
import config from "../agent.config";

/* ═══════════════════════════════════════════════
   AgentX 2.0 — AI-Powered Productivity Toolkit
   Tool-first dashboard: Weather · Tasks · CSV · Search
   ═══════════════════════════════════════════════ */

/* ── Helpers ──────────────────────────────────── */
function lsGet(key, fb) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

async function callAPI(messages, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

/* ── Tool Definitions (driven from agent.config.js) ── */
const TOOLS = config.tools;

export default function AgentX() {
  /* ── Core ────────────────────────────────────── */
  const [screen, setScreen]       = useState("loading");
  const [activeTool, setActiveTool] = useState(null);
  const [userName, setUserName]   = useState("");
  const [toast, setToast]         = useState("");

  /* ── Weather ─────────────────────────────────── */
  const [wxCity, setWxCity]       = useState("");
  const [wxData, setWxData]       = useState(null);
  const [wxBusy, setWxBusy]       = useState(false);
  const [wxHistory, setWxHistory] = useState([]);

  /* ── Tasks ───────────────────────────────────── */
  const [tasks, setTasks]         = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskBusy, setTaskBusy]   = useState(false);

  /* ── CSV ─────────────────────────────────────── */
  const [csvText, setCsvText]     = useState("");
  const [csvResult, setCsvResult] = useState(null);
  const [csvBusy, setCsvBusy]     = useState(false);

  /* ── Search ──────────────────────────────────── */
  const [srchQ, setSrchQ]         = useState("");
  const [srchResult, setSrchResult] = useState(null);
  const [srchBusy, setSrchBusy]   = useState(false);

  /* ── Goals ───────────────────────────────────── */
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [goals, setGoals]         = useState([]);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalBusy, setGoalBusy]   = useState(false);

  /* ── Email ───────────────────────────────────── */
  const [emailOpen, setEmailOpen]   = useState(false);
  const [emailAddr, setEmailAddr]   = useState("");
  const [emailPrefs, setEmailPrefs] = useState({ goalUpdates: true, dailySummary: true, reminders: true });
  const [emailBusy, setEmailBusy]   = useState(false);

  /* ── Toast ───────────────────────────────────── */
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  /* ── Init ────────────────────────────────────── */
  useEffect(() => {
    const name = localStorage.getItem("ax2_name");
    if (name) {
      setUserName(name);
      setScreen("dashboard");
    } else {
      setScreen("name");
    }
    setTasks(lsGet("ax_tasks", []));
    setGoals(lsGet("ax_goals", []));
    setWxHistory(lsGet("ax_wx_history", []));
    setEmailAddr(lsGet("ax_email_addr", ""));
    setEmailPrefs(lsGet("ax_email_prefs", { goalUpdates: true, dailySummary: true, reminders: true }));
  }, []);

  /* ── Submit Name ─────────────────────────────── */
  const submitName = (e) => {
    e?.preventDefault();
    const name = document.getElementById("nameInput")?.value?.trim();
    if (!name) return;
    setUserName(name);
    localStorage.setItem("ax2_name", name);
    setScreen("dashboard");
  };

  /* ── Navigation ──────────────────────────────── */
  const openTool = (id) => { setActiveTool(id); setScreen("tool"); };
  const goHome = () => { setActiveTool(null); setScreen("dashboard"); };

  /* ── Clear All ───────────────────────────────── */
  const clearAll = () => {
    if (!confirm("Clear all data and start fresh?")) return;
    localStorage.clear();
    location.reload();
  };

  /* ── Greeting ────────────────────────────────── */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ═══ WEATHER ══════════════════════════════════ */
  const fetchWeather = useCallback(async () => {
    if (!wxCity.trim()) return;
    setWxBusy(true); setWxData(null);
    try {
      const res = await fetch("/api/tools/weather", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: wxCity.trim() }),
      });
      const d = await res.json();
      if (d.error) { showToast("❌ " + d.error); }
      else {
        setWxData(d);
        const hist = [d.city, ...wxHistory.filter(c => c !== d.city)].slice(0, 5);
        setWxHistory(hist); lsSet("ax_wx_history", hist);
      }
    } catch { showToast("⚠️ Weather fetch failed"); }
    setWxBusy(false);
  }, [wxCity, wxHistory, showToast]);

  /* ═══ TASKS ════════════════════════════════════ */
  const addTask = useCallback(async () => {
    if (!taskInput.trim()) return;
    const t = { id: Date.now(), text: taskInput.trim(), done: false, createdAt: new Date().toISOString() };
    const updated = [...tasks, t];
    setTasks(updated); lsSet("ax_tasks", updated); setTaskInput("");
    setTaskBusy(true);
    try {
      const tip = await callAPI([{ role: "user", content: `Give one short priority tip (1 sentence max) for this task: "${t.text}"` }]);
      showToast("💡 " + tip);
    } catch {}
    setTaskBusy(false);
  }, [taskInput, tasks, showToast]);

  const toggleTask = useCallback((id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated); lsSet("ax_tasks", updated);
  }, [tasks]);

  const deleteTask = useCallback((id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated); lsSet("ax_tasks", updated);
  }, [tasks]);

  /* ═══ CSV ══════════════════════════════════════ */
  const analyzeCSV = useCallback(async () => {
    if (!csvText.trim() || csvBusy) return;
    setCsvBusy(true); setCsvResult(null);
    try {
      const res = await fetch("/api/tools/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: csvText.trim() }),
      });
      const d = await res.json();
      if (d.error) showToast("❌ " + d.error);
      else setCsvResult(d.analysis);
    } catch { showToast("⚠️ CSV analysis failed"); }
    setCsvBusy(false);
  }, [csvText, csvBusy, showToast]);

  /* ═══ SEARCH ═══════════════════════════════════ */
  const doSearch = useCallback(async () => {
    if (!srchQ.trim() || srchBusy) return;
    setSrchBusy(true); setSrchResult(null);
    try {
      const res = await fetch("/api/tools/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: srchQ.trim() }),
      });
      const d = await res.json();
      if (d.error) showToast("❌ " + d.error);
      else setSrchResult(d);
    } catch { showToast("⚠️ Search failed"); }
    setSrchBusy(false);
  }, [srchQ, srchBusy, showToast]);

  /* ═══ GOALS ════════════════════════════════════ */
  const addGoal = useCallback(async () => {
    if (!goalDraft.trim() || goalBusy) return;
    setGoalBusy(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalDraft.trim(), userName }),
      });
      const d = await res.json();
      if (d.error) { showToast("❌ " + d.error); setGoalBusy(false); return; }
      const g = { id: Date.now(), goal: goalDraft.trim(), steps: (d.steps || []).map(s => ({ ...s, done: false })), message: d.message, estimatedDuration: d.estimatedDuration, difficulty: d.difficulty, createdAt: Date.now() };
      const updated = [...goals, g];
      setGoals(updated); lsSet("ax_goals", updated); setGoalDraft("");
      showToast("🎯 Goal added with " + g.steps.length + " steps!");
    } catch { showToast("⚠️ Goal tracking failed"); }
    setGoalBusy(false);
  }, [goalDraft, goalBusy, goals, userName, showToast]);

  const toggleStep = useCallback((gId, sIdx) => {
    const updated = goals.map(g => g.id !== gId ? g : { ...g, steps: g.steps.map((s, i) => i === sIdx ? { ...s, done: !s.done } : s) });
    setGoals(updated); lsSet("ax_goals", updated);
  }, [goals]);

  const deleteGoal = useCallback((gId) => {
    const updated = goals.filter(g => g.id !== gId);
    setGoals(updated); lsSet("ax_goals", updated);
  }, [goals]);

  /* ═══ EMAIL ════════════════════════════════════ */
  const sendEmail = useCallback(async (type) => {
    if (!emailAddr.trim() || emailBusy) return;
    setEmailBusy(true);
    try {
      const goalsSummary = goals.map(g => { const d = g.steps.filter(s => s.done).length; return `• ${g.goal} (${d}/${g.steps.length} steps done)`; }).join("\n");
      const res = await fetch("/api/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailAddr.trim(), userName, goals: goalsSummary, memory: { name: userName }, type }),
      });
      const d = await res.json();
      if (d.error) showToast("❌ " + d.error);
      else { showToast("✉️ Email sent!"); lsSet("ax_email_addr", emailAddr); }
    } catch { showToast("⚠️ Email failed"); }
    setEmailBusy(false);
  }, [emailAddr, emailBusy, goals, userName, showToast]);

  const saveEmailPrefs = useCallback(() => {
    lsSet("ax_email_addr", emailAddr);
    lsSet("ax_email_prefs", emailPrefs);
    showToast("✅ Preferences saved!");
  }, [emailAddr, emailPrefs, showToast]);

  /* ── Derived ─────────────────────────────────── */
  const tasksDone = tasks.filter(t => t.done).length;
  const activeToolObj = TOOLS.find(t => t.id === activeTool);

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  if (screen === "loading") return null;

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <header className="header">
        <div className="logo" onClick={screen !== "name" ? goHome : undefined} style={{ cursor: screen !== "name" ? "pointer" : "default" }}>
          <div className="logo-icon">{config.emoji}</div>
          {config.name}
        </div>
        <div className="header-right">
          {screen === "tool" && (
            <button className="btn-back" onClick={goHome}>← Dashboard</button>
          )}
          {userName && (
            <>
              <button className="tool-btn" title="Goal Tracking" onClick={() => setGoalsOpen(true)}>🎯</button>
              <button className="tool-btn" title="Email Notifications" onClick={() => setEmailOpen(true)}>📧</button>
              <button className="btn-clear" onClick={clearAll}>Reset</button>
              <div className="user-badge" title={userName}>{userName[0].toUpperCase()}</div>
            </>
          )}
        </div>
      </header>

      {/* ═══ NAME SCREEN ═══ */}
      {screen === "name" && (
        <div className="screen">
          <div className="screen-icon">⚡</div>
          <div>
            <div className="screen-title">Welcome to <em>{config.name}</em></div>
            <div className="screen-sub">{config.description}</div>
          </div>
          <form className="name-wrap" onSubmit={submitName}>
            <input id="nameInput" type="text" placeholder="Enter your name to get started" autoFocus />
            <button type="submit" className="primary-btn">Get Started →</button>
          </form>
        </div>
      )}

      {/* ═══ DASHBOARD ═══ */}
      {screen === "dashboard" && (
        <main className="dashboard">
          <div className="dash-content">
            {/* Greeting */}
            <div className="dash-header">
              <h1 className="dash-greeting">{getGreeting()}, <em>{userName}</em></h1>
              <p className="dash-sub">What would you like to work on today?</p>
            </div>

            {/* Stats */}
            <div className="dash-stats">
              <div className="dash-stat">
                <span className="dash-stat-val">{tasks.length}</span>
                <span className="dash-stat-lbl">Tasks</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-val">{tasksDone}</span>
                <span className="dash-stat-lbl">Done</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-val">{goals.length}</span>
                <span className="dash-stat-lbl">Goals</span>
              </div>
            </div>

            {/* Tool Grid */}
            <div className="tool-grid">
              {TOOLS.map(t => (
                <div key={t.id} className="tool-card" onClick={() => openTool(t.id)} style={{ "--card-accent": t.color }}>
                  <div className="tool-card-icon">{t.icon}</div>
                  <div className="tool-card-body">
                    <div className="tool-card-title">{t.title}</div>
                    <div className="tool-card-desc">{t.desc}</div>
                  </div>
                  <div className="tool-card-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ═══ TOOL WORKSPACE ═══ */}
      {screen === "tool" && activeToolObj && (
        <main className="workspace">
          <div className="ws-inner">
            {/* Tool Header */}
            <div className="ws-header">
              <div className="ws-icon" style={{ background: activeToolObj.color }}>{activeToolObj.icon}</div>
              <div>
                <h2 className="ws-title">{activeToolObj.title}</h2>
                <p className="ws-desc">{activeToolObj.desc}</p>
              </div>
            </div>

            {/* ── WEATHER TOOL ── */}
            {activeTool === "weather" && (
              <div className="ws-body">
                <div className="ws-input-group">
                  <input type="text" placeholder="Enter city name…" value={wxCity} onChange={e => setWxCity(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchWeather()} />
                  <button className="ws-action-btn" onClick={fetchWeather} disabled={wxBusy}>{wxBusy ? "⏳ Fetching…" : "🌤️ Get Weather"}</button>
                </div>
                {wxHistory.length > 0 && (
                  <div className="ws-chips">
                    <span className="ws-chips-label">Recent:</span>
                    {wxHistory.map((c, i) => <button key={i} className="ws-chip" onClick={() => { setWxCity(c); }}>{c}</button>)}
                  </div>
                )}
                {wxData && (
                  <div className="wx-card">
                    <div className="wx-location">{wxData.city}{wxData.country ? `, ${wxData.country}` : ""}</div>
                    <div className="wx-main">
                      <div className="wx-temp">{wxData.temp_c}°C</div>
                      <div className="wx-condition">{wxData.condition}</div>
                    </div>
                    <div className="wx-grid">
                      <div className="wx-stat">🌡️ Feels Like<strong>{wxData.feels_c}°C</strong></div>
                      <div className="wx-stat">💧 Humidity<strong>{wxData.humidity}%</strong></div>
                      <div className="wx-stat">💨 Wind<strong>{wxData.wind_kmph} km/h</strong></div>
                      <div className="wx-stat">☀️ UV Index<strong>{wxData.uv_index}</strong></div>
                    </div>
                  </div>
                )}
                {!wxData && !wxBusy && (
                  <div className="ws-empty">
                    <div className="ws-empty-icon">🌍</div>
                    <div>Enter a city name to get real-time weather data</div>
                  </div>
                )}
              </div>
            )}

            {/* ── TASKS TOOL ── */}
            {activeTool === "tasks" && (
              <div className="ws-body">
                <div className="ws-input-group">
                  <input type="text" placeholder="Add a new task…" value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
                  <button className="ws-action-btn" onClick={addTask} disabled={taskBusy}>{taskBusy ? "⏳" : "✅ Add Task"}</button>
                </div>
                {tasks.length > 0 && (
                  <div className="task-stats-bar">
                    <span>{tasksDone}/{tasks.length} completed</span>
                    <div className="task-progress-track">
                      <div className="task-progress-fill" style={{ width: tasks.length ? `${(tasksDone / tasks.length) * 100}%` : "0%" }} />
                    </div>
                  </div>
                )}
                <div className="task-list">
                  {tasks.length === 0 && (
                    <div className="ws-empty">
                      <div className="ws-empty-icon">📋</div>
                      <div>No tasks yet. Add your first task above!</div>
                      <div className="ws-empty-hint">AI will give you a smart priority tip for each task</div>
                    </div>
                  )}
                  {[...tasks].reverse().map(t => (
                    <div key={t.id} className={`task-item${t.done ? " done" : ""}`}>
                      <button className="task-check" onClick={() => toggleTask(t.id)}>{t.done ? "✓" : ""}</button>
                      <span className="task-text">{t.text}</span>
                      <button className="task-del" onClick={() => deleteTask(t.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CSV TOOL ── */}
            {activeTool === "csv" && (
              <div className="ws-body">
                <textarea className="csv-area" placeholder={"Paste your CSV data here…\n\nExample:\nname,age,city\nAlice,28,New York\nBob,35,London"} value={csvText} onChange={e => setCsvText(e.target.value)} rows={8} />
                <button className="ws-action-btn ws-full" onClick={analyzeCSV} disabled={csvBusy || !csvText.trim()}>
                  {csvBusy ? "⏳ Analyzing…" : "📊 Analyze CSV"}
                </button>
                {csvResult && (
                  <div className="csv-result">
                    <div className="csv-meta">
                      <span>📋 {csvResult.rowCount} rows</span>
                      <span>📌 {csvResult.columnCount} columns</span>
                    </div>
                    <div className="csv-summary">{csvResult.summary}</div>
                    {csvResult.insights?.length > 0 && (
                      <div className="csv-section">
                        <div className="csv-section-label">💡 Key Insights</div>
                        {csvResult.insights.map((ins, i) => <div key={i} className="csv-insight-item">• {ins}</div>)}
                      </div>
                    )}
                    {csvResult.recommendation && (
                      <div className="csv-section">
                        <div className="csv-section-label">🎯 Recommendation</div>
                        <div className="csv-insight-item">{csvResult.recommendation}</div>
                      </div>
                    )}
                  </div>
                )}
                {!csvResult && !csvBusy && !csvText && (
                  <div className="ws-empty">
                    <div className="ws-empty-icon">📊</div>
                    <div>Paste CSV data and let AI analyze it</div>
                    <div className="ws-empty-hint">Get insights, patterns, and recommendations instantly</div>
                  </div>
                )}
              </div>
            )}

            {/* ── SEARCH TOOL ── */}
            {activeTool === "search" && (
              <div className="ws-body">
                <div className="ws-input-group">
                  <input type="text" placeholder="Search anything…" value={srchQ} onChange={e => setSrchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} />
                  <button className="ws-action-btn" onClick={doSearch} disabled={srchBusy}>{srchBusy ? "⏳ Searching…" : "🔍 Search"}</button>
                </div>
                {srchResult && (
                  <div className="srch-result">
                    <div className="srch-summary">{srchResult.summary}</div>
                    {srchResult.keyPoints?.length > 0 && (
                      <div className="srch-section">
                        <div className="srch-label">🔑 Key Points</div>
                        {srchResult.keyPoints.map((p, i) => <div key={i} className="srch-point">• {p}</div>)}
                      </div>
                    )}
                    {srchResult.relatedTopics?.length > 0 && (
                      <div className="srch-section">
                        <div className="srch-label">🔗 Related Topics</div>
                        <div className="srch-tags">
                          {srchResult.relatedTopics.map((t, i) => <span key={i} className="srch-tag" onClick={() => setSrchQ(t)}>{t}</span>)}
                        </div>
                      </div>
                    )}
                    <div className="srch-note">⚡ Powered by AgentX 2.0 AI</div>
                  </div>
                )}
                {!srchResult && !srchBusy && (
                  <div className="ws-empty">
                    <div className="ws-empty-icon">🔍</div>
                    <div>Search any topic for AI-powered summaries</div>
                    <div className="ws-empty-hint">Get structured answers with key points and related topics</div>
                  </div>
                )}
              </div>
            )}

            {/* ── GOALS TOOL ── */}
            {activeTool === "goals" && (
              <div className="ws-body">
                <div className="ws-input-group">
                  <input type="text" placeholder='e.g. "Learn Spanish in 3 months"…' value={goalDraft} onChange={e => setGoalDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} />
                  <button className="ws-action-btn" onClick={addGoal} disabled={goalBusy || !goalDraft.trim()}>{goalBusy ? "⏳ Building…" : "🎯 Track Goal"}</button>
                </div>
                <div className="goals-list">
                  {goals.length === 0 && (
                    <div className="ws-empty">
                      <div className="ws-empty-icon">🎯</div>
                      <div>No goals yet. Add your first goal above!</div>
                      <div className="ws-empty-hint">AI will break it into actionable steps with timeframes</div>
                    </div>
                  )}
                  {[...goals].reverse().map(g => {
                    const done = g.steps.filter(s => s.done).length;
                    const pct = g.steps.length ? Math.round((done / g.steps.length) * 100) : 0;
                    return (
                      <div key={g.id} className="goal-card">
                        <div className="goal-card-header">
                          <div className="goal-title">{g.goal}</div>
                          <button className="goal-del" onClick={() => deleteGoal(g.id)}>✕</button>
                        </div>
                        {g.message && <div className="goal-message">💬 {g.message}</div>}
                        {g.estimatedDuration && <div className="goal-meta">⏱️ {g.estimatedDuration} · {g.difficulty || "moderate"}</div>}
                        <div className="goal-progress"><div className="goal-progress-bar" style={{ width: pct + "%" }} /></div>
                        <div className="goal-progress-label">{done}/{g.steps.length} steps · {pct}% complete</div>
                        <div className="steps-list">
                          {g.steps.map((step, idx) => (
                            <div key={idx} className={`step-item${step.done ? " done" : ""}`} onClick={() => toggleStep(g.id, idx)}>
                              <div className={`step-check${step.done ? " done" : ""}`}>{step.done ? "✓" : ""}</div>
                              <div className="step-body">
                                <div className="step-text">{step.text}</div>
                                {step.timeframe && <div className="step-meta">{step.timeframe}{step.priority ? ` · ${step.priority}` : ""}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── EMAIL TOOL ── */}
            {activeTool === "email" && (
              <div className="ws-body">
                <div className="email-section">
                  <label className="email-label">📬 Your Email Address</label>
                  <input type="text" placeholder="you@example.com" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} />
                </div>
                <div className="email-section">
                  <label className="email-label">🔔 Notification Preferences</label>
                  <div className="pref-list">
                    {[
                      { key: "goalUpdates",  label: "🎯 Goal Progress Updates", desc: "Weekly report on your tracked goals" },
                      { key: "dailySummary", label: "📋 Daily Summary",         desc: "Recap of your tasks and activity" },
                      { key: "reminders",    label: "⏰ Smart Reminders",       desc: "Follow-up nudges to keep you on track" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="pref-item" onClick={() => setEmailPrefs(p => ({ ...p, [key]: !p[key] }))}>
                        <div className="pref-text">
                          <div className="pref-label">{label}</div>
                          <div className="pref-desc">{desc}</div>
                        </div>
                        <div className={`pref-toggle${emailPrefs[key] ? " on" : ""}`}><div className="pref-knob" /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="email-save-btn" onClick={saveEmailPrefs} disabled={!emailAddr.trim()}>💾 Save Preferences</button>
                <div className="email-divider">Send Now</div>
                <div className="email-actions">
                  <button className="email-send-btn" onClick={() => sendEmail("goals")} disabled={emailBusy || !emailAddr.trim() || goals.length === 0}>{emailBusy ? "⏳" : "🎯 Goal Report"}</button>
                  <button className="email-send-btn" onClick={() => sendEmail("summary")} disabled={emailBusy || !emailAddr.trim()}>{emailBusy ? "⏳" : "📋 Daily Summary"}</button>
                </div>
                <div className="email-note">
                  ℹ️ Requires <code>EMAIL_USER</code> &amp; <code>EMAIL_PASS</code> (Gmail App Password) in <code>.env.local</code>
                </div>
              </div>
            )}

          </div>
        </main>
      )}

      {/* ═══ GOALS PANEL ═══ */}
      <div className={`panel-overlay${goalsOpen ? " open" : ""}`} onClick={e => { if (e.target === e.currentTarget) setGoalsOpen(false); }}>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🎯 Goal Tracking AI</div>
            <button className="panel-close" onClick={() => setGoalsOpen(false)}>✕</button>
          </div>
          <div className="panel-body">
            <div className="tool-desc">Set a goal — AI builds your personalized roadmap. Track progress step by step.</div>
            <div className="ws-input-group">
              <input type="text" placeholder='e.g. "Learn Spanish in 3 months"…' value={goalDraft} onChange={e => setGoalDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} />
              <button className="ws-action-btn" onClick={addGoal} disabled={goalBusy || !goalDraft.trim()}>{goalBusy ? "⏳" : "🎯 Track"}</button>
            </div>
            <div className="goals-list">
              {goals.length === 0 && (
                <div className="ws-empty">
                  <div className="ws-empty-icon">🎯</div>
                  <div>No goals yet.</div>
                  <div className="ws-empty-hint">Add your first goal and let AI build your roadmap!</div>
                </div>
              )}
              {[...goals].reverse().map(g => {
                const done = g.steps.filter(s => s.done).length;
                const pct = g.steps.length ? Math.round((done / g.steps.length) * 100) : 0;
                return (
                  <div key={g.id} className="goal-card">
                    <div className="goal-card-header">
                      <div className="goal-title">{g.goal}</div>
                      <button className="goal-del" onClick={() => deleteGoal(g.id)}>✕</button>
                    </div>
                    {g.message && <div className="goal-message">💬 {g.message}</div>}
                    {g.estimatedDuration && <div className="goal-meta">⏱️ {g.estimatedDuration} · {g.difficulty || "moderate"}</div>}
                    <div className="goal-progress"><div className="goal-progress-bar" style={{ width: pct + "%" }} /></div>
                    <div className="goal-progress-label">{done}/{g.steps.length} steps · {pct}% complete</div>
                    <div className="steps-list">
                      {g.steps.map((step, idx) => (
                        <div key={idx} className={`step-item${step.done ? " done" : ""}`} onClick={() => toggleStep(g.id, idx)}>
                          <div className={`step-check${step.done ? " done" : ""}`}>{step.done ? "✓" : ""}</div>
                          <div className="step-body">
                            <div className="step-text">{step.text}</div>
                            {step.timeframe && <div className="step-meta">{step.timeframe}{step.priority ? ` · ${step.priority}` : ""}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ EMAIL PANEL ═══ */}
      <div className={`panel-overlay${emailOpen ? " open" : ""}`} onClick={e => { if (e.target === e.currentTarget) setEmailOpen(false); }}>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📧 Email Notifications</div>
            <button className="panel-close" onClick={() => setEmailOpen(false)}>✕</button>
          </div>
          <div className="panel-body">
            <div className="tool-desc">Get smart reminders, goal updates, and daily follow-ups directly in your inbox.</div>
            <div className="email-section">
              <label className="email-label">📬 Your Email Address</label>
              <input type="text" placeholder="you@example.com" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} />
            </div>
            <div className="email-section">
              <label className="email-label">🔔 Notification Preferences</label>
              <div className="pref-list">
                {[
                  { key: "goalUpdates",  label: "🎯 Goal Progress Updates", desc: "Weekly report on your tracked goals" },
                  { key: "dailySummary", label: "📋 Daily Summary",         desc: "Recap of your tasks and activity" },
                  { key: "reminders",    label: "⏰ Smart Reminders",       desc: "Follow-up nudges to keep you on track" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="pref-item" onClick={() => setEmailPrefs(p => ({ ...p, [key]: !p[key] }))}>
                    <div className="pref-text">
                      <div className="pref-label">{label}</div>
                      <div className="pref-desc">{desc}</div>
                    </div>
                    <div className={`pref-toggle${emailPrefs[key] ? " on" : ""}`}><div className="pref-knob" /></div>
                  </div>
                ))}
              </div>
            </div>
            <button className="email-save-btn" onClick={saveEmailPrefs} disabled={!emailAddr.trim()}>💾 Save Preferences</button>
            <div className="email-divider">Send Now</div>
            <div className="email-actions">
              <button className="email-send-btn" onClick={() => sendEmail("goals")} disabled={emailBusy || !emailAddr.trim() || goals.length === 0}>{emailBusy ? "⏳" : "🎯 Goal Report"}</button>
              <button className="email-send-btn" onClick={() => sendEmail("summary")} disabled={emailBusy || !emailAddr.trim()}>{emailBusy ? "⏳" : "📋 Daily Summary"}</button>
            </div>
            <div className="email-note">
              ℹ️ Requires <code>EMAIL_USER</code> &amp; <code>EMAIL_PASS</code> (Gmail App Password) in <code>.env.local</code>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TOAST ═══ */}
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}

/**
 * AgentX — Email Notifications
 * Sends goal reports and daily summaries via nodemailer (Gmail SMTP).
 * Requires EMAIL_USER and EMAIL_PASS in .env.local
 */

import nodemailer from "nodemailer";
import config from "../../../agent.config";

export async function POST(request) {
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASS = process.env.EMAIL_PASS;

  if (!EMAIL_USER || !EMAIL_PASS) {
    return Response.json(
      { error: "Email not configured. Add EMAIL_USER and EMAIL_PASS to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const { to, userName, goals, memory, type } = await request.json();
    if (!to?.trim()) {
      return Response.json({ error: "Recipient email is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const now = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const e = config.email || {};
    const baseStyles = `font-family:Inter,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:${e.bgColor || "#0c0c11"};color:#e2e2ea;padding:32px;border-radius:16px;`;
    const accentColor = e.accentColor || "#0d9488";
    const dimColor    = e.dimColor    || "#6b6b82";
    const textDim     = e.textColor   || "#a8a8bc";

    let subject, html;

    if (type === "goals") {
      subject = `🎯 Goal Progress Update — ${now}`;
      html = `
        <div style="${baseStyles}">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="width:52px;height:52px;background:${accentColor};border-radius:14px;display:inline-block;line-height:52px;text-align:center;font-size:24px;margin-bottom:12px;box-shadow:0 4px 12px rgba(13,148,136,0.3);">🎯</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Goal Progress Report</h1>
            <p style="color:${dimColor};margin:6px 0 0;font-size:13px;">${now}</p>
          </div>
          <p style="color:${textDim};font-size:14px;line-height:1.6;margin:0 0 6px;">Hi <strong style="color:#fff;">${userName || "there"}</strong>,</p>
          <p style="color:${textDim};font-size:14px;line-height:1.6;margin:0;">Here's your latest goal progress update from AgentX 🤖</p>
          ${goals
            ? `<div style="background:#17171f;border:1px solid #1f1f2e;border-radius:10px;padding:18px;margin:20px 0;white-space:pre-wrap;color:${textDim};font-size:13px;line-height:1.8;">${goals}</div>`
            : `<div style="background:#17171f;border:1px solid #1f1f2e;border-radius:10px;padding:18px;margin:20px 0;color:${dimColor};font-size:13px;text-align:center;">No goals tracked yet. Open AgentX and add your first goal!</div>`
          }
          <div style="background:rgba(124,111,255,0.06);border:1px solid rgba(124,111,255,0.2);border-radius:10px;padding:16px;margin-top:20px;">
            <p style="color:#fbbf24;margin:0 0 6px;font-weight:600;font-size:13px;">💡 Keep Going!</p>
            <p style="color:${textDim};margin:0;font-size:13px;line-height:1.6;">Every step forward counts. Log into AgentX to update your progress and stay on track.</p>
          </div>
          <p style="color:${dimColor};font-size:11px;margin-top:28px;text-align:center;border-top:1px solid #1f1f2e;padding-top:16px;">Sent by <strong style="color:${textDim}">AgentX</strong> — Your AI Productivity Toolkit</p>
        </div>`;
    } else {
      subject = `✨ Your AgentX Daily Summary — ${now}`;
      html = `
        <div style="${baseStyles}">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="width:52px;height:52px;background:${accentColor};border-radius:14px;display:inline-block;line-height:52px;text-align:center;font-size:24px;margin-bottom:12px;box-shadow:0 4px 12px rgba(13,148,136,0.3);">🤖</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">AgentX Daily Summary</h1>
            <p style="color:${dimColor};margin:6px 0 0;font-size:13px;">${now}</p>
          </div>
          <p style="color:${textDim};font-size:14px;line-height:1.6;margin:0 0 6px;">Hi <strong style="color:#fff;">${userName || "there"}</strong> 👋</p>
          <p style="color:${textDim};font-size:14px;line-height:1.6;margin:0;">Here's your personalized daily summary:</p>

          ${memory?.interests ? `
          <div style="margin:20px 0 16px;">
            <h3 style="color:${accentColor};margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">❤️ Your Interests</h3>
            <p style="color:${textDim};font-size:13px;line-height:1.6;background:#17171f;border:1px solid #1f1f2e;border-radius:8px;padding:12px;margin:0;">${Array.isArray(memory.interests) ? memory.interests.join(" · ") : memory.interests}</p>
          </div>` : ""}

          ${memory?.goals ? `
          <div style="margin:16px 0;">
            <h3 style="color:${accentColor};margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">🎯 Your Life Goals</h3>
            <p style="color:${textDim};font-size:13px;line-height:1.6;background:#17171f;border:1px solid #1f1f2e;border-radius:8px;padding:12px;margin:0;">${Array.isArray(memory.goals) ? memory.goals.join(" · ") : memory.goals}</p>
          </div>` : ""}

          ${goals ? `
          <div style="margin:16px 0;">
            <h3 style="color:${accentColor};margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">📊 Tracked Goal Progress</h3>
            <div style="background:#17171f;border:1px solid #1f1f2e;border-radius:8px;padding:14px;white-space:pre-wrap;color:${textDim};font-size:13px;line-height:1.8;margin:0;">${goals}</div>
          </div>` : ""}

          <div style="background:rgba(124,111,255,0.06);border:1px solid rgba(124,111,255,0.2);border-radius:10px;padding:16px;margin-top:20px;">
            <p style="color:#fbbf24;margin:0 0 6px;font-weight:600;font-size:13px;">💡 Daily Tip</p>
            <p style="color:${textDim};margin:0;font-size:13px;line-height:1.6;">Keep chatting with AgentX every day to deepen conversations, unlock new insights, and stay on top of your goals!</p>
          </div>
          <p style="color:${dimColor};font-size:11px;margin-top:28px;text-align:center;border-top:1px solid #1f1f2e;padding-top:16px;">Sent by <strong style="color:${textDim}">AgentX</strong> — Your AI Productivity Toolkit</p>
        </div>`;
    }

    await transporter.sendMail({
      from: `"${e.senderName || config.name || 'AgentX 2.0'}" <${EMAIL_USER}>`,
      to: to.trim(),
      subject,
      html,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Email route error:", err);
    return Response.json({ error: err.message || "Email send failed" }, { status: 500 });
  }
}

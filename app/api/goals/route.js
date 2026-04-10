/**
 * AgentX — Goal Tracking AI
 * Uses Gemini to break a goal into actionable steps with timeframes.
 */

import config from "../../../agent.config";

export async function POST(request) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return Response.json({ error: "API key not configured on server" }, { status: 500 });
  }

  try {
    const { goal, userName } = await request.json();
    if (!goal?.trim()) {
      return Response.json({ error: "Goal text is required" }, { status: 400 });
    }

    const model   = config.model || "gemini-2.5-flash-lite";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const prompt = `You are a goal coach. Break down this goal into actionable steps for ${userName || "the user"}:

Goal: "${goal.trim()}"

Return ONLY valid JSON in this exact format:
{
  "steps": [
    { "text": "Specific action step description", "timeframe": "e.g. Week 1", "priority": "high" },
    { "text": "Next step", "timeframe": "e.g. Week 2-3", "priority": "medium" }
  ],
  "message": "A motivational 1-2 sentence message to encourage them (personalized to ${userName || "the user"})",
  "estimatedDuration": "e.g. 3 months",
  "difficulty": "easy|moderate|challenging"
}

Rules:
- Provide 4-7 specific, actionable steps
- Each step should be concrete and measurable
- Timeframes should be realistic
- Priority must be exactly: high, medium, or low
Return ONLY the JSON. No extra text.`;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: "You are an expert goal coach. Always return valid JSON only." }] },
      }),
    });

    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: data.error.code || 500 });
    }

    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return Response.json(parsed);
  } catch (err) {
    console.error("Goals route error:", err);
    return Response.json({ error: "Goal breakdown failed. Please try again." }, { status: 500 });
  }
}

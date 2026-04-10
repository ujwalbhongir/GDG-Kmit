/**
 * AgentX — CSV Analysis Tool
 * Sends CSV data to Gemini for AI-powered analysis and insights.
 */

import config from "../../../../agent.config";

export async function POST(request) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return Response.json({ error: "API key not configured on server" }, { status: 500 });
  }

  try {
    const { csvText } = await request.json();
    if (!csvText?.trim()) {
      return Response.json({ error: "CSV data is required" }, { status: 400 });
    }

    // Limit CSV size to stay within token limits
    const truncated = csvText.slice(0, 8000);

    const model   = config.model || "gemini-2.5-flash-lite";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const prompt = `Analyze this CSV data and provide actionable insights:

${truncated}

Return ONLY valid JSON in this exact format:
{
  "rowCount": <number>,
  "columnCount": <number>,
  "columns": ["col1", "col2"],
  "summary": "Brief 2-3 sentence overview of what this data represents",
  "insights": ["Insight 1", "Insight 2", "Insight 3", "Insight 4"],
  "anomalies": ["Notable finding or anomaly if any"],
  "recommendation": "One clear recommendation for what to do with this data"
}

No extra text. Return ONLY the JSON object.`;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: data.error.code || 500 });
    }

    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    return Response.json({ analysis: parsed });
  } catch (err) {
    console.error("CSV route error:", err);
    return Response.json({ error: "CSV analysis failed. Please try again." }, { status: 500 });
  }
}

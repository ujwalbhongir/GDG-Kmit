/**
 * AgentX — AI-Powered Web Search Tool
 * Uses the Gemini model to provide structured search results.
 */

import config from "../../../../agent.config";

export async function POST(request) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return Response.json({ error: "API key not configured on server" }, { status: 500 });
  }

  try {
    const { query } = await request.json();
    if (!query?.trim()) {
      return Response.json({ error: "Search query is required" }, { status: 400 });
    }

    const model  = config.model || "gemini-2.5-flash-lite";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const prompt = `You are a knowledgeable search assistant. Answer this query accurately and helpfully:

Query: "${query.trim()}"

Return ONLY valid JSON in this exact format:
{
  "summary": "A comprehensive 2-3 sentence answer to the query",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "relatedTopics": ["Related topic 1", "Related topic 2", "Related topic 3"]
}

No extra text, no markdown fences. Return ONLY the JSON object.`;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        system_instruction: { parts: [{ text: "You are a precise search assistant. Always return valid JSON only." }] },
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
    console.error("Search route error:", err);
    return Response.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}

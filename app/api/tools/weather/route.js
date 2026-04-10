/**
 * AgentX — Weather Tool API
 * Uses wttr.in — free, no API key required.
 */

export async function POST(request) {
  try {
    const { city } = await request.json();
    if (!city?.trim()) {
      return Response.json({ error: "City name is required" }, { status: 400 });
    }

    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(city.trim())}?format=j1`,
      { headers: { "User-Agent": "AgentX/1.0" }, signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) {
      return Response.json({ error: "City not found or service unavailable" }, { status: 404 });
    }

    const data = await res.json();
    const current = data.current_condition?.[0];
    const area    = data.nearest_area?.[0];

    if (!current) {
      return Response.json({ error: "No weather data returned" }, { status: 502 });
    }

    return Response.json({
      city:      area?.areaName?.[0]?.value || city,
      country:   area?.country?.[0]?.value  || "",
      temp_c:    current.temp_C,
      temp_f:    current.temp_F,
      feels_c:   current.FeelsLikeC,
      condition: current.weatherDesc?.[0]?.value || "Unknown",
      humidity:  current.humidity,
      wind_kmph: current.windspeedKmph,
      visibility:current.visibility,
      uv_index:  current.uvIndex,
    });
  } catch (err) {
    console.error("Weather route error:", err);
    return Response.json({ error: "Weather fetch failed. Try again." }, { status: 500 });
  }
}

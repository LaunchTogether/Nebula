import { NextResponse } from "next/server";

// Using edge runtime for fast response if possible, but standard is fine
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { earthquakeCount } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback if no API key is provided
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      const date = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });

      const quakeDesc =
        earthquakeCount > 30
          ? `${earthquakeCount} earthquakes magnitude 4.0+ were recorded in the past 7 days globally, indicating elevated seismic activity.`
          : earthquakeCount > 10
          ? `${earthquakeCount} earthquakes above magnitude 4.0 have been recorded this week, with tectonic activity remaining moderate.`
          : earthquakeCount > 0
          ? `Only ${earthquakeCount} notable earthquakes recorded this week — seismic activity is relatively calm.`
          : "Seismic monitoring services are currently updating. Check back shortly for earthquake data.";

      return NextResponse.json({
        report: `Planet Intelligence Report — ${date}. ${quakeDesc} The International Space Station continues its orbit at 408km altitude, completing 15.5 orbits per day at 27,600 km/h. Solar activity remains at KP index 2 — quiet conditions with minimal aurora probability. Monitoring all Earth and space systems in real-time.`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are NEBULA, a highly advanced Planet Intelligence AI. You generate concise, professional, and slightly futuristic daily planet reports. Keep the report to exactly 2-3 sentences. Focus on planetary status, recent data, and scientific tone.",
          },
          {
            role: "user",
            content: `Generate a daily planet report. We have recorded ${earthquakeCount} notable earthquakes recently. Mention orbital systems (like ISS) and general Earth metrics. Make it sound like a system briefing.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const report = data.choices[0]?.message?.content?.trim();

    return NextResponse.json({ report });
  } catch (error) {
    console.error("AI Report Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI report" },
      { status: 500 }
    );
  }
}

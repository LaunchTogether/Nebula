import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET() {
  try {
    // Open-Meteo API doesn't require an API key
    // Coordinates for global average or specific point, we'll use a general one like Greenwich (0, 0)
    // or maybe let the client pass coordinates. For now we will fetch a general view, e.g., NASA HQ (28.57, -80.64) Cape Canaveral
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=28.5721&longitude=-80.648&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m&daily=sunrise,sunset&timezone=auto",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

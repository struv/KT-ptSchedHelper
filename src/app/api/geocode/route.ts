import { NextRequest, NextResponse } from "next/server";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

function formatAddress(addr: NominatimAddress): string {
  const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
  const city = addr.city || addr.town || addr.village || addr.hamlet;
  const parts = [street, city, addr.state, addr.postcode].filter(Boolean);
  return parts.join(", ");
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const mode = request.nextUrl.searchParams.get("mode"); // "search" or "geocode"

  if (!q) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  const limit = mode === "geocode" ? 1 : 5;
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(q)}&countrycodes=us&limit=${limit}`;

  const response = await fetch(url);
  const results = await response.json();

  if (mode === "geocode") {
    if (results.length === 0) {
      return NextResponse.json(
        { error: "Address not found. Please check the address and try again." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
      displayName: formatAddress(results[0].address),
    });
  }

  // search mode
  const suggestions = results.map(
    (r: { lat: string; lon: string; address: NominatimAddress }) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: formatAddress(r.address),
    })
  );

  return NextResponse.json(suggestions);
}

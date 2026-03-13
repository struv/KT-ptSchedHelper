export function validateLocation(location: string): {
  valid: boolean;
  message?: string;
  location?: string;
  type?: "zip" | "city";
} {
  location = location.trim();
  if (location.length === 0) {
    return { valid: false, message: "Please enter a ZIP code or city name" };
  }

  if (/^\d+$/.test(location)) {
    if (location.length !== 5) {
      return { valid: false, message: "Please enter a valid 5-digit ZIP code" };
    }
    return { valid: true, location, type: "zip" };
  }

  if (!/^[a-zA-Z\s]+$/.test(location)) {
    return {
      valid: false,
      message: "City name should only contain letters and spaces",
    };
  }
  return { valid: true, location, type: "city" };
}

export async function geocodeLocation(
  location: string,
  type: "zip" | "city"
): Promise<{ lat: number; lng: number }> {
  const cacheKey = `addr_${location}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  let url: string;
  if (type === "zip") {
    url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${location}&countrycodes=us&limit=1`;
  } else {
    url = `https://nominatim.openstreetmap.org/search?format=json&city=${location}&countrycodes=us&limit=1`;
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data.length === 0) {
    throw new Error(
      type === "zip" ? "ZIP code not found" : "City not found"
    );
  }

  const coords = {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };

  localStorage.setItem(cacheKey, JSON.stringify(coords));
  return coords;
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;
  const response = await fetch(url);
  const results = await response.json();

  if (results.length === 0) {
    throw new Error(
      "Address not found. Please check the address and try again."
    );
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

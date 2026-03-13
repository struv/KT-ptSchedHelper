"use client";

import { useState, useEffect } from "react";
import { validateLocation, geocodeLocation, calculateDistance } from "@/lib/geo";
import type { Office, OfficeWithDistance } from "@/lib/types";

export default function PatientSearchPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<OfficeWithDistance[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        if (data.offices?.length > 0) setOffices(data.offices);
      })
      .catch(() => {});
  }, []);

  async function searchOffices() {
    setError("");
    setShowResults(false);

    const validation = validateLocation(location);
    if (!validation.valid) {
      setError(validation.message!);
      return;
    }

    setLoading(true);

    try {
      const userCoords = await geocodeLocation(
        validation.location!,
        validation.type!
      );

      const officesWithDistance = offices
        .map((office) => ({
          ...office,
          distance: calculateDistance(
            userCoords.lat,
            userCoords.lng,
            office.lat,
            office.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      setResults(officesWithDistance);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Kids & Teens Medical Group Logo" className="logo-image" />
      <div className="header">
        <h1>Find Your Nearest Office</h1>
        <p>Enter your ZIP code or city name to find the closest office locations</p>
      </div>

      <div className="search-container">
        <div className="input-group">
          <label htmlFor="zipcode">Enter ZIP Code or City Name</label>
          <input
            type="text"
            id="zipcode"
            placeholder="e.g. 91324 or Pasadena"
            maxLength={50}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchOffices();
            }}
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        <button
          className="search-button"
          onClick={searchOffices}
          disabled={loading}
        >
          {loading ? "Searching..." : "Find Nearest Offices"}
        </button>
      </div>

      {loading && (
        <div className="loading">
          <p>Finding your nearest offices...</p>
        </div>
      )}

      {showResults && (
        <div>
          <div className="results-header">Nearest Offices</div>
          {results.map((office) => {
            const searchQuery = `Kids & Teens Medical Group ${office.address}`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
            return (
              <div key={office.name} className="office-card">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <div className="office-name">{office.name}</div>
                  <div className="office-address">{office.address}</div>
                  <div className="office-distance">
                    {office.distance.toFixed(1)} miles away
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { calculateDistance } from "@/lib/geo";
import type { Person, Office, OfficeWithDistance } from "@/lib/types";

export default function ProviderSearch() {
  const [people, setPeople] = useState<Person[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [results, setResults] = useState<OfficeWithDistance[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        const allPeople: Person[] = [
          ...(data.providers || []).map((p: Person) => ({ ...p, type: "Provider" as const })),
          ...(data.staff || []).map((s: Person) => ({ ...s, type: "Staff" as const })),
        ];
        setPeople(allPeople);
        if (data.offices?.length > 0) setOffices(data.offices);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function searchPeople(q: string) {
    if (!q.trim()) return [];
    const lower = q.toLowerCase().trim();
    return people.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 10);
  }

  function highlightMatch(text: string, q: string) {
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text;
    return (
      text.substring(0, index) +
      "<strong>" +
      text.substring(index, index + q.length) +
      "</strong>" +
      text.substring(index + q.length)
    );
  }

  function handleInputChange(value: string) {
    setQuery(value);
    const matches = searchPeople(value);
    setSuggestions(matches);
    setHighlightedIndex(-1);
    setShowSuggestions(matches.length > 0);
  }

  function selectPerson(person: Person) {
    setQuery(person.name);
    setShowSuggestions(false);
    setSelectedPerson(person);

    const officesWithDistance = offices
      .map((office) => ({
        ...office,
        distance: calculateDistance(person.lat, person.lng, office.lat, office.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    setResults(officesWithDistance);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectPerson(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="container">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Kids & Teens Medical Group Logo" className="logo-image" />
      <div className="header">
        <h1>Find Nearest Offices for Provider or Staff</h1>
        <p>Search for a provider or staff member to see their closest office locations</p>
      </div>

      <div className="search-container">
        <div className="input-group" ref={containerRef}>
          <label htmlFor="provider-search">Search Provider or Staff Name</label>
          <input
            type="text"
            id="provider-search"
            placeholder="e.g. John Smith or Smith"
            autoComplete="off"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {showSuggestions && (
            <div className="provider-suggestions" style={{ display: "block" }}>
              {suggestions.map((person, index) => (
                <div
                  key={`${person.name}-${person.type}`}
                  className={`provider-suggestion-item${index === highlightedIndex ? " highlighted" : ""}`}
                  onMouseDown={() => selectPerson(person)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span
                    className="person-name"
                    dangerouslySetInnerHTML={{ __html: highlightMatch(person.name, query) }}
                  />
                  <span className="person-type">{person.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPerson && (
        <div>
          <div className="provider-info">
            <div className="provider-name">{selectedPerson.name}</div>
            <div className="provider-location">
              Coordinates: {selectedPerson.lat}, {selectedPerson.lng}
            </div>
          </div>
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

      <div className="footer-note">
        <p>Missing a provider? Message William Struve on Teams</p>
      </div>
    </div>
  );
}

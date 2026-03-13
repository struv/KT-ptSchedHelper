"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { geocodeAddress, searchAddress } from "@/lib/geo";
import type { AppData } from "@/lib/types";

type TabName = "providers" | "staff" | "offices";

interface VerifiedAddress {
  lat: number;
  lng: number;
  displayName: string;
}

interface AddressSuggestion {
  lat: number;
  lng: number;
  displayName: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [data, setData] = useState<AppData>({
    providers: [],
    staff: [],
    offices: [],
  });
  const [activeTab, setActiveTab] = useState<TabName>("providers");
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Add form state
  const [providerName, setProviderName] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffAddress, setStaffAddress] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [adding, setAdding] = useState(false);

  // Address autocomplete state (per tab)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [verifiedAddresses, setVerifiedAddresses] = useState<Record<TabName, VerifiedAddress | null>>({
    providers: null,
    staff: null,
    offices: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddressChange = useCallback(
    (value: string, type: TabName, setFn: (v: string) => void) => {
      setFn(value);
      // Clear verification when user edits the field
      setVerifiedAddresses((prev) => ({ ...prev, [type]: null }));

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await searchAddress(value.trim());
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch {
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setSearching(false);
        }
      }, 600);
    },
    []
  );

  function handleSuggestionSelect(
    suggestion: AddressSuggestion,
    type: TabName,
    setFn: (v: string) => void
  ) {
    setFn(suggestion.displayName);
    setVerifiedAddresses((prev) => ({
      ...prev,
      [type]: {
        lat: suggestion.lat,
        lng: suggestion.lng,
        displayName: suggestion.displayName,
      },
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function handleLogin() {
    if (!password.trim()) {
      setLoginError("Please enter a password");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAdminPassword(password);
        setLoginError("");
      } else {
        setLoginError("Invalid password");
      }
    } catch {
      setLoginError("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadData() {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      showMessage("Failed to load data", true);
    }
  }

  useEffect(() => {
    if (adminPassword) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPassword]);

  function showMessage(text: string, isError = false) {
    setMessage({ text, isError });
  }

  function handleLogout() {
    setAdminPassword(null);
    setPassword("");
    setLoginError("");
  }

  async function addEntry(type: TabName) {
    let name: string, address: string;
    if (type === "providers") {
      name = providerName.trim();
      address = providerAddress.trim();
    } else if (type === "staff") {
      name = staffName.trim();
      address = staffAddress.trim();
    } else {
      name = officeName.trim();
      address = officeAddress.trim();
    }

    if (!name) {
      showMessage("Please enter a name", true);
      return;
    }
    if (!address) {
      showMessage("Please enter an address", true);
      return;
    }

    setAdding(true);
    try {
      // Use pre-verified coords if available, otherwise geocode on submit
      const verified = verifiedAddresses[type];
      const coords = verified
        ? { lat: verified.lat, lng: verified.lng }
        : await geocodeAddress(address);

      const body: Record<string, unknown> = {
        type,
        name,
        lat: coords.lat,
        lng: coords.lng,
      };
      if (type === "offices") body.address = address;

      const res = await fetch("/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword!,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (res.ok) {
        showMessage(`Added ${name} successfully`);
        if (type === "providers") {
          setProviderName("");
          setProviderAddress("");
        } else if (type === "staff") {
          setStaffName("");
          setStaffAddress("");
        } else {
          setOfficeName("");
          setOfficeAddress("");
        }
        setVerifiedAddresses((prev) => ({ ...prev, [type]: null }));
        await loadData();
      } else {
        showMessage(result.error || "Failed to add entry", true);
      }
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Failed to add entry",
        true
      );
    } finally {
      setAdding(false);
    }
  }

  async function removeEntry(type: TabName, name: string) {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;

    try {
      const res = await fetch("/api/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPassword!,
        },
        body: JSON.stringify({ type, name }),
      });

      const result = await res.json();
      if (res.ok) {
        showMessage(`Removed ${name} successfully`);
        await loadData();
      } else {
        showMessage(result.error || "Failed to remove entry", true);
      }
    } catch {
      showMessage("Failed to remove entry", true);
    }
  }

  function escapeHtml(text: string) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Login screen
  if (!adminPassword) {
    return (
      <div className="admin-container">
        <Link href="/" className="back-link">
          &larr; Back to Office Finder
        </Link>
        <div className="login-form">
          <h2>Admin Login</h2>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>
          <button
            className="search-button"
            onClick={handleLogin}
            disabled={loginLoading}
            style={{ marginTop: "16px" }}
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
          {loginError && (
            <div className="message error" style={{ marginTop: "16px" }}>
              {loginError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin panel
  const tabs: TabName[] = ["providers", "staff", "offices"];

  function renderTab(type: TabName) {
    const items = data[type];
    const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

    let nameVal: string, addressVal: string;
    let setNameFn: (v: string) => void, setAddressFn: (v: string) => void;
    let label: string, namePlaceholder: string, addressPlaceholder: string, buttonLabel: string;

    if (type === "providers") {
      nameVal = providerName;
      addressVal = providerAddress;
      setNameFn = setProviderName;
      setAddressFn = setProviderAddress;
      label = "Provider";
      namePlaceholder = "e.g. John Smith";
      addressPlaceholder = "e.g. 123 Main St, Los Angeles, CA";
      buttonLabel = "Add Provider";
    } else if (type === "staff") {
      nameVal = staffName;
      addressVal = staffAddress;
      setNameFn = setStaffName;
      setAddressFn = setStaffAddress;
      label = "Staff";
      namePlaceholder = "e.g. Jane Doe";
      addressPlaceholder = "e.g. 456 Oak Ave, Pasadena, CA";
      buttonLabel = "Add Staff";
    } else {
      nameVal = officeName;
      addressVal = officeAddress;
      setNameFn = setOfficeName;
      setAddressFn = setOfficeAddress;
      label = "Office";
      namePlaceholder = "e.g. Downtown";
      addressPlaceholder = "e.g. 789 Medical Dr, Los Angeles, CA 90001";
      buttonLabel = "Add Office";
    }

    const verified = verifiedAddresses[type];
    const isAddDisabled = adding || searching;

    return (
      <div>
        <div className="add-form">
          <h3>Add {label}</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor={`${type}-name`}>
                {type === "offices" ? "Office Name" : "Name"}
              </label>
              <input
                type="text"
                id={`${type}-name`}
                placeholder={namePlaceholder}
                value={nameVal}
                onChange={(e) => setNameFn(e.target.value)}
              />
            </div>
            <div className="input-group" ref={suggestionsRef}>
              <label htmlFor={`${type}-address`}>
                {type === "offices" ? "Address" : "Home Address"}
              </label>
              <input
                type="text"
                id={`${type}-address`}
                placeholder={addressPlaceholder}
                value={addressVal}
                onChange={(e) => handleAddressChange(e.target.value, type, setAddressFn)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                autoComplete="off"
              />
              {searching && (
                <div className="address-searching">Searching...</div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="address-suggestions">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="address-suggestion-item"
                      onMouseDown={() => handleSuggestionSelect(s, type, setAddressFn)}
                    >
                      {s.displayName}
                    </div>
                  ))}
                </div>
              )}
              {verified && (
                <div className="address-verified">
                  Verified: {verified.displayName}
                </div>
              )}
            </div>
          </div>
          <button
            className="add-button"
            onClick={() => addEntry(type)}
            disabled={isAddDisabled}
          >
            {adding ? "Adding..." : searching ? "Searching..." : buttonLabel}
          </button>
        </div>
        <div className="list-container">
          <h3>
            {type.charAt(0).toUpperCase() + type.slice(1)} ({items.length})
          </h3>
          {sorted.length === 0 ? (
            <div className="empty-list">No entries yet</div>
          ) : (
            sorted.map((item) => (
              <div key={item.name} className="list-item">
                <div className="list-item-info">
                  <div className="list-item-name">
                    {escapeHtml(item.name)}
                  </div>
                  <div className="list-item-details">
                    {"address" in item && item.address
                      ? `${escapeHtml(item.address as string)} | `
                      : ""}
                    Coords: {item.lat}, {item.lng}
                  </div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => removeEntry(type, item.name)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Link href="/" className="back-link">
        &larr; Back to Office Finder
      </Link>

      <div className="admin-header">
        <h1>Staff Management</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {message && (
        <div className={`message ${message.isError ? "error" : "success"}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderTab(activeTab)}
    </div>
  );
}

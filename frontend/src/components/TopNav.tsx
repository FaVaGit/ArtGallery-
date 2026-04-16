import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { eventBus } from "../events";
import type { AuthUser } from "../types";
import type { Language, ThemeMode } from "../i18n/messages";

interface TopNavProps {
  brandName: string;
  user: AuthUser | null;
  language: Language;
  themeMode: ThemeMode;
  labels: {
    portfolio: string;
    admin: string;
    guest: string;
    logout: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
  };
}

function nextTheme(current: ThemeMode): ThemeMode {
  if (current === "light") return "dark";
  if (current === "dark") return "system";
  return "light";
}

function themeIcon(mode: ThemeMode) {
  if (mode === "dark") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (mode === "system") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function themeLabel(mode: ThemeMode, labels: TopNavProps["labels"]): string {
  if (mode === "dark") return labels.themeDark;
  if (mode === "system") return labels.themeSystem;
  return labels.themeLight;
}

export function TopNav({ brandName, user, language, themeMode, labels }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navControls = (
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={() => eventBus.emit("theme:changed", { theme: nextTheme(themeMode) })}
        title={`${labels.theme}: ${themeLabel(themeMode, labels)}`}
        aria-label={`${labels.theme}: ${themeLabel(themeMode, labels)}`}
      >
        {themeIcon(themeMode)}
      </button>

      <label className="language-box">
        <span>{labels.language}</span>
        <select
          value={language}
          onChange={(e) => eventBus.emit("i18n:changed", { language: e.target.value as Language })}
        >
          <option value="en">EN</option>
          <option value="it">IT</option>
        </select>
      </label>
      {user ? (
        <>
          <span className="session-chip">{user.username} ({user.role})</span>
          <button type="button" className="ghost" onClick={() => { eventBus.emit("auth:logout"); setMobileOpen(false); }}>
            {labels.logout}
          </button>
        </>
      ) : (
        <span className="session-chip">{labels.guest}</span>
      )}
    </>
  );

  return (
    <header className="top-nav">
      <Link to="/" className="brand">
        {brandName}
      </Link>

      <nav aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          {labels.portfolio}
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
          {labels.admin}
        </NavLink>
      </nav>

      {/* Desktop session controls */}
      <div className="session-box session-box--desktop">
        {navControls}
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="hamburger-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        <span className={`hamburger-icon ${mobileOpen ? "open" : ""}`}>
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="mobile-panel" onClick={() => setMobileOpen(false)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <NavLink to="/" end onClick={() => setMobileOpen(false)}>
              {labels.portfolio}
            </NavLink>
            <NavLink to="/admin" onClick={() => setMobileOpen(false)}>
              {labels.admin}
            </NavLink>
          </nav>
          <div className="mobile-controls">
            {navControls}
          </div>
        </div>
      )}
    </header>
  );
}

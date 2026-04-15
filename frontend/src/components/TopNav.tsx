import { Link, NavLink } from "react-router-dom";

import type { AuthUser } from "../types";
import type { Language } from "../i18n/messages";

interface TopNavProps {
  brandName: string;
  user: AuthUser | null;
  language: Language;
  labels: {
    portfolio: string;
    admin: string;
    guest: string;
    logout: string;
    language: string;
  };
  onLanguageChange: (language: Language) => void;
  onLogout: () => void;
}

export function TopNav({ brandName, user, language, labels, onLanguageChange, onLogout }: TopNavProps) {
  return (
    <header className="top-nav">
      <Link to="/" className="brand">
        {brandName}
      </Link>

      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "") }>
          {labels.portfolio}
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "") }>
          {labels.admin}
        </NavLink>
      </nav>

      <div className="session-box">
        <label className="language-box">
          <span>{labels.language}</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
            <option value="en">EN</option>
            <option value="it">IT</option>
          </select>
        </label>
        {user ? (
          <>
            <span className="session-chip">{user.username} ({user.role})</span>
            <button type="button" className="ghost" onClick={onLogout}>
              {labels.logout}
            </button>
          </>
        ) : (
          <span className="session-chip">{labels.guest}</span>
        )}
      </div>
    </header>
  );
}

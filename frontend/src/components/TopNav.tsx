import { Link, NavLink } from "react-router-dom";

import { eventBus } from "../events";
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
}

export function TopNav({ brandName, user, language, labels }: TopNavProps) {
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
            <button type="button" className="ghost" onClick={() => eventBus.emit("auth:logout")}>
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

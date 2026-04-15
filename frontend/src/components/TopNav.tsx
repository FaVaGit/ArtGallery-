import { Link, NavLink } from "react-router-dom";

import type { AuthUser } from "../types";

interface TopNavProps {
  user: AuthUser | null;
  onLogout: () => void;
}

export function TopNav({ user, onLogout }: TopNavProps) {
  return (
    <header className="top-nav">
      <Link to="/" className="brand">
        Facciate Gallery
      </Link>

      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "") }>
          Portfolio
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "") }>
          Admin
        </NavLink>
      </nav>

      <div className="session-box">
        {user ? (
          <>
            <span className="session-chip">{user.username} ({user.role})</span>
            <button type="button" className="ghost" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <span className="session-chip">Guest</span>
        )}
      </div>
    </header>
  );
}

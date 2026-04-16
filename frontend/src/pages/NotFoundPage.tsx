import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page not-found-page">
      <div className="not-found-content">
        <svg className="not-found-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <h1>404</h1>
        <p className="subtitle">This page doesn't exist.</p>
        <Link to="/" className="button-link">Go Home</Link>
      </div>
    </section>
  );
}

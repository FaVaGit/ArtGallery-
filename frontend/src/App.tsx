import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getCurrentUser, login } from "./api/authApi";
import { TopNav } from "./components/TopNav";
import { AdminPage } from "./pages/AdminPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { AuthUser } from "./types";
import "./App.css";

const TOKEN_STORAGE_KEY = "artgallery.auth.token";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setUser(null);
        setBootstrapping(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        setUser(response.user);
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setBootstrapping(false);
      }
    };

    restoreSession().catch(() => {
      setToken(null);
      setUser(null);
      setBootstrapping(false);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    });
  }, [token]);

  async function handleLogin(username: string, password: string): Promise<void> {
    const response = await login(username, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (bootstrapping) {
    return <div className="boot-screen">Loading workspace...</div>;
  }

  return (
    <div className="app-shell">
      <TopNav user={user} onLogout={handleLogout} />

      <main>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/admin" element={<AdminPage token={token} user={user} onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

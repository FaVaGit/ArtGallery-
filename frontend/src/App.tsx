import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { setApiBaseUrl } from "./api/client";
import { getCurrentUser, login } from "./api/authApi";
import { loadAppConfig, saveAppConfig, type AppConfig } from "./config/appConfig";
import { TopNav } from "./components/TopNav";
import { getMessages, type Language } from "./i18n/messages";
import { AdminPage } from "./pages/AdminPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { AuthUser } from "./types";
import "./App.css";

const TOKEN_STORAGE_KEY = "artgallery.auth.token";
const LANGUAGE_STORAGE_KEY = "artgallery.ui.language";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (stored === "it" || stored === "en") {
      return stored;
    }

    return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
  });
  const [config, setConfig] = useState<AppConfig>(() => loadAppConfig());
  const [bootstrapping, setBootstrapping] = useState(true);
  const messages = getMessages(language);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    saveAppConfig(config);
    setApiBaseUrl(config.apiBaseUrl);
  }, [config]);

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
    return <div className="boot-screen">{messages.common.loadingWorkspace}</div>;
  }

  return (
    <div className="app-shell">
      <TopNav
        brandName={config.brandName}
        user={user}
        language={language}
        labels={messages.nav}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          <Route path="/" element={<PortfolioPage messages={messages} config={config} />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                token={token}
                user={user}
                messages={messages}
                config={config}
                onConfigChange={setConfig}
                onLogin={handleLogin}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

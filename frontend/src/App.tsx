import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { eventBus, useEvent } from "./events";
import { setApiBaseUrl } from "./api/client";
import { getCurrentUser, login } from "./api/authApi";
import { loadAppConfig, saveAppConfig, type AppConfig } from "./config/appConfig";
import { TopNav } from "./components/TopNav";
import { Toaster } from "./components/Toaster";
import { getMessages, type Language } from "./i18n/messages";
import { AdminPage } from "./pages/AdminPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { AuthUser } from "./types";
import "./App.css";

const TOKEN_KEY = "artgallery.auth.token";
const LANG_KEY = "artgallery.ui.language";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "it" || stored === "en") return stored;
    return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
  });
  const [config, setConfig] = useState<AppConfig>(() => loadAppConfig());
  const [bootstrapping, setBootstrapping] = useState(true);
  const messages = getMessages(language);

  /* ── Persist language ──────────────────────── */
  useEffect(() => {
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  /* ── Persist config & apply runtime base URL ── */
  useEffect(() => {
    saveAppConfig(config);
    setApiBaseUrl(config.apiBaseUrl);
  }, [config]);

  /* ── Restore session on mount ──────────────── */
  useEffect(() => {
    const restore = async () => {
      if (!token) { setUser(null); setBootstrapping(false); return; }
      try {
        const res = await getCurrentUser(token);
        setUser(res.user);
        eventBus.emit("auth:sessionRestored", { user: res.user });
      } catch {
        setToken(null); setUser(null);
        localStorage.removeItem(TOKEN_KEY);
      } finally { setBootstrapping(false); }
    };
    restore().catch(() => { setToken(null); setUser(null); setBootstrapping(false); localStorage.removeItem(TOKEN_KEY); });
  }, [token]);

  /* ── Event-driven handlers ─────────────────── */
  useEvent("auth:login", async ({ username, password }) => {
    try {
      const res = await login(username, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.token);
      eventBus.emit("auth:loginSuccess", { token: res.token, user: res.user });
      eventBus.emit("notify:success", { message: messages.admin.loginSuccess ?? `Welcome, ${res.user.username}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : messages.admin.loginFailed;
      eventBus.emit("auth:loginFailed", { error: msg });
      eventBus.emit("notify:error", { message: msg });
    }
  });

  useEvent("auth:logout", () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    eventBus.emit("notify:info", { message: messages.nav.loggedOut ?? "Logged out" });
  });

  useEvent("i18n:changed", ({ language: lang }) => setLanguage(lang));

  useEvent("config:changed", ({ config: newConfig }) => {
    setConfig(newConfig);
    eventBus.emit("notify:success", { message: messages.admin.configSaved });
  });

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
      />

      <main>
        <Routes>
          <Route path="/" element={<PortfolioPage messages={messages} config={config} token={token} />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                token={token}
                user={user}
                messages={messages}
                config={config}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default App;

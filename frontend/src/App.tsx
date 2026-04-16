import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { eventBus, useEvent } from "./events";
import { setApiBaseUrl } from "./api/client";
import { getCurrentUser, login } from "./api/authApi";
import { loadAppConfig, saveAppConfig, type AppConfig } from "./config/appConfig";
import { TopNav } from "./components/TopNav";
import { Toaster } from "./components/Toaster";
import { getMessages, type Language, type ThemeMode } from "./i18n/messages";
import { AdminPage } from "./pages/AdminPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import type { AuthUser } from "./types";
import "./App.css";

const TOKEN_KEY = "artgallery.auth.token";
const LANG_KEY = "artgallery.ui.language";
const THEME_KEY = "artgallery.ui.theme";

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "it" || stored === "en") return stored;
    return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
  });
  const [config, setConfig] = useState<AppConfig>(() => loadAppConfig());
  const [bootstrapping, setBootstrapping] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const messages = getMessages(language);

  /* ── Theme ─────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
    document.documentElement.setAttribute("data-theme", resolveTheme(themeMode));

    if (themeMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [themeMode]);

  /* ── Offline detection ─────────────────────── */
  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      eventBus.emit("notify:error", { message: messages.common.offline });
    };
    const goOnline = () => {
      setIsOffline(false);
      eventBus.emit("notify:success", { message: messages.common.backOnline });
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, [messages.common.offline, messages.common.backOnline]);

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
  useEvent("theme:changed", ({ theme }) => setThemeMode(theme));

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
        themeMode={themeMode}
        labels={messages.nav}
      />

      {isOffline && <div className="offline-banner">{messages.common.offline}</div>}

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

      <footer className="site-footer">
        <p className="footer-brand">Debora Vacchino</p>
        <p>
          {language === "it"
            ? "Decoratrice e restauratrice murale — Uscio (GE), Liguria"
            : "Mural decorator and restorer — Uscio (GE), Liguria, Italy"}
        </p>
        <p>
          <a href="https://www.linkedin.com/in/debora-vacchino-422a4b52" target="_blank" rel="noreferrer">LinkedIn</a>
          {" · "}
          <a href="mailto:debora.uscio@live.it">debora.uscio@live.it</a>
        </p>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;

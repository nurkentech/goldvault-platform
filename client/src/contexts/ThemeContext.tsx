import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export type ThemePreference = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

interface ThemeContextType {
  theme: EffectiveTheme;
  preference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "system", switchable = true }: { children: React.ReactNode; defaultTheme?: ThemePreference; switchable?: boolean }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const update = trpc.user.updateProfile.useMutation({ onSuccess: () => utils.auth.me.invalidate() });
  const [preference, setPreference] = useState<ThemePreference>(() => (localStorage.getItem("theme") as ThemePreference | null) ?? defaultTheme);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (user?.themePreference) setPreference(user.themePreference);
  }, [user?.themePreference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const theme: EffectiveTheme = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("theme", preference);
  }, [preference, theme]);

  const value = useMemo<ThemeContextType>(() => ({
    theme, preference, switchable,
    setTheme(next) { setPreference(next); if (user) update.mutate({ themePreference: next }); },
    toggleTheme() { const next = theme === "dark" ? "light" : "dark"; setPreference(next); if (user) update.mutate({ themePreference: next }); },
  }), [preference, switchable, theme, update, user]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

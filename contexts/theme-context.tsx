"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemePreference) => void;
};

const THEME_STORAGE_KEY = "plebiq-theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  effectiveTheme: "light",
  setTheme: () => undefined,
});

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemTheme(): EffectiveTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme = isThemePreference(storedTheme) ? storedTheme : "system";

    setThemeState(nextTheme);
    setSystemTheme(getSystemTheme());
    applyTheme(nextTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(media.matches ? "dark" : "light");

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      effectiveTheme: theme === "system" ? systemTheme : theme,
      setTheme,
    }),
    [systemTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

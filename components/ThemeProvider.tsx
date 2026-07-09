"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function isDaytime() {
      const h = new Date().getHours();
      return h >= 7 && h < 19; // light 7am–7pm, dark outside that
    }

    function apply(t: Theme) {
      if (t === "dark") {
        root.classList.add("dark");
      } else if (t === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.toggle("dark", !isDaytime());
      }
    }

    apply(theme);

    if (theme === "system") {
      // Re-check at the top of every minute so the switch happens on time
      const tick = () => root.classList.toggle("dark", !isDaytime());
      const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
      let interval: ReturnType<typeof setInterval>;
      const timeout = setTimeout(() => {
        tick();
        interval = setInterval(tick, 60_000);
      }, msUntilNextMinute);
      return () => { clearTimeout(timeout); clearInterval(interval); };
    }
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("theme", t);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

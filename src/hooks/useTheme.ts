import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import type { Theme } from "@/lib/constants/themes";
import { themes } from "@/lib/constants/themes";

const THEME_STORAGE_KEY = "swasth-color-theme";

export function useColorTheme() {
  const { theme: mode, resolvedTheme } = useNextTheme();
  const [colorTheme, setColorTheme] = useState<Theme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (saved && themes[saved]) {
      setColorTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const isDark = resolvedTheme === "dark";
    applyTheme(colorTheme, isDark);
  }, [colorTheme, resolvedTheme, mounted]);

  const setTheme = (theme: Theme) => {
    setColorTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const isDark = resolvedTheme === "dark";
    applyTheme(theme, isDark);
  };

  return { colorTheme, setTheme, mounted };
}

function applyTheme(theme: Theme, isDark: boolean) {
  const themeConfig = themes[theme];
  if (!themeConfig) return;

  const colors = isDark ? themeConfig.colors.dark : themeConfig.colors.light;
  const root = document.documentElement;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--chart-1", colors.chart1);
  root.style.setProperty("--chart-2", colors.chart2);
  root.style.setProperty("--chart-3", colors.chart3);
  root.style.setProperty("--chart-4", colors.chart4);
  root.style.setProperty("--chart-5", colors.chart5);
  root.style.setProperty("--sidebar-primary", colors.sidebarPrimary);
  root.style.setProperty("--sidebar-primary-foreground", colors.primaryForeground);
  root.style.setProperty("--icon-active", colors.iconActive);
  root.style.setProperty("--icon-inactive", colors.iconInactive);
}


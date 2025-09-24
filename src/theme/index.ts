// src/theme/index.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";
type ThemeContextType = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  colorScheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme() ?? "light"; // 'light' | 'dark'
  const [mode, setMode] = useState<ThemeMode>("system");
  const colorScheme: "light" | "dark" = mode === "system" ? sys : mode;

  const value = useMemo(
    () => ({ mode, setMode, colorScheme }),
    [mode, colorScheme]
  );

//   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

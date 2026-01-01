
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const accentColors = [
    { name: 'pink', hsl: '348 100% 85.3%' },
    { name: 'slateBlue', hsl: '240 10% 3.9%' },
];

export type AccentColor = (typeof accentColors)[number];

type CustomThemeProviderProps = ThemeProviderProps & {
  children: React.ReactNode;
};

type ThemeContextType = {
  setAccentColor: (color: AccentColor) => void;
  accentColor: AccentColor;
};

const CustomThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  const [accentColor, setAccentColorState] = React.useState<AccentColor>(accentColors[1]); // Default to slateBlue

  const setAccentColor = React.useCallback((color: AccentColor) => {
    setAccentColorState(color);
    if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', color.name);
    }
  }, []);
  
  // Set default theme on initial load
  React.useEffect(() => {
    const storedThemeName = localStorage.getItem('app-theme-name');
    if (storedThemeName === 'pink') {
      setAccentColor(accentColors[0]);
    } else {
      setAccentColor(accentColors[1]);
    }
  }, [setAccentColor]);

  return (
    <CustomThemeContext.Provider value={{ setAccentColor, accentColor }}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </CustomThemeContext.Provider>
  )
}

export const useThemeManager = () => {
    const context = React.useContext(CustomThemeContext);
    if (context === undefined) {
        throw new Error('useThemeManager must be used within a ThemeProvider');
    }
    return context;
};

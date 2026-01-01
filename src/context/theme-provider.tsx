
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const accentColors = [
    { name: 'orange', hsl: '35 68% 54%' },
    { name: 'slateBlue', hsl: '240 16% 29%' },
    { name: 'pink', hsl: '348 100% 77%'},
];

export type AccentColor = (typeof accentColors)[number];

type CustomThemeProviderProps = ThemeProviderProps & {
  children: React.ReactNode;
};

type ThemeContextType = {
  toggleAccentColor: () => void;
  setAccentColor: (color: AccentColor) => void;
  accentColor: AccentColor;
};

const CustomThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  const [accentColor, setAccentColorState] = React.useState<AccentColor>(accentColors[1]);

  const setAccentColor = React.useCallback((color: AccentColor) => {
    setAccentColorState(color);
    if (typeof window !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty('--primary', color.hsl);
        root.style.setProperty('--accent', color.hsl);
        root.style.setProperty('--ring', color.hsl);
    }
  }, []);
  
  const toggleAccentColor = React.useCallback(() => {
    const currentIndex = accentColors.findIndex(c => c.name === accentColor.name);
    const nextIndex = (currentIndex + 1) % accentColors.length;
    setAccentColor(accentColors[nextIndex]);
  }, [accentColor.name, setAccentColor]);
  
  const randomAccentColor = React.useCallback(() => {
    const availableColors = accentColors.filter(c => c.name !== 'pink');
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    setAccentColor(availableColors[randomIndex]);
  }, [setAccentColor]);
  

  React.useEffect(() => {
    setAccentColor(accentColors[1]); // Default to slateBlue
  }, [setAccentColor]);

  return (
    <CustomThemeContext.Provider value={{ toggleAccentColor: randomAccentColor, setAccentColor, accentColor }}>
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

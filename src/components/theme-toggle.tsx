
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // On the server or before hydration, render a placeholder or nothing
    // to avoid mismatch. A disabled button is a good placeholder.
    return <Button variant="ghost" size="icon" disabled className="h-9 w-9" />;
  }

  const isDark = theme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // For Desktop in Header
  if (window.innerWidth >= 768) {
      return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      )
  }

  // For Mobile on Profile Page
  return (
    <Switch
      checked={isDark}
      onCheckedChange={handleToggle}
      aria-label="Toggle theme"
    />
  )
}

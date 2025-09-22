// src/components/theme-provider.tsx

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Lightweight ThemeProvider props shape (avoid deep import from package internals)
type ThemeProviderProps = {
  children?: React.ReactNode
  attribute?: string
  defaultTheme?: string
  value?: { light: string; dark: string } | string
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...(props as any)}>{children}</NextThemesProvider>
}

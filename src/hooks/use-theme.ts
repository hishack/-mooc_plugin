import { useEffect, useState } from "react"

type Theme = "system" | "light" | "dark"

export function useTheme({
  theme,
  onThemeChange,
}: {
  theme: Theme
  onThemeChange?: (theme: Theme) => void
}) {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined" || !window.matchMedia) return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  const updateDocumentTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const resolveTheme = (currentTheme: Theme): "light" | "dark" => {
    if (currentTheme === "system") return getSystemTheme()
    return currentTheme
  }

  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    updateDocumentTheme(resolved === "dark")
  }, [theme])

  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const sysTheme = getSystemTheme()
      setResolvedTheme(sysTheme)
      updateDocumentTheme(sysTheme === "dark")
    }
    handler()
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    onThemeChange?.(newTheme)
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
  }
}

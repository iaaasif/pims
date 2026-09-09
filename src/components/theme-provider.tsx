import { createContext, useContext, useEffect, useState } from "react"
import { hexToHsl, hslToVariable, hslToCommaString, getContrastColor, getHoverColor, getSecondaryColor, getAccentColor } from "@/lib/colorUtils"

type Theme = "dark" | "light" | "system"
export type ColorScheme = "emerald" | "blue" | "indigo" | "rose" | "orange" | "custom"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    defaultColorScheme?: ColorScheme
    storageKey?: string
    colorStorageKey?: string
    customColorStorageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    colorScheme: ColorScheme
    setColorScheme: (color: ColorScheme) => void
    customColor: string
    setCustomColor: (color: string) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    colorScheme: "emerald",
    setColorScheme: () => null,
    customColor: "#ff9900",
    setCustomColor: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultColorScheme = "emerald",
    storageKey = "vite-ui-theme",
    colorStorageKey = "vite-ui-color",
    customColorStorageKey = "vite-ui-custom-color",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )
    const [colorScheme, setColorScheme] = useState<ColorScheme>(
        () => (localStorage.getItem(colorStorageKey) as ColorScheme) || defaultColorScheme
    )
    const [customColor, setCustomColor] = useState<string>(
        () => localStorage.getItem(customColorStorageKey) || "#ff9900"
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }, [theme])

    useEffect(() => {
        const root = window.document.documentElement
        root.setAttribute("data-color-scheme", colorScheme)

        if (colorScheme === "custom") {
            const hsl = hexToHsl(customColor)
            const hslVar = hslToVariable(hsl)
            const hslComma = hslToCommaString(hsl)
            const contrastVar = getContrastColor(hsl)
            const hoverHsl = getHoverColor(hsl)
            const hoverVar = hslToVariable(hoverHsl)

            const secondaryHsl = getSecondaryColor(hsl)
            const secondaryVar = hslToVariable(secondaryHsl)
            const secondaryForegroundVar = getContrastColor(secondaryHsl)

            const accentHsl = getAccentColor(hsl)
            const accentVar = hslToVariable(accentHsl)
            const accentForegroundVar = getContrastColor(accentHsl)

            root.style.setProperty("--primary", hslVar)
            root.style.setProperty("--primary-color", `hsl(${hslComma})`)
            root.style.setProperty("--primary-foreground", contrastVar)
            root.style.setProperty("--primary-hover", hoverVar)

            root.style.setProperty("--secondary", secondaryVar)
            root.style.setProperty("--secondary-foreground", secondaryForegroundVar)
            root.style.setProperty("--accent", accentVar)
            root.style.setProperty("--accent-foreground", accentForegroundVar)

            root.style.setProperty("--ring", hslVar)
            root.style.setProperty("--sidebar-primary", hslVar)
            root.style.setProperty("--sidebar-primary-foreground", contrastVar)
        } else {
            // Remove inline styles if not custom
            root.style.removeProperty("--primary")
            root.style.removeProperty("--primary-color")
            root.style.removeProperty("--primary-foreground")
            root.style.removeProperty("--primary-hover")
            root.style.removeProperty("--secondary")
            root.style.removeProperty("--secondary-foreground")
            root.style.removeProperty("--accent")
            root.style.removeProperty("--accent-foreground")
            root.style.removeProperty("--ring")
            root.style.removeProperty("--sidebar-primary")
            root.style.removeProperty("--sidebar-primary-foreground")
        }
    }, [colorScheme, customColor])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
        colorScheme,
        setColorScheme: (color: ColorScheme) => {
            localStorage.setItem(colorStorageKey, color)
            setColorScheme(color)
        },
        customColor,
        setCustomColor: (color: string) => {
            localStorage.setItem(customColorStorageKey, color)
            setCustomColor(color)
        }
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}

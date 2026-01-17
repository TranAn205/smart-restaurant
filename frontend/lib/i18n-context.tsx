"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import viTranslations from "./translations/vi.json"
import enTranslations from "./translations/en.json"

type Locale = "vi" | "en"
type Translations = typeof viTranslations

interface I18nContextType {
  locale: Locale
  t: (key: string) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

const translations: Record<Locale, Translations> = {
  vi: viTranslations,
  en: enTranslations,
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi")
  const [mounted, setMounted] = useState(false)

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved && (saved === "vi" || saved === "en")) {
      setLocaleState(saved)
    }
    setMounted(true)
  }, [])

  // Save locale to localStorage when it changes
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  // Translation function
  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[locale]
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Return key if translation not found
        return key
      }
    }
    
    return typeof value === "string" ? value : key
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "vi", t: (key) => key, setLocale }}>
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

export type { Locale }

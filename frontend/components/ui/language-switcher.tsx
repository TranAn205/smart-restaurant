"use client"

import { useI18n, Locale } from "@/lib/i18n-context"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "icon"
  showLabel?: boolean
}

export function LanguageSwitcher({ 
  variant = "ghost", 
  size = "sm",
  showLabel = true 
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n()

  const toggleLocale = () => {
    setLocale(locale === "vi" ? "en" : "vi")
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={toggleLocale}
      className="gap-1.5"
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Globe className="h-4 w-4" />
      {showLabel && (
        <span className="text-xs font-medium">
          {locale === "vi" ? "EN" : "VI"}
        </span>
      )}
    </Button>
  )
}

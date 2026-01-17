"use client";

import { useState, useEffect } from "react";
import { Search, User, SlidersHorizontal, ChefHat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useI18n } from "@/lib/i18n-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tableId?: string;
  sortBy?: "created_at" | "popularity";
  onSortChange?: (sort: "created_at" | "popularity") => void;
  chefRecommended?: boolean;
  onChefRecommendedChange?: (value: boolean) => void;
}

export function MenuHeader({
  searchQuery,
  onSearchChange,
  tableId,
  sortBy = "created_at",
  onSortChange,
  chefRecommended = false,
  onChefRecommendedChange,
}: MenuHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    const name = localStorage.getItem("customerName");
    setIsLoggedIn(!!token);
    setCustomerName(name || "");
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-card-foreground">
            Smart Restaurant
          </h1>
          {tableId && (
            <p className="text-xs text-muted-foreground">{t("common.table")} {tableId}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Link href={isLoggedIn ? "/guest/profile" : "/guest/login"}>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <User className="h-5 w-5" />
              {isLoggedIn && (
                <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
              )}
              <span className="sr-only">
                {isLoggedIn ? t("profile.title") : t("common.login")}
              </span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("menu.search")}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {/* Filters Row */}
        <div className="flex gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {sortBy === "popularity" ? t("menu.popular") : t("menu.newest")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onSortChange?.("created_at")}>
                {t("menu.newest")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange?.("popularity")}>
                {t("menu.popular")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Chef Recommendation Toggle */}
          <Button
            variant={chefRecommended ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => onChefRecommendedChange?.(!chefRecommended)}
          >
            <ChefHat className="h-4 w-4 mr-2" />
            {t("menu.chefRecommended")}
          </Button>
        </div>
      </div>
    </header>
  );
}


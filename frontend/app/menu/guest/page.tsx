"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BottomNavigation } from "@/components/guest/bottom-navigation";
import { CartDrawer } from "@/components/guest/cart-drawer";
import { CategoryTabs } from "@/components/guest/category-tabs";
import { ItemDetailModal } from "@/components/guest/item-detail-modal";
import { MenuHeader } from "@/components/guest/menu-header";
import { MenuItemCard } from "@/components/guest/menu-item-card";
import { useCart } from "@/lib/cart-context";
import {
  type MenuItem,
  type ModifierOption,
  type Category,
} from "@/lib/menu-data";
import { menuAPI, getImageUrl } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function GuestMenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"created_at" | "popularity">("popularity"); // Default to popularity for "All"
  const [chefRecommended, setChefRecommended] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState<string>("");
  
  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { dispatch } = useCart();

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tableFromStorage = localStorage.getItem("guest_table");
        if (tableFromStorage) {
          try {
            const parsed = JSON.parse(tableFromStorage);
            setTableNumber(parsed.tableNumber || parsed.tableId || "");
          } catch {
            setTableNumber("");
          }
        }

        const categoriesRes = await menuAPI.getCategories();
        if (categoriesRes.data && categoriesRes.data.length > 0) {
          const apiCategories: Category[] = [
            { id: "all", name: "Tất cả", icon: "🍽️" },
            ...categoriesRes.data.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              icon: cat.icon || "🍴",
            })),
          ];
          setCategories(apiCategories);
        }
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch menu items
  const fetchItems = useCallback(async (page: number, append: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', itemsPerPage.toString());
      
      if (activeCategory && activeCategory !== 'all') {
        params.set('categoryId', activeCategory);
      }
      if (searchQuery) {
        params.set('q', searchQuery);
      }
      // When "All" category is selected, always sort by popularity
      if (activeCategory === 'all' || sortBy === 'popularity') {
        params.set('sort', 'popularity');
      }
      if (chefRecommended) {
        params.set('chefRecommended', 'true');
      }

      const itemsRes = await menuAPI.getItems(params.toString());
      
      if (itemsRes.data) {
        const apiItems: MenuItem[] = itemsRes.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          image: getImageUrl(item.primary_photo),
          category: item.category_id || item.category,
          rating: item.rating || 4.5,
          reviews: item.reviews || 0,
          isAvailable: item.is_available !== false && item.status !== "sold_out",
          modifiers: (item.modifiers || []).map((mod: any) => ({
            ...mod,
            multiple: mod.selection_type === 'multiple',
            required: mod.is_required || false,
            options: (mod.options || []).map((opt: any) => ({
              ...opt,
              price: opt.price_adjustment || opt.price || 0
            }))
          })),
        }));

        if (append) {
          setMenuItems(prev => [...prev, ...apiItems]);
        } else {
          setMenuItems(apiItems);
        }

        // Check if there's more data
        setHasMore(apiItems.length === itemsPerPage);
      } else {
        if (!append) {
          setMenuItems([]);
        }
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.message || "Không thể tải menu. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, searchQuery, sortBy, chefRecommended]);

  // Initial fetch and when filters change
  useEffect(() => {
    setCurrentPage(1);
    setMenuItems([]);
    setHasMore(true);
    fetchItems(1, false);
  }, [activeCategory, searchQuery, sortBy, chefRecommended]);

  // Load more when page changes (except first page)
  useEffect(() => {
    if (currentPage > 1) {
      fetchItems(currentPage, true);
    }
  }, [currentPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadingMore]);

  const handleQuickAdd = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItem(item);
      setIsDetailOpen(true);
    } else {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          menuItem: item,
          quantity: 1,
          selectedModifiers: [],
          totalPrice: item.price,
        },
      });
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg shadow-lg z-50 font-medium min-w-[280px] text-center';
      notification.textContent = `✓ Đã thêm ${item.name} vào giỏ hàng`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    modifiers: ModifierOption[],
    notes: string
  ) => {
    const modifierTotal = modifiers.reduce((acc, mod) => {
      const price = typeof mod.price === 'number' ? mod.price : parseFloat(mod.price || 0);
      return acc + (isNaN(price) ? 0 : price);
    }, 0);
    const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
    const finalTotal = itemPrice + modifierTotal;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        menuItem: item,
        quantity,
        selectedModifiers: modifiers,
        notes,
        totalPrice: finalTotal,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MenuHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tableId={tableNumber}
        sortBy={sortBy}
        onSortChange={setSortBy}
        chefRecommended={chefRecommended}
        onChefRecommendedChange={setChefRecommended}
      />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Đang tải menu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-destructive text-4xl">❌</div>
            <p className="text-destructive font-medium mb-2">Lỗi tải dữ liệu</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => fetchItems(1, false)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Thử lại
            </button>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy món ăn phù hợp
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={() => handleQuickAdd(item)}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDetailOpen(true);
                  }}
                />
              ))}
            </div>
            
            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="mt-6 flex justify-center py-4">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tải thêm...</span>
                </div>
              )}
              {!hasMore && menuItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Đã hiển thị tất cả {menuItems.length} món
                </p>
              )}
            </div>
          </>
        )}
      </main>

      <BottomNavigation onCartClick={() => setIsCartOpen(true)} />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

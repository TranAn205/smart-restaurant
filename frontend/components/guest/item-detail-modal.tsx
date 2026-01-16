"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, Star, X, MessageSquare, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { MenuItem, ModifierOption } from "@/lib/menu-data"
import { formatPrice } from "@/lib/menu-data"
import { reviewsAPI } from "@/lib/api"

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ItemDetailModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, quantity: number, modifiers: ModifierOption[], notes: string) => void
}

export function ItemDetailModal({ item, isOpen, onClose, onAddToCart }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([])
  const [notes, setNotes] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Fetch reviews when item changes
  useEffect(() => {
    if (item && isOpen) {
      setLoadingReviews(true)
      reviewsAPI.getItemReviews(item.id)
        .then((res) => setReviews(res.data || res || []))
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false))
    }
  }, [item, isOpen])

  // Fetch related items when item changes
  useEffect(() => {
    if (item && isOpen) {
      setLoadingRelated(true)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/menu/items/${item.id}/related`)
        .then(res => res.json())
        .then(data => {
          // Map primary_photo to image field for consistency
          const mappedItems = (data.data || []).map((relatedItem: any) => ({
            ...relatedItem,
            image: relatedItem.primary_photo ? 
              (relatedItem.primary_photo.startsWith('http') ? relatedItem.primary_photo : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${relatedItem.primary_photo}`) 
              : '/placeholder.svg'
          }));
          setRelatedItems(mappedItems);
        })
        .catch(() => setRelatedItems([]))
        .finally(() => setLoadingRelated(false))
    }
  }, [item, isOpen])

  if (!isOpen || !item) return null

  const modifierTotal = selectedModifiers.reduce((sum, mod) => {
    const price = typeof mod.price === 'number' ? mod.price : parseFloat(mod.price || 0)
    return sum + (isNaN(price) ? 0 : price)
  }, 0)
  
  const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0)
  const totalPrice = (itemPrice + modifierTotal) * quantity

  const handleRadioChange = (modifierId: string, optionId: string) => {
    const modifier = item.modifiers?.find((m) => m.id === modifierId)
    if (!modifier) return

    const option = modifier.options.find((o) => o.id === optionId)
    if (!option) return

    setSelectedModifiers((prev) => {
      const filtered = prev.filter((m) => !modifier.options.some((o) => o.id === m.id))
      return [...filtered, option]
    })
  }

  const handleCheckboxChange = (option: ModifierOption, checked: boolean) => {
    setSelectedModifiers((prev) => (checked ? [...prev, option] : prev.filter((m) => m.id !== option.id)))
  }

  const handleAddToCart = () => {
    onAddToCart(item, quantity, selectedModifiers, notes)
    // Show success notification with theme colors
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg shadow-lg z-50 font-medium min-w-[300px] text-center';
    notification.textContent = `✓ Đã thêm ${quantity}x ${item.name} vào giỏ hàng`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
    setQuantity(1)
    setSelectedModifiers([])
    setNotes("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card sm:rounded-2xl">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{item.name}</h2>
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium text-card-foreground">{item.rating}</span>
                <span className="text-sm text-muted-foreground">({item.reviews} đánh giá)</span>
              </div>
            </div>
            <span className="text-xl font-bold text-primary">{formatPrice(item.price)}</span>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

          {item.modifiers?.map((modifier) => (
            <div key={modifier.id} className="mt-4">
              <h3 className="font-medium text-card-foreground">
                {modifier.name}
                {modifier.required && <span className="ml-2 text-xs text-destructive">*Bắt buộc</span>}
              </h3>
              <div className="mt-2 space-y-2">
                {modifier.multiple ? (
                  modifier.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-3">
                      <Checkbox
                        id={option.id}
                        checked={selectedModifiers.some((m) => m.id === option.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                      />
                      <Label htmlFor={option.id} className="flex flex-1 cursor-pointer items-center justify-between">
                        <span>{option.name}</span>
                        {(option.price || 0) > 0 && (
                          <span className="text-sm font-medium text-primary">+{formatPrice(option.price || 0)}</span>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <RadioGroup onValueChange={(value) => handleRadioChange(modifier.id, value)}>
                    {modifier.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex flex-1 cursor-pointer items-center justify-between">
                          <span>{option.name}</span>
                          {(option.price || 0) > 0 && (
                            <span className="text-sm font-medium text-primary">+{formatPrice(option.price || 0)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
          ))}

          {/* Customer Reviews Section */}
          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-card-foreground">
                Đánh giá từ khách hàng ({reviews.length})
              </h3>
            </div>
            
            {loadingReviews ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Chưa có đánh giá nào cho món này
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-border/50 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-card-foreground">
                        {review.customer_name || "Khách ẩn danh"}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? "fill-warning text-warning"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Items Section */}
          {relatedItems.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <h3 className="font-medium text-card-foreground mb-3">Món tương tự</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {relatedItems.map((relatedItem) => (
                  <div
                    key={relatedItem.id}
                    className="flex-none w-32 cursor-pointer group"
                    onClick={() => {
                      // Close current modal and re-open with new item
                      onClose();
                      setTimeout(() => {
                        // This will trigger parent to open modal with new item
                        const event = new CustomEvent('openItemDetail', { detail: relatedItem });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                      <Image 
                        src={relatedItem.image || "/placeholder.svg"} 
                        alt={relatedItem.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium mt-1 line-clamp-2 text-card-foreground">
                      {relatedItem.name}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs font-semibold text-primary">
                        {formatPrice(relatedItem.price)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-xs text-muted-foreground">{relatedItem.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-medium text-card-foreground">Ghi chú</h3>
            <Textarea
              placeholder="Ví dụ: Không hành, ít cay..."
              className="mt-2 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-border px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={!item.isAvailable}>
              Thêm - {formatPrice(totalPrice)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

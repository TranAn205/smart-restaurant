"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Clock, CheckCircle, ChefHat, Bell, Sparkles, CreditCard, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/menu-data"
import { orderAPI, reviewsAPI } from "@/lib/api"
import { toast } from "sonner"
import io from "socket.io-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000"


interface Order {
  id: string
  table_id: string
  table_number?: string
  status: "pending" | "accepted" | "preparing" | "ready" | "served" | "paid"
  total_amount: number
  discount_amount?: number
  created_at: string
  notes?: string
  items: Array<{
    id: string
    item_name: string
    item_image?: string
    quantity: number
    price_per_unit: number
    total_price: number
    modifiers_selected?: any
    status?: "pending" | "preparing" | "ready" | "served"
  }>
}

const statusSteps = [
  { key: "pending", label: "Chờ xác nhận", icon: Clock },
  { key: "accepted", label: "Đã xác nhận", icon: CheckCircle },
  { key: "preparing", label: "Đang nấu", icon: ChefHat },
  { key: "ready", label: "Sẵn sàng", icon: Bell },
  { key: "served", label: "Đã phục vụ", icon: Sparkles },
  { key: "paid", label: "Đã thanh toán", icon: CreditCard },
]

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [billRequested, setBillRequested] = useState(false)
  const [isRequestingBill, setIsRequestingBill] = useState(false)
  const [myReviews, setMyReviews] = useState<any[]>([])

  const fetchOrder = async () => {
    try {
      const data = await orderAPI.getOrder(orderId)
      setOrder((data?.data || data) as Order)
    } catch (error) {
      console.error("Failed to fetch order:", error)
      setOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    
    // Chỉ lấy danh sách review khi user đã đăng nhập
    const customerToken = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null
    if (customerToken) {
      reviewsAPI.getMyReviews().then((data) => {
        setMyReviews(data || [])
      }).catch(() => setMyReviews([]))
    }
    
    // Socket connection for payment status
    const tableFromStorage = typeof window !== "undefined" ? localStorage.getItem("guest_table") : null
    let tableId = null
    if (tableFromStorage) {
      try {
        const parsed = JSON.parse(tableFromStorage)
        tableId = parsed.tableId
      } catch {}
    }
    const newSocket = io(API_BASE)
    newSocket.on("connect", () => {
      if (tableId) {
        newSocket.emit("join:table", tableId)
      }
    })
    newSocket.on("order:paid", (data: { orderId: string; message?: string }) => {
      if (data.orderId === orderId) {
        toast.success("Thanh toán thành công!", {
          description: "Cảm ơn bạn đã sử dụng dịch vụ. Vui lòng đánh giá món ăn.",
          duration: 3000,
        })
        setTimeout(() => {
          router.push(`/guest/payment/${orderId}`)
        }, 1500)
      }
    })
    const interval = setInterval(fetchOrder, 5000)
    return () => {
      clearInterval(interval)
      newSocket.disconnect()
    }
  }, [orderId, router])


  const getCurrentStepIndex = () => {
    if (!order) return 0
    return statusSteps.findIndex((step) => step.key === order.status)
  }

  const handleRequestBill = async () => {
    setIsRequestingBill(true)
    try {
      await orderAPI.requestBill(orderId)
      setBillRequested(true)
      toast.success("Yêu cầu đã gửi!", {
        description: "Nhân viên sẽ đến xác nhận thanh toán ngay.",
        duration: 3000,
      })
    } catch (error: any) {
      toast.error("Gửi yêu cầu thất bại", {
        description: error.message || "Vui lòng thử lại.",
      })
    } finally {
      setIsRequestingBill(false)
    }
  }


  // Show loading state first
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">Chi tiết đơn hàng</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground">Chi tiết đơn hàng</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
          <Button className="mt-4" onClick={() => router.push("/guest/active-orders")}>
            Quay lại
          </Button>
        </div>

      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/guest/active-orders")}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Quay lại</span>
        </Button>
        <h1 className="text-lg font-bold text-card-foreground">Chi tiết đơn hàng</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* Order Info */}
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đơn hàng</p>
              <p className="font-mono text-lg font-bold text-card-foreground">#{order.id.slice(-6)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bàn số</p>
              <p className="text-lg font-bold text-primary">{order.table_number}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-semibold text-card-foreground">Món đã đặt ({order.items.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item, index) => {
              // Kiểm tra đã review chưa
              const reviewed = myReviews.some(r => r.item_id === item.id || r.menu_item_id === item.id)
              return (
                <div key={index} className="flex gap-3 p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    {item.item_image ? (
                      <Image
                        src={item.item_image}
                        alt={item.item_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-card-foreground">{item.item_name}</h4>
                          {item.status && (
                            <Badge 
                              variant="outline" 
                              className={
                                item.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                                item.status === "accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                                item.status === "preparing" ? "bg-blue-50 text-blue-700 border-blue-300" :
                                item.status === "ready" ? "bg-green-50 text-green-700 border-green-300" :
                                item.status === "served" ? "bg-gray-50 text-gray-700 border-gray-300" : ""
                              }
                            >
                              {item.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                              {item.status === "accepted" && <CheckCircle className="mr-1 h-3 w-3" />}
                              {item.status === "preparing" && <ChefHat className="mr-1 h-3 w-3" />}
                              {item.status === "ready" && <Bell className="mr-1 h-3 w-3" />}
                              {item.status === "served" && <Sparkles className="mr-1 h-3 w-3" />}
                              {item.status === "pending" ? "Chờ" :
                               item.status === "accepted" ? "Đã duyệt" :
                               item.status === "preparing" ? "Đang nấu" :
                               item.status === "ready" ? "Sẵn sàng" :
                               item.status === "served" ? "Đã phục vụ" : ""}
                            </Badge>
                          )}
                        </div>
                        {item.modifiers_selected && (
                          <p className="text-xs text-muted-foreground">
                            {typeof item.modifiers_selected === 'string'
                              ? item.modifiers_selected
                              : Array.isArray(item.modifiers_selected)
                                ? item.modifiers_selected.map((m: any) => m.name).join(", ")
                                : ""}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                    </div>
                    <p className="mt-1 font-medium text-primary">{formatPrice(item.total_price)}</p>
                    {/* Nút review */}
                    {order.status === 'paid' && !reviewed && (
                      <Button className="mt-2" size="sm" variant="secondary" onClick={() => router.push(`/guest/review/${item.id}`)}>
                        Đánh giá món này
                      </Button>
                    )}
                    {order.status === 'paid' && reviewed && (
                      <span className="mt-2 inline-block text-xs text-muted-foreground">Đã đánh giá</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Total */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-card-foreground">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(order.total_amount - (order.discount_amount || 0))}
            </span>
          </div>
        </div>

        {/* Order Info */}
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Mã đơn hàng</span>
            <span className="font-mono font-medium text-card-foreground">#{order.id.slice(-6)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Bàn</span>
            <span className="font-medium text-card-foreground">{order.table_number || order.table_id}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Thời gian</span>
            <span className="font-medium text-card-foreground">
              {new Date(order.created_at).toLocaleString("vi-VN")}
            </span>
          </div>
          {order.notes && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Ghi chú</span>
              <span className="text-right font-medium text-card-foreground">{order.notes}</span>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4">
        <div className="mx-auto max-w-lg space-y-2">
          {order.status !== 'paid' && (
            <Button 
              className="w-full" 
              size="lg" 
              variant="default"
              onClick={handleRequestBill}
              disabled={isRequestingBill || billRequested}
            >
              {isRequestingBill ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : billRequested ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Đã yêu cầu thanh toán
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Yêu cầu thanh toán
                </>
              )}
            </Button>
          )}
          <Button 
            className="w-full" 
            size="lg" 
            variant="outline"
            onClick={() => router.push("/menu/guest")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Gọi thêm món
          </Button>
        </div>
      </div>
    </div>
  )
}

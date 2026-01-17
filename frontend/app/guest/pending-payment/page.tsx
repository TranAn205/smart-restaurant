"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Banknote, Building2, CheckCircle, Loader2, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/guest/bottom-navigation"
import { CartDrawer } from "@/components/guest/cart-drawer"
import { formatPrice } from "@/lib/menu-data"
import { paymentAPI, orderAPI } from "@/lib/api"
import io from "socket.io-client"

interface Order {
  id: string
  table_id: string
  table_number: number
  status: string
  total_amount: number
  discount_amount?: number
  created_at: string
  items: Array<{
    id: string
    item_name: string
    quantity: number
    price: number
    total_price: number
  }>
}

type PaymentMethod = "cash" | "card" | "transfer"

const paymentMethods = [
  { id: "cash" as const, label: "Tiền mặt", icon: Banknote, description: "Thanh toán tại quầy" },
  { id: "card" as const, label: "Thẻ ngân hàng", icon: CreditCard, description: "Visa, Mastercard, JCB" },
  { id: "transfer" as const, label: "Chuyển khoản", icon: Building2, description: "QR Code ngân hàng" },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000"

export default function PendingPaymentPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash")
  const [isLoading, setIsLoading] = useState(true)
  const [isRequesting, setIsRequesting] = useState(false)
  const [showBill, setShowBill] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [error, setError] = useState("")
  const [tableId, setTableId] = useState<string | null>(null)
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    // Get table ID from guest_table storage
    const guestTable = localStorage.getItem("guest_table")
    if (guestTable) {
      try {
        const parsed = JSON.parse(guestTable)
        setTableId(parsed.tableId || null)
      } catch {
        setTableId(null)
      }
    }
  }, [])

  useEffect(() => {
    if (!tableId) {
      setIsLoading(false)
      return
    }

    const fetchBill = async () => {
      try {
        // Get orders for table and filter to served orders
        const tableOrders = await orderAPI.getTableOrders(tableId)
        const servedOrders = tableOrders.filter(order => order.status === "served")
        setOrders(servedOrders as Order[])
      } catch (err: any) {
        console.error("Failed to fetch orders:", err)
        setError(err.message || "Không thể tải đơn hàng")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBill()
  }, [tableId])

  // Socket connection for payment confirmation
  useEffect(() => {
    if (!tableId) return

    const newSocket = io(API_BASE)
    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to socket")
      newSocket.emit("join:table", tableId)
    })

    newSocket.on("order:paid", (data: { orderId: string; message: string }) => {
      console.log("Payment confirmed:", data)
      // Redirect to review page
      router.push("/guest/review")
    })

    return () => {
      newSocket.disconnect()
    }
  }, [tableId, router])

  const grandTotal = orders.reduce((sum, order) => sum + (order.total_amount - (order.discount_amount || 0)), 0)

  const handleRequestPayment = async () => {
    if (orders.length === 0) return

    setIsRequesting(true)
    setError("")

    try {
      const orderIds = orders.map(o => o.id)
      await paymentAPI.requestPayment(tableId!, orderIds)
      
      // Show bill
      setShowBill(true)
    } catch (err: any) {
      setError(err.message || "Không thể gửi yêu cầu thanh toán. Vui lòng thử lại.")
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-50 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-card-foreground">Thanh toán</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Chưa có đơn cần thanh toán</h2>
            <p className="mt-2 text-muted-foreground">Các đơn hàng đã phục vụ sẽ hiện ở đây</p>
            <Button className="mt-6" onClick={() => router.push("/guest/active-orders")}>
              Xem Đơn Hàng
            </Button>
          </div>
        ) : !showBill ? (
          <>
            {/* Orders Summary - Before Request */}
            <div className="mb-4 rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-semibold text-card-foreground">Đơn hàng cần thanh toán ({orders.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-card-foreground">#{order.id.slice(-6)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="mb-2 space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.item_name}
                          </span>
                          <span className="text-muted-foreground">{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-sm text-muted-foreground">Tạm tính</span>
                      <div className="text-right">
                        {order.discount_amount && order.discount_amount > 0 ? (
                          <>
                            <span className="font-medium text-card-foreground">
                              {formatPrice(order.total_amount - (order.discount_amount || 0))}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              <span className="line-through">{formatPrice(order.total_amount - (order.discount_amount || 0))}</span>
                              <span className="text-success ml-1">-{formatPrice(order.discount_amount)}</span>
                            </div>
                          </>
                        ) : (
                          <span className="font-medium text-card-foreground">{formatPrice(order.total_amount - (order.discount_amount || 0))}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Request Button */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-card-foreground">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleRequestPayment} 
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" />
                    Yêu cầu thanh toán
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Bill Display - After Request */}
            <div className="mb-4 rounded-lg border-2 border-primary bg-card">
              <div className="border-b border-border bg-primary/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground">Hóa đơn thanh toán</h3>
                  <div className="flex items-center gap-2 text-primary">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium">Chờ xác nhận</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4 text-center">
                  <Receipt className="mx-auto h-12 w-12 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nhân viên phục vụ sẽ đến xác nhận thanh toán
                  </p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  {orders.map((order) => (
                    <div key={order.id}>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm mb-2">
                          <span className="text-card-foreground">
                            {item.quantity}x {item.item_name}
                          </span>
                          <span className="text-card-foreground">{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="text-card-foreground">{formatPrice(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (10%)</span>
                    <span className="text-card-foreground">{formatPrice(grandTotal * 0.1)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-lg font-semibold text-card-foreground">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(grandTotal * 1.1)}</span>
                  </div>
                </div>

                {/* Payment Method Display */}
                <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground mb-2">Phương thức thanh toán</p>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-primary" />
                    <span className="font-medium text-card-foreground">Tiền mặt</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-info/50 bg-info/10 p-4">
              <p className="text-sm text-info-foreground text-center">
                💡 Vui lòng chờ nhân viên xác nhận thanh toán. Sau đó bạn có thể đánh giá món ăn!
              </p>
            </div>
          </>
        )}
      </main>

      <BottomNavigation onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

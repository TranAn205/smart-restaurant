"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Banknote, Building2, CheckCircle, Loader2, Receipt, QrCode, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/guest/bottom-navigation"
import { CartDrawer } from "@/components/guest/cart-drawer"
import { formatPrice } from "@/lib/menu-data"
import { paymentAPI, orderAPI } from "@/lib/api"
import io from "socket.io-client"
import { toast } from "sonner"

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

type PaymentMethod = "cash" | "vietqr" | "stripe"

const paymentMethods = [
  { id: "cash" as const, label: "Tiền mặt", icon: Banknote, description: "Nhân viên xác nhận" },
  { id: "vietqr" as const, label: "Chuyển khoản", icon: QrCode, description: "QR ngân hàng VN" },
  { id: "stripe" as const, label: "Thẻ quốc tế", icon: CreditCard, description: "Visa, Mastercard" },
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
  
  // VietQR state
  const [vietQRData, setVietQRData] = useState<{
    qrUrl: string;
    bankInfo: { bankId: string; accountNo: string; accountName: string; amount: number; description: string };
  } | null>(null)
  const [isConfirmingVietQR, setIsConfirmingVietQR] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [paidBillData, setPaidBillData] = useState<{ orderId: string; tableNumber: string } | null>(null)

  useEffect(() => {
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
        const response = await orderAPI.getTableOrders(tableId)
        const tableOrders = response.data || response
        const servedOrders = (tableOrders as any[]).filter((order: any) => order.status === "served")
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

    newSocket.on("order:paid", (data: { orderId: string; tableNumber?: string; message: string }) => {
      console.log("Payment confirmed:", data)
      toast.success("Thanh toán thành công!", {
        description: "Cảm ơn bạn đã sử dụng dịch vụ!",
      })
      // Show the paid bill view
      setIsPaid(true)
      setPaidBillData({
        orderId: data.orderId,
        tableNumber: data.tableNumber || "",
      })
    })

    return () => {
      newSocket.disconnect()
    }
  }, [tableId])

  const grandTotal = orders.reduce((sum, order) => sum + (order.total_amount - (order.discount_amount || 0)), 0)
  const tax = grandTotal * 0.1
  const finalTotal = grandTotal + tax

  // Handle Cash Payment (existing flow)
  const handleCashPayment = async () => {
    if (orders.length === 0) return

    setIsRequesting(true)
    setError("")

    try {
      const orderIds = orders.map(o => o.id)
      await paymentAPI.requestPayment(tableId!, orderIds)
      setShowBill(true)
      toast.info("Đã gửi yêu cầu. Vui lòng chờ nhân viên xác nhận.")
    } catch (err: any) {
      setError(err.message || "Không thể gửi yêu cầu thanh toán.")
    } finally {
      setIsRequesting(false)
    }
  }

  // Handle VietQR Payment
  const handleVietQRPayment = async () => {
    if (orders.length === 0) return

    setIsRequesting(true)
    setError("")

    try {
      // Use first order for VietQR (or combine if needed)
      const orderId = orders[0].id
      const result = await paymentAPI.generateVietQR(orderId)
      
      if (result.success) {
        setVietQRData({
          qrUrl: result.qrUrl,
          bankInfo: result.bankInfo,
        })
        setShowBill(true)
      }
    } catch (err: any) {
      setError(err.message || "Không thể tạo mã QR.")
    } finally {
      setIsRequesting(false)
    }
  }

  // Confirm VietQR payment - send to waiter for verification
  const handleConfirmVietQR = async () => {
    if (orders.length === 0 || !tableId) return

    setIsConfirmingVietQR(true)
    try {
      // Send notification to waiter via payment request API (same as cash)
      const orderIds = orders.map(o => o.id)
      await paymentAPI.requestPayment(tableId, orderIds)
      
      toast.info("Đã gửi yêu cầu xác nhận!", {
        description: "Nhân viên sẽ kiểm tra và xác nhận thanh toán.",
      })
      
      // Keep showing QR but change state to waiting
      setVietQRData(prev => prev ? { ...prev, waitingForConfirmation: true } as any : null)
    } catch (err: any) {
      setError(err.message || "Gửi yêu cầu thất bại.")
    } finally {
      setIsConfirmingVietQR(false)
    }
  }

  // Handle Stripe Payment
  const handleStripePayment = async () => {
    if (orders.length === 0) return

    setIsRequesting(true)
    setError("")

    try {
      const orderId = orders[0].id
      const result = await paymentAPI.createStripeSession(orderId)
      
      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url
      } else {
        throw new Error("Không thể tạo phiên thanh toán Stripe")
      }
    } catch (err: any) {
      setError(err.message || "Stripe chưa được cấu hình.")
      toast.error("Stripe chưa được cấu hình. Vui lòng chọn phương thức khác.")
    } finally {
      setIsRequesting(false)
    }
  }

  // Handle payment based on selected method
  const handlePayment = () => {
    switch (selectedMethod) {
      case "cash":
        handleCashPayment()
        break
      case "vietqr":
        handleVietQRPayment()
        break
      case "stripe":
        handleStripePayment()
        break
    }
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-50 border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-bold text-card-foreground">Thanh toán</h1>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isPaid ? (
          /* Payment Success - Show Bill */
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 overflow-hidden">
              <div className="bg-green-500 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-white">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Thanh toán thành công!</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-mono text-xl font-bold text-foreground">
                    #{paidBillData?.orderId?.slice(-6) || "------"}
                  </p>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (10%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-lg font-semibold">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Cảm ơn bạn đã sử dụng dịch vụ!<br />
                  Hóa đơn sẽ được in tại quầy.
                </p>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => router.push("/guest/review")}
            >
              ⭐ Đánh giá món ăn
            </Button>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push("/menu/guest")}
            >
              Về trang chủ
            </Button>
          </div>
        ) : isLoading ? (
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
            {/* Orders Summary */}
            <div className="mb-4 rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-semibold text-card-foreground">Đơn hàng ({orders.length})</h3>
              </div>
              <div className="divide-y divide-border max-h-48 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-medium">#{order.id.slice(-6)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.item_name}
                          </span>
                          <span className="text-muted-foreground">{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4 rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-card-foreground">Phương thức thanh toán</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedMethod === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`rounded-lg p-2 ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isSelected ? "text-primary" : "text-card-foreground"}`}>
                          {method.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Total and Payment Button */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="text-card-foreground">{formatPrice(grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">VAT (10%)</span>
                  <span className="text-card-foreground">{formatPrice(tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-lg font-semibold text-card-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handlePayment} 
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" />
                    {selectedMethod === "cash" && "Yêu cầu thanh toán"}
                    {selectedMethod === "vietqr" && "Tạo mã QR"}
                    {selectedMethod === "stripe" && "Thanh toán thẻ"}
                  </>
                )}
              </Button>
            </div>
          </>
        ) : selectedMethod === "vietqr" && vietQRData ? (
          /* VietQR Payment Display */
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-primary bg-card overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 text-center">
                <h3 className="font-semibold text-card-foreground">Chuyển khoản ngân hàng</h3>
                <p className="text-xs text-muted-foreground">Quét mã QR bằng app ngân hàng</p>
              </div>
              
              <div className="p-4 space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg shadow-inner">
                    <Image 
                      src={vietQRData.qrUrl} 
                      alt="VietQR Code" 
                      width={200} 
                      height={200}
                      className="rounded"
                    />
                  </div>
                </div>

                {/* Bank Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngân hàng:</span>
                    <span className="font-medium">{vietQRData.bankInfo.bankId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tài khoản:</span>
                    <span className="font-mono font-medium">{vietQRData.bankInfo.accountNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chủ tài khoản:</span>
                    <span className="font-medium">{vietQRData.bankInfo.accountName}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(vietQRData.bankInfo.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nội dung CK:</span>
                    <span className="font-mono font-medium text-primary">{vietQRData.bankInfo.description}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            {(vietQRData as any).waitingForConfirmation ? (
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <span className="font-medium">Chờ nhân viên xác nhận</span>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Nhân viên sẽ kiểm tra giao dịch và xác nhận cho bạn
                </p>
              </div>
            ) : (
              <>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={handleConfirmVietQR}
                  disabled={isConfirmingVietQR}
                >
                  {isConfirmingVietQR ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi yêu cầu...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Tôi đã chuyển khoản
                    </>
                  )}
                </Button>

                <div className="rounded-lg border border-info/50 bg-info/10 p-4">
                  <p className="text-sm text-info-foreground text-center">
                    💡 Sau khi chuyển khoản, bấm nút trên để nhân viên xác nhận
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Cash Payment - Waiting for waiter */
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
                  <span className="text-card-foreground">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-lg font-semibold text-card-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground mb-2">Phương thức thanh toán</p>
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  <span className="font-medium text-card-foreground">Tiền mặt</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation onCartClick={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

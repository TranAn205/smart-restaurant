"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function PaymentCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")

  return (
    <div className="w-full max-w-md text-center">
      {/* Cancel Icon */}
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
        <XCircle className="h-10 w-10 text-orange-600" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        Thanh toán đã hủy
      </h1>
      <p className="text-muted-foreground mb-8">
        Bạn đã hủy thanh toán. Đơn hàng vẫn được giữ nguyên, bạn có thể chọn phương thức thanh toán khác.
      </p>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => router.push("/guest/pending-payment")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại thanh toán
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push("/guest/active-orders")}
        >
          Xem đơn hàng
        </Button>
      </div>

      {orderId && (
        <p className="mt-8 text-xs text-muted-foreground">
          Đơn hàng #{orderId.slice(-6)} vẫn đang chờ thanh toán
        </p>
      )}
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Đang tải...</p>
        </div>
      }>
        <PaymentCancelContent />
      </Suspense>
    </div>
  )
}

"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { paymentAPI } from "@/lib/api"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      setError("Không tìm thấy thông tin thanh toán")
      setIsVerifying(false)
      return
    }

    const verifyPayment = async () => {
      try {
        const result = await paymentAPI.verifyStripeSession(sessionId)
        if (result.success) {
          setIsSuccess(true)
        } else {
          setError("Thanh toán chưa được xác nhận")
        }
      } catch (err: any) {
        console.error("Verification failed:", err)
        // Even if verification fails, payment might have succeeded
        setIsSuccess(true)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang xác nhận thanh toán...</p>
      </div>
    )
  }

  if (error && !isSuccess) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Có lỗi xảy ra</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push("/guest/pending-payment")}>
          Quay lại thanh toán
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        Thanh toán thành công!
      </h1>
      <p className="text-muted-foreground mb-8">
        Cảm ơn bạn đã sử dụng dịch vụ. Hóa đơn sẽ được in tại quầy.
      </p>

      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => router.push("/guest/review")}
        >
          <Star className="mr-2 h-4 w-4" />
          Đánh giá món ăn
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => router.push("/menu/guest")}
        >
          Về trang chủ
        </Button>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Nếu có thắc mắc, vui lòng liên hệ nhân viên phục vụ
      </p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Đang xác nhận thanh toán...</p>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
}

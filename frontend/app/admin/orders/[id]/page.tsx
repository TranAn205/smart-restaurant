"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChefHat,
  Printer,
  MapPin,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI } from "@/lib/api";

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  special_instructions?: string;
  status: string;
}

interface OrderDetail {
  id: string;
  table_id: string;
  table_number?: number;
  customer_name?: string;
  customer_email?: string;
  total_amount: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ xác nhận", color: "bg-warning text-warning-foreground", icon: Clock },
  accepted: { label: "Đã xác nhận", color: "bg-info text-info-foreground", icon: CheckCircle },
  preparing: { label: "Đang nấu", color: "bg-primary text-primary-foreground", icon: ChefHat },
  ready: { label: "Sẵn sàng", color: "bg-success text-success-foreground", icon: CheckCircle },
  served: { label: "Đã phục vụ", color: "bg-accent text-accent-foreground", icon: CheckCircle },
  paid: { label: "Đã thanh toán", color: "bg-muted text-muted-foreground", icon: CheckCircle },
  cancelled: { label: "Đã hủy", color: "bg-destructive text-destructive-foreground", icon: Clock },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await adminAPI.orders.getById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{error || "Đơn hàng không tồn tại"}</p>
            <Button onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const orderTime = new Date(order.created_at);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Đơn hàng #{order.id.toString().slice(-6).padStart(6, "0")}
              </h1>
              <p className="text-muted-foreground">
                {orderTime.toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={config.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              In hóa đơn
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết món ({order.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {!order.items || order.items.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">
                    Không có món nào trong đơn hàng
                  </p>
                ) : (
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-start justify-between rounded-lg border border-border p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.item_name}</span>
                            <Badge variant="outline">x{item.quantity}</Badge>
                          </div>
                          {item.special_instructions && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              📝 {item.special_instructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(parseFloat(item.subtotal))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(parseFloat(item.unit_price))} / món
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">
                      {formatPrice(parseFloat(order.total_amount))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bàn</p>
                    <p className="font-medium">
                      Bàn {order.table_number || order.table_id}
                    </p>
                  </div>
                </div>

                {order.customer_name && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Khách hàng</p>
                      <p className="font-medium">{order.customer_name}</p>
                      {order.customer_email && (
                        <p className="text-xs text-muted-foreground">
                          {order.customer_email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian đặt</p>
                    <p className="font-medium">
                      {orderTime.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {orderTime.toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

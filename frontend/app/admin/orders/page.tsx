"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Eye,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI } from "@/lib/api";

interface Order {
  id: string;
  table_id: string;
  table_number?: number;
  customer_name?: string;
  total_amount: string;
  status: string;
  created_at: string;
  items?: Array<{ item_name: string; quantity: number }>;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  accepted: {
    label: "Đã xác nhận",
    color: "bg-info text-info-foreground",
    icon: CheckCircle,
  },
  preparing: {
    label: "Đang nấu",
    color: "bg-primary text-primary-foreground",
    icon: ChefHat,
  },
  ready: {
    label: "Sẵn sàng",
    color: "bg-success text-success-foreground",
    icon: CheckCircle,
  },
  served: {
    label: "Đã phục vụ",
    color: "bg-accent text-accent-foreground",
    icon: CheckCircle,
  },
  paid: {
    label: "Đã thanh toán",
    color: "bg-muted text-muted-foreground",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-destructive text-destructive-foreground",
    icon: Clock,
  },
};

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "accepted", label: "Đã xác nhận" },
  { value: "preparing", label: "Đang nấu" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "served", label: "Đã phục vụ" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const data = await adminAPI.orders.getAll(status);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Quản lý đơn hàng
            </h1>
            <p className="text-muted-foreground">
              Xem và quản lý tất cả đơn hàng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Danh sách đơn hàng ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">Không có đơn hàng nào</p>
                <p className="text-sm">
                  {statusFilter !== "all"
                    ? "Thử chọn trạng thái khác"
                    : "Các đơn hàng sẽ xuất hiện ở đây"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">
                        Mã đơn
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Bàn
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Món
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Tổng tiền
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Trạng thái
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Thời gian
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => {
                      const config =
                        statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      const orderTime = new Date(order.created_at);

                      return (
                        <tr key={order.id} className="hover:bg-muted/50">
                          <td className="py-4">
                            <span className="font-mono font-medium">
                              #{order.id.toString().slice(-6).padStart(6, "0")}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge variant="outline">
                              Bàn {order.table_number || order.table_id}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <span className="text-muted-foreground">
                              {order.items?.length || 0} món
                            </span>
                          </td>
                          <td className="py-4 font-medium">
                            {formatPrice(parseFloat(order.total_amount))}
                          </td>
                          <td className="py-4">
                            <Badge className={config.color}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {orderTime.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            <span className="ml-1 text-xs">
                              {orderTime.toLocaleDateString("vi-VN")}
                            </span>
                          </td>
                          <td className="py-4">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

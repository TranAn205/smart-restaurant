"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  Sparkles,
  X,
  LogOut,
  Filter,
  Volume2,
  VolumeX,
  CreditCard,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/menu-data";
import { waiterAPI, paymentAPI } from "@/lib/api";

// Sử dụng biến môi trường chuẩn Next.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.3:4000/api";
const API_BASE = API_URL.replace("/api", "");
import { BillPrintDialog } from "@/components/waiter/BillPrintDialog";
import io from "socket.io-client";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price_per_unit: string;
  total_price: string;
  status?: "pending" | "preparing" | "ready" | "served" | "paid";
}

interface WaiterOrder {
  id: string;
  table_id: string;
  table_number: string;
  customer_name?: string;
  total_amount: string;
  discount_amount?: string;
  status: "pending" | "accepted" | "preparing" | "ready" | "served" | "paid";
  created_at: string;
  notes?: string;
  items: OrderItem[];
}

interface ReadyItem {
  item_id: string;
  item_name: string;
  quantity: number;
  table_number: string;
  order_id: string;
  notes?: string;
}

interface PaymentRequest {
  tableId: string;
  tableNumber: string;
  orderIds: string[];
  orders: any[];
  items: any[];
  total: number;
  requestedAt: Date;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-info text-info-foreground",
    icon: CheckCircle,
  },
  preparing: {
    label: "Preparing",
    color: "bg-primary text-primary-foreground",
    icon: ChefHat,
  },
  ready: {
    label: "Ready",
    color: "bg-success text-success-foreground",
    icon: Bell,
  },
  served: {
    label: "Served",
    color: "bg-accent text-accent-foreground",
    icon: Sparkles,
  },
  paid: {
    label: "Paid",
    color: "bg-muted text-muted-foreground",
    icon: CheckCircle,
  },
};

export default function WaiterOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [readyItems, setReadyItems] = useState<ReadyItem[]>([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTable, setFilterTable] = useState<string>("all");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [rejectingOrder, setRejectingOrder] = useState<WaiterOrder | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [waiterName, setWaiterName] = useState("Waiter");
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [billPrintDialog, setBillPrintDialog] = useState<{
    open: boolean;
    orderId: string;
    tableNumber: string;
  } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("waiterToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/waiter/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sound notification for ready items
  const playNotificationSound = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Audio not available");
    }
  }, [isSoundEnabled]);

  const prevReadyCountRef = useRef(0);

  const fetchReadyItems = useCallback(async () => {
    try {
      const token = localStorage.getItem("waiterToken");
      if (!token) return;

      const items = await waiterAPI.getReadyItems();
      
      // Play sound if new items arrived
      if (items.length > prevReadyCountRef.current && prevReadyCountRef.current > 0) {
        playNotificationSound();
      }
      prevReadyCountRef.current = items.length;
      
      setReadyItems(items);
    } catch (error) {
      console.error("Error fetching ready items:", error);
    }
  }, [playNotificationSound]);

  const handleServeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem("waiterToken");
      if (!token) return;

      await waiterAPI.serveItem(itemId);
      fetchReadyItems(); // Refresh ready items
    } catch (error: any) {
      console.error("Error serving item:", error);
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("waiterToken");
    const name = localStorage.getItem("waiterName");

    if (!token) {
      router.push("/waiter/login");
      return;
    }

    if (name) setWaiterName(name);
    fetchOrders();
    fetchReadyItems();

    // Socket connection
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Waiter connected to socket");
      newSocket.emit("join:role", "waiter");
    });

    // Listen for payment requests from pending-payment page
    newSocket.on("payment:requested", (data: PaymentRequest) => {
      console.log("Payment requested (from pending-payment):", data);
      setPaymentRequests(prev => [...prev, data]);
      
      // Play notification sound if enabled
      if (isSoundEnabled) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(e => console.log("Could not play sound:", e));
      }
    });

    // Listen for bill requests from order detail page
    newSocket.on("bill:requested", (data: any) => {
      console.log("Bill requested (from order detail):", data);
      // Convert bill request to payment request format
      const paymentRequest: PaymentRequest = {
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        orderIds: [data.orderId],
        orders: [],
        items: [],
        total: parseFloat(data.total) || 0,
        requestedAt: new Date(data.requestedAt || Date.now()),
      };
      setPaymentRequests(prev => [...prev, paymentRequest]);
      
      // Play notification sound if enabled
      if (isSoundEnabled) {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(e => console.log("Could not play sound:", e));
      }
    });

    // Listen for payment confirmations
    newSocket.on("order:paid", () => {
      fetchOrders(); // Refresh orders
    });

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchOrders();
      fetchReadyItems();
    }, 5000);

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [fetchOrders, fetchReadyItems, router, isSoundEnabled]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesTable =
      filterTable === "all" || order.table_number === filterTable;
    return matchesStatus && matchesTable;
  });

  const uniqueTables = [...new Set(orders.map((o) => o.table_number))].sort();

  const updateOrderStatus = async (
    orderId: string,
    action: "accept" | "reject" | "served"
  ) => {
    try {
      const token = localStorage.getItem("waiterToken");
      const response = await fetch(
        `${API_URL}/waiter/orders/${orderId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body:
            action === "reject"
              ? JSON.stringify({ reason: rejectReason })
              : undefined,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update order");
      }

      fetchOrders();
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, "accept");
  };

  const handleServeOrder = (orderId: string) => {
    updateOrderStatus(orderId, "served");
  };

  const handleMarkAsPaid = async (orderId: string, tableNumber: string) => {
    // Open dialog instead of direct payment
    setBillPrintDialog({ open: true, orderId, tableNumber });
  };

  const confirmPayment = async () => {
    if (!billPrintDialog) return;
    
    try {
      await paymentAPI.processPayment(billPrintDialog.orderId, "cash");
      
      setPaymentRequests(prev =>
        prev.filter(req => !req.orderIds.includes(billPrintDialog.orderId))
      );
      
      fetchOrders();
      toast.success("Thanh toán thành công!");
    } catch (error: any) {
      console.error("Error marking as paid:", error);
      toast.error(error.message || "Có lỗi xảy ra");
      throw error;
    }
  };

  const handleConfirmPaymentRequest = async (request: PaymentRequest) => {
    // Open dialog with first order ID for bill printing
    setBillPrintDialog({ 
      open: true, 
      orderId: request.orderIds[0], 
      tableNumber: request.tableNumber 
    });
    
    // Store all order IDs for batch payment
    const confirmBatchPayment = async () => {
      try {
        for (const orderId of request.orderIds) {
          await paymentAPI.processPayment(orderId, "cash");
        }
        
        setPaymentRequests(prev => 
          prev.filter(req => req.tableId !== request.tableId)
        );
        
        fetchOrders();
        toast.success("Xác nhận thanh toán thành công!", {
          description: `Đã xác nhận thanh toán cho bàn ${request.tableNumber}`,
          duration: 3000,
        });
      } catch (error: any) {
        console.error("Error confirming payment:", error);
        toast.error("Xác nhận thanh toán thất bại", {
          description: error.message || "Có lỗi xảy ra",
        });
        throw error;
      }
    };
    
    // Override confirmPayment temporarily for this request
    (window as any)._tempConfirmFn = confirmBatchPayment;
  };

  const handleDismissPaymentRequest = (tableId: string) => {
    setPaymentRequests(prev => 
      prev.filter(req => req.tableId !== tableId)
    );
  };

  const handleRejectOrder = () => {
    if (!rejectingOrder || !rejectReason) return;
    updateOrderStatus(rejectingOrder.id, "reject");
    setRejectingOrder(null);
    setRejectReason("");
  };

  const handleLogout = () => {
    localStorage.removeItem("waiterToken");
    localStorage.removeItem("waiterName");
    router.push("/waiter/login");
  };
  
  const readyOrdersCount = readyItems.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {waiterName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {readyOrdersCount > 0 && (
              <Badge className="bg-success text-success-foreground">
                <Bell className="mr-1 h-3 w-3" />
                {readyOrdersCount} ready
              </Badge>
            )}
            {paymentRequests.length > 0 && (
              <Badge className="bg-orange-500 text-white">
                <Receipt className="mr-1 h-3 w-3" />
                {paymentRequests.length} thanh toán
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

      {/* Filters */}
      <div className="flex gap-2 border-t border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTable} onValueChange={setFilterTable}>
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            {uniqueTables.map((table) => (
              <SelectItem key={table} value={table}>
                Table {table}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>

    {/* Payment Requests Alert */}
    {paymentRequests.length > 0 && (
      <div className="border-b border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-orange-900">
          <Receipt className="h-5 w-5" />
          Yêu cầu thanh toán ({paymentRequests.length})
        </h3>
        <div className="space-y-3">
          {paymentRequests.map((request, index) => (
            <Card key={index} className="border-orange-300 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Table Info Header */}
                  <div className="flex items-center gap-3 pb-2 border-b border-orange-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm flex-shrink-0">
                      <span className="text-lg font-bold text-white">{request.tableNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-orange-900 truncate">Bàn {request.tableNumber}</p>
                      <p className="text-xs text-orange-600">
                        {request.orderIds.length} đơn hàng
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {request.items.slice(0, 3).map((item: any, idx: number) => (
                      <p key={idx} className="text-sm text-muted-foreground truncate">
                        • {item.quantity}x {item.name}
                      </p>
                    ))}
                    {request.items.length > 3 && (
                      <p className="text-xs text-orange-600 font-medium">
                        +{request.items.length - 3} món khác...
                      </p>
                    )}
                  </div>

                  {/* Total and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-orange-100">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-xs text-orange-600 mb-1">Tổng cộng:</p>
                      <p className="text-xl font-bold text-orange-700 truncate">
                        {formatPrice(request.total * 1.1)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                        onClick={() => handleConfirmPaymentRequest(request)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Xác nhận
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 hover:bg-orange-50 whitespace-nowrap"
                        onClick={() => handleDismissPaymentRequest(request.tableId)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Bỏ qua
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )}

    {/* Main Content with Tabs */}
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-card sticky top-[57px] z-40">
        <TabsTrigger 
          value="orders" 
          className="relative rounded-none border-b-2 border-transparent px-6 py-3 font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          <Clock className="mr-2 h-4 w-4" />
          Đơn hàng
        </TabsTrigger>
        <TabsTrigger 
          value="ready" 
          className="relative rounded-none border-b-2 border-transparent px-6 py-3 font-semibold text-muted-foreground transition-all data-[state=active]:border-success data-[state=active]:text-success data-[state=active]:shadow-sm"
        >
          <Bell className="mr-2 h-4 w-4" />
          Món sẵn sàng 
          {readyItems.length > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success text-xs font-bold text-white">
              {readyItems.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Orders Tab */}
      <TabsContent value="orders" className="p-4">
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground animate-spin" />
            <h2 className="text-xl font-bold text-foreground">Đang tải...</h2>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">
              Không có đơn hàng
            </h2>
            <p className="text-muted-foreground">
              Đơn hàng sẽ hiển thị ở đây khi khách đặt
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              const isReady = order.status === "ready";

              return (
                <Card
                  key={order.id}
                  className={`overflow-hidden transition-all ${
                    isReady ? "ring-2 ring-success" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Order Header */}
                    <div
                      className={`flex items-center justify-between p-3 ${
                        isReady ? "bg-success/10" : "border-b border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <span className="font-bold text-muted-foreground">
                            {order.table_number}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono font-bold text-card-foreground">
                            #{order.id.slice(-6)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge className={config.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      {order.customer_name && order.customer_name !== "Guest" && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          Khách: {order.customer_name}
                        </p>
                      )}
                      {!order.customer_name || order.customer_name === "Guest" && (
                        <p className="mb-2 text-sm text-muted-foreground italic">
                          Khách vãng lai
                        </p>
                      )}
                      <div className="mb-3 space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm gap-2"
                          >
                            <span className="text-card-foreground">
                              {item.quantity}x {item.item_name}
                            </span>
                            <span className="text-muted-foreground">
                              {formatPrice(parseFloat(item.total_price))}
                            </span>
                            {item.status === "pending" && (
                              <Button
                                size="sm"
                                className="ml-2 bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                  try {
                                    await waiterAPI.acceptOrderItem(item.id);
                                    fetchOrders();
                                  } catch (err) {
                                    alert("Duyệt món thất bại");
                                  }
                                }}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Duyệt
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mb-3 rounded bg-warning/10 p-2">
                          <p className="text-xs text-warning">
                            Note: {order.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="font-bold text-primary">
                          {formatPrice(parseFloat(order.total_amount) - (parseFloat(order.discount_amount || '0')))}
                        </span>

                        {/* Actions based on status */}
                        <div className="flex gap-2">
                          {(() => {
                            const orderStatus = order.status as string;
                            const allItemsServed = order.items.every(item => item.status === "served");
                            const hasUnservedItems = order.items.some(item => item.status !== "served");
                            
                            // Pending orders - need waiter approval
                            if (orderStatus === "pending") {
                              return (
                                <>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                    onClick={() => handleAcceptOrder(order.id)}
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Duyệt
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setRejectingOrder(order)}
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Từ chối
                                  </Button>
                                </>
                              );
                            }
                            
                            if (orderStatus === "paid") {
                              return (
                                <Badge className="bg-muted text-muted-foreground">
                                  Completed
                                </Badge>
                              );
                            }
                            
                            if (allItemsServed && orderStatus !== "paid") {
                              return (
                                <>
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                                    Chờ thanh toán
                                  </Badge>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(order.id, order.table_number)}
                                  >
                                    <CreditCard className="mr-1 h-4 w-4" />
                                    Thanh toán
                                  </Button>
                                </>
                              );
                            }
                            
                            if (hasUnservedItems) {
                              return <Badge variant="outline">In Kitchen</Badge>;
                            }
                            
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* Ready Items Tab - Grouped by Table */}
      <TabsContent value="ready" className="p-4">
        {readyItems.length === 0 ? (
          <div className="py-24 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground">
              Chưa có món sẵn sàng
            </h2>
            <p className="text-muted-foreground">
              Các món đã nấu xong sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group items by table */}
            {Object.entries(
              readyItems.reduce((acc, item) => {
                const table = item.table_number;
                if (!acc[table]) acc[table] = [];
                acc[table].push(item);
                return acc;
              }, {} as Record<string, ReadyItem[]>)
            )
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([tableNumber, items]) => (
                <Card key={tableNumber} className="overflow-hidden border-2 border-success">
                  {/* Table Header */}
                  <div className="bg-success/10 px-4 py-3 border-b border-success/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success text-white font-bold text-lg">
                          {tableNumber}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">
                            Bàn {tableNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {items.length} món sẵn sàng
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-success text-white text-sm px-3 py-1">
                        <Bell className="mr-1.5 h-4 w-4" />
                        Ready
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {items.map((item) => (
                        <div
                          key={item.item_id}
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                {item.quantity}
                              </span>
                              <h4 className="font-semibold text-card-foreground">
                                {item.item_name}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Order #{item.order_id.slice(-6)}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-warning mt-1 flex items-center gap-1">
                                <span>📝</span> {item.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            className="bg-success hover:bg-success/90 shadow-lg"
                            onClick={() => handleServeItem(item.item_id)}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Đã phục vụ
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </TabsContent>
    </Tabs>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectingOrder}
        onOpenChange={() => setRejectingOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject Order #{rejectingOrder?.id.slice(-6)}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-muted-foreground">
              Please provide a reason for rejecting this order. The customer
              will be notified.
            </p>
            <Textarea
              placeholder="e.g., Table not ready, Customer left..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOrder}
              disabled={!rejectReason}
            >
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Print Dialog */}
      {billPrintDialog && (
        <BillPrintDialog
          open={billPrintDialog.open}
          onOpenChange={(open) =>
            setBillPrintDialog(open ? billPrintDialog : null)
          }
          orderId={billPrintDialog.orderId}
          tableNumber={billPrintDialog.tableNumber}
          onConfirm={
            (window as any)._tempConfirmFn || confirmPayment
          }
        />
      )}
    </div>
  );
}

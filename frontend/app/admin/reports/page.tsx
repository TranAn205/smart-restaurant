"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { formatPrice } from "@/lib/menu-data";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyReport {
  date: string;
  total_orders: string;
  revenue: string;
}

interface TopItem {
  name: string;
  total_sold: string;
  revenue: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  // Reports data
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Fetch summary and top items
      const [summaryData, topItemsData, dailyData] = await Promise.all([
        adminAPI.reports.getSummary(),
        adminAPI.reports.getTopItems(),
        adminAPI.reports.getDailyReport(
          startDate || undefined,
          endDate || undefined
        ),
      ]);

      // Calculate totals from daily reports
      let revenue = 0;
      let orders = 0;

      if (dailyData && dailyData.length > 0) {
        dailyData.forEach((day: DailyReport) => {
          revenue += parseFloat(day.revenue) || 0;
          orders += parseInt(day.total_orders) || 0;
        });
      } else {
        // Use today's data if no daily reports
        revenue = parseFloat(summaryData.today.revenue_today) || 0;
        orders = parseInt(summaryData.today.orders_today) || 0;
      }

      setTotalRevenue(revenue);
      setTotalOrders(orders);
      setAvgOrderValue(orders > 0 ? revenue / orders : 0);

      setDailyReports(dailyData || []);
      setTopItems(topItemsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [startDate, endDate]);

  // Export to PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Helper to remove Vietnamese diacritics for PDF compatibility
      const removeVietnamese = (str: string) => {
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");
      };

      // PDF-safe price formatter (no Unicode ₫ symbol)
      const pdfPrice = (value: number) => {
        return new Intl.NumberFormat("en-US").format(value) + " VND";
      };
      
      // Title
      doc.setFontSize(18);
      doc.text("Bao cao Doanh thu", 14, 22);
      doc.setFontSize(11);
      doc.text(`Tu: ${startDate} - Den: ${endDate}`, 14, 30);
      
      // Summary
      doc.setFontSize(12);
      doc.text(`Tong doanh thu: ${pdfPrice(totalRevenue)}`, 14, 42);
      doc.text(`Tong don hang: ${totalOrders}`, 14, 50);
      doc.text(`Gia tri trung binh: ${pdfPrice(avgOrderValue)}`, 14, 58);
      
      // Daily Revenue Table
      if (dailyReports.length > 0) {
        doc.setFontSize(14);
        doc.text("Doanh thu theo ngay", 14, 72);
        
        autoTable(doc, {
          startY: 76,
          head: [["Ngay", "So don", "Doanh thu"]],
          body: dailyReports.map((day) => [
            day.date.split("T")[0], // Simple date format YYYY-MM-DD
            day.total_orders,
            pdfPrice(parseFloat(day.revenue)),
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [249, 115, 22] },
        });
      }
      
      // Top Items Table
      if (topItems.length > 0) {
        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(14);
        doc.text("Mon ban chay", 14, finalY + 15);
        
        autoTable(doc, {
          startY: finalY + 19,
          head: [["#", "Ten mon", "So luong", "Doanh thu"]],
          body: topItems.map((item, idx) => [
            idx + 1,
            removeVietnamese(item.name),
            item.total_sold,
            pdfPrice(parseFloat(item.revenue)),
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [249, 115, 22] },
        });
      }
      
      doc.save(`bao-cao-${startDate}-${endDate}.pdf`);
      toast({ title: "Thanh cong", description: "Da xuat file PDF" });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({ title: "Loi", description: "Khong the xuat PDF", variant: "destructive" });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Summary sheet
      const summaryData = [
        ["BÁO CÁO DOANH THU"],
        [`Từ: ${startDate}`, `Đến: ${endDate}`],
        [],
        ["Tổng doanh thu", totalRevenue],
        ["Tổng đơn hàng", totalOrders],
        ["Giá trị trung bình", avgOrderValue],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");
      
      // Daily Revenue sheet
      if (dailyReports.length > 0) {
        const dailyData = [
          ["Ngày", "Số đơn hàng", "Doanh thu"],
          ...dailyReports.map((day) => [
            new Date(day.date).toLocaleDateString("vi-VN"),
            parseInt(day.total_orders),
            parseFloat(day.revenue),
          ]),
        ];
        const wsDaily = XLSX.utils.aoa_to_sheet(dailyData);
        XLSX.utils.book_append_sheet(wb, wsDaily, "Doanh thu theo ngày");
      }
      
      // Top Items sheet
      if (topItems.length > 0) {
        const topData = [
          ["STT", "Tên món", "Số lượng bán", "Doanh thu"],
          ...topItems.map((item, idx) => [
            idx + 1,
            item.name,
            parseInt(item.total_sold),
            parseFloat(item.revenue),
          ]),
        ];
        const wsTop = XLSX.utils.aoa_to_sheet(topData);
        XLSX.utils.book_append_sheet(wb, wsTop, "Món bán chạy");
      }
      
      XLSX.writeFile(wb, `bao-cao-${startDate}-${endDate}.xlsx`);
      toast({ title: "Thành công", description: "Đã xuất file Excel" });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({ title: "Lỗi", description: "Không thể xuất Excel", variant: "destructive" });
    }
  };



  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              View and export business analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={loading}>
              <FileText className="mr-2 h-4 w-4" />
              Xuất PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={loading}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-9"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    className="pl-9"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={fetchReports} disabled={loading}>
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {formatPrice(totalRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {totalOrders.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                      <TrendingUp className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-card-foreground">
                        {formatPrice(avgOrderValue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : topItems.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No data available
                </p>
              ) : (
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.total_sold} sold
                        </p>
                      </div>
                      <span className="font-medium text-card-foreground">
                        {formatPrice(parseFloat(item.revenue))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ Doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : dailyReports.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Không có dữ liệu trong khoảng thời gian này
                </p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyReports.slice(0, 14).map((day) => ({
                        date: new Date(day.date).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                        }),
                        revenue: parseFloat(day.revenue) || 0,
                        orders: parseInt(day.total_orders) || 0,
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        stroke="#4B5563"
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        stroke="#4B5563"
                        tickFormatter={(value) =>
                          value >= 1000000
                            ? `${(value / 1000000).toFixed(1)}M`
                            : value >= 1000
                            ? `${(value / 1000).toFixed(0)}K`
                            : value
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                        stroke="#4B5563"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#F9FAFB" }}
                        formatter={(value, name) => [
                          name === "revenue"
                            ? formatPrice(Number(value))
                            : `${value} đơn`,
                          name === "revenue" ? "Doanh thu" : "Số đơn",
                        ]}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Doanh thu"
                        stroke="#F97316"
                        strokeWidth={3}
                        dot={{ fill: "#F97316", strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        name="Số đơn"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

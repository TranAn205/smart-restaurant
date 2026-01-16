"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Users,
  Plus,
  Edit,
  UserCheck,
  UserX,
  ChefHat,
  ConciergeBell,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status?: string;
  created_at: string;
}

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "waiter",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/users/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenDialog = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        full_name: staff.full_name,
        email: staff.email,
        password: "",
        role: staff.role,
      });
    } else {
      setEditingStaff(null);
      setFormData({ full_name: "", email: "", password: "", role: "waiter" });
    }
    setError("");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.email) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!editingStaff && !formData.password) {
      setError("Mật khẩu là bắt buộc khi tạo mới");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      
      if (editingStaff) {
        // Update existing staff
        const response = await fetch(`${API_BASE_URL}/admin/users/${editingStaff.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            role: formData.role,
          }),
        });
        if (!response.ok) throw new Error("Update failed");
      } else {
        // Create new staff
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Create failed");
        }
      }

      setIsDialogOpen(false);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    try {
      const token = localStorage.getItem("admin_token");
      const newStatus = staff.status === "active" ? "inactive" : "active";
      
      const response = await fetch(`${API_BASE_URL}/users/${staff.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      fetchStaff();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "kitchen":
        return <ChefHat className="h-4 w-4" />;
      case "waiter":
        return <ConciergeBell className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      waiter: "bg-blue-100 text-blue-800",
      kitchen: "bg-orange-100 text-orange-800",
      admin: "bg-purple-100 text-purple-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Quản lý nhân viên
            </h1>
            <p className="text-muted-foreground">
              Quản lý tài khoản Waiter và Kitchen
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        </div>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Danh sách nhân viên ({staffList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : staffList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">Chưa có nhân viên nào</p>
                <p className="text-sm">Nhấn "Thêm nhân viên" để tạo tài khoản mới</p>
              </div>
            ) : (
              <div className="space-y-3">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {getRoleIcon(staff.role)}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {staff.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {staff.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadge(staff.role)}>
                        {staff.role === "waiter" ? "Phục vụ" : staff.role === "kitchen" ? "Bếp" : staff.role}
                      </Badge>
                      <Badge
                        variant={staff.status === "active" ? "default" : "secondary"}
                        className={staff.status === "active" ? "bg-success" : ""}
                      >
                        {staff.status === "active" ? "Hoạt động" : "Tạm khóa"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(staff)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(staff)}
                      >
                        {staff.status === "active" ? (
                          <UserX className="h-4 w-4 text-destructive" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-success" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ tên *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="staff@restaurant.com"
                  disabled={!!editingStaff}
                />
              </div>
              {!editingStaff && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiter">Phục vụ (Waiter)</SelectItem>
                    <SelectItem value="kitchen">Bếp (Kitchen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : editingStaff ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

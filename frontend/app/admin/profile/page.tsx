"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import { authAPI } from "@/lib/api";

export default function AdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch(`${API_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      setProfile(data.user);
      setFullName(data.user.full_name || "");
      setEmail(data.user.email || "");
      setPhone(data.user.phone || "");
      setAvatarUrl(data.user.avatar || "");
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      if (error.message.includes("401") || error.message.includes("token")) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh tối đa 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_URL}/admin/profile/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setAvatarUrl(data.avatar_url);
      
      // Update localStorage to persist avatar
      const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      currentUser.avatar = data.avatar_url;
      localStorage.setItem("admin_user", JSON.stringify(currentUser));
      
      alert("Cập nhật avatar thành công!");
      
      // Reload page to refresh sidebar avatar
      window.location.reload();
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert("Lỗi upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_URL}/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const data = await response.json();
      
      // Update localStorage to persist name and phone
      localStorage.setItem("adminName", fullName);
      const currentUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      currentUser.full_name = fullName;
      currentUser.phone = phone;
      localStorage.setItem("admin_user", JSON.stringify(currentUser));

      alert("Cập nhật thông tin thành công!");
      
      // Reload page to refresh sidebar with new data
      window.location.reload();
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Lỗi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword(currentPassword, newPassword);
      alert("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Change password error:", error);
      alert(error.message || "Lỗi đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>

        {/* Avatar Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-muted relative">
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl.startsWith('http') ? avatarUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${avatarUrl}`}
                    alt="Avatar" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Nhấp vào biểu tượng camera để thay đổi ảnh đại diện
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG hoặc WEBP. Tối đa 5MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Đổi mật khẩu
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

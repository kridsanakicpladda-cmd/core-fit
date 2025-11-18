import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { UserManagementDialog } from "@/components/settings/UserManagementDialog";
import { useProfiles, Profile } from "@/hooks/useProfiles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const roleNames: Record<string, string> = {
  admin: "Admin - สามารถจัดการทุกอย่างในระบบ",
  hr_manager: "HR Manager - จัดการข้อมูล HR และรับสมัครงาน",
  recruiter: "Recruiter - จัดการการรับสมัครและคัดเลือกผู้สมัคร",
  interviewer: "Interviewer - ดำเนินการสัมภาษณ์และประเมินผู้สมัคร",
  viewer: "Viewer - ดูข้อมูลได้อย่างเดียว ไม่สามารถแก้ไขได้",
};

const roleDescriptions: Record<string, string[]> = {
  admin: [
    "✓ จัดการผู้ใช้และสิทธิ์ทั้งหมด",
    "✓ แก้ไขและลบข้อมูลทั้งหมด",
    "✓ เข้าถึงการตั้งค่าระบบ",
    "✓ ดูรายงานทั้งหมด"
  ],
  hr_manager: [
    "✓ จัดการตำแหน่งงานและผู้สมัคร",
    "✓ อนุมัติและปฏิเสธผู้สมัคร",
    "✓ ดูรายงาน HR",
    "✗ ไม่สามารถจัดการผู้ใช้"
  ],
  recruiter: [
    "✓ เพิ่มและแก้ไขผู้สมัคร",
    "✓ กำหนดการสัมภาษณ์",
    "✗ ไม่สามารถอนุมัติขั้นสุดท้าย"
  ],
  interviewer: [
    "✓ ดูข้อมูลผู้สมัคร",
    "✓ บันทึกผลการสัมภาษณ์",
    "✗ ไม่สามารถแก้ไขข้อมูลผู้สมัคร"
  ],
  viewer: [
    "✓ ดูข้อมูลทั้งหมด",
    "✗ ไม่สามารถแก้ไขหรือเพิ่มข้อมูล"
  ]
};

export default function Settings() {
  const { profiles, isLoading, deleteProfile, updateProfile } = useProfiles();
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSaveUser = (userData: any) => {
    if (userData.id) {
      updateProfile({
        userId: userData.id,
        name: userData.name,
        department: userData.department,
        roles: [userData.role], // Convert single role to array
      });
    }
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
  };

  const handleDeleteConfirm = () => {
    if (deleteUserId) {
      deleteProfile(deleteUserId);
      setDeleteUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการการตั้งค่าระบบและบัญชี</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลบริษัท</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">ชื่อบริษัท</Label>
              <Input id="company" placeholder="บริษัท ABC จำกัด" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" placeholder="hr@company.com" />
            </div>
            <Button>บันทึกการเปลี่ยนแปลง</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การเชื่อมต่อ Microsoft 365</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              เชื่อมต่อกับ Microsoft 365 เพื่อซิงค์อีเมลและปฏิทิน
            </p>
            <Button variant="outline">เชื่อมต่อ Microsoft 365</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Fit Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ปรับน้ำหนักการคำนวณคะแนน AI Fit Score
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">ทักษะ</span>
                <span className="text-sm font-medium">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">ประสบการณ์</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">โครงการ</span>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
            <Button variant="outline">ปรับแต่งน้ำหนัก</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>User Management</CardTitle>
            <Button onClick={handleAddUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>แผนก</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="mr-1">
                            {roleNames[role]?.split(" - ")[0] || role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <UserManagementDialog
        user={editingUser}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveUser}
      />
    </div>
  );
}

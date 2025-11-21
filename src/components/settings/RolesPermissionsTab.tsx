import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionMatrix } from "./PermissionMatrix";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { Shield, Lock } from "lucide-react";

const ROLES = [
  { key: "admin", label: "Admin", description: "จัดการทุกอย่างในระบบ", isSystem: true },
  { key: "ceo", label: "CEO", description: "อนุมัติและตัดสินใจระดับสูง", isSystem: false },
  { key: "manager", label: "Manager", description: "จัดการตามสิทธิ์ที่กำหนด", isSystem: false },
  { key: "hr_manager", label: "HR Manager", description: "จัดการ HR และรับสมัครงาน", isSystem: false },
  { key: "recruiter", label: "Recruiter", description: "จัดการการรับสมัครและคัดเลือก", isSystem: false },
  { key: "interviewer", label: "Interviewer", description: "สัมภาษณ์และประเมินผู้สมัคร", isSystem: false },
  { key: "candidate", label: "Candidate", description: "ผู้สมัครงาน เข้าถึงข้อมูลส่วนตัวและใบสมัคร", isSystem: false },
  { key: "viewer", label: "Viewer", description: "ดูข้อมูลเท่านั้น", isSystem: false },
];

export function RolesPermissionsTab() {
  const [selectedRole, setSelectedRole] = useState<string>("manager");
  const { permissions, updatePermissions } = useRolePermissions(selectedRole);

  const handleSavePermissions = (
    newPermissions: { resource: string; action: string; allowed: boolean }[]
  ) => {
    updatePermissions({ role: selectedRole, permissions: newPermissions });
  };

  const selectedRoleInfo = ROLES.find((r) => r.key === selectedRole);
  const isSystemRole = selectedRoleInfo?.isSystem || false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Roles & Permissions</h2>
        <p className="text-muted-foreground">
          จัดการบทบาทและสิทธิ์การเข้าถึงของผู้ใช้
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <Card
            key={role.key}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === role.key ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedRole(role.key)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle className="text-lg">{role.label}</CardTitle>
                </div>
                {role.isSystem && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    System
                  </Badge>
                )}
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedRoleInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Permissions: {selectedRoleInfo.label}</CardTitle>
            <CardDescription>
              {isSystemRole
                ? "บทบาทนี้เป็นระบบ ไม่สามารถแก้ไข permissions ได้"
                : "กำหนดสิทธิ์การเข้าถึงสำหรับบทบาทนี้"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSystemRole ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Admin มีสิทธิ์เข้าถึงทุกอย่างในระบบ</p>
                <p className="text-sm">ไม่สามารถแก้ไขได้</p>
              </div>
            ) : (
              <PermissionMatrix
                role={selectedRole}
                initialPermissions={permissions}
                onSave={handleSavePermissions}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

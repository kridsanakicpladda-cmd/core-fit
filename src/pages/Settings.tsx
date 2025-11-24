import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/components/settings/UsersTab";
import { RolesPermissionsTab } from "@/components/settings/RolesPermissionsTab";
import { GeneralTab } from "@/components/settings/GeneralTab";

export default function Settings() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการการตั้งค่าระบบและบัญชี</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="permissions">
          <RolesPermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/components/settings/UsersTab";
import { RolesPermissionsTab } from "@/components/settings/RolesPermissionsTab";
import { GeneralTab } from "@/components/settings/GeneralTab";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { user } = useAuth();

  const { data: userRoles = [] } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map(r => r.role);
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRoles.includes("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการการตั้งค่าระบบและบัญชี</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralTab />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="permissions">
              <RolesPermissionsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

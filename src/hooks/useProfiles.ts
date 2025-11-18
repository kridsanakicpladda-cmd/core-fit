import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  name: string;
  department: string | null;
  email: string;
  roles: string[];
  status: "active" | "inactive";
}

export function useProfiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each profile
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const profilesWithRoles: Profile[] = profilesData.map((profile) => ({
        id: profile.id,
        name: profile.name,
        department: profile.department,
        email: profile.email,
        roles: rolesData
          .filter((role) => role.user_id === profile.id)
          .map((role) => role.role),
        status: "active" as const, // We'll determine this based on roles or a separate field
      }));

      return profilesWithRoles;
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete from profiles (cascade will handle user_roles)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "ลบผู้ใช้แล้ว",
        description: "ลบผู้ใช้เรียบร้อยแล้ว",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถลบผู้ใช้ได้: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({
      userId,
      name,
      department,
      roles,
    }: {
      userId: string;
      name: string;
      department: string;
      roles: string[];
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name, department })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Delete existing roles
      const { error: deleteRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteRolesError) throw deleteRolesError;

      // Insert new roles
      const rolesToInsert = roles.map((role) => ({
        user_id: userId,
        role: role as "admin" | "hr_manager" | "recruiter" | "interviewer" | "viewer",
      }));

      const { error: insertRolesError } = await supabase
        .from("user_roles")
        .insert(rolesToInsert);

      if (insertRolesError) throw insertRolesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "บันทึกข้อมูลแล้ว",
        description: "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถบันทึกข้อมูลได้: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    profiles,
    isLoading,
    deleteProfile: deleteProfileMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
  };
}

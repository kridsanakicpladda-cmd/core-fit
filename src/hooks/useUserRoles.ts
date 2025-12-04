import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRoles() {
  const { user } = useAuth();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
    enabled: !!user?.id,
  });

  const isManager = roles.includes("manager");
  const isAdmin = roles.includes("admin");
  const isHRManager = roles.includes("hr_manager");
  const isRecruiter = roles.includes("recruiter");
  const isCEO = roles.includes("ceo");

  return {
    roles,
    isLoading,
    isManager,
    isAdmin,
    isHRManager,
    isRecruiter,
    isCEO,
  };
}

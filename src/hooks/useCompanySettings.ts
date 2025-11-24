import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CompanySettings {
  id: string;
  company_name: string | null;
  company_email: string | null;
  microsoft_365_connected: boolean;
  microsoft_365_token: string | null;
  ai_fit_score_weights: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    other: number;
  };
}

export function useCompanySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        ...data,
        ai_fit_score_weights: data.ai_fit_score_weights as any,
      } as CompanySettings;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CompanySettings>) => {
      if (!settings?.id) {
        // Insert if no settings exist
        const { data, error } = await supabase
          .from("company_settings")
          .insert(updates)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from("company_settings")
          .update(updates)
          .eq("id", settings.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `ไม่สามารถบันทึกการตั้งค่าได้: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
}

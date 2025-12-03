import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DBCandidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  resume_url: string | null;
  ai_fit_score: number | null;
  source: string;
  created_at: string | null;
  updated_at: string | null;
}

export const useCandidatesDB = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading, error } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching candidates:", error);
        throw error;
      }

      return data as DBCandidate[];
    },
  });

  const updateCandidate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DBCandidate> }) => {
      const { data, error } = await supabase
        .from("candidates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      console.error("Error updating candidate:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  const deleteCandidate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast({
        title: "ลบสำเร็จ",
        description: "ลบข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      console.error("Error deleting candidate:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    },
  });

  return {
    candidates,
    isLoading,
    error,
    updateCandidate: updateCandidate.mutate,
    deleteCandidate: deleteCandidate.mutate,
  };
};

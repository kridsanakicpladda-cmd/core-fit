import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type JobPosition = Tables<"job_positions">;
export type JobPositionInsert = TablesInsert<"job_positions">;
export type JobPositionUpdate = TablesUpdate<"job_positions">;

export const useJobPositions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["job_positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_positions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobPosition[];
    },
  });

  const createPosition = useMutation({
    mutationFn: async (newPosition: JobPositionInsert) => {
      const { data, error } = await supabase
        .from("job_positions")
        .insert([newPosition])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_positions"] });
      toast({ title: "สร้างตำแหน่งงานสำเร็จ" });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePosition = useMutation({
    mutationFn: async ({ id, ...updates }: JobPositionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("job_positions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_positions"] });
      toast({ title: "อัปเดตตำแหน่งงานสำเร็จ" });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePosition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_positions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job_positions"] });
      toast({ 
        title: "ลบตำแหน่งงานสำเร็จ",
        variant: "destructive" 
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    positions,
    isLoading,
    createPosition,
    updatePosition,
    deletePosition,
  };
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHiredCountByPosition() {
  return useQuery({
    queryKey: ["hired-count-by-position"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("position_id")
        .eq("stage", "Hired");

      if (error) throw error;

      const countMap: Record<string, number> = {};
      (data || []).forEach((app) => {
        countMap[app.position_id] = (countMap[app.position_id] || 0) + 1;
      });

      return countMap;
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HiredCandidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  hired_at: string | null;
}

export function useHiredCandidates(positionId: string | null) {
  return useQuery({
    queryKey: ["hired-candidates", positionId],
    queryFn: async () => {
      if (!positionId) return [];

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          updated_at,
          candidates (
            id,
            name,
            email,
            phone,
            photo_url
          )
        `)
        .eq("position_id", positionId)
        .eq("stage", "Hired");

      if (error) throw error;

      return (data || [])
        .filter((app: any) => app.candidates)
        .map((app: any) => ({
          id: app.candidates.id,
          name: app.candidates.name,
          email: app.candidates.email,
          phone: app.candidates.phone,
          photo_url: app.candidates.photo_url,
          hired_at: app.updated_at,
        })) as HiredCandidate[];
    },
    enabled: !!positionId,
  });
}

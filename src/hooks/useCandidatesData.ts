import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  resume_url: string | null;
  ai_fit_score: number | null;
  source: string;
  created_at: string;
  updated_at: string;
  // Application data
  application_id: string | null;
  position_id: string | null;
  position_title: string | null;
  stage: string | null;
  applied_at: string | null;
  // Interview data
  pre_screen_comment: string | null;
}

export function useCandidatesData() {
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading, error, refetch } = useQuery({
    queryKey: ["candidates-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          *,
          applications (
            id,
            position_id,
            stage,
            applied_at,
            notes,
            job_positions (
              id,
              title
            ),
            interviews (
              id,
              notes,
              status
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data
      return (data || []).map((candidate: any) => {
        const application = candidate.applications?.[0];
        const position = application?.job_positions;
        // Get the first interview notes as pre-screen comment
        const preScreenInterview = application?.interviews?.[0];
        
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          photo_url: candidate.photo_url,
          resume_url: candidate.resume_url,
          ai_fit_score: candidate.ai_fit_score,
          source: candidate.source,
          created_at: candidate.created_at,
          updated_at: candidate.updated_at,
          application_id: application?.id || null,
          position_id: application?.position_id || null,
          position_title: position?.title || null,
          stage: application?.stage || "New",
          applied_at: candidate.created_at,
          pre_screen_comment: application?.notes || preScreenInterview?.notes || null,
        } as CandidateData;
      });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CandidateData> }) => {
      const { error } = await supabase
        .from("candidates")
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          ai_fit_score: updates.ai_fit_score,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
    },
  });

  const updateApplicationStageMutation = useMutation({
    mutationFn: async ({ applicationId, stage }: { applicationId: string; stage: string }) => {
      const { error } = await supabase
        .from("applications")
        .update({ stage })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
    },
  });

  const formatAppliedDate = (dateString: string | null) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th });
    } catch {
      return "ไม่ระบุ";
    }
  };

  return {
    candidates,
    isLoading,
    error,
    refetch,
    updateCandidate: updateCandidateMutation.mutate,
    updateApplicationStage: updateApplicationStageMutation.mutate,
    formatAppliedDate,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export interface AIFitBreakdown {
  experience?: number;
  qualifications?: number;
  education?: number;
  skills?: number;
}

export interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  resume_url: string | null;
  ai_fit_score: number | null;
  ai_fit_breakdown: AIFitBreakdown | null;
  ai_fit_reasoning: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  // Application data
  application_id: string | null;
  position_id: string | null;
  job_position_id: string | null;
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
            ai_fit_score,
            ai_fit_reasoning,
            job_positions (
              id,
              title
            ),
            interviews (
              id,
              notes,
              status
            )
          ),
          candidate_details (
            position,
            other_skills,
            training_curriculums
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data
      return (data || []).map((candidate: any) => {
        const application = candidate.applications?.[0];
        const position = application?.job_positions;
        const details = candidate.candidate_details?.[0];
        // Get the first interview notes as pre-screen comment
        const preScreenInterview = application?.interviews?.[0];

        // Parse AI breakdown from application notes
        let aiBreakdown: AIFitBreakdown | null = null;
        if (application?.notes) {
          try {
            const parsedNotes = JSON.parse(application.notes);
            if (parsedNotes.breakdown) {
              aiBreakdown = parsedNotes.breakdown;
            }
          } catch {
            // Notes is not JSON, use as pre-screen comment
          }
        }

        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          photo_url: candidate.photo_url,
          resume_url: candidate.resume_url,
          ai_fit_score: application?.ai_fit_score || candidate.ai_fit_score,
          ai_fit_breakdown: aiBreakdown,
          ai_fit_reasoning: application?.ai_fit_reasoning || null,
          source: candidate.source,
          created_at: candidate.created_at,
          updated_at: candidate.updated_at,
          application_id: application?.id || null,
          position_id: application?.position_id || null,
          job_position_id: application?.position_id || null,
          // Use position from candidate_details first, then from job_positions
          position_title: details?.position || position?.title || null,
          // Use stage from candidates table first, then from application, default to Pending
          stage: candidate.stage || application?.stage || "Pending",
          applied_at: candidate.created_at,
          pre_screen_comment: aiBreakdown ? null : (application?.notes || preScreenInterview?.notes || null),
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
          stage: updates.stage,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
    },
  });

  const updateCandidateStageMutation = useMutation({
    mutationFn: async ({ candidateId, stage }: { candidateId: string; stage: string }) => {
      const { error } = await supabase
        .from("candidates")
        .update({ stage })
        .eq("id", candidateId);

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
    updateCandidateStage: updateCandidateStageMutation.mutate,
    formatAppliedDate,
  };
}

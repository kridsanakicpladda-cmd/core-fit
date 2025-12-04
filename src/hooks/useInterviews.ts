import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface InterviewData {
  id: string;
  application_id: string;
  interviewer_id: string | null;
  scheduled_at: string | null;
  status: string;
  result: string | null;
  notes: string | null;
  score: number | null;
  created_at: string;
  // Joined data
  candidate_name: string;
  candidate_email: string;
  position_title: string;
  proposed_slots?: { date: string; time: string }[];
  interview_round?: "first" | "final" | "pre_screen";
}

export function useInterviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interviews")
        .select(`
          *,
          applications (
            id,
            stage,
            notes,
            candidate_id,
            candidates (
              id,
              name,
              email
            ),
            job_positions (
              id,
              title
            )
          ),
          profiles:interviewer_id (
            id,
            name
          )
        `)
        .order("scheduled_at", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return (data || []).map((interview: any) => {
        const application = interview.applications;
        const candidate = application?.candidates;
        const position = application?.job_positions;
        
        // Parse proposed slots from notes if exists
        let proposedSlots: { date: string; time: string }[] | undefined;
        let interviewRound: "first" | "final" | "pre_screen" | undefined;
        
        if (interview.notes) {
          try {
            const notesData = JSON.parse(interview.notes);
            proposedSlots = notesData.proposedSlots;
            if (notesData.source === "manager_selection") {
              interviewRound = "first";
            } else if (notesData.type === "pre_screen") {
              interviewRound = "pre_screen";
            } else if (notesData.type === "final") {
              interviewRound = "final";
            }
          } catch {
            // notes is plain text
          }
        }

        return {
          id: interview.id,
          application_id: interview.application_id,
          interviewer_id: interview.interviewer_id,
          scheduled_at: interview.scheduled_at,
          status: interview.status,
          result: interview.result,
          notes: interview.notes,
          score: interview.score,
          created_at: interview.created_at,
          candidate_name: candidate?.name || "ไม่ระบุ",
          candidate_email: candidate?.email || "",
          position_title: position?.title || "ไม่ระบุตำแหน่ง",
          proposed_slots: proposedSlots,
          interview_round: interviewRound,
        } as InterviewData;
      });
    },
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async ({
      interviewId,
      scheduledAt,
      timeSlot,
    }: {
      interviewId: string;
      scheduledAt: string;
      timeSlot: string;
    }) => {
      const { error } = await supabase
        .from("interviews")
        .update({
          scheduled_at: scheduledAt,
          status: "scheduled",
          notes: JSON.stringify({ scheduledTime: timeSlot }),
        })
        .eq("id", interviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
      toast({
        title: "นัดสัมภาษณ์สำเร็จ",
        description: "บันทึกเวลานัดสัมภาษณ์เรียบร้อยแล้ว",
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

  const updateInterviewMutation = useMutation({
    mutationFn: async ({
      interviewId,
      updates,
    }: {
      interviewId: string;
      updates: {
        status?: string;
        result?: string;
        notes?: string;
        score?: number;
        scheduled_at?: string;
      };
    }) => {
      const { error } = await supabase
        .from("interviews")
        .update(updates)
        .eq("id", interviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
      toast({
        title: "บันทึกสำเร็จ",
        description: "อัปเดตข้อมูลการสัมภาษณ์เรียบร้อยแล้ว",
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

  const createInterviewMutation = useMutation({
    mutationFn: async ({
      applicationId,
      scheduledAt,
      status,
      notes,
      interviewerId,
    }: {
      applicationId: string;
      scheduledAt?: string;
      status: string;
      notes?: string;
      interviewerId?: string;
    }) => {
      const { data, error } = await supabase
        .from("interviews")
        .insert({
          application_id: applicationId,
          scheduled_at: scheduledAt,
          status,
          notes,
          interviewer_id: interviewerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
      toast({
        title: "สร้างการสัมภาษณ์สำเร็จ",
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

  // Filter interviews by status
  const pendingInterviews = interviews.filter((i) => i.status === "pending");
  const scheduledInterviews = interviews.filter((i) => i.status === "scheduled");
  const completedInterviews = interviews.filter((i) => i.status === "completed");

  return {
    interviews,
    pendingInterviews,
    scheduledInterviews,
    completedInterviews,
    isLoading,
    error,
    refetch,
    scheduleInterview: scheduleInterviewMutation.mutate,
    updateInterview: updateInterviewMutation.mutate,
    createInterview: createInterviewMutation.mutate,
  };
}

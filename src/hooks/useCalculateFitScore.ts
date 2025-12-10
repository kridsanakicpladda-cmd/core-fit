import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CalculateFitScoreParams {
  candidateId: string;
  applicationId?: string;
  jobPositionId: string;
}

interface FitScoreResult {
  score: number;
  reasoning: string;
  breakdown?: {
    experience: number;
    qualifications: number;
    education: number;
    skills: number;
  };
  strengths?: string[];
  concerns?: string[];
  recommendation?: string;
}

export const useCalculateFitScore = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ candidateId, applicationId, jobPositionId }: CalculateFitScoreParams): Promise<FitScoreResult> => {
      // Get candidate basic data
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (candidateError) throw candidateError;

      // Get candidate details (educations, work_experiences, skills, etc.)
      const { data: candidateDetails, error: detailsError } = await supabase
        .from("candidate_details")
        .select("*")
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (detailsError) {
        console.error("Error fetching candidate details:", detailsError);
      }

      // Get job position data
      const { data: jobPosition, error: jobError } = await supabase
        .from("job_positions")
        .select("*")
        .eq("id", jobPositionId)
        .single();

      if (jobError) throw jobError;

      // Try to get resume text if resume_url exists
      let resumeText = "";
      if (candidate.resume_url) {
        // Note: In a real implementation, you might want to fetch and parse the PDF
        // For now, we'll rely on the candidate_details data
        resumeText = `Resume URL: ${candidate.resume_url}`;
      }

      // Call edge function to calculate score with AI
      const { data: aiResult, error: aiError } = await supabase.functions.invoke(
        "calculate-fit-score",
        {
          body: {
            candidateData: {
              name: candidate.name,
              email: candidate.email,
              phone: candidate.phone,
              resume_url: candidate.resume_url,
              resume_text: resumeText,
            },
            jobData: {
              title: jobPosition.title,
              department: jobPosition.department,
              location: jobPosition.location,
              employment_type: jobPosition.employment_type,
              requirements: jobPosition.requirements,
              responsibilities: jobPosition.responsibilities,
              job_grade: jobPosition.job_grade,
              salary_min: jobPosition.salary_min,
              salary_max: jobPosition.salary_max,
            },
            candidateDetails: candidateDetails ? {
              position: candidateDetails.position,
              expected_salary: candidateDetails.expected_salary,
              educations: candidateDetails.educations,
              work_experiences: candidateDetails.work_experiences,
              language_skills: candidateDetails.language_skills,
              other_skills: candidateDetails.other_skills,
              computer_skill: candidateDetails.computer_skill,
              driving_car: candidateDetails.driving_car,
              driving_motorcycle: candidateDetails.driving_motorcycle,
              training_curriculums: candidateDetails.training_curriculums,
            } : null,
          },
        }
      );

      let finalScore = 0;
      let reasoning = "";
      let breakdown = undefined;
      let strengths: string[] = [];
      let concerns: string[] = [];
      let recommendation = "";

      if (aiError || !aiResult?.success) {
        console.error("AI calculation failed:", aiError || aiResult?.error);
        // Fallback to local calculation
        const { calculateJobFitScore } = await import("@/lib/calculateJobFitScore");

        // Prepare candidate data for local calculation
        const candidateForCalc = {
          position_title: candidateDetails?.position || "",
          education: candidateDetails?.educations ?
            JSON.stringify(candidateDetails.educations) : "",
          experience_years: 0,
          skills: [],
          resume_text: resumeText,
        };

        // Calculate experience years from work_experiences
        if (candidateDetails?.work_experiences && Array.isArray(candidateDetails.work_experiences)) {
          for (const exp of candidateDetails.work_experiences as any[]) {
            const durationMatch = exp.duration?.match(/(\d+)/);
            if (durationMatch) {
              candidateForCalc.experience_years += parseInt(durationMatch[1]);
            }
          }
        }

        finalScore = calculateJobFitScore(candidateForCalc, jobPosition);
        reasoning = "คำนวณจากระบบ (AI ไม่พร้อมใช้งาน)";
      } else {
        finalScore = aiResult.data.score;
        reasoning = aiResult.data.reasoning;
        breakdown = aiResult.data.breakdown;
        strengths = aiResult.data.strengths || [];
        concerns = aiResult.data.concerns || [];
        recommendation = aiResult.data.recommendation || "";
      }

      // Update candidate's ai_fit_score
      const { error: updateCandidateError } = await supabase
        .from("candidates")
        .update({
          ai_fit_score: finalScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", candidateId);

      if (updateCandidateError) {
        console.error("Error updating candidate score:", updateCandidateError);
      }

      // Update application with score, reasoning, and breakdown if applicationId provided
      if (applicationId) {
        const updateData: any = {
          ai_fit_score: finalScore,
          ai_fit_reasoning: reasoning,
        };

        // Store breakdown and other AI data in notes as JSON
        if (breakdown || strengths.length > 0 || concerns.length > 0 || recommendation) {
          const aiData = {
            breakdown,
            strengths,
            concerns,
            recommendation,
            calculated_at: new Date().toISOString(),
          };
          updateData.notes = JSON.stringify(aiData);
        }

        const { error: updateError } = await supabase
          .from("applications")
          .update(updateData)
          .eq("id", applicationId);

        if (updateError) {
          console.error("Error updating application score:", updateError);
        }
      }

      // If no applicationId, create or update application to store AI data
      if (!applicationId && jobPositionId) {
        // Check if application exists
        const { data: existingApp } = await supabase
          .from("applications")
          .select("id")
          .eq("candidate_id", candidateId)
          .eq("position_id", jobPositionId)
          .maybeSingle();

        const aiData = {
          breakdown,
          strengths,
          concerns,
          recommendation,
          calculated_at: new Date().toISOString(),
        };

        if (existingApp) {
          // Update existing application
          await supabase
            .from("applications")
            .update({
              ai_fit_score: finalScore,
              ai_fit_reasoning: reasoning,
              notes: JSON.stringify(aiData),
            } as any)
            .eq("id", existingApp.id);
        } else {
          // Create new application
          await supabase
            .from("applications")
            .insert({
              candidate_id: candidateId,
              position_id: jobPositionId,
              stage: "Screening",
              ai_fit_score: finalScore,
              ai_fit_reasoning: reasoning,
              notes: JSON.stringify(aiData),
            });
        }
      }

      return {
        score: finalScore,
        reasoning,
        breakdown,
        strengths,
        concerns,
        recommendation
      };
    },
    onSuccess: (data) => {
      toast({
        title: "คำนวณคะแนนสำเร็จ",
        description: `คะแนนความเหมาะสม: ${data.score}% - ${data.reasoning}`,
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
};

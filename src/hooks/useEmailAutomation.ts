import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CandidateForEmail {
  id: string;
  name: string;
  email: string;
  position?: string;
  age?: string | null;
  expectedSalary?: string | null;
  aiScore?: number | null;
  preScreenComment?: string | null;
  resumeUrl?: string | null;
}

export function useEmailAutomation() {
  const { toast } = useToast();

  /**
   * Send Full Application form link to candidate
   */
  const sendFullApplicationInvite = async (candidate: {
    id: string;
    name: string;
    email: string;
    position?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-application-invite', {
        body: {
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          position: candidate.position,
        },
      });

      if (error) throw error;

      toast({
        title: "ส่งอีเมลสำเร็จ",
        description: `ส่งลิงก์ใบสมัครฉบับเต็มให้ ${candidate.name} แล้ว`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: "ไม่สามารถส่งอีเมลได้",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Send Manager Comparison Matrix email
   */
  const sendManagerComparisonMatrix = async ({
    managerEmail,
    managerName,
    department,
    senderRole,
    candidates,
    positions,
  }: {
    managerEmail: string;
    managerName: string;
    department: string;
    senderRole: string;
    candidates: CandidateForEmail[];
    positions: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-with-attachments', {
        body: {
          to: managerEmail,
          toName: managerName,
          department,
          senderRole,
          candidates: candidates.map(c => ({
            id: c.id,
            name: c.name,
            position: c.position || 'ไม่ระบุ',
            resume_url: c.resumeUrl,
            ai_score: c.aiScore || 0,
            pre_screen_comment: c.preScreenComment || '-',
            age: c.age || '-',
            expected_salary: c.expectedSalary || '-',
          })),
          positions,
        },
      });

      if (error) throw error;

      toast({
        title: "ส่ง Comparison Matrix สำเร็จ",
        description: `ส่งตารางเปรียบเทียบผู้สมัคร ${candidates.length} คนให้ ${managerName} แล้ว`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: "ไม่สามารถส่งอีเมลได้",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Send Interview Invitation to candidate
   */
  const sendInterviewInvite = async ({
    candidateEmail,
    candidateName,
    position,
    interviewDate,
    interviewTime,
    location,
    interviewType,
  }: {
    candidateEmail: string;
    candidateName: string;
    position: string;
    interviewDate: string;
    interviewTime: string;
    location?: string;
    interviewType: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-interview-invite', {
        body: {
          candidateEmail,
          candidateName,
          position,
          interviewDate,
          interviewTime,
          location: location || 'จะแจ้งให้ทราบภายหลัง',
          interviewType,
        },
      });

      if (error) throw error;

      toast({
        title: "ส่ง Interview Invite สำเร็จ",
        description: `ส่งนัดสัมภาษณ์ให้ ${candidateName} แล้ว`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: "ไม่สามารถส่งอีเมลได้",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    sendFullApplicationInvite,
    sendManagerComparisonMatrix,
    sendInterviewInvite,
  };
}

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalendarEvent {
  subject: string;
  body: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  attendees: Array<{ email: string; name?: string }>;
  location?: string;
}

export function useOutlookCalendar() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data } = await supabase
        .from("company_settings")
        .select("microsoft_365_token, microsoft_365_connected")
        .single();

      if (!data?.microsoft_365_connected || !data?.microsoft_365_token) {
        toast({
          title: "ยังไม่ได้เชื่อมต่อ Microsoft 365",
          description: "กรุณาเชื่อมต่อ Microsoft 365 ในหน้า Settings ก่อน",
          variant: "destructive",
        });
        return null;
      }

      return data.microsoft_365_token;
    } catch {
      return null;
    }
  };

  const createCalendarEvent = async (event: CalendarEvent): Promise<boolean> => {
    setSyncing(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setSyncing(false);
        return false;
      }

      // Call Supabase edge function to create calendar event
      const { data, error } = await supabase.functions.invoke('outlook-calendar', {
        body: {
          action: 'create_event',
          token,
          event: {
            subject: event.subject,
            body: { contentType: "HTML", content: event.body },
            start: { dateTime: event.startDateTime, timeZone: "Asia/Bangkok" },
            end: { dateTime: event.endDateTime, timeZone: "Asia/Bangkok" },
            location: event.location ? { displayName: event.location } : undefined,
            attendees: event.attendees.map(a => ({
              emailAddress: { address: a.email, name: a.name || a.email },
              type: "required",
            })),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "สร้างนัดหมายสำเร็จ",
        description: "ส่ง Calendar Invite ไปยังผู้ที่เกี่ยวข้องเรียบร้อยแล้ว",
      });

      return true;
    } catch (err: any) {
      console.error("Error creating calendar event:", err);
      toast({
        title: "ไม่สามารถสร้างนัดหมายได้",
        description: err.message || "กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่อ Microsoft 365",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const createInterviewCalendarEvent = async ({
    candidateName,
    position,
    interviewDate,
    interviewTime,
    durationMinutes = 60,
    attendeeEmails,
    location,
    interviewType = "Main Interview",
  }: {
    candidateName: string;
    position: string;
    interviewDate: string; // YYYY-MM-DD
    interviewTime: string; // HH:mm
    durationMinutes?: number;
    attendeeEmails: Array<{ email: string; name?: string }>;
    location?: string;
    interviewType?: string;
  }) => {
    const startDate = new Date(`${interviewDate}T${interviewTime}:00`);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    return createCalendarEvent({
      subject: `[สัมภาษณ์] ${candidateName} - ${position} (${interviewType})`,
      body: `
        <h2>นัดสัมภาษณ์ผู้สมัครงาน</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; font-weight: bold;">ผู้สมัคร:</td><td style="padding: 8px;">${candidateName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">ตำแหน่ง:</td><td style="padding: 8px;">${position}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">ประเภท:</td><td style="padding: 8px;">${interviewType}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">วันที่:</td><td style="padding: 8px;">${interviewDate}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">เวลา:</td><td style="padding: 8px;">${interviewTime} - ${endDate.toTimeString().slice(0, 5)}</td></tr>
          ${location ? `<tr><td style="padding: 8px; font-weight: bold;">สถานที่:</td><td style="padding: 8px;">${location}</td></tr>` : ''}
        </table>
        <p style="margin-top: 16px; color: #666;">— สร้างโดยระบบ Core Fit Recruitment</p>
      `,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      attendees: attendeeEmails,
      location,
    });
  };

  return {
    createCalendarEvent,
    createInterviewCalendarEvent,
    syncing,
  };
}

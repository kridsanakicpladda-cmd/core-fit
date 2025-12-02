import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, List } from "lucide-react";
import { Interview } from "./InterviewFormDialog";
import { InterviewCard } from "./InterviewCard";
import { InterviewCalendarView } from "./InterviewCalendarView";

interface InterviewSectionProps {
  title: string;
  interviews: Interview[];
  onInterviewClick: (interview: Interview) => void;
  gradientClass?: string;
}

export function InterviewSection({ 
  title, 
  interviews, 
  onInterviewClick,
  gradientClass = "from-primary/5 to-transparent"
}: InterviewSectionProps) {
  const sortedInterviews = [...interviews].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-4">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            รายการ
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            ปฏิทิน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3 mt-4">
          {sortedInterviews.length > 0 ? (
            sortedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onClick={onInterviewClick}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  ยังไม่มีการสัมภาษณ์ที่กำหนดไว้
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <InterviewCalendarView 
            interviews={interviews}
            onInterviewClick={onInterviewClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

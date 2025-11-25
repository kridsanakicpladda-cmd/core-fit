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
  const todayInterviews = interviews.filter(i => {
    const today = new Date();
    return i.date.toDateString() === today.toDateString();
  });

  const upcomingInterviews = interviews.filter(i => {
    const today = new Date();
    return i.date > today;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent flex items-center gap-2">
        <div className="h-1 w-12 bg-gradient-luxury rounded-full" />
        {title}
      </h2>

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

        <TabsContent value="list" className="space-y-4 mt-4">
          {todayInterviews.length > 0 && (
            <Card className={`border-primary/20 bg-gradient-to-br ${gradientClass}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                  สัมภาษณ์วันนี้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayInterviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      onClick={onInterviewClick}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingInterviews.length > 0 && (
            <Card className="hover:shadow-hover transition-all glow-on-hover">
              <CardHeader>
                <CardTitle>การสัมภาษณ์ที่กำลังจะมาถึง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingInterviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      onClick={onInterviewClick}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {todayInterviews.length === 0 && upcomingInterviews.length === 0 && (
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

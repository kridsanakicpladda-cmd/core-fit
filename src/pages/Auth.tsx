import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useJobPositions } from "@/hooks/useJobPositions";
import { MapPin, Building2, Briefcase, Users } from "lucide-react";
import logo from "@/assets/logo.png";
import authBg from "@/assets/auth-bg.jpg";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { positions, isLoading: jobsLoading } = useJobPositions();

  const openJobs = positions.filter((job) => job.status === "open");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email',
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Login Card */}
        <Card className="w-[410px] h-[410px] flex flex-col justify-center shrink-0">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="ICP Ladda Logo" className="h-16" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Talent X-Ray</CardTitle>
              <CardDescription>ระบบบริหารจัดการทรัพยากรบุคคล</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleMicrosoftSignIn}
              className="w-full"
              variant="outline"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Login with Microsoft"}
            </Button>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card className="w-[410px] max-h-[600px] flex flex-col bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              ตำแหน่งที่เปิดรับสมัคร
            </CardTitle>
            <CardDescription>
              {jobsLoading ? "กำลังโหลด..." : `${openJobs.length} ตำแหน่งที่เปิดรับ`}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto space-y-3 pb-4">
            {jobsLoading ? (
              <div className="text-center text-muted-foreground py-8">กำลังโหลดข้อมูล...</div>
            ) : openJobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">ยังไม่มีตำแหน่งที่เปิดรับ</div>
            ) : (
              openJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border p-3 space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm leading-tight">{job.title}</h4>
                    {job.required_count && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {job.required_count} อัตรา
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {job.department}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <Badge variant="outline" className="text-xs py-0">
                        {job.employment_type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

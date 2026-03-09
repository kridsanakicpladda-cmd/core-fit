import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock, Briefcase, Search, Loader2, UserCheck } from "lucide-react";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { JobEditDialog } from "@/components/jobs/JobEditDialog";
import { useJobPositions } from "@/hooks/useJobPositions";
import { useHiredCountByPosition } from "@/hooks/useHiredCountByPosition";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Jobs() {
  const navigate = useNavigate();
  const { positions, isLoading, updatePosition, deletePosition } = useJobPositions();
  const { data: hiredCounts = {} } = useHiredCountByPosition();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    await updatePosition.mutateAsync({ id: jobId, status: newStatus });
  };

  const handleDelete = async (jobId: string) => {
    await deletePosition.mutateAsync(jobId);
    setIsDetailOpen(false);
  };

  const handleViewCandidates = () => {
    navigate("/candidates");
  };

  const handleApplyJob = (jobId: string, jobTitle: string) => {
    navigate("/job-application", { state: { jobId, jobTitle } });
  };

  const handleEdit = () => {
    setIsDetailOpen(false);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    // Save current scroll position
    const scrollPosition = window.scrollY;
    
    // Close edit dialog
    setIsEditOpen(false);
    
    // Restore scroll position after a short delay to allow re-render
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);
  };

  // Get unique departments and locations for filters
  const departments = useMemo(() => {
    const depts = new Set(positions.map(job => job.department));
    return Array.from(depts).sort();
  }, [positions]);

  const locations = useMemo(() => {
    const locs = new Set(positions.map(job => job.location || "ไม่ระบุ"));
    return Array.from(locs).sort();
  }, [positions]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return positions.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = departmentFilter === "all" || job.department === departmentFilter;
      const matchesLocation = locationFilter === "all" || (job.location || "ไม่ระบุ") === locationFilter;
      
      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }, [positions, searchTerm, departmentFilter, locationFilter]);

  // Transform database data to format expected by components
  const transformedJobs = useMemo(() => {
    return filteredJobs.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location || "ไม่ระบุ",
      type: job.employment_type || "Full-time",
      status: job.status as "open" | "closed",
      postedDate: job.created_at ? format(new Date(job.created_at), "dd MMM yyyy", { locale: th }) : "ไม่ระบุ",
      salaryRange: job.salary || (job.salary_min && job.salary_max ? `฿${job.salary_min.toLocaleString()} - ฿${job.salary_max.toLocaleString()}` : "ตามตกลง"),
      numberOfPositions: `${job.required_count || 1} อัตรา`,
      jobGrade: job.job_grade || "-",
      description: job.description || "ไม่มีรายละเอียด",
      responsibilities: job.responsibilities ? job.responsibilities.split('\n').filter(Boolean) : [],
      requirements: job.requirements ? job.requirements.split('\n').filter(Boolean) : [],
      rawRequiredCount: job.required_count,
      hiredCount: hiredCounts[job.id] || 0,
      applicants: 0,
      avgScore: 0,
      interviewStats: {
        total: 0,
        passed: 0,
        failed: 0
      }
    }));
  }, [filteredJobs, hiredCounts]);

  // Update selectedJob when positions change (after edit)
  useEffect(() => {
    if (selectedJob && positions.length > 0) {
      const updatedJob = transformedJobs.find(job => job.id === selectedJob.id);
      if (updatedJob && JSON.stringify(updatedJob) !== JSON.stringify(selectedJob)) {
        setSelectedJob(updatedJob);
      }
    }
  }, [positions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-2xl opacity-50" />
        <div className="relative">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
            ตำแหน่งงาน
          </h1>
          <p className="text-muted-foreground text-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            จัดการตำแหน่งงานที่เปิดรับสมัครทั้งหมด
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตำแหน่งงาน แผนก หรือสถานที่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="แผนกทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">แผนกทั้งหมด</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="สถานที่ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานที่ทั้งหมด</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchTerm || departmentFilter !== "all" || locationFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>พบ {transformedJobs.length} ตำแหน่งงาน</span>
              {(searchTerm || departmentFilter !== "all" || locationFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("all");
                    setLocationFilter("all");
                  }}
                  className="h-auto p-0 text-primary hover:text-primary/80"
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {transformedJobs.length > 0 ? (
          transformedJobs.map((job) => (
          <Card key={job.id} className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/30 bg-gradient-to-br from-background via-background to-muted/10">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="pb-3 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300 group-hover:translate-x-1 transform">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={job.status === "open" ? "default" : "secondary"}
                        className="shadow-sm group-hover:shadow-md transition-shadow"
                      >
                        {job.status === "open" ? "🎯 เปิดรับสมัคร" : "⏸️ ปิดรับสมัคร"}
                      </Badge>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-muted-foreground font-medium">สถานะ</span>
                        <Switch
                          checked={job.status === "open"}
                          onCheckedChange={() => handleToggleStatus(job.id, job.status)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 bg-muted/30 rounded-full px-3 py-1.5 hover:bg-muted/50 transition-colors">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="font-medium">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/30 rounded-full px-3 py-1.5 hover:bg-muted/50 transition-colors">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/30 rounded-full px-3 py-1.5 hover:bg-muted/50 transition-colors">
                      <Clock className="h-4 w-4 text-primary/70" />
                      <span className="font-medium">{job.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 hover:scale-105 transition-transform duration-300">
                    <p className="text-xs text-muted-foreground font-medium mb-1">จำนวนผู้สมัคร</p>
                    <p className="font-bold text-2xl text-primary">{job.applicants}</p>
                  </div>
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-3 hover:scale-105 transition-transform duration-300">
                    <p className="text-xs text-muted-foreground font-medium mb-1">เงินเดือน</p>
                    <p className="font-semibold text-sm">{job.salaryRange}</p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 hover:scale-105 transition-transform duration-300">
                    <p className="text-xs text-muted-foreground font-medium mb-1">จำนวนอัตรา</p>
                    <p className="font-semibold">{job.numberOfPositions}</p>
                    {job.rawRequiredCount && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            จ้างแล้ว
                          </span>
                          <span className="font-medium">{job.hiredCount}/{job.rawRequiredCount}</span>
                        </div>
                        <Progress
                          value={Math.min((job.hiredCount / job.rawRequiredCount) * 100, 100)}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-3 hover:scale-105 transition-transform duration-300">
                    <p className="text-xs text-muted-foreground font-medium mb-1">ประกาศเมื่อ</p>
                    <p className="font-semibold text-sm">{job.postedDate}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    onClick={() => handleViewDetails(job)}
                    className="flex-1 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    ดูรายละเอียด
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleApplyJob(job.id, job.title)}
                    className="min-w-[120px] border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    สมัครงาน
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground space-y-4 animate-in fade-in duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50">
                  <Briefcase className="h-10 w-10 opacity-50" />
                </div>
                <div>
                  <p className="text-xl font-semibold mb-2">ไม่พบตำแหน่งงาน</p>
                  <p className="text-sm">
                    {searchTerm || departmentFilter !== "all" || locationFilter !== "all"
                      ? "ลองเปลี่ยนเงื่อนไขการค้นหา หรือล้างตัวกรอง"
                      : "ยังไม่มีตำแหน่งงานในระบบ"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedJob && (
        <>
          <JobDetailDialog
            job={selectedJob}
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            onEdit={handleEdit}
            onDelete={() => handleDelete(selectedJob.id)}
            onViewCandidates={handleViewCandidates}
          />
          <JobEditDialog
            job={selectedJob}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </div>
  );
}
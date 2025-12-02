import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Briefcase, Search, Loader2 } from "lucide-react";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { useJobPositions } from "@/hooks/useJobPositions";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Jobs() {
  const navigate = useNavigate();
  const { positions, isLoading, updatePosition, deletePosition } = useJobPositions();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
      salaryRange: job.salary_min && job.salary_max ? `฿${job.salary_min.toLocaleString()} - ฿${job.salary_max.toLocaleString()}` : "ตามตกลง",
      numberOfPositions: `${job.required_count || 1} อัตรา`,
      jobGrade: job.job_grade || "-",
      description: job.description || "ไม่มีรายละเอียด",
      responsibilities: job.responsibilities ? job.responsibilities.split('\n').filter(Boolean) : [],
      requirements: job.requirements ? job.requirements.split('\n').filter(Boolean) : [],
      applicants: 0, // This would need to come from applications table
      avgScore: 0, // This would need to be calculated from interviews
      interviewStats: {
        total: 0,
        passed: 0,
        failed: 0
      }
    }));
  }, [filteredJobs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          ตำแหน่งงาน
        </h1>
        <p className="text-muted-foreground">
          จัดการตำแหน่งงานที่เปิดรับสมัครทั้งหมด
        </p>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-border/50">
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
          <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.status === "open" ? "default" : "secondary"}>
                        {job.status === "open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">สถานะ</span>
                        <Switch
                          checked={job.status === "open"}
                          onCheckedChange={() => handleToggleStatus(job.id, job.status)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ผู้สมัคร</p>
                    <p className="font-semibold text-lg">{job.applicants}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">เงินเดือน</p>
                    <p className="font-semibold">{job.salaryRange}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">จำนวนอัตรา</p>
                    <p className="font-semibold">{job.numberOfPositions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ประกาศเมื่อ</p>
                    <p className="font-semibold">{job.postedDate}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    onClick={() => handleViewDetails(job)}
                    className="flex-1"
                  >
                    ดูรายละเอียด
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleViewCandidates()}
                  >
                    ผู้สมัคร
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">ไม่พบตำแหน่งงาน</p>
                <p className="text-sm mt-1">
                  {searchTerm || departmentFilter !== "all" || locationFilter !== "all"
                    ? "ลองเปลี่ยนเงื่อนไขการค้นหา"
                    : "ยังไม่มีตำแหน่งงานในระบบ"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedJob && (
        <JobDetailDialog
          job={selectedJob}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEdit={() => {}}
          onDelete={() => handleDelete(selectedJob.id)}
          onViewCandidates={handleViewCandidates}
        />
      )}
    </div>
  );
}
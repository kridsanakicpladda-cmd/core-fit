import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Clock, Briefcase, Search, Loader2, CheckCircle2, Building2, DollarSign, Users, Calendar } from "lucide-react";
import { useJobPositions } from "@/hooks/useJobPositions";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import logoIcp from "@/assets/logo.png";
import logoMabin from "@/assets/ม้าบิน (1).png";
import logoTopone from "@/assets/TOPONE.png";
import logoKaset from "@/assets/ICK logo_Horizontal&Vertical-01.png";

export default function PublicJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/jobs-apply";

  const { positions, isLoading } = useJobPositions();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleApplyJob = (jobTitle: string) => {
    // Navigate back to the return URL with the selected position
    navigate(`${returnUrl}?position=${encodeURIComponent(jobTitle)}`);
  };

  const handleBack = () => {
    navigate(returnUrl);
  };

  // Get unique departments and locations for filters
  const departments = useMemo(() => {
    const depts = new Set(positions.filter(job => job.status === "open").map(job => job.department));
    return Array.from(depts).sort();
  }, [positions]);

  const locations = useMemo(() => {
    const locs = new Set(positions.filter(job => job.status === "open").map(job => job.location || "ไม่ระบุ"));
    return Array.from(locs).sort();
  }, [positions]);

  // Filter jobs - only show open positions
  const filteredJobs = useMemo(() => {
    return positions.filter(job => {
      if (job.status !== "open") return false;

      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = departmentFilter === "all" || job.department === departmentFilter;
      const matchesLocation = locationFilter === "all" || (job.location || "ไม่ระบุ") === locationFilter;

      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }, [positions, searchTerm, departmentFilter, locationFilter]);

  // Transform database data
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
    }));
  }, [filteredJobs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            {/* Company Logos */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mb-4">
              <img src={logoIcp} alt="ICP Ladda" className="h-10 sm:h-12 w-auto object-contain" />
              <img src={logoMabin} alt="ปุ๋ยตราม้าบิน" className="h-10 sm:h-12 w-auto object-contain" />
              <img src={logoTopone} alt="TOP ONE" className="h-10 sm:h-12 w-auto object-contain" />
              <img src={logoKaset} alt="Icon Kaset" className="h-10 sm:h-12 w-auto object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ตำแหน่งงานที่เปิดรับสมัคร
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter Section */}
        <Card className="mb-6 border-0 shadow-md">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("all");
                    setLocationFilter("all");
                  }}
                  className="h-auto p-0 text-blue-600 hover:text-blue-700"
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="grid gap-4">
          {transformedJobs.length > 0 ? (
            transformedJobs.map((job) => (
              <Card
                key={job.id}
                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:border-blue-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="pb-3 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </CardTitle>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                          เปิดรับสมัคร
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <span>{job.department}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="h-4 w-4 text-cyan-500" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span>{job.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">เงินเดือน</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{job.salaryRange}</p>
                      </div>
                      <div className="bg-cyan-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-cyan-600 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="text-xs font-medium">จำนวนอัตรา</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{job.numberOfPositions}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs font-medium">ประกาศเมื่อ</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{job.postedDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(job)}
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        ดูรายละเอียด
                      </Button>
                      <Button
                        onClick={() => handleApplyJob(job.title)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm hover:shadow-md transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        สมัครงาน
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50">
                    <Briefcase className="h-10 w-10 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold mb-2 text-gray-700">ไม่พบตำแหน่งงาน</p>
                    <p className="text-sm text-gray-500">
                      {searchTerm || departmentFilter !== "all" || locationFilter !== "all"
                        ? "ลองเปลี่ยนเงื่อนไขการค้นหา หรือล้างตัวกรอง"
                        : "ยังไม่มีตำแหน่งงานที่เปิดรับสมัครในขณะนี้"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Job Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700">
                  {selectedJob.title}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    {selectedJob.department}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    {selectedJob.type}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Salary & Positions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">เงินเดือน</p>
                    <p className="font-bold text-lg text-gray-800">{selectedJob.salaryRange}</p>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-4">
                    <p className="text-sm text-cyan-600 font-medium mb-1">จำนวนอัตรา</p>
                    <p className="font-bold text-lg text-gray-800">{selectedJob.numberOfPositions}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedJob.description && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">รายละเอียดงาน</h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedJob.responsibilities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">หน้าที่ความรับผิดชอบ</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedJob.responsibilities.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Requirements */}
                {selectedJob.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">คุณสมบัติ</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {selectedJob.requirements.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Apply Button */}
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleApplyJob(selectedJob.title);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm hover:shadow-md transition-all h-12 text-lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  สมัครงาน
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

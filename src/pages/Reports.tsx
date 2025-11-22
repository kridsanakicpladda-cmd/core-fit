import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import { Users, Briefcase, TrendingUp, UserCheck, MessageSquare, UserPlus, Percent, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardFilters, Position } from '@/types/reports';
import { FilterBar } from '@/components/reports/FilterBar';
import { StatCard } from '@/components/reports/StatCard';
import { EfficiencyPanel } from '@/components/reports/EfficiencyPanel';
import { QualityPanel } from '@/components/reports/QualityPanel';
import { RecruitmentFunnel } from '@/components/reports/RecruitmentFunnel';
import { TrendChart } from '@/components/reports/TrendChart';
import { StatusDonut } from '@/components/reports/StatusDonut';
import { DepartmentBarChart } from '@/components/reports/DepartmentBarChart';
import { PositionTable } from '@/components/reports/PositionTable';
import { DetailDrawer } from '@/components/reports/DetailDrawer';
import { YieldRatioHeatmap } from '@/components/reports/YieldRatioHeatmap';
import { SourceTreemap } from '@/components/reports/SourceTreemap';
import { EmptyState } from '@/components/reports/EmptyState';
import { useReportsData } from '@/hooks/useReportsData';
import { exportToCSV, exportAllChartsToPNG } from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: searchParams.get('dateRange') || '30d',
    department: searchParams.get('department') || undefined,
    source: searchParams.get('source') || undefined,
    stage: searchParams.get('stage') || undefined,
    search: searchParams.get('search') || undefined
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'position' | 'efficiency' | 'quality'>('position');
  const [selectedPosition, setSelectedPosition] = useState<Position>();

  // Fetch real data from Supabase
  const {
    isLoading,
    headlineStats,
    efficiency,
    quality,
    stageStats,
    positions,
    sourcesCost,
    candidates,
    trendData,
    yieldRatios
  } = useReportsData();

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.dateRange) params.set('dateRange', filters.dateRange);
    if (filters.department && filters.department !== 'all') params.set('department', filters.department);
    if (filters.source && filters.source !== 'all') params.set('source', filters.source);
    if (filters.stage && filters.stage !== 'all') params.set('stage', filters.stage);
    if (filters.search) params.set('search', filters.search);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleExportCSV = () => {
    toast.info('กำลังสร้างไฟล์ CSV...');
    exportToCSV(
      positions.map(p => ({
        title: p.title,
        department: p.department,
        applicants: p.applicants,
        interviewed: p.interviewed,
        passed: p.passed,
        failed: p.failed,
        status: p.status
      })),
      'recruitment-report',
      ['ตำแหน่ง', 'แผนก', 'ผู้สมัครทั้งหมด', 'สัมภาษณ์แล้ว', 'ผ่าน', 'ไม่ผ่าน', 'สถานะ']
    );
    toast.success('Export CSV สำเร็จ!');
  };

  const handleExportPNG = async () => {
    toast.info('กำลังสร้างไฟล์ PNG...');
    const chartIds = [
      'recruitment-funnel',
      'trend-chart',
      'status-donut',
      'department-bar-chart',
      'yield-ratio-heatmap',
      'source-treemap'
    ];
    await exportAllChartsToPNG(chartIds, 'recruitment-chart');
    toast.success('Export PNG สำเร็จ!');
  };

  const handleViewDetails = (position: Position) => {
    setSelectedPosition(position);
    setDrawerType('position');
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  const hasData = positions.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            ภาพรวมการรับสมัคร คัดเลือก และสัมภาษณ์งาน
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={!hasData}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPNG} disabled={!hasData}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {!hasData ? (
        <EmptyState 
          title="ยังไม่มีข้อมูลการรับสมัคร"
          description="เริ่มต้นโดยการเพิ่มตำแหน่งงานและผู้สมัครเพื่อดูรายงานการรับสมัคร"
        />
      ) : (
        <>
          {/* KPI Cards - Speed Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Speed Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="ผู้สมัครทั้งหมด"
                value={headlineStats.applicants.current.toLocaleString()}
                mom={headlineStats.applicants.mom}
                icon={<Users className="h-6 w-6 text-primary" />}
                tooltip="จำนวนผู้สมัครทั้งหมดในช่วงเวลาที่เลือก"
              />
              <StatCard
                title="ตำแหน่งเปิดรับ"
                value={headlineStats.openRoles.current}
                mom={headlineStats.openRoles.mom}
                icon={<Briefcase className="h-6 w-6 text-primary" />}
                tooltip="จำนวนตำแหน่งที่เปิดรับสมัคร"
              />
              <StatCard
                title="Vacancy Rate"
                value={`${(headlineStats.vacancyRate.current * 100).toFixed(1)}%`}
                mom={headlineStats.vacancyRate.mom}
                icon={<Percent className="h-6 w-6 text-primary" />}
                tooltip="อัตราตำแหน่งว่าง = Open Jobs / Total Jobs"
              />
              <StatCard
                title="Applicants/Opening"
                value={headlineStats.applicantsPerOpening.current.toFixed(1)}
                mom={headlineStats.applicantsPerOpening.mom}
                icon={<Target className="h-6 w-6 text-primary" />}
                tooltip="จำนวนผู้สมัครเฉลี่ยต่อตำแหน่ง"
              />
            </div>
          </div>

          {/* Funnel & Hiring Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Funnel & Hiring Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="อัตราจ้างงาน"
                value={`${(headlineStats.hiringRate.current * 100).toFixed(0)}%`}
                mom={headlineStats.hiringRate.mom}
                icon={<TrendingUp className="h-6 w-6 text-primary" />}
                tooltip="Hiring Rate = Hired / Offers"
              />
              <StatCard
                title="ผ่านคัดกรอง"
                value={headlineStats.screeningPassed.current}
                mom={headlineStats.screeningPassed.mom}
                icon={<UserCheck className="h-6 w-6 text-primary" />}
                tooltip="ผู้สมัครที่ผ่านการคัดกรอง"
              />
              <StatCard
                title="สัมภาษณ์แล้ว"
                value={headlineStats.interviewed.current}
                mom={headlineStats.interviewed.mom}
                icon={<MessageSquare className="h-6 w-6 text-primary" />}
                tooltip="จำนวนการสัมภาษณ์ที่ทำแล้ว"
              />
              <StatCard
                title="รับเข้าทำงาน"
                value={headlineStats.hired.current}
                mom={headlineStats.hired.mom}
                icon={<UserPlus className="h-6 w-6 text-primary" />}
                tooltip="จำนวนที่รับเข้าทำงานแล้ว"
              />
            </div>
          </div>

          {/* Efficiency & Quality Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EfficiencyPanel 
              data={efficiency} 
              onViewDetails={() => {
                setDrawerType('efficiency');
                setDrawerOpen(true);
              }}
            />
            <QualityPanel 
              data={quality} 
              onViewDetails={() => {
                setDrawerType('quality');
                setDrawerOpen(true);
              }}
            />
          </div>

          {/* Charts Grid - Funnel & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div id="recruitment-funnel">
              <RecruitmentFunnel data={stageStats} />
            </div>
            <div id="trend-chart">
              <TrendChart data={trendData} />
            </div>
          </div>

          {/* Status & Department Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div id="status-donut">
              <StatusDonut data={stageStats} />
            </div>
            <div id="department-bar-chart">
              <DepartmentBarChart positions={positions} />
            </div>
          </div>

          {/* Yield Ratio Heatmap */}
          <YieldRatioHeatmap data={yieldRatios} />

          {/* Sourcing Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Sourcing Metrics</h2>
            <SourceTreemap 
              data={sourcesCost.map(s => ({ source: s.source, count: s.applicants }))}
            />
          </div>

          {/* Position Table */}
          <PositionTable positions={positions} onViewDetails={handleViewDetails} />
        </>
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position={selectedPosition}
        candidates={candidates}
        type={drawerType}
      />
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import { Users, Briefcase, TrendingUp, UserCheck, MessageSquare, UserPlus } from 'lucide-react';
import { DashboardFilters } from '@/types/reports';
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
import {
  getHeadlineStats,
  getEfficiency,
  getQuality,
  getStageStats,
  getPositions,
  getCandidates,
  getTrendData
} from '@/lib/mockReportsData';
import { Position } from '@/types/reports';

export default function Reports() {
  const [filters, setFilters] = useState<DashboardFilters>({ dateRange: '30d' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'position' | 'efficiency' | 'quality'>('position');
  const [selectedPosition, setSelectedPosition] = useState<Position>();

  const headlineStats = getHeadlineStats();
  const efficiency = getEfficiency();
  const quality = getQuality();
  const stageStats = getStageStats();
  const positions = getPositions();
  const candidates = getCandidates();
  const trendData = getTrendData();

  const handleExportCSV = () => {
    const csvContent = [
      ['ตำแหน่ง', 'แผนก', 'ผู้สมัครทั้งหมด', 'สัมภาษณ์แล้ว', 'ผ่าน', 'ไม่ผ่าน', 'สถานะ'],
      ...positions.map(p => [p.title, p.department, p.applicants, p.interviewed, p.passed, p.failed, p.status])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `recruitment-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleViewDetails = (position: Position) => {
    setSelectedPosition(position);
    setDrawerType('position');
    setDrawerOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            ภาพรวมการรับสมัคร คัดเลือก และสัมภาษณ์งาน
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="ผู้สมัครทั้งหมด"
          value={headlineStats.applicants.current.toLocaleString()}
          mom={headlineStats.applicants.mom}
          icon={<Users className="h-6 w-6 text-primary" />}
          tooltip="จำนวนผู้สมัครทั้งหมด"
        />
        <StatCard
          title="ตำแหน่งเปิดรับ"
          value={headlineStats.openRoles.current}
          mom={headlineStats.openRoles.mom}
          icon={<Briefcase className="h-6 w-6 text-primary" />}
          tooltip="จำนวนตำแหน่งที่เปิดรับสมัคร"
        />
        <StatCard
          title="อัตราจ้างงาน"
          value={`${(headlineStats.hiringRate.current * 100).toFixed(0)}%`}
          mom={headlineStats.hiringRate.mom}
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          tooltip="Hired / Offers"
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecruitmentFunnel data={stageStats} />
        <TrendChart data={trendData} />
        <StatusDonut data={stageStats} />
        <DepartmentBarChart positions={positions} />
      </div>

      {/* Position Table */}
      <PositionTable positions={positions} onViewDetails={handleViewDetails} />

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

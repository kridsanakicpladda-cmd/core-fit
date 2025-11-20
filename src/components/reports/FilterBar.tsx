import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { DashboardFilters } from '@/types/reports';

interface FilterBarProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select
        value={filters.dateRange || '30d'}
        onValueChange={(value) => onFilterChange({ ...filters, dateRange: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="ช่วงเวลา" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7 วันล่าสุด</SelectItem>
          <SelectItem value="30d">30 วันล่าสุด</SelectItem>
          <SelectItem value="90d">90 วันล่าสุด</SelectItem>
          <SelectItem value="1y">1 ปีล่าสุด</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.department}
        onValueChange={(value) => onFilterChange({ ...filters, department: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="แผนก" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกแผนก</SelectItem>
          <SelectItem value="วิศวกรรม">วิศวกรรม</SelectItem>
          <SelectItem value="ผลิตภัณฑ์">ผลิตภัณฑ์</SelectItem>
          <SelectItem value="ออกแบบ">ออกแบบ</SelectItem>
          <SelectItem value="การตลาด">การตลาด</SelectItem>
          <SelectItem value="วิเคราะห์ข้อมูล">วิเคราะห์ข้อมูล</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.stage}
        onValueChange={(value) => onFilterChange({ ...filters, stage: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="ขั้นตอน" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกขั้นตอน</SelectItem>
          <SelectItem value="New">ใหม่</SelectItem>
          <SelectItem value="Screening">คัดกรอง</SelectItem>
          <SelectItem value="Interview">สัมภาษณ์</SelectItem>
          <SelectItem value="Offer">เสนอข้อเสนอ</SelectItem>
          <SelectItem value="Hired">รับเข้าทำงาน</SelectItem>
          <SelectItem value="Rejected">ไม่ผ่าน</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.source}
        onValueChange={(value) => onFilterChange({ ...filters, source: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="แหล่งที่มา" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกแหล่ง</SelectItem>
          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
          <SelectItem value="Website">Website</SelectItem>
          <SelectItem value="Referral">Referral</SelectItem>
          <SelectItem value="Job Board">Job Board</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหา..."
          className="pl-9"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  );
}

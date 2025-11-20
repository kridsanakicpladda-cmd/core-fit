import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Position, Candidate } from '@/types/reports';
import { X, User } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  position?: Position;
  candidates?: Candidate[];
  type?: 'position' | 'efficiency' | 'quality';
}

export function DetailDrawer({ open, onClose, position, candidates = [], type = 'position' }: DetailDrawerProps) {
  const recentCandidates = candidates
    .filter(c => c.positionId === position?.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <DrawerTitle>
                {type === 'position' && position?.title}
                {type === 'efficiency' && 'ประสิทธิภาพการจ้างงาน'}
                {type === 'quality' && 'คุณภาพผู้สมัคร'}
              </DrawerTitle>
              <DrawerDescription>
                {type === 'position' && position?.department}
                {type === 'efficiency' && 'รายละเอียดและแนวโน้ม'}
                {type === 'quality' && 'การวิเคราะห์คุณภาพ'}
              </DrawerDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-6">
          {type === 'position' && position && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</p>
                  <p className="text-2xl font-bold">{position.applicants}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">อัตราความสำเร็จ</p>
                  <p className="text-2xl font-bold">
                    {((position.passed / position.interviewed) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">สัมภาษณ์แล้ว</p>
                  <p className="text-2xl font-bold">{position.interviewed}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">ผ่าน/ไม่ผ่าน</p>
                  <p className="text-2xl font-bold">
                    {position.passed}/{position.failed}
                  </p>
                </div>
              </div>

              {/* Recent Candidates */}
              <div>
                <h4 className="font-semibold mb-4">ผู้สมัครล่าสุด ({recentCandidates.length})</h4>
                <div className="space-y-3">
                  {recentCandidates.map((candidate) => (
                    <div key={candidate.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{candidate.name}</span>
                        </div>
                        <Badge>{candidate.stage}</Badge>
                      </div>
                      {candidate.aiFitScore && (
                        <p className="text-sm text-muted-foreground">
                          AI Fit Score: <span className="font-medium text-foreground">{candidate.aiFitScore}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        อัปเดต: {new Date(candidate.updatedAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === 'efficiency' && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">สูตรการคำนวณ</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Time to Hire = เฉลี่ย(วันที่จ้าง - วันที่สมัคร)</li>
                  <li>• Acceptance Rate = จำนวนที่รับข้อเสนอ / จำนวนข้อเสนอทั้งหมด</li>
                  <li>• Cost per Hire = ค่าใช้จ่ายทั้งหมด / จำนวนที่จ้าง</li>
                </ul>
              </div>
            </div>
          )}

          {type === 'quality' && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">เกี่ยวกับคุณภาพผู้สมัคร</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• AI Fit Score: คะแนนความเหมาะสมจาก AI 0-100</li>
                  <li>• Interview Pass Rate: ผู้ผ่านการสัมภาษณ์ / ผู้สัมภาษณ์ทั้งหมด</li>
                  <li>• HR Satisfaction: คะแนนความพึงพอใจของ HR 0-5</li>
                </ul>
              </div>
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Umbrella, Eye, Users, Gift, Trophy, Activity, TrendingUp, Stethoscope, PiggyBank } from "lucide-react";

export function EmployeeBenefits() {
  const benefits = [
    {
      icon: <Gift className="h-5 w-5" />,
      title: "วันลาพักร้อน 10 วัน/ปี",
      description: "สามารถใช้ได้ตั้งแต่วันเริ่มงาน",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: <Umbrella className="h-5 w-5" />,
      title: "ประกันกลุ่ม",
      description: "ครอบคลุมประกันชีวิต สุขภาพ และอุบัติเหตุ คุ้มครองตั้งแต่วันแรก",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "ทันตกรรม & สายตา",
      description: "สูงสุด 2,000 บาท/ปี",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "ช่วยเหลือครอบครัว",
      description: "เงินช่วยเหลือกรณีครอบครัวพนักงานเสียชีวิต",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "พิธีมงคลสมรส",
      description: "วันลาพิเศษ พร้อมเงินช่วยเหลือ",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: "ค่าคลอดบุตร",
      description: "เงินช่วยเหลือค่าคลอดบุตร",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "สนับสนุนออกกำลังกาย",
      description: "300 บาท/เดือน",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "โบนัสประจำปี",
      description: "พิจารณาตามผลงานและผลประกอบการบริษัท",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: "ตรวจสุขภาพประจำปี",
      description: "ดูแลสุขภาพพนักงานอย่างครบวงจร",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    },
    {
      icon: <PiggyBank className="h-5 w-5" />,
      title: "กองทุนสำรองเลี้ยงชีพ",
      description: "เลือกสะสม 3-15% บริษัทสมทบให้",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Heart className="h-6 w-6 text-primary" />
          สวัสดิการพนักงาน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`${benefit.bgColor} p-5 rounded-xl hover:shadow-md transition-all duration-300 hover-scale border border-border/30 group`}
            >
              <div className="flex items-start gap-3">
                <div className={`${benefit.color} ${benefit.bgColor} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1.5 text-sm">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
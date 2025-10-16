import { Card } from "@/components/ui/card";
import { FileSearch, Brain, Calendar, FileText, Users, Shield } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "AI Resume Screening",
    description: "วิเคราะห์เรซูเม่อัตโนมัติ ดึงข้อมูลสำคัญ และเปรียบเทียบกับ JD อย่างละเอียด รองรับภาษาไทย/อังกฤษ",
    color: "text-primary",
    bg: "bg-primary-light",
  },
  {
    icon: Brain,
    title: "AI Fit Score",
    description: "คำนวณคะแนนความเหมาะสม 0-100 พร้อมเหตุผลประกอบคะแนนที่ตรวจสอบได้ (Explainable AI)",
    color: "text-success",
    bg: "bg-green-50",
  },
  {
    icon: Users,
    title: "AI Matching",
    description: "จัดอันดับผู้สมัครที่เหมาะสมที่สุดต่อแต่ละตำแหน่ง ช่วยให้ตัดสินใจได้เร็วและแม่นยำ",
    color: "text-warning",
    bg: "bg-orange-50",
  },
  {
    icon: Calendar,
    title: "Microsoft 365 Sync",
    description: "นัดสัมภาษณ์และซิงก์ปฏิทินอัตโนมัติ สร้าง Teams meeting link และส่งอีเมลเชิญทันที",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FileText,
    title: "Interview Dashboard",
    description: "ให้คะแนนและคอมเมนต์แบบเรียลไทม์ รวมผลจากหลายผู้สัมภาษณ์อย่างยุติธรรม",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Shield,
    title: "Insight Summary",
    description: "สรุปข้อมูลจากเรซูเม่และการสัมภาษณ์ สร้างรายงาน PDF เพื่อการตัดสินใจอย่างมีหลักฐาน",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            ฟีเจอร์ที่ช่วยให้คุณจ้างคนที่ใช่
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ระบบครบวงจร ตั้งแต่คัดกรองผู้สมัคร ไปจนถึงการตัดสินใจจ้าง ด้วย AI ที่โปร่งใสและตรวจสอบได้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 border-2 hover:border-primary transition-spring hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              <div className={`${feature.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

import jsPDF from "jspdf";
import "jspdf-autotable";

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  position: string;
  source: string;
  aiScore?: number;
  interviews?: {
    hr?: {
      date: string;
      passed: boolean;
      feedback: string;
    };
    manager?: {
      date: string;
      passed: boolean;
      feedback: string;
      total_score?: number;
      scores?: {
        skill_knowledge?: number;
        communication?: number;
        creativity?: number;
        motivation?: number;
        teamwork?: number;
        analytical?: number;
        culture_fit?: number;
      };
    };
    isTeam?: {
      date: string;
      passed: boolean;
      feedback: string;
      total_score?: number;
      scores?: {
        skill_knowledge?: number;
        communication?: number;
        creativity?: number;
        motivation?: number;
        teamwork?: number;
        analytical?: number;
        culture_fit?: number;
      };
    };
  };
}

export const exportCandidateEvaluationPDF = (candidate: CandidateData) => {
  const doc = new jsPDF();
  
  // Use default font that supports basic characters
  doc.setFont("helvetica");

  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(41, 128, 185);
  doc.text("แบบประเมินผลการสัมภาษณ์ผู้สมัครงาน", 105, yPosition, { align: "center" });
  yPosition += 15;

  // Candidate Basic Info
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("ข้อมูลผู้สมัคร", 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const basicInfoData = [
    ["ชื่อ-นามสกุล", candidate.name || "-"],
    ["อีเมล", candidate.email || "-"],
    ["เบอร์โทร", candidate.phone || "-"],
    ["ตำแหน่งที่สมัคร", candidate.position || "-"],
    ["แหล่งที่มา", candidate.source || "-"],
    ["AI Fit Score", candidate.aiScore ? `${candidate.aiScore}%` : "-"],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [],
    body: basicInfoData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 }
    },
    styles: { fontSize: 10 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Pre Screen Interview
  if (candidate.interviews?.hr) {
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Pre Screen", 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const preScreenData = [
      ["วันที่สัมภาษณ์", candidate.interviews.hr.date || "-"],
      ["ผลการสัมภาษณ์", candidate.interviews.hr.passed ? "ผ่าน" : "ไม่ผ่าน"],
      ["Comment", candidate.interviews.hr.feedback || "-"],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [],
      body: preScreenData,
      theme: 'striped',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 }
      },
      styles: { fontSize: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }

  // Combined Interview Evaluation Table (First Interview + Final Interview)
  if (candidate.interviews?.manager || candidate.interviews?.isTeam) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("หัวข้อการประเมินผลการสัมภาษณ์", 14, yPosition);
    yPosition += 10;

    // Interview dates and results summary
    const managerDate = candidate.interviews?.manager?.date || "-";
    const managerScore = candidate.interviews?.manager?.total_score || 0;
    const isTeamDate = candidate.interviews?.isTeam?.date || "-";
    const isTeamScore = candidate.interviews?.isTeam?.total_score || 0;

    const summaryData = [
      ["วันที่สัมภาษณ์", managerDate, isTeamDate],
      ["คะแนนรวม", `${managerScore} / 70`, `${isTeamScore} / 70`],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [["", "First Interview (Manager)", "Final Interview (IS)"]],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185], 
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 60, halign: 'center' },
        2: { cellWidth: 60, halign: 'center' }
      },
      styles: { fontSize: 9 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Combined evaluation scores table
    const managerScores = candidate.interviews?.manager?.scores;
    const isTeamScores = candidate.interviews?.isTeam?.scores;

    const evaluationData = [
      [
        "1. ทักษะและความรู้ในงาน – มีความรู้ ทักษะ และประสบการณ์ ตรงกับตำแหน่ง",
        managerScores?.skill_knowledge?.toString() || "-",
        isTeamScores?.skill_knowledge?.toString() || "-"
      ],
      [
        "2. การสื่อสาร – พูดชัดเจน น้ำใจง่าย ตอบคำถามตรงประเด็น",
        managerScores?.communication?.toString() || "-",
        isTeamScores?.communication?.toString() || "-"
      ],
      [
        "3. บุคลิกภาพและความมั่นใจ – ดูน่าเชื่อถือ มั่นใจในตัวเอง และเป็นมิตร",
        managerScores?.creativity?.toString() || "-",
        isTeamScores?.creativity?.toString() || "-"
      ],
      [
        "4. ทัศนคติและแรงจูงใจ – แสดงความสนใจและตั้งใจอยากทำงานจริง ๆ",
        managerScores?.motivation?.toString() || "-",
        isTeamScores?.motivation?.toString() || "-"
      ],
      [
        "5. การทำงานร่วมกับคนอื่น – พร้อมร่วมงานกับผู้อื่น เปิดใจและมี Teamwork",
        managerScores?.teamwork?.toString() || "-",
        isTeamScores?.teamwork?.toString() || "-"
      ],
      [
        "6. การคิดวิเคราะห์และแก้ปัญหา – มีวิธีคิดเป็นระบบ รับมือกับสถานการณ์ได้ดี",
        managerScores?.analytical?.toString() || "-",
        isTeamScores?.analytical?.toString() || "-"
      ],
      [
        "7. วัฒนธรรมองค์กร – มีทัศนคติและพฤติกรรมที่เข้ากับค่านิยมขององค์กร",
        managerScores?.culture_fit?.toString() || "-",
        isTeamScores?.culture_fit?.toString() || "-"
      ],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [["หัวข้อการประเมินผลการสัมภาษณ์", "ตีนสังกัด\nสัมภาษณ์ครั้งที่ 1", "ตีนสังกัด\nสัมภาษณ์ครั้งที่ 2"]],
      body: evaluationData,
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 153], 
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 100, fontSize: 8 },
        1: { cellWidth: 40, halign: 'center', fontSize: 9 },
        2: { cellWidth: 40, halign: 'center', fontSize: 9 }
      },
      bodyStyles: {
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;

    // Summary row with pass/fail criteria
    const summaryText = "รวมคะแนน\n[ เกณฑ์คะแนน  ≥ 50 ผ่านเกณฑ์รับเข้าทำงาน, 45-49 สำรองไว้พิจารณา, < 45 ไม่ผ่านการสัมภาษณ์ ]";
    
    const finalSummaryData = [
      [summaryText, `${managerScore} / 70`, `${isTeamScore} / 70`]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [],
      body: finalSummaryData,
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold', fontSize: 8 },
        1: { cellWidth: 40, halign: 'center', fontStyle: 'bold', fontSize: 10, fillColor: [255, 255, 200] },
        2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', fontSize: 10, fillColor: [255, 255, 200] }
      },
      bodyStyles: {
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      styles: { },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // Comments section
    if (candidate.interviews?.manager?.feedback || candidate.interviews?.isTeam?.feedback) {
      // Check if we need a new page for comments
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text("ความคิดเห็นเพิ่มเติมของผู้สัมภาษณ์", 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      if (candidate.interviews?.manager?.feedback) {
        doc.setFont("helvetica", "bold");
        doc.text("First Interview (Manager):", 14, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition += 6;
        const splitManagerFeedback = doc.splitTextToSize(candidate.interviews.manager.feedback, 180);
        doc.text(splitManagerFeedback, 14, yPosition);
        yPosition += splitManagerFeedback.length * 5 + 8;
      }

      if (candidate.interviews?.isTeam?.feedback) {
        doc.setFont("helvetica", "bold");
        doc.text("Final Interview (IS):", 14, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition += 6;
        const splitISFeedback = doc.splitTextToSize(candidate.interviews.isTeam.feedback, 180);
        doc.text(splitISFeedback, 14, yPosition);
      }
    }
  }

  // Save the PDF
  const fileName = `Evaluation_${candidate.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

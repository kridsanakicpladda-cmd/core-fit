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
  
  // Add Thai font support
  doc.addFont("https://fonts.gstatic.com/s/sarabun/v13/DtVmJx26TKEr37c9YHZJmnYI5gnOpg.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");

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
    styles: { font: 'Sarabun', fontSize: 10 },
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
      styles: { font: 'Sarabun', fontSize: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }

  // First Interview (Manager)
  if (candidate.interviews?.manager) {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("First Interview (Manager)", 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const managerBasicData = [
      ["วันที่สัมภาษณ์", candidate.interviews.manager.date || "-"],
      ["คะแนนรวม", candidate.interviews.manager.total_score ? `${candidate.interviews.manager.total_score} / 70` : "-"],
      ["ผลการสัมภาษณ์", candidate.interviews.manager.passed ? "ผ่าน" : "ไม่ผ่าน"],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [],
      body: managerBasicData,
      theme: 'striped',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 }
      },
      styles: { font: 'Sarabun', fontSize: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;

    // Evaluation Scores
    if (candidate.interviews.manager.scores) {
      const scores = candidate.interviews.manager.scores;
      const evaluationData = [
        ["ทักษะและความรู้ในงาน", scores.skill_knowledge?.toString() || "-"],
        ["การสื่อสาร", scores.communication?.toString() || "-"],
        ["ความคิดสร้างสรรค์", scores.creativity?.toString() || "-"],
        ["แรงจูงใจ", scores.motivation?.toString() || "-"],
        ["การทำงานร่วมกับคนอื่น", scores.teamwork?.toString() || "-"],
        ["การคิดวิเคราะห์และแก้ปัญหา", scores.analytical?.toString() || "-"],
        ["วัฒนธรรมองค์กร", scores.culture_fit?.toString() || "-"],
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [["หัวข้อการประเมิน", "คะแนน (1-10)"]],
        body: evaluationData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 130 },
          1: { cellWidth: 50, halign: 'center' }
        },
        styles: { font: 'Sarabun', fontSize: 10 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;
    }

    // Comment
    if (candidate.interviews.manager.feedback) {
      doc.setFontSize(10);
      doc.text("Comment:", 14, yPosition);
      yPosition += 6;
      const splitFeedback = doc.splitTextToSize(candidate.interviews.manager.feedback, 180);
      doc.text(splitFeedback, 14, yPosition);
      yPosition += splitFeedback.length * 5 + 12;
    }
  }

  // Final Interview (IS)
  if (candidate.interviews?.isTeam) {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text("Final Interview (IS)", 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const isTeamBasicData = [
      ["วันที่สัมภาษณ์", candidate.interviews.isTeam.date || "-"],
      ["คะแนนรวม", candidate.interviews.isTeam.total_score ? `${candidate.interviews.isTeam.total_score} / 70` : "-"],
      ["ผลการสัมภาษณ์", candidate.interviews.isTeam.passed ? "ผ่าน" : "ไม่ผ่าน"],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [],
      body: isTeamBasicData,
      theme: 'striped',
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 }
      },
      styles: { font: 'Sarabun', fontSize: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;

    // Evaluation Scores
    if (candidate.interviews.isTeam.scores) {
      const scores = candidate.interviews.isTeam.scores;
      const evaluationData = [
        ["ทักษะและความรู้ในงาน", scores.skill_knowledge?.toString() || "-"],
        ["การสื่อสาร", scores.communication?.toString() || "-"],
        ["ความคิดสร้างสรรค์", scores.creativity?.toString() || "-"],
        ["แรงจูงใจ", scores.motivation?.toString() || "-"],
        ["การทำงานร่วมกับคนอื่น", scores.teamwork?.toString() || "-"],
        ["การคิดวิเคราะห์และแก้ปัญหา", scores.analytical?.toString() || "-"],
        ["วัฒนธรรมองค์กร", scores.culture_fit?.toString() || "-"],
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [["หัวข้อการประเมิน", "คะแนน (1-10)"]],
        body: evaluationData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 130 },
          1: { cellWidth: 50, halign: 'center' }
        },
        styles: { font: 'Sarabun', fontSize: 10 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 8;
    }

    // Comment
    if (candidate.interviews.isTeam.feedback) {
      doc.setFontSize(10);
      doc.text("Comment:", 14, yPosition);
      yPosition += 6;
      const splitFeedback = doc.splitTextToSize(candidate.interviews.isTeam.feedback, 180);
      doc.text(splitFeedback, 14, yPosition);
    }
  }

  // Save the PDF
  const fileName = `Evaluation_${candidate.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import icpLogo from '@/assets/logo.png';

export interface RequisitionFormPDFData {
  department: string;
  position: string;
  quantity: string;
  date_needed: string;
  work_location: string;
  reports_to: string;
  hiring_type: 'replacement' | 'permanent' | 'temporary';
  replacement_for: string;
  replacement_date: string;
  temporary_duration: string;
  justification: string;
  job_description_no: string;
  job_duties: string;
  gender: string;
  max_age: string;
  min_experience: string;
  min_education: string;
  field_of_study: string;
  other_skills: string;
  marital_status: string;
  experience_in: string;
}

export interface CurrentPositionRow {
  position: string;
  count: string;
}

const formatThaiDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const month = thaiMonths[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;
  return `${day} ${month} ${buddhistYear}`;
};

const dot = (text: string, minW: string = '150px') =>
  `<span style="display:inline-block;min-width:${minW};border-bottom:1px dotted #000;padding:0 4px;text-align:center;">${text || '&nbsp;'}</span>`;

const chk = (checked: boolean) =>
  checked
    ? `<span style="display:inline-block;width:13px;height:13px;background:#000;border:1.5px solid #000;vertical-align:middle;margin-right:4px;"></span>`
    : `<span style="display:inline-block;width:13px;height:13px;border:1.5px solid #000;vertical-align:middle;margin-right:4px;"></span>`;

const buildFormHTML = (
  formData: RequisitionFormPDFData,
  currentPositions: CurrentPositionRow[],
  requisitionNumber: string,
  requesterName?: string,
): string => {
  const positions = [...currentPositions];
  while (positions.length < 3) positions.push({ position: '', count: '' });

  const totalEmployees = positions.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
  const todayDate = formatThaiDate(new Date().toISOString().split('T')[0]);

  const isReplacement = formData.hiring_type === 'replacement';
  const isPermanent = formData.hiring_type === 'permanent';
  const isTemporary = formData.hiring_type === 'temporary';

  return `
<div style="width:780px;font-family:'Prompt','Sarabun','Angsana New',sans-serif;font-size:13px;color:#000;background:#fff;box-sizing:border-box;line-height:1.6;">
  <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:2px solid #000;">
    <!-- ===== Company Header ===== -->
    <tr>
      <td colspan="3" style="border-bottom:1.5px solid #000;padding:8px 15px;">
        <table style="width:100%;border:none;border-collapse:collapse;">
          <tr>
            <td style="width:90px;vertical-align:middle;">
              <img src="${icpLogo}" style="height:45px;width:auto;" crossorigin="anonymous" />
            </td>
            <td style="vertical-align:middle;padding-left:4px;">
              <span style="font-size:9px;color:#555;">บริษัท ไอ ซี พี ลัดดา จำกัด</span>
            </td>
            <td style="text-align:center;vertical-align:middle;">
              <div style="font-size:16px;font-weight:bold;">บริษัท ไอ ซี พี ลัดดา จำกัด</div>
              <div style="font-size:11px;">42 อาคาร ไอ ซี พี ชั้น 5 ถนนสุรวงศ์ สี่พระยา บางรัก กรุงเทพฯ 10500</div>
              <div style="font-size:11px;">โทรศัพท์ (662) 029-9888 โทรสาร (662) 029-9886-7</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ===== Form Info Row ===== -->
    <tr>
      <td style="width:20%;border:1px solid #000;padding:6px 8px;font-size:11px;vertical-align:top;">
        <div>รหัสแบบฟอร์ม:</div>
        <div style="font-weight:bold;">FM-HRM-01-01</div>
      </td>
      <td style="width:45%;border:1px solid #000;padding:8px;text-align:center;vertical-align:middle;">
        <div style="font-size:15px;font-weight:bold;">แบบขออนุมัติการจ้างงาน</div>
        <div style="font-size:12px;">Requisition Form</div>
      </td>
      <td style="width:35%;border:1px solid #000;padding:6px 8px;font-size:10px;vertical-align:top;">
        <div>เริ่มใช้วันที่ 11 พฤศจิกายน 2551</div>
        <div>ปรับปรุงครั้งที่...02...เมื่อ..1 เมษายน 2560...</div>
      </td>
    </tr>

    <!-- ===== Main Content ===== -->
    <tr>
      <td colspan="3" style="padding:12px 18px;">

        <!-- Department & Position Info (2 columns) -->
        <table style="width:100%;border:none;border-collapse:collapse;">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:15px;">
              <div style="margin-bottom:6px;">ฝ่าย ${dot(formData.department, '280px')}</div>
              <div style="margin-bottom:4px;">ปัจจุบันมีพนักงานในฝ่าย${dot(totalEmployees > 0 ? totalEmployees.toString() : '', '40px')}คน ประกอบด้วย</div>
              ${positions.slice(0, 3).map(p => `
                <div style="margin-bottom:3px;">ตำแหน่ง${dot(p.position, '160px')}จำนวน ${dot(p.count, '35px')}คน</div>
              `).join('')}
            </td>
            <td style="width:50%;vertical-align:top;">
              <div style="margin-bottom:6px;">ตำแหน่งงานที่ต้องการ${dot(formData.position, '210px')}</div>
              <div style="margin-bottom:6px;">จำนวนที่ต้องการ${dot(formData.quantity, '60px')}อัตรา</div>
              <div style="margin-bottom:6px;">วันที่ต้องการ${dot(formatThaiDate(formData.date_needed), '230px')}</div>
              <div style="margin-bottom:6px;">สถานที่ทำงาน${dot(formData.work_location, '240px')}</div>
              <div style="margin-bottom:6px;">รายงานโดยตรงต่อ${dot(formData.reports_to, '220px')}</div>
            </td>
          </tr>
        </table>

        <!-- Hiring Type -->
        <div style="margin-top:10px;">
          <div style="font-weight:bold;margin-bottom:6px;">ประเภท / เหตุผลของการจ้าง</div>
          <div style="margin-bottom:5px;margin-left:15px;">
            ${chk(isReplacement)} ตำแหน่งทดแทน (ระบุทดแทนใคร)${dot(isReplacement ? formData.replacement_for : '', '180px')}วันที่ออก${dot(isReplacement ? formatThaiDate(formData.replacement_date) : '', '140px')}
          </div>
          <div style="margin-bottom:5px;margin-left:15px;">
            ${chk(isPermanent)} ตำแหน่งประจำที่ขอเพิ่ม
          </div>
          <div style="margin-bottom:5px;margin-left:15px;">
            ${chk(isTemporary)} ตำแหน่งชั่วคราว ระยะเวลาการจ้าง${dot(isTemporary ? formData.temporary_duration : '', '80px')}เดือน${dot('', '50px')}ปี
          </div>
        </div>

        <!-- Justification -->
        <div style="margin-top:8px;">
          <div style="margin-bottom:4px;">เหตุผลในการขอเพิ่ม ${dot(formData.justification, '540px')}</div>
          <div style="margin-bottom:4px;">${dot(formData.job_duties || '', '690px')}</div>
        </div>

        <!-- Job Description No -->
        <div style="margin-top:8px;margin-bottom:10px;">
          ตำแหน่งนี้มีหน้าที่โดยสังเขปตาม Job Description No${dot(formData.job_description_no, '130px')} (หากยังไม่มี Job Description กรุณาจัดทำและแนบมาด้วย)
        </div>

        <!-- Qualifications -->
        <div style="margin-top:6px;">
          <div style="font-weight:bold;margin-bottom:6px;">คุณสมบัติเบื้องต้น</div>
          <table style="width:100%;border:none;border-collapse:collapse;">
            <tr>
              <td style="width:50%;vertical-align:top;">
                <div style="margin-bottom:5px;">เพศ ${dot(formData.gender, '80px')} อายุไม่เกิน ${dot(formData.max_age, '35px')} ปี</div>
                <div style="margin-bottom:5px;">วุฒิการศึกษาขั้นต่ำ${dot(formData.min_education, '200px')}</div>
                <div style="margin-bottom:5px;">สาขาวิชา ${dot(formData.field_of_study, '230px')}</div>
                <div style="margin-bottom:5px;">สถานะสมรส ${dot(formData.marital_status, '220px')}</div>
                <div style="margin-bottom:5px;">ประสบการณ์ด้าน${dot(formData.experience_in, '210px')}</div>
              </td>
              <td style="width:50%;vertical-align:top;">
                <div style="margin-bottom:5px;">ประสบการณ์ขั้นต่ำ${dot(formData.min_experience, '80px')}ปี</div>
                <div style="margin-bottom:5px;">ความสามารถ / ความชำนาญอย่างอื่น (ภาษาต่างประเทศ</div>
                <div style="margin-bottom:5px;">คอมพิวเตอร์ พิมพ์ดีด มีรถยนต์ ทำงานต่างจังหวัดได้ ฯลฯ)</div>
                <div style="margin-bottom:5px;">${dot(formData.other_skills, '300px')}</div>
                <div style="margin-bottom:5px;">${dot('', '300px')}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Requester Signature -->
        <div style="margin-top:14px;margin-bottom:8px;">
          ลงชื่อ${dot(requesterName || '', '200px')}ผู้ขอ ตำแหน่ง${dot('', '170px')} วันที่${dot(todayDate, '150px')}
        </div>

        <!-- Manager Approval Section -->
        <div style="border-top:1.5px solid #000;padding-top:8px;margin-top:5px;">
          <div style="text-align:center;font-weight:bold;margin-bottom:8px;">พิจารณาและรับทราบโดยผู้บังคับบัญชาตามสายงาน</div>
          <div style="margin-bottom:3px;">ลงชื่อ${dot('', '200px')}ผู้จัดการ/ผู้บังคับบัญชาสูงสุดในฝ่าย</div>
          <div style="margin-left:38px;margin-bottom:3px;">( ${dot('', '200px')} )</div>
          <div style="margin-bottom:8px;">วันที่${dot('', '200px')}</div>
        </div>

        <!-- HR Opinion & CEO Decision (2 columns) -->
        <table style="width:100%;border:none;border-collapse:collapse;border-top:1.5px solid #000;">
          <tr>
            <td style="width:50%;vertical-align:top;padding:8px 12px 8px 0;border-right:1px solid #000;">
              <div style="font-weight:bold;margin-bottom:6px;">ความเห็นของฝ่ายทรัพยากรบุคคล</div>
              <div style="margin-bottom:4px;">${chk(false)} มีในแผนกำลังคน &nbsp;&nbsp; ${chk(false)} ไม่มีในแผนกำลังคน</div>
              <div style="margin-bottom:4px;">ความเห็นเพิ่มเติม${dot('', '210px')}</div>
              <div style="margin-bottom:4px;">${dot('', '310px')}</div>
              <div style="margin-top:12px;">ลงชื่อ ${dot('', '140px')}ผู้จัดการฝ่าย</div>
              <div style="margin-left:38px;">( ${dot('', '140px')} )</div>
            </td>
            <td style="width:50%;vertical-align:top;padding:8px 0 8px 12px;">
              <div style="font-weight:bold;margin-bottom:6px;">คำสั่งของรองกรรมการผู้จัดการ / กรรมการผู้จัดการ</div>
              <div style="margin-bottom:4px;">${chk(false)} อนุมัติ</div>
              <div style="margin-bottom:4px;">${chk(false)} ไม่อนุมัติ เพราะ${dot('', '190px')}</div>
              <div style="margin-bottom:4px;">${dot('', '310px')}</div>
              <div style="margin-top:12px;">ผู้อนุมัติ${dot('', '200px')}</div>
              <div style="margin-left:38px;">( ${dot('', '200px')} )</div>
            </td>
          </tr>
        </table>

        <!-- HR Only Section -->
        <div style="border-top:2px solid #000;padding-top:6px;margin-top:4px;">
          <div style="font-weight:bold;margin-bottom:4px;">สำหรับแผนกทรัพยากรมนุษย์กรอก</div>
          <div>วันที่จ้างงานได้: ${dot('', '180px')} ชื่อของพนักงานที่ว่าจ้าง${dot('', '230px')}</div>
        </div>

      </td>
    </tr>
  </table>
  <div style="text-align:right;font-size:10px;margin-top:2px;padding-right:5px;">หน้า 1</div>
</div>`;
};

export const generateRequisitionFormPDF = async (
  formData: RequisitionFormPDFData,
  currentPositions: CurrentPositionRow[],
  requisitionNumber: string,
  requesterName?: string,
): Promise<void> => {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  container.innerHTML = buildFormHTML(formData, currentPositions, requisitionNumber, requesterName);
  document.body.appendChild(container);

  // Wait for all images to load
  const images = container.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        }),
    ),
  );

  try {
    const element = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight - 10) {
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 5, 5, imgWidth, imgHeight);
    } else {
      const scale = (pdfHeight - 10) / imgHeight;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 5, 5, imgWidth * scale, pdfHeight - 10);
    }

    pdf.save(`FM-HRM-01-01-${requisitionNumber}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};

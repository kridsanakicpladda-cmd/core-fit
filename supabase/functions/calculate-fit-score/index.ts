import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Education {
  level: string;
  institution: string;
  major: string;
  gpa: string;
  yearGraduated: string;
}

interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  salary: string;
  responsibilities: string;
  reason: string;
}

interface LanguageSkill {
  language: string;
  spoken: string;
  written: string;
  understand: string;
}

// Function to extract text from PDF using AI vision
async function extractTextFromPDF(pdfUrl: string, apiKey: string): Promise<string> {
  try {
    console.log('Fetching PDF from:', pdfUrl);

    // Fetch the PDF file
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      console.error('Failed to fetch PDF:', pdfResponse.status);
      return '';
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    console.log('PDF fetched, size:', pdfBuffer.byteLength, 'bytes');

    // Use AI to extract text from PDF
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://talent-x-ray.app',
        'X-Title': 'Resume PDF Parser',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro-preview-06-05',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `กรุณาอ่านและสรุปข้อมูลจาก Resume/CV นี้เป็นภาษาไทย รวมถึง:
1. ชื่อ-นามสกุล
2. ข้อมูลติดต่อ (อีเมล, เบอร์โทร)
3. ประวัติการศึกษา (ระดับการศึกษา, สถาบัน, สาขา, GPA)
4. ประสบการณ์ทำงาน (บริษัท, ตำแหน่ง, ระยะเวลา, หน้าที่)
5. ทักษะและความสามารถ
6. ใบอนุญาต/ใบรับรอง (ถ้ามี)
7. ข้อมูลอื่นๆ ที่เกี่ยวข้อง

กรุณาตอบเป็นข้อความสรุปที่อ่านง่าย`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64PDF}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI PDF parsing failed:', await response.text());
      return '';
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';
    console.log('Extracted text length:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { candidateData, jobData, candidateDetails } = await req.json();

    console.log('Calculating AI Fit Score...');
    console.log('Candidate:', candidateData?.name);
    console.log('Job:', jobData?.title);

    // Extract text from PDF resume if URL provided
    let resumeText = candidateData?.resume_text || '';
    if (candidateData?.resume_url && candidateData.resume_url.startsWith('http')) {
      console.log('Extracting text from PDF resume...');
      const pdfText = await extractTextFromPDF(candidateData.resume_url, openAIApiKey || '');
      if (pdfText) {
        resumeText = pdfText;
        console.log('PDF text extracted successfully');
      }
    }

    // Format education data
    let educationSummary = 'ไม่ระบุ';
    if (candidateDetails?.educations && Array.isArray(candidateDetails.educations)) {
      const educations = candidateDetails.educations as Education[];
      const filledEducations = educations.filter(e => e.institution || e.major);
      if (filledEducations.length > 0) {
        educationSummary = filledEducations.map(e => {
          const levelMap: Record<string, string> = {
            'high-school': 'มัธยมศึกษา',
            'diploma': 'อนุปริญญา/ปวส.',
            'bachelor': 'ปริญญาตรี',
            'master': 'ปริญญาโท',
            'others': 'อื่นๆ'
          };
          return `${levelMap[e.level] || e.level}: ${e.institution || ''} สาขา ${e.major || ''} ${e.gpa ? `GPA: ${e.gpa}` : ''} ${e.yearGraduated ? `ปีที่จบ: ${e.yearGraduated}` : ''}`.trim();
        }).join('\n');
      }
    }

    // Format work experience data
    let experienceSummary = 'ไม่ระบุ';
    let totalExperienceYears = 0;
    if (candidateDetails?.work_experiences && Array.isArray(candidateDetails.work_experiences)) {
      const experiences = candidateDetails.work_experiences as WorkExperience[];
      const filledExperiences = experiences.filter(e => e.company || e.position);
      if (filledExperiences.length > 0) {
        experienceSummary = filledExperiences.map(e => {
          // Try to extract years from duration
          const durationMatch = e.duration?.match(/(\d+)/);
          if (durationMatch) {
            totalExperienceYears += parseInt(durationMatch[1]);
          }
          return `${e.position || ''} ที่ ${e.company || ''} (${e.duration || ''}) - ${e.responsibilities || ''}`;
        }).join('\n');
      }
    }

    // Format language skills
    let languageSummary = 'ไม่ระบุ';
    if (candidateDetails?.language_skills && Array.isArray(candidateDetails.language_skills)) {
      const languages = candidateDetails.language_skills as LanguageSkill[];
      const filledLanguages = languages.filter(l => l.language);
      if (filledLanguages.length > 0) {
        const levelMap: Record<string, string> = {
          'excellent': 'ดีมาก',
          'good': 'ดี',
          'fair': 'พอใช้',
          'no': 'ไม่ได้'
        };
        languageSummary = filledLanguages.map(l =>
          `${l.language}: พูด-${levelMap[l.spoken] || l.spoken || 'ไม่ระบุ'}, เขียน-${levelMap[l.written] || l.written || 'ไม่ระบุ'}, เข้าใจ-${levelMap[l.understand] || l.understand || 'ไม่ระบุ'}`
        ).join('\n');
      }
    }

    // Format other skills
    let otherSkills = candidateDetails?.other_skills || 'ไม่ระบุ';
    if (candidateDetails?.computer_skill) otherSkills += ', คอมพิวเตอร์';
    if (candidateDetails?.driving_car) otherSkills += ', ขับรถยนต์';
    if (candidateDetails?.driving_motorcycle) otherSkills += ', ขับจักรยานยนต์';

    // Build comprehensive prompt
    const prompt = `คุณเป็นผู้เชี่ยวชาญด้าน HR และการจับคู่ผู้สมัครงานกับตำแหน่งงาน กรุณาวิเคราะห์และให้คะแนนความเหมาะสม (0-100) ระหว่างผู้สมัครและตำแหน่งงาน

## เกณฑ์การให้คะแนน:
1. **ประสบการณ์ทำงานที่ตรงกับตำแหน่งงาน (65%)**
   - ตำแหน่งงานเดิมตรงหรือใกล้เคียงกับตำแหน่งที่สมัคร (30%)
   - จำนวนปีประสบการณ์เพียงพอ (35%)
2. **คุณสมบัติและความสามารถ (10%)**
   - ทักษะที่ระบุตรงกับความต้องการ
   - ทักษะภาษา ทักษะคอมพิวเตอร์
3. **วุฒิการศึกษา (10%)**
   - ระดับการศึกษาตรงตามที่กำหนด
   - สาขาที่เรียนเกี่ยวข้อง
4. **ทักษะเสริมอื่นๆ (15%)**
   - ใบอนุญาตขับขี่ (ถ้าจำเป็น)
   - ทักษะพิเศษอื่นๆ

---

## ข้อมูลตำแหน่งงาน:
- **ตำแหน่ง:** ${jobData.title || 'ไม่ระบุ'}
- **แผนก:** ${jobData.department || 'ไม่ระบุ'}
- **สถานที่ทำงาน:** ${jobData.location || 'ไม่ระบุ'}
- **ประเภทการจ้าง:** ${jobData.employment_type || 'Full-time'}
- **คุณสมบัติที่ต้องการ:**
${jobData.requirements || 'ไม่ระบุ'}
- **หน้าที่รับผิดชอบ:**
${jobData.responsibilities || 'ไม่ระบุ'}
- **Job Grade:** ${jobData.job_grade || 'ไม่ระบุ'}

---

## ข้อมูลผู้สมัคร:
- **ชื่อ:** ${candidateData.name || 'ไม่ระบุ'}
- **ตำแหน่งที่สมัคร:** ${candidateDetails?.position || 'ไม่ระบุ'}
- **เงินเดือนที่คาดหวัง:** ${candidateDetails?.expected_salary || 'ไม่ระบุ'} บาท

### ประวัติการศึกษา:
${educationSummary}

### ประสบการณ์ทำงาน (รวมประมาณ ${totalExperienceYears} ปี):
${experienceSummary}

### ทักษะภาษา:
${languageSummary}

### ทักษะอื่นๆ:
${otherSkills}

### Resume/ประวัติเพิ่มเติม:
${candidateData.resume_text || 'ไม่มีข้อมูลเพิ่มเติม'}

---

## กรุณาวิเคราะห์และตอบเป็น JSON format เท่านั้น:
\`\`\`json
{
  "score": <คะแนนรวม 0-100>,
  "reasoning": "<สรุปเหตุผลสั้นๆ 2-3 ประโยคภาษาไทย>",
  "breakdown": {
    "experience": <คะแนนประสบการณ์ 0-65>,
    "qualifications": <คะแนนคุณสมบัติ 0-10>,
    "education": <คะแนนการศึกษา 0-10>,
    "skills": <คะแนนทักษะเสริม 0-15>
  },
  "strengths": ["<จุดแข็ง 1>", "<จุดแข็ง 2>"],
  "concerns": ["<จุดที่ต้องพิจารณา 1>", "<จุดที่ต้องพิจารณา 2>"],
  "recommendation": "<คำแนะนำสำหรับ HR>"
}
\`\`\``;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://talent-x-ray.app',
        'X-Title': 'AI Fit Score Calculator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro-preview-06-05',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in candidate-job matching. Always respond with valid JSON only, no additional text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`AI API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Parse the AI response
    let result;
    try {
      const content = data.choices[0].message.content;
      // Clean up the response - remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', data.choices[0].message.content);

      // Fallback score
      result = {
        score: 50,
        reasoning: 'ไม่สามารถวิเคราะห์ได้ กรุณาตรวจสอบข้อมูลผู้สมัคร',
        breakdown: {
          experience: 32,
          qualifications: 5,
          education: 5,
          skills: 8
        },
        strengths: [],
        concerns: ['ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์'],
        recommendation: 'กรุณาตรวจสอบข้อมูลผู้สมัครเพิ่มเติม'
      };
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in calculate-fit-score:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

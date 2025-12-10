import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fix Thai sara am (ำ) encoding issues
function fixThaiText(text: string | undefined | null): string {
  if (!text) return '';
  
  // Common Thai words that get corrupted with sara am
  const corrections: Record<string, string> = {
    'งำน': 'งาน',
    'ขำย': 'ขาย',
    'วำงแผน': 'วางแผน',
    'ติดตำม': 'ติดตาม',
    'บริหำร': 'บริหาร',
    'ทำงำน': 'ทำงาน',
    'กำร': 'การ',
    'ช่องทำง': 'ช่องทาง',
    'จัดจำหน่ำย': 'จัดจำหน่าย',
    'ประสิทธิภำพ': 'ประสิทธิภาพ',
    'มูลค่ำ': 'มูลค่า',
    'กระบวนกำร': 'กระบวนการ',
    'เป้ำหมำย': 'เป้าหมาย',
    'ตำแหน่ง': 'ตำแหน่ง',
    'สำนักงำน': 'สำนักงาน',
    'คุณสมบัติ': 'คุณสมบัติ',
    'ควำมสำมำรถ': 'ความสามารถ',
    'ประสบกำรณ์': 'ประสบการณ์',
    'กำรศึกษำ': 'การศึกษา',
    'ทักษะ': 'ทักษะ',
    'พัฒนำ': 'พัฒนา',
    'วิเครำะห์': 'วิเคราะห์',
    'บริษัท': 'บริษัท',
    'ผู้จัดกำร': 'ผู้จัดการ',
  };
  
  let fixed = text;
  
  // Apply corrections
  for (const [wrong, correct] of Object.entries(corrections)) {
    fixed = fixed.replace(new RegExp(wrong, 'g'), correct);
  }
  
  // Fix common pattern: consonant + ำ + vowel should be consonant + า + consonant
  fixed = fixed.replace(/([ก-ฮ])ำ([ก-ฮ])/g, '$1า$2');
  
  return fixed;
}

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  education: string;
  skills: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, fileBase64 } = await req.json();

    if (!resumeText && !fileBase64) {
      throw new Error('Resume text or file base64 is required');
    }

    console.log('Parsing resume with AI OCR...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'Resume Parser',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro-preview-06-05',
        messages: fileBase64 ? [
          {
            role: 'system',
            content: `You are a resume parser for job applications. Use OCR to analyze the provided resume document and extract structured candidate information using the available tools.

CRITICAL THAI LANGUAGE RULES:
- Preserve EXACT Thai spelling and characters as written in the document
- DO NOT separate Thai vowels from consonants (e.g., keep "งาน" not "งำน", "ขาย" not "ขำย")
- Maintain proper Thai orthography and sara am (ำ) placement
- Copy Thai text character-by-character exactly as it appears`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Parse this resume document using OCR and extract the candidate information for the job application form. Read all text from the document image/PDF and extract structured data.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${fileBase64}`
                }
              }
            ]
          },
        ] : [
          {
            role: 'system',
            content: `You are a resume parser for job applications. Analyze the provided resume text and extract structured candidate information using the available tools.

CRITICAL THAI LANGUAGE RULES:
- Preserve EXACT Thai spelling and characters as written in the document
- DO NOT separate Thai vowels from consonants (e.g., keep "งาน" not "งำน", "ขาย" not "ขำย")
- Maintain proper Thai orthography and sara am (ำ) placement
- Copy Thai text character-by-character exactly as it appears`,
          },
          {
            role: 'user',
            content: `Parse this resume and extract the candidate information for the job application form. Resume text:\n\n${resumeText}`,
          },
        ],
        temperature: 0.3,
        tools: [
          {
            type: 'function',
            function: {
              name: 'parse_resume',
              description:
                'Extract structured candidate information from a resume for use in a job application form.',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Full name of the candidate' },
                  email: { type: 'string', description: 'Email address' },
                  phone: { type: 'string', description: 'Primary phone number' },
                  position: {
                    type: 'string',
                    description:
                      'Desired position or main job title this resume is intended for (Thai or English)',
                  },
                  experience: {
                    type: 'string',
                    description:
                      'Short narrative summary of the candidate work experience and responsibilities',
                  },
                  education: {
                    type: 'string',
                    description:
                      'Summary of highest education level, institution, major, year, and GPA if available',
                  },
                  skills: {
                    type: 'array',
                    description: 'List of key skills, tools, and competencies mentioned in the resume',
                    items: { type: 'string' },
                  },
                },
                required: ['name', 'email', 'phone', 'position', 'experience', 'education', 'skills'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'parse_resume' } },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI gateway error:', error);
      throw new Error(`AI gateway error: ${error}`);
    }

    const data = await response.json();

    let parsedData: ParsedResume;

    try {
      const choice = data.choices?.[0];
      const toolCall = choice?.message?.tool_calls?.[0];

      if (toolCall?.function?.arguments) {
        // Preferred path: structured tool calling
        const args = JSON.parse(toolCall.function.arguments);
        parsedData = {
          name: fixThaiText(args.name) || '',
          email: args.email ?? '',
          phone: args.phone ?? '',
          position: fixThaiText(args.position) || '',
          experience: fixThaiText(args.experience) || '',
          education: fixThaiText(args.education) || '',
          skills: Array.isArray(args.skills) ? args.skills.map((s: string) => fixThaiText(s)) : [],
        };
        console.log('Parsed via tool_call (Thai fixed):', parsedData);
      } else {
        // Fallback: try to parse JSON content from message.content like the old implementation
        const content = choice?.message?.content ?? '';
        console.log('AI response (fallback path):', content);

        const cleanedContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          // Remove problematic control characters that break JSON.parse
          .replace(/[\u0000-\u0019]+/g, ' ')
          .trim();

        const rawData = JSON.parse(cleanedContent);
        parsedData = {
          name: fixThaiText(rawData.name) || '',
          email: rawData.email ?? '',
          phone: rawData.phone ?? '',
          position: fixThaiText(rawData.position) || '',
          experience: fixThaiText(rawData.experience) || '',
          education: fixThaiText(rawData.education) || '',
          skills: Array.isArray(rawData.skills) ? rawData.skills.map((s: string) => fixThaiText(s)) : [],
        };
        console.log('Parsed via fallback (Thai fixed):', parsedData);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in parse-resume function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

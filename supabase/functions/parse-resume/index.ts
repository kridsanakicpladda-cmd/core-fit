import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { resumeText } = await req.json();

    if (!resumeText) {
      throw new Error('Resume text is required');
    }

    console.log('Parsing resume with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content:
              'You are a resume parser for job applications. Analyze the provided resume text and extract structured candidate information using the available tools.',
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
          name: args.name ?? '',
          email: args.email ?? '',
          phone: args.phone ?? '',
          position: args.position ?? '',
          experience: args.experience ?? '',
          education: args.education ?? '',
          skills: Array.isArray(args.skills) ? args.skills : [],
        };
        console.log('Parsed via tool_call:', parsedData);
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

        parsedData = JSON.parse(cleanedContent);
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

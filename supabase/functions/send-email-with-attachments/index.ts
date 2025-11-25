import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
const MICROSOFT_CLIENT_SECRET = Deno.env.get('MICROSOFT_CLIENT_SECRET');
const MICROSOFT_TENANT_ID = Deno.env.get('MICROSOFT_TENANT_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Candidate {
  id: string;
  name: string;
  position: string;
  resume_url?: string;
}

interface EmailRequest {
  to: string;
  toName: string;
  department: string;
  candidates: Candidate[];
  positions: string;
}

async function getAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID!,
    client_secret: MICROSOFT_CLIENT_SECRET!,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get access token:', error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function sendEmail(accessToken: string, emailData: EmailRequest, senderEmail: string) {
  const candidatesList = emailData.candidates
    .map((c) => `- ${c.name} (${c.position})`)
    .join('\n');

  const emailBody = `เรียน ${emailData.toName} (${emailData.department})

นำส่ง Resume ของผู้สมัครตำแหน่ง ${emailData.positions} และได้โทร Pre Screen เบื้องต้นแล้ว รบกวนพิจารณา Resume ให้ภายในวันพฤหัสบดี

รายชื่อผู้สมัคร:
${candidatesList}

${emailData.candidates.length > 0 && emailData.candidates[0].resume_url ? 'Resume files ได้แนบไฟล์มาด้วยแล้วค่ะ' : ''}

คลิกที่ลิงก์ด้านล่างเพื่อแจ้งผลพิจารณา:
${Deno.env.get('VITE_SUPABASE_URL') || 'https://your-domain.com'}/candidates

ขอบคุณค่ะ`;

  const message: any = {
    message: {
      subject: `Resume ผู้สมัครตำแหน่ง ${emailData.positions} - รอพิจารณา`,
      body: {
        contentType: 'Text',
        content: emailBody,
      },
      toRecipients: [
        {
          emailAddress: {
            address: emailData.to,
          },
        },
      ],
      attachments: [],
    },
    saveToSentItems: true,
  };

  // Add resume attachments if available
  for (const candidate of emailData.candidates) {
    if (candidate.resume_url) {
      try {
        // Fetch resume file
        const fileResponse = await fetch(candidate.resume_url);
        if (fileResponse.ok) {
          const fileBuffer = await fileResponse.arrayBuffer();
          const base64Content = btoa(
            String.fromCharCode(...new Uint8Array(fileBuffer))
          );
          
          // Extract filename from URL or use default
          const filename = candidate.resume_url.split('/').pop() || `Resume_${candidate.name}.pdf`;

          message.message.attachments.push({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: filename,
            contentType: 'application/pdf',
            contentBytes: base64Content,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch resume for ${candidate.name}:`, error);
      }
    }
  }

  const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;
  
  const response = await fetch(sendMailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return { success: true };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();

    console.log('Sending email to:', emailData.to);
    console.log('Number of candidates:', emailData.candidates.length);

    // Get authenticated user's email from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's profile to find their email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Could not find user profile');
    }

    const senderEmail = profile.email;
    console.log('Sender email:', senderEmail);

    // Get access token
    const accessToken = await getAccessToken();

    // Send email with attachments
    const result = await sendEmail(accessToken, emailData, senderEmail);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-email-with-attachments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

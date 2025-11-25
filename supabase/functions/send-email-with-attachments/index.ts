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
  const candidatesTableRows = emailData.candidates
    .map((c, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${c.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${c.position}</td>
      </tr>
    `)
    .join('');

  const emailBody = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    📋 Resume ผู้สมัครงาน
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                    เรียน <strong style="color: #059669;">${emailData.toName}</strong> (${emailData.department})
                  </p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 15px; color: #6b7280; line-height: 1.8;">
                    นำส่ง Resume ของผู้สมัครตำแหน่ง <strong style="color: #059669;">${emailData.positions}</strong> 
                    และได้โทร Pre Screen เบื้องต้นแล้ว รบกวนพิจารณา Resume ให้ภายในวันพฤหัสบดี
                  </p>
                  
                  <!-- Candidates Table -->
                  <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #111827; font-weight: 600;">
                    รายชื่อผู้สมัคร
                  </h2>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                    <thead>
                      <tr style="background-color: #059669;">
                        <th style="padding: 14px; color: #ffffff; font-weight: 600; text-align: center; width: 60px;">ลำดับ</th>
                        <th style="padding: 14px; color: #ffffff; font-weight: 600; text-align: left;">ชื่อ-นามสกุล</th>
                        <th style="padding: 14px; color: #ffffff; font-weight: 600; text-align: left;">ตำแหน่ง</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${candidatesTableRows}
                    </tbody>
                  </table>
                  
                  ${emailData.candidates.length > 0 && emailData.candidates[0].resume_url ? 
                    '<p style="margin: 0 0 30px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px; font-size: 14px; color: #065f46;">✅ Resume files ได้แนบไฟล์มาด้วยแล้วค่ะ</p>' 
                    : ''
                  }
                  
                  <!-- Action Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://core-fit.lovable.app" 
                           style="display: inline-flex; align-items: center; padding: 16px 30px 16px 30px; background: linear-gradient(135deg, #f0f0ff 0%, #ffffff 100%); color: #7c3aed; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; border: 3px solid #10b981; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); transition: transform 0.2s; gap: 15px;">
                          <span style="flex: 1;">แจ้งผลการพิจารณา</span>
                          <span style="display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #10b981; border-radius: 50%; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </span>
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; font-size: 15px; color: #374151; line-height: 1.6;">
                    ขอบคุณค่ะ
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
                    ระบบจัดการสรรหาบุคลากร | HR Recruitment System
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const message: any = {
    message: {
      subject: `Resume ผู้สมัครตำแหน่ง ${emailData.positions} - รอพิจารณา`,
      body: {
        contentType: 'HTML',
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

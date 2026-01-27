import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
const MICROSOFT_CLIENT_SECRET = Deno.env.get('MICROSOFT_CLIENT_SECRET');
const MICROSOFT_TENANT_ID = Deno.env.get('MICROSOFT_TENANT_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const APP_URL = Deno.env.get('APP_URL') || 'https://core-fit.lovable.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  position?: string;
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

async function sendInviteEmail(accessToken: string, inviteData: InviteRequest, senderEmail: string, applicationUrl: string) {
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
                <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    💼 บริษัทสนใจประวัติของคุณ
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                    เรียน <strong style="color: #db2777;">${inviteData.candidateName}</strong>
                  </p>

                  <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.8;">
                    ขอบคุณที่สนใจร่วมงานกับบริษัทในเครือ ICP Group
                  </p>

                  <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #ec4899;">
                    <p style="margin: 0; font-size: 16px; color: #831843; line-height: 1.8; font-weight: 500;">
                      🎉 บริษัทสนใจประวัติของคุณ<br/>
                      กรุณากรอกข้อมูลเพิ่มเติมเพื่อให้การสมัครงานเสร็จสมบูรณ์
                    </p>
                  </div>

                  ${inviteData.position ? `
                  <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.8;">
                    ตำแหน่งที่สนใจ: <strong style="color: #db2777;">${inviteData.position}</strong>
                  </p>
                  ` : ''}

                  <p style="margin: 0 0 30px 0; font-size: 15px; color: #374151; line-height: 1.8;">
                    กรุณากดปุ่มด้านล่างเพื่อกรอกใบสมัครงานฉบับเต็ม ข้อมูลที่คุณเคยกรอกไว้จะถูกดึงมาแสดงอัตโนมัติ
                  </p>

                  <!-- Cute Action Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${applicationUrl}"
                           style="display: inline-block; padding: 20px 50px; background: linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%); color: #ffffff; text-decoration: none; border-radius: 60px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(236, 72, 153, 0.45), 0 4px 10px rgba(219, 39, 119, 0.3); border: 3px solid rgba(255,255,255,0.3);">
                          💖 กรอกใบสมัครเลย 💖
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Decorative hearts -->
                  <p style="margin: 20px 0; text-align: center; font-size: 24px;">
                    ✨💕✨
                  </p>

                  <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.6; text-align: center;">
                    หากกดปุ่มไม่ได้ <a href="${applicationUrl}" style="color: #ec4899;">คลิกที่นี่</a>
                  </p>

                  <p style="margin: 30px 0 0 0; font-size: 15px; color: #374151; line-height: 1.6;">
                    ขอบคุณค่ะ<br/>
                    <strong>ฝ่ายทรัพยากรบุคคล</strong><br/>
                    กลุ่มบริษัท ICP
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

  const message = {
    message: {
      subject: `[ICP Group] บริษัทสนใจประวัติของคุณ - กรุณากรอกใบสมัครฉบับเต็ม`,
      body: {
        contentType: 'HTML',
        content: emailBody,
      },
      toRecipients: [
        {
          emailAddress: {
            address: inviteData.candidateEmail,
          },
        },
      ],
    },
    saveToSentItems: true,
  };

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
    const inviteData: InviteRequest = await req.json();

    console.log('Sending application invite to:', inviteData.candidateEmail);

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

    // Generate invitation token
    const inviteToken = crypto.randomUUID();

    // Store invitation token in database (optional - for tracking)
    // You can create an invitation_tokens table to track sent invitations

    // Build application URL with candidate ID for pre-filling (public route)
    const applicationUrl = `${APP_URL}/apply/${inviteData.candidateId}?token=${inviteToken}`;

    console.log('Application URL:', applicationUrl);

    // Update candidate stage to "Interested"
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        stage: 'Interested',
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteData.candidateId);

    if (updateError) {
      console.error('Error updating candidate stage:', updateError);
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Send invite email
    const result = await sendInviteEmail(accessToken, inviteData, senderEmail, applicationUrl);

    return new Response(
      JSON.stringify({
        success: true,
        applicationUrl,
        message: 'Invitation email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-application-invite function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

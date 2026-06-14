import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TO_EMAIL        = 'info@modernusdecorationprojects.co.uk'
const FROM_EMAIL      = 'contact@modernusdecorationprojects.co.uk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { name, email, phone, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email and message are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save to Supabase database
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({ name, email, phone: phone || null, message })

    if (dbError) console.error('DB insert error:', dbError.message)

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Modernus Website <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `New enquiry from ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
            <div style="background:#1a1a1a;padding:28px 32px">
              <h2 style="color:#b46a2c;margin:0;font-size:20px;letter-spacing:0.05em">NEW ENQUIRY</h2>
              <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:13px">Modernus Decoration Projects</p>
            </div>
            <div style="padding:32px;background:#fafaf8;border:1px solid #e8e0d4">
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;width:100px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;font-size:15px">${name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;font-size:15px"><a href="mailto:${email}" style="color:#b46a2c">${email}</a></td>
                </tr>
                ${phone ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Phone</td>
                  <td style="padding:10px 0;border-bottom:1px solid #e8e0d4;font-size:15px">${phone}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:12px 0;vertical-align:top;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Message</td>
                  <td style="padding:12px 0;font-size:15px;line-height:1.7;white-space:pre-wrap">${message}</td>
                </tr>
              </table>
            </div>
            <div style="padding:16px 32px;background:#f0ebe3;font-size:12px;color:#999;text-align:center">
              Sent from modernusdecorationprojects.co.uk
            </div>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: 'Failed to send email. Please try again.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

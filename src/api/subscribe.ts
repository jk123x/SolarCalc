// src/pages/api/subscribe.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { 
      email, 
      marketingConsent,
      // Calculation inputs
      postcode,
      state,
      roofSize,
      dailyUsage,
      electricityRate,
      battery,
      hasTou,
      // Calculation results
      systemSize,
      expectedValue,
      paybackYears,
      // UTM tracking
      utmSource,
      utmMedium,
      utmCampaign
    } = data;

    // Validate email
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate confirmation token
    const confirmToken = crypto.randomUUID();

    // 1. Store in Supabase
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email,
        marketing_consent: marketingConsent || false,
        confirmed: false,
        confirm_token: confirmToken,
        postcode,
        state,
        roof_size: roofSize,
        daily_usage: dailyUsage,
        electricity_rate: electricityRate,
        battery,
        has_tou: hasTou,
        system_size: systemSize,
        expected_value: expectedValue,
        payback_years: paybackYears,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      })
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('Supabase error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to save lead' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Send confirmation email via Resend
    const resendKey = import.meta.env.RESEND_API_KEY;
    const confirmUrl = `${new URL(request.url).origin}/api/confirm?token=${confirmToken}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0f172a; font-size: 24px; margin: 0;">☀️ Solar<span style="color: #2563eb;">Math</span></h1>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px;">Confirm your email to get your report</h2>
          
          <p>You requested a personalised 25-year solar ROI report. Click below to confirm your email and download it:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Confirm & Get My Report</a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            SolarMath · Melbourne, Australia
          </p>
        </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SolarMath <hello@solarmath.com.au>',
        to: email,
        subject: 'Confirm your email to get your solar report',
        html: emailHtml
      })
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend error:', errorText);
      // Don't fail the whole request - lead is saved
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

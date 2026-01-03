// src/pages/api/confirm.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request, redirect }) => {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return redirect('/confirm?status=invalid');
    }

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    // 1. Find the lead by token
    const findResponse = await fetch(
      `${supabaseUrl}/rest/v1/leads?confirm_token=eq.${token}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    const leads = await findResponse.json();
    
    if (!leads || leads.length === 0) {
      return redirect('/confirm?status=invalid');
    }

    const lead = leads[0];

    // 2. Mark as confirmed
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/leads?id=eq.${lead.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmed: true,
          confirmed_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update lead');
      return redirect('/confirm?status=error');
    }

    // 3. Send the report email
    const resendKey = import.meta.env.RESEND_API_KEY;
    
    // Build report URL with their data
    const reportData = encodeURIComponent(JSON.stringify({
      postcode: lead.postcode,
      state: lead.state,
      roofSize: lead.roof_size,
      dailyUsage: lead.daily_usage,
      electricityRate: lead.electricity_rate,
      battery: lead.battery,
      hasTou: lead.has_tou,
      daytimeUsagePercent: lead.daytime_usage_percent,
      joinVPP: lead.join_vpp,
      systemSize: lead.system_size,
      expectedValue: lead.expected_value,
      paybackYears: lead.payback_years
    }));

    const reportUrl = `${url.origin}/report?data=${reportData}`;

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
          
          <h2 style="color: #0f172a; font-size: 20px;">Your 25-Year Solar Report</h2>
          
          <p>Thanks for confirming! Here's your personalised solar analysis:</p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">System Size</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${lead.system_size} kW</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Expected Value (25yr)</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${lead.expected_value >= 0 ? '#16a34a' : '#dc2626'};">$${Math.abs(lead.expected_value).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Payback Period</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${lead.payback_years} years</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${reportUrl}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View Full Report</a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">This link contains your personalised data. Bookmark it to access your report anytime.</p>
          
          ${lead.marketing_consent ? `
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          <p style="color: #64748b; font-size: 14px;">You're subscribed to Solar Alpha — our monthly intel on rebates, battery prices, and solar industry insights. You can unsubscribe anytime.</p>
          ` : ''}
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            SolarMath · Melbourne, Australia<br>
            <a href="${url.origin}/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color: #94a3b8;">Unsubscribe</a>
          </p>
        </body>
      </html>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SolarMath <hello@solarmath.com.au>',
        to: lead.email,
        subject: 'Your 25-Year Solar Report is Ready',
        html: emailHtml
      })
    });

    // Redirect to confirmation page with report
    return redirect(`/confirm?status=success&data=${reportData}`);

  } catch (error) {
    console.error('Confirm error:', error);
    return redirect('/confirm?status=error');
  }
};
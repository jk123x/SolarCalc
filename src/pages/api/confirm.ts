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

    // 3. Build report URL and redirect directly to it
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

    // Redirect straight to report
    return redirect(`/report?data=${reportData}`);

  } catch (error) {
    console.error('Confirm error:', error);
    return redirect('/confirm?status=error');
  }
};
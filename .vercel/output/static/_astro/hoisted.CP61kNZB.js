import"./hoisted.BkoFJ0Lt.js";const h={none:"No Battery",sungrow_10:"Sungrow SBR 10.2kWh",byd_hvs:"BYD HVS 10.2kWh",tesla_powerwall3:"Tesla Powerwall 3 (13.5kWh)",sonnen_eco:"Sonnen Eco 10"},p={none:{capacity:0,degradation:0,threshold:0,premium:!1,cost:0,warranty:0},sungrow_10:{capacity:10.2,degradation:2.5,threshold:70,premium:!1,cost:10500,warranty:10},byd_hvs:{capacity:10.2,degradation:2.5,threshold:70,premium:!1,cost:11e3,warranty:10},tesla_powerwall3:{capacity:13.5,degradation:2,threshold:70,premium:!0,cost:14500,warranty:10},sonnen_eco:{capacity:10,degradation:1.5,threshold:80,premium:!0,cost:16e3,warranty:15}},y={vic:{name:"Victoria",sun:4.2,sunRating:"moderate",electricity:"high",bestFor:"TOU arbitrage due to high peak rates",tip:"Victoria's variable weather makes battery storage particularly valuable — you can store excess on sunny days for cloudy stretches."},nsw:{name:"New South Wales",sun:4.8,sunRating:"good",electricity:"high",bestFor:"balanced solar + battery systems",tip:"NSW has strong solar resources and high electricity prices, making most solar configurations profitable."},qld:{name:"Queensland",sun:5.1,sunRating:"excellent",electricity:"moderate",bestFor:"maximizing solar generation",tip:"Queensland's abundant sunshine means you'll generate more power per panel than southern states — consider a slightly smaller system to save upfront costs."},sa:{name:"South Australia",sun:4.6,sunRating:"good",electricity:"very high",bestFor:"self-consumption to avoid expensive grid power",tip:"SA has Australia's highest electricity prices. Every kWh you self-consume is worth more here than anywhere else in the country."},wa:{name:"Western Australia",sun:5.6,sunRating:"excellent",electricity:"moderate",bestFor:"large solar arrays with battery backup",tip:"Perth gets more sunshine than almost anywhere in Australia. Combined with the state battery rebate (up to $5,000), this makes WA one of the best places for solar + battery."},tas:{name:"Tasmania",sun:3.8,sunRating:"lower",electricity:"moderate",bestFor:"smaller, efficient systems",tip:"Tasmania receives less sun than mainland states, so ROI timelines are longer. However, Tassie's cooler climate means panels operate more efficiently — heat reduces output."},nt:{name:"Northern Territory",sun:5.8,sunRating:"excellent",electricity:"high",bestFor:"maximum solar generation + battery storage",tip:"Darwin has Australia's highest solar irradiance. Combined with up to $6,000 in state battery rebates, the NT offers exceptional solar economics despite the tropical climate."},act:{name:"ACT",sun:4.5,sunRating:"good",electricity:"moderate",bestFor:"balanced residential systems",tip:"The ACT has strong renewable energy policies and good solar resources. Feed-in tariffs here are relatively stable compared to other jurisdictions."}};function x(e){const t=p[e];if(!t||t.capacity===0)return null;const i=Math.log(t.threshold/100)/Math.log(1-t.degradation/100);return Math.round(i)}function v(e){const t=e.systemSize*1e3,i=(e.expectedValue+t)/25,l=[];let a=-t;for(let s=0;s<=25;s++)l.push({year:s,value:Math.round(a)}),a+=i*Math.pow(.995,s);return l}function w(e){const t=[],i=p[e.battery]||p.none,l=y[e.state]||y.vic;if(t.push({type:"location",title:`Solar potential in ${l.name}`,text:`${l.name} receives ${l.sun} peak sun hours daily (${l.sunRating} for Australia). ${l.tip}`,icon:"📍"}),e.expectedValue>15e3?t.push({type:"positive",title:"Excellent investment opportunity",text:`At $${e.expectedValue.toLocaleString()} expected return, this system would significantly outperform a term deposit or bond investment over the same period. The real return is even better when you factor in electricity price inflation.`,icon:"✓"}):e.expectedValue>5e3?t.push({type:"positive",title:"Solid positive returns",text:`Your projected $${e.expectedValue.toLocaleString()} return represents a reasonable investment. Returns could improve further if electricity prices rise faster than our 4% assumption, or if you increase daytime self-consumption.`,icon:"✓"}):e.expectedValue>0?t.push({type:"neutral",title:"Marginal but positive returns",text:"This configuration breaks even with a small profit. Consider whether adjustments — like TOU pricing, shifting usage to daytime, or waiting for battery prices to drop — could improve the economics.",icon:"→"}):t.push({type:"warning",title:"Returns are marginal or negative",text:"With current settings, this system may not pay for itself within 25 years. See our recommendations below — small changes can significantly improve the outcome.",icon:"⚠"}),e.battery!=="none")if(e.hasTou?t.push({type:"positive",title:"Smart battery + TOU strategy",text:`You're set up to buy low, sell high: charge your battery with free solar during the day, then use that stored power during expensive peak hours (typically 3-9pm). This arbitrage is worth roughly $${Math.round((.52-.08)*i.capacity*.75*365)}/year in avoided peak charges.`,icon:"⚡"}):t.push({type:"action",title:"Unlock your battery's full value",text:`Without Time-of-Use pricing, your battery can only save the difference between your flat rate and feed-in tariff (~${Math.round((e.electricityRate-.08)*100)}c/kWh). With TOU, you'd save ~44c/kWh by avoiding peak rates. Contact your retailer about switching — it could add $300-500/year to your returns.`,icon:"💡",affiliateLink:null,affiliateCta:null}),i.premium){const a=p.sungrow_10,s=i.cost-a.cost,c=x(e.battery)-x("sungrow_10");t.push({type:"info",title:"Premium battery trade-off",text:`You've chosen the ${h[e.battery]}, which costs $${s.toLocaleString()} more than budget options but lasts ~${c} years longer before needing replacement. With a ${i.warranty}-year warranty and ${i.degradation}% annual degradation, this is the right choice if you value longevity over upfront savings.`,icon:"🔋"})}else{const a=p.sonnen_eco;t.push({type:"info",title:"Budget battery trade-off",text:`The ${h[e.battery]} offers good value but will likely need replacement around year ${x(e.battery)}. If you want a "set and forget" solution, premium batteries like the Sonnen Eco (${a.degradation}% degradation, ${a.warranty}-year warranty) last ~${x("sonnen_eco")} years — though they cost $${(a.cost-i.cost).toLocaleString()} more.`,icon:"🔋"})}else t.push({type:"info",title:"Solar-only: simple and effective",text:"Going without a battery keeps things simple and reduces upfront costs. You'll export excess solar to the grid for ~8c/kWh. Consider adding a battery in 2-3 years when prices drop further — by then you'll have real usage data to right-size it.",icon:"☀️"});if(e.daytimeUsagePercent&&e.daytimeUsagePercent<30?t.push({type:"action",title:"Shift usage to unlock savings",text:`Only ${e.daytimeUsagePercent}% of your power is used when the sun shines. Each 10% you shift to daytime adds $200-400/year. Easy wins: run dishwashers and washing machines mid-morning, charge EVs from 10am-3pm, use timer switches for pool pumps.`,icon:"⏰",affiliateLink:"https://www.amazon.com.au/s?k=smart+timer+plug&tag=solarmath-20",affiliateCta:"See smart timer plugs on Amazon"}):e.daytimeUsagePercent&&e.daytimeUsagePercent>=30&&e.daytimeUsagePercent<50?t.push({type:"neutral",title:"Average daytime usage",text:`${e.daytimeUsagePercent}% daytime usage is typical for households where people work during the day. If someone works from home, you could push this higher by timing appliances to run mid-day.`,icon:"⏰"}):e.daytimeUsagePercent&&e.daytimeUsagePercent>=50&&t.push({type:"positive",title:"Excellent self-consumption profile",text:`At ${e.daytimeUsagePercent}% daytime usage, you're maximizing the value of your solar — using power worth 32c/kWh instead of exporting it for 8c. This is ideal, whether from work-from-home arrangements or smart appliance scheduling.`,icon:"⏰"}),e.roofSize&&e.systemSize){const a=e.roofSize/6.5,s=e.systemSize/a*100;s<70&&e.expectedValue>0&&t.push({type:"info",title:"Room to grow",text:`You're using ${s.toFixed(0)}% of your roof capacity. If you plan to add an EV, pool heater, or heat pump in future, consider sizing up now — adding panels later costs more per watt than doing it upfront.`,icon:"📐"})}return t}function $(e){const t=v(e),i=Math.max(...t.map(o=>o.value)),l=Math.min(...t.map(o=>o.value)),a=i-l,s=120,c=100;let r=null;for(let o=1;o<t.length;o++)if(t[o-1].value<0&&t[o].value>=0){r=o;break}const d=t.map((o,u)=>{const m=u/25*c,f=s-(o.value-l)/a*s;return`${m},${f}`}).join(" "),n=s-(0-l)/a*s;return`
      <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
        <h3 class="text-sm font-semibold text-slate-600 mb-4">25-Year Value Projection</h3>
        <div class="relative" style="height: ${s+40}px">
          <svg viewBox="0 0 ${c} ${s+20}" class="w-full h-full" preserveAspectRatio="none">
            <!-- Zero line -->
            <line x1="0" y1="${n}" x2="${c}" y2="${n}" stroke="#94a3b8" stroke-width="0.5" stroke-dasharray="2,2"/>
            
            <!-- Gradient fill -->
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${e.expectedValue>=0?"#22c55e":"#f59e0b"};stop-opacity:0.3"/>
                <stop offset="100%" style="stop-color:${e.expectedValue>=0?"#22c55e":"#f59e0b"};stop-opacity:0"/>
              </linearGradient>
            </defs>
            
            <!-- Area fill -->
            <polygon points="0,${s} ${d} ${c},${s}" fill="url(#chartGradient)"/>
            
            <!-- Line -->
            <polyline points="${d}" fill="none" stroke="${e.expectedValue>=0?"#16a34a":"#d97706"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Breakeven marker -->
            ${r?`<circle cx="${r/25*c}" cy="${n}" r="3" fill="#2563eb"/>`:""}
          </svg>
          
          <!-- Labels -->
          <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400">
            <span>Year 0</span>
            ${r?`<span class="text-blue-600 font-medium">Break-even: Year ${r}</span>`:""}
            <span>Year 25</span>
          </div>
        </div>
        
        <div class="flex justify-between mt-4 pt-4 border-t border-slate-200">
          <div>
            <div class="text-xs text-slate-500">Starting investment</div>
            <div class="text-lg font-bold text-red-600">-$${Math.abs(t[0].value).toLocaleString()}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500">Final value (Year 25)</div>
            <div class="text-lg font-bold ${e.expectedValue>=0?"text-green-600":"text-amber-600"}">+$${t[25].value.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `}function k(e){const t=p[e.battery]||p.none,i=e.systemSize*4.5,l=e.dailyUsage*(e.daytimeUsagePercent/100),a=Math.min(i,l),s=i-a,c=t.capacity>0?Math.min(s*.85,t.capacity*.75):0,r=s-c,d=a+c+r,n=a/d*100,o=c/d*100,u=r/d*100;return`
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-8">
        <h3 class="text-sm font-semibold text-slate-600 mb-4">Daily Energy Flow (Estimated)</h3>
        
        <div class="flex items-center gap-4 mb-4">
          <div class="text-3xl">☀️</div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-amber-600">${i.toFixed(1)} kWh</div>
            <div class="text-xs text-slate-500">Generated daily</div>
          </div>
        </div>
        
        <!-- Flow bar -->
        <div class="h-8 rounded-full overflow-hidden flex mb-4">
          <div class="bg-green-500 flex items-center justify-center text-white text-xs font-medium" style="width: ${n}%">
            ${n>15?`${n.toFixed(0)}%`:""}
          </div>
          ${t.capacity>0?`
          <div class="bg-blue-500 flex items-center justify-center text-white text-xs font-medium" style="width: ${o}%">
            ${o>15?`${o.toFixed(0)}%`:""}
          </div>
          `:""}
          <div class="bg-amber-400 flex items-center justify-center text-white text-xs font-medium" style="width: ${u}%">
            ${u>15?`${u.toFixed(0)}%`:""}
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div class="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
            <div class="font-medium text-slate-700">Direct use</div>
            <div class="text-slate-500">${a.toFixed(1)} kWh @ 32c</div>
          </div>
          ${t.capacity>0?`
          <div>
            <div class="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
            <div class="font-medium text-slate-700">Battery</div>
            <div class="text-slate-500">${c.toFixed(1)} kWh @ ${e.hasTou?"52c":"32c"}</div>
          </div>
          `:"<div></div>"}
          <div>
            <div class="w-3 h-3 bg-amber-400 rounded-full mx-auto mb-1"></div>
            <div class="font-medium text-slate-700">Export</div>
            <div class="text-slate-500">${r.toFixed(1)} kWh @ 8c</div>
          </div>
        </div>
      </div>
    `}function S(e){const t=p[e.battery]||p.none,i=y[e.state]||y.vic,l=w(e),a=new Date().toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}),s=l.map(r=>{const d={positive:{bg:"bg-green-50",border:"border-green-200",title:"text-green-900",text:"text-green-700"},warning:{bg:"bg-amber-50",border:"border-amber-200",title:"text-amber-900",text:"text-amber-700"},action:{bg:"bg-blue-50",border:"border-blue-200",title:"text-blue-900",text:"text-blue-700"},info:{bg:"bg-slate-50",border:"border-slate-200",title:"text-slate-900",text:"text-slate-600"},neutral:{bg:"bg-slate-50",border:"border-slate-200",title:"text-slate-900",text:"text-slate-600"},location:{bg:"bg-purple-50",border:"border-purple-200",title:"text-purple-900",text:"text-purple-700"}},n=d[r.type]||d.info,o=r.affiliateLink?`<a href="${r.affiliateLink}" target="_blank" rel="noopener sponsored" class="inline-flex items-center gap-1 mt-3 text-sm font-medium ${n.title} hover:underline">${r.affiliateCta} <span>→</span></a>`:"";return`
        <div class="rounded-xl p-5 ${n.bg} border ${n.border}">
          <div class="flex gap-3">
            <div class="text-xl">${r.icon}</div>
            <div class="flex-1">
              <h3 class="font-bold ${n.title}">${r.title}</h3>
              <p class="text-sm ${n.text} mt-1">${r.text}</p>
              ${o}
            </div>
          </div>
        </div>`}).join("");let c="";if(t.capacity>0){const r=[1,3,5,10,15,20,25].map(d=>{const n=Math.pow(1-t.degradation/100,d)*100,o=t.capacity*(n/100),u=n<t.threshold,m=d<=t.warranty;return`<tr class="${u?"bg-amber-50":""}">
          <td class="py-2 px-3 text-slate-900">Year ${d}</td>
          <td class="py-2 px-3 text-right text-slate-900">${o.toFixed(1)} kWh</td>
          <td class="py-2 px-3 text-right">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${n>=80?"bg-green-100 text-green-800":n>=70?"bg-amber-100 text-amber-800":"bg-red-100 text-red-800"}">
              ${n.toFixed(0)}%
            </span>
          </td>
          <td class="py-2 px-3 text-right text-xs ${m?"text-green-600":"text-slate-400"}">${m?"✓ Warranty":"Expired"}</td>
        </tr>`}).join("");c=`
        <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h3 class="text-lg font-bold text-slate-900 mb-2">🔋 Battery Lifecycle</h3>
          <p class="text-sm text-slate-600 mb-4">Your ${h[e.battery]} (${t.capacity}kWh) degrades at ${t.degradation}% per year with a ${t.warranty}-year warranty.</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500">
                  <th class="py-2 px-3 text-left font-medium">Year</th>
                  <th class="py-2 px-3 text-right font-medium">Usable Capacity</th>
                  <th class="py-2 px-3 text-right font-medium">Health</th>
                  <th class="py-2 px-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">${r}</tbody>
            </table>
          </div>
          <p class="text-xs text-slate-400 mt-4">Replacement typically needed when capacity drops below ${t.threshold}%. We assume replacement cost is 65% of today's price.</p>
        </div>`}return`
    <div class="max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-12">
      <!-- Header -->
      <div class="print:hidden mb-6 flex justify-between items-center">
        <a href="/" class="text-blue-600 hover:underline text-sm flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Back to Calculator
        </a>
        <button onclick="window.print()" class="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Save PDF
        </button>
      </div>

      <!-- Report Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <span>📍</span> ${i.name} · ${e.postcode}
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-slate-900 mb-2">Your Solar Analysis</h1>
        <p class="text-slate-500">25-year financial projection · Generated ${a}</p>
      </div>

      <!-- Hero Result -->
      <div class="relative overflow-hidden rounded-3xl p-8 text-white mb-8 ${e.expectedValue>=0?"bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700":"bg-gradient-to-br from-amber-500 via-orange-600 to-red-700"}">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div class="relative">
          <div class="text-sm font-medium opacity-80 mb-1">Expected Return Over 25 Years</div>
          <div class="text-5xl md:text-6xl font-black mb-3">
            ${e.expectedValue>=0?"+":""}$${e.expectedValue.toLocaleString()}
          </div>
          <p class="text-white/80 max-w-md">
            ${e.expectedValue>=1e4?"This is a strong investment — your system should comfortably pay for itself and generate significant returns.":e.expectedValue>0?"Your system is projected to pay for itself and generate positive returns over its lifetime.":"With current settings, returns are marginal. See our recommendations to improve the economics."}
          </p>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div class="text-3xl font-black text-slate-900">${e.paybackYears}</div>
          <div class="text-xs text-slate-500 mt-1">Years to payback</div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div class="text-3xl font-black text-slate-900">${e.systemSize}<span class="text-lg">kW</span></div>
          <div class="text-xs text-slate-500 mt-1">System size</div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <div class="text-3xl font-black ${e.expectedValue>=0?"text-green-600":"text-red-600"}">${(e.expectedValue/(e.systemSize*1e3)*100).toFixed(0)}%</div>
          <div class="text-xs text-slate-500 mt-1">Total ROI</div>
        </div>
      </div>

      <!-- Charts -->
      ${$(e)}
      ${k(e)}

      <!-- System Config Summary -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h3 class="text-lg font-bold text-slate-900 mb-4">⚙️ Your Configuration</h3>
        <div class="grid md:grid-cols-2 gap-x-8 gap-y-3">
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Location</span>
            <span class="font-medium text-slate-900">${e.postcode}, ${i.name}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Daily usage</span>
            <span class="font-medium text-slate-900">${e.dailyUsage} kWh</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Electricity rate</span>
            <span class="font-medium text-slate-900">${(e.electricityRate*100).toFixed(0)}c/kWh</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Time-of-Use pricing</span>
            <span class="font-medium ${e.hasTou?"text-green-600":"text-slate-900"}">${e.hasTou?"Yes ✓":"No"}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Battery</span>
            <span class="font-medium text-slate-900">${h[e.battery]||"None"}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Daytime usage</span>
            <span class="font-medium text-slate-900">${e.daytimeUsagePercent}%</span>
          </div>
        </div>
      </div>

      <!-- Personalised Insights -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-900 mb-4">🎯 Personalised Analysis</h3>
        <div class="space-y-4">${s}</div>
      </div>

      <!-- Battery Table -->
      ${c}

      <!-- What's Modeled -->
      <div class="bg-slate-50 rounded-2xl p-6 mb-8">
        <h3 class="text-lg font-bold text-slate-900 mb-4">📊 Methodology</h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 class="font-semibold text-slate-700 mb-2">Included in analysis</h4>
            <ul class="space-y-1 text-slate-600">
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Panel degradation (0.5%/year)</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Inverter replacement (year 12)</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Annual maintenance ($120/year)</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Electricity inflation (4%/year)</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Federal & state rebates</li>
              <li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Discount rate (6%)</li>
              ${t.capacity>0?'<li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">✓</span> Battery degradation & replacement</li>':""}
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-slate-700 mb-2">Not included (upside potential)</h4>
            <ul class="space-y-1 text-slate-600">
              <li class="flex items-start gap-2"><span class="text-slate-400 mt-0.5">○</span> Property value increase (+3-4%)</li>
              <li class="flex items-start gap-2"><span class="text-slate-400 mt-0.5">○</span> Blackout protection value</li>
              <li class="flex items-start gap-2"><span class="text-slate-400 mt-0.5">○</span> Carbon offset value</li>
              <li class="flex items-start gap-2"><span class="text-slate-400 mt-0.5">○</span> EV charging optimization</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="bg-blue-600 rounded-2xl p-6 text-white mb-8">
        <h3 class="text-lg font-bold mb-4">📋 Your Next Steps</h3>
        <ol class="space-y-4">
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <div class="font-semibold">Get 3+ installer quotes</div>
              <div class="text-sm text-blue-100">Prices vary 20-40% between installers. Use SolarQuotes or EnergyEasy to compare CEC-accredited options.</div>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <div class="font-semibold">Analyse your usage data</div>
              <div class="text-sm text-blue-100">Download your smart meter data from your retailer's app. An <a href="https://www.amazon.com.au/s?k=home+energy+monitor&tag=solarmath-20" target="_blank" rel="noopener sponsored" class="underline">energy monitor</a> gives real-time visibility.</div>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <div class="font-semibold">Confirm rebate eligibility</div>
              <div class="text-sm text-blue-100">Federal battery rebates are first-come-first-served. Check current availability before committing.</div>
            </div>
          </li>
          ${!e.hasTou&&e.battery!=="none"?`
          <li class="flex gap-4">
            <span class="flex-shrink-0 w-7 h-7 bg-amber-400 text-amber-900 rounded-full flex items-center justify-center text-sm font-bold">!</span>
            <div>
              <div class="font-semibold">Switch to Time-of-Use pricing</div>
              <div class="text-sm text-blue-100">This is critical for battery ROI. Contact your retailer before finalizing your system.</div>
            </div>
          </li>
          `:""}
        </ol>
      </div>

      <!-- Footer -->
      <div class="text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p class="mb-2"><strong>Disclaimer:</strong> This analysis is based on modeled scenarios and publicly available data. Actual results depend on weather, usage patterns, electricity prices, and installer costs. This is general information, not financial advice.</p>
        <p class="mb-2">As an Amazon Associate, SolarMath earns from qualifying purchases.</p>
        <p>Generated by <a href="https://solarmath.com.au" class="underline">SolarMath</a> — honest solar calculations</p>
      </div>
    </div>`}const T=new URLSearchParams(window.location.search),g=T.get("data"),b=document.getElementById("report-root");if(g&&b)try{const e=JSON.parse(decodeURIComponent(g));b.innerHTML=S(e)}catch(e){console.error("Parse error:",e),b.innerHTML=`
        <div class="max-w-xl mx-auto px-6 py-20 text-center">
          <div class="text-6xl mb-6">🤔</div>
          <h1 class="text-3xl font-black text-slate-900 mb-4">Something went wrong</h1>
          <p class="text-slate-600 mb-8">We couldn't load your report data.</p>
          <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition">Back to Calculator</a>
        </div>`}

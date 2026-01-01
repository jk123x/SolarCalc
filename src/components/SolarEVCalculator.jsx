import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const SolarEVCalculator = () => {
  const [formData, setFormData] = useState({
    postcode: '',
    roofSize: 50,
    dailyUsage: 25,
    electricityRate: 0.32,
    peakRate: 0.52,
    hasTOU: false,
    state: 'vic',
    battery: 'none'
  });
  
  const [results, setResults] = useState(null);
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [batteryConfig, setBatteryConfig] = useState(null);

  const estimatedSystemSize = Math.min(formData.roofSize / 6.5, 10).toFixed(1);

  useEffect(() => {
    const config = {
      "batteries": {
        "none": { "name": "No Battery", "cost": 0, "capacity": 0, "degradationRate": 0, "efficiency": 1.0, "threshold": 0 },
        "byd_hvs": { "name": "BYD HVS 10.2", "cost": 8200, "capacity": 10.2, "degradationRate": 0.038, "efficiency": 0.82, "threshold": 0.60 },
        "lg_resu10h": { "name": "LG Chem RESU 10H", "cost": 9800, "capacity": 9.8, "degradationRate": 0.032, "efficiency": 0.85, "threshold": 0.65 },
        "tesla_powerwall2": { "name": "Tesla Powerwall 2", "cost": 14800, "capacity": 13.5, "degradationRate": 0.022, "efficiency": 0.90, "threshold": 0.70 },
        "sonnen_eco": { "name": "Sonnen Eco 10", "cost": 16500, "capacity": 10.0, "degradationRate": 0.015, "efficiency": 0.92, "threshold": 0.80 }
      }
    };
    setBatteryConfig(config);
  }, []);

  const getBatteryRebate = (state, batteryCapacity) => {
    if (batteryCapacity === 0) return 0;
    const rebates = {
      'vic': Math.min(2850 + (batteryCapacity - 6.5) * 175, 4174),
      'nsw': Math.min(1600 + batteryCapacity * 80, 2400),
      'sa': Math.min(batteryCapacity * 300, 3000),
    };
    return rebates[state] || 0;
  };

  const getCoordinatesFromPostcode = (postcode) => {
    const pc = parseInt(postcode);
    if (pc >= 2000 && pc <= 2999) return { lat: -33.86, city: 'Sydney', state: 'nsw' };
    if (pc >= 3000 && pc <= 3999) return { lat: -37.81, city: 'Melbourne', state: 'vic' };
    if (pc >= 4000 && pc <= 4999) return { lat: -27.46, city: 'Brisbane', state: 'qld' };
    if (pc >= 5000 && pc <= 5999) return { lat: -34.92, city: 'Adelaide', state: 'sa' };
    if (pc >= 6000 && pc <= 6999) return { lat: -31.95, city: 'Perth', state: 'wa' };
    return { lat: -33.86, city: 'Sydney', state: 'nsw' };
  };

  const calculateEV = async () => {
    if (!batteryConfig) return;
    setLoadingSolar(true);
    await new Promise(r => setTimeout(r, 800));

    const coords = getCoordinatesFromPostcode(formData.postcode);
    const irradianceData = {
      Sydney: { mean: 4.8 }, Melbourne: { mean: 4.2 }, Brisbane: { mean: 5.1 },
      Adelaide: { mean: 4.6 }, Perth: { mean: 5.6 }
    }[coords.city] || { mean: 4.4 };

    const systemSize = parseFloat(estimatedSystemSize);
    const battery = batteryConfig.batteries[formData.battery];
    
    const solarRebate = systemSize * 360; 
    const batteryRebate = getBatteryRebate(coords.state, battery.capacity);
    const totalSolarCost = systemSize * 1150; 
    const netInvestment = (totalSolarCost - solarRebate) + (battery.cost - batteryRebate);
    
    const baseDailyGen = systemSize * irradianceData.mean * 0.78; 
    const eveningUsage = formData.dailyUsage * 0.65; 
    const daytimeUsage = formData.dailyUsage * 0.35;
    const fit = 0.06;

    const scenarios = {
      median: { prob: 0.5, irr: 1.0, solarDeg: 0.008, rateInc: 0.035, maintenance: 150 },
      p10: { prob: 0.1, irr: 0.82, solarDeg: 0.015, rateInc: 0.02, maintenance: 300 }, 
      p90: { prob: 0.4, irr: 1.10, solarDeg: 0.005, rateInc: 0.05, maintenance: 80 }
    };

    let timeSeries = Array.from({length: 26}, (_, i) => ({ year: i }));
    let totalEV = 0;
    let scenarioSummary = {};

    Object.entries(scenarios).forEach(([name, s]) => {
      let cumulative = -netInvestment;
      let curRate = formData.electricityRate;
      let curPeak = formData.hasTOU ? formData.peakRate : curRate;
      let curBatCap = battery.capacity;
      let hasReplaced = false;

      timeSeries[0][name] = -netInvestment;

      for (let y = 1; y <= 25; y++) {
        const yearlySolarGen = baseDailyGen * s.irr * Math.pow(1 - s.solarDeg, y) * 365;
        const effectiveDegRate = name === 'p10' ? battery.degradationRate * 1.3 : battery.degradationRate;
        curBatCap *= (1 - effectiveDegRate);

        if (battery.capacity > 0 && (curBatCap / battery.capacity) < battery.threshold && !hasReplaced) {
          const replacementCost = (battery.cost * 0.8) / Math.pow(1.03, y);
          cumulative -= replacementCost;
          curBatCap = battery.capacity * 0.95;
          hasReplaced = true;
        }

        let savings;
        const dailyGen = yearlySolarGen / 365;

        if (battery.capacity > 0) {
          const usedDirectly = Math.min(dailyGen, daytimeUsage);
          const stored = Math.min((dailyGen - usedDirectly) * battery.efficiency, curBatCap);
          const usedFromBattery = Math.min(stored, eveningUsage);
          const exported = Math.max(0, dailyGen - usedDirectly - (stored / battery.efficiency));
          savings = (usedDirectly * curRate + usedFromBattery * curPeak + exported * fit) * 365;
        } else {
          const usedDirectly = Math.min(dailyGen, daytimeUsage);
          const exported = dailyGen - usedDirectly;
          savings = (usedDirectly * curRate + exported * fit) * 365;
        }

        cumulative += (savings - s.maintenance) / Math.pow(1.08, y);
        timeSeries[y][name] = Math.round(cumulative);
        curRate *= (1 + s.rateInc);
        curPeak *= (1 + s.rateInc);
      }

      let be = null;
      for(let i=1; i<26; i++) {
        if(timeSeries[i][name] >= 0 && timeSeries[i-1][name] < 0) {
          be = (i-1) + (Math.abs(timeSeries[i-1][name]) / (timeSeries[i][name] - timeSeries[i-1][name]));
          break;
        }
      }

      scenarioSummary[name] = { npv: cumulative, breakeven: be ? be.toFixed(1) : '25+' };
      totalEV += cumulative * s.prob;
    });

    setResults({ ev: totalEV, investment: netInvestment, scenarios: scenarioSummary, timeSeries, systemSize });
    setLoadingSolar(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs">1</span>
              System Design
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Postcode</label>
                <input type="text" maxLength="4" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5" placeholder="e.g. 3000" value={formData.postcode} onChange={(e) => setFormData({...formData, postcode: e.target.value})} />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Roof Area</label>
                  <span className="text-sm font-bold text-blue-600">{formData.roofSize} m²</span>
                </div>
                <input type="range" min="20" max="150" step="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" value={formData.roofSize} onChange={(e) => setFormData({...formData, roofSize: parseInt(e.target.value)})} />
                <p className="text-[11px] text-slate-400 mt-1 italic">Approx. {estimatedSystemSize} kW system capacity</p>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Daily Usage</label>
                  <span className="text-sm font-bold text-blue-600">{formData.dailyUsage} kWh</span>
                </div>
                <input type="range" min="5" max="80" step="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" value={formData.dailyUsage} onChange={(e) => setFormData({...formData, dailyUsage: parseInt(e.target.value)})} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Battery Storage</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5" value={formData.battery} onChange={(e) => setFormData({...formData, battery: e.target.value})}>
                  <option value="none">No Battery</option>
                  <option value="byd_hvs">BYD HVS (Entry-Level)</option>
                  <option value="lg_resu10h">LG Chem RESU</option>
                  <option value="tesla_powerwall2">Tesla Powerwall 2</option>
                  <option value="sonnen_eco">Sonnen Eco (Premium)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded text-blue-600" checked={formData.hasTOU} onChange={(e) => setFormData({...formData, hasTOU: e.target.checked})} />
                  <div>
                    <span className="block text-sm font-semibold text-slate-700">Time-of-Use Pricing</span>
                    <a href="/what-is-tou-pricing" className="text-[11px] text-blue-600 hover:underline">How does TOU work?</a>
                  </div>
                </label>
              </div>

              <button onClick={calculateEV} disabled={loadingSolar || !formData.postcode} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-4">
                {loadingSolar ? 'Processing Model...' : 'Calculate 25-Year ROI'}
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-6">
          {!results ? (
            <div className="bg-white border border-slate-200 rounded-3xl min-h-[600px] flex flex-col items-center justify-center p-12 text-center">
               <div className="mb-6 inline-flex p-4 bg-blue-50 rounded-full text-3xl">☀️</div>
               <h3 className="text-3xl font-black text-slate-900 mb-3">Ready to calculate your <i className="text-blue-600">optimal solar strategy?</i></h3>
               <p className="text-slate-500 max-w-sm mb-10">Generate a conservative financial model based on Australian irradiance data, battery degradation, and federal rebates.</p>
               <div className="opacity-40 grayscale max-w-xs">
                 

[Image of residential solar panels on a rooftop]

               </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="text-xl font-bold text-slate-800">Investment Performance</h3>
                <a href="/DEPLOYMENT_GUIDE.md" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  See how this was calculated →
                </a>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected NPV (25y)</p>
                  <p className={`text-3xl font-black ${results.ev >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Math.round(results.ev).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Breakeven</p>
                  <p className="text-3xl font-black text-blue-600">{results.scenarios.median.breakeven} Yrs</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Upfront Net Cost</p>
                  <p className="text-3xl font-black text-slate-900">${Math.round(results.investment).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">25-Year Expected Value Projection</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                      <Legend verticalAlign="top" align="right" iconType="circle" />
                      <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                      <Line type="monotone" dataKey="median" stroke="#2563eb" strokeWidth={4} dot={false} name="Median (50th)" />
                      <Line type="monotone" dataKey="p10" stroke="#f87171" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Pessimistic (10th)" />
                      <Line type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Optimistic (90th)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-blue-200">
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-2xl font-black mb-2">Want the full PDF breakdown?</h4>
                  <p className="opacity-90 text-sm">Get ahead of the curve with our monthly "Solar Alpha" report with updated rebate alerts and battery pricing shifts.</p>
                </div>
                <a href="mailto:reports@solarevalpha.com.au?subject=Send%20Solar%20Report" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-lg">
                  Get Full Analysis
                </a>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SolarEVCalculator;
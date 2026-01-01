import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const SolarEVCalculator = () => {
  const [formData, setFormData] = useState({
    postcode: '',
    roofSize: 50,
    dailyUsage: 25,
    electricityRate: 0.30,
    peakRate: 0.48,
    hasTOU: false,
    state: 'vic',
    battery: 'none'
  });
  
  const [results, setResults] = useState(null);
  const [email, setEmail] = useState('');
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [solarDataCache, setSolarDataCache] = useState({});
  const [batteryConfig, setBatteryConfig] = useState(null);

  // Load battery configuration
  useEffect(() => {
    const config = {
      "lastUpdated": "2025-01-15",
      "batteries": {
        "none": {
          "name": "No Battery",
          "cost": 0,
          "capacity": 0,
          "degradationRate": 0,
          "efficiency": 1.0,
          "warranty": 0,
          "replacementThreshold": 0
        },
        "byd_hvs": {
          "name": "BYD HVS 10.2",
          "cost": 8000,
          "capacity": 10.2,
          "degradationRate": 0.03,
          "efficiency": 0.85,
          "warranty": 10,
          "replacementThreshold": 0.6
        },
        "lg_resu10h": {
          "name": "LG Chem RESU 10H",
          "cost": 9500,
          "capacity": 9.8,
          "degradationRate": 0.025,
          "efficiency": 0.88,
          "warranty": 10,
          "replacementThreshold": 0.65
        },
        "tesla_powerwall2": {
          "name": "Tesla Powerwall 2",
          "cost": 14500,
          "capacity": 13.5,
          "degradationRate": 0.02,
          "efficiency": 0.90,
          "warranty": 10,
          "replacementThreshold": 0.7
        },
        "sonnen_eco": {
          "name": "Sonnen Eco 10",
          "cost": 16000,
          "capacity": 10.0,
          "degradationRate": 0.015,
          "efficiency": 0.92,
          "warranty": 15,
          "replacementThreshold": 0.75
        }
      }
    };
    setBatteryConfig(config);
  }, []);

  // State battery rebates (AUD)
  const getBatteryRebate = (state, batteryCapacity) => {
    if (batteryCapacity === 0) return 0;
    
    const rebates = {
      'vic': Math.min(2850 + (batteryCapacity - 6.5) * 175, 4174), // VIC Solar Homes
      'nsw': Math.min(1600 + batteryCapacity * 80, 2400), // NSW Peak Demand Reduction
      'sa': Math.min(batteryCapacity * 300, 3000), // SA Home Battery Scheme
      'qld': 0, // Currently no state rebate
      'wa': 0,
      'tas': 0,
      'nt': 0,
      'act': 0
    };
    
    return rebates[state] || 0;
  };

  const getCoordinatesFromPostcode = (postcode) => {
    const pc = parseInt(postcode);
    if (pc >= 2000 && pc <= 2999) return { lat: -33.8688, lon: 151.2093, city: 'Sydney', state: 'nsw' };
    if (pc >= 3000 && pc <= 3999) return { lat: -37.8136, lon: 144.9631, city: 'Melbourne', state: 'vic' };
    if (pc >= 4000 && pc <= 4999) return { lat: -27.4698, lon: 153.0251, city: 'Brisbane', state: 'qld' };
    if (pc >= 5000 && pc <= 5999) return { lat: -34.9285, lon: 138.6007, city: 'Adelaide', state: 'sa' };
    if (pc >= 6000 && pc <= 6999) return { lat: -31.9505, lon: 115.8605, city: 'Perth', state: 'wa' };
    if (pc >= 7000 && pc <= 7999) return { lat: -42.8821, lon: 147.3272, city: 'Hobart', state: 'tas' };
    if (pc >= 800 && pc <= 899) return { lat: -12.4634, lon: 130.8456, city: 'Darwin', state: 'nt' };
    if (pc >= 2600 && pc <= 2618) return { lat: -35.2809, lon: 149.1300, city: 'Canberra', state: 'act' };
    return { lat: -33.8688, lon: 151.2093, city: 'Sydney', state: 'nsw' };
  };

  const getSolarIrradiance = async (postcode) => {
    if (solarDataCache[postcode]) {
      return solarDataCache[postcode];
    }

    const coords = getCoordinatesFromPostcode(postcode);
    
    const fallbackData = {
      Sydney: { mean: 4.9, std: 0.6 },
      Melbourne: { mean: 4.3, std: 0.7 },
      Brisbane: { mean: 5.2, std: 0.5 },
      Adelaide: { mean: 4.7, std: 0.6 },
      Perth: { mean: 5.8, std: 0.4 },
      Hobart: { mean: 3.9, std: 0.8 },
      Darwin: { mean: 5.4, std: 0.4 },
      Canberra: { mean: 4.6, std: 0.7 }
    };

    const data = {
      ...fallbackData[coords.city],
      city: coords.city,
      state: coords.state,
      lat: coords.lat,
      lon: coords.lon
    };

    setSolarDataCache(prev => ({ ...prev, [postcode]: data }));
    return data;
  };

  const calculateEV = async () => {
    if (!batteryConfig) return;
    
    setLoadingSolar(true);
    const irradiance = await getSolarIrradiance(formData.postcode);
    setLoadingSolar(false);
    
    const systemSize = Math.min(formData.roofSize / 6, 10);
    const battery = batteryConfig.batteries[formData.battery];
    
    // Costs and rebates
    const systemCost = systemSize * 1200;
    const solarRebate = systemSize * 400; // Federal STCs for solar
    const batteryRebate = getBatteryRebate(irradiance.state, battery.capacity);
    const systemNetCost = systemCost - solarRebate;
    const batteryNetCost = battery.cost - batteryRebate;
    const totalInvestment = systemNetCost + batteryNetCost;
    
    const baseDailyGen = systemSize * irradiance.mean * 0.85;
    const baseAnnualGen = baseDailyGen * 365;
    const timeHorizon = 25;
    
    // Usage patterns: 35% daytime (9am-5pm), 65% evening/night
    const daytimeUsagePercent = 0.35;
    const daytimeUsage = formData.dailyUsage * daytimeUsagePercent;
    const eveningUsage = formData.dailyUsage * (1 - daytimeUsagePercent);
    
    // Electricity rates
    const flatRate = formData.electricityRate;
    const peakRate = formData.hasTOU ? formData.peakRate : flatRate;
    const feedInTariff = 0.08;
    
    const scenarios = {
      median: {
        probability: 0.50,
        percentile: '50th',
        irradianceFactor: 1.0,
        systemDegradation: 0.008,
        batteryDegradation: battery.degradationRate || 0,
        electricityRateChange: 0.04,
        maintenanceCost: 100 + (battery.cost > 0 ? 50 : 0),
        description: "Median outcome - average conditions and market dynamics"
      },
      p10: {
        probability: 0.10,
        percentile: '10th',
        irradianceFactor: 0.80,
        systemDegradation: 0.015,
        batteryDegradation: battery.degradationRate * 1.5 || 0,
        electricityRateChange: 0.02,
        maintenanceCost: 200 + (battery.cost > 0 ? 100 : 0),
        description: "Pessimistic - poor weather, high degradation, slow rate growth"
      },
      p90: {
        probability: 0.40,
        percentile: '90th',
        irradianceFactor: 1.15,
        systemDegradation: 0.005,
        batteryDegradation: battery.degradationRate * 0.7 || 0,
        electricityRateChange: 0.06,
        maintenanceCost: 50 + (battery.cost > 0 ? 30 : 0),
        description: "Optimistic - good weather, low degradation, strong rate growth"
      }
    };

    let totalEV = 0;
    let scenarioResults = {};
    let timeSeriesData = [];
    
    for (let year = 0; year <= timeHorizon; year++) {
      timeSeriesData.push({ year });
    }

    Object.entries(scenarios).forEach(([name, scenario]) => {
      let cumulativeValue = -totalInvestment;
      let currentFlatRate = flatRate;
      let currentPeakRate = peakRate;
      let systemEfficiency = 1.0;
      let batteryCapacity = battery.capacity;
      let batteryReplacementYear = null;
      
      for (let year = 1; year <= timeHorizon; year++) {
        systemEfficiency *= (1 - scenario.systemDegradation);
        batteryCapacity *= (1 - scenario.batteryDegradation);
        
        // Battery replacement (not in final 5 years)
        if (battery.cost > 0 && batteryCapacity / battery.capacity < battery.replacementThreshold && !batteryReplacementYear && year <= (timeHorizon - 5)) {
          batteryReplacementYear = year;
          const replacementCost = battery.cost * 0.8;
          cumulativeValue -= replacementCost / Math.pow(1.08, year);
          batteryCapacity = battery.capacity;
        }
        
        const yearlyGen = baseAnnualGen * scenario.irradianceFactor * systemEfficiency;
        let yearlySavings;
        
        if (battery.cost > 0) {
          // WITH BATTERY
          const dailyGen = yearlyGen / 365;
          const directConsumption = Math.min(dailyGen, daytimeUsage);
          const excessSolar = Math.max(0, dailyGen - daytimeUsage);
          const effectiveCapacity = batteryCapacity * (batteryCapacity / battery.capacity);
          const storedEnergy = Math.min(excessSolar * battery.efficiency, effectiveCapacity);
          const eveningFromBattery = Math.min(storedEnergy, eveningUsage);
          
          // Calculate value
          const daytimeSavings = directConsumption * currentFlatRate;
          const eveningSavings = eveningFromBattery * currentPeakRate; // Using peak rate for evening
          const remainingExcessFeedIn = Math.max(0, excessSolar - (storedEnergy / battery.efficiency)) * feedInTariff;
          
          yearlySavings = (daytimeSavings + eveningSavings + remainingExcessFeedIn) * 365 - scenario.maintenanceCost;
        } else {
          // WITHOUT BATTERY
          const dailyGen = yearlyGen / 365;
          const directConsumption = Math.min(dailyGen, daytimeUsage);
          const excessSolar = Math.max(0, dailyGen - daytimeUsage);
          
          const daytimeSavings = directConsumption * currentFlatRate;
          const feedInRevenue = excessSolar * feedInTariff;
          
          // Without battery, still buying evening power at peak rate
          const eveningPurchase = eveningUsage * currentPeakRate;
          
          yearlySavings = (daytimeSavings + feedInRevenue) * 365 - scenario.maintenanceCost;
        }
        
        const discountedSavings = yearlySavings / Math.pow(1.08, year);
        cumulativeValue += discountedSavings;
        timeSeriesData[year][name] = Math.round(cumulativeValue);
        
        currentFlatRate *= (1 + scenario.electricityRateChange);
        currentPeakRate *= (1 + scenario.electricityRateChange);
      }

      let breakevenYear = null;
      for (let year = 1; year <= timeHorizon; year++) {
        if (timeSeriesData[year][name] >= 0) {
          breakevenYear = year;
          break;
        }
      }

      scenarioResults[name] = {
        ...scenario,
        npv: cumulativeValue,
        weightedValue: cumulativeValue * scenario.probability,
        breakevenYear,
        batteryReplacementYear,
        value5yr: timeSeriesData[5]?.[name] || 0,
        value10yr: timeSeriesData[10]?.[name] || 0,
        value25yr: timeSeriesData[25]?.[name] || 0
      };

      totalEV += cumulativeValue * scenario.probability;
    });

    const probability10yr = Object.values(scenarioResults)
      .filter(s => s.value10yr > 0)
      .reduce((sum, s) => sum + s.probability, 0) * 100;
      
    const probability25yr = Object.values(scenarioResults)
      .filter(s => s.npv > 0)
      .reduce((sum, s) => sum + s.probability, 0) * 100;

    const variance = Object.values(scenarioResults)
      .reduce((sum, s) => sum + (Math.pow(s.npv - totalEV, 2) * s.probability), 0);
    
    const standardDeviation = Math.sqrt(variance);

    const distributionData = [
      {
        scenario: '50th (Base)',
        npv: scenarioResults.median.npv,
        fill: scenarioResults.median.npv >= 0 ? '#4ade80' : '#f87171'
      },
      {
        scenario: '10th (Pessimistic)',
        npv: scenarioResults.p10.npv,
        fill: scenarioResults.p10.npv >= 0 ? '#4ade80' : '#f87171'
      },
      {
        scenario: '90th (Optimistic)',
        npv: scenarioResults.p90.npv,
        fill: scenarioResults.p90.npv >= 0 ? '#4ade80' : '#f87171'
      }
    ];

    const roi5yr = (scenarioResults.median.value5yr / totalInvestment) * 100;
    const roi10yr = (scenarioResults.median.value10yr / totalInvestment) * 100;
    const roi25yr = (scenarioResults.median.value25yr / totalInvestment) * 100;

    setResults({
      ev: totalEV,
      scenarios: scenarioResults,
      probability10yr,
      probability25yr,
      standardDeviation,
      roi5yr,
      roi10yr,
      roi25yr,
      totalInvestment,
      systemCost,
      solarRebate,
      batteryRebate,
      systemNetCost,
      batteryNetCost,
      battery: battery.name,
      city: irradiance.city,
      state: irradiance.state,
      distributionData,
      timeSeriesData,
      batteryPricesUpdated: batteryConfig.lastUpdated,
      daytimeUsagePercent: Math.round(daytimeUsagePercent * 100),
      hasTOU: formData.hasTOU
    });
  };

  if (!batteryConfig) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Manrope:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Manrope', sans-serif;
        }
        
        .mono-font {
          font-family: 'Space Mono', monospace;
        }
        
        .glow-border {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1);
        }
        
        .card-glow {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .input-focus:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl pulse-glow"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl pulse-glow" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="mono-font text-sm text-blue-400 mb-2">EXPECTED VALUE ANALYSIS</div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Solar Panel
              <span className="block gradient-text">
                Decision Calculator
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Make the optimal solar investment decision for <em>you</em> using probability-weighted scenarios, 
              realistic pricing models, and state-specific rebates. Built for Australian conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="card-glow rounded-2xl p-8 md:p-12 glow-border">
          <h2 className="text-3xl font-bold text-white mb-8">Input Your Parameters</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                placeholder="e.g. 3000"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none input-focus transition-all"
                maxLength="4"
              />
              <p className="text-xs text-gray-400 mt-1">Determines solar irradiance and available rebates</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Roof Space (m²)
              </label>
              <input
                type="number"
                value={formData.roofSize}
                onChange={(e) => setFormData({...formData, roofSize: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none input-focus transition-all"
                min="20"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Daily Electricity Usage (kWh)
              </label>
              <input
                type="number"
                value={formData.dailyUsage}
                onChange={(e) => setFormData({...formData, dailyUsage: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none input-focus transition-all"
                min="5"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Electricity Rate ($/kWh)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.electricityRate}
                onChange={(e) => setFormData({...formData, electricityRate: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none input-focus transition-all"
                min="0.15"
                max="0.60"
              />
              <p className="text-xs text-gray-400 mt-1">Your standard daytime rate</p>
            </div>

            <div className="md:col-span-2 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasTOU}
                  onChange={(e) => setFormData({...formData, hasTOU: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">I have Time-of-Use (TOU) pricing</span>
                    <a 
                      href="/what-is-tou-pricing" 
                      target="_blank"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      What's TOU pricing?
                    </a>
                  </div>
                  <p className="text-xs text-gray-400">Peak rates in evening make batteries much more valuable</p>
                </div>
              </label>
              
              {formData.hasTOU && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Peak Rate (6-9pm, $/kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.peakRate}
                    onChange={(e) => setFormData({...formData, peakRate: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none input-focus transition-all"
                    min="0.20"
                    max="0.80"
                  />
                  <p className="text-xs text-gray-400 mt-1">Evening peak rate (typically $0.40-0.60/kWh)</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Battery Option
              </label>
              <select
                value={formData.battery}
                onChange={(e) => setFormData({...formData, battery: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white focus:border-blue-500 focus:outline-none input-focus transition-all"
              >
                <option value="none">No Battery - Solar Only</option>
                <option value="byd_hvs">BYD HVS 10.2 (~$8,000 AUD) - Budget option</option>
                <option value="lg_resu10h">LG Chem RESU 10H (~$9,500 AUD) - Mid-range</option>
                <option value="tesla_powerwall2">Tesla Powerwall 2 (~$14,500 AUD) - Popular choice</option>
                <option value="sonnen_eco">Sonnen Eco 10 (~$16,000 AUD) - Premium</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Batteries store daytime solar for evening use. State rebates apply automatically.
                <span className="text-gray-500"> • Prices updated {batteryConfig.lastUpdated}</span>
              </p>
            </div>
          </div>

          <button
            onClick={calculateEV}
            disabled={loadingSolar}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSolar ? 'Calculating...' : 'Calculate Expected Value'}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-8 space-y-6">
            
            {/* 1. EV Summary - Just the number */}
            <div className="card-glow rounded-2xl p-12 glow-border">
              <div className="text-center">
                <div className="mono-font text-sm text-blue-400 mb-3">EXPECTED VALUE (25 YEARS)</div>
                <div className={`text-8xl font-bold ${results.ev >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${results.ev.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
              </div>
            </div>

            {/* 2. Cumulative Profit Over Time */}
            <div className="card-glow rounded-2xl p-8 glow-border">
              <h3 className="text-2xl font-bold text-white mb-2">Cumulative Profit Over Time</h3>
              <p className="text-gray-400 mb-6 text-sm">25-year projection across all scenarios</p>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#94a3b8"
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                    label={{ value: 'Cumulative Profit', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    stroke="#60a5fa" 
                    strokeWidth={3}
                    name="50th Percentile (Base)"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p10" 
                    stroke="#f87171" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="10th Percentile (Pessimistic)"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="p90" 
                    stroke="#4ade80" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="90th Percentile (Optimistic)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                {['median', 'p10', 'p90'].map((scenario) => {
                  const data = results.scenarios[scenario];
                  return (
                    <div key={scenario} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <div className="mono-font text-xs text-gray-400 mb-1">{data.percentile} PERCENTILE</div>
                      {data.breakevenYear ? (
                        <>
                          <div className="text-2xl font-bold text-green-400">Year {data.breakevenYear}</div>
                          <div className="text-xs text-gray-400">Breakeven point</div>
                          {data.batteryReplacementYear && (
                            <div className="text-xs text-yellow-400 mt-2">
                              ⚠️ Battery replacement: Year {data.batteryReplacementYear}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-red-400">Never</div>
                          <div className="text-xs text-gray-400">No breakeven</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Profit Distribution */}
            <div className="card-glow rounded-2xl p-8 glow-border">
              <h3 className="text-2xl font-bold text-white mb-6">Profit Distribution at 25 Years</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results.distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="scenario" 
                    stroke="#94a3b8"
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    style={{ fontSize: '14px' }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => {
                      if (name === 'npv') return [`$${value.toLocaleString()}`, 'NPV'];
                      return value;
                    }}
                  />
                  <Bar dataKey="npv" radius={[8, 8, 0, 0]}>
                    {results.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="text-gray-300">Positive NPV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span className="text-gray-300">Negative NPV</span>
                </div>
              </div>
              
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="mono-font text-xs text-gray-400 mb-1">PROBABILITY OF PROFIT (10 YR)</div>
                  <div className="text-3xl font-bold text-white">{results.probability10yr.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Realistic decision timeframe</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="mono-font text-xs text-gray-400 mb-1">PROBABILITY OF PROFIT (25 YR)</div>
                  <div className="text-3xl font-bold text-white">{results.probability25yr.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Full system lifespan</div>
                </div>
              </div>

              <div className="mt-4 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h4 className="mono-font text-xs text-gray-400 mb-4">RETURN ON INVESTMENT (BASE CASE)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">5 Year</div>
                    <div className={`text-2xl font-bold ${results.roi5yr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.roi5yr >= 0 ? '+' : ''}{results.roi5yr.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">10 Year</div>
                    <div className={`text-2xl font-bold ${results.roi10yr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.roi10yr >= 0 ? '+' : ''}{results.roi10yr.toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">25 Year</div>
                    <div className={`text-2xl font-bold ${results.roi25yr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.roi25yr >= 0 ? '+' : ''}{results.roi25yr.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Scenario Analysis */}
            <div className="card-glow rounded-2xl p-8 glow-border">
              <h3 className="text-2xl font-bold text-white mb-6">Scenario Analysis</h3>
              
              <div className="space-y-4">
                {['median', 'p10', 'p90'].map((key) => {
                  const scenario = results.scenarios[key];
                  return (
                    <div key={key} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-lg font-semibold text-white">
                              {scenario.percentile} Percentile {key === 'median' ? '(Base Case)' : ''}
                            </h4>
                            <span className="mono-font text-xs text-gray-400">{(scenario.probability * 100).toFixed(0)}% probability</span>
                          </div>
                          <p className="text-sm text-gray-400">{scenario.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="mono-font text-xs text-gray-400 mb-1">NPV (25yr)</div>
                          <div className={`text-2xl font-bold ${scenario.npv >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${scenario.npv.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-700">
                        <div>
                          <div className="mono-font text-xs text-gray-500">5 Year</div>
                          <div className="text-sm text-white font-semibold">${scenario.value5yr.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="mono-font text-xs text-gray-500">10 Year</div>
                          <div className="text-sm text-white font-semibold">${scenario.value10yr.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="mono-font text-xs text-gray-500">25 Year</div>
                          <div className="text-sm text-white font-semibold">${scenario.value25yr.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="mono-font text-xs text-gray-500">Breakeven</div>
                          <div className="text-sm text-white font-semibold">
                            {scenario.breakevenYear ? `Year ${scenario.breakevenYear}` : 'Never'}
                          </div>
                        </div>
                      </div>
                      
                      {scenario.batteryReplacementYear && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <span>⚠️</span>
                            <span>Battery replacement recommended in year {scenario.batteryReplacementYear}</span>
                            <span className="text-gray-500">(modeled at 80% of original cost)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Investment Breakdown - AT THE BOTTOM */}
            <div className="card-glow rounded-2xl p-8 glow-border">
              <h3 className="text-2xl font-bold text-white mb-6">Investment Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-gray-300">Solar System ({(results.systemCost / 1200).toFixed(1)} kW)</span>
                  <span className="font-semibold text-white">${results.systemCost.toLocaleString()}</span>
                </div>
                {results.batteryNetCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-gray-300">{results.battery}</span>
                    <span className="font-semibold text-white">${(results.batteryNetCost + results.batteryRebate).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-green-400">Federal Solar Rebate (STCs)</span>
                  <span className="font-semibold text-green-400">-${results.solarRebate.toLocaleString()}</span>
                </div>
                {results.batteryRebate > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-green-400">State Battery Rebate ({results.state.toUpperCase()})</span>
                    <span className="font-semibold text-green-400">-${results.batteryRebate.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-t-2 border-blue-500 mt-3">
                  <span className="text-xl font-bold text-white">Total Investment</span>
                  <span className="text-2xl font-bold text-blue-400">${results.totalInvestment.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                <p className="text-sm text-gray-300 mb-3">
                  <span className="text-blue-400 font-semibold">Usage Pattern:</span> {results.daytimeUsagePercent}% of your electricity is used during solar hours (9am-5pm).
                  {results.batteryNetCost > 0 ? " The battery stores excess daytime solar to power your home in the evening." : " Without a battery, excess solar is sold back to the grid at ~$0.08/kWh (feed-in tariff)."}
                </p>
                {results.hasTOU && (
                  <p className="text-sm text-green-400">
                    ✓ Time-of-Use pricing enabled - batteries save significantly more by avoiding peak evening rates.
                  </p>
                )}
                {!results.hasTOU && results.batteryNetCost > 0 && (
                  <p className="text-sm text-yellow-400">
                    ⚠️ Note: Battery value is limited with flat-rate pricing. Consider switching to a Time-of-Use plan to unlock $2k-5k additional savings.
                  </p>
                )}
              </div>
            </div>

            {/* Decision Framework */}
            <div className="card-glow rounded-2xl p-8 glow-border">
              <h3 className="text-2xl font-bold text-white mb-4">Decision Recommendation</h3>
              
              {results.probability10yr > 60 ? (
                <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">✓</div>
                    <div>
                      <div className="text-xl font-bold text-green-400 mb-2">Strong Positive Expected Value</div>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        {results.probability10yr.toFixed(0)}% probability of profit within 10 years. 
                        Base case breakeven is year {results.scenarios.median.breakevenYear || 'N/A'}. 
                        This investment has favorable risk-adjusted returns.
                      </p>
                      <p className="text-sm text-blue-300">
                        💡 Try comparing different battery options above to see if another configuration offers even better returns for your situation.
                      </p>
                    </div>
                  </div>
                </div>
              ) : results.probability10yr > 40 ? (
                <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">⚠️</div>
                    <div>
                      <div className="text-xl font-bold text-yellow-400 mb-2">Marginal Positive Expected Value</div>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        {results.probability10yr.toFixed(0)}% probability of profit within 10 years. 
                        Base case breakeven at year {results.scenarios.median.breakevenYear || 'N/A'}. 
                        Consider your risk tolerance and whether optimizing electricity rates (TOU) might improve returns.
                      </p>
                      <p className="text-sm text-blue-300">
                        💡 Try different battery options or enabling Time-of-Use pricing to see if you can improve the expected value.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">✗</div>
                    <div>
                      <div className="text-xl font-bold text-red-400 mb-2">Negative Expected Value</div>
                      <p className="text-gray-300 leading-relaxed mb-3">
                        Only {results.probability10yr.toFixed(0)}% probability of profit within 10 years. 
                        Unless environmental or energy independence values justify the investment, 
                        consider waiting for better pricing or exploring Time-of-Use electricity plans.
                      </p>
                      <p className="text-sm text-blue-300">
                        💡 Try different battery options (including "No Battery") or enabling Time-of-Use pricing to see if any configuration becomes financially viable.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Capture Section */}
        <div className="mt-12 card-glow rounded-2xl p-8 md:p-12 glow-border">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Master Solar Decision-Making
            </h3>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Get the complete playbook on making optimal solar investment decisions, 
              including battery analysis, installer comparisons, and advanced EV frameworks.
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-6 mb-6 text-left border border-slate-700">
              <p className="mono-font text-xs text-blue-400 mb-3">INSIDE THE PLAYBOOK:</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 mono-font">→</span>
                  <span>Battery expected value analysis (replacement cycles, degradation modeling)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 mono-font">→</span>
                  <span>Installer comparison framework (price vs. quality risk assessment)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 mono-font">→</span>
                  <span>State-by-state rebate maximization strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 mono-font">→</span>
                  <span>Time-of-Use optimization strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 mono-font">→</span>
                  <span>Advanced scenario modeling techniques</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold transition-all transform hover:scale-105 whitespace-nowrap">
                Get Playbook
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm mono-font">Built for data-driven decision makers</p>
      </div>
    </div>
  );
};

export default SolarEVCalculator;

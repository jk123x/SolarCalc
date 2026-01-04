/* empty css                                 */
import { a as createComponent, f as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CesQvfV9.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_I5HwLE2N.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Line } from 'recharts';
export { renderers } from '../renderers.mjs';

const SolarEVCalculator = () => {
  const [formData, setFormData] = useState({
    postcode: "",
    roofSize: 50,
    dailyUsage: 25,
    electricityRate: 0.32,
    peakRate: 0.52,
    hasTOU: false,
    state: "vic",
    battery: "none",
    orientation: "north",
    daytimeUsagePercent: 35,
    joinVPP: false
  });
  const [results, setResults] = useState(null);
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [batteryConfig, setBatteryConfig] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const estimatedSystemSize = Math.min(formData.roofSize / 6.5, 10).toFixed(1);
  useEffect(() => {
    const config = {
      "batteries": {
        "none": {
          "name": "No Battery",
          "cost": 0,
          "capacity": 0,
          "degradationRate": 0,
          "efficiency": 1,
          "threshold": 0,
          "vppCompatible": false
        },
        "sungrow_10": {
          "name": "Sungrow SBR 10.2kWh",
          "cost": 10500,
          "capacity": 10.2,
          "degradationRate": 0.025,
          "efficiency": 0.85,
          // Conservative round-trip efficiency
          "threshold": 0.7,
          "vppCompatible": true
        },
        "byd_hvs": {
          "name": "BYD HVS 10.2kWh",
          "cost": 11e3,
          "capacity": 10.2,
          "degradationRate": 0.025,
          "efficiency": 0.85,
          "threshold": 0.7,
          "vppCompatible": true
        },
        "tesla_powerwall3": {
          "name": "Tesla Powerwall 3 (13.5kWh)",
          "cost": 14500,
          "capacity": 13.5,
          "degradationRate": 0.02,
          "efficiency": 0.9,
          "threshold": 0.7,
          "vppCompatible": true
        },
        "sonnen_eco": {
          "name": "Sonnen Eco 10",
          "cost": 16500,
          "capacity": 10,
          "degradationRate": 0.015,
          "efficiency": 0.92,
          "threshold": 0.8,
          "vppCompatible": true
        }
      }
    };
    setBatteryConfig(config);
  }, []);
  useEffect(() => {
    if (formData.postcode.length === 4) {
      const coords = getCoordinatesFromPostcode(formData.postcode);
      if (coords.state !== formData.state) {
        setFormData((prev) => ({ ...prev, state: coords.state }));
      }
    }
  }, [formData.postcode]);
  const getFederalBatteryRebate = (usableCapacity) => {
    if (usableCapacity === 0) return 0;
    const eligibleCapacity = Math.min(usableCapacity, 50);
    const rebatePerKwh = 311;
    return eligibleCapacity * rebatePerKwh;
  };
  const getStateBatteryRebate = (state, batteryCapacity) => {
    if (batteryCapacity === 0) return 0;
    const rebates = {
      "vic": 0,
      "nsw": 0,
      "sa": 0,
      "wa": Math.min(batteryCapacity * 500, 5e3),
      "qld": 0,
      "nt": Math.min(batteryCapacity * 400, 6e3)
    };
    return rebates[state] || 0;
  };
  const getAnnualVPPEarnings = (batteryCapacity, state) => {
    if (batteryCapacity === 0) return 0;
    const baseEarnings = {
      "nsw": 200,
      "sa": 250,
      "vic": 180,
      "qld": 150,
      "wa": 120,
      "nt": 80
    };
    const scaleFactor = Math.min(batteryCapacity / 10, 1.3);
    return (baseEarnings[state] || 120) * scaleFactor;
  };
  const getCoordinatesFromPostcode = (postcode) => {
    const pc = parseInt(postcode);
    if (pc >= 800 && pc <= 899) return { lat: -12.46, city: "Darwin", state: "nt" };
    if (pc >= 2600 && pc <= 2618) return { lat: -35.28, city: "Canberra", state: "act" };
    if (pc >= 2900 && pc <= 2920) return { lat: -35.28, city: "Canberra", state: "act" };
    if (pc >= 2e3 && pc <= 2599) return { lat: -33.86, city: "Sydney", state: "nsw" };
    if (pc >= 2619 && pc <= 2899) return { lat: -33.86, city: "Sydney", state: "nsw" };
    if (pc >= 2921 && pc <= 2999) return { lat: -33.86, city: "Sydney", state: "nsw" };
    if (pc >= 3e3 && pc <= 3999) return { lat: -37.81, city: "Melbourne", state: "vic" };
    if (pc >= 4e3 && pc <= 4999) return { lat: -27.46, city: "Brisbane", state: "qld" };
    if (pc >= 5e3 && pc <= 5999) return { lat: -34.92, city: "Adelaide", state: "sa" };
    if (pc >= 6e3 && pc <= 6999) return { lat: -31.95, city: "Perth", state: "wa" };
    if (pc >= 7e3 && pc <= 7999) return { lat: -42.88, city: "Hobart", state: "tas" };
    return { lat: -33.86, city: "Sydney", state: "nsw" };
  };
  const calculateEV = async () => {
    if (!batteryConfig) return;
    setLoadingSolar(true);
    await new Promise((r) => setTimeout(r, 800));
    const coords = getCoordinatesFromPostcode(formData.postcode);
    const irradianceData = {
      Sydney: { mean: 4.8 },
      Melbourne: { mean: 4.2 },
      Brisbane: { mean: 5.1 },
      Adelaide: { mean: 4.6 },
      Perth: { mean: 5.6 },
      Darwin: { mean: 5.8 }
    }[coords.city] || { mean: 4.4 };
    const orientationFactors = {
      north: 1,
      northeast: 0.95,
      northwest: 0.95,
      east: 0.85,
      west: 0.85,
      flat: 0.8
    };
    const orientationFactor = orientationFactors[formData.orientation] || 1;
    const systemSize = parseFloat(estimatedSystemSize);
    const battery = batteryConfig.batteries[formData.battery];
    const solarRebate = systemSize * 360;
    const federalBatteryRebate = getFederalBatteryRebate(battery.capacity);
    const stateBatteryRebate = getStateBatteryRebate(coords.state, battery.capacity);
    const totalBatteryRebate = federalBatteryRebate + stateBatteryRebate;
    const totalSolarCost = systemSize * 1150;
    const netBatteryCost = Math.max(0, battery.cost - totalBatteryRebate);
    const netInvestment = totalSolarCost - solarRebate + netBatteryCost;
    const baseDailyGen = systemSize * irradianceData.mean * 0.78 * orientationFactor;
    const daytimeUsagePercent = formData.daytimeUsagePercent / 100;
    const eveningUsage = formData.dailyUsage * (1 - daytimeUsagePercent);
    const daytimeUsage = formData.dailyUsage * daytimeUsagePercent;
    const fit = 0.05;
    const scenarios = {
      median: {
        prob: 0.6,
        irr: 1,
        solarDeg: 5e-3,
        rateInc: 0.04,
        maintenance: 120,
        inverterYear: 12,
        discountRate: 0.06,
        // 6% - balanced discount rate
        batteryUtilization: 0.75
        // KEY: Not every day is perfect
      },
      p10: {
        prob: 0.2,
        irr: 0.85,
        solarDeg: 8e-3,
        rateInc: 0.025,
        maintenance: 250,
        inverterYear: 10,
        discountRate: 0.06,
        batteryUtilization: 0.6
        // Worse utilization in pessimistic case
      },
      p90: {
        prob: 0.2,
        irr: 1.08,
        solarDeg: 3e-3,
        rateInc: 0.055,
        maintenance: 80,
        inverterYear: 15,
        discountRate: 0.06,
        batteryUtilization: 0.85
        // Better utilization in optimistic case
      }
    };
    const annualVPPEarnings = formData.joinVPP && battery.vppCompatible ? getAnnualVPPEarnings(battery.capacity, coords.state) : 0;
    let timeSeries = Array.from({ length: 26 }, (_, i) => ({ year: i }));
    let totalEV = 0;
    let scenarioSummary = {};
    Object.entries(scenarios).forEach(([name, s]) => {
      let cumulative = -netInvestment;
      let curRate = formData.electricityRate;
      let curPeak = formData.hasTOU ? formData.peakRate : curRate;
      let curBatCap = battery.capacity;
      let hasReplaced = false;
      let inverterReplaced = false;
      timeSeries[0][name] = -netInvestment;
      for (let y = 1; y <= 25; y++) {
        const yearlySolarGen = baseDailyGen * s.irr * Math.pow(1 - s.solarDeg, y) * 365;
        const effectiveDegRate = name === "p10" ? battery.degradationRate * 1.2 : battery.degradationRate;
        curBatCap *= 1 - effectiveDegRate;
        if (y === s.inverterYear && !inverterReplaced) {
          const inverterCost = 1800 / Math.pow(1.02, y);
          cumulative -= inverterCost / Math.pow(1 + s.discountRate, y);
          inverterReplaced = true;
        }
        if (battery.capacity > 0 && curBatCap / battery.capacity < battery.threshold && !hasReplaced) {
          const replacementCost = battery.cost * 0.65 / Math.pow(1.04, y);
          cumulative -= replacementCost / Math.pow(1 + s.discountRate, y);
          curBatCap = battery.capacity * 0.95;
          hasReplaced = true;
        }
        let savings;
        const dailyGen = yearlySolarGen / 365;
        if (battery.capacity > 0) {
          const usedDirectly = Math.min(dailyGen, daytimeUsage);
          const excessAfterDaytime = dailyGen - usedDirectly;
          const theoreticalStored = Math.min(excessAfterDaytime * battery.efficiency, curBatCap);
          const actualStored = theoreticalStored * s.batteryUtilization;
          const usedFromBattery = Math.min(actualStored, eveningUsage * s.batteryUtilization);
          const solarToCharge = actualStored / battery.efficiency;
          const exported = Math.max(0, excessAfterDaytime - solarToCharge);
          const directSavings = usedDirectly * curRate;
          const batterySavings = usedFromBattery * curPeak;
          const opportunityCost = solarToCharge * fit;
          const exportEarnings = exported * fit;
          const vppEarnings = annualVPPEarnings * (curBatCap / battery.capacity);
          const netBatteryValue = batterySavings - opportunityCost;
          savings = (directSavings + netBatteryValue + exportEarnings) * 365 + vppEarnings;
        } else {
          const usedDirectly = Math.min(dailyGen, daytimeUsage);
          const exported = dailyGen - usedDirectly;
          savings = (usedDirectly * curRate + exported * fit) * 365;
        }
        cumulative += (savings - s.maintenance) / Math.pow(1 + s.discountRate, y);
        timeSeries[y][name] = Math.round(cumulative);
        curRate *= 1 + s.rateInc;
        curPeak *= 1 + s.rateInc;
      }
      let be = null;
      for (let i = 1; i < 26; i++) {
        if (timeSeries[i][name] >= 0 && timeSeries[i - 1][name] < 0) {
          be = i - 1 + Math.abs(timeSeries[i - 1][name]) / (timeSeries[i][name] - timeSeries[i - 1][name]);
          break;
        }
      }
      scenarioSummary[name] = { npv: cumulative, breakeven: be ? be.toFixed(1) : "25+" };
      totalEV += cumulative * s.prob;
    });
    setResults({
      ev: totalEV,
      investment: netInvestment,
      scenarios: scenarioSummary,
      timeSeries,
      systemSize,
      batteryRebate: totalBatteryRebate,
      federalRebate: federalBatteryRebate,
      stateRebate: stateBatteryRebate,
      vppEarnings: annualVPPEarnings,
      state: coords.state,
      hasBattery: battery.capacity > 0,
      hasTOU: formData.hasTOU
    });
    setLoadingSolar(false);
  };
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError("");
    const urlParams = new URLSearchParams(window.location.search);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          marketingConsent,
          // Calculation inputs
          postcode: formData.postcode,
          state: formData.state,
          roofSize: formData.roofSize,
          dailyUsage: formData.dailyUsage,
          electricityRate: formData.electricityRate,
          battery: formData.battery,
          hasTou: formData.hasTOU,
          daytimeUsagePercent: formData.daytimeUsagePercent,
          joinVPP: formData.joinVPP,
          // Calculation results
          systemSize: parseFloat(estimatedSystemSize),
          expectedValue: results ? Math.round(results.ev) : 0,
          paybackYears: results ? results.scenarios.median.breakeven : 0,
          // UTM tracking
          utmSource: urlParams.get("utm_source"),
          utmMedium: urlParams.get("utm_medium"),
          utmCampaign: urlParams.get("utm_campaign")
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit");
      }
      setEmailSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto p-4 md:p-8", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-12 gap-8", children: [
    /* @__PURE__ */ jsxs("aside", { className: "lg:col-span-4 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-200", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-slate-900 mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs", children: "1" }),
          "Your Setup"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1", children: "Postcode" }),
            /* @__PURE__ */ jsx("input", { type: "text", maxLength: "4", className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5", placeholder: "e.g. 3000", value: formData.postcode, onChange: (e) => setFormData({ ...formData, postcode: e.target.value }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Roof Area" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-blue-600", children: [
                formData.roofSize,
                " m²"
              ] })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "range", min: "20", max: "150", step: "5", className: "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600", value: formData.roofSize, onChange: (e) => setFormData({ ...formData, roofSize: parseInt(e.target.value) }) }),
            /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-slate-400 mt-1 italic", children: [
              "Approx. ",
              estimatedSystemSize,
              " kW system capacity"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Daily Usage" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-blue-600", children: [
                formData.dailyUsage,
                " kWh"
              ] })
            ] }),
            /* @__PURE__ */ jsx("input", { type: "range", min: "5", max: "80", step: "5", className: "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600", value: formData.dailyUsage, onChange: (e) => setFormData({ ...formData, dailyUsage: parseInt(e.target.value) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1", children: "Battery Storage" }),
            /* @__PURE__ */ jsxs("select", { className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5", value: formData.battery, onChange: (e) => setFormData({ ...formData, battery: e.target.value }), children: [
              /* @__PURE__ */ jsx("option", { value: "none", children: "No Battery" }),
              /* @__PURE__ */ jsx("option", { value: "sungrow_10", children: "Sungrow SBR 10.2kWh (Cheapest)" }),
              /* @__PURE__ */ jsx("option", { value: "byd_hvs", children: "BYD HVS 10.2kWh" }),
              /* @__PURE__ */ jsx("option", { value: "tesla_powerwall3", children: "Tesla Powerwall 3 (13.5kWh)" }),
              /* @__PURE__ */ jsx("option", { value: "sonnen_eco", children: "Sonnen Eco 10 (Premium)" })
            ] }),
            batteryConfig && formData.battery !== "none" && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-green-600 mt-1 font-medium", children: [
              "💰 Federal rebate: ~$",
              Math.round(getFederalBatteryRebate(batteryConfig.batteries[formData.battery].capacity)).toLocaleString(),
              " off"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 cursor-pointer p-3 bg-slate-50 rounded-lg border border-slate-100", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-1 w-4 h-4 rounded text-blue-600", checked: formData.hasTOU, onChange: (e) => setFormData({ ...formData, hasTOU: e.target.checked }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-slate-700", children: "Time-of-Use Pricing" }),
              /* @__PURE__ */ jsx("a", { href: "/what-is-tou-pricing", className: "text-[11px] text-blue-600 hover:underline", children: "What's TOU pricing?" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-slate-200", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowAdvanced(!showAdvanced),
                className: "w-full text-left flex items-center justify-between text-sm font-semibold text-slate-600 hover:text-slate-900",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "Advanced Options" }),
                  /* @__PURE__ */ jsx("svg", { className: `w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
                ]
              }
            ),
            showAdvanced && /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4 p-4 bg-slate-50 rounded-lg", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-slate-700 mb-1", children: "Panel Orientation" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    className: "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm",
                    value: formData.orientation,
                    onChange: (e) => setFormData({ ...formData, orientation: e.target.value }),
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "north", children: "North (Optimal)" }),
                      /* @__PURE__ */ jsx("option", { value: "northeast", children: "North-East" }),
                      /* @__PURE__ */ jsx("option", { value: "northwest", children: "North-West" }),
                      /* @__PURE__ */ jsx("option", { value: "east", children: "East" }),
                      /* @__PURE__ */ jsx("option", { value: "west", children: "West" }),
                      /* @__PURE__ */ jsx("option", { value: "flat", children: "Flat Roof" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 mt-1 italic", children: "Affects output by up to 20%" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-sm font-semibold text-slate-700", children: "Daytime Usage" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-blue-600", children: [
                    formData.daytimeUsagePercent,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "range",
                    min: "20",
                    max: "60",
                    step: "5",
                    className: "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600",
                    value: formData.daytimeUsagePercent,
                    onChange: (e) => setFormData({ ...formData, daytimeUsagePercent: parseInt(e.target.value) })
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 mt-1 italic", children: "% used 9am-5pm (rest is evening)" })
              ] }),
              formData.battery !== "none" && /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 cursor-pointer p-3 bg-white rounded-lg border border-slate-200", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    className: "mt-1 w-4 h-4 rounded text-blue-600",
                    checked: formData.joinVPP,
                    onChange: (e) => setFormData({ ...formData, joinVPP: e.target.checked })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-slate-700", children: "Join a VPP" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500", children: "Earn $120-250/yr by sharing battery capacity" })
                ] })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: calculateEV, disabled: loadingSolar || !formData.postcode, className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 mt-4", children: loadingSolar ? "Processing Model..." : "Calculate 25-Year ROI" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-300 px-1", children: [
        /* @__PURE__ */ jsx("a", { href: "/privacy", className: "hover:text-slate-400", children: "Privacy" }),
        /* @__PURE__ */ jsx("span", { className: "mx-1", children: "·" }),
        /* @__PURE__ */ jsx("a", { href: "/disclaimer", className: "hover:text-slate-400", children: "Disclaimer" }),
        /* @__PURE__ */ jsx("span", { className: "mx-1", children: "·" }),
        /* @__PURE__ */ jsx("a", { href: "mailto:hello@solarmath.com.au", className: "hover:text-slate-400", children: "Contact" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "lg:col-span-8 space-y-6", children: !results ? /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-3xl p-10 md:p-12 text-center", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-2xl md:text-3xl font-black text-slate-900 mb-4", children: [
        "Ready to calculate your ",
        /* @__PURE__ */ jsx("i", { className: "text-blue-600", children: "optimal solar strategy?" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed", children: "Generate a realistic financial model based on Australian irradiance data, battery degradation, and federal rebates." }),
      /* @__PURE__ */ jsx("div", { className: "rounded-2xl overflow-hidden mx-auto mb-8", style: { maxWidth: "420px" }, children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "/images/hero-solar.png",
          alt: "Solar panels on Australian home",
          className: "w-full h-auto"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 justify-center text-xs text-slate-400", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
          "Federal + state rebates"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
          "TOU pricing"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
          "VPP earnings"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
          "25-year NPV"
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2 px-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-slate-800", children: "Investment Performance" }),
        /* @__PURE__ */ jsx("a", { href: "/methodology", className: "text-sm text-blue-600 hover:underline flex items-center gap-1", children: "See methodology →" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Expected NPV (25y)" }),
          /* @__PURE__ */ jsxs("p", { className: `text-3xl font-black ${results.ev >= 0 ? "text-green-600" : "text-red-600"}`, children: [
            "$",
            Math.round(results.ev).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Expected Breakeven" }),
          /* @__PURE__ */ jsxs("p", { className: "text-3xl font-black text-blue-600", children: [
            results.scenarios.median.breakeven,
            " Yrs"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-200", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Upfront Net Cost" }),
          /* @__PURE__ */ jsxs("p", { className: "text-3xl font-black text-slate-900", children: [
            "$",
            Math.round(results.investment).toLocaleString()
          ] }),
          results.batteryRebate > 0 && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-green-600 font-medium mt-1", children: [
            "Includes $",
            Math.round(results.batteryRebate).toLocaleString(),
            " battery rebate"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-8 rounded-3xl shadow-sm border border-slate-200", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-800 mb-6", children: "25-Year Expected Value Projection" }),
        /* @__PURE__ */ jsx("div", { className: "h-[400px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: results.timeSeries, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "year", axisLine: false, tickLine: false, tick: { fill: "#94a3b8", fontSize: 12 } }),
          /* @__PURE__ */ jsx(YAxis, { axisLine: false, tickLine: false, tick: { fill: "#94a3b8", fontSize: 12 }, tickFormatter: (v) => `$${v / 1e3}k` }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" } }),
          /* @__PURE__ */ jsx(Legend, { verticalAlign: "top", align: "right", iconType: "circle" }),
          /* @__PURE__ */ jsx(ReferenceLine, { y: 0, stroke: "#cbd5e1", strokeWidth: 2 }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "median", stroke: "#2563eb", strokeWidth: 4, dot: false, name: "Median (50th)" }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "p10", stroke: "#f87171", strokeWidth: 2, strokeDasharray: "4 4", dot: false, name: "Pessimistic (10th)" }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "p90", stroke: "#10b981", strokeWidth: 2, strokeDasharray: "4 4", dot: false, name: "Optimistic (90th)" })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 pt-4 border-t border-slate-100", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 text-sm", children: results.ev >= 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-green-600 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "Positive expected value. Try different configurations — a different battery or toggling TOU may improve returns." })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-amber-600 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "Negative expected value with current settings. Try enabling TOU pricing, a smaller/no battery, or adjusting your usage assumptions." })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-2xl font-black mb-2", children: "Get your full 25-year breakdown" }),
          /* @__PURE__ */ jsx("p", { className: "opacity-90 text-sm", children: "We'll send you a personalized PDF with year-by-year cashflow projections, inverter replacement timing, and the hidden maintenance costs most calculators ignore." })
        ] }),
        emailSubmitted ? /* @__PURE__ */ jsxs("div", { className: "bg-white/10 rounded-xl p-6 text-center backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto mb-3 text-green-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Check your inbox to confirm and get your report." })
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleEmailSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "your@email.com",
                required: true,
                disabled: submitLoading,
                className: "flex-1 w-full px-5 py-4 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: submitLoading,
                className: "w-full md:w-auto bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-lg disabled:opacity-50",
                children: submitLoading ? "Sending..." : "Get My Report"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: marketingConsent,
                onChange: (e) => setMarketingConsent(e.target.checked),
                className: "mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600 focus:ring-white/50"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm opacity-80", children: "Also send me Solar Alpha — monthly insights on rebates, battery prices, and solar intel" })
          ] }),
          submitError && /* @__PURE__ */ jsx("p", { className: "text-red-200 text-sm", children: submitError })
        ] })
      ] })
    ] }) })
  ] }) });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Solar Panel Decision Calculator | Expected Value Analysis" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SolarEVCalculator", SolarEVCalculator, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Jay/Trawl/solarcalc/src/components/SolarEVCalculator", "client:component-export": "default" })}  ${maybeRenderHead()}<section id="signup" class="bg-blue-900 py-10 px-6 mt-12"> <div class="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6"> <div class="md:max-w-lg"> <h2 class="text-2xl font-bold text-white mb-2">Solar Alpha: Intel To Save You Thousands</h2> <p class="text-blue-200 text-sm">
Rebate deadlines. Battery price crashes. The "hidden costs" that installers conveniently forget to mention. One email per month.
</p> </div> <form class="flex flex-col sm:flex-row gap-3 shrink-0"> <input type="email" placeholder="your@email.com" class="px-4 py-3 rounded-lg text-slate-900 w-full sm:w-48 outline-none focus:ring-2 focus:ring-yellow-400"> <button class="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-lg transition shadow-lg whitespace-nowrap">
Get the Intel
</button> </form> </div> </section> ` })}`;
}, "C:/Users/Jay/Trawl/solarcalc/src/pages/index.astro", void 0);

const $$file = "C:/Users/Jay/Trawl/solarcalc/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

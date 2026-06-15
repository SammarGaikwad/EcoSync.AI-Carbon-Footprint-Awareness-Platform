import React, { useState, useEffect } from 'react';
import { 
  Leaf, Flame, Zap, Navigation, ShieldCheck, 
  MessageSquare, ArrowUpRight, Sliders, Clipboard, 
  RefreshCw, AlertCircle, Sparkles, CheckCircle2,
  Plug, Brain, Key, Eye, EyeOff, Cpu, Globe, Info,
  TrendingUp, CheckSquare, Square, BarChart3, Activity
} from 'lucide-react';
import { parseLocalLog, parseWithGeminiAI } from './utils/parserEngine';
import { calculateDailyImpact } from './utils/calculationCore';
import EcoAvatar from './components/EcoAvatar';
import CarbonCoefficients from './components/CarbonCoefficients';
import ImpactCategories from './components/ImpactCategories';
import DeveloperConsole from './components/DeveloperConsole';

// Scientific default coefficients (kg CO2e)
const SCIENTIFIC_DEFAULTS = {
  car: 0.20,
  scooter: 0.10,
  transit: 0.02,
  dietHigh: 6.00,
  dietMed: 1.50,
  dietLow: 0.40,
  applianceHigh: 0.80,
  energyGrid: 0.50
};

// Preset Logs
const PRESETS = {
  eco: `This morning, I commuted 15 km by metro instead of taking my petrol car. 
For lunch, I had a delicious vegan wrap instead of my usual chicken meal. 
At home, I managed to keep the AC off.`,
  
  commute: `I drove my car for 45 km to attend an out-of-town meeting in the morning.
In the afternoon, I rode my scooter for 8 km to grab groceries. 
Had a quick chicken wrap for dinner.`,
  
  mixed: `Rode my scooter for 10 km to the office instead of driving my car. 
Had a high-impact beef burger for lunch (oops). 
Ran the air conditioner for 5 hours in the evening.`
};

export default function App() {
  // --- React State ---
  const [draftPrompt, setDraftPrompt] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("breakdown"); // "breakdown" | "json"
  const [showConfig, setShowConfig] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [currentLocalTime, setCurrentLocalTime] = useState("");
  
  // Custom carbon factors
  const [factors, setFactors] = useState({ ...SCIENTIFIC_DEFAULTS });
  
  // Parsed Engine Outputs
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState({
    total_emitted_kg: 0.0,
    total_saved_kg: 0.0
  });
  const [contextualNudge, setContextualNudge] = useState(
    "Please share details about your transportation, meals, or appliance usage today to calculate your environmental footprint."
  );

  // New API Parser configuration states
  const [parserMode, setParserMode] = useState(() => {
    return localStorage.getItem("ecosync_parser_mode") || "local";
  });

  const [apiError, setApiError] = useState("");

  // Cache state to avoid duplicate API requests during slider changes
  const [cachedPayload, setCachedPayload] = useState(null);
  const [cachedText, setCachedText] = useState("");
  const [cachedMode, setCachedMode] = useState("");

  // Historical log tracking state
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem("ecosync_historical_footprints");
    return stored ? JSON.parse(stored) : [];
  });
  const [toastMessage, setToastMessage] = useState("Minified JSON Copied to Clipboard!");

  // New View Navigation and Pledges state
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard" | "analytics"
  const [pledges, setPledges] = useState([
    { id: 1, text: "Commit to public transit over driving (Saves ~3.5 kg/day)", savings: 3.5, active: false },
    { id: 2, text: "Eat plant-based vegan lunch instead of meat (Saves ~1.8 kg/meal)", savings: 1.8, active: false },
    { id: 3, text: "Turn off AC and use eco-ventilation (Saves ~2.4 kg/day)", savings: 2.4, active: false },
    { id: 4, text: "Unplug standby vampire appliances (Saves ~0.6 kg/day)", savings: 0.6, active: false },
    { id: 5, text: "Transition to 100% solar/renewables grid (Saves ~5.0 kg/day)", savings: 5.0, active: false }
  ]);

  // Derived pledged savings sum
  const pledgedSavings = pledges
    .filter(p => p.active)
    .reduce((sum, p) => sum + p.savings, 0);

  // Set system clock
  useEffect(() => {
    setCurrentLocalTime(new Date().toLocaleString());
    const timer = setInterval(() => {
      setCurrentLocalTime(new Date().toLocaleString());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Persist configurations to localStorage
  useEffect(() => {
    localStorage.setItem("ecosync_parser_mode", parserMode);
  }, [parserMode]);



  // --- Dynamic Nudge Generator ---
  const generateNudge = (activitiesList, totalEmitted, totalSaved) => {
    if (activitiesList.length === 0) {
      return "Please share details about your transportation, meals, or appliance usage today to calculate your environmental footprint.";
    }

    const metroActivity = activitiesList.find(a => a.category === 'mobility' && a._savings_kg > 0 && a.description.toLowerCase().includes('metro'));
    const veganActivity = activitiesList.find(a => a.category === 'diet' && a._savings_kg > 0 && (a.description.toLowerCase().includes('vegan') || a.description.toLowerCase().includes('low-impact') || a.description.toLowerCase().includes('salad')));

    if (metroActivity && veganActivity) {
      return `Outstanding choice! By commuting by metro and opting for a plant-based meal, you saved ${totalSaved.toFixed(1)} kg of CO₂ today. Great job!`;
    }
    if (metroActivity) {
      return `Great job on taking the metro! You saved ${metroActivity._savings_kg.toFixed(1)} kg of CO₂ today compared to driving.`;
    }
    if (veganActivity) {
      return `Excellent diet choice! Eating a low-impact meal saved you ${veganActivity._savings_kg.toFixed(1)} kg of CO₂ today.`;
    }

    let catTotals = { mobility: 0, diet: 0, appliances: 0, energy: 0 };
    activitiesList.forEach(act => {
      catTotals[act.category] += act.carbon_impact_kg;
    });

    let maxCat = "mobility";
    let maxVal = catTotals.mobility;
    Object.entries(catTotals).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });

    if (totalSaved > 2.0) {
      return `Outstanding work saving ${totalSaved.toFixed(1)} kg CO₂e today by choosing sustainable transit and meal alternatives—keep it up!`;
    }

    if (maxCat === "mobility" && maxVal > 0) {
      return `Your mobility choices contributed ${maxVal.toFixed(1)} kg CO₂e; try choosing public rail, metro transit, or electric scooters for your next commute.`;
    }

    if (maxCat === "diet" && maxVal > 0) {
      return `Your diet contributed ${maxVal.toFixed(1)} kg CO₂e today; incorporating more low-impact vegetarian or plant-based meals can drastically reduce this footprint.`;
    }

    if (maxCat === "appliances" && maxVal > 0) {
      return `High-draw appliances contributed ${maxVal.toFixed(1)} kg CO₂e today; consider using natural ventilation, setting geyser timers, or using appliance eco-modes.`;
    }

    if (maxCat === "energy" && maxVal > 0) {
      return `Your grid energy consumption contributed ${maxVal.toFixed(1)} kg CO₂e today; consider transitioning to solar or green energy providers to lower this footprint.`;
    }

    return "Small daily adjustments like choosing rail transits or low-impact diet options can help you lower your carbon footprint tomorrow.";
  };

  // Helper to update state variables after local/offline parsing
  const updateStateAfterParsing = (parsedResult) => {
    const mappedActivities = parsedResult.activities.map(act => ({
      timestamp_marker: "Current",
      description: act.description,
      category: act.category,
      carbon_impact_kg: act.emitted,
      _savings_kg: act.savings || 0.0
    }));

    setActivities(mappedActivities);
    setSummary({
      total_emitted_kg: parseFloat(parsedResult.totalEmitted.toFixed(2)),
      total_saved_kg: parseFloat(parsedResult.totalSaved.toFixed(2))
    });
    setContextualNudge(generateNudge(mappedActivities, parsedResult.totalEmitted, parsedResult.totalSaved));
  };

  // --- Calculation Pipeline Trigger ---
  const executeCalculation = async (logText, activeFactors, currentMode = parserMode) => {
    if (!logText.trim()) {
      setActivities([]);
      setSummary({ total_emitted_kg: 0.0, total_saved_kg: 0.0 });
      setContextualNudge("Please share details about your transportation, meals, or appliance usage today to calculate your environmental footprint.");
      setApiError("");
      setCachedPayload(null);
      setCachedText("");
      setCachedMode("");
      return;
    }

    setApiError("");

    const coefficients = {
      automobile: activeFactors.car,
      scooter: activeFactors.scooter,
      metroTransit: activeFactors.transit,
      highImpactMeal: activeFactors.dietHigh,
      mediumImpactMeal: activeFactors.dietMed,
      lowImpactMeal: activeFactors.dietLow,
      highDrawAppliance: activeFactors.applianceHigh,
    };

    // Check cache to avoid redundant parse calls during coefficient updates
    if (logText === cachedText && currentMode === cachedMode && cachedPayload !== null) {
      const evaluation = calculateDailyImpact(cachedPayload, coefficients);
      const isAI = currentMode === "gemini";
      const reconstructedActivities = [];

      if (cachedPayload.mobility.mode !== 'none' && cachedPayload.mobility.distanceKm > 0) {
        let savings = 0;
        if (coefficients[cachedPayload.mobility.mode] < coefficients.automobile) {
          savings = (cachedPayload.mobility.distanceKm * coefficients.automobile) - evaluation.mobilityEmitted;
        }
        reconstructedActivities.push({
          timestamp_marker: "Current",
          description: `Traveled ${cachedPayload.mobility.distanceKm} km by ${cachedPayload.mobility.vehicleName || (cachedPayload.mobility.mode === 'metroTransit' ? 'metro transit' : cachedPayload.mobility.mode)}${isAI ? ' (AI Parsed)' : ''}`,
          category: 'mobility',
          carbon_impact_kg: evaluation.mobilityEmitted,
          _savings_kg: savings
        });
      }

      if (cachedPayload.diet.mealImpact !== 'none') {
        let savings = 0;
        if (cachedPayload.diet.mealImpact === 'low-impact') {
          savings = coefficients.highImpactMeal - coefficients.lowImpactMeal;
        }
        const label = cachedPayload.diet.dietDesc || (cachedPayload.diet.mealImpact === 'low-impact' ? 'Low-Impact Eco Meal' : cachedPayload.diet.mealImpact === 'medium-impact' ? 'Medium-Impact Meal' : 'High-Impact Meat Meal');
        reconstructedActivities.push({
          timestamp_marker: "Current",
          description: `${label}${isAI ? ' (AI Parsed)' : ''}`,
          category: 'diet',
          carbon_impact_kg: evaluation.dietEmitted,
          _savings_kg: savings
        });
      }

      if (cachedPayload.appliances.durationHours > 0) {
        const label = cachedPayload.appliances.applianceName || "high-draw appliance";
        reconstructedActivities.push({
          timestamp_marker: "Current",
          description: `Ran ${label} for ${cachedPayload.appliances.durationHours} hours${isAI ? ' (AI Parsed)' : ''}`,
          category: 'appliances',
          carbon_impact_kg: evaluation.applianceEmitted,
          _savings_kg: 0
        });
      }

      setActivities(reconstructedActivities);
      setSummary({
        total_emitted_kg: parseFloat(evaluation.totalEmitted.toFixed(2)),
        total_saved_kg: parseFloat(evaluation.totalSaved.toFixed(2))
      });
      setContextualNudge(generateNudge(reconstructedActivities, evaluation.totalEmitted, evaluation.totalSaved));
      return;
    }

    // Fresh calculation
    if (currentMode === "gemini") {
      setIsProcessing(true);
      try {
        const result = await parseWithGeminiAI(logText, coefficients);
        setCachedPayload(result.parsedPayload);
        setCachedText(logText);
        setCachedMode("gemini");
        updateStateAfterParsing(result);
      } catch (err) {
        console.error("Gemini Parsing Error, falling back to local regex: ", err);
        setApiError(`Gemini AI failed: ${err.message}. Reverting automatically to offline Local Parser...`);
        const fallbackResult = parseLocalLog(logText, coefficients);
        setCachedPayload(fallbackResult.parsedPayload);
        setCachedText(logText);
        setCachedMode("local");
        updateStateAfterParsing(fallbackResult);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Local offline regex parsing
      const result = parseLocalLog(logText, coefficients);
      setCachedPayload(result.parsedPayload);
      setCachedText(logText);
      setCachedMode("local");
      updateStateAfterParsing(result);
    }
  };

  // Run parser on change of prompt or factors
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!draftPrompt.trim()) return;

    setPrompt(draftPrompt);
    if (parserMode === "local") {
      setIsProcessing(true);
      setTimeout(() => {
        executeCalculation(draftPrompt, factors, "local");
        setIsProcessing(false);
      }, 350);
    } else {
      await executeCalculation(draftPrompt, factors, "gemini");
    }
  };

  // Re-run instantly when coefficients change
  const handleFactorChange = (key, value) => {
    const parsedVal = isNaN(parseFloat(value)) ? 0.0 : parseFloat(value);
    const updated = { ...factors, [key]: parsedVal };
    setFactors(updated);
    if (prompt.trim()) {
      executeCalculation(prompt, updated, parserMode);
    }
  };

  const handleResetCoefficients = () => {
    setFactors({ ...SCIENTIFIC_DEFAULTS });
    if (prompt.trim()) {
      executeCalculation(prompt, SCIENTIFIC_DEFAULTS, parserMode);
    }
  };

  const handlePresetSelect = (presetKey) => {
    if (PRESETS[presetKey]) {
      setDraftPrompt(PRESETS[presetKey]);
      setPrompt(PRESETS[presetKey]);
      executeCalculation(PRESETS[presetKey], factors, parserMode);
    }
  };

  const handleClear = () => {
    setDraftPrompt("");
    setPrompt("");
    setActivities([]);
    setSummary({ total_emitted_kg: 0.0, total_saved_kg: 0.0 });
    setContextualNudge("Please share details about your transportation, meals, or appliance usage today to calculate your environmental footprint.");
    setApiError("");
    setCachedPayload(null);
    setCachedText("");
    setCachedMode("");
  };

  const togglePledge = (id) => {
    setPledges(pledges.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  // --- Gamified Eco Avatar Engine ---
  const getAvatarState = () => {
    const net = (summary.total_saved_kg + pledgedSavings) - summary.total_emitted_kg;
    const dynamicHealth = Math.max(0, Math.min(100, Math.round(100 - (summary.total_emitted_kg * 4))));
    if (activities.length === 0 && pledgedSavings === 0) {
      return { level: "Seedling Sprout", health: 50, color: "w-1/2 bg-zinc-500", desc: "No logs logged today — Avatar dormant" };
    }
    if (net >= 6) {
      return { level: "Old Growth Forest", health: dynamicHealth, color: "w-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]", desc: `${dynamicHealth}% health — Peak offset achieved!` };
    }
    if (net >= 2) {
      return { level: "Blooming Canopy", health: dynamicHealth, color: "w-4/5 bg-emerald-400", desc: `${dynamicHealth}% health — Exceptional carbon savings today` };
    }
    if (net >= -1) {
      return { level: "Young Sapling", health: dynamicHealth, color: "w-[55%] bg-cyan-400", desc: `${dynamicHealth}% health — Close to carbon neutral. Keep going!` };
    }
    if (net >= -10) {
      return { level: "Sprout", health: dynamicHealth, color: "w-[30%] bg-amber-500", desc: `${dynamicHealth}% health — High emissions are outstripping savings` };
    }
    return { level: "Dry Scrubland", health: dynamicHealth, color: "w-[10%] bg-rose-500", desc: `${dynamicHealth}% health — Critical footprint warning!` };
  };

  const avatar = getAvatarState();

  // --- JSON Exporter ---
  const targetJSON = {
    summary: {
      total_emitted_kg: summary.total_emitted_kg,
      total_saved_kg: summary.total_saved_kg
    },
    activities: activities.map(act => ({
      timestamp_marker: act.timestamp_marker,
      description: act.description,
      category: act.category,
      carbon_impact_kg: act.carbon_impact_kg
    })),
    contextual_nudge: contextualNudge
  };

  const minifiedJSONString = JSON.stringify(targetJSON);

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(minifiedJSONString).then(() => {
      setToastMessage("Minified JSON Copied to Clipboard!");
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    });
  };

  const saveCurrentDayToHistory = () => {
    const categoryTotals = { mobility: 0, diet: 0, appliances: 0, energy: 0 };
    activities.forEach(act => {
      if (categoryTotals[act.category] !== undefined) {
        categoryTotals[act.category] += act.carbon_impact_kg;
      }
    });

    const todayFootprint = {
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      emitted: summary.total_emitted_kg,
      saved: summary.total_saved_kg + pledgedSavings,
      mobility: categoryTotals.mobility,
      diet: categoryTotals.diet,
      appliances: categoryTotals.appliances,
      energy: categoryTotals.energy
    };

    const updatedHistory = [...history, todayFootprint].slice(-7);
    setHistory(updatedHistory);
    localStorage.setItem("ecosync_historical_footprints", JSON.stringify(updatedHistory));
    
    setToastMessage("Current day logged to weekly history!");
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  // Compute Rolling Baseline & Deltas
  const calculateDeltas = () => {
    if (history.length === 0) {
      return {
        mobility: { percent: 0, text: "No baseline (0 kg)" },
        diet: { percent: 0, text: "No baseline (0 kg)" },
        appliances: { percent: 0, text: "No baseline (0 kg)" },
        overall: { percent: 0, text: "No baseline (0 kg)" }
      };
    }

    const count = history.length;
    const avgMobility = history.reduce((sum, h) => sum + h.mobility, 0) / count;
    const avgDiet = history.reduce((sum, h) => sum + h.diet, 0) / count;
    const avgAppliances = history.reduce((sum, h) => sum + h.appliances, 0) / count;
    const avgOverall = history.reduce((sum, h) => sum + h.emitted, 0) / count;

    const getDeltaVal = (today, avg) => {
      if (avg === 0) {
        return today > 0 
          ? { percent: 100, text: `▲ 100% higher than baseline`, isIncrease: true }
          : { percent: 0, text: "Same as baseline", isIncrease: false };
      }
      const diff = today - avg;
      const pct = (diff / avg) * 100;
      const rounded = Math.round(pct);
      if (rounded > 0) return { percent: rounded, text: `▲ ${rounded}% higher than baseline`, isIncrease: true };
      if (rounded < 0) return { percent: Math.abs(rounded), text: `▼ ${Math.abs(rounded)}% lower than baseline`, isIncrease: false };
      return { percent: 0, text: "Same as baseline", isIncrease: false };
    };

    return {
      mobility: getDeltaVal(categoryTotals.mobility, avgMobility),
      diet: getDeltaVal(categoryTotals.diet, avgDiet),
      appliances: getDeltaVal(categoryTotals.appliances, avgAppliances),
      overall: getDeltaVal(summary.total_emitted_kg, avgOverall)
    };
  };

  // Compute category details for visual progress bars
  const categoryTotals = { mobility: 0, diet: 0, appliances: 0, energy: 0 };
  activities.forEach(act => {
    if (categoryTotals[act.category] !== undefined) {
      categoryTotals[act.category] += act.carbon_impact_kg;
    }
  });

  const deltas = calculateDeltas();

  const getCategoryPercent = (catVal) => {
    if (summary.total_emitted_kg === 0) return 0;
    return (catVal / summary.total_emitted_kg) * 100;
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black flex flex-col justify-between">
      
      {/* 1. Header Navigation */}
      <nav className="border-b border-zinc-800/80 bg-[#070a13]/85 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-400 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] animate-pulse" />
          <span className="font-bold tracking-wider text-xl uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            EcoSync<span className="text-emerald-400">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-sm text-zinc-400 flex-wrap justify-center">
          <button 
            onClick={() => setCurrentView("dashboard")} 
            aria-label="View Dashboard"
            className={`font-medium transition pb-1 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a13] rounded ${currentView === 'dashboard' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView("analytics")} 
            aria-label="View Analytics"
            className={`font-medium transition pb-1 cursor-pointer bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a13] rounded ${currentView === 'analytics' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Analytics
          </button>
          <div className="h-6 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full text-zinc-300 font-mono text-xs whitespace-nowrap">
            <span className={`h-2 w-2 rounded-full ${parserMode === 'gemini' ? 'bg-cyan-400' : 'bg-emerald-400'} animate-ping`}></span>
            <span>
              <span className="hidden sm:inline">ENGINE: </span>
              {parserMode === 'gemini' ? 'GEMINI AI' : 'LOCAL REGEX'}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6 flex-1 w-full">
        
        {/* 2. Top Metrics Overview Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          
          {/* Card 1: Net Carbon Output */}
          <div className="bg-[#0e1423] border border-zinc-800/60 rounded-xl p-5 relative overflow-hidden group hover:border-rose-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition duration-300">
            <div className="flex justify-between items-start text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Total Emitted</span>
              <Flame className="w-5 h-5 text-rose-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black font-mono tracking-tight text-white">
                {summary.total_emitted_kg.toFixed(2)} <span className="text-xs font-normal text-zinc-400">kg CO₂e</span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Computed footprint today</p>
            </div>
          </div>

          {/* Card 2: Total Carbon Saved */}
          <div className="bg-[#0e1423] border border-zinc-800/60 rounded-xl p-5 group hover:border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition duration-300">
            <div className="flex justify-between items-start text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Total Saved</span>
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black font-mono tracking-tight text-emerald-400">
                {(summary.total_saved_kg + pledgedSavings).toFixed(2)} <span className="text-xs font-normal text-zinc-400">kg CO₂e</span>
              </h3>
              <p className="text-[11px] text-emerald-300 font-mono">Alternative choices & pledges</p>
            </div>
          </div>

          {/* Card 3: Appliance Hours */}
          <div className="bg-[#0e1423] border border-zinc-800/60 rounded-xl p-5 group hover:border-amber-500/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition duration-300">
            <div className="flex justify-between items-start text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Appliance Factor</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black font-mono tracking-tight text-white">
                {factors.applianceHigh.toFixed(2)} <span className="text-xs font-normal text-zinc-400">kg/hr</span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">High-draw appliance coefficient</p>
            </div>
          </div>

          {/* Card 4: Eco Avatar State */}
          <EcoAvatar netImpact={summary.total_saved_kg + pledgedSavings - summary.total_emitted_kg} avatarState={avatar} />
        </section>

        {currentView === "dashboard" ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Left Columns (Input & Visual Streams) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Input Log Card */}
              <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight">Daily Unstructured Log Parser</h2>
                    <span className="text-[11px] text-zinc-500 font-mono">NLP Calculation Sandbox</span>
                  </div>
                  
                  <form onSubmit={handleAISubmit} className="space-y-4">
                    <div className="relative">
                      <textarea 
                        value={draftPrompt}
                        onChange={(e) => setDraftPrompt(e.target.value)}
                        placeholder="e.g., Yesterday morning I commuted 20 km by train instead of my car. Had a low-impact meal for lunch..."
                        aria-label="Daily unstructured activity log text input"
                        className="w-full h-36 bg-zinc-950/70 border border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-lg p-4 text-zinc-200 placeholder-zinc-600 outline-none transition text-sm font-mono tracking-wide shadow-inner"
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
                        NATURAL LANGUAGE TEXT
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-zinc-500">Presets:</span>
                        <button 
                          type="button" 
                          onClick={() => handlePresetSelect("eco")} 
                          aria-label="Load Eco Day Preset"
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-md transition flex items-center gap-1 font-mono focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                        >
                          🌱 Eco Day
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handlePresetSelect("commute")} 
                          aria-label="Load Commuter Preset"
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-md transition flex items-center gap-1 font-mono focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                        >
                          🚗 Commuter
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handlePresetSelect("mixed")} 
                          aria-label="Load Mixed Logs Preset"
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-md transition flex items-center gap-1 font-mono focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                        >
                          ⚡ Mixed Logs
                        </button>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          type="button" 
                          onClick={handleClear} 
                          aria-label="Clear current log and results"
                          className="w-full sm:w-auto bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-rose-400 text-xs px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                        >
                          Clear
                        </button>
                        <button 
                          type="button"
                          onClick={saveCurrentDayToHistory}
                          aria-label="Save current day to weekly history"
                          className="w-full sm:w-auto bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white text-xs px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                        >
                          <Clipboard className="w-3.5 h-3.5" /> Save Day
                        </button>
                        <button 
                          type="submit" 
                          disabled={isProcessing}
                          aria-label="Parse log and compute footprint"
                          className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-black font-semibold px-6 py-2.5 rounded-lg text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                        >
                          {isProcessing ? (
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                          ) : (
                            <>Parse Log <ArrowUpRight className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Config & Activity Logs Area */}
              <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl space-y-6">
                
                {/* Tab Header */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab("breakdown")} 
                      className={`font-bold text-sm uppercase tracking-wider pb-2 border-b-2 transition ${activeTab === 'breakdown' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Footprint Analysis
                    </button>
                    <button 
                      onClick={() => setActiveTab("json")} 
                      className={`font-bold text-sm uppercase tracking-wider pb-2 border-b-2 transition ${activeTab === 'json' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Developer Console (JSON)
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{activities.length} entries parsed</span>
                </div>

                {activeTab === "breakdown" ? (
                  <div className="space-y-6">
                    {/* Category Progress Fill Breakdown */}
                    <ImpactCategories categoryTotals={categoryTotals} totalEmitted={summary.total_emitted_kg} />

                    {/* Activity stream list table */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Activity Stream</h4>
                      {activities.length === 0 ? (
                        <div className="border border-dashed border-zinc-700/80 rounded-lg p-8 text-center text-sm text-zinc-400 bg-zinc-950/20">
                          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2 animate-pulse" />
                          No environmental activities currently parsed. Load a preset or enter text above!
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scroll">
                          {activities.map((item, index) => {
                            // Style the cards with green tints for saved actions and amber/red tints for emitted carbon
                            let cardStyles = "bg-zinc-950/40 border-zinc-900/60 text-zinc-200 hover:bg-zinc-950/80";
                            if (item._savings_kg > 0) {
                              cardStyles = "bg-emerald-950/15 border-emerald-900/30 text-emerald-100 hover:bg-emerald-950/25 shadow-[0_0_8px_rgba(16,185,129,0.05)]";
                            } else if (item.carbon_impact_kg >= 4.0) {
                              cardStyles = "bg-rose-950/15 border-rose-900/30 text-rose-100 hover:bg-rose-950/25 shadow-[0_0_8px_rgba(239,68,68,0.05)]";
                            } else if (item.carbon_impact_kg > 0) {
                              cardStyles = "bg-amber-950/10 border-amber-900/20 text-amber-100 hover:bg-amber-950/20";
                            }

                            return (
                              <div key={index} className={`flex justify-between items-center border rounded-lg p-3.5 text-xs font-mono transition duration-150 ${cardStyles}`}>
                                <div className="flex items-start gap-3 flex-1 min-w-0 mr-3">
                                  <span className="text-zinc-600 font-semibold shrink-0 mt-0.5">{item.timestamp_marker}</span>
                                  <div className="min-w-0">
                                    <span className="block whitespace-normal font-sans text-sm">{item.description}</span>
                                    {item._savings_kg > 0 && (
                                      <span className="text-emerald-400 text-[10px] block mt-0.5 font-sans font-semibold">
                                        Saved +{item._savings_kg.toFixed(2)} kg CO₂e
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 
                                    ${item.category === 'mobility' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20' : ''} 
                                    ${item.category === 'diet' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : ''} 
                                    ${item.category === 'appliances' ? 'bg-orange-950/40 text-orange-400 border border-orange-500/20' : ''} 
                                    ${item.category === 'energy' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/20' : ''}`}
                                  >
                                    {item.category}
                                  </span>
                                  <span className="font-semibold text-sm whitespace-nowrap">{item.carbon_impact_kg.toFixed(2)} kg</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Developer JSON Export view */
                  <DeveloperConsole minifiedJSONString={minifiedJSONString} handleCopyClipboard={handleCopyClipboard} />
                )}
              </div>

            </div>

            {/* Right Column (Sliders & Insights) */}
            <div className="space-y-6">
              
              {/* Contextual Nudges */}
              <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-zinc-800 pb-3">
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="font-bold text-lg tracking-tight">Contextual Nudge</h3>
                </div>
                
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-500"></div>
                  <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    Calculations Recommendation
                  </span>
                  <div className="flex items-start gap-2.5 mt-1.5">
                    <Info className="w-4.5 h-4.5 text-emerald-400/70 shrink-0 mt-0.5" />
                    <p className="text-zinc-300 text-xs leading-relaxed font-sans font-medium">
                      {contextualNudge}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Parser & API Key Configuration Card */}
              <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 border-b border-zinc-800 pb-3">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-lg tracking-tight">AI Parser Config</h3>
                </div>

                <div className="space-y-4">
                  {/* Engine Selector buttons */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-zinc-400 block">PARSING ENGINE</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setParserMode("local");
                          executeCalculation(prompt, factors, "local");
                        }}
                        aria-label="Set parsing engine to Offline Regex"
                        className={`py-2 px-3 rounded-lg font-mono text-[10px] uppercase font-bold border transition flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                          parserMode === "local"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                            : "bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Offline Regex
                      </button>
                      <button
                        onClick={() => {
                          setParserMode("gemini");
                          executeCalculation(prompt, factors, "gemini");
                        }}
                        aria-label="Set parsing engine to Gemini AI"
                        className={`py-2 px-3 rounded-lg font-mono text-[10px] uppercase font-bold border transition flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                          parserMode === "gemini"
                            ? "bg-cyan-950/40 text-cyan-400 border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                            : "bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        Gemini 2.5 AI
                      </button>
                    </div>
                  </div>

                  {/* API Info Callout */}
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans font-medium flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <span>
                      {parserMode === "gemini" 
                        ? "Secure cloud extraction powered by Gemini 2.5 AI. Your requests are proxied securely through our backend to protect credentials."
                        : "Lightweight local extraction. Handles distances, standard foods, and appliances offline."
                      }
                    </span>
                  </p>

                  {/* API Error Display */}
                  {apiError && (
                    <div className="bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-lg p-3 text-[10px] font-mono leading-normal flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Slider Coefficients Configuration */}
              <CarbonCoefficients 
                factors={factors}
                handleFactorChange={handleFactorChange}
                handleResetCoefficients={handleResetCoefficients}
                showConfig={showConfig}
                setShowConfig={setShowConfig}
              />

            </div>

          </section>
        ) : (
          /* Render the Analytics Panel */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
             {/* Left Columns (Charts and Pledges) */}
             <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Emissions Distribution Card */}
                <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                   
                   <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
                     <div className="flex items-center gap-2">
                       <BarChart3 className="w-5 h-5 text-cyan-400" />
                       <h3 className="font-bold text-lg tracking-tight">Emissions Distribution</h3>
                     </div>
                     <span className="text-[10px] text-zinc-500 font-mono">Real-Time Data Share</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                     {/* SVG Donut Chart */}
                     <div className="flex justify-center relative">
                       <svg viewBox="0 0 160 160" className="w-48 h-48 transform -rotate-90">
                         {/* Base grey background ring */}
                         <circle cx="80" cy="80" r="60" fill="none" stroke="#18181b" strokeWidth="16" />
                         
                         {(() => {
                            const total = summary.total_emitted_kg;
                            if (total === 0) {
                              return (
                                <circle cx="80" cy="80" r="60" fill="none" stroke="#27272a" strokeWidth="16" strokeDasharray="376.99" />
                              );
                            }
                            
                            const circ = 2 * Math.PI * 60; // 376.99
                            const segments = [
                              { value: categoryTotals.mobility, color: "#06b6d4" },
                              { value: categoryTotals.diet, color: "#10b981" },
                              { value: categoryTotals.appliances, color: "#f97316" },
                              { value: categoryTotals.energy, color: "#fbbf24" }
                            ];

                            let currentOffset = 0;
                            return (
                              <>
                                {segments.map((seg, idx) => {
                                  if (seg.value === 0) return null;
                                  const share = (seg.value / total) * circ;
                                  const segmentOffset = currentOffset;
                                  currentOffset += share;
                                  return (
                                    <circle 
                                      key={idx}
                                      cx="80" 
                                      cy="80" 
                                      r="60" 
                                      fill="none" 
                                      stroke={seg.color} 
                                      strokeWidth="16" 
                                      strokeDasharray={`${share} ${circ}`} 
                                      strokeDashoffset={-segmentOffset} 
                                      className="transition-all duration-1000 ease-out"
                                    />
                                  );
                                })}
                              </>
                            );
                          })()}
                       </svg>

                       {/* Central Readout */}
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black font-mono text-white leading-none">
                           {summary.total_emitted_kg.toFixed(1)}
                         </span>
                         <span className="text-[10px] text-zinc-500 font-mono tracking-wider mt-1 uppercase">
                           kg CO₂e Emitted
                         </span>
                       </div>
                     </div>

                     {/* Details Legend */}
                     <div className="space-y-4 font-mono text-xs">
                       {/* Mobility */}
                       <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                         <div className="flex items-center gap-2">
                           <span className="h-3.5 w-3.5 rounded bg-cyan-400"></span>
                           <span className="text-zinc-300">Mobility</span>
                         </div>
                         <span className="text-white font-bold">
                           {categoryTotals.mobility.toFixed(2)} kg ({Math.round(getCategoryPercent(categoryTotals.mobility)) || 0}%)
                         </span>
                       </div>
                       
                       {/* Diet */}
                       <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                         <div className="flex items-center gap-2">
                           <span className="h-3.5 w-3.5 rounded bg-emerald-400"></span>
                           <span className="text-zinc-300">Diet</span>
                         </div>
                         <span className="text-white font-bold">
                           {categoryTotals.diet.toFixed(2)} kg ({Math.round(getCategoryPercent(categoryTotals.diet)) || 0}%)
                         </span>
                       </div>

                       {/* Appliances */}
                       <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                         <div className="flex items-center gap-2">
                           <span className="h-3.5 w-3.5 rounded bg-orange-500"></span>
                           <span className="text-zinc-300">Appliances</span>
                         </div>
                         <span className="text-white font-bold">
                           {categoryTotals.appliances.toFixed(2)} kg ({Math.round(getCategoryPercent(categoryTotals.appliances)) || 0}%)
                         </span>
                       </div>

                       {/* Energy */}
                       <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                         <div className="flex items-center gap-2">
                           <span className="h-3.5 w-3.5 rounded bg-yellow-400"></span>
                           <span className="text-zinc-300">Energy</span>
                         </div>
                         <span className="text-white font-bold">
                           {categoryTotals.energy.toFixed(2)} kg ({Math.round(getCategoryPercent(categoryTotals.energy)) || 0}%)
                         </span>
                       </div>
                     </div>
                   </div>
                </div>

                {/* 2. Sustainability Pledges & Actions Checklist */}
                <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold text-lg tracking-tight">Sustainability Pledge Actions</h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20">
                      Impact Offsetter
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Check off sustainability commitments to dynamically boost your daily carbon savings. Watch your Eco Avatar grow in real-time as you commit to carbon-neutral goals!
                  </p>

                  <div className="space-y-3 pt-2">
                    {pledges.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => togglePledge(item.id)}
                        className={`flex items-center gap-3 bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-3.5 cursor-pointer hover:bg-zinc-950/80 transition duration-150 ${item.active ? 'border-emerald-500/30' : ''}`}
                      >
                        <button className="bg-transparent border-none outline-none text-emerald-400">
                          {item.active ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-zinc-600" />}
                        </button>
                        <div className="flex-1">
                          <span className={`text-xs sm:text-sm font-sans ${item.active ? 'text-emerald-400 line-through opacity-80' : 'text-zinc-200'}`}>
                            {item.text}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-zinc-400">-{item.savings.toFixed(1)} kg</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-4 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500">Pledged Commitments:</span>
                    <span className="text-emerald-400 font-bold">
                      {pledges.filter(p => p.active).length} / {pledges.length} items (-{pledgedSavings.toFixed(1)} kg/day)
                    </span>
                  </div>
                </div>

             </div>

             {/* Right Column (Offset Gauge & Trend Graph) */}
             <div className="space-y-6">
                
                {/* 3. Offset Efficiency Gauge */}
                <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 border-b border-zinc-800 pb-3">
                    <Activity className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                    <h3 className="font-bold text-lg tracking-tight">Offset Efficiency</h3>
                  </div>

                  {(() => {
                    const totalEmitted = summary.total_emitted_kg;
                    const totalSaved = summary.total_saved_kg + pledgedSavings;
                    const ratio = totalEmitted > 0 ? (totalSaved / totalEmitted) * 100 : (totalSaved > 0 ? 100 : 0);
                    const clampedRatio = Math.min(100, Math.round(ratio));
                    
                    let feedback = "No logging or active pledges today.";
                    if (ratio >= 100) {
                      feedback = "Outstanding! Your sustainable practices and pledges offset 100% or more of your emitted carbon.";
                    } else if (ratio >= 50) {
                      feedback = "Moderate progress. You are balancing a significant portion of your footprint. Add more pledges to cross the offset threshold.";
                    } else if (ratio > 0) {
                      feedback = "Emissions heavy. Your activities are outstripping your saved metrics. Try taking a metro or committing to vegan meals.";
                    }

                    return (
                      <div className="space-y-4 text-center">
                        <div className="relative flex justify-center py-2">
                          <svg viewBox="0 0 100 60" className="w-40 h-28">
                            {/* Arc Track */}
                            <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
                            {/* Arc Progress */}
                            <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" 
                              strokeDasharray="125.66" strokeDashoffset={125.66 - (125.66 * (clampedRatio / 100))}
                              className="transition-all duration-1000 ease-out"
                            />
                            
                            <defs>
                              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="50%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                          </svg>

                          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5 pointer-events-none">
                            <span className="text-2xl font-black font-mono text-white">{Math.round(ratio)}%</span>
                            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">OFFSET RATIO</span>
                          </div>
                        </div>

                        <div className="bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 space-y-2 text-left relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-500"></div>
                          <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            Offset Efficiency Insight
                          </span>
                          <p className="text-zinc-300 text-xs leading-relaxed font-sans font-medium">
                            {feedback}
                          </p>
                        </div>

                        {/* Avoided Emissions Math Equations */}
                        <div className="pt-4 border-t border-zinc-800/80 space-y-3 text-left">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Avoided Emissions Math</span>
                          
                          {/* Mobility Offset Equation */}
                          <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-3 text-xs space-y-1.5">
                            <div className="flex justify-between items-center text-cyan-400 font-mono text-[10px] font-bold">
                              <span>MOBILITY OFFSET EQUATION</span>
                              <span>ΔE = d × (C_auto - C_metro)</span>
                            </div>
                            <p className="text-zinc-400 leading-normal text-[11px]">
                              Calculates net carbon avoided when taking public metro transit instead of a passenger automobile.
                            </p>
                            <div className="font-mono text-zinc-500 text-[10px] bg-zinc-950/60 p-1.5 rounded flex justify-between">
                              <span>Live Formula:</span>
                              <span className="text-zinc-300">d × ({factors.car.toFixed(2)} - {factors.transit.toFixed(3)}) = d × <span className="text-emerald-400 font-bold">{(factors.car - factors.transit).toFixed(3)} kg/km</span> avoided</span>
                            </div>
                          </div>

                          {/* Diet Offset Equation */}
                          <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-3 text-xs space-y-1.5">
                            <div className="flex justify-between items-center text-emerald-400 font-mono text-[10px] font-bold">
                              <span>DIETARY OFFSET EQUATION</span>
                              <span>ΔE = C_high - C_low</span>
                            </div>
                            <p className="text-zinc-400 leading-normal text-[11px]">
                              Calculates avoided carbon when selecting a low-impact plant-based meal over a beef baseline.
                            </p>
                            <div className="font-mono text-zinc-500 text-[10px] bg-zinc-950/60 p-1.5 rounded flex justify-between">
                              <span>Live Formula:</span>
                              <span className="text-zinc-300">{factors.dietHigh.toFixed(2)} - {factors.dietLow.toFixed(2)} = <span className="text-emerald-400 font-bold">{(factors.dietHigh - factors.dietLow).toFixed(2)} kg/meal</span> avoided</span>
                            </div>
                          </div>

                          {/* Avatar Visual Synergy */}
                          <div className="bg-zinc-950/50 border border-zinc-900 rounded-lg p-3 text-xs space-y-1.5">
                            <div className="flex justify-between items-center text-amber-400 font-mono text-[10px] font-bold">
                              <span>AVATAR STATE THRESHOLDS</span>
                              <span>Net Offset = Saved - Emitted</span>
                            </div>
                            <p className="text-zinc-400 leading-normal text-[11px]">
                              Your net offset delta determines your avatar's growth stage:
                            </p>
                            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-zinc-500">
                              <span>🌲 Forest: &gt;= 6.0 kg</span>
                              <span>🌿 Sprout: -10 to -2.0 kg</span>
                              <span>🌳 Canopy: 2.0 to 6.0 kg</span>
                              <span>🍂 Scrub: &lt; -10 kg</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>

                {/* 4. 7-Day Trend Projection */}
                <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 border-b border-zinc-800 pb-3">
                    <TrendingUp className="w-4.5 h-4.5 text-cyan-400" />
                    <h3 className="font-bold text-lg tracking-tight">7-Day Projection</h3>
                  </div>

                  <div className="relative">
                    <svg viewBox="0 0 200 100" className="w-full h-32">
                      {/* Grid lines */}
                      <line x1="10" y1="20" x2="190" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="10" y1="50" x2="190" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="10" y1="80" x2="190" y2="80" stroke="#1e293b" strokeWidth="0.5" />

                      {/* Area Under Curve */}
                      <path d="M 10,80 L 10,65 Q 40,55 70,72 T 130,42 T 190,25 L 190,80 Z" fill="url(#areaGrad)" />
                      
                      {/* Glowing Line */}
                      <path d="M 10,65 Q 40,55 70,72 T 130,42 T 190,25" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" filter="url(#glow-cyan-line)" />

                      {/* Day Markers */}
                      <circle cx="10" cy="65" r="2.5" fill="#22d3ee" />
                      <circle cx="70" cy="72" r="2.5" fill="#22d3ee" />
                      <circle cx="130" cy="42" r="2.5" fill="#22d3ee" />
                      <circle cx="190" cy="25" r="2.5" fill="#22d3ee" />

                      <defs>
                        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="glow-cyan-line" x="-10%" y="-10%" width="120%" height="120%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                    </svg>

                    {/* Labels */}
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-2 px-1">
                      <span>MON</span>
                      <span>WED</span>
                      <span>FRI</span>
                      <span>TODAY</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-normal font-sans font-medium text-center">
                    💡 Emitting trend drops by <span className="text-emerald-400 font-bold">{Math.round(pledgedSavings * 7)} kg</span> weekly with active pledges.
                  </p>
                </div>

             </div>
          </div>
        )}

      </main>

      {/* 4. Footer credits */}
      <footer className="border-t border-zinc-900 bg-[#070a13] px-6 py-5 text-center text-xs text-zinc-500 font-mono mt-8 space-y-1">
        <p>EcoSync.AI Parsing Engine — Scientific Carbon Footprint Platform</p>
        <p className="text-zinc-600">Calculated relative to local time: {currentLocalTime}</p>
      </footer>

      {/* Toast popup */}
      {showCopyToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-950 border border-emerald-400/30 text-emerald-400 px-5 py-3 rounded-lg text-xs font-mono shadow-2xl flex items-center gap-2 animate-fade-in z-[1000]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

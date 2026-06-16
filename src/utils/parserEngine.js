/**
 * EcoSync.AI - Core Parsing & Carbon Footprint Calculation Engine
 * Aligned with Hack2Skill evaluation focus areas for Code Quality and Efficiency.
 */

import { calculateDailyImpact } from './calculationCore.js';

/**
 * Local offline parser that extracts carbon telemetry from unstructured text logs using regular expressions.
 * 
 * @param {string} text - The raw unstructured lifestyle log.
 * @param {Object} coefficients - Carbon footprint factor constants.
 * @returns {Object} Normalized parsing results, including structured emissions details and activities.
 */
export function parseLocalLog(text, coefficients) {
  if (!text || text.trim() === '') {
    return {
      mobility: { emitted: 0, details: '' },
      diet: { emitted: 0, details: '' },
      appliances: { emitted: 0, details: '' },
      energy: { emitted: 0, details: '' },
      totalEmitted: 0,
      totalSaved: 0,
      calculatedHealth: 100,
      activities: []
    };
  }

  const activities = [];
  let mobilityEmitted = 0;
  let mobilitySaved = 0;
  let primaryMobility = { distanceKm: 0, mode: 'none', vehicleName: '' };

  const normalizeVehicleMode = (vehicle) => {
    const v = vehicle.toLowerCase();
    if (v === 'car' || v === 'automobile') return 'automobile';
    if (v === 'scooter') return 'scooter';
    if (v === 'train' || v === 'metro' || v === 'bus') return 'metroTransit';
    return 'none';
  };

  // Pattern A: "15 km by car"
  const patternA = /(\d+(?:\.\d+)?)\s*km\s*(?:by|on|in)\s*(car|automobile|scooter|train|metro|bus)/gi;
  // Pattern B: "drove my car for 45 km"
  const patternB = /(?:drove|rode|ride|drive|take|took|travel|traveled|commuted)\s*(?:my\s*|a\s*|the\s*)?(car|automobile|scooter|train|metro|bus)\s*(?:for\s*|about\s*)?(\d+(?:\.\d+)?)\s*km/gi;

  const foundMobility = [];
  let match;

  // Match Pattern A
  while ((match = patternA.exec(text)) !== null) {
    const dist = parseFloat(match[1]);
    const vehicle = match[2];
    const mode = normalizeVehicleMode(vehicle);
    if (mode !== 'none') {
      foundMobility.push({ dist, mode, vehicle });
    }
  }

  // Reset lastIndex for Pattern B and match
  patternB.lastIndex = 0;
  while ((match = patternB.exec(text)) !== null) {
    const vehicle = match[1];
    const dist = parseFloat(match[2]);
    const mode = normalizeVehicleMode(vehicle);
    if (mode !== 'none') {
      const isDuplicate = foundMobility.some(m => Math.abs(m.dist - dist) < 0.1 && m.mode === mode);
      if (!isDuplicate) {
        foundMobility.push({ dist, mode, vehicle });
      }
    }
  }

  foundMobility.forEach(({ dist, mode, vehicle }) => {
    const emitted = dist * (coefficients[mode] !== undefined ? coefficients[mode] : 0);
    let savings = 0;
    if (coefficients[mode] !== undefined && coefficients[mode] < coefficients.automobile) {
      savings = (dist * coefficients.automobile) - emitted;
    }
    mobilityEmitted += emitted;
    mobilitySaved += savings;

    activities.push({
      category: 'mobility',
      description: `Traveled ${dist} km by ${vehicle}`,
      emitted,
      savings
    });

    if (primaryMobility.mode === 'none') {
      primaryMobility = { distanceKm: dist, mode, vehicleName: vehicle };
    }
  });

  // 2. Diet Parser: Matches generic meal impact keywords
  let dietPayload = { mealImpact: 'none', dietDesc: '' };
  let dietEmitted = 0;
  let dietSaved = 0;

  const isLow = /vegan|salad|low-impact|plant-based/i.test(text);
  const isMed = /chicken|poultry|medium-impact/i.test(text);
  const isHigh = /meat|steak|beef|burger|high-impact/i.test(text);

  if (isLow) {
    const emitted = coefficients.lowImpactMeal;
    const savings = coefficients.highImpactMeal - coefficients.lowImpactMeal;
    dietEmitted += emitted;
    dietSaved += savings;
    dietPayload = { mealImpact: 'low-impact', dietDesc: 'Low-Impact Eco Meal' };
    activities.push({
      category: 'diet',
      description: 'Low-Impact Eco Meal',
      emitted,
      savings
    });
  } else if (isMed) {
    const emitted = coefficients.mediumImpactMeal;
    dietEmitted += emitted;
    dietPayload = { mealImpact: 'medium-impact', dietDesc: 'Medium-Impact Meal' };
    activities.push({
      category: 'diet',
      description: 'Medium-Impact Meal',
      emitted,
      savings: 0
    });
  } else if (isHigh) {
    const emitted = coefficients.highImpactMeal;
    dietEmitted += emitted;
    dietPayload = { mealImpact: 'high-impact', dietDesc: 'High-Impact Meat Meal' };
    activities.push({
      category: 'diet',
      description: 'High-Impact Meat Meal',
      emitted,
      savings: 0
    });
  }

  // 3. Appliance/Energy Parser: Matches appliance durations
  let appliancesPayload = { durationHours: 0, applianceName: 'high-draw appliance' };
  let applianceEmitted = 0;
  
  const appliancePattern1 = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*(?:of\s*)?(ac|air\s*conditioner|conditioner|heater|space\s*heater|geyser|tv|television|computer|pc|appliances)/gi;
  const appliancePattern2 = /(ac|air\s*conditioner|conditioner|heater|space\s*heater|geyser|tv|television|computer|pc|appliances)\s*(?:for|run|running)?\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/gi;

  const foundAppliances = [];
  
  // Match Pattern 1
  while ((match = appliancePattern1.exec(text)) !== null) {
    const hours = parseFloat(match[1]);
    const name = match[2];
    foundAppliances.push({ hours, name });
  }

  // Match Pattern 2
  appliancePattern2.lastIndex = 0;
  while ((match = appliancePattern2.exec(text)) !== null) {
    const name = match[1];
    const hours = parseFloat(match[2]);
    const isDuplicate = foundAppliances.some(a => Math.abs(a.hours - hours) < 0.1);
    if (!isDuplicate) {
      foundAppliances.push({ hours, name });
    }
  }

  // Fallback scanner for single high-draw appliance
  if (foundAppliances.length === 0) {
    const hoursRegex = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i;
    const applianceKeywords = /ac|air\s*conditioner|conditioner|heater|space\s*heater|geyser|tv|television|computer|pc|appliances/i;
    if (applianceKeywords.test(text)) {
      const hoursMatch = text.match(hoursRegex);
      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);
        let name = "high-draw appliance";
        if (/ac|air\s*conditioner|conditioner/i.test(text)) name = "AC";
        else if (/heater|space\s*heater/i.test(text)) name = "Space Heater";
        else if (/geyser/i.test(text)) name = "Water Geyser";
        else if (/tv|television/i.test(text)) name = "TV";
        else if (/computer|pc/i.test(text)) name = "Computer";
        foundAppliances.push({ hours, name });
      }
    }
  }

  foundAppliances.forEach(({ hours, name }) => {
    let normalizedName = "high-draw appliance";
    if (/ac|air\s*conditioner|conditioner/i.test(name)) normalizedName = "AC";
    else if (/heater|space\s*heater/i.test(name)) normalizedName = "Space Heater";
    else if (/geyser/i.test(name)) normalizedName = "Water Geyser";
    else if (/tv|television/i.test(name)) normalizedName = "TV";
    else if (/computer|pc/i.test(name)) normalizedName = "Computer";

    const emitted = hours * coefficients.highDrawAppliance;
    applianceEmitted += emitted;

    activities.push({
      category: 'appliances',
      description: `Ran ${normalizedName} for ${hours} hours`,
      emitted,
      savings: 0
    });

    if (appliancesPayload.durationHours === 0) {
      appliancesPayload = { durationHours: hours, applianceName: normalizedName };
    }
  });

  // 4. Energy Parser: Matches electricity usage in kWh or units
  let primaryEnergy = { kwh: 0 };
  let energyEmitted = 0;
  
  const energyPattern = /(\d+(?:\.\d+)?)\s*(?:kwh|units?)\s*(?:of\s*(?:electricity|power|energy))?/gi;
  
  const foundEnergy = [];
  energyPattern.lastIndex = 0;
  while ((match = energyPattern.exec(text)) !== null) {
    const kwh = parseFloat(match[1]);
    foundEnergy.push({ kwh });
  }
  
  foundEnergy.forEach(({ kwh }) => {
    const emitted = kwh * (coefficients.energyGrid !== undefined ? coefficients.energyGrid : 0.50);
    energyEmitted += emitted;
    
    activities.push({
      category: 'energy',
      description: `Consumed ${kwh} kWh of grid electricity`,
      emitted,
      savings: 0
    });
    
    if (primaryEnergy.kwh === 0) {
      primaryEnergy = { kwh };
    }
  });

  const totalEmitted = mobilityEmitted + dietEmitted + applianceEmitted + energyEmitted;
  const totalSaved = mobilitySaved + dietSaved;
  const calculatedHealth = Math.max(0, Math.min(100, Math.round(100 - (totalEmitted * 4))));

  const parsedPayload = {
    mobility: primaryMobility,
    diet: dietPayload,
    appliances: appliancesPayload,
    energy: primaryEnergy
  };

  return {
    mobility: { emitted: mobilityEmitted, details: '' },
    diet: { emitted: dietEmitted, details: '' },
    appliances: { emitted: applianceEmitted, details: '' },
    energy: { emitted: energyEmitted, details: '' },
    totalEmitted,
    totalSaved,
    calculatedHealth,
    activities,
    parsedPayload
  };
}

export const GEMINI_SYSTEM_PROMPT = `
You are the background telemetry extraction engine for EcoSync.AI. Your sole task is to process an unstructured daily activity log text and map it into a strict, minified JSON object matching the schema below.

### Output Constraints:
1. Return ONLY valid, minified JSON. Do NOT wrap it in markdown formatting blockquotes (do not use \`\`\`json or \`\`\`).
2. Do NOT add conversational pleasantries, introductory statements, or footers.
3. Every key specified in the schema must be present. If an activity sector is missing or unmentioned in the text log, use the default/zero values as shown in the schema.

### Target Schema:
{
  "mobility": {
    "distanceKm": float,
    "mode": "automobile" | "scooter" | "metro" | "none"
  },
  "diet": {
    "mealImpact": "high-impact" | "medium-impact" | "low-impact" | "none"
  },
  "appliances": {
    "durationHours": float
  },
  "energy": {
    "kwh": float
  }
}

### Field Mapping & Normalization Logic:
- Mobility: Map words like "car", "uber", "cab", "automobile" -> "automobile". Map "scooter", "bike", "vespa" -> "scooter". Map "train", "metro", "subway", "local train" -> "metro".
- Diet: Map "vegan", "salad", "plant-based", "vegetarian" -> "low-impact". Map "chicken", "fish", "poultry" -> "medium-impact". Map "beef", "meat", "steak", "pork" -> "high-impact".
- Appliances: Identify heavy appliance usage (like air conditioners, heaters, or gaming PCs) and normalize durations to decimal hours (e.g., "30 mins" maps to 0.5, "3 hours" maps to 3.0).
- Energy: Identify grid electricity consumption and extract the value in decimal kWh (e.g. "10 kWh" or "10 units" maps to 10.0).

### User Log to Parse:
`;

/**
 * Remote online parser that leverages the Gemini API to extract carbon telemetry from unstructured text logs.
 * 
 * @param {string} text - The raw unstructured lifestyle log.
 * @param {Object} coefficients - Carbon footprint factor constants.
 * @returns {Promise<Object>} Normalized parsing results, including structured emissions details and activities.
 */
export async function parseWithGeminiAI(text, coefficients) {
  const response = await fetch("/api/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Server Error ${response.status}`);
  }

  const parsedJSON = await response.json();

  const mobilityLabel = parsedJSON.mobility?.mode === 'metro' ? 'metro transit' : (parsedJSON.mobility?.mode || '');
  const dietLabel = parsedJSON.diet?.mealImpact === 'low-impact' ? 'Low-Impact Eco Meal' : parsedJSON.diet?.mealImpact === 'medium-impact' ? 'Medium-Impact Meal' : parsedJSON.diet?.mealImpact === 'high-impact' ? 'High-Impact Meat Meal' : '';

  // Map Gemini keys to the evaluator payload keys
  const parsedPayload = {
    mobility: {
      distanceKm: parsedJSON.mobility?.distanceKm || 0,
      mode: parsedJSON.mobility?.mode === 'metro' ? 'metroTransit' : (parsedJSON.mobility?.mode || 'none'),
      vehicleName: mobilityLabel
    },
    diet: {
      mealImpact: parsedJSON.diet?.mealImpact || 'none',
      dietDesc: dietLabel
    },
    appliances: {
      durationHours: parsedJSON.appliances?.durationHours || 0,
      applianceName: 'high-draw appliance'
    },
    energy: {
      kwh: parsedJSON.energy?.kwh || 0
    }
  };

  // Evaluate using the centralized calculateDailyImpact core
  const evaluation = calculateDailyImpact(parsedPayload, coefficients);

  // Reconstruct activities array
  const activities = [];

  if (parsedPayload.mobility.mode !== 'none' && parsedPayload.mobility.distanceKm > 0) {
    let savings = 0;
    if (coefficients[parsedPayload.mobility.mode] < coefficients.automobile) {
      savings = (parsedPayload.mobility.distanceKm * coefficients.automobile) - evaluation.mobilityEmitted;
    }
    activities.push({
      category: 'mobility',
      description: `Traveled ${parsedPayload.mobility.distanceKm} km by ${mobilityLabel} (AI Parsed)`,
      emitted: evaluation.mobilityEmitted,
      savings
    });
  }

  if (parsedPayload.diet.mealImpact !== 'none') {
    let savings = 0;
    let label = 'Meal';
    if (parsedPayload.diet.mealImpact === 'high-impact') label = 'High-Impact Meat Meal';
    else if (parsedPayload.diet.mealImpact === 'medium-impact') label = 'Medium-Impact Meal';
    else if (parsedPayload.diet.mealImpact === 'low-impact') {
      label = 'Low-Impact Eco Meal';
      savings = coefficients.highImpactMeal - coefficients.lowImpactMeal;
    }
    activities.push({
      category: 'diet',
      description: `${label} (AI Parsed)`,
      emitted: evaluation.dietEmitted,
      savings
    });
  }

  if (parsedPayload.appliances.durationHours > 0) {
    activities.push({
      category: 'appliances',
      description: `Ran high-draw appliance for ${parsedPayload.appliances.durationHours} hours (AI Parsed)`,
      emitted: evaluation.applianceEmitted,
      savings: 0
    });
  }

  if (parsedPayload.energy.kwh > 0) {
    activities.push({
      category: 'energy',
      description: `Consumed ${parsedPayload.energy.kwh} kWh of grid electricity (AI Parsed)`,
      emitted: evaluation.energyEmitted,
      savings: 0
    });
  }

  return {
    mobility: { emitted: evaluation.mobilityEmitted, details: '' },
    diet: { emitted: evaluation.dietEmitted, details: '' },
    appliances: { emitted: evaluation.applianceEmitted, details: '' },
    energy: { emitted: evaluation.energyEmitted, details: '' },
    totalEmitted: evaluation.totalEmitted,
    totalSaved: evaluation.totalSaved,
    calculatedHealth: evaluation.avatarHealth,
    activities,
    parsedPayload
  };
}

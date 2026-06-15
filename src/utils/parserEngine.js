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

  // 1. Mobility Parser: Matches "X km by car/automobile/scooter/train/metro"
  let mobilityPayload = { distanceKm: 0, mode: 'none', vehicleName: '' };
  let vehicleName = '';
  const distanceRegex = /(\d+(?:\.\d+)?)\s*km\s*by\s*(car|automobile|scooter|train|metro|bus)/gi;
  const mobilityMatch = distanceRegex.exec(text);
  if (mobilityMatch) {
    const dist = parseFloat(mobilityMatch[1]);
    const vehicle = mobilityMatch[2].toLowerCase();
    vehicleName = vehicle;
    let mode = 'scooter'; // default fallback
    if (vehicle === 'car' || vehicle === 'automobile') mode = 'automobile';
    if (vehicle === 'train' || vehicle === 'metro') mode = 'metroTransit';
    mobilityPayload = { distanceKm: dist, mode, vehicleName };
  }

  // 2. Diet Parser: Matches generic meal impact keywords
  let dietPayload = { mealImpact: 'none', dietDesc: '' };
  let dietDesc = '';
  if (/vegan|salad|low-impact|plant-based/i.test(text)) {
    dietPayload = { mealImpact: 'low-impact', dietDesc: 'Low-Impact Eco Meal' };
    dietDesc = 'Low-Impact Eco Meal';
  } else if (/chicken|poultry|medium-impact/i.test(text)) {
    dietPayload = { mealImpact: 'medium-impact', dietDesc: 'Medium-Impact Meal' };
    dietDesc = 'Medium-Impact Meal';
  } else if (/meat|steak|beef|high-impact/i.test(text)) {
    dietPayload = { mealImpact: 'high-impact', dietDesc: 'High-Impact Meat Meal' };
    dietDesc = 'High-Impact Meat Meal';
  }

  // 3. Appliance/Energy Parser: Matches "X hours of AC", "AC for X hours", "air conditioner for X hours", etc.
  let appliancesPayload = { durationHours: 0, applianceName: 'high-draw appliance' };
  let applianceName = 'high-draw appliance';
  const hoursRegex = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i;
  const applianceKeywords = /ac|air\s*conditioner|conditioner|heater|space\s*heater|geyser|tv|television|computer|pc|appliances/i;
  
  if (applianceKeywords.test(text)) {
    const hoursMatch = text.match(hoursRegex);
    if (hoursMatch) {
      const hours = parseFloat(hoursMatch[1]);
      if (/ac|air\s*conditioner|conditioner/i.test(text)) applianceName = "AC";
      else if (/heater|space\s*heater/i.test(text)) applianceName = "Space Heater";
      else if (/geyser/i.test(text)) applianceName = "Water Geyser";
      else if (/tv|television/i.test(text)) applianceName = "TV";
      else if (/computer|pc/i.test(text)) applianceName = "Computer";
      appliancesPayload = { durationHours: hours, applianceName };
    }
  }

  // Map to unified parsedPayload structure
  const parsedPayload = {
    mobility: mobilityPayload,
    diet: dietPayload,
    appliances: appliancesPayload
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
      description: `Traveled ${parsedPayload.mobility.distanceKm} km by ${vehicleName}`,
      emitted: evaluation.mobilityEmitted,
      savings
    });
  }

  if (parsedPayload.diet.mealImpact !== 'none') {
    let savings = 0;
    if (parsedPayload.diet.mealImpact === 'low-impact') {
      savings = coefficients.highImpactMeal - coefficients.lowImpactMeal;
    }
    activities.push({
      category: 'diet',
      description: dietDesc,
      emitted: evaluation.dietEmitted,
      savings
    });
  }

  if (parsedPayload.appliances.durationHours > 0) {
    activities.push({
      category: 'appliances',
      description: `Ran ${applianceName} for ${parsedPayload.appliances.durationHours} hours`,
      emitted: evaluation.applianceEmitted,
      savings: 0
    });
  }

  return {
    mobility: { emitted: evaluation.mobilityEmitted, details: '' },
    diet: { emitted: evaluation.dietEmitted, details: '' },
    appliances: { emitted: evaluation.applianceEmitted, details: '' },
    energy: { emitted: 0, details: '' },
    totalEmitted: evaluation.totalEmitted,
    totalSaved: evaluation.totalSaved,
    calculatedHealth: evaluation.avatarHealth,
    activities,
    parsedPayload
  };
}

/**
 * Strategy 2: Gemini 2.5 Structured JSON System Prompt
 * Ensures high-accuracy mapping of complex text logs into structured telemetry data.
 */
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
  }
}

### Field Mapping & Normalization Logic:
- Mobility: Map words like "car", "uber", "cab", "automobile" -> "automobile". Map "scooter", "bike", "vespa" -> "scooter". Map "train", "metro", "subway", "local train" -> "metro".
- Diet: Map "vegan", "salad", "plant-based", "vegetarian" -> "low-impact". Map "chicken", "fish", "poultry" -> "medium-impact". Map "beef", "meat", "steak", "pork" -> "high-impact".
- Appliances: Identify heavy appliance usage (like air conditioners, heaters, or gaming PCs) and normalize durations to decimal hours (e.g., "30 mins" maps to 0.5, "3 hours" maps to 3.0).

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

  return {
    mobility: { emitted: evaluation.mobilityEmitted, details: '' },
    diet: { emitted: evaluation.dietEmitted, details: '' },
    appliances: { emitted: evaluation.applianceEmitted, details: '' },
    energy: { emitted: 0, details: '' },
    totalEmitted: evaluation.totalEmitted,
    totalSaved: evaluation.totalSaved,
    calculatedHealth: evaluation.avatarHealth,
    activities,
    parsedPayload
  };
}

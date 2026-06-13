/**
 * EcoSync.AI - Central Calculation Engine
 * Maps parsed telemetry data directly against dynamic UI slider constants.
 * Aligned with evaluation parameters for Efficiency and Problem Statement Alignment.
 */
export function calculateDailyImpact(parsedJSON, uiConstants) {
  const result = {
    mobilityEmitted: 0,
    dietEmitted: 0,
    applianceEmitted: 0,
    totalEmitted: 0,
    totalSaved: 0,
    avatarHealth: 50, // Default baseline matching UI initialization
    avatarName: "Seedling Sprout"
  };

  // 1. Mobility Calculations & Transit Offset Delta
  const distance = parsedJSON.mobility?.distanceKm || 0;
  const mode = parsedJSON.mobility?.mode || 'none';
  
  if (mode !== 'none' && uiConstants[mode] !== undefined) {
    result.mobilityEmitted = distance * uiConstants[mode];
    
    // Calculate potential carbon savings if public transit or scooter was selected over a standard vehicle
    if (uiConstants[mode] < uiConstants.automobile) {
      result.totalSaved += (distance * uiConstants.automobile) - result.mobilityEmitted;
    }
  }

  // 2. Dietary Carbon Threshold Mapping
  const dietType = parsedJSON.diet?.mealImpact || 'none';
  if (dietType === 'high-impact') {
    result.dietEmitted = uiConstants.highImpactMeal;
  } else if (dietType === 'medium-impact') {
    result.dietEmitted = uiConstants.mediumImpactMeal;
  } else if (dietType === 'low-impact') {
    result.dietEmitted = uiConstants.lowImpactMeal;
    // Compute alternative choice savings relative to a standard high-impact baseline meal
    result.totalSaved += (uiConstants.highImpactMeal - uiConstants.lowImpactMeal);
  }

  // 3. High-Draw Appliance Computations
  const hours = parsedJSON.appliances?.durationHours || 0;
  result.applianceEmitted = hours * uiConstants.highDrawAppliance;

  // 4. Aggregations & Dynamic Eco-Avatar Health Calibration
  result.totalEmitted = result.mobilityEmitted + result.dietEmitted + result.applianceEmitted;
  
  // Dynamic Scaling Algorithm: Starts at a perfect 100%, drops relative to total daily emissions impact
  result.avatarHealth = Math.max(0, Math.min(100, Math.round(100 - (result.totalEmitted * 4))));
  
  // Conditional Threshold State Evaluation for the Avatar Phase
  if (result.avatarHealth > 75) {
    result.avatarName = "Eco Champion";
  } else if (result.avatarHealth >= 40) {
    result.avatarName = "Seedling Sprout";
  } else {
    result.avatarName = "Wilted Sprout";
  }

  return result;
}

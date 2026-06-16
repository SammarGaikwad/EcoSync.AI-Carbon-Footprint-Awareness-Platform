/**
 * Calculates daily carbon emissions and offset savings based on parsed log metrics and carbon factor coefficients.
 * 
 * @param {Object} parsedJSON - Normalized JSON structure containing activity telemetry.
 * @param {Object} parsedJSON.mobility - Mobility distance and mode details.
 * @param {number} parsedJSON.mobility.distanceKm - Traveled distance in kilometers.
 * @param {string} parsedJSON.mobility.mode - Type of vehicle (e.g. 'automobile', 'scooter', 'metroTransit').
 * @param {Object} parsedJSON.diet - Dietary meal impact selection.
 * @param {string} parsedJSON.diet.mealImpact - Level of meal impact ('low-impact', 'medium-impact', 'high-impact').
 * @param {Object} parsedJSON.appliances - High-draw appliance usage details.
 * @param {number} parsedJSON.appliances.durationHours - Runtime duration of appliance in hours.
 * @param {Object} uiConstants - User customizable scientific carbon factor coefficients (kg CO2e).
 * @returns {Object} Calculated metrics (emitted, saved, avatar health, and state name).
 */
export function calculateDailyImpact(parsedJSON, uiConstants) {
  const data = parsedJSON || {};
  const constants = uiConstants || {};

  const result = {
    mobilityEmitted: 0,
    dietEmitted: 0,
    applianceEmitted: 0,
    energyEmitted: 0,
    totalEmitted: 0,
    totalSaved: 0,
    avatarHealth: 50, // Default baseline matching UI initialization
    avatarName: "Seedling Sprout"
  };

  // 1. Mobility Calculations & Transit Offset Delta
  const distance = data.mobility?.distanceKm || 0;
  const mode = data.mobility?.mode || 'none';
  
  if (mode !== 'none' && constants[mode] !== undefined) {
    result.mobilityEmitted = distance * constants[mode];
    
    // Calculate potential carbon savings if public transit or scooter was selected over a standard vehicle
    if (constants[mode] < constants.automobile) {
      result.totalSaved += (distance * constants.automobile) - result.mobilityEmitted;
    }
  }

  // 2. Dietary Carbon Threshold Mapping
  const dietType = data.diet?.mealImpact || 'none';
  if (dietType === 'high-impact') {
    result.dietEmitted = constants.highImpactMeal;
  } else if (dietType === 'medium-impact') {
    result.dietEmitted = constants.mediumImpactMeal;
  } else if (dietType === 'low-impact') {
    result.dietEmitted = constants.lowImpactMeal;
    // Compute alternative choice savings relative to a standard high-impact baseline meal
    result.totalSaved += (constants.highImpactMeal - constants.lowImpactMeal);
  }

  // 3. High-Draw Appliance Computations
  const hours = data.appliances?.durationHours || 0;
  result.applianceEmitted = hours * constants.highDrawAppliance;

  // 4. Grid Electricity Computations
  const kwh = data.energy?.kwh || 0;
  result.energyEmitted = kwh * (constants.energyGrid !== undefined ? constants.energyGrid : 0.50);

  // 5. Aggregations & Dynamic Eco-Avatar Health Calibration
  result.totalEmitted = result.mobilityEmitted + result.dietEmitted + result.applianceEmitted + result.energyEmitted;
  
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

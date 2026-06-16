import { parseLocalLog } from './src/utils/parserEngine.js';
import assert from 'assert';

const coefficients = {
  automobile: 0.20,
  scooter: 0.10,
  metroTransit: 0.02,
  highImpactMeal: 6.00,
  mediumImpactMeal: 1.50,
  lowImpactMeal: 0.40,
  highDrawAppliance: 0.80,
  energyGrid: 0.50,
};

console.log("Starting EcoSync.AI Parser Engine Unit Tests...\n");

// Test Case 1: Empty text
const emptyResult = parseLocalLog("", coefficients);
assert.strictEqual(emptyResult.totalEmitted, 0);
assert.strictEqual(emptyResult.activities.length, 0);
console.log("✅ Passed Test Case 1: Empty input returns zeroed metrics");

// Test Case 2: Mobility parsing
const mobilityText = "Traveled 15 km by car";
const mobilityResult = parseLocalLog(mobilityText, coefficients);
assert.strictEqual(mobilityResult.mobility.emitted, 15 * 0.20);
assert.strictEqual(mobilityResult.totalEmitted, 3.0);
console.log("✅ Passed Test Case 2: Mobility car emissions match expected output");

// Test Case 3: Public transit and savings
const transitText = "Traveled 20 km by train";
const transitResult = parseLocalLog(transitText, coefficients);
assert.strictEqual(transitResult.mobility.emitted, 20 * 0.02);
assert.strictEqual(transitResult.totalSaved, (20 * 0.20) - (20 * 0.02));
console.log("✅ Passed Test Case 3: Transit savings computed correctly vs automobile baseline");

// Test Case 4: Diet meals
const lowDietResult = parseLocalLog("Had a vegan salad for lunch", coefficients);
assert.strictEqual(lowDietResult.diet.emitted, 0.40);
assert.strictEqual(lowDietResult.totalSaved, 6.00 - 0.40);
console.log("✅ Passed Test Case 4: Low impact meals and savings evaluated properly");

// Test Case 5: Appliance draw hours
const applianceResult = parseLocalLog("Ran 5 hours of AC", coefficients);
assert.strictEqual(applianceResult.appliances.emitted, 5 * 0.80);
console.log("✅ Passed Test Case 5: Appliance draw calculation computes correctly");

// Test Case 6: Mixed unstructured logs
const mixedText = "Traveled 10 km by metro. Had a beef steak. Ran AC for 3 hours.";
const mixedResult = parseLocalLog(mixedText, coefficients);
assert.strictEqual(mixedResult.mobility.emitted, 10 * 0.02);
assert.strictEqual(mixedResult.diet.emitted, 6.00);
assert.strictEqual(mixedResult.appliances.emitted, 3 * 0.80);
assert.strictEqual(mixedResult.totalEmitted, (10 * 0.02) + 6.00 + (3 * 0.80));
console.log("✅ Passed Test Case 6: Mixed inputs evaluated successfully!");

// Test Case 7: Cache parsedPayload structure validation
const cacheInput = "Traveled 12.5 km by scooter. Had chicken wrap. Ran geyser for 2 hours.";
const cacheResult = parseLocalLog(cacheInput, coefficients);
assert.ok(cacheResult.parsedPayload);
assert.strictEqual(cacheResult.parsedPayload.mobility.distanceKm, 12.5);
assert.strictEqual(cacheResult.parsedPayload.mobility.mode, 'scooter');
assert.strictEqual(cacheResult.parsedPayload.mobility.vehicleName, 'scooter');
assert.strictEqual(cacheResult.parsedPayload.diet.mealImpact, 'medium-impact');
assert.strictEqual(cacheResult.parsedPayload.diet.dietDesc, 'Medium-Impact Meal');
assert.strictEqual(cacheResult.parsedPayload.appliances.durationHours, 2.0);
assert.strictEqual(cacheResult.parsedPayload.appliances.applianceName, 'Water Geyser');
console.log("✅ Passed Test Case 7: Cached payload structure matches client contract");

// Test Case 8: Text containing HTML tags
const dirtyInput = "Had a vegan salad <b>lunch</b> and traveled 5 km by metro";
const dirtyResult = parseLocalLog(dirtyInput, coefficients);
assert.strictEqual(dirtyResult.diet.emitted, 0.40);
assert.strictEqual(dirtyResult.mobility.emitted, 5 * 0.02);
console.log("✅ Passed Test Case 8: Parser processes logs containing HTML tags gracefully");

// Test Case 9: Grid electricity parsing
const energyInput = "Consumed 14 kWh of grid electricity and used another 6 units of power";
const energyResult = parseLocalLog(energyInput, coefficients);
assert.strictEqual(energyResult.energy.emitted, 20 * 0.50); // 14 + 6 = 20 kWh * 0.50
assert.strictEqual(energyResult.parsedPayload.energy.kwh, 14); // first matches
console.log("✅ Passed Test Case 9: Grid electricity parsing and footprint evaluation operate correctly");

console.log("\n🚀 All parser unit tests passed successfully!");

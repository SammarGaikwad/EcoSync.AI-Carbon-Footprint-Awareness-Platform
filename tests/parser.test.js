import { describe, it, expect } from 'vitest';
import { parseLocalLog } from '../src/utils/parserEngine.js';

// Setup active scientific coefficients matching defaults
const coefficients = {
  automobile: 0.20,
  scooter: 0.10,
  metroTransit: 0.02,
  highImpactMeal: 6.00,
  mediumImpactMeal: 1.50,
  lowImpactMeal: 0.40,
  highDrawAppliance: 0.80,
};

describe('EcoSync.AI Parser Engine Unit Tests', () => {
  
  it('should gracefully handle empty or blank strings without crashing', () => {
    const result = parseLocalLog("", coefficients);
    expect(result.totalEmitted).toBe(0);
    expect(result.totalSaved).toBe(0);
    expect(result.activities).toHaveLength(0);
  });

  it('should gracefully handle nonsensical strings without keywords without crashing', () => {
    const result = parseLocalLog("gibberish nonsensical text that has no numbers or activities", coefficients);
    expect(result.totalEmitted).toBe(0);
    expect(result.totalSaved).toBe(0);
    expect(result.activities).toHaveLength(0);
  });

  it('should calculate the mathematically exact breakdown for the Commuter preset', () => {
    const commuterText = "I drove my car for 45 km to attend an out-of-town meeting in the morning. In the afternoon, I rode my scooter for 8 km to grab groceries. Had a quick chicken wrap for dinner.";
    const result = parseLocalLog(commuterText, coefficients);
    
    // Mobility Math:
    // Car commute: 45 km * 0.20 = 9.0 kg CO2e
    // Scooter commute: 8 km * 0.10 = 0.8 kg CO2e
    // Total mobility emitted = 9.8 kg CO2e
    expect(result.mobility.emitted).toBeCloseTo(9.8);

    // Diet Math:
    // Chicken wrap is categorized as medium-impact meal = 1.5 kg CO2e
    expect(result.diet.emitted).toBeCloseTo(1.5);

    // Appliances Math:
    // None mentioned = 0.0 kg CO2e
    expect(result.appliances.emitted).toBe(0.0);

    // Total Emitted Math:
    // 9.8 + 1.5 = 11.3 kg CO2e
    expect(result.totalEmitted).toBeCloseTo(11.3);
  });

  it('should calculate the mathematically exact breakdown for the Eco Day preset', () => {
    const ecoDayText = "This morning, I commuted 15 km by metro instead of taking my petrol car. For lunch, I had a delicious vegan wrap instead of my usual chicken meal. At home, I managed to keep the AC off.";
    const result = parseLocalLog(ecoDayText, coefficients);
    
    // Mobility Math:
    // Metro commute: 15 km * 0.02 = 0.3 kg CO2e
    // Mobility Savings vs automobile baseline (15 km * 0.20): 3.0 - 0.3 = 2.7 kg CO2e
    expect(result.mobility.emitted).toBeCloseTo(0.3);
    
    // Diet Math:
    // Vegan wrap is categorized as low-impact meal = 0.40 kg CO2e
    // Diet Savings vs high-impact meal baseline (6.0 kg CO2e): 6.0 - 0.4 = 5.6 kg CO2e
    expect(result.diet.emitted).toBeCloseTo(0.40);

    // Total Savings Math:
    // 2.7 + 5.6 = 8.3 kg CO2e
    expect(result.totalSaved).toBeCloseTo(8.3);
  });
});

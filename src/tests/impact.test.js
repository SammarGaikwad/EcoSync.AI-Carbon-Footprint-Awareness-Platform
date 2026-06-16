import { describe, test, expect } from 'vitest';
import { calculateDailyImpact } from '../utils/calculationCore.js';

describe('EcoSync.AI Calculation Core Validation', () => {
  // Define a static baseline layout mirroring your Carbon Coefficients panel
  const sampleConstants = {
    automobile: 0.20,
    scooter: 0.10,
    metro: 0.02,
    highImpactMeal: 6.00,
    mediumImpactMeal: 1.50,
    lowImpactMeal: 0.40,
    highDrawAppliance: 0.80,
    energyGrid: 0.50
  };

  test('should compute correct emissions and transit offset deltas for a mixed log payload', () => {
    const mockParsedLog = {
      mobility: { distanceKm: 20, mode: 'metro' }, // 20 * 0.02 = 0.4 kg
      diet: { mealImpact: 'low-impact' },         // 0.4 kg
      appliances: { durationHours: 3 },            // 3 * 0.8 = 2.4 kg
      energy: { kwh: 10 }                          // 10 * 0.50 = 5.0 kg
    };

    const analytics = calculateDailyImpact(mockParsedLog, sampleConstants);

    // 1. Validate sector-specific carbon mapping
    expect(analytics.mobilityEmitted).toBeCloseTo(0.4);
    expect(analytics.dietEmitted).toBeCloseTo(0.4);
    expect(analytics.applianceEmitted).toBeCloseTo(2.4);
    expect(analytics.energyEmitted).toBeCloseTo(5.0);

    // 2. Validate total aggregation (0.4 + 0.4 + 2.4 + 5.0 = 8.2 kg CO₂e)
    expect(analytics.totalEmitted).toBeCloseTo(8.2);

    // 3. Validate Alternative Savings Calculation
    // Mobility Savings: (20km * 0.20 car baseline) - 0.4 metro = 3.6 kg saved
    // Diet Savings: 6.00 high-impact baseline - 0.40 low-impact = 5.6 kg saved
    // Total Saved: 3.6 + 5.6 = 9.2 kg CO₂e
    expect(analytics.totalSaved).toBeCloseTo(9.2);
  });

  test('should gracefully handle empty or unparsed zero-state data logs', () => {
    const emptyPayload = {
      mobility: { distanceKm: 0, mode: 'none' },
      diet: { mealImpact: 'none' },
      appliances: { durationHours: 0 }
    };

    const analytics = calculateDailyImpact(emptyPayload, sampleConstants);

    expect(analytics.totalEmitted).toBe(0);
    expect(analytics.totalSaved).toBe(0);
    expect(analytics.avatarHealth).toBe(100); // Empty logs revert avatar to max/dormant health structure
    expect(analytics.mobilityEmitted).not.toBeNaN();
  });

  test('should correctly transition Avatar State Names based on impact health scales', () => {
    // High impact log designed to drop health significantly
    const heavyImpactPayload = {
      mobility: { distanceKm: 100, mode: 'automobile' }, // 100 * 0.20 = 20 kg
      diet: { mealImpact: 'high-impact' },              // 6.0 kg
      appliances: { durationHours: 5 }                  // 5 * 0.8 = 4.0 kg
    }; // Total Emitted = 30 kg CO₂e -> Health will drop below the threshold minimum

    const analytics = calculateDailyImpact(heavyImpactPayload, sampleConstants);

    expect(analytics.avatarHealth).toBeLessThan(40);
    expect(analytics.avatarName).toBe("Wilted Sprout");
  });
});

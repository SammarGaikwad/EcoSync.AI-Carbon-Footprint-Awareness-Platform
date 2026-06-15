import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';

/**
 * CarbonCoefficients Component
 * 
 * Manages the scientific carbon factor configuration.
 * Includes range sliders synchronized with accessible, border-tinted numeric inputs,
 * wrapped in a structured layout.
 */
export default function CarbonCoefficients({
  factors,
  handleFactorChange,
  handleResetCoefficients,
  showConfig,
  setShowConfig
}) {
  return (
    <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl transition-all duration-300">
      {/* Header with expand/collapse toggle wrapper button for screen readers */}
      <button
        type="button"
        onClick={() => setShowConfig(!showConfig)}
        aria-expanded={showConfig}
        aria-label="Toggle Carbon Coefficients Panel"
        className="w-full flex justify-between items-center border-b border-zinc-800 pb-3 cursor-pointer text-left bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1423] rounded-md"
      >
        <div className="flex items-center gap-2 text-cyan-400">
          <Sliders className="w-4.5 h-4.5" />
          <h3 className="font-bold text-base tracking-tight text-cyan-400">Carbon Coefficients</h3>
        </div>
        <span className="text-zinc-500 text-xs font-mono">
          {showConfig ? 'Collapse ▲' : 'Expand ▼'}
        </span>
      </button>

      <div className={`space-y-4 pt-3 ${showConfig ? 'block' : 'hidden md:block'}`}>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
          Customize the scientific factors (kg CO₂e) to inspect recalculations dynamically.
        </p>

        <div className="grid grid-cols-[1fr_auto] items-center gap-y-4 gap-x-3 max-h-80 overflow-y-auto pr-1 custom-scroll">
          {/* Car Slider & Input */}
          <label htmlFor="factor-car" className="text-xs font-mono text-zinc-400 cursor-pointer">🚗 Automobile / km</label>
          <input
            id="factor-car"
            type="number"
            min="0.0"
            max="1.0"
            step="0.01"
            value={factors.car}
            onChange={(e) => handleFactorChange("car", e.target.value)}
            className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
          />
          <div className="col-span-2 pb-2">
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={factors.car}
              onChange={(e) => handleFactorChange("car", e.target.value)}
              aria-label="Automobile carbon factor per kilometer slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
          </div>

          {/* Scooter Slider & Input */}
          <label htmlFor="factor-scooter" className="text-xs font-mono text-zinc-400 cursor-pointer">🛵 Scooter / km</label>
          <input
            id="factor-scooter"
            type="number"
            min="0.0"
            max="0.5"
            step="0.01"
            value={factors.scooter}
            onChange={(e) => handleFactorChange("scooter", e.target.value)}
            className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
          />
          <div className="col-span-2 pb-2">
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.01"
              value={factors.scooter}
              onChange={(e) => handleFactorChange("scooter", e.target.value)}
              aria-label="Scooter carbon factor per kilometer slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
          </div>

          {/* Transit Slider & Input */}
          <label htmlFor="factor-transit" className="text-xs font-mono text-zinc-400 cursor-pointer">🚇 Metro Transit / km</label>
          <input
            id="factor-transit"
            type="number"
            min="0.0"
            max="0.2"
            step="0.001"
            value={factors.transit}
            onChange={(e) => handleFactorChange("transit", e.target.value)}
            className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
          />
          <div className="col-span-2 pb-1">
            <input
              type="range"
              min="0.0"
              max="0.2"
              step="0.001"
              value={factors.transit}
              onChange={(e) => handleFactorChange("transit", e.target.value)}
              aria-label="Metro Transit carbon factor per kilometer slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
            <div className="mt-2 bg-cyan-950/20 border border-cyan-900/20 p-2 rounded text-[10px] font-mono text-zinc-400">
              <span>Transit Offset Math: </span>
              <span className="text-cyan-400">ΔE = C_auto - C_metro = {factors.car.toFixed(2)} - {factors.transit.toFixed(3)} = </span>
              <span className="text-emerald-400 font-bold">{(factors.car - factors.transit).toFixed(3)} kg/km</span> avoided
            </div>
          </div>

          {/* Diet High Slider & Input */}
          <label htmlFor="factor-dietHigh" className="text-xs font-mono text-zinc-400 cursor-pointer pt-2 border-t border-zinc-800/40">🥩 High-Impact Meal</label>
          <div className="pt-2 border-t border-zinc-800/40">
            <input
              id="factor-dietHigh"
              type="number"
              min="1.0"
              max="15.0"
              step="0.1"
              value={factors.dietHigh}
              onChange={(e) => handleFactorChange("dietHigh", e.target.value)}
              className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
            />
          </div>
          <div className="col-span-2 pb-2">
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.1"
              value={factors.dietHigh}
              onChange={(e) => handleFactorChange("dietHigh", e.target.value)}
              aria-label="High impact meat meal carbon factor slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
          </div>

          {/* Diet Med Slider & Input */}
          <label htmlFor="factor-dietMed" className="text-xs font-mono text-zinc-400 cursor-pointer">🍗 Medium-Impact Meal</label>
          <input
            id="factor-dietMed"
            type="number"
            min="0.5"
            max="5.0"
            step="0.1"
            value={factors.dietMed}
            onChange={(e) => handleFactorChange("dietMed", e.target.value)}
            className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
          />
          <div className="col-span-2 pb-2">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={factors.dietMed}
              onChange={(e) => handleFactorChange("dietMed", e.target.value)}
              aria-label="Medium impact meal carbon factor slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
          </div>

          {/* Diet Low Slider & Input */}
          <label htmlFor="factor-dietLow" className="text-xs font-mono text-zinc-400 cursor-pointer">🥗 Low-Impact Meal</label>
          <input
            id="factor-dietLow"
            type="number"
            min="0.0"
            max="2.0"
            step="0.05"
            value={factors.dietLow}
            onChange={(e) => handleFactorChange("dietLow", e.target.value)}
            className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
          />
          <div className="col-span-2 pb-1">
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={factors.dietLow}
              onChange={(e) => handleFactorChange("dietLow", e.target.value)}
              aria-label="Low impact plant-based meal carbon factor slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
            <div className="mt-2 bg-emerald-950/20 border border-emerald-800/20 p-2 rounded text-[10px] font-mono text-zinc-400">
              <span>Dietary Offset Math: </span>
              <span className="text-emerald-400">ΔE = C_high - C_low = {factors.dietHigh.toFixed(2)} - {factors.dietLow.toFixed(2)} = </span>
              <span className="text-emerald-400 font-bold">{(factors.dietHigh - factors.dietLow).toFixed(2)} kg/meal</span> avoided
            </div>
          </div>

          {/* Appliance High Slider & Input */}
          <label htmlFor="factor-applianceHigh" className="text-xs font-mono text-zinc-400 cursor-pointer pt-2 border-t border-zinc-800/40">❄️ High-Draw Appliance / hr</label>
          <div className="pt-2 border-t border-zinc-800/40">
            <input
              id="factor-applianceHigh"
              type="number"
              min="0.0"
              max="3.0"
              step="0.05"
              value={factors.applianceHigh}
              onChange={(e) => handleFactorChange("applianceHigh", e.target.value)}
              className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
            />
          </div>
          <div className="col-span-2 pb-2">
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.05"
              value={factors.applianceHigh}
              onChange={(e) => handleFactorChange("applianceHigh", e.target.value)}
              aria-label="High draw appliance carbon factor per hour slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
          </div>

          {/* Energy Grid Slider & Input */}
          <label htmlFor="factor-energyGrid" className="text-xs font-mono text-zinc-400 cursor-pointer pt-2 border-t border-zinc-800/40">⚡ Grid Electricity / kWh</label>
          <div className="pt-2 border-t border-zinc-800/40">
            <input
              id="factor-energyGrid"
              type="number"
              min="0.0"
              max="2.0"
              step="0.05"
              value={factors.energyGrid}
              onChange={(e) => handleFactorChange("energyGrid", e.target.value)}
              className="bg-zinc-900 border border-zinc-800/80 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 w-20 text-right focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
            />
          </div>
          <div className="col-span-2 pb-2">
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={factors.energyGrid}
              onChange={(e) => handleFactorChange("energyGrid", e.target.value)}
              aria-label="Grid electricity carbon factor per kilowatt hour slider"
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetCoefficients}
          aria-label="Reset scientific constants to default factors"
          className="w-full bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 font-mono focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
          Reset Scientific Constants
        </button>
      </div>
    </div>
  );
}

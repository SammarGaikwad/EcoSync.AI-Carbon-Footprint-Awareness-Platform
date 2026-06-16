import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * CarbonCoefficients Component
 * 
 * Manages scientific carbon factor coefficients in a clean grid layout
 * that fits accessibility guidelines, eliminates visual underscores, and prevents layout shifts.
 */
export default function CarbonCoefficients({
  factors,
  handleFactorChange,
  handleResetCoefficients,
  showConfig,
  setShowConfig
}) {
  const coefficientList = [
    { key: "car", label: "🚗 Automobile", step: "0.01", unit: "km" },
    { key: "scooter", label: "🛵 Scooter", step: "0.01", unit: "km" },
    { key: "transit", label: "🚇 Metro Transit", step: "0.001", unit: "km" },
    { key: "dietHigh", label: "🥩 High-Impact Meal", step: "0.1", unit: "meal" },
    { key: "dietMed", label: "🍗 Medium-Impact Meal", step: "0.1", unit: "meal" },
    { key: "dietLow", label: "🥗 Low-Impact Meal", step: "0.05", unit: "meal" },
    { key: "applianceHigh", label: "❄️ High-Draw Appliance", step: "0.05", unit: "hr" },
    { key: "energyGrid", label: "⚡ Grid Electricity", step: "0.05", unit: "kWh" }
  ];

  return (
    <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 shadow-xl transition-all duration-300">
      {/* Header Button for Screen Readers */}
      <button
        type="button"
        onClick={() => setShowConfig(!showConfig)}
        aria-expanded={showConfig}
        aria-label="Toggle Carbon Coefficients Panel"
        className="w-full flex justify-between items-center border-b border-zinc-800 pb-3 cursor-pointer text-left bg-transparent border-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1423] rounded-md"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-zinc-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Carbon Coefficients</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-full">
            Dynamic System
          </span>
          <span className="text-zinc-500 text-xs font-mono">
            {showConfig ? '▲' : '▼'}
          </span>
        </div>
      </button>

      <div className={`space-y-4 pt-3 ${showConfig ? 'block' : 'hidden md:block'}`}>
        <p className="text-xs text-zinc-500 mb-4 leading-relaxed font-sans">
          Customize factors (kg CO₂e) to test algorithmic recalculations instantly.
        </p>

        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1 custom-scroll">
          {coefficientList.map((factor) => (
            <div 
              key={factor.key} 
              className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800 transition-all group"
            >
              <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
                {factor.label}
              </span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step={factor.step}
                  value={factors[factor.key]}
                  onChange={(e) => handleFactorChange(factor.key, e.target.value)}
                  aria-label={`${factor.label} coefficient`}
                  className="w-16 bg-zinc-950 text-right text-xs font-mono font-bold text-emerald-400 px-2 py-1 rounded border border-zinc-800/80 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                <span className="text-[10px] text-zinc-600 font-mono w-8">{factor.unit}</span>
              </div>
            </div>
          ))}
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

CarbonCoefficients.propTypes = {
  factors: PropTypes.shape({
    car: PropTypes.number.isRequired,
    scooter: PropTypes.number.isRequired,
    transit: PropTypes.number.isRequired,
    dietHigh: PropTypes.number.isRequired,
    dietMed: PropTypes.number.isRequired,
    dietLow: PropTypes.number.isRequired,
    applianceHigh: PropTypes.number.isRequired,
    energyGrid: PropTypes.number.isRequired,
  }).isRequired,
  handleFactorChange: PropTypes.func.isRequired,
  handleResetCoefficients: PropTypes.func.isRequired,
  showConfig: PropTypes.bool.isRequired,
  setShowConfig: PropTypes.func.isRequired,
};



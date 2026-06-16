import React from 'react';
import { Navigation, Leaf, Plug, Zap } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ImpactCategories Component
 * 
 * Renders the relative category carbon breakdown.
 */
export default function ImpactCategories({ categoryTotals, totalEmitted }) {
  const getCategoryPercent = (catVal) => {
    if (totalEmitted === 0) return 0;
    return (catVal / totalEmitted) * 100;
  };

  return (
    <div>
      <h4 className="text-xs font-mono uppercase text-zinc-400 mb-3 tracking-wider">Impact Categories</h4>
      <div className="space-y-4">
        
        {/* Mobility */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Mobility
            </span>
            <span>
              {categoryTotals.mobility.toFixed(2)} kg CO₂e ({Math.round(getCategoryPercent(categoryTotals.mobility)) || 0}%)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getCategoryPercent(categoryTotals.mobility)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(getCategoryPercent(categoryTotals.mobility)) || 0}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Mobility carbon footprint percentage"
            ></div>
          </div>
        </div>

        {/* Diet */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Diet
            </span>
            <span>
              {categoryTotals.diet.toFixed(2)} kg CO₂e ({Math.round(getCategoryPercent(categoryTotals.diet)) || 0}%)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getCategoryPercent(categoryTotals.diet)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(getCategoryPercent(categoryTotals.diet)) || 0}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Diet carbon footprint percentage"
            ></div>
          </div>
        </div>

        {/* Appliances */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Plug className="w-3.5 h-3.5 text-orange-500" /> Appliances
            </span>
            <span>
              {categoryTotals.appliances.toFixed(2)} kg CO₂e ({Math.round(getCategoryPercent(categoryTotals.appliances)) || 0}%)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getCategoryPercent(categoryTotals.appliances)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(getCategoryPercent(categoryTotals.appliances)) || 0}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Appliances carbon footprint percentage"
            ></div>
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Energy
            </span>
            <span>
              {categoryTotals.energy.toFixed(2)} kg CO₂e ({Math.round(getCategoryPercent(categoryTotals.energy)) || 0}%)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getCategoryPercent(categoryTotals.energy)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(getCategoryPercent(categoryTotals.energy)) || 0}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Energy carbon footprint percentage"
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}

ImpactCategories.propTypes = {
  categoryTotals: PropTypes.shape({
    mobility: PropTypes.number.isRequired,
    diet: PropTypes.number.isRequired,
    appliances: PropTypes.number.isRequired,
    energy: PropTypes.number.isRequired,
  }).isRequired,
  totalEmitted: PropTypes.number.isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';

/**
 * LogParserInput Component
 * 
 * Handles natural language lifestyle log inputs, preset buttons, and primary sandbox actions.
 */
export default function LogParserInput({
  draftPrompt,
  setDraftPrompt,
  handleAISubmit,
  handlePresetSelect,
  handleClear,
  saveCurrentDayToHistory,
  isProcessing
}) {
  return (
    <div className="bg-[#0e1423]/90 border border-zinc-800/50 rounded-xl p-6 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Daily Unstructured Log Parser</h2>
          <span className="text-[11px] text-zinc-500 font-mono">NLP Calculation Sandbox</span>
        </div>
        
        <form onSubmit={handleAISubmit} className="space-y-4">
          <div className="relative">
            <textarea 
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              placeholder="e.g., Yesterday morning I commuted 20 km by train instead of my car. Had a low-impact meal for lunch..."
              aria-label="Daily unstructured activity log text input"
              className="w-full h-36 bg-zinc-950/70 border border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-lg p-4 text-zinc-200 placeholder-zinc-600 outline-none transition text-sm font-mono tracking-wide shadow-inner"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
              NATURAL LANGUAGE TEXT
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-4 border-t border-zinc-900 mt-6 w-full">
            {/* Left Section: Contextual Presets */}
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Presets:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🌱 Eco Day', style: 'hover:border-emerald-900 hover:text-emerald-400', key: 'eco' },
                  { label: '🚗 Commuter', style: 'hover:border-blue-900 hover:text-blue-400', key: 'commute' },
                  { label: '⚡ Mixed Logs', style: 'hover:border-amber-900 hover:text-amber-400', key: 'mixed' }
                ].map((preset) => (
                  <button 
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetSelect(preset.key)}
                    aria-label={`Load ${preset.label} Preset`}
                    className={`px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900/40 border border-zinc-800/80 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${preset.style}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section: Core Utility Actions */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button 
                type="button" 
                onClick={handleClear} 
                aria-label="Clear current log and results"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-400 border border-zinc-800/60 bg-zinc-950 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                Clear
              </button>
              <button 
                type="button"
                onClick={saveCurrentDayToHistory}
                aria-label="Save current day to weekly history"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-300 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                💾 Save Day
              </button>
              <button 
                type="submit" 
                disabled={isProcessing}
                aria-label="Parse log and compute footprint"
                className="px-5 py-1.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                {isProcessing ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                ) : (
                  <>PARSE LOG <span className="text-[10px] opacity-80">↗</span></>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

LogParserInput.propTypes = {
  draftPrompt: PropTypes.string.isRequired,
  setDraftPrompt: PropTypes.func.isRequired,
  handleAISubmit: PropTypes.func.isRequired,
  handlePresetSelect: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
  saveCurrentDayToHistory: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool.isRequired,
};

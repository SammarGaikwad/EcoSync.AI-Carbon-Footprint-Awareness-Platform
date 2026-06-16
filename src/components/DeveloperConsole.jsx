import React from 'react';
import { Clipboard } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * DeveloperConsole Component
 * 
 * Renders the minified JSON telemetry data view with copy controls.
 */
export default function DeveloperConsole({ minifiedJSONString, handleCopyClipboard }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-500 font-mono">EcoSync.AI Output Schema</span>
        <button 
          onClick={handleCopyClipboard} 
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-md transition flex items-center gap-1.5 font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          aria-label="Copy minified JSON payload to clipboard"
        >
          <Clipboard className="w-3.5 h-3.5" />
          Copy Minified Payload
        </button>
      </div>
      
      <div className="bg-zinc-950/90 border border-zinc-900 rounded-lg p-4 max-h-72 overflow-y-auto custom-scroll">
        <pre className="text-[11px] font-mono text-[#34d399] whitespace-pre-wrap break-all leading-relaxed">
          {minifiedJSONString}
        </pre>
      </div>
      
      <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
        ℹ️ This output conforms strictly to the system's requested schema. It operates in minified format with values re-evaluating in real-time on keypresses or slider changes.
      </p>
    </div>
  );
}

DeveloperConsole.propTypes = {
  minifiedJSONString: PropTypes.string.isRequired,
  handleCopyClipboard: PropTypes.func.isRequired,
};


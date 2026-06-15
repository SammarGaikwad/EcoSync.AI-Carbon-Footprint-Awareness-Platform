import React from 'react';
import { ShieldAlert, Award, Compass, Trees } from 'lucide-react';

/**
 * Premium EcoAvatar Component
 * Renders an interactive, animated SVG representing the user's carbon health state.
 * Fully self-contained animations and filters.
 */
export default function EcoAvatar({ netImpact, avatarState }) {
  const { level, health, color, desc } = avatarState;

  // Render graphic elements based on the level
  const renderSVGContent = () => {
    switch (level) {
      case "Dry Scrubland":
        return (
          <>
            {/* Warning Ring */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#redGlowGrad)" strokeWidth="1" strokeDasharray="4 8" className="animate-spin-slow" />
            
            {/* Cracked Ground */}
            <path d="M 40,150 Q 100,160 160,150" stroke="#f43f5e" strokeWidth="3" fill="none" />
            <path d="M 70,152 L 65,165 L 58,168" stroke="#ef4444" strokeWidth="1.5" fill="none" />
            <path d="M 100,155 L 102,170 L 95,178" stroke="#ef4444" strokeWidth="1.5" fill="none" />
            <path d="M 130,152 L 135,162 L 142,164" stroke="#ef4444" strokeWidth="1.5" fill="none" />

            {/* Withered, Dried Tree Branch */}
            <path d="M 100,152 Q 95,110 90,80" stroke="#f43f5e" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#glow-red)" />
            <path d="M 95,120 Q 80,105 72,100" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 92,100 Q 110,88 118,85" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 90,80 Q 82,70 80,65" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 90,80 Q 100,72 104,68" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Heat Waves / Smoke particles */}
            <path d="M 70,70 Q 75,55 70,45" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" fill="none" className="heat-wave" style={{ animationDelay: '0s' }} />
            <path d="M 100,55 Q 105,40 100,30" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" fill="none" className="heat-wave" style={{ animationDelay: '0.5s' }} />
            <path d="M 130,75 Q 125,60 130,50" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" fill="none" className="heat-wave" style={{ animationDelay: '1s' }} />
          </>
        );

      case "Sprout":
        return (
          <>
            {/* Soft Ambient Ring */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#amberGlowGrad)" strokeWidth="1" strokeDasharray="3 9" className="animate-spin-slow" />
            
            {/* Ground */}
            <path d="M 40,150 Q 100,155 160,150" stroke="#78350f" strokeWidth="4" fill="none" />
            <path d="M 40,150 Q 100,155 160,150 L 160,175 Q 100,180 40,175 Z" fill="rgba(120, 53, 15, 0.15)" />

            {/* Tiny Sprout Stem */}
            <path d="M 100,152 Q 98,130 95,115" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#glow-amber)" />
            
            {/* Tiny Sprout Leaves */}
            <path d="M 95,115 Q 105,108 115,112 C 115,112 105,122 95,115" fill="#f59e0b" filter="url(#glow-amber)" className="swaying-leaf" />
            <path d="M 96,120 Q 82,115 75,122 C 75,122 85,128 96,120" fill="#d97706" />
          </>
        );

      case "Seedling Sprout":
        return (
          <>
            {/* Ground */}
            <path d="M 40,150 Q 100,154 160,150" stroke="#451a03" strokeWidth="4" fill="none" />
            <path d="M 40,150 Q 100,154 160,150 L 160,175 Q 100,178 40,175 Z" fill="rgba(69, 26, 3, 0.15)" />

            {/* Stem */}
            <path d="M 100,151 Q 97,125 94,105" stroke="#a3e635" strokeWidth="4.5" fill="none" strokeLinecap="round" filter="url(#glow-lime)" />
            
            {/* Two healthy leaves */}
            <path d="M 95,115 Q 110,105 125,110 C 125,110 112,125 95,115" fill="#a3e635" className="swaying-leaf" style={{ transformOrigin: '95px 115px' }} />
            <path d="M 97,125 Q 78,120 65,130 C 65,130 78,140 97,125" fill="#84cc16" />

            {/* Small glowing bud on top */}
            <circle cx="94" cy="103" r="3" fill="#bef264" filter="url(#glow-lime)" />
          </>
        );

      case "Young Sapling":
        return (
          <>
            {/* Dynamic Cyan Aura */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="url(#cyanGlowGrad)" strokeWidth="1.5" strokeDasharray="8 6" className="animate-spin-slow" />
            
            {/* Ground */}
            <path d="M 40,150 Q 100,153 160,150" stroke="#27272a" strokeWidth="4.5" fill="none" />
            
            {/* Sapling Trunk & Branch */}
            <path d="M 100,150 Q 98,110 93,80" stroke="#06b6d4" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#glow-cyan)" />
            <path d="M 97,115 Q 115,100 125,98" stroke="#06b6d4" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 95,98 Q 80,88 70,90" stroke="#0891b2" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Healthy Cyan Leaves */}
            <path d="M 125,98 Q 138,88 142,98 C 142,98 130,108 125,98" fill="#22d3ee" className="swaying-leaf" style={{ transformOrigin: '125px 98px' }} />
            <path d="M 70,90 Q 58,80 54,92 C 54,92 66,100 70,90" fill="#0891b2" />
            <path d="M 93,80 Q 92,62 100,56 C 100,56 106,70 93,80" fill="#22d3ee" filter="url(#glow-cyan)" />
            
            {/* Water droplet/energy drops */}
            <circle cx="100" cy="50" r="1.5" fill="#22d3ee" className="floating-droplet" style={{ animationDelay: '0s' }} />
            <circle cx="135" cy="85" r="1" fill="#22d3ee" className="floating-droplet" style={{ animationDelay: '1s' }} />
          </>
        );

      case "Blooming Canopy":
        return (
          <>
            {/* Green Rotating Rings */}
            <circle cx="100" cy="100" r="82" fill="none" stroke="url(#emeraldGlowGrad)" strokeWidth="1.5" strokeDasharray="12 4" className="animate-spin-slow" />
            
            {/* Ground */}
            <path d="M 40,150 Q 100,152 160,150" stroke="#1f2937" strokeWidth="5" fill="none" />

            {/* Strong Trunk */}
            <path d="M 100,150 L 100,105 Q 100,90 92,72" stroke="#059669" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 100,125 Q 118,110 128,105" stroke="#059669" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 100,115 Q 80,100 70,98" stroke="#047857" strokeWidth="4.5" fill="none" strokeLinecap="round" />

            {/* Lush Leaf Canopies */}
            {/* Main top canopy */}
            <circle cx="92" cy="65" r="22" fill="rgba(16, 185, 129, 0.85)" filter="url(#glow-emerald)" className="pulse-slow" />
            <circle cx="85" cy="55" r="16" fill="#34d399" />
            <circle cx="102" cy="58" r="18" fill="#10b981" />
            
            {/* Right canopy */}
            <circle cx="130" cy="100" r="16" fill="#10b981" />
            <circle cx="138" cy="94" r="12" fill="#34d399" />
            
            {/* Left canopy */}
            <circle cx="68" cy="92" r="16" fill="#047857" />
            <circle cx="60" cy="85" r="12" fill="#10b981" />

            {/* Floating Oxygen Sparks */}
            <circle cx="90" cy="35" r="2" fill="#a7f3d0" className="sparkle-spark" style={{ animationDelay: '0s' }} />
            <circle cx="140" cy="70" r="1.5" fill="#a7f3d0" className="sparkle-spark" style={{ animationDelay: '0.8s' }} />
            <circle cx="60" cy="65" r="2" fill="#a7f3d0" className="sparkle-spark" style={{ animationDelay: '1.5s' }} />
          </>
        );

      case "Old Growth Forest":
        return (
          <>
            {/* Double Galactic Rings */}
            <circle cx="100" cy="100" r="84" fill="none" stroke="url(#mysticGlowGrad)" strokeWidth="2.5" strokeDasharray="30 8" className="animate-spin-slow" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="url(#mysticGlowGrad)" strokeWidth="1" strokeDasharray="5 15" className="animate-spin-fast" style={{ animationDirection: 'reverse' }} />
            
            {/* Ground with roots */}
            <path d="M 40,150 Q 100,150 160,150" stroke="#111827" strokeWidth="6" fill="none" />
            <path d="M 100,150 Q 90,165 82,175" stroke="#059669" strokeWidth="3" fill="none" />
            <path d="M 100,150 Q 108,168 116,178" stroke="#047857" strokeWidth="3" fill="none" />
            
            {/* Ancient Grand Trunk */}
            <path d="M 100,150 L 100,100" stroke="#047857" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M 100,120 Q 125,100 135,90" stroke="#047857" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 100,110 Q 75,85 62,80" stroke="#065f46" strokeWidth="6" fill="none" strokeLinecap="round" />

            {/* Glowing Golden-Emerald Canopy Nodes */}
            {/* Top Giant Canopy */}
            <circle cx="100" cy="55" r="26" fill="rgba(16, 185, 129, 0.85)" filter="url(#glow-mystic)" />
            <circle cx="112" cy="50" r="20" fill="#34d399" />
            <circle cx="88" cy="45" r="22" fill="#10b981" />
            <circle cx="100" cy="38" r="16" fill="#a7f3d0" filter="url(#glow-emerald)" />

            {/* Side Canopies */}
            <circle cx="140" cy="85" r="20" fill="#10b981" />
            <circle cx="148" cy="78" r="14" fill="#a7f3d0" />
            <circle cx="60" cy="75" r="20" fill="#047857" />
            <circle cx="50" cy="68" r="14" fill="#10b981" />

            {/* Golden Core Heart */}
            <circle cx="100" cy="98" r="6" fill="#fbbf24" filter="url(#glow-mystic)" className="pulse-fast" />

            {/* Mystical Floating Spores */}
            <circle cx="100" cy="20" r="2.5" fill="#fef08a" className="sparkle-spark" style={{ animationDelay: '0s' }} />
            <circle cx="150" cy="55" r="3" fill="#a7f3d0" className="sparkle-spark" style={{ animationDelay: '0.4s' }} />
            <circle cx="50" cy="45" r="2" fill="#a7f3d0" className="sparkle-spark" style={{ animationDelay: '1.2s' }} />
            <circle cx="115" cy="30" r="2.5" fill="#a7f3d0" className="sparkle-spark" style={{ animationDelay: '0.9s' }} />
            <circle cx="80" cy="28" r="1.5" fill="#fef08a" className="sparkle-spark" style={{ animationDelay: '1.8s' }} />
          </>
        );

      default:
        return null;
    }
  };

  // Select dynamic summary card header details
  const getBadgeDetails = () => {
    const score = parseFloat(netImpact.toFixed(1));
    const prefix = score > 0 ? "+" : "";
    if (level === "Old Growth Forest") {
      return {
        icon: <Award className="w-5 h-5 text-amber-300 animate-bounce" />,
        badgeText: "Carbon Master",
        badgeColor: "bg-amber-950/50 text-amber-300 border-amber-500/30",
        glowText: "text-emerald-400 font-bold",
        impactText: `${prefix}${score} kg CO2e offset`
      };
    }
    if (level === "Blooming Canopy" || level === "Young Sapling") {
      return {
        icon: <Trees className="w-5 h-5 text-emerald-400" />,
        badgeText: "Eco Warrior",
        badgeColor: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20",
        glowText: "text-emerald-400",
        impactText: `${prefix}${score} kg CO2e saved`
      };
    }
    if (level === "Dry Scrubland") {
      return {
        icon: <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />,
        badgeText: "Critical Impact",
        badgeColor: "bg-rose-950/40 text-rose-400 border-rose-500/20",
        glowText: "text-rose-400 font-bold",
        impactText: `${score} kg CO2e excess`
      };
    }
    return {
      icon: <Compass className="w-5 h-5 text-zinc-400" />,
      badgeText: "Citizen Sprout",
      badgeColor: "bg-zinc-900 border-zinc-800 text-zinc-300",
      glowText: "text-zinc-200",
      impactText: `${score} kg net footprint`
    };
  };

  const badge = getBadgeDetails();

  return (
    <div className="bg-[#0e1423]/95 border border-zinc-800/60 rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-between transition-all duration-300 hover:border-emerald-500/25 shadow-xl group">
      
      {/* Absolute Glow Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_60%)] pointer-events-none"></div>

      {/* 1. Header Row */}
      <div className="w-full flex justify-between items-center z-10 mb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Eco Avatar State</span>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${badge.badgeColor}`}>
          {badge.icon}
          <span>{badge.badgeText}</span>
        </div>
      </div>

      {/* 2. Interactive SVG Visualizer */}
      <div className="relative w-44 h-44 flex items-center justify-center select-none z-10 transition duration-300 transform group-hover:scale-105">
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full"
          role="img"
          aria-label={`Eco Avatar in ${level} stage with ${health}% health - ${desc}`}
        >
          <defs>
            {/* Core Glow Filters */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-lime" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-mystic" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradient Definitions for Rings */}
            <linearGradient id="redGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="amberGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#78350f" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="emeraldGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="mysticGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Embedded Custom SVG Stylesheet for keyframe micro-animations */}
          <style>{`
            .animate-spin-slow {
              transform-origin: 100px 100px;
              animation: spin 30s linear infinite;
            }
            .animate-spin-fast {
              transform-origin: 100px 100px;
              animation: spin 10s linear infinite;
            }
            .swaying-leaf {
              animation: sway 6s ease-in-out infinite alternate;
            }
            .pulse-slow {
              animation: pulse 4s ease-in-out infinite;
              transform-origin: 100px 100px;
            }
            .pulse-fast {
              animation: pulse 2s ease-in-out infinite;
              transform-origin: 100px 98px;
            }
            .heat-wave {
              stroke-dasharray: 4 4;
              animation: heat 3s linear infinite;
            }
            .floating-droplet {
              animation: float-up 4s ease-in infinite;
            }
            .sparkle-spark {
              animation: sparkle 3s ease-in-out infinite;
            }

            @keyframes spin {
              100% { transform: rotate(360deg); }
            }
            @keyframes sway {
              0% { transform: rotate(-3deg); }
              100% { transform: rotate(3deg); }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.95; }
              50% { transform: scale(1.03); opacity: 1; }
            }
            @keyframes heat {
              0% { stroke-dashoffset: 20; opacity: 0; }
              50% { opacity: 0.8; }
              100% { stroke-dashoffset: 0; opacity: 0; }
            }
            @keyframes float-up {
              0% { transform: translateY(0) scale(1); opacity: 0.8; }
              100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
            }
            @keyframes sparkle {
              0%, 100% { transform: translateY(0); opacity: 0.2; }
              50% { transform: translateY(-12px); opacity: 1; }
            }
          `}</style>

          {/* Central background card circle */}
          <circle cx="100" cy="100" r="92" fill="#0b0f19" stroke="#1f2937" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="88" fill="rgba(13, 20, 35, 0.4)" />

          {/* Dynamic state graphic */}
          {renderSVGContent()}
        </svg>

        {/* Numeric health readout badge overlay */}
        <div className="absolute bottom-2 bg-slate-950/90 border border-zinc-800 px-2.5 py-0.5 rounded-md text-[10px] font-mono tracking-wider font-bold shadow-md">
          HEALTH: <span className={color.includes("emerald") || color.includes("cyan") ? "text-emerald-400" : "text-rose-400"}>{health}%</span>
        </div>
      </div>

      {/* 3. Text Descriptions */}
      <div className="w-full text-center mt-3 space-y-1 z-10">
        <h4 className="text-white font-bold text-base tracking-tight">"{level}"</h4>
        <p className="text-[11px] font-mono text-zinc-400 truncate">{badge.impactText}</p>
        <p className="text-[10px] text-zinc-500 font-sans leading-tight mt-0.5 line-clamp-2 min-h-8">
          {desc}
        </p>
      </div>

    </div>
  );
}

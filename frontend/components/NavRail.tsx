"use client";

import { Home, Globe, Sparkles, Share2, Database, Box, Settings, Activity } from "lucide-react";

export function NavRail() {
  const topIcons = [Home, Globe, Sparkles, Share2, Database, Box];
  return (
    <div className="flex flex-col justify-between h-full w-[64px] sm:w-[80px] shrink-0">
      <div className="glass-nav rounded-[2rem] py-8 px-2 flex flex-col items-center gap-6 shadow-2xl">
        <div className="text-white hover:text-green-400 transition-colors cursor-pointer mb-4">
           <Activity size={28} />
        </div>
        {topIcons.map((Icon, idx) => (
          <button 
            key={idx} 
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
              ${idx === 0 ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}
            `}
          >
            <Icon size={22} />
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 mt-4">
        {/* Decorative Nav Track in image "REAGLE 2025 NAV" */}
        <div className="flex-1 min-h-[100px] w-full  glass-panel-dark rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
             <span className="text-[10px] uppercase text-gray-500 tracking-widest -rotate-90 absolute whitespace-nowrap">
                Medical AI 2026
             </span>
        </div>
        <div className="flex-1 min-h-[100px] w-full  glass-panel-dark rounded-[1.5rem] flex items-center justify-center relative overflow-hidden">
             <span className="text-[10px] uppercase text-gray-500 tracking-widest -rotate-90 absolute whitespace-nowrap">
                Settings
             </span>
        </div>
        <div className="glass-nav rounded-2xl p-3 cursor-pointer text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-xl">
          <Settings size={24} />
        </div>
      </div>
    </div>
  );
}

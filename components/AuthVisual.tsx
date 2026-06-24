"use client";

export function AuthVisual() {
  return (
    <div className="relative w-[340px] h-[360px]">
      <style>{`
        @keyframes score-fill {
          0% { stroke-dashoffset: 251; }
          60% { stroke-dashoffset: 251; }
          100% { stroke-dashoffset: 68; }
        }
        @keyframes fade-up-1 { 0%,30% { opacity:0; transform:translateY(12px); } 50%,100% { opacity:1; transform:translateY(0); } }
        @keyframes fade-up-2 { 0%,45% { opacity:0; transform:translateY(12px); } 65%,100% { opacity:1; transform:translateY(0); } }
        @keyframes fade-up-3 { 0%,55% { opacity:0; transform:translateY(12px); } 75%,100% { opacity:1; transform:translateY(0); } }
        @keyframes fade-up-4 { 0%,65% { opacity:0; transform:translateY(12px); } 85%,100% { opacity:1; transform:translateY(0); } }
        @keyframes pulse-dot { 0%,100% { opacity:.4; } 50% { opacity:1; } }
        @keyframes scan-line { 0% { transform:translateY(0); opacity:0; } 10% { opacity:1; } 40% { opacity:1; } 50% { transform:translateY(180px); opacity:0; } 100% { opacity:0; } }
        @keyframes score-num { 0%,55% { opacity:0; } 70%,100% { opacity:1; } }
        @keyframes bar-fill-1 { 0%,50% { width:0; } 70%,100% { width:85%; } }
        @keyframes bar-fill-2 { 0%,55% { width:0; } 75%,100% { width:62%; } }
        @keyframes bar-fill-3 { 0%,60% { width:0; } 80%,100% { width:74%; } }
        .av-score-ring { animation: score-fill 3s ease-out forwards; stroke-dasharray: 251; stroke-dashoffset: 251; }
        .av-card { border-radius: 16px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04); }
        .av-fade-1 { animation: fade-up-1 3s ease-out both; }
        .av-fade-2 { animation: fade-up-2 3s ease-out both; }
        .av-fade-3 { animation: fade-up-3 3s ease-out both; }
        .av-fade-4 { animation: fade-up-4 3s ease-out both; }
        .av-scan-line { animation: scan-line 3s ease-in-out both; }
        .av-score-num { animation: score-num 3s ease-out both; }
        .av-bar-1 { animation: bar-fill-1 3s ease-out both; }
        .av-bar-2 { animation: bar-fill-2 3s ease-out both; }
        .av-bar-3 { animation: bar-fill-3 3s ease-out both; }
        .av-dot { animation: pulse-dot 2s ease-in-out infinite; }
      `}</style>

      {/* Score card */}
      <div className="av-card av-fade-1 absolute top-0 left-0 w-[160px] p-5">
        <div className="relative w-[80px] h-[80px] mx-auto mb-3">
          <svg width="80" height="80" viewBox="0 0 88 88" className="block -rotate-90">
            <circle cx="44" cy="44" r="40" fill="none" stroke="#F0F0EC" strokeWidth="6" />
            <circle cx="44" cy="44" r="40" fill="none" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" className="av-score-ring" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center av-score-num">
            <span className="text-[22px] font-semibold">73</span>
          </div>
        </div>
        <div className="text-[11px] text-center text-[#706F6A] uppercase tracking-wide">Alignment</div>
      </div>

      {/* Findings card */}
      <div className="av-card av-fade-2 absolute top-0 right-0 w-[160px] p-4">
        <div className="text-[11px] text-[#706F6A] uppercase tracking-wide mb-3">Findings</div>
        <div className="flex flex-col gap-2.5">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#1C1C1A] font-medium">Adoption</span>
              <span className="text-[#706F6A]">85%</span>
            </div>
            <div className="h-[5px] rounded-full bg-[#F0F0EC] overflow-hidden">
              <div className="h-full rounded-full bg-[#34D399] av-bar-1" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#1C1C1A] font-medium">Tokens</span>
              <span className="text-[#706F6A]">62%</span>
            </div>
            <div className="h-[5px] rounded-full bg-[#F0F0EC] overflow-hidden">
              <div className="h-full rounded-full bg-[#FBBF24] av-bar-2" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#1C1C1A] font-medium">Structure</span>
              <span className="text-[#706F6A]">74%</span>
            </div>
            <div className="h-[5px] rounded-full bg-[#F0F0EC] overflow-hidden">
              <div className="h-full rounded-full bg-[#7C3AED] av-bar-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Scan card */}
      <div className="av-card av-fade-3 absolute bottom-[40px] left-[20px] right-[20px] p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#34D399] av-dot" />
          <span className="text-[11px] text-[#706F6A] uppercase tracking-wide">Scanning components</span>
        </div>
        <div className="flex flex-col gap-2">
          {["Button", "Card", "Modal", "Input", "Avatar"].map((name, i) => (
            <div key={name} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#F8F7F4] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="10" height="10" rx="2" stroke="#706F6A" strokeWidth="1.2"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#1C1C1A] font-medium flex-1">{name}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`av-fade-${Math.min(i + 1, 4) as 1|2|3|4}`}>
                <circle cx="7" cy="7" r="6" fill="#34D399"/>
                <path d="M4.5 7l1.8 1.8 3.2-3.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent av-scan-line opacity-0" />
      </div>
    </div>
  );
}

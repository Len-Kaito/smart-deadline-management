import { Outlet, useNavigate, useLocation } from "react-router";
import { AppProvider } from "../context/AppContext";
import { Plus } from "lucide-react";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

// ── Custom premium SVG icons ──────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(180,210,255,0.28)";
  const glow = active ? "drop-shadow(0 0 5px rgba(77,166,255,0.9)) drop-shadow(0 0 2px rgba(77,166,255,1))" : "none";
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" style={{ filter: glow, transition: "filter 0.3s ease" }}>
      {/* Geometric wireframe shelter */}
      <path d="M 13 3 L 22.5 10.5 L 22.5 23 L 3.5 23 L 3.5 10.5 Z"
        stroke={c} strokeWidth="0.95" strokeLinejoin="round" strokeLinecap="round" />
      {/* Arched door */}
      <path d="M 10 23 L 10 17.2 Q 10 14.8 13 14.8 Q 16 14.8 16 17.2 L 16 23"
        stroke={c} strokeWidth="0.85" strokeLinecap="round" fill="none" />
      {/* Apex node — the focal DNA point */}
      <circle cx="13" cy="3" r="1.5" fill={c} />
      <circle cx="13" cy="3" r="2.8" stroke={c} strokeWidth="0.4" opacity={active ? 0.4 : 0.12} />
      {/* Corner structural nodes */}
      <circle cx="22.5" cy="10.5" r="0.9" fill={c} opacity={active ? 0.7 : 0.35} />
      <circle cx="3.5" cy="10.5" r="0.9" fill={c} opacity={active ? 0.7 : 0.35} />
      {/* DNA-inspired cross-links at wall midpoints */}
      <line x1="3.5" y1="16.2" x2="6" y2="16.2" stroke={c} strokeWidth="0.55" opacity={active ? 0.45 : 0.15} strokeLinecap="round" />
      <line x1="22.5" y1="16.2" x2="20" y2="16.2" stroke={c} strokeWidth="0.55" opacity={active ? 0.45 : 0.15} strokeLinecap="round" />
      <line x1="3.5" y1="19.6" x2="5" y2="19.6" stroke={c} strokeWidth="0.45" opacity={active ? 0.3 : 0.1} strokeLinecap="round" />
      <line x1="22.5" y1="19.6" x2="21" y2="19.6" stroke={c} strokeWidth="0.45" opacity={active ? 0.3 : 0.1} strokeLinecap="round" />
    </svg>
  );
}

function NeuralIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(180,210,255,0.28)";
  const glow = active ? "drop-shadow(0 0 5px rgba(77,166,255,0.9)) drop-shadow(0 0 2px rgba(77,166,255,1))" : "none";
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" style={{ filter: glow, transition: "filter 0.3s ease" }}>
      {/* Synaptic core ring */}
      <circle cx="13" cy="13" r="2.3" stroke={c} strokeWidth="1" />
      <circle cx="13" cy="13" r="1" fill={c} opacity={active ? 0.7 : 0.4} />
      {/* Dendrite curves — organic, interlocking */}
      <path d="M 13 10.7 C 12 8 9.5 6 6.5 5" stroke={c} strokeWidth="0.85" strokeLinecap="round" />
      <path d="M 13 10.7 C 14 8 16.5 6 19.5 5" stroke={c} strokeWidth="0.85" strokeLinecap="round" />
      <path d="M 11 14 C 8.5 14.5 6 16 4 19.5" stroke={c} strokeWidth="0.85" strokeLinecap="round" />
      <path d="M 15 14 C 17.5 14.5 20 16 22 19.5" stroke={c} strokeWidth="0.85" strokeLinecap="round" />
      <path d="M 13 15.3 L 13 21.5" stroke={c} strokeWidth="0.85" strokeLinecap="round" />
      {/* Terminal synapse nodes */}
      <circle cx="6.5" cy="5" r="1.3" fill={c} opacity={active ? 0.9 : 0.4} />
      <circle cx="19.5" cy="5" r="1.3" fill={c} opacity={active ? 0.9 : 0.4} />
      <circle cx="4" cy="19.5" r="1.3" fill={c} opacity={active ? 0.9 : 0.4} />
      <circle cx="22" cy="19.5" r="1.3" fill={c} opacity={active ? 0.9 : 0.4} />
      <circle cx="13" cy="21.5" r="1.3" fill={c} opacity={active ? 0.9 : 0.4} />
      {/* Subtle ring halos on terminals when active */}
      {active && <>
        <circle cx="6.5" cy="5" r="2.4" stroke={c} strokeWidth="0.35" opacity="0.3" />
        <circle cx="19.5" cy="5" r="2.4" stroke={c} strokeWidth="0.35" opacity="0.3" />
        <circle cx="4" cy="19.5" r="2.4" stroke={c} strokeWidth="0.35" opacity="0.3" />
        <circle cx="22" cy="19.5" r="2.4" stroke={c} strokeWidth="0.35" opacity="0.3" />
      </>}
    </svg>
  );
}

function WaveformIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(180,210,255,0.28)";
  const glow = active ? "drop-shadow(0 0 5px rgba(77,166,255,0.9)) drop-shadow(0 0 2px rgba(77,166,255,1))" : "none";
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none" style={{ filter: glow, transition: "filter 0.3s ease" }}>
      {/* Bio-rhythm / ECG waveform */}
      <path d="M 1.5 11 L 5.5 11 L 7 6.5 L 9 17 L 11 3 L 12.8 14.5 L 14.5 11 L 26.5 11"
        stroke={c} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      {/* Peak accent nodes */}
      <circle cx="11" cy="3" r="1.1" fill={c} opacity={active ? 0.9 : 0.3} />
      <circle cx="7" cy="6.5" r="0.8" fill={c} opacity={active ? 0.6 : 0.2} />
      <circle cx="9" cy="17" r="0.8" fill={c} opacity={active ? 0.6 : 0.2} />
      {/* Subtle baseline ticks */}
      {active && <>
        <line x1="1.5" y1="18.5" x2="1.5" y2="20" stroke={c} strokeWidth="0.55" strokeLinecap="round" opacity="0.3" />
        <line x1="7" y1="18.5" x2="7" y2="20" stroke={c} strokeWidth="0.55" strokeLinecap="round" opacity="0.3" />
        <line x1="14.5" y1="18.5" x2="14.5" y2="20" stroke={c} strokeWidth="0.55" strokeLinecap="round" opacity="0.3" />
        <line x1="21" y1="18.5" x2="21" y2="20" stroke={c} strokeWidth="0.55" strokeLinecap="round" opacity="0.3" />
        <line x1="26.5" y1="18.5" x2="26.5" y2="20" stroke={c} strokeWidth="0.55" strokeLinecap="round" opacity="0.3" />
      </>}
    </svg>
  );
}

/** Premium bar-chart stats icon for /stats */
function StatsIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(180,210,255,0.28)";
  const glow = active ? "drop-shadow(0 0 5px rgba(77,166,255,0.9)) drop-shadow(0 0 2px rgba(77,166,255,1))" : "none";
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" style={{ filter: glow, transition: "filter 0.3s ease" }}>
      {/* Three rising bars */}
      <rect x="3" y="16" width="5" height="7" rx="1.2"
        stroke={c} strokeWidth="0.9" fill={active ? `${c}10` : "none"} />
      <rect x="10.5" y="10.5" width="5" height="12.5" rx="1.2"
        stroke={c} strokeWidth="0.9" fill={active ? `${c}10` : "none"} />
      <rect x="18" y="5" width="5" height="18" rx="1.2"
        stroke={c} strokeWidth="0.9" fill={active ? `${c}10` : "none"} />
      {/* Trend line connecting bar tops */}
      <path d="M 5.5 16 L 13 10.5 L 20.5 5"
        stroke={c} strokeWidth="0.7" strokeLinecap="round" strokeDasharray="1.4 1.6" opacity="0.55" />
      {/* Node dots at top of each bar */}
      <circle cx="5.5" cy="16" r="1.2" fill={c} opacity={active ? 0.9 : 0.35} />
      <circle cx="13"  cy="10.5" r="1.2" fill={c} opacity={active ? 0.9 : 0.35} />
      <circle cx="20.5" cy="5"  r="1.2" fill={c} opacity={active ? 0.9 : 0.35} />
      {/* Active halo on topmost node */}
      {active && <circle cx="20.5" cy="5" r="2.4" stroke={c} strokeWidth="0.35" opacity="0.28" />}
    </svg>
  );
}

function CenterFABIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="10" y1="3.5" x2="10" y2="16.5" stroke="rgba(2,12,24,0.95)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3.5" y1="10" x2="16.5" y2="10" stroke="rgba(2,12,24,0.95)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/** Stacked data layers — "Danh sách Task" / MyList nav slot */
function MyListIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(180,210,255,0.28)";
  const glow = active ? "drop-shadow(0 0 5px rgba(77,166,255,0.9)) drop-shadow(0 0 2px rgba(77,166,255,1))" : "none";
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" style={{ filter: glow, transition: "filter 0.3s ease" }}>
      {/* Bottom layer */}
      <rect x="5.5" y="18.5" width="15" height="4" rx="1.4"
        stroke={c} strokeWidth="0.8" fill={active ? `${c}07` : "none"} />
      {/* Middle layer */}
      <rect x="4" y="12.5" width="18" height="5" rx="1.4"
        stroke={c} strokeWidth="0.85" fill={active ? `${c}08` : "none"} />
      {/* Top layer (main, brightest) */}
      <rect x="3" y="5.5" width="20" height="6" rx="1.5"
        stroke={c} strokeWidth="0.95" fill={active ? `${c}11` : "none"} />
      {/* Detail lines inside top panel */}
      <line x1="6.5" y1="8" x2="19.5" y2="8" stroke={c} strokeWidth="0.6" strokeLinecap="round" opacity={active ? 0.55 : 0.2} />
      <line x1="6.5" y1="10" x2="15" y2="10" stroke={c} strokeWidth="0.5" strokeLinecap="round" opacity={active ? 0.35 : 0.12} />
      {/* Node dot — top-right corner of top panel */}
      <circle cx="20.5" cy="8.5" r="1.4" fill={c} opacity={active ? 0.9 : 0.35} />
      {active && <circle cx="20.5" cy="8.5" r="2.6" stroke={c} strokeWidth="0.35" opacity="0.28" />}
      {/* Small connector nodes between layers */}
      <circle cx="13" cy="12.5" r="0.8" fill={c} opacity={active ? 0.55 : 0.2} />
      <circle cx="13" cy="18.5" r="0.8" fill={c} opacity={active ? 0.4 : 0.15} />
    </svg>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const fabActive = path === "/task";

  /** Small glowing indicator dot beneath each regular icon */
  const Dot = ({ active }: { active: boolean }) => (
    <div style={{
      marginTop: 5,
      width: active ? 4 : 3,
      height: active ? 4 : 3,
      borderRadius: "50%",
      flexShrink: 0,
      background: active ? "#4DA6FF" : "rgba(255,255,255,0.1)",
      boxShadow: active ? "0 0 6px rgba(77,166,255,0.8)" : "none",
      opacity: active ? 1 : 0.4,
      transition: "all 0.3s ease",
    }} />
  );

  /** Regular icon tab */
  const Tab = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = path === to;
    return (
      <button
        onClick={() => navigate(to)}
        className="relative flex flex-col items-center justify-center transition-all duration-300"
        style={{ flex: 1, height: "100%", minWidth: 0 }}
      >
        {isActive && (
          <div className="absolute inset-x-1 inset-y-2 rounded-2xl" style={{
            background: "radial-gradient(ellipse at center, rgba(77,166,255,0.10) 0%, transparent 70%)",
          }} />
        )}
        {children}
        <Dot active={isActive} />
      </button>
    );
  };

  return (
    /**
     * 80 px tall, overflow hidden — nothing breaks out.
     * All 5 items live in a single flex row, vertically centred.
     */
    <div
      className="flex-shrink-0 relative"
      style={{ height: 80, overflow: "hidden" }}
    >
      {/* Glass background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, rgba(6,14,30,0.97) 0%, rgba(3,8,20,0.99) 100%)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
      }} />

      {/* Top shimmer border */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(77,166,255,0.08) 20%, rgba(77,166,255,0.25) 50%, rgba(77,166,255,0.08) 80%, transparent 100%)"
      }} />
      <div className="absolute left-0 right-0" style={{
        top: 1, height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 70%, transparent 100%)"
      }} />

      {/* ── 5-item flex row — fully contained ── */}
      <div className="absolute inset-0 flex items-center justify-around px-1">

        {/* 1 — Home */}
        <Tab to="/"><HomeIcon active={path === "/"} /></Tab>

        {/* 2 — Neural Matrix */}
        <Tab to="/dashboard"><NeuralIcon active={path === "/dashboard"} /></Tab>

        {/* 3 — Center FAB (inline, no overflow tricks) */}
        <button
          onClick={() => navigate("/task")}
          className="flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200"
          style={{
            width: 56, height: 56,
            background: "linear-gradient(145deg, #10b981 0%, #059669 100%)",
            border: "2px solid rgba(255,255,255,0.22)",
            boxShadow: fabActive
              ? "0 0 0 5px rgba(16,185,129,0.20), 0 0 22px rgba(16,185,129,0.60), 0 0 44px rgba(16,185,129,0.22), 0 4px 18px rgba(0,0,0,0.50)"
              : "0 0 0 3px rgba(16,185,129,0.11), 0 0 16px rgba(16,185,129,0.42), 0 0 32px rgba(16,185,129,0.15), 0 4px 14px rgba(0,0,0,0.45)",
            transform: fabActive ? "scale(1.07)" : "scale(1)",
            animation: "fabPulse 2.8s ease-in-out infinite",
          }}
        >
          <Plus size={26} strokeWidth={2.5} color="white" style={{ display: "block" }} />
        </button>

        {/* 4 — My List */}
        <Tab to="/mylist"><MyListIcon active={path === "/mylist"} /></Tab>

        {/* 5 — Stats */}
        <Tab to="/stats"><StatsIcon active={path === "/stats"} /></Tab>

      </div>
    </div>
  );
}

// ── DNA Background ────────────────────────────────────────────────────────────
function DNABackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" viewBox="0 0 390 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bgWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4DA6FF" />
            <stop offset="50%" stopColor="#00E87A" />
            <stop offset="100%" stopColor="#FF4D6D" />
          </linearGradient>
        </defs>
        {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((y, i) => (
          <path key={i} d={`M 0 ${y + 50} Q 97 ${y} 195 ${y + 50} Q 293 ${y + 100} 390 ${y + 50}`}
            fill="none" stroke="url(#bgWave)" strokeWidth="1" opacity={0.6} />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <g key={`dl${i}`}>
            <circle cx={14 + Math.sin(i * 0.75) * 11} cy={18 + i * 40} r="2.5" fill="#4DA6FF" opacity="0.5" />
            <circle cx={14 - Math.sin(i * 0.75) * 11} cy={18 + i * 40} r="2.5" fill="#00E87A" opacity="0.5" />
            <line x1={14 + Math.sin(i * 0.75) * 11} y1={18 + i * 40} x2={14 - Math.sin(i * 0.75) * 11} y2={18 + i * 40}
              stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          </g>
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <g key={`dr${i}`}>
            <circle cx={376 + Math.cos(i * 0.75) * 10} cy={18 + i * 40} r="2" fill="#FF4D6D" opacity="0.4" />
            <circle cx={376 - Math.cos(i * 0.75) * 10} cy={18 + i * 40} r="2" fill="#4DA6FF" opacity="0.4" />
            <line x1={376 + Math.cos(i * 0.75) * 10} y1={18 + i * 40} x2={376 - Math.cos(i * 0.75) * 10} y2={18 + i * 40}
              stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          </g>
        ))}
        {[[70, 200], [200, 350], [320, 180], [140, 520], [280, 470], [90, 660], [310, 710], [180, 760]].map(([x, y], i) => (
          <g key={`sn${i}`}>
            <circle cx={x} cy={y} r="3.5" fill="#4DA6FF" opacity="0.2" />
            <circle cx={x} cy={y} r="7" fill="none" stroke="#4DA6FF" strokeWidth="0.5" opacity="0.12" />
          </g>
        ))}
      </svg>
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #4DA6FF 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #00E87A 0%, transparent 70%)" }} />
    </div>
  );
}

// ── Root Layout ───────────────────────────────────────────────────────────────
export function BioAppRoot() {
  const location = useLocation();
  const isFlow = location.pathname === "/flow";

  return (
    <AppProvider>
      <div className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #020B18 0%, #040E1C 50%, #030910 100%)", fontFamily: FONT }}>
        <DNABackground />
        <div className="relative w-full max-w-sm mx-auto flex flex-col overflow-hidden"
          style={{ height: "100dvh", maxHeight: 900, zIndex: 1 }}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
            <Outlet />
          </div>
          {!isFlow && <BottomNav />}
        </div>
      </div>
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(16,185,129,0.12), 0 0 20px rgba(16,185,129,0.45), 0 0 40px rgba(16,185,129,0.18), 0 6px 22px rgba(0,0,0,0.50); }
          50%       { box-shadow: 0 0 0 7px rgba(16,185,129,0.20), 0 0 32px rgba(16,185,129,0.65), 0 0 60px rgba(16,185,129,0.28), 0 8px 28px rgba(0,0,0,0.55); }
        }
        @keyframes fabRingPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.12); opacity: 0.2; }
        }
        @keyframes pulse-green { 0%,100% { box-shadow: 0 0 12px rgba(0,232,122,0.4),0 0 24px rgba(0,232,122,0.15); } 50% { box-shadow: 0 0 22px rgba(0,232,122,0.7),0 0 44px rgba(0,232,122,0.25); } }
        @keyframes breatheAura { 0%,100% { box-shadow: 0 0 16px rgba(0,232,122,0.15), 0 0 32px rgba(0,200,100,0.06); border-color: rgba(0,232,122,0.38); } 50% { box-shadow: 0 0 32px rgba(0,232,122,0.32), 0 0 64px rgba(0,200,100,0.14); border-color: rgba(0,232,122,0.6); } }
        @keyframes pulse-blue  { 0%,100% { box-shadow: 0 0 12px rgba(77,166,255,0.35),0 0 24px rgba(77,166,255,0.1); } 50% { box-shadow: 0 0 22px rgba(77,166,255,0.6),0 0 44px rgba(77,166,255,0.2); } }
        @keyframes pulse-pink  { 0%,100% { box-shadow: 0 0 10px rgba(255,77,109,0.35),0 0 20px rgba(255,77,109,0.1); } 50% { box-shadow: 0 0 18px rgba(255,77,109,0.6),0 0 36px rgba(255,77,109,0.2); } }
        @keyframes float        { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes blink-dot    { 0%,100% { opacity:0.25; } 50% { opacity:1; } }
        @keyframes shimmer      { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes expand-ring  { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.08); opacity:1; } }
        @keyframes count-pulse  { 0%,100% { opacity:1; } 50% { opacity:0.65; } }
        * { -ms-overflow-style:none; scrollbar-width:none; }
        *::-webkit-scrollbar { display:none; }
        input[type="time"]::-webkit-calendar-picker-indicator { display:none; }
      `}</style>
    </AppProvider>
  );
}
import { useState, useEffect, useRef } from "react";
import { useApp, Task, TaskType } from "../context/AppContext";
import { DrumTimePicker } from "../components/DrumTimePicker";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

const glass = (border = "rgba(255,255,255,0.08)") => ({
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${border}`,
  borderRadius: 16,
});

const SYSTEM_PROMPT = `Bạn là trợ lý phân tích nhiệm vụ. Hãy phân tích yêu cầu của tôi và trả về JSON với định dạng:\n{\n  "name": "Tên nhiệm vụ",\n  "type": "simple|complex|longterm",\n  "priority": 1-4,\n  "deadline": "DD/MM/YYYY" hoặc null,\n  "subtasks": ["subtask 1", "subtask 2"] hoặc []\n}\nChỉ trả về JSON thuần, không thêm giải thích.`;

// ── Premium SVG Icon Library ──────────────────────────────────────────────────

/** Neural Node — top tab "Thêm Task" */
function NeuralNodeIcon({ active }: { active: boolean }) {
  const c = active ? "#00E87A" : "rgba(255,255,255,0.3)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.2" fill={active ? "rgba(0,232,122,0.25)" : "rgba(255,255,255,0.06)"} stroke={c} strokeWidth="0.9"/>
      <circle cx="8" cy="8" r="1" fill={c}/>
      <circle cx="8" cy="8" r="4.5" stroke={c} strokeWidth="0.5" strokeDasharray="1.8 1.8" opacity="0.5"/>
      <circle cx="8" cy="3" r="1.1" fill={c} opacity="0.8"/>
      <circle cx="13" cy="8" r="1.1" fill={c} opacity="0.8"/>
      <circle cx="8" cy="13" r="1.1" fill={c} opacity="0.8"/>
      <circle cx="3" cy="8" r="1.1" fill={c} opacity="0.8"/>
      <line x1="8" y1="5.8" x2="8" y2="4.1" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="10.2" y1="8" x2="11.9" y2="8" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="8" y1="10.2" x2="8" y2="11.9" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="5.8" y1="8" x2="4.1" y2="8" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
    </svg>
  );
}

/** Layered Data Crystal — top tab "Task của tôi" */
function DataCrystalIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(255,255,255,0.3)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5 L13.5 7 L8 14.5 L2.5 7 Z"
        fill={active ? "rgba(77,166,255,0.08)" : "rgba(255,255,255,0.03)"} stroke={c} strokeWidth="0.85" strokeLinejoin="round"/>
      <path d="M8 4.5 L11.2 7.5 L8 11.5 L4.8 7.5 Z"
        fill={active ? "rgba(77,166,255,0.1)" : "rgba(255,255,255,0.03)"} stroke={c} strokeWidth="0.6" strokeLinejoin="round" opacity="0.75"/>
      <line x1="8" y1="1.5" x2="8" y2="4.5" stroke={c} strokeWidth="0.55" opacity="0.5"/>
      <line x1="2.5" y1="7" x2="4.8" y2="7.5" stroke={c} strokeWidth="0.55" opacity="0.45"/>
      <line x1="13.5" y1="7" x2="11.2" y2="7.5" stroke={c} strokeWidth="0.55" opacity="0.45"/>
      <line x1="8" y1="11.5" x2="8" y2="14.5" stroke={c} strokeWidth="0.55" opacity="0.5"/>
      <circle cx="8" cy="7.5" r="1.2" fill={c} opacity="0.7"/>
    </svg>
  );
}

/** Fountain Quill — sub-tab "Nhập Thủ Công" */
function QuillIcon({ active }: { active: boolean }) {
  const c = active ? "#4DA6FF" : "rgba(255,255,255,0.3)";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13 1.5 Q8 2.5 4 8 L3 12.5 L6.5 11 Q11 7 12.5 1.5 Z"
        fill={active ? "rgba(77,166,255,0.08)" : "rgba(255,255,255,0.03)"} stroke={c} strokeWidth="0.9" strokeLinejoin="round"/>
      <path d="M13 1.5 L4 8" stroke={c} strokeWidth="0.75" strokeLinecap="round" opacity="0.55"/>
      <path d="M4 8 L3 12.5 L6.5 11" fill={active ? "rgba(77,166,255,0.15)" : "rgba(255,255,255,0.04)"} stroke={c} strokeWidth="0.8" strokeLinejoin="round"/>
      <line x1="3" y1="13.2" x2="7" y2="13.2" stroke={c} strokeWidth="0.7" strokeLinecap="round" opacity="0.45"/>
    </svg>
  );
}

/** Glowing AI Core — sub-tab "AI Tạo Prompt" */
function AICoreIcon({ active }: { active: boolean }) {
  const c = active ? "#00E87A" : "rgba(255,255,255,0.3)";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6" stroke={c} strokeWidth="0.55" strokeDasharray="1.8 1.8" opacity="0.4"/>
      <circle cx="7.5" cy="7.5" r="3.8" stroke={c} strokeWidth="0.8" opacity="0.65"/>
      <circle cx="7.5" cy="7.5" r="2" fill={active ? "rgba(0,232,122,0.25)" : "rgba(255,255,255,0.05)"} stroke={c} strokeWidth="0.9"/>
      <circle cx="7.5" cy="7.5" r="0.9" fill={c}/>
      <line x1="7.5" y1="3.7" x2="7.5" y2="1.8" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="11.3" y1="7.5" x2="13.2" y2="7.5" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="7.5" y1="11.3" x2="7.5" y2="13.2" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="3.7" y1="7.5" x2="1.8" y2="7.5" stroke={c} strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="10.2" y1="4.8" x2="11.5" y2="3.5" stroke={c} strokeWidth="0.6" strokeLinecap="round" opacity="0.55"/>
      <line x1="10.2" y1="10.2" x2="11.5" y2="11.5" stroke={c} strokeWidth="0.6" strokeLinecap="round" opacity="0.55"/>
      <line x1="4.8" y1="10.2" x2="3.5" y2="11.5" stroke={c} strokeWidth="0.6" strokeLinecap="round" opacity="0.55"/>
      <line x1="4.8" y1="4.8" x2="3.5" y2="3.5" stroke={c} strokeWidth="0.6" strokeLinecap="round" opacity="0.55"/>
    </svg>
  );
}

/** Single Loop — "Task đơn giản" */
function SingleLoopIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3.5 Q17 3.5 17 10 Q17 16.5 10 16.5 Q3 16.5 3 10 Q3 6 6 4.5"
        stroke={color} strokeWidth="1.25" strokeLinecap="round" fill="none"/>
      <path d="M4.5 2.5 L6 4.5 L4 6.5"
        stroke={color} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="10" cy="10" r="1.8" fill={`${color}30`} stroke={`${color}70`} strokeWidth="0.75"/>
      <circle cx="10" cy="10" r="0.8" fill={color} opacity="0.85"/>
    </svg>
  );
}

/** Molecular Network — "Task phức tạp" */
function MolecularNetworkIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2" fill={`${color}25`} stroke={color} strokeWidth="0.9"/>
      <line x1="10" y1="8" x2="10" y2="4.5" stroke={color} strokeWidth="0.85" strokeLinecap="round"/>
      <line x1="11.7" y1="8.7" x2="14.8" y2="6.2" stroke={color} strokeWidth="0.85" strokeLinecap="round"/>
      <line x1="11.7" y1="11.3" x2="14.8" y2="13.8" stroke={color} strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="10" y1="12" x2="10" y2="15.5" stroke={color} strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="8.3" y1="11.3" x2="5.2" y2="13.8" stroke={color} strokeWidth="0.8" strokeLinecap="round"/>
      <line x1="8.3" y1="8.7" x2="5.2" y2="6.2" stroke={color} strokeWidth="0.85" strokeLinecap="round"/>
      <circle cx="10" cy="4.5" r="1.3" fill={color} opacity="0.8"/>
      <circle cx="14.8" cy="6.2" r="1.1" fill={color} opacity="0.7"/>
      <circle cx="14.8" cy="13.8" r="1.1" fill={color} opacity="0.65"/>
      <circle cx="10" cy="15.5" r="1.3" fill={color} opacity="0.8"/>
      <circle cx="5.2" cy="13.8" r="1.1" fill={color} opacity="0.65"/>
      <circle cx="5.2" cy="6.2" r="1.1" fill={color} opacity="0.7"/>
    </svg>
  );
}

/** Infinity + Brainwave — "Học dài hạn" */
function InfinityBrainIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
      {/* Infinity lobes */}
      <path d="M11 7 Q10 3.5 7 3.5 Q3 3.5 3 7 Q3 10.5 7 10.5 Q10 10.5 11 7 Q12 3.5 15 3.5 Q19 3.5 19 7 Q19 10.5 15 10.5 Q12 10.5 11 7"
        stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      {/* Brainwave interwoven through center */}
      <path d="M7.5 7 L8.5 4.5 L9.2 9.5 L10 5 L10.8 9 L11.5 5.5 L12.5 7 L13.5 7"
        stroke={color} strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
      {/* Lobe anchor nodes */}
      <circle cx="7" cy="7" r="1.1" fill={`${color}55`} stroke={color} strokeWidth="0.6"/>
      <circle cx="15" cy="7" r="1.1" fill={`${color}55`} stroke={color} strokeWidth="0.6"/>
    </svg>
  );
}

/** Hourglass — deadline indicator */
function HourglassIcon() {
  return (
    <svg width="9" height="12" viewBox="0 0 9 12" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M0.75 0.75 L8.25 0.75 L4.5 5.5 L8.25 11.25 L0.75 11.25 L4.5 5.5 Z"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeLinejoin="round"/>
      <path d="M1.5 1.6 L7.5 1.6 L4.5 4.8 Z" fill="rgba(255,255,255,0.18)"/>
      <path d="M4.5 7.8 L7.5 10.4 L1.5 10.4 Z" fill="rgba(255,255,255,0.12)"/>
      <line x1="2.8" y1="5.5" x2="6.2" y2="5.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6"/>
    </svg>
  );
}

/** Priority dot indicator */
function PriorityDot({ p }: { p: number }) {
  const cfg = [
    { color: "#FF4D6D", glow: "rgba(255,77,109,0.75)" },
    { color: "#FFA500", glow: "rgba(255,165,0,0.7)" },
    { color: "#4DA6FF", glow: "rgba(77,166,255,0.65)" },
    { color: "rgba(160,160,185,0.55)", glow: "rgba(160,160,185,0.2)" },
  ][p - 1] ?? { color: "rgba(255,255,255,0.2)", glow: "transparent" };
  return (
    <span className="flex-shrink-0 inline-flex items-center justify-center rounded-full"
      style={{
        width: 8, height: 8,
        background: cfg.color,
        boxShadow: `0 0 5px ${cfg.glow}, 0 0 10px ${cfg.glow}`,
        border: `1px solid ${cfg.color}`,
      }} />
  );
}

// ── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="relative rounded-full transition-all duration-300 flex-shrink-0"
      style={{ width: 40, height: 22, background: value ? "rgba(0,232,122,0.25)" : "rgba(255,255,255,0.08)", border: `1px solid ${value ? "rgba(0,232,122,0.5)" : "rgba(255,255,255,0.12)"}`, boxShadow: value ? "0 0 10px rgba(0,232,122,0.3)" : "none" }}>
      <div className="absolute top-0.5 rounded-full transition-all duration-300"
        style={{ width: 18, height: 18, left: value ? "calc(100% - 20px)" : 2, background: value ? "#00E87A" : "rgba(255,255,255,0.3)", boxShadow: value ? "0 0 8px rgba(0,232,122,0.6)" : "none" }} />
    </button>
  );
}

// ── Priority Selector — 3D Frosted Glass Pills ────────────────────────────────
const PILL_CFG = [
  { bg: "rgba(255,77,109,0.18)",   border: "rgba(255,77,109,0.75)",   shadow: "rgba(255,77,109,0.55)",   text: "#FF6B85" },
  { bg: "rgba(255,165,0,0.16)",    border: "rgba(255,165,0,0.75)",    shadow: "rgba(255,165,0,0.5)",     text: "#FFB830" },
  { bg: "rgba(77,166,255,0.14)",   border: "rgba(77,166,255,0.7)",    shadow: "rgba(77,166,255,0.5)",    text: "#7BC4FF" },
  { bg: "rgba(170,170,195,0.09)",  border: "rgba(180,180,200,0.38)",  shadow: "rgba(180,180,200,0.2)",   text: "rgba(200,200,220,0.75)" },
];

function PrioritySelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>
        Độ ưu tiên <span style={{ color: "rgba(255,255,255,0.25)" }}>(1 = cao nhất)</span>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(p => {
          const cfg = PILL_CFG[p - 1];
          const active = value === p;
          return (
            <button key={p} onClick={() => onChange(p)}
              className="flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 relative overflow-hidden"
              style={active ? {
                background: `linear-gradient(180deg, ${cfg.bg} 0%, rgba(0,0,0,0.25) 100%)`,
                backdropFilter: "blur(12px)",
                border: `1.5px solid ${cfg.border}`,
                boxShadow: `0 0 14px ${cfg.shadow}, 0 0 28px ${cfg.shadow}50, inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1.5px 2px rgba(0,0,0,0.35)`,
              } : {
                background: "rgba(255,255,255,0.035)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07)",
              }}>
              {/* Specular top highlight when active */}
              {active && (
                <div className="absolute top-0 left-0 right-0 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${cfg.border}, transparent)` }} />
              )}
              <span style={{
                color: active ? cfg.text : "rgba(255,255,255,0.28)",
                fontSize: 14, fontWeight: 700, fontFamily: FONT, lineHeight: 1,
              }}>{p}</span>
              <PriorityDot p={p} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Difficulty Selector — 3D Frosted Glass Pills ──────────────────────────────
const DIFF_CFG = [
  { bg: "rgba(0,232,122,0.16)",  border: "rgba(0,232,122,0.75)",  shadow: "rgba(0,232,122,0.5)",   text: "#00E87A", dot: "#00E87A"  },
  { bg: "rgba(255,165,0,0.16)",  border: "rgba(255,165,0,0.75)",  shadow: "rgba(255,165,0,0.5)",   text: "#FFB830", dot: "#FFB830"  },
  { bg: "rgba(255,77,109,0.18)", border: "rgba(255,77,109,0.75)", shadow: "rgba(255,77,109,0.55)", text: "#FF6B85", dot: "#FF6B85"  },
];

function DifficultySelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>
        Độ khó <span style={{ color: "rgba(255,255,255,0.25)" }}>(1 = Dễ, 3 = Khó)</span>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3].map(d => {
          const cfg = DIFF_CFG[d - 1];
          const active = value === d;
          return (
            <button key={d} onClick={() => onChange(d)}
              className="flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all duration-200 relative overflow-hidden"
              style={active ? {
                background: `linear-gradient(180deg, ${cfg.bg} 0%, rgba(0,0,0,0.25) 100%)`,
                backdropFilter: "blur(12px)",
                border: `1.5px solid ${cfg.border}`,
                boxShadow: `0 0 14px ${cfg.shadow}, 0 0 28px ${cfg.shadow}50, inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1.5px 2px rgba(0,0,0,0.35)`,
              } : {
                background: "rgba(255,255,255,0.035)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.07)",
              }}>
              {active && (
                <div className="absolute top-0 left-0 right-0 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${cfg.border}, transparent)` }} />
              )}
              <span style={{
                color: active ? cfg.text : "rgba(255,255,255,0.28)",
                fontSize: 14, fontWeight: 700, fontFamily: FONT, lineHeight: 1,
              }}>{d}</span>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: active ? cfg.dot : "rgba(255,255,255,0.12)",
                boxShadow: active ? `0 0 6px ${cfg.dot}` : "none",
                transition: "all 0.2s",
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Task Category Selector ────────────────────────────────────────────────────
const TASK_TYPES: Array<{ key: TaskType; label: string; color: string; Icon: React.FC<{ color: string }> }> = [
  { key: "simple",   label: "Đơn giản",    color: "#00E87A", Icon: SingleLoopIcon },
  { key: "complex",  label: "Phức tạp",    color: "#4DA6FF", Icon: MolecularNetworkIcon },
  { key: "longterm", label: "Học dài hạn", color: "#FFA500", Icon: ({ color }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <InfinityBrainIcon color={color} />
    </div>
  )},
];

function TaskTypeSelector({ value, onChange }: { value: TaskType; onChange: (t: TaskType) => void }) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>Loại Task</label>
      <div className="flex gap-2">
        {TASK_TYPES.map(({ key, label, color, Icon }) => {
          const active = value === key;
          return (
            <button key={key} onClick={() => onChange(key)}
              className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-200"
              style={{
                background: active ? `${color}10` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${active ? `${color}50` : "rgba(255,255,255,0.08)"}`,
                boxShadow: active ? `0 0 12px ${color}20` : "none",
              }}>
              <Icon color={active ? color : "rgba(255,255,255,0.22)"} />
              <span style={{ color: active ? color : "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT, letterSpacing: 0.2 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Date Picker Input (glassmorphism calendar) ────────────────────────────────
const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const DAYS_VI   = ["CN","T2","T3","T4","T5","T6","T7"];

function DatePickerInput({ value, onChange, style }: {
  value: string; onChange: (v: string) => void; style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Parse "DD/MM/YYYY HH:MM" or legacy "DD/MM/YYYY"
  function parseDateTime(s: string): { date: Date | null; hh: number; mm: number } {
    if (!s) return { date: null, hh: 23, mm: 59 };
    const [datePart, timePart] = s.split(" ");
    const [d, m, y] = (datePart || "").split("/").map(Number);
    const dt = (d && m && y) ? new Date(y, m - 1, d) : null;
    let hh = 23, mm = 59;
    if (timePart) {
      const [ph, pm] = timePart.split(":").map(Number);
      if (!isNaN(ph) && ph >= 0 && ph <= 23) hh = ph;
      if (!isNaN(pm) && pm >= 0 && pm <= 59) mm = pm;
    }
    return { date: dt && !isNaN(dt.getTime()) ? dt : null, hh, mm };
  }

  const { date: initDate, hh: initHH, mm: initMM } = parseDateTime(value);
  const [viewYear,  setViewYear]  = useState(initDate ? initDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate ? initDate.getMonth()    : today.getMonth());
  const [selDate,   setSelDate]   = useState<Date | null>(initDate);
  const [hour,   setHour]   = useState(initHH);
  const [minute, setMinute] = useState(initMM);

  // Sync when value changes externally while picker is closed
  useEffect(() => {
    if (open) return;
    const { date, hh, mm } = parseDateTime(value);
    setSelDate(date); setHour(hh); setMinute(mm);
    if (date) { setViewYear(date.getFullYear()); setViewMonth(date.getMonth()); }
  }, [value, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
  }
  function pickDay(day: number) { setSelDate(new Date(viewYear, viewMonth, day)); }
  function confirm() {
    if (!selDate) return;
    const dd = String(selDate.getDate()).padStart(2, "0");
    const mo = String(selDate.getMonth() + 1).padStart(2, "0");
    const yy = selDate.getFullYear();
    onChange(`${dd}/${mo}/${yy} ${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`);
    setOpen(false);
  }
  function clear() { onChange(""); setSelDate(null); setHour(23); setMinute(59); setOpen(false); }

  const selD = selDate?.getDate()     ?? null;
  const selM = selDate?.getMonth()    ?? null;
  const selY = selDate?.getFullYear() ?? null;

  const chevBtn: React.CSSProperties = {
    width: 32, height: 26, borderRadius: 8,
    background: "rgba(77,166,255,0.07)", border: "1px solid rgba(77,166,255,0.16)",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Trigger row */}
      <div onClick={() => setOpen(o => !o)}
        style={{ ...style, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none" }}>
        <span style={{ color: value ? "#fff" : "rgba(255,255,255,0.28)", fontSize: 14, fontFamily: FONT }}>
          {value || "VD: 21/04/2026 23:59"}
        </span>
        {/* Calendar + Clock combined fine-line icon */}
        <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
          <rect x="1" y="2.5" width="12" height="11" rx="2" stroke="rgba(77,166,255,0.5)" strokeWidth="0.95"/>
          <line x1="4.5" y1="1"   x2="4.5" y2="4.2" stroke="rgba(77,166,255,0.6)"  strokeWidth="1.1" strokeLinecap="round"/>
          <line x1="9.5" y1="1"   x2="9.5" y2="4.2" stroke="rgba(77,166,255,0.6)"  strokeWidth="1.1" strokeLinecap="round"/>
          <line x1="1"   y1="5.8" x2="13"  y2="5.8" stroke="rgba(77,166,255,0.28)" strokeWidth="0.75"/>
          <circle cx="4.5" cy="9"  r="0.85" fill="rgba(77,166,255,0.55)"/>
          <circle cx="7"   cy="9"  r="0.85" fill="rgba(77,166,255,0.55)"/>
          <circle cx="4.5" cy="12" r="0.7"  fill="rgba(77,166,255,0.35)"/>
          <circle cx="7"   cy="12" r="0.7"  fill="rgba(77,166,255,0.35)"/>
          {/* Clock overlaid bottom-right */}
          <circle cx="17" cy="11" r="4"   stroke="rgba(77,166,255,0.58)" strokeWidth="1"   fill="rgba(5,12,28,0.95)"/>
          <line x1="17"  y1="8.5" x2="17"  y2="11"   stroke="rgba(77,166,255,0.85)" strokeWidth="1.1" strokeLinecap="round"/>
          <line x1="17"  y1="11"  x2="19"  y2="12.2" stroke="rgba(77,166,255,0.85)" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 200,
          background: "rgba(5,12,28,0.98)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          border: "1px solid rgba(77,166,255,0.22)",
          borderRadius: 18,
          padding: "14px 12px 12px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(77,166,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={prevMonth} style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(77,166,255,0.08)", border: "1px solid rgba(77,166,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7 2 L3.5 5.5 L7 9" stroke="rgba(77,166,255,0.75)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: FONT, letterSpacing: 0.2 }}>
              {MONTHS_VI[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(77,166,255,0.08)", border: "1px solid rgba(77,166,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M4 2 L7.5 5.5 L4 9" stroke="rgba(77,166,255,0.75)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {DAYS_VI.map(d => (
              <div key={d} style={{ textAlign: "center", color: "rgba(77,166,255,0.45)", fontSize: 9, fontFamily: FONT, paddingBottom: 3 }}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSel   = day === selD && viewMonth === selM && viewYear === selY;
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              return (
                <button key={day} onClick={() => pickDay(day)} style={{
                  width: "100%", aspectRatio: "1", borderRadius: 8, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSel ? "rgba(77,166,255,0.28)" : isToday ? "rgba(77,166,255,0.09)" : "transparent",
                  border: isSel ? "1.5px solid rgba(77,166,255,0.75)" : isToday ? "1px solid rgba(77,166,255,0.28)" : "1px solid transparent",
                  color: isSel ? "#4DA6FF" : isToday ? "rgba(77,166,255,0.9)" : "rgba(255,255,255,0.65)",
                  fontSize: 11, fontWeight: isSel ? 700 : 400, fontFamily: FONT,
                  boxShadow: isSel ? "0 0 10px rgba(77,166,255,0.3)" : "none",
                  transition: "background 0.15s, border 0.15s",
                }}>
                  {day}
                </button>
              );
            })}
          </div>

          {/* ── Time picker ── */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(77,166,255,0.12)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <circle cx="5.5" cy="5.5" r="4.5" stroke="rgba(77,166,255,0.5)"  strokeWidth="0.9" fill="none"/>
                <line x1="5.5" y1="3"   x2="5.5" y2="5.5" stroke="rgba(77,166,255,0.75)" strokeWidth="1" strokeLinecap="round"/>
                <line x1="5.5" y1="5.5" x2="7.5" y2="6.8" stroke="rgba(77,166,255,0.75)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span style={{ color: "rgba(77,166,255,0.5)", fontSize: 9, fontFamily: FONT, letterSpacing: 1.2 }}>GIỜ KẾT THÚC</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              {/* Hour stepper */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <button onClick={() => setHour(h => (h + 1) % 24)} style={chevBtn}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1.5 6.5 L5 2 L8.5 6.5" stroke="rgba(77,166,255,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div style={{ width: 46, height: 38, borderRadius: 10, background: "rgba(77,166,255,0.08)", border: "1.5px solid rgba(77,166,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px rgba(77,166,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#4DA6FF", fontSize: 18, fontWeight: 700, fontFamily: FONT }}>{String(hour).padStart(2, "0")}</span>
                </div>
                <button onClick={() => setHour(h => (h - 1 + 24) % 24)} style={chevBtn}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1.5 1.5 L5 6 L8.5 1.5" stroke="rgba(77,166,255,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              {/* Colon */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingBottom: 2 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(77,166,255,0.55)" }} />
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(77,166,255,0.55)" }} />
              </div>
              {/* Minute stepper (5-min steps) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <button onClick={() => setMinute(m => (m + 5) % 60)} style={chevBtn}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1.5 6.5 L5 2 L8.5 6.5" stroke="rgba(77,166,255,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div style={{ width: 46, height: 38, borderRadius: 10, background: "rgba(77,166,255,0.08)", border: "1.5px solid rgba(77,166,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px rgba(77,166,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#4DA6FF", fontSize: 18, fontWeight: 700, fontFamily: FONT }}>{String(minute).padStart(2, "0")}</span>
                </div>
                <button onClick={() => setMinute(m => (m - 5 + 60) % 60)} style={chevBtn}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1.5 1.5 L5 6 L8.5 1.5" stroke="rgba(77,166,255,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Actions: Xoá + Xác nhận ── */}
          <div style={{ marginTop: 12, paddingTop: 9, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 7 }}>
            {value && (
              <button onClick={clear} style={{ flex: 1, padding: "8px 0", borderRadius: 10, background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.2)", color: "rgba(255,110,140,0.7)", fontSize: 11, fontFamily: FONT, cursor: "pointer" }}>
                Xoá
              </button>
            )}
            <button onClick={confirm} disabled={!selDate}
              style={{ flex: 2, padding: "8px 0", borderRadius: 10, fontFamily: FONT, fontSize: 11, fontWeight: 600,
                cursor: selDate ? "pointer" : "not-allowed",
                background: selDate ? "rgba(77,166,255,0.14)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selDate ? "rgba(77,166,255,0.42)" : "rgba(255,255,255,0.08)"}`,
                color: selDate ? "#4DA6FF" : "rgba(255,255,255,0.2)",
                boxShadow: selDate ? "0 0 10px rgba(77,166,255,0.12)" : "none",
              }}>
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Manual Input Form ─────────────────────────────────────────────────────────
function ManualInputForm({ onSave }: { onSave: () => void }) {
  const { tasks, setTasks } = useApp();
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<TaskType>("simple");
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(2);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [subtasks, setSubtasks] = useState<string[]>([""]);
  const [estimatedStudyTime, setEstimatedStudyTime] = useState("");

  const inputStyle = {
    background: "rgba(77,166,255,0.05)", border: "1px solid rgba(77,166,255,0.2)",
    borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, fontFamily: FONT,
    width: "100%", outline: "none",
  };

  function addSubtask() { setSubtasks([...subtasks, ""]); }
  function updateSubtask(i: number, v: string) { const n = [...subtasks]; n[i] = v; setSubtasks(n); }
  function removeSubtask(i: number) { setSubtasks(subtasks.filter((_, idx) => idx !== i)); }

  function handleSave() {
    if (!name.trim()) return;
    const newTask: Task = {
      id: `t${Date.now()}`, name: name.trim(), type, priority: type !== "longterm" ? priority : undefined,
      deadline: deadline || undefined, done: false, quadrant: priority === 1 ? 1 : priority === 2 ? 1 : 2,
      subtasks: (type === "complex" || type === "longterm") ? subtasks.filter(s => s.trim()).map((s, i) => ({ id: `s${Date.now()}${i}`, name: s, done: false })) : undefined,
      estimatedStudyTime: type === "longterm" ? estimatedStudyTime || undefined : undefined,
      difficulty,
    };
    setTasks([...tasks, newTask]);
    onSave();
    setName(""); setDeadline(""); setType("simple"); setPriority(2); setDifficulty(2); setSubtasks([""]); setEstimatedStudyTime("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>Tên nhiệm vụ</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên nhiệm vụ..." style={inputStyle} />
      </div>
      <div>
        <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>Deadline (tuỳ chọn)</label>
        <DatePickerInput value={deadline} onChange={setDeadline} style={inputStyle} />
      </div>

      <TaskTypeSelector value={type} onChange={t => { setType(t); setSubtasks([""]); setEstimatedStudyTime(""); }} />

      {type === "simple" && <PrioritySelector value={priority} onChange={v => setPriority(v as 1 | 2 | 3 | 4)} />}
      {type === "simple" && <DifficultySelector value={difficulty} onChange={v => setDifficulty(v as 1 | 2 | 3)} />}

      {type === "complex" && (
        <>
          <PrioritySelector value={priority} onChange={v => setPriority(v as 1 | 2 | 3 | 4)} />
          <DifficultySelector value={difficulty} onChange={v => setDifficulty(v as 1 | 2 | 3)} />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT }}>Subtask</label>
              <button onClick={addSubtask} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                style={{ background: "rgba(77,166,255,0.1)", border: "1px solid rgba(77,166,255,0.25)", color: "#4DA6FF", fontFamily: FONT }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Thêm
              </button>
            </div>
            {subtasks.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={s} onChange={e => updateSubtask(i, e.target.value)} placeholder={`Subtask ${i + 1}...`}
                  style={{ ...inputStyle, flex: 1 }} />
                {subtasks.length > 1 && (
                  <button onClick={() => removeSubtask(i)} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
                    <span style={{ color: "#FF8FA3", fontSize: 12 }}>✕</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── "Học dài hạn" exclusive fields ── */}
      {type === "longterm" && (
        <>
          <div>
            <label style={{ color: "rgba(255,165,0,0.7)", fontSize: 11, letterSpacing: 1, fontFamily: FONT, display: "block", marginBottom: 8 }}>
              Thời gian dự kiến học <span style={{ color: "rgba(255,165,0,0.4)", fontWeight: 400 }}>(HH:MM)</span>
            </label>
            <DrumTimePicker
              value={estimatedStudyTime}
              onChange={setEstimatedStudyTime}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ color: "rgba(255,165,0,0.7)", fontSize: 11, letterSpacing: 0.5, fontFamily: FONT }}>Phiên học</label>
              <button onClick={addSubtask}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.3)", color: "#FFB830", fontFamily: FONT, fontSize: 12 }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: "inline" }}>
                  <line x1="5.5" y1="1.5" x2="5.5" y2="9.5" stroke="#FFB830" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="1.5" y1="5.5" x2="9.5" y2="5.5" stroke="#FFB830" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Thêm Subtask
              </button>
            </div>
            {subtasks.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={s} onChange={e => updateSubtask(i, e.target.value)} placeholder={`Phiên học ${i + 1}...`}
                  style={{ background: "rgba(255,165,0,0.05)", border: "1px solid rgba(255,165,0,0.22)", borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: FONT, width: "100%", outline: "none", flex: 1 }} />
                {subtasks.length > 1 && (
                  <button onClick={() => removeSubtask(i)} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
                    <span style={{ color: "#FF8FA3", fontSize: 12 }}>✕</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={handleSave} className="w-full py-4 rounded-2xl relative overflow-hidden"
        style={{ background: name.trim() ? "linear-gradient(135deg,rgba(0,232,122,0.18),rgba(0,180,90,0.1))" : "rgba(255,255,255,0.04)", border: `1px solid ${name.trim() ? "rgba(0,232,122,0.4)" : "rgba(255,255,255,0.08)"}`, color: name.trim() ? "#00E87A" : "rgba(255,255,255,0.2)", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
        Lưu Task
      </button>
    </div>
  );
}

// ── AI Prompt Gen ─────────────────────────────────────────────────────────────
function AIPromptGen({ onSave }: { onSave: () => void }) {
  const { tasks, setTasks } = useApp();
  const [pasted, setPasted] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [parsedName, setParsedName] = useState("Xây dựng hệ thống xác thực người dùng");
  const [parsedType, setParsedType] = useState<TaskType>("complex");
  const [parsedPriority, setParsedPriority] = useState<1 | 2 | 3 | 4>(1);
  const [parsedDifficulty, setParsedDifficulty] = useState<1 | 2 | 3>(2);
  const [parsedDeadline, setParsedDeadline] = useState("05/05/2026 17:00");
  const [parsedSubtasks, setParsedSubtasks] = useState<string[]>(["Thiết kế schema DB", "Xây dựng API endpoints"]);
  const [parsedStudyTime, setParsedStudyTime] = useState("");
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(SYSTEM_PROMPT).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  async function handleAnalyze() { 
    if (!pasted.trim()) return; 
    setIsAnalyzing(true);
    try {
      const res = await fetch("http://localhost:8000/tasks/analyze-ai-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasted }),
      });
      if (!res.ok) throw new Error("Lỗi gọi API");
      const data = await res.json();
      setParsedName(data.name || "");
      setParsedType(data.type || "complex");
      setParsedPriority(data.priority || 2);
      setParsedDifficulty(data.difficulty || 2);
      setParsedDeadline(data.deadline || "");
      setParsedSubtasks(data.subtasks && data.subtasks.length > 0 ? data.subtasks : [""]);
      setParsedStudyTime(data.estimated_study_time || "");
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
      alert("Phân tích thất bại, vui lòng thử lại!");
    } finally {
      setIsAnalyzing(false);
    }
  }
  function addParsedSubtask() { setParsedSubtasks([...parsedSubtasks, ""]); }
  function updateParsedSubtask(i: number, v: string) { const n = [...parsedSubtasks]; n[i] = v; setParsedSubtasks(n); }
  function removeParsedSubtask(i: number) { setParsedSubtasks(parsedSubtasks.filter((_, idx) => idx !== i)); }
  function handleSave() {
    const newTask: Task = {
      id: `t${Date.now()}`, name: parsedName, type: parsedType,
      priority: parsedType !== "longterm" ? parsedPriority : undefined,
      deadline: parsedDeadline || undefined, done: false, quadrant: 1,
      subtasks: (parsedType === "complex" || parsedType === "longterm") ? parsedSubtasks.filter(s => s.trim()).map((s, i) => ({ id: `s${Date.now()}${i}`, name: s, done: false })) : undefined,
      estimatedStudyTime: parsedType === "longterm" ? parsedStudyTime || undefined : undefined,
      difficulty: parsedDifficulty,
    };
    setTasks([...tasks, newTask]);
    onSave();
    setPasted(""); setAnalyzed(false); setParsedStudyTime(""); setParsedDifficulty(2);
  }

  const areaStyle: React.CSSProperties = {
    background: "rgba(77,166,255,0.04)", border: "1px solid rgba(77,166,255,0.2)",
    borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 12, fontFamily: "monospace",
    width: "100%", outline: "none", resize: "none", lineHeight: 1.6,
  };
  const fieldInput: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 10, padding: "9px 12px", color: "#fff", fontSize: 13, fontFamily: FONT,
    width: "100%", outline: "none",
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT }}>Prompt hệ thống (chỉ đọc)</label>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
            style={{ background: copied ? "rgba(0,232,122,0.1)" : "rgba(77,166,255,0.1)", border: `1px solid ${copied ? "rgba(0,232,122,0.3)" : "rgba(77,166,255,0.25)"}`, color: copied ? "#00E87A" : "#4DA6FF", fontFamily: FONT }}>
            {copied ? "✓ Đã copy" : "⎘ Copy"}
          </button>
        </div>
        <textarea rows={5} readOnly value={SYSTEM_PROMPT} style={{ ...areaStyle, color: "rgba(77,166,255,0.7)", cursor: "default" }} />
      </div>
      <div>
        <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>Dán kết quả AI vào đây</label>
        <textarea rows={4} value={pasted} onChange={e => { setPasted(e.target.value); setAnalyzed(false); }}
          placeholder='{ "name": "...", "type": "...", ... }' style={{ ...areaStyle, color: "#00E87A" }} />
      </div>
      {!analyzed && (
        <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
          style={{ background: pasted.trim() && !isAnalyzing ? "rgba(0,232,122,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${pasted.trim() && !isAnalyzing ? "rgba(0,232,122,0.3)" : "rgba(255,255,255,0.08)"}`, color: pasted.trim() && !isAnalyzing ? "#00E87A" : "rgba(255,255,255,0.25)", fontSize: 14, fontWeight: 600, fontFamily: FONT }}>
          {isAnalyzing ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" fill="none"/>
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="4" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
              <line x1="6" y1="4" x2="6" y2="8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
            </svg>
          )}
          {isAnalyzing ? "Đang phân tích..." : "Phân tích"}
        </button>
      )}
      {analyzed && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)" }}>
          <p style={{ color: "#00E87A", fontSize: 11, letterSpacing: 1.5, fontFamily: FONT, marginBottom: 12 }}>✓ KẾT QUẢ PHÂN TÍCH – XÁC NHẬN</p>
          <div className="flex flex-col gap-4">

            {/* Tên nhiệm vụ — editable */}
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 6 }}>Tên nhiệm vụ</label>
              <input value={parsedName} onChange={e => setParsedName(e.target.value)} style={fieldInput} />
            </div>

            {/* Loại — interactive type buttons */}
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 8 }}>Loại task</label>
              <div className="flex gap-2">
                {TASK_TYPES.map(({ key, label, color, Icon }) => {
                  const active = parsedType === key;
                  return (
                    <button key={key} onClick={() => { setParsedType(key); setParsedSubtasks([""]); setParsedStudyTime(""); }}
                      className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-200"
                      style={{
                        background: active ? `${color}12` : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${active ? `${color}55` : "rgba(255,255,255,0.09)"}`,
                        boxShadow: active ? `0 0 10px ${color}18` : "none",
                      }}>
                      <Icon color={active ? color : "rgba(255,255,255,0.2)"} />
                      <span style={{ color: active ? color : "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: FONT }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadline — editable text input DD/MM/YYYY */}
            <div>
              <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 6 }}>Deadline (DD/MM/YYYY HH:MM)</label>
              <DatePickerInput
                value={parsedDeadline}
                onChange={setParsedDeadline}
                style={{ ...fieldInput, border: "1px solid rgba(255,165,0,0.3)", background: "rgba(255,165,0,0.06)", color: "#FFB830" }}
              />
            </div>

            {/* Priority */}
            {parsedType !== "longterm" && <PrioritySelector value={parsedPriority} onChange={v => setParsedPriority(v as 1 | 2 | 3 | 4)} />}

            {/* Difficulty */}
            {parsedType !== "longterm" && <DifficultySelector value={parsedDifficulty} onChange={v => setParsedDifficulty(v as 1 | 2 | 3)} />}

            {/* Subtasks — conditional for "complex" */}
            {parsedType === "complex" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ color: "rgba(77,166,255,0.7)", fontSize: 11, fontFamily: FONT }}>Subtask (Phức tạp)</label>
                  <button onClick={addParsedSubtask}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                    style={{ background: "rgba(77,166,255,0.1)", border: "1px solid rgba(77,166,255,0.25)", color: "#4DA6FF", fontFamily: FONT }}>
                    <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Thêm
                  </button>
                </div>
                {parsedSubtasks.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={s}
                      onChange={e => updateParsedSubtask(i, e.target.value)}
                      placeholder={`Subtask ${i + 1}...`}
                      style={{ ...fieldInput, flex: 1, borderColor: "rgba(77,166,255,0.2)", background: "rgba(77,166,255,0.04)" }}
                    />
                    {parsedSubtasks.length > 1 && (
                      <button onClick={() => removeParsedSubtask(i)}
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
                        <span style={{ color: "#FF8FA3", fontSize: 12 }}>✕</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── "Học dài hạn" exclusive fields (AI form) ── */}
            {parsedType === "longterm" && (
              <>
                <div>
                  <label style={{ color: "rgba(255,165,0,0.7)", fontSize: 11, letterSpacing: 1, fontFamily: FONT, display: "block", marginBottom: 8 }}>Thời gian dự kiến học trong: <span style={{ color: "rgba(255,165,0,0.4)", fontWeight: 400 }}>(HH:MM)</span></label>
                  <DrumTimePicker
                    value={parsedStudyTime}
                    onChange={setParsedStudyTime}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label style={{ color: "rgba(255,165,0,0.7)", fontSize: 11, letterSpacing: 0.5, fontFamily: FONT }}>Phiên học</label>
                    <button onClick={addParsedSubtask}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                      style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.3)", color: "#FFB830", fontFamily: FONT, fontSize: 12 }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: "inline" }}>
                        <line x1="5.5" y1="1.5" x2="5.5" y2="9.5" stroke="#FFB830" strokeWidth="1.4" strokeLinecap="round"/>
                        <line x1="1.5" y1="5.5" x2="9.5" y2="5.5" stroke="#FFB830" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Thêm Subtask
                    </button>
                  </div>
                  {parsedSubtasks.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={s} onChange={e => updateParsedSubtask(i, e.target.value)} placeholder={`Phiên học ${i + 1}...`}
                        style={{ ...fieldInput, flex: 1, borderColor: "rgba(255,165,0,0.22)", background: "rgba(255,165,0,0.05)" }} />
                      {parsedSubtasks.length > 1 && (
                        <button onClick={() => removeParsedSubtask(i)}
                          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
                          <span style={{ color: "#FF8FA3", fontSize: 12 }}>✕</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <button onClick={handleSave} className="w-full py-3.5 rounded-2xl"
              style={{ background: "linear-gradient(135deg,rgba(0,232,122,0.2),rgba(0,180,90,0.12))", border: "1px solid rgba(0,232,122,0.4)", color: "#00E87A", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
              Lưu Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── My Tasks (exported for MyTasksScreen) ────────────────────────────────────
export function MyTasks() {
  const { tasks } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = TASK_TYPES.map(({ key, label, color, Icon }) => ({
    type: key, label, color, Icon,
    border: key === "simple" ? "rgba(0,232,122,0.2)" : key === "complex" ? "rgba(77,166,255,0.2)" : "rgba(255,165,0,0.2)",
  }));

  return (
    <div className="flex flex-col gap-3">
      {sections.map(sec => {
        const sectionTasks = tasks.filter(t => t.type === sec.type);
        const isOpen = expanded === sec.type;
        return (
          <div key={sec.type} className="rounded-2xl overflow-hidden"
            style={{ background: `${sec.color}06`, border: `1px solid ${sec.border}` }}>
            <button onClick={() => setExpanded(isOpen ? null : sec.type)}
              className="w-full flex items-center justify-between p-4 text-left">
              <div className="flex items-center gap-3">
                {/* Section icon in glass pill */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${sec.color}12`, border: `1px solid ${sec.color}25` }}>
                  {sec.type === "longterm"
                    ? <InfinityBrainIcon color={sec.color} />
                    : <sec.Icon color={sec.color} />}
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: FONT }}>{sec.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT }}>{sectionTasks.length} task</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px]"
                  style={{ background: `${sec.color}12`, color: sec.color, fontFamily: FONT }}>
                  {sectionTasks.filter(t => !t.done).length} đang làm
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "block" }}>›</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-2">
                {sectionTasks.length === 0 && (
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: FONT, textAlign: "center", paddingTop: 8 }}>Chưa có task nào</p>
                )}
                {sectionTasks.map(task => (
                  <div key={task.id} className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p style={{ color: task.done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: FONT, textDecoration: task.done ? "line-through" : "none" }}>
                          {task.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {/* Priority dot instead of text tag */}
                          {task.priority && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <PriorityDot p={task.priority} />
                            </span>
                          )}
                          {/* Hourglass + deadline */}
                          {task.deadline && (
                            <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>
                              <HourglassIcon />
                              <span style={{ marginLeft: 3 }}>{task.deadline}</span>
                            </span>
                          )}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span style={{ color: "rgba(77,166,255,0.6)", fontSize: 10, fontFamily: FONT }}>
                              {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtask
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                        style={{ background: task.done ? "#00E87A" : `${sec.color}40`, border: `1.5px solid ${task.done ? "#00E87A" : sec.color}50` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export function TaskHub() {
  const [addMode, setAddMode] = useState<"manual" | "ai">("manual");
  const [saved, setSaved] = useState(false);

  function handleSaved() { setSaved(true); setTimeout(() => setSaved(false), 1800); }

  return (
    <div className="min-h-full px-4 pt-6 pb-4 flex flex-col gap-4">
      {/* Header */}
      <div>
        <p style={{ color: "#00E87A", fontSize: 11, letterSpacing: 2, fontFamily: FONT, marginBottom: 2 }}>THÊM NHIỆM VỤ MỚI</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: FONT }}>Tạo Task</h1>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="rounded-xl py-2.5 px-4 flex items-center justify-center gap-2"
          style={{ background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.3)" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5 L5.5 10 L11 3" stroke="#00E87A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: "#00E87A", fontSize: 13, fontFamily: FONT }}>Task đã được lưu!</span>
        </div>
      )}

      {/* Sub-tabs: Manual | AI */}
      <div className="rounded-xl p-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex">
          {([
            { m: "manual" as const, l: "Nhập Thủ Công", Icon: QuillIcon,  activeC: "#4DA6FF", activeBg: "rgba(77,166,255,0.12)",  activeBorder: "rgba(77,166,255,0.3)" },
            { m: "ai"     as const, l: "AI Tạo Prompt",  Icon: AICoreIcon, activeC: "#00E87A", activeBg: "rgba(0,232,122,0.1)",   activeBorder: "rgba(0,232,122,0.25)" },
          ]).map(({ m, l, Icon, activeC, activeBg, activeBorder }) => (
            <button key={m} onClick={() => setAddMode(m)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{
                background: addMode === m ? activeBg : "transparent",
                border: `1px solid ${addMode === m ? activeBorder : "transparent"}`,
              }}>
              <Icon active={addMode === m} />
              <span style={{ color: addMode === m ? activeC : "rgba(255,255,255,0.35)", fontFamily: FONT, fontSize: 13 }}>{l}</span>
            </button>
          ))}
        </div>
      </div>

      {addMode === "manual" ? <ManualInputForm onSave={handleSaved} /> : <AIPromptGen onSave={handleSaved} />}
    </div>
  );
}
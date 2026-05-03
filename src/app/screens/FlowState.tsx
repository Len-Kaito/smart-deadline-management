import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Play, Pause, X, RotateCcw, Settings, Droplets, Timer, Clock, Check } from "lucide-react";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

type Mode = "flowtime" | "pomodoro";
type Phase = "focus" | "break";

// ── Settings Modal ────────────────────────────────────────────────────────────
function SettingsModal({ focusMins, breakMins, onSave, onClose }: {
  focusMins: number; breakMins: number;
  onSave: (f: number, b: number) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState(focusMins);
  const [b, setB] = useState(breakMins);
  const opts = [5, 10, 15, 20, 25, 30, 45, 60];
  const bOpts = [3, 5, 10, 15, 20];

  return (
    <>
      <div className="fixed inset-0" style={{ zIndex: 100, background: "rgba(2,11,24,0.8)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 flex justify-center" style={{ zIndex: 101 }}>
        <div className="w-full max-w-sm mx-auto rounded-t-3xl p-5" style={{ background: "#0A1628", border: "1px solid rgba(77,166,255,0.2)", borderBottom: "none" }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
          <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: FONT, marginBottom: 4 }}>Cài đặt thời gian</h3>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: FONT, marginBottom: 20 }}>Tập trung & Giải lao Pomodoro</p>

          <label style={{ color: "rgba(77,166,255,0.7)", fontSize: 11, letterSpacing: 1.5, fontFamily: FONT, display: "block", marginBottom: 10 }}>THỜI GIAN TẬP TRUNG</label>
          <div className="flex flex-wrap gap-2 mb-5">
            {opts.map(v => (
              <button key={v} onClick={() => setF(v)}
                className="px-3 py-2 rounded-xl text-sm transition-all duration-200"
                style={{ background: f === v ? "rgba(77,166,255,0.15)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${f === v ? "rgba(77,166,255,0.5)" : "rgba(255,255,255,0.08)"}`, color: f === v ? "#4DA6FF" : "rgba(255,255,255,0.4)", fontFamily: FONT }}>
                {v} phút
              </button>
            ))}
          </div>

          <label style={{ color: "rgba(0,232,122,0.7)", fontSize: 11, letterSpacing: 1.5, fontFamily: FONT, display: "block", marginBottom: 10 }}>THỜI GIAN GIẢI LAO</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {bOpts.map(v => (
              <button key={v} onClick={() => setB(v)}
                className="px-3 py-2 rounded-xl text-sm transition-all duration-200"
                style={{ background: b === v ? "rgba(0,232,122,0.12)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${b === v ? "rgba(0,232,122,0.4)" : "rgba(255,255,255,0.08)"}`, color: b === v ? "#00E87A" : "rgba(255,255,255,0.4)", fontFamily: FONT }}>
                {v} phút
              </button>
            ))}
          </div>

          <button onClick={() => { onSave(f, b); onClose(); }}
            className="w-full py-3.5 rounded-2xl"
            style={{ background: "linear-gradient(135deg,rgba(0,232,122,0.18),rgba(0,180,90,0.1))", border: "1px solid rgba(0,232,122,0.4)", color: "#00E87A", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
            Lưu cài đặt
          </button>
        </div>
      </div>
    </>
  );
}

// ── Spaced Repetition Interception Modal ──────────────────────────────────────
function SpacedRepModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
      <div className="mx-5 w-full max-w-xs rounded-3xl flex flex-col overflow-hidden relative"
        style={{
          background: "linear-gradient(160deg, rgba(10,20,45,0.99) 0%, rgba(5,12,28,0.99) 100%)",
          border: "1px solid rgba(255,165,0,0.32)",
          boxShadow: "0 0 0 1px rgba(255,165,0,0.08), 0 0 60px rgba(255,165,0,0.1), 0 24px 64px rgba(0,0,0,0.75)",
        }}>
        {/* Top accent glow strip */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,165,0,0.55), transparent)" }} />

        <div className="px-6 pt-7 pb-2 flex flex-col items-center gap-4">
          {/* Icon — infinity/cycle brain symbol */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.28)", boxShadow: "0 0 20px rgba(255,165,0,0.15)" }}>
            <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
              <path d="M16 11 Q15 5.5 10 5.5 Q4 5.5 4 11 Q4 16.5 10 16.5 Q15 16.5 16 11 Q17 5.5 22 5.5 Q28 5.5 28 11 Q28 16.5 22 16.5 Q17 16.5 16 11"
                stroke="#FFA500" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M10 11 L11.5 8 L12.5 14 L14 9 L15 13 L15.8 10 L17 11 L18 11"
                stroke="#FFA500" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.75"/>
              <circle cx="10" cy="11" r="1.8" fill="rgba(255,165,0,0.4)" stroke="#FFA500" strokeWidth="0.8"/>
              <circle cx="22" cy="11" r="1.8" fill="rgba(255,165,0,0.4)" stroke="#FFA500" strokeWidth="0.8"/>
            </svg>
          </div>

          {/* Label */}
          <p style={{ color: "rgba(255,165,0,0.65)", fontSize: 9, letterSpacing: 3, fontFamily: FONT, textAlign: "center" }}>
            NHẮC NHỞ ÔN TẬP
          </p>

          {/* Question */}
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 15, fontWeight: 600, fontFamily: FONT, textAlign: "center", lineHeight: 1.55 }}>
            Bạn có muốn ôn tập lại nội dung này vào lần sau không?
          </p>
        </div>

        {/* Divider */}
        <div className="mx-6 my-4 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* Buttons */}
        <div className="flex gap-3 px-6 pb-6">
          {/* Không */}
          <button
            onClick={onNo}
            className="flex-1 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.45)",
              fontSize: 15, fontWeight: 600, fontFamily: FONT,
            }}>
            Không
          </button>

          {/* Có */}
          <button
            onClick={onYes}
            className="flex-1 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(255,165,0,0.18) 0%, rgba(255,140,0,0.1) 100%)",
              border: "1px solid rgba(255,165,0,0.6)",
              boxShadow: "0 0 20px rgba(255,165,0,0.22), 0 0 40px rgba(255,165,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
              color: "#FFA500",
              fontSize: 15, fontWeight: 600, fontFamily: FONT,
            }}>
            Có
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fluid visual (Flowtime) ───────────────────────────────────────────────────
function FluidOrb({ running }: { running: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute rounded-full"
          style={{ width: 196 + i * 30, height: 196 + i * 30, border: `1px solid rgba(77,166,255,${0.15 - i * 0.04})`, animation: running ? `expand-ring ${2 + i * 0.7}s ease-in-out ${i * 0.4}s infinite` : "none" }} />
      ))}
      <div className="absolute rounded-full"
        style={{ width: 190, height: 190, background: "radial-gradient(circle at 35% 30%,rgba(77,166,255,0.3),rgba(77,166,255,0.06) 65%,transparent)", border: "1.5px solid rgba(77,166,255,0.35)", boxShadow: running ? "0 0 40px rgba(77,166,255,0.25),inset 0 0 30px rgba(77,166,255,0.1)" : "0 0 15px rgba(77,166,255,0.1)", animation: running ? "pulse-blue 2.5s ease-in-out infinite" : "none" }} />
      {/* Fluid wave */}
      <div className="absolute overflow-hidden rounded-full" style={{ width: 186, height: 186, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <div className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
          style={{ height: running ? "55%" : "35%", background: "linear-gradient(180deg,rgba(77,166,255,0.12) 0%,rgba(77,166,255,0.22) 100%)", borderRadius: "50% 50% 0 0 / 20% 20% 0 0", animation: running ? "expand-ring 3s ease-in-out infinite" : "none" }} />
      </div>
    </div>
  );
}

// ── Pomodoro ring visual ──────────────────────────────────────────────────────
function PomRing({ remaining, total, running, phase }: { remaining: number; total: number; running: boolean; phase: Phase }) {
  const R = 95;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - remaining / total);
  const color = phase === "focus" ? "#00E87A" : "#4DA6FF";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      <div className="absolute rounded-full" style={{ width: 270, height: 270, background: `radial-gradient(circle,${color}08 0%,transparent 70%)`, animation: running ? "pulse-green 2s ease-in-out infinite" : "none" }} />
      <svg width="260" height="260" viewBox="0 0 260 260" className="absolute -rotate-90">
        <circle cx="130" cy="130" r={R} fill="none" stroke={`${color}12`} strokeWidth="11" />
        <circle cx="130" cy="130" r={R} fill="none" stroke={color} strokeWidth="11"
          strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 8px ${color}60)` }} />
        <defs>
          <linearGradient id="pRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}80`} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute rounded-full"
        style={{ width: 166, height: 166, background: `radial-gradient(circle at 40% 35%,${color}12,${color}04)`, border: `1px solid ${color}18`, animation: running ? "expand-ring 2s ease-in-out infinite" : "none" }} />
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export function FlowState() {
  const navigate = useNavigate();
  const { currentTask, tasks, setTasks, sessionStats, setSessionStats } = useApp();
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [phase, setPhase] = useState<Phase>("focus");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [remaining, setRemaining] = useState(25 * 60);
  const [breakRemaining, setBreakRemaining] = useState(5 * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpacedRep, setShowSpacedRep] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when mode changes
  function resetTimer(f = focusMins, b = breakMins) {
    setRunning(false); setElapsed(0); setPhase("focus");
    setRemaining(f * 60); setBreakRemaining(b * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === "flowtime") {
          setElapsed(p => p + 1);
        } else {
          if (phase === "focus") {
            setRemaining(p => {
              if (p <= 1) { setPhase("break"); setRunning(true); return focusMins * 60; }
              return p - 1;
            });
          } else {
            setBreakRemaining(p => {
              if (p <= 1) { setPhase("focus"); setRunning(false); return breakMins * 60; }
              return p - 1;
            });
          }
        }
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, phase, focusMins, breakMins]);

  function fmt(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  function handleComplete() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (currentTask) {
      setTasks(tasks.map(t => t.id === currentTask.id ? { ...t, done: true } : t));
    }
    const totalDone = tasks.filter(t => t.done).length + 1;
    const totalMins = mode === "flowtime" ? Math.floor(elapsed / 60) : sessionStats.focusMinutes + focusMins;
    setSessionStats({ tasksCompleted: totalDone, totalTasks: tasks.length, focusMinutes: totalMins });
    // Intercept for longterm tasks — spaced repetition prompt
    if (currentTask?.type === "longterm") {
      setShowSpacedRep(true);
    } else {
      navigate("/stats");
    }
  }

  function handleSaveSettings(f: number, b: number) {
    setFocusMins(f); setBreakMins(b);
    resetTimer(f, b);
  }

  const timerColor = mode === "flowtime" ? "#4DA6FF" : (phase === "focus" ? "#00E87A" : "#4DA6FF");
  const displayTime = mode === "flowtime" ? fmt(elapsed) : (phase === "focus" ? fmt(remaining) : fmt(breakRemaining));

  return (
    <div className="min-h-full flex flex-col" style={{ background: "linear-gradient(180deg,#020B18 0%,#031020 50%,#020A10 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        {/* Exit/Close button — top-left */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            width: 40, height: 40,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <X size={16} strokeWidth={1.6} color="rgba(255,255,255,0.7)" />
        </button>

        {/* Title — center */}
        <div className="text-center">
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 2, fontFamily: FONT }}>KÍCH HOẠT TẬP TRUNG</p>
          <h1 style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: -0.5, fontFamily: FONT }}>Flow State</h1>
        </div>

        {/* Settings — top-right */}
        <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
          {mode === "pomodoro" ? (
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                width: 40, height: 40,
                background: "rgba(77,166,255,0.08)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(77,166,255,0.2)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <Settings size={16} strokeWidth={1.4} color="rgba(77,166,255,0.8)" />
            </button>
          ) : (
            /* Invisible placeholder to keep flex balance */
            <div style={{ width: 40 }} />
          )}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="px-5 mb-4">
        <div className="rounded-2xl p-1 flex" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => { setMode("flowtime"); resetTimer(); }}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300"
            style={{ background: mode === "flowtime" ? "rgba(77,166,255,0.15)" : "transparent", border: `1px solid ${mode === "flowtime" ? "rgba(77,166,255,0.35)" : "transparent"}`, boxShadow: mode === "flowtime" ? "0 0 15px rgba(77,166,255,0.15)" : "none" }}>
            <Droplets size={14} strokeWidth={1.4} color={mode === "flowtime" ? "#4DA6FF" : "rgba(255,255,255,0.3)"} />
            <p style={{ color: mode === "flowtime" ? "#4DA6FF" : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 500, fontFamily: FONT }}>Chế độ Flowtime</p>
          </button>
          <button onClick={() => { setMode("pomodoro"); resetTimer(); }}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300"
            style={{ background: mode === "pomodoro" ? "rgba(0,232,122,0.12)" : "transparent", border: `1px solid ${mode === "pomodoro" ? "rgba(0,232,122,0.3)" : "transparent"}`, boxShadow: mode === "pomodoro" ? "0 0 15px rgba(0,232,122,0.12)" : "none" }}>
            <Timer size={14} strokeWidth={1.4} color={mode === "pomodoro" ? "#00E87A" : "rgba(255,255,255,0.3)"} />
            <p style={{ color: mode === "pomodoro" ? "#00E87A" : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 500, fontFamily: FONT }}>Chế độ Pomodoro</p>
          </button>
        </div>
      </div>

      {/* Phase indicator (Pomodoro only) */}
      {mode === "pomodoro" && (
        <div className="flex items-center justify-center gap-3 px-5 mb-2">
          <div className="flex-1 py-1.5 rounded-xl text-center text-xs transition-all"
            style={{ background: phase === "focus" ? "rgba(0,232,122,0.1)" : "rgba(255,255,255,0.03)", border: "1px solid " + (phase === "focus" ? "rgba(0,232,122,0.3)" : "rgba(255,255,255,0.07)"), color: phase === "focus" ? "#00E87A" : "rgba(255,255,255,0.25)", fontFamily: FONT }}>
            Tập trung: {focusMins}:00
          </div>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</span>
          <div className="flex-1 py-1.5 rounded-xl text-center text-xs transition-all"
            style={{ background: phase === "break" ? "rgba(77,166,255,0.1)" : "rgba(255,255,255,0.03)", border: "1px solid " + (phase === "break" ? "rgba(77,166,255,0.3)" : "rgba(255,255,255,0.07)"), color: phase === "break" ? "#4DA6FF" : "rgba(255,255,255,0.25)", fontFamily: FONT }}>
            Giải lao: {breakMins}:00
          </div>
        </div>
      )}

      {/* Central timer area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-3">
        {/* Visual */}
        <div className="relative flex items-center justify-center">
          {mode === "flowtime" ? <FluidOrb running={running} /> : <PomRing remaining={phase === "focus" ? remaining : breakRemaining} total={phase === "focus" ? focusMins * 60 : breakMins * 60} running={running} phase={phase} />}
          {/* Timer overlay */}
          <div className="absolute flex flex-col items-center z-10">
            {mode === "pomodoro" && (
              <p style={{ color: `${timerColor}80`, fontSize: 11, letterSpacing: 4, fontFamily: FONT, marginBottom: 4 }}>
                {phase === "focus" ? "TẬP TRUNG" : "GIẢI LAO"}
              </p>
            )}
            <p style={{ color: timerColor, fontSize: 52, fontWeight: 700, fontFamily: `'SF Pro Display', 'Inter', monospace`, letterSpacing: "0.04em", textShadow: `0 0 20px ${timerColor}70,0 0 40px ${timerColor}30`, animation: running ? "count-pulse 1s ease-in-out infinite" : "none" }}>
              {displayTime}
            </p>
            <p style={{ color: `${timerColor}50`, fontSize: 10, letterSpacing: 4, fontFamily: FONT, marginTop: 4 }}>
              {mode === "flowtime" ? "ĐÃ TRÔI QUA" : "CÒN LẠI"}
            </p>
          </div>
        </div>

        {/* Current task */}
        <div className="w-full rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 2, fontFamily: FONT, marginBottom: 4 }}>NHIỆM VỤ HIỆN TẠI</p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500, fontFamily: FONT }}>{currentTask?.name || "Chưa chọn task"}</p>
          {currentTask?.deadline && (
            <div className="flex items-center gap-1.5 mt-2">
              <Clock size={10} strokeWidth={1.4} color="rgba(255,255,255,0.3)" />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT }}>Deadline: {currentTask.deadline}</p>
            </div>
          )}
        </div>

        {/* Controls: Reset (left) + Play/Pause (center) */}
        <div className="flex items-center justify-center gap-6">
          {/* Reset Timer button */}
          <button
            onClick={() => resetTimer()}
            className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95 group"
            title="Đặt lại thời gian"
            style={{
              width: 48, height: 48,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <RotateCcw
              size={18}
              strokeWidth={1.4}
              color="rgba(255,255,255,0.45)"
              className="transition-transform duration-300 group-hover:-rotate-45"
            />
          </button>

          {/* Play / Pause button */}
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              width: 64, height: 64,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.37), inset 0 0 10px rgba(255,255,255,0.05)",
            }}
          >
            {running ? (
              <Pause size={24} strokeWidth={1.5} color="rgba(255,255,255,0.92)" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />
            ) : (
              <Play size={24} strokeWidth={1.5} color="rgba(255,255,255,0.92)" className="ml-1" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />
            )}
          </button>

          {/* Invisible mirror spacer to keep Play/Pause visually centered */}
          <div style={{ width: 48, height: 48, flexShrink: 0 }} />
        </div>
      </div>

      {/* Complete button */}
      <div className="px-5 pb-8 pt-2">
        <button onClick={handleComplete}
          className="w-full py-4 rounded-2xl relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,rgba(0,232,122,0.2),rgba(0,180,90,0.12))", border: "1px solid rgba(0,232,122,0.45)", animation: "pulse-green 2.5s ease-in-out infinite" }}>
          <div className="absolute inset-0 opacity-25" style={{ background: "linear-gradient(90deg,transparent,rgba(0,232,122,0.3),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }} />
          <div className="relative flex items-center justify-center gap-2.5">
            <Check size={18} strokeWidth={2} color="#00E87A" style={{ filter: "drop-shadow(0 0 5px rgba(0,232,122,0.7))" }} />
            <div>
              <p style={{ color: "#00E87A", fontSize: 16, fontWeight: 700, fontFamily: FONT }}>Hoàn thành</p>
              <p style={{ color: "rgba(0,232,122,0.5)", fontSize: 10, letterSpacing: 1, fontFamily: FONT }}>ĐÁNH DẤU XONG & GHI NHẬN</p>
            </div>
          </div>
        </button>
      </div>

      {showSettings && (
        <SettingsModal focusMins={focusMins} breakMins={breakMins}
          onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}

      {showSpacedRep && (
        <SpacedRepModal
          onYes={() => { setShowSpacedRep(false); navigate("/stats"); }}
          onNo={() => { setShowSpacedRep(false); navigate("/stats"); }}
        />
      )}
    </div>
  );
}
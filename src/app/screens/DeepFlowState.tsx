import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

type Mode = "flowtime" | "pomodoro";

function FluidVisual({ running }: { running: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer expanding rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 160 + i * 24,
            height: 160 + i * 24,
            border: `1px solid rgba(77, 166, 255, ${0.15 - i * 0.04})`,
            animation: running ? `expand-fluid ${2 + i * 0.7}s ease-in-out ${i * 0.4}s infinite` : "none",
          }}
        />
      ))}

      {/* Main fluid orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: 150,
          height: 150,
          background: "radial-gradient(circle at 35% 30%, rgba(77, 166, 255, 0.35), rgba(77, 166, 255, 0.08) 60%, transparent)",
          border: "1.5px solid rgba(77, 166, 255, 0.4)",
          animation: running ? "pulse-glow-blue 2.5s ease-in-out infinite" : "none",
          boxShadow: running
            ? "0 0 40px rgba(77, 166, 255, 0.3), 0 0 80px rgba(77, 166, 255, 0.1), inset 0 0 30px rgba(77, 166, 255, 0.1)"
            : "0 0 20px rgba(77, 166, 255, 0.1)",
        }}
      />

      {/* Fluid wave inside */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{
          width: 146,
          height: 146,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: running ? "55%" : "40%",
            background: "linear-gradient(180deg, rgba(77, 166, 255, 0.15) 0%, rgba(77, 166, 255, 0.25) 100%)",
            borderRadius: "50% 50% 0 0 / 20% 20% 0 0",
            transition: "height 0.5s ease",
            animation: running ? "expand-fluid 3s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Particle dots inside orb */}
      {running &&
        [
          { x: 30, y: 70, delay: 0 },
          { x: 55, y: 40, delay: 0.5 },
          { x: 75, y: 60, delay: 1 },
          { x: 45, y: 85, delay: 1.5 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: "#4DA6FF",
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              opacity: 0.6,
              animation: `synapse-blink 2s ease-in-out ${dot.delay}s infinite`,
              boxShadow: "0 0 4px #4DA6FF",
            }}
          />
        ))}
    </div>
  );
}

function PomodoroVisual({ remaining, total, running }: { remaining: number; total: number; running: boolean }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%)",
          animation: running ? "pulse-glow-green 2s ease-in-out infinite" : "none",
        }}
      />

      {/* SVG ring */}
      <svg width="180" height="180" viewBox="0 0 180 180" className="absolute -rotate-90">
        {/* Track */}
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(0, 255, 136, 0.08)" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="90" cy="90" r={radius}
          fill="none"
          stroke="url(#pomGrad)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
        <defs>
          <linearGradient id="pomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF88" />
            <stop offset="100%" stopColor="#00CC70" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 90 + (radius - 12) * Math.cos(angle);
        const y1 = 90 + (radius - 12) * Math.sin(angle);
        const x2 = 90 + radius * Math.cos(angle);
        const y2 = 90 + radius * Math.sin(angle);
        return (
          <svg key={i} className="absolute inset-0" width="180" height="180" viewBox="0 0 180 180">
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0, 255, 136, 0.2)" strokeWidth="1" />
          </svg>
        );
      })}

      {/* Center fill */}
      <div
        className="absolute rounded-full"
        style={{
          width: 124,
          height: 124,
          background: "radial-gradient(circle at 40% 35%, rgba(0, 255, 136, 0.12), rgba(0, 255, 136, 0.04))",
          border: "1px solid rgba(0, 255, 136, 0.15)",
          animation: running ? "expand-fluid 2s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}

export function DeepFlowState() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("flowtime");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds for flowtime
  const [remaining, setRemaining] = useState(25 * 60); // 25 min pomodoro
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === "flowtime") {
          setElapsed((prev) => prev + 1);
        } else {
          setRemaining((prev) => {
            if (prev <= 1) {
              setRunning(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setRunning(false);
    setElapsed(0);
    setRemaining(25 * 60);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const displayTime = mode === "flowtime" ? formatTime(elapsed) : formatTime(remaining);
  const timerColor = mode === "flowtime" ? "#4DA6FF" : "#00FF88";

  return (
    <div
      className="min-h-full flex flex-col"
      style={{
        background: "linear-gradient(180deg, #020818 0%, #030d16 50%, #020a12 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <div>
          <p className="text-[10px] tracking-[0.2em] mb-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
            COGNITIVE EXECUTION
          </p>
          <h1 style={{ color: "#ffffff", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Deep Flow State
          </h1>
        </div>
        <div
          className="px-2.5 py-1 rounded-full"
          style={{
            background: running ? "rgba(0, 255, 136, 0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${running ? "rgba(0, 255, 136, 0.3)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          <span className="text-[9px] tracking-widest" style={{ color: running ? "#00FF88" : "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
            {running ? "● FLOWING" : "○ PAUSED"}
          </span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-5 mb-4">
        <div
          className="rounded-2xl p-1.5 flex"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <button
            onClick={() => handleModeChange("flowtime")}
            className="flex-1 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
            style={{
              background: mode === "flowtime" ? "rgba(77, 166, 255, 0.15)" : "transparent",
              border: mode === "flowtime" ? "1px solid rgba(77, 166, 255, 0.35)" : "1px solid transparent",
              boxShadow: mode === "flowtime" ? "0 0 15px rgba(77, 166, 255, 0.2)" : "none",
            }}
          >
            <span className="text-sm">💧</span>
            <div className="text-left">
              <div className="text-[11px]" style={{ color: mode === "flowtime" ? "#4DA6FF" : "rgba(255,255,255,0.35)" }}>
                Flowtime
              </div>
              <div className="text-[8px]" style={{ color: mode === "flowtime" ? "rgba(77, 166, 255, 0.5)" : "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>
                CODE MODE · COUNT-UP
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange("pomodoro")}
            className="flex-1 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
            style={{
              background: mode === "pomodoro" ? "rgba(0, 255, 136, 0.12)" : "transparent",
              border: mode === "pomodoro" ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid transparent",
              boxShadow: mode === "pomodoro" ? "0 0 15px rgba(0, 255, 136, 0.15)" : "none",
            }}
          >
            <span className="text-sm">🍅</span>
            <div className="text-left">
              <div className="text-[11px]" style={{ color: mode === "pomodoro" ? "#00FF88" : "rgba(255,255,255,0.35)" }}>
                Pomodoro
              </div>
              <div className="text-[8px]" style={{ color: mode === "pomodoro" ? "rgba(0, 255, 136, 0.5)" : "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>
                REPORT · COUNT-DOWN
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Timer Visual - Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4">
        {/* Visual */}
        <div className="relative flex items-center justify-center">
          {mode === "flowtime" ? (
            <FluidVisual running={running} />
          ) : (
            <PomodoroVisual remaining={remaining} total={25 * 60} running={running} />
          )}

          {/* Timer digits overlay */}
          <div className="absolute flex flex-col items-center z-20">
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 38,
                fontWeight: 700,
                color: timerColor,
                textShadow: `0 0 20px ${timerColor}80, 0 0 40px ${timerColor}40`,
                letterSpacing: "0.05em",
                animation: running ? "countdown-pulse 1s ease-in-out infinite" : "none",
              }}
            >
              {displayTime}
            </div>
            <div className="text-[9px] tracking-[0.3em] mt-1" style={{ color: `${timerColor}60`, fontFamily: "'Space Mono', monospace" }}>
              {mode === "flowtime" ? "ELAPSED" : "REMAINING"}
            </div>
          </div>
        </div>

        {/* Task info */}
        <div
          className="w-full rounded-2xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="text-[9px] mb-1 tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
            CURRENT TASK
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            Refactor Neural Data Pipeline
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="h-1 flex-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: mode === "flowtime" ? `${Math.min((elapsed / 3600) * 100, 100)}%` : `${(1 - remaining / (25 * 60)) * 100}%`,
                  background: `linear-gradient(90deg, ${timerColor}, ${timerColor}80)`,
                  transition: "width 1s linear",
                }}
              />
            </div>
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
              {mode === "flowtime" ? `${Math.floor(elapsed / 60)}m` : `${Math.floor(remaining / 60)}m left`}
            </span>
          </div>
        </div>

        {/* Play/Pause control */}
        <div className="flex items-center gap-4">
          {/* Reset */}
          <button
            onClick={() => { setRunning(false); setElapsed(0); setRemaining(25 * 60); }}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-lg">↺</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: 64,
              height: 64,
              background: running
                ? "rgba(255,255,255,0.08)"
                : mode === "flowtime"
                ? "rgba(77, 166, 255, 0.2)"
                : "rgba(0, 255, 136, 0.2)",
              border: `2px solid ${running ? "rgba(255,255,255,0.2)" : timerColor + "60"}`,
              boxShadow: running ? "none" : `0 0 25px ${timerColor}40`,
            }}
          >
            <span className="text-2xl">{running ? "⏸" : "▶"}</span>
          </button>

          {/* Skip */}
          <button
            className="flex items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-lg">⏭</span>
          </button>
        </div>

        {/* Session count */}
        {mode === "pomodoro" && (
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: i === 0 ? 12 : 8,
                  height: i === 0 ? 12 : 8,
                  background: i === 0 ? "#00FF88" : "rgba(0, 255, 136, 0.2)",
                  border: "1px solid rgba(0, 255, 136, 0.3)",
                  boxShadow: i === 0 ? "0 0 8px rgba(0, 255, 136, 0.6)" : "none",
                }}
              />
            ))}
            <span className="text-[9px] ml-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
              SESSION 1/4
            </span>
          </div>
        )}
      </div>

      {/* Complete Task Button */}
      <div className="px-5 pb-6 pt-2">
        <button
          onClick={() => navigate("/recovery")}
          className="w-full py-4 rounded-2xl relative overflow-hidden"
          style={{
            background: running
              ? "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 180, 100, 0.12))"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${running ? "rgba(0, 255, 136, 0.5)" : "rgba(255,255,255,0.08)"}`,
            animation: running ? "pulse-glow-green 2s ease-in-out infinite" : "none",
          }}
        >
          {running && (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.15), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.5s linear infinite",
              }}
            />
          )}
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-base">✓</span>
            <div>
              <div style={{ color: running ? "#00FF88" : "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 700 }}>
                Complete Task
              </div>
              <div className="text-[9px] tracking-wider" style={{ color: running ? "rgba(0, 255, 136, 0.5)" : "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>
                MARK NEURAL NODE DONE
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

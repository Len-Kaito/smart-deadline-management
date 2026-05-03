import { useState } from "react";
import { useNavigate } from "react-router";

const glass = {
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const glassBlue = {
  background: "rgba(77, 166, 255, 0.06)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(77, 166, 255, 0.2)",
};

function SyncAnimation() {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {/* Calendar icon */}
      <div
        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl"
        style={{ ...glassBlue, animation: "float-up-down 3s ease-in-out infinite" }}
      >
        <div className="text-xs" style={{ color: "#4DA6FF" }}>📅</div>
        <div className="text-[8px] mt-0.5" style={{ color: "#4DA6FF", fontFamily: "'Space Mono', monospace" }}>CAL</div>
      </div>

      {/* Sync arrows */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#4DA6FF",
                animation: `synapse-blink 1.5s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
        <span className="text-[9px] tracking-widest" style={{ color: "rgba(77, 166, 255, 0.6)" }}>SYNCING</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00FF88",
                animation: `synapse-blink 1.5s ease-in-out ${0.75 + i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Cell icon */}
      <div
        className="relative flex items-center justify-center w-12 h-12 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.03) 70%)",
          border: "1px solid rgba(0, 255, 136, 0.3)",
          animation: "float-up-down 3s ease-in-out 1.5s infinite",
        }}
      >
        <span className="text-lg">🦠</span>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(0, 255, 136, 0.2)",
            transform: "scale(1.3)",
            animation: "expand-fluid 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Verified badge */}
      <div
        className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg"
        style={{ background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.25)" }}
      >
        <span className="text-[10px]" style={{ color: "#00FF88" }}>✓ SYNCED</span>
      </div>
    </div>
  );
}

function SleepDebtWidget({ debt }: { debt: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - debt / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular widget */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 110, height: 110 }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 77, 109, 0.15) 0%, transparent 70%)",
            animation: "pulse-glow-pink 2.5s ease-in-out infinite",
          }}
        />
        {/* SVG progress */}
        <svg width="110" height="110" viewBox="0 0 110 110" className="absolute inset-0 -rotate-90">
          {/* Track */}
          <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,77,109,0.1)" strokeWidth="6" />
          {/* Progress */}
          <circle
            cx="55" cy="55" r="42"
            fill="none"
            stroke="url(#debtGrad)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="debtGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4D6D" />
              <stop offset="100%" stopColor="#FF8FA3" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center content */}
        <div className="flex flex-col items-center z-10">
          <span className="text-[11px] tracking-widest mb-0.5" style={{ color: "rgba(255,77,109,0.7)", fontFamily: "'Space Mono', monospace" }}>DEBT</span>
          <span style={{ color: "#FF4D6D", fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{debt}%</span>
          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>AI ANALYSIS</span>
        </div>

        {/* Orbiting dot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF4D6D",
              boxShadow: "0 0 8px #FF4D6D",
              animation: "ring-orbit 4s linear infinite",
            }}
          />
        </div>
      </div>
      <div className="text-[10px] text-center tracking-wider" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>
        AI SLEEP DEBT ANALYSIS
      </div>
    </div>
  );
}

export function MorningBioCheck() {
  const navigate = useNavigate();
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("06:30");

  return (
    <div className="min-h-full px-4 py-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] mb-0.5" style={{ color: "#4DA6FF", fontFamily: "'Space Mono', monospace" }}>
            CHRONOBIOLOGY SYSTEM
          </p>
          <h1 style={{ color: "#ffffff", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Morning Bio-Check
          </h1>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-[9px] tracking-widest"
          style={{
            background: "rgba(0, 255, 136, 0.1)",
            border: "1px solid rgba(0, 255, 136, 0.3)",
            color: "#00FF88",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          ● ACTIVE
        </div>
      </div>

      {/* Sync Animation Card */}
      <div className="rounded-2xl px-4 pt-3 pb-2" style={glass}>
        <p className="text-[9px] tracking-widest mb-1" style={{ color: "rgba(77, 166, 255, 0.7)", fontFamily: "'Space Mono', monospace" }}>
          CALENDAR INTEGRATION
        </p>
        <SyncAnimation />
        <div className="flex items-center justify-center gap-2 pb-1">
          <div className="h-px flex-1" style={{ background: "rgba(77, 166, 255, 0.15)" }} />
          <span className="text-[9px] tracking-widest" style={{ color: "rgba(77, 166, 255, 0.5)", fontFamily: "'Space Mono', monospace" }}>
            3 EVENTS LOADED
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(77, 166, 255, 0.15)" }} />
        </div>
      </div>

      {/* Sleep/Wake inputs */}
      <div className="rounded-2xl p-4" style={glass}>
        <p className="text-[9px] tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
          CIRCADIAN DATA INPUT
        </p>
        <div className="flex gap-3">
          {/* Sleep Time */}
          <div className="flex-1">
            <label className="text-[10px] tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "rgba(255,77,109,0.8)" }}>
              <span>🌙</span> SLEEP TIME
            </label>
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: "20px 20px 20px 8px",
                background: "rgba(255, 77, 109, 0.06)",
                border: "1px solid rgba(255, 77, 109, 0.25)",
                padding: "10px 14px",
                animation: "pulse-glow-pink 3s ease-in-out infinite",
              }}
            >
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full bg-transparent outline-none"
                style={{
                  color: "#FF8FA3",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              />
              <div className="text-[8px] mt-0.5 tracking-widest" style={{ color: "rgba(255,77,109,0.5)" }}>
                ONSET DETECTED
              </div>
            </div>
          </div>

          {/* Wake Time */}
          <div className="flex-1">
            <label className="text-[10px] tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "rgba(0, 255, 136, 0.8)" }}>
              <span>☀️</span> WAKE TIME
            </label>
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: "20px 20px 8px 20px",
                background: "rgba(0, 255, 136, 0.06)",
                border: "1px solid rgba(0, 255, 136, 0.25)",
                padding: "10px 14px",
                animation: "pulse-glow-green 3s ease-in-out 1.5s infinite",
              }}
            >
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-transparent outline-none"
                style={{
                  color: "#00FF88",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              />
              <div className="text-[8px] mt-0.5 tracking-widest" style={{ color: "rgba(0, 255, 136, 0.5)" }}>
                RHYTHM CALIBRATED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Debt Widget + Warning Card */}
      <div className="flex gap-3 items-stretch">
        {/* Sleep Debt Widget */}
        <div
          className="flex-shrink-0 rounded-2xl p-3 flex flex-col items-center justify-center"
          style={{
            ...glass,
            minWidth: 130,
          }}
        >
          <SleepDebtWidget debt={68} />
        </div>

        {/* Warning Card */}
        <div
          className="flex-1 rounded-2xl p-3 flex flex-col justify-between"
          style={{
            background: "rgba(255, 77, 109, 0.07)",
            border: "1px solid rgba(255, 77, 109, 0.3)",
            backdropFilter: "blur(20px)",
            animation: "pulse-glow-pink 3s ease-in-out infinite",
          }}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">⚠️</span>
              <span className="text-[9px] tracking-widest" style={{ color: "#FF4D6D", fontFamily: "'Space Mono', monospace" }}>
                ALERT
              </span>
            </div>
            <p style={{ color: "#FF8FA3", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
              Sleep Debt High
            </p>
            <div className="mt-1.5 px-2 py-1 rounded-lg text-center" style={{ background: "rgba(255, 77, 109, 0.12)", border: "1px solid rgba(255, 77, 109, 0.2)" }}>
              <p className="text-[10px] tracking-wide" style={{ color: "rgba(255, 143, 163, 0.9)" }}>
                💤 Suggesting
              </p>
              <p style={{ color: "#FF4D6D", fontSize: 11, fontWeight: 700 }}>
                Recovery Nap
              </p>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[9px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>
              <span>DEFICIT</span>
              <span>2.5h</span>
            </div>
            <div className="h-1 rounded-full mt-1" style={{ background: "rgba(255,77,109,0.15)" }}>
              <div className="h-full rounded-full" style={{ width: "68%", background: "linear-gradient(90deg, #FF4D6D, #FF8FA3)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-1 pb-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.15) 100%)",
            border: "1px solid rgba(0, 255, 136, 0.5)",
            animation: "pulse-glow-green 2s ease-in-out infinite",
          }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s linear infinite",
            }}
          />
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-lg">🐸</span>
            <div>
              <div style={{ color: "#00FF88", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>
                Start Work
              </div>
              <div className="text-[9px] tracking-wider" style={{ color: "rgba(0, 255, 136, 0.6)", fontFamily: "'Space Mono', monospace" }}>
                EAT THE FROG PROTOCOL
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate("/recovery")}
          className="w-full py-3.5 rounded-2xl relative overflow-hidden"
          style={{
            background: "rgba(77, 166, 255, 0.08)",
            border: "1px solid rgba(77, 166, 255, 0.3)",
            animation: "pulse-glow-blue 2.5s ease-in-out infinite",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-base">🌙</span>
            <div>
              <div style={{ color: "#4DA6FF", fontSize: 14, fontWeight: 600 }}>
                Rest / Day Off
              </div>
              <div className="text-[9px] tracking-wider" style={{ color: "rgba(77, 166, 255, 0.5)", fontFamily: "'Space Mono', monospace" }}>
                RECOVERY MODE INIT
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

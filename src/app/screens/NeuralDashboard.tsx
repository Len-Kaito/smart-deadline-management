import { useState } from "react";
import { useNavigate } from "react-router";

const glass = {
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const REVIEW_TASKS = [
  { id: 1, label: "Review Q3 Biomarker Report", done: true, color: "#00FF88" },
  { id: 2, label: "Sync Neural Pattern Data", done: true, color: "#00FF88" },
  { id: 3, label: "Calibrate Attention Metrics", done: false, color: "#4DA6FF" },
];

const MATRIX_TASKS = {
  q1: [
    { id: "q1-1", text: "Fix Critical API Endpoint" },
    { id: "q1-2", text: "Client Demo Prep" },
  ],
  q2: [
    { id: "q2-1", text: "Refactor Data Pipeline" },
    { id: "q2-2", text: "Team Roadmap Review" },
  ],
  q3: [
    { id: "q3-1", text: "Reply Team Slack" },
    { id: "q3-2", text: "Schedule Review Call" },
  ],
  q4: [
    { id: "q4-1", text: "Research AI Tools" },
    { id: "q4-2", text: "Update Portfolio" },
  ],
};

function CircadianWavesBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveG1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4DA6FF" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#00FF88" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#4DA6FF" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path d="M 0 80 Q 100 40 200 80 Q 300 120 400 80 L 400 120 L 0 120 Z" fill="url(#waveG1)" />
        <path d="M 0 95 Q 100 60 200 95 Q 300 130 400 95 L 400 120 L 0 120 Z" fill="rgba(0, 255, 136, 0.03)" />
      </svg>
    </div>
  );
}

function EisenhowerMatrix({ onTaskClick }: { onTaskClick: () => void }) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-0.5" style={{ background: "rgba(255,255,255,0.06)" }}>
      {/* Neural synapse center node */}
      <div
        className="absolute z-10 rounded-full flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(77, 166, 255, 0.4), rgba(0, 255, 136, 0.2))",
          border: "2px solid rgba(77, 166, 255, 0.6)",
          boxShadow: "0 0 20px rgba(77, 166, 255, 0.5), 0 0 40px rgba(77, 166, 255, 0.2)",
          animation: "pulse-glow-blue 2s ease-in-out infinite",
          zIndex: 10,
        }}
      >
        <span className="text-sm">🧠</span>
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute w-full h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute h-full w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>

      <div className="grid grid-cols-2 gap-0.5">
        {/* Q1: Urgent + Important */}
        <div
          className="p-3 rounded-tl-2xl"
          style={{
            background: "rgba(0, 255, 136, 0.07)",
            border: "1px solid rgba(0, 255, 136, 0.25)",
            borderBottom: "none",
            borderRight: "none",
            boxShadow: "inset 0 0 30px rgba(0, 255, 136, 0.05)",
            animation: "pulse-glow-green 3s ease-in-out infinite",
          }}
        >
          <div className="flex items-center gap-1 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
            <span className="text-[8px] tracking-widest" style={{ color: "#00FF88", fontFamily: "'Space Mono', monospace" }}>DO FIRST</span>
          </div>
          <div className="text-[8px] mb-2" style={{ color: "rgba(0, 255, 136, 0.5)", fontFamily: "'Space Mono', monospace" }}>
            URGENT · IMPORTANT
          </div>
          {MATRIX_TASKS.q1.map((t) => (
            <div key={t.id} className="flex items-start gap-1.5 mb-1.5" onClick={onTaskClick}>
              <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#00FF88", boxShadow: "0 0 4px #00FF88" }} />
              <span className="text-[10px] leading-tight cursor-pointer" style={{ color: "rgba(255,255,255,0.85)" }}>{t.text}</span>
            </div>
          ))}
          <div className="mt-2 text-[8px] px-2 py-0.5 rounded-full inline-block" style={{ background: "rgba(0, 255, 136, 0.12)", color: "#00FF88" }}>
            HIGH ENERGY
          </div>
        </div>

        {/* Q2: Not Urgent + Important */}
        <div
          className="p-3 rounded-tr-2xl"
          style={{
            background: "rgba(77, 166, 255, 0.05)",
            border: "1px solid rgba(77, 166, 255, 0.18)",
            borderBottom: "none",
            borderLeft: "none",
          }}
        >
          <div className="flex items-center gap-1 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#4DA6FF", boxShadow: "0 0 6px #4DA6FF" }} />
            <span className="text-[8px] tracking-widest" style={{ color: "#4DA6FF", fontFamily: "'Space Mono', monospace" }}>SCHEDULE</span>
          </div>
          <div className="text-[8px] mb-2" style={{ color: "rgba(77, 166, 255, 0.5)", fontFamily: "'Space Mono', monospace" }}>
            NOT URGENT · IMPORTANT
          </div>
          {MATRIX_TASKS.q2.map((t) => (
            <div key={t.id} className="flex items-start gap-1.5 mb-1.5" onClick={onTaskClick}>
              <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#4DA6FF" }} />
              <span className="text-[10px] leading-tight cursor-pointer" style={{ color: "rgba(255,255,255,0.7)" }}>{t.text}</span>
            </div>
          ))}
          <div className="mt-2 text-[8px] px-2 py-0.5 rounded-full inline-block" style={{ background: "rgba(77, 166, 255, 0.1)", color: "#4DA6FF" }}>
            DEEP WORK
          </div>
        </div>

        {/* Q3: Urgent + Not Important */}
        <div
          className="p-3 rounded-bl-2xl"
          style={{
            background: "rgba(255, 165, 0, 0.04)",
            border: "1px solid rgba(255, 165, 0, 0.15)",
            borderTop: "none",
            borderRight: "none",
          }}
        >
          <div className="flex items-center gap-1 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#FFA500" }} />
            <span className="text-[8px] tracking-widest" style={{ color: "#FFA500", fontFamily: "'Space Mono', monospace" }}>DELEGATE</span>
          </div>
          <div className="text-[8px] mb-2" style={{ color: "rgba(255, 165, 0, 0.5)", fontFamily: "'Space Mono', monospace" }}>
            URGENT · NOT IMPORT.
          </div>
          {MATRIX_TASKS.q3.map((t) => (
            <div key={t.id} className="flex items-start gap-1.5 mb-1.5" onClick={onTaskClick}>
              <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FFA500" }} />
              <span className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.55)" }}>{t.text}</span>
            </div>
          ))}
          <div className="mt-2 text-[8px] px-2 py-0.5 rounded-full inline-block" style={{ background: "rgba(255, 165, 0, 0.1)", color: "#FFA500" }}>
            LOW PRIORITY
          </div>
        </div>

        {/* Q4: Not Urgent + Not Important */}
        <div
          className="p-3 rounded-br-2xl"
          style={{
            background: "rgba(255, 77, 109, 0.04)",
            border: "1px solid rgba(255, 77, 109, 0.12)",
            borderTop: "none",
            borderLeft: "none",
          }}
        >
          <div className="flex items-center gap-1 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#FF4D6D" }} />
            <span className="text-[8px] tracking-widest" style={{ color: "#FF4D6D", fontFamily: "'Space Mono', monospace" }}>ELIMINATE</span>
          </div>
          <div className="text-[8px] mb-2" style={{ color: "rgba(255, 77, 109, 0.4)", fontFamily: "'Space Mono', monospace" }}>
            NOT URGENT · NOT IMP.
          </div>
          {MATRIX_TASKS.q4.map((t) => (
            <div key={t.id} className="flex items-start gap-1.5 mb-1.5" onClick={onTaskClick}>
              <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FF4D6D" }} />
              <span className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>{t.text}</span>
            </div>
          ))}
          <div className="mt-2 text-[8px] px-2 py-0.5 rounded-full inline-block" style={{ background: "rgba(255, 77, 109, 0.08)", color: "#FF4D6D" }}>
            AVOID
          </div>
        </div>
      </div>
    </div>
  );
}

export function NeuralDashboard() {
  const navigate = useNavigate();
  const [reviewChecked, setReviewChecked] = useState<number[]>([1, 2]);

  return (
    <div className="min-h-full px-4 py-5 flex flex-col gap-4 relative">
      <CircadianWavesBg />
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] mb-0.5" style={{ color: "#4DA6FF", fontFamily: "'Space Mono', monospace" }}>
              NEURAL COMMAND CENTER
            </p>
            <h1 style={{ color: "#ffffff", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Neural Dashboard
            </h1>
          </div>
          <div className="text-right">
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
              04:25 PM
            </div>
            <div className="text-[9px]" style={{ color: "rgba(77, 166, 255, 0.6)", fontFamily: "'Space Mono', monospace" }}>
              PEAK FOCUS
            </div>
          </div>
        </div>

        {/* Daily Review Tasks */}
        <div className="rounded-2xl p-3.5" style={glass}>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[9px] tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
              DAILY REVIEW TASKS
            </p>
            <div className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(0, 255, 136, 0.1)", color: "#00FF88", fontFamily: "'Space Mono', monospace" }}>
              2/3
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {REVIEW_TASKS.map((task) => {
              const isChecked = reviewChecked.includes(task.id);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setReviewChecked((prev) =>
                      prev.includes(task.id) ? prev.filter((id) => id !== task.id) : [...prev, task.id]
                    );
                  }}
                >
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: isChecked ? "rgba(0, 255, 136, 0.2)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isChecked ? "rgba(0, 255, 136, 0.5)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    {isChecked && <div className="w-2 h-2 rounded-full" style={{ background: "#00FF88" }} />}
                  </div>
                  <span
                    className="text-[11px]"
                    style={{
                      color: isChecked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)",
                      textDecoration: isChecked ? "line-through" : "none",
                    }}
                  >
                    {task.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(reviewChecked.length / REVIEW_TASKS.length) * 100}%`,
                background: "linear-gradient(90deg, #00FF88, #4DA6FF)",
                boxShadow: "0 0 8px rgba(0, 255, 136, 0.5)",
              }}
            />
          </div>
        </div>

        {/* Matrix label */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[9px] tracking-widest" style={{ color: "rgba(77, 166, 255, 0.5)", fontFamily: "'Space Mono', monospace" }}>
            EISENHOWER SYNAPSE MAP
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Eisenhower Matrix */}
        <EisenhowerMatrix onTaskClick={() => navigate("/task")} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "FOCUS SCORE", value: "87%", color: "#00FF88" },
            { label: "TASKS DONE", value: "5/9", color: "#4DA6FF" },
            { label: "ENERGY LVL", value: "HIGH", color: "#FFA500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-2.5 text-center"
              style={{ ...glass }}
            >
              <div className="text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>
                {stat.label}
              </div>
              <div style={{ color: stat.color, fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700 }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB - Cell Nucleus */}
      <button
        onClick={() => navigate("/task")}
        className="fixed bottom-24 right-6 flex items-center justify-center rounded-full"
        style={{
          width: 58,
          height: 58,
          background: "radial-gradient(circle at 35% 35%, rgba(0, 255, 136, 0.5), rgba(0, 255, 136, 0.15))",
          border: "2px solid rgba(0, 255, 136, 0.6)",
          boxShadow: "0 0 25px rgba(0, 255, 136, 0.5), 0 0 50px rgba(0, 255, 136, 0.2)",
          animation: "pulse-glow-green 2s ease-in-out infinite",
          zIndex: 50,
        }}
      >
        {/* Nucleus inner dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 14,
            height: 14,
            background: "radial-gradient(circle, #ffffff, rgba(0, 255, 136, 0.8))",
            boxShadow: "0 0 10px rgba(0, 255, 136, 0.8)",
          }}
        />
        {/* Orbital ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 42,
            height: 42,
            border: "1px solid rgba(0, 255, 136, 0.3)",
            animation: "spin-slow 4s linear infinite",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              background: "#00FF88",
              top: -2.5,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 0 6px #00FF88",
            }}
          />
        </div>
        <span className="text-lg z-10 relative">+</span>
      </button>
    </div>
  );
}

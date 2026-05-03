import { useState } from "react";
import { useNavigate } from "react-router";

const glass = {
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.07)",
};

const REMAINING_TASKS = [
  { id: 1, label: "Update Portfolio Website", priority: "low", quadrant: "Q4" },
  { id: 2, label: "Research AI Tools", priority: "medium", quadrant: "Q2" },
  { id: 3, label: "Write weekly retrospective", priority: "medium", quadrant: "Q2" },
  { id: 4, label: "Review team PRs", priority: "high", quadrant: "Q3" },
];

const NAP_SUGGESTIONS = [
  { label: "Power Nap", duration: "20 min", time: "2:30 PM", benefit: "Alertness restore", color: "#4DA6FF" },
  { label: "Recovery Nap", duration: "90 min", time: "3:00 PM", benefit: "Full sleep cycle", color: "#00FF88" },
];

function CalmWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg viewBox="0 0 400 80" className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="calmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#4DA6FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d="M 0 40 Q 100 20 200 40 Q 300 60 400 40 L 400 80 L 0 80 Z" fill="url(#calmGrad)" />
        <path d="M 0 55 Q 100 40 200 55 Q 300 70 400 55 L 400 80 L 0 80 Z" fill="rgba(255, 77, 109, 0.03)" />
      </svg>
    </div>
  );
}

function SwipeTaskItem({
  task,
  onMigrate,
}: {
  task: typeof REMAINING_TASKS[0];
  onMigrate: (id: number) => void;
}) {
  const [migrated, setMigrated] = useState(false);
  const [swiping, setSwiping] = useState(false);

  const priorityColors: Record<string, string> = {
    high: "#FF4D6D",
    medium: "#4DA6FF",
    low: "rgba(255,255,255,0.25)",
  };

  const handleMigrate = () => {
    setSwiping(true);
    setTimeout(() => {
      setMigrated(true);
      onMigrate(task.id);
    }, 400);
  };

  if (migrated) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl transition-all duration-400"
      style={{
        transform: swiping ? "translateX(100%)" : "translateX(0)",
        opacity: swiping ? 0 : 1,
        transition: "transform 0.4s ease, opacity 0.3s ease",
      }}
    >
      {/* Swipe hint background */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-4 rounded-xl"
        style={{ background: "rgba(0, 255, 136, 0.12)", border: "1px solid rgba(0, 255, 136, 0.2)" }}
      >
        <span className="text-[11px] tracking-wider" style={{ color: "#00FF88", fontFamily: "'Space Mono', monospace" }}>
          → TOMORROW
        </span>
      </div>

      {/* Task content */}
      <div
        className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl"
        style={{
          background: "rgba(10, 20, 35, 0.95)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          className="flex-shrink-0 rounded-lg px-1.5 py-0.5 text-[8px] tracking-wider"
          style={{
            background: `${priorityColors[task.priority]}15`,
            border: `1px solid ${priorityColors[task.priority]}30`,
            color: priorityColors[task.priority],
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {task.quadrant}
        </div>
        <span className="flex-1 text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
          {task.label}
        </span>
        <button
          onClick={handleMigrate}
          className="flex-shrink-0 px-2 py-1 rounded-lg text-[9px] tracking-wider transition-all duration-200"
          style={{
            background: "rgba(0, 255, 136, 0.08)",
            border: "1px solid rgba(0, 255, 136, 0.2)",
            color: "#00FF88",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

export function BioRecovery() {
  const navigate = useNavigate();
  const [fatigueAnswer, setFatigueAnswer] = useState<"yes" | "no" | null>(null);
  const [migratedIds, setMigratedIds] = useState<number[]>([]);
  const [sessionEnding, setSessionEnding] = useState(false);

  const handleMigrate = (id: number) => {
    setMigratedIds((prev) => [...prev, id]);
  };

  const handleEndSession = () => {
    setSessionEnding(true);
    setTimeout(() => navigate("/"), 1500);
  };

  const visibleTasks = REMAINING_TASKS.filter((t) => !migratedIds.includes(t.id));

  return (
    <div className="min-h-full px-4 py-5 flex flex-col gap-4 relative">
      <CalmWave />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] mb-0.5" style={{ color: "#FF8FA3", fontFamily: "'Space Mono', monospace" }}>
              BIO-RECOVERY PROTOCOL
            </p>
            <h1 style={{ color: "#ffffff", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
              End Cycle Recovery
            </h1>
          </div>
          <div
            className="flex flex-col items-center px-2.5 py-1.5 rounded-xl"
            style={{ background: "rgba(255, 77, 109, 0.08)", border: "1px solid rgba(255, 77, 109, 0.2)" }}
          >
            <span className="text-lg">🌙</span>
            <span className="text-[8px]" style={{ color: "#FF8FA3", fontFamily: "'Space Mono', monospace" }}>REST</span>
          </div>
        </div>

        {/* Session summary */}
        <div className="rounded-2xl p-3.5 grid grid-cols-3 gap-2" style={glass}>
          {[
            { label: "FOCUSED", value: "4.2h", color: "#4DA6FF" },
            { label: "TASKS DONE", value: "5", color: "#00FF88" },
            { label: "EFFICIENCY", value: "92%", color: "#FF8FA3" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div style={{ color: stat.color, fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-[8px] tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Fatigue Detection Card */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255, 77, 109, 0.06)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${fatigueAnswer === "yes" ? "rgba(255, 77, 109, 0.5)" : fatigueAnswer === "no" ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 77, 109, 0.2)"}`,
            animation: fatigueAnswer === null ? "pulse-glow-pink 3s ease-in-out infinite" : "none",
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255, 77, 109, 0.15)", border: "1px solid rgba(255, 77, 109, 0.25)" }}
            >
              <span className="text-base">🧬</span>
            </div>
            <div>
              <div className="text-[9px] tracking-widest" style={{ color: "rgba(255, 77, 109, 0.7)", fontFamily: "'Space Mono', monospace" }}>
                AI NEURAL ASSESSMENT
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>
                Sudden fatigue detected?
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setFatigueAnswer("yes")}
              className="flex-1 py-2.5 rounded-xl text-[12px] tracking-wider transition-all duration-300"
              style={{
                background: fatigueAnswer === "yes" ? "rgba(255, 77, 109, 0.2)" : "rgba(255, 77, 109, 0.07)",
                border: `1px solid ${fatigueAnswer === "yes" ? "rgba(255, 77, 109, 0.6)" : "rgba(255, 77, 109, 0.2)"}`,
                color: "#FF8FA3",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: fatigueAnswer === "yes" ? "0 0 15px rgba(255, 77, 109, 0.25)" : "none",
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setFatigueAnswer("no")}
              className="flex-1 py-2.5 rounded-xl text-[12px] tracking-wider transition-all duration-300"
              style={{
                background: fatigueAnswer === "no" ? "rgba(0, 255, 136, 0.12)" : "rgba(0, 255, 136, 0.04)",
                border: `1px solid ${fatigueAnswer === "no" ? "rgba(0, 255, 136, 0.5)" : "rgba(0, 255, 136, 0.15)"}`,
                color: "#00FF88",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: fatigueAnswer === "no" ? "0 0 15px rgba(0, 255, 136, 0.2)" : "none",
              }}
            >
              No
            </button>
          </div>

          {fatigueAnswer === "yes" && (
            <div
              className="mt-3 rounded-xl p-2.5"
              style={{ background: "rgba(255, 77, 109, 0.08)", border: "1px solid rgba(255, 77, 109, 0.2)" }}
            >
              <p className="text-[10px]" style={{ color: "rgba(255,143,163,0.8)" }}>
                ⚡ Elevated cortisol pattern detected. Recommend immediate 20-min nap to restore cognitive baseline.
              </p>
            </div>
          )}
          {fatigueAnswer === "no" && (
            <div
              className="mt-3 rounded-xl p-2.5"
              style={{ background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.15)" }}
            >
              <p className="text-[10px]" style={{ color: "rgba(0, 255, 136, 0.7)" }}>
                ✓ Cognitive resilience strong. Standard wind-down protocol recommended.
              </p>
            </div>
          )}
        </div>

        {/* Sleep Debt Recovery Card */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(77, 166, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(77, 166, 255, 0.18)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">💤</span>
              <div>
                <div className="text-[9px] tracking-widest" style={{ color: "rgba(77, 166, 255, 0.6)", fontFamily: "'Space Mono', monospace" }}>
                  SLEEP DEBT RECOVERY
                </div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Suggested Nap Windows</div>
              </div>
            </div>
            <div
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255, 77, 109, 0.1)", color: "#FF8FA3", fontFamily: "'Space Mono', monospace" }}
            >
              2.5h DEBT
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {NAP_SUGGESTIONS.map((nap, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  background: `${nap.color}08`,
                  border: `1px solid ${nap.color}25`,
                }}
              >
                <div
                  className="flex flex-col items-center justify-center rounded-xl px-2 py-1.5 min-w-[52px]"
                  style={{ background: `${nap.color}12`, border: `1px solid ${nap.color}25` }}
                >
                  <div style={{ color: nap.color, fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700 }}>
                    {nap.duration}
                  </div>
                  <div className="text-[8px]" style={{ color: `${nap.color}80`, fontFamily: "'Space Mono', monospace" }}>
                    {nap.time}
                  </div>
                </div>
                <div className="flex-1">
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>{nap.label}</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>{nap.benefit}</div>
                </div>
                <button
                  className="text-[9px] px-2 py-1 rounded-lg tracking-wider"
                  style={{
                    background: `${nap.color}12`,
                    border: `1px solid ${nap.color}30`,
                    color: nap.color,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  SET
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[9px] tracking-widest" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>
              REMAINING TASKS
            </p>
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace" }}>
              SWIPE → TO MIGRATE
            </p>
          </div>

          {visibleTasks.length === 0 ? (
            <div
              className="rounded-2xl py-6 text-center"
              style={{
                background: "rgba(0, 255, 136, 0.05)",
                border: "1px solid rgba(0, 255, 136, 0.15)",
              }}
            >
              <div className="text-2xl mb-1">✨</div>
              <div style={{ color: "#00FF88", fontSize: 13, fontWeight: 600 }}>All tasks migrated!</div>
              <div className="text-[10px] mt-0.5" style={{ color: "rgba(0, 255, 136, 0.5)", fontFamily: "'Space Mono', monospace" }}>
                QUEUE CLEARED FOR TOMORROW
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleTasks.map((task) => (
                <SwipeTaskItem key={task.id} task={task} onMigrate={handleMigrate} />
              ))}
            </div>
          )}
        </div>

        {/* Mindfulness note */}
        <div
          className="rounded-2xl p-3.5 flex items-start gap-3"
          style={{
            background: "rgba(255, 143, 163, 0.05)",
            border: "1px solid rgba(255, 143, 163, 0.12)",
          }}
        >
          <span className="text-base flex-shrink-0">🧘</span>
          <div>
            <div className="text-[10px] mb-0.5" style={{ color: "#FF8FA3", fontFamily: "'Space Mono', monospace" }}>
              CIRCADIAN WISDOM
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your chronobiological rhythms show optimal rest window approaching. Consistent sleep-wake cycles strengthen long-term cognitive performance.
            </p>
          </div>
        </div>

        {/* End Session Button */}
        <button
          onClick={handleEndSession}
          className="w-full py-4 rounded-2xl relative overflow-hidden mb-4"
          style={{
            background: sessionEnding
              ? "rgba(255, 77, 109, 0.3)"
              : "linear-gradient(135deg, rgba(255, 77, 109, 0.18), rgba(255, 50, 90, 0.1))",
            border: "1px solid rgba(255, 77, 109, 0.4)",
            animation: "pulse-glow-pink 2.5s ease-in-out infinite",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 77, 109, 0.15), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          />
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-base">🌙</span>
            <div>
              <div style={{ color: "#FF8FA3", fontSize: 13, fontWeight: 700 }}>
                {sessionEnding ? "Initiating Rest Protocol..." : "End Session & Initiate Rest Protocol"}
              </div>
              <div className="text-[9px] tracking-wider" style={{ color: "rgba(255, 143, 163, 0.5)", fontFamily: "'Space Mono', monospace" }}>
                {sessionEnding ? "SYNCING BIODATA..." : "CIRCADIAN WIND-DOWN SEQUENCE"}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

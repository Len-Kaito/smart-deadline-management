import { useState } from "react";
import { useNavigate } from "react-router";

const glass = {
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const SAMPLE_SUBTASKS = [
  { id: 1, label: "Initialize neural data schema", status: "done", depth: 0 },
  { id: 2, label: "Configure API authentication layer", status: "active", depth: 1 },
  { id: 3, label: "Build data pipeline endpoint", status: "pending", depth: 1 },
  { id: 4, label: "Write unit tests for all modules", status: "pending", depth: 2 },
  { id: 5, label: "Deploy to staging environment", status: "pending", depth: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  done: "#00FF88",
  active: "#4DA6FF",
  pending: "rgba(255,255,255,0.25)",
};

function NeuralTreeDiagram() {
  return (
    <div className="relative py-2">
      {/* Tree connecting lines SVG */}
      <svg
        className="absolute left-4 top-0 bottom-0 pointer-events-none"
        width="20"
        height="100%"
        style={{ zIndex: 0 }}
      >
        <line x1="10" y1="0" x2="10" y2="100%" stroke="rgba(77, 166, 255, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      <div className="flex flex-col gap-2.5 relative z-10">
        {SAMPLE_SUBTASKS.map((task, i) => (
          <div
            key={task.id}
            className="flex items-center gap-2"
            style={{ paddingLeft: 8 + task.depth * 16 }}
          >
            {/* Branch line for indented items */}
            {task.depth > 0 && (
              <div
                className="absolute"
                style={{
                  left: 8 + (task.depth - 1) * 16 + 9,
                  width: 12,
                  height: 1,
                  background: "rgba(77, 166, 255, 0.2)",
                }}
              />
            )}

            {/* Node dot */}
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: task.depth === 0 ? 12 : 9,
                height: task.depth === 0 ? 12 : 9,
                background:
                  task.status === "done"
                    ? "rgba(0, 255, 136, 0.3)"
                    : task.status === "active"
                    ? "rgba(77, 166, 255, 0.3)"
                    : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${STATUS_COLORS[task.status]}`,
                boxShadow: task.status !== "pending" ? `0 0 8px ${STATUS_COLORS[task.status]}` : "none",
              }}
            >
              {task.status === "done" && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF88" }} />
              )}
              {task.status === "active" && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#4DA6FF", animation: "synapse-blink 1.5s ease-in-out infinite" }}
                />
              )}
            </div>

            {/* Task label */}
            <div
              className="flex-1 rounded-xl px-2.5 py-1.5"
              style={{
                background:
                  task.status === "active"
                    ? "rgba(77, 166, 255, 0.07)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${
                  task.status === "active"
                    ? "rgba(77, 166, 255, 0.2)"
                    : task.status === "done"
                    ? "rgba(0, 255, 136, 0.12)"
                    : "rgba(255,255,255,0.05)"
                }`,
              }}
            >
              <span
                className="text-[11px]"
                style={{
                  color: STATUS_COLORS[task.status],
                  textDecoration: task.status === "done" ? "line-through" : "none",
                  opacity: task.status === "done" ? 0.6 : 1,
                }}
              >
                {task.label}
              </span>
            </div>

            {/* Status tag */}
            {task.status === "active" && (
              <div
                className="flex-shrink-0 text-[8px] px-1.5 py-0.5 rounded-md tracking-wider"
                style={{
                  background: "rgba(77, 166, 255, 0.12)",
                  color: "#4DA6FF",
                  fontFamily: "'Space Mono', monospace",
                  animation: "synapse-blink 2s ease-in-out infinite",
                }}
              >
                NOW
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-all duration-300"
      style={{
        width: 40,
        height: 22,
        background: value ? "rgba(0, 255, 136, 0.25)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${value ? "rgba(0, 255, 136, 0.5)" : "rgba(255,255,255,0.1)"}`,
        boxShadow: value ? "0 0 10px rgba(0, 255, 136, 0.3)" : "none",
      }}
    >
      <div
        className="absolute top-0.5 rounded-full transition-all duration-300"
        style={{
          width: 18,
          height: 18,
          left: value ? "calc(100% - 20px)" : 2,
          background: value ? "#00FF88" : "rgba(255,255,255,0.3)",
          boxShadow: value ? "0 0 8px rgba(0, 255, 136, 0.6)" : "none",
        }}
      />
    </button>
  );
}

export function SynapticTaskBreakdown() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<"manual" | "ai">("manual");
  const [jsonText, setJsonText] = useState(`{
  "task": "Refactor Data Pipeline",
  "priority": "high",
  "subtasks": [
    "Initialize neural schema",
    "Configure API auth",
    "Build endpoint"
  ],
  "deadline": "2026-05-01"
}`);
  const [spacedRep, setSpacedRep] = useState(false);
  const [safeDeadline, setSafeDeadline] = useState(true);
  const [taskName, setTaskName] = useState("Refactor Neural Data Pipeline");

  return (
    <div className="min-h-full px-4 py-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] mb-0.5" style={{ color: "#4DA6FF", fontFamily: "'Space Mono', monospace" }}>
            SYNAPTIC DECOMPOSITION
          </p>
          <h1 style={{ color: "#ffffff", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Task Breakdown
          </h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "rgba(77, 166, 255, 0.08)", border: "1px solid rgba(77, 166, 255, 0.2)" }}
        >
          <span className="text-xs">🔬</span>
          <span className="text-[9px]" style={{ color: "#4DA6FF", fontFamily: "'Space Mono', monospace" }}>ANALYSIS</span>
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div className="rounded-2xl p-1.5" style={{ ...glass, padding: "6px" }}>
        <div className="flex">
          <button
            onClick={() => setInputMode("manual")}
            className="flex-1 py-2.5 rounded-xl text-[11px] tracking-wider transition-all duration-300"
            style={{
              background: inputMode === "manual" ? "rgba(77, 166, 255, 0.15)" : "transparent",
              color: inputMode === "manual" ? "#4DA6FF" : "rgba(255,255,255,0.35)",
              border: inputMode === "manual" ? "1px solid rgba(77, 166, 255, 0.3)" : "1px solid transparent",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ✏️ Manual Input
          </button>
          <button
            onClick={() => setInputMode("ai")}
            className="flex-1 py-2.5 rounded-xl text-[11px] tracking-wider transition-all duration-300"
            style={{
              background: inputMode === "ai" ? "rgba(0, 255, 136, 0.12)" : "transparent",
              color: inputMode === "ai" ? "#00FF88" : "rgba(255,255,255,0.35)",
              border: inputMode === "ai" ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid transparent",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            🤖 AI Prompt Gen
          </button>
        </div>
      </div>

      {/* Input area */}
      {inputMode === "manual" ? (
        <div className="rounded-2xl p-4" style={glass}>
          <label className="text-[9px] tracking-widest mb-2 block" style={{ color: "rgba(77, 166, 255, 0.7)", fontFamily: "'Space Mono', monospace" }}>
            TASK IDENTIFIER
          </label>
          <input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full bg-transparent outline-none rounded-xl px-3 py-2.5"
            placeholder="Enter neural task name..."
            style={{
              border: "1px solid rgba(77, 166, 255, 0.25)",
              color: "#ffffff",
              background: "rgba(77, 166, 255, 0.04)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              boxShadow: "0 0 15px rgba(77, 166, 255, 0.1)",
              animation: "pulse-glow-blue 3s ease-in-out infinite",
            }}
          />
          <div className="mt-3 flex gap-2">
            {["High", "Medium", "Low"].map((p, i) => (
              <button
                key={p}
                className="flex-1 py-1.5 rounded-xl text-[10px] tracking-wider"
                style={{
                  background: i === 0 ? "rgba(0, 255, 136, 0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${i === 0 ? "rgba(0, 255, 136, 0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: i === 0 ? "#00FF88" : "rgba(255,255,255,0.4)",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4" style={glass}>
          <label className="text-[9px] tracking-widest mb-2 block" style={{ color: "rgba(77, 166, 255, 0.7)", fontFamily: "'Space Mono', monospace" }}>
            PASTE AI JSON DATA
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={6}
            className="w-full bg-transparent outline-none resize-none rounded-xl px-3 py-2.5"
            style={{
              border: "1px solid rgba(77, 166, 255, 0.3)",
              color: "#4DA6FF",
              background: "rgba(77, 166, 255, 0.04)",
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              lineHeight: 1.7,
              boxShadow: "0 0 20px rgba(77, 166, 255, 0.12), inset 0 0 20px rgba(77, 166, 255, 0.04)",
              animation: "pulse-glow-blue 3s ease-in-out infinite",
            }}
          />
          <button
            className="mt-2 w-full py-2 rounded-xl text-[10px] tracking-wider"
            style={{
              background: "rgba(0, 255, 136, 0.1)",
              border: "1px solid rgba(0, 255, 136, 0.25)",
              color: "#00FF88",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            ⚡ PARSE & GENERATE SUBTASKS
          </button>
        </div>
      )}

      {/* Neural Tree */}
      <div className="rounded-2xl p-4" style={glass}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>
            NEURAL TASK TREE
          </p>
          <div className="flex gap-2 text-[9px]" style={{ fontFamily: "'Space Mono', monospace" }}>
            <span style={{ color: "#00FF88" }}>● 1 done</span>
            <span style={{ color: "#4DA6FF" }}>● 1 active</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>● 3 pending</span>
          </div>
        </div>
        <NeuralTreeDiagram />
      </div>

      {/* Smart Scheduling Toggles */}
      <div className="flex flex-col gap-2.5">
        <p className="text-[9px] tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
          SMART SCHEDULING PROTOCOLS
        </p>

        {/* Spaced Repetition */}
        <div
          className="rounded-2xl p-3.5 flex items-center justify-between"
          style={{
            ...glass,
            border: spacedRep ? "1px solid rgba(77, 166, 255, 0.3)" : "1px solid rgba(255,255,255,0.06)",
            background: spacedRep ? "rgba(77, 166, 255, 0.06)" : "rgba(255, 255, 255, 0.03)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(77, 166, 255, 0.1)", border: "1px solid rgba(77, 166, 255, 0.2)" }}
            >
              <span className="text-sm">🔁</span>
            </div>
            <div>
              <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                Spaced Repetition
              </div>
              <div className="text-[9px]" style={{ color: "rgba(77, 166, 255, 0.6)", fontFamily: "'Space Mono', monospace" }}>
                LEARNING PROTOCOL · ACTIVE
              </div>
            </div>
          </div>
          <ToggleSwitch value={spacedRep} onChange={setSpacedRep} />
        </div>

        {/* Safe Deadline */}
        <div
          className="rounded-2xl p-3.5"
          style={{
            ...glass,
            border: safeDeadline ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid rgba(255,255,255,0.06)",
            background: safeDeadline ? "rgba(0, 255, 136, 0.04)" : "rgba(255, 255, 255, 0.03)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0, 255, 136, 0.1)", border: "1px solid rgba(0, 255, 136, 0.2)" }}
              >
                <span className="text-sm">🛡️</span>
              </div>
              <div>
                <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Safe Deadline AI
                </div>
                <div className="text-[9px]" style={{ color: "rgba(0, 255, 136, 0.6)", fontFamily: "'Space Mono', monospace" }}>
                  AI SUGGESTION ENGINE
                </div>
              </div>
            </div>
            <ToggleSwitch value={safeDeadline} onChange={setSafeDeadline} />
          </div>
          {safeDeadline && (
            <div
              className="mt-2.5 rounded-xl p-2.5 flex items-center justify-between"
              style={{ background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.15)" }}
            >
              <div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>AI suggests:</div>
                <div style={{ color: "#00FF88", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700 }}>
                  May 1, 2026 · 11:59 PM
                </div>
              </div>
              <button
                className="px-3 py-1.5 rounded-xl text-[10px] tracking-wider"
                style={{
                  background: "rgba(0, 255, 136, 0.15)",
                  border: "1px solid rgba(0, 255, 136, 0.3)",
                  color: "#00FF88",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                CONFIRM
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={() => navigate("/flow")}
        className="w-full py-4 rounded-2xl mb-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0, 255, 136, 0.18), rgba(0, 180, 100, 0.12))",
          border: "1px solid rgba(0, 255, 136, 0.45)",
          animation: "pulse-glow-green 2s ease-in-out infinite",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s linear infinite",
          }}
        />
        <div className="relative flex items-center justify-center gap-2">
          <span className="text-base">💾</span>
          <div>
            <div style={{ color: "#00FF88", fontSize: 14, fontWeight: 700 }}>Save Task</div>
            <div className="text-[9px] tracking-wider" style={{ color: "rgba(0, 255, 136, 0.6)", fontFamily: "'Space Mono', monospace" }}>
              NEURAL SYNC & QUEUE
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useApp, Task } from "../context/AppContext";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

const glass = (border = "rgba(255,255,255,0.08)") => ({
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${border}`,
  borderRadius: 16,
});

// ── Animated circadian wave background ───────────────────────────────────────
function CircadianWave() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg className="absolute bottom-0 left-0 w-full opacity-[0.07]" viewBox="0 0 390 130" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cw1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4DA6FF" />
            <stop offset="50%" stopColor="#00E87A" />
            <stop offset="100%" stopColor="#4DA6FF" />
          </linearGradient>
        </defs>
        <path d="M 0 80 Q 97 30 195 80 Q 293 130 390 80 L 390 130 L 0 130 Z" fill="url(#cw1)" />
        <path d="M 0 100 Q 97 60 195 100 Q 293 140 390 100 L 390 130 L 0 130 Z" fill="rgba(0,232,122,0.4)" />
      </svg>
    </div>
  );
}

// ── Quadrant config ───────────────────────────────────────────────────────────
const QUADS = [
  { q: 1, tag: "KHẨN CẤP & QUAN TRỌNG", color: "#00E87A", bg: "rgba(0,232,122,0.06)", border: "rgba(0,232,122,0.25)", glow: "pulse-green" },
  { q: 2, tag: "KHÔNG KHẨN CẤP & QUAN TRỌNG", color: "#4DA6FF", bg: "rgba(77,166,255,0.05)", border: "rgba(77,166,255,0.18)", glow: "" },
  { q: 3, tag: "KHẨN CẤP & KHÔNG QUAN TRỌNG", color: "#FFA500", bg: "rgba(255,165,0,0.05)", border: "rgba(255,165,0,0.18)", glow: "" },
  { q: 4, tag: "KHÔNG KHẨN CẤP & KHÔNG QUAN TRỌNG", color: "#FF4D6D", bg: "rgba(255,77,109,0.04)", border: "rgba(255,77,109,0.14)", glow: "" },
] as const;

type ScoredTaskResponse = {
  id: string;
  quadrant: 1 | 2 | 3 | 4;
  priority_rank: number;
  reason: string;
};

type EisenhowerApiResponse = {
  scored_tasks?: ScoredTaskResponse[];
  recommended_next_task?: ScoredTaskResponse | null;
};

const PRIORITY_TO_IMPORTANCE: Record<1 | 2 | 3 | 4, number> = {
  1: 10,
  2: 7,
  3: 4,
  4: 2,
};

const DIFFICULTY_TO_ENGINE: Record<1 | 2 | 3, number> = {
  1: 3,
  2: 6,
  3: 9,
};

const TYPE_TO_DIFFICULTY: Record<"simple" | "complex" | "longterm", 1 | 2 | 3> = {
  simple: 1,
  complex: 3,
  longterm: 2,
};

function toEngineTask(task: Task) {
  const hours = task.estimatedStudyTime && task.estimatedStudyTime.includes(":")
    ? task.estimatedStudyTime
    : task.subtasks?.length
      ? task.subtasks.length
      : 1;
  return {
    id: task.id,
    name: task.name,
    deadline: task.deadline ?? null,
    importance: PRIORITY_TO_IMPORTANCE[task.priority ?? 2],
    difficulty: DIFFICULTY_TO_ENGINE[task.difficulty ?? TYPE_TO_DIFFICULTY[task.type]],
    total_duration: hours,
    subtasks: (task.subtasks ?? []).map((subtask) => subtask.name),
  };
}

function getTaskDisplay(task: Task) {
  const subtasks = task.subtasks ?? [];
  if (subtasks.length === 0) {
    return {
      title: task.name,
      parentNote: null as string | null,
    };
  }

  const firstPending = subtasks.find((subtask) => !subtask.done);
  const pickedSubtask = firstPending ?? subtasks[0];
  return {
    title: pickedSubtask.name,
    parentNote: `Task chính: ${task.name}`,
  };
}

// ── SVG Lightning Bolt ────────────────────────────────────────────────────────
function LightningBoltIcon({ color = "#10b981", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M9.5 1.5 L4 9 L7.5 9 L6.5 14.5 L12 7 L8.5 7 Z"
        stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
        fill={`${color}20`}
      />
    </svg>
  );
}

// ── Centered Task Selection Modal ─────────────────────────────────────────────
function QuadModal({
  q, tasks, onClose, onConfirm,
}: {
  q: typeof QUADS[number];
  tasks: Task[];
  onClose: () => void;
  onConfirm: (t: Task) => void;
}) {
  const [selected, setSelected] = useState<Task | null>(null);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      {/* Modal container */}
      <div
        className="relative mx-4 w-full max-w-sm rounded-3xl flex flex-col"
        style={{
          background: "linear-gradient(160deg, rgba(8,18,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: `1px solid ${q.color}40`,
          boxShadow: `0 0 0 1px ${q.color}12, 0 8px 40px rgba(0,0,0,0.7), 0 0 60px ${q.color}12`,
          maxHeight: "72vh",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow strip */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${q.color}60, transparent)` }}
        />

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: q.color, boxShadow: `0 0 10px ${q.color}, 0 0 20px ${q.color}60` }}
              />
              <div>
                <p style={{ color: q.color, fontSize: 9, letterSpacing: 2.5, fontFamily: FONT, marginBottom: 2 }}>{q.tag}</p>
                <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: -0.3, fontFamily: FONT }}>{q.tag}</p>
              </div>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${q.color}25, transparent)` }} />
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-5 pb-3" style={{ scrollbarWidth: "none" }}>
          {tasks.length === 0 && (
            <div className="py-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${q.color}0A`, border: `1px solid ${q.color}20` }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke={`${q.color}50`} strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="9" cy="9" r="2" fill={`${q.color}40`} />
                </svg>
              </div>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: FONT, textAlign: "center" }}>Không có task trong ô này</p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {tasks.map(task => {
              const isSelected = selected?.id === task.id;
              const display = getTaskDisplay(task);
              return (
                <button
                  key={task.id}
                  onClick={() => setSelected(isSelected ? null : task)}
                  className="w-full text-left rounded-2xl p-3.5 transition-all duration-200 relative overflow-hidden"
                  style={{
                    background: isSelected ? `${q.color}0E` : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${isSelected ? `${q.color}55` : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isSelected ? `0 0 16px ${q.color}14, inset 0 1px 0 rgba(255,255,255,0.07)` : "none",
                  }}
                >
                  {/* Selected shimmer */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${q.color}06 0%, transparent 60%)` }}
                    />
                  )}

                  <div className="flex items-center gap-3 relative">
                    {/* Custom radio circle */}
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isSelected ? `${q.color}25` : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${isSelected ? q.color : "rgba(255,255,255,0.2)"}`,
                        boxShadow: isSelected ? `0 0 8px ${q.color}50` : "none",
                      }}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: q.color, boxShadow: `0 0 6px ${q.color}` }} />
                      )}
                    </div>

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p style={{
                        color: isSelected ? "#fff" : "rgba(255,255,255,0.75)",
                        fontSize: 13, fontWeight: isSelected ? 600 : 400,
                        fontFamily: FONT, lineHeight: 1.35,
                      }}>
                        {display.title}
                      </p>
                      {display.parentNote && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: FONT, marginTop: 2 }}>
                          {display.parentNote}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {task.deadline && (
                          <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none" style={{ display: "inline-block" }}>
                              <path d="M0.75 0.75 L8.25 0.75 L4.5 5 L8.25 9.25 L0.75 9.25 L4.5 5 Z"
                                fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" strokeLinejoin="round" />
                            </svg>
                            {task.deadline}
                          </span>
                        )}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span style={{ color: `${q.color}70`, fontSize: 10, fontFamily: FONT }}>
                            {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtask
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirmation button */}
        <div className="px-5 pb-5 pt-3 flex-shrink-0">
          <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
          <button
            onClick={() => { if (selected) onConfirm(selected); }}
            disabled={!selected}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 relative overflow-hidden"
            style={{
              background: selected
                ? "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(0,180,90,0.08) 100%)"
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${selected ? "#10b981" : "rgba(255,255,255,0.08)"}`,
              boxShadow: selected
                ? "0 0 20px rgba(16,185,129,0.25), 0 0 40px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "none",
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            {selected && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.06), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }}
              />
            )}
            <LightningBoltIcon color={selected ? "#10b981" : "rgba(255,255,255,0.2)"} size={16} />
            <span style={{
              color: selected ? "#10b981" : "rgba(255,255,255,0.2)",
              fontSize: 15, fontWeight: 600, fontFamily: FONT, letterSpacing: -0.2,
            }}>
              Bắt đầu làm việc
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export function NeuralMatrix() {
  const navigate = useNavigate();
  const { tasks, setCurrentTask, sleepData } = useApp();
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [scoredTasks, setScoredTasks] = useState<ScoredTaskResponse[]>([]);
  const [backendRecommendedId, setBackendRecommendedId] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const activeTasks = tasks.filter((task) => !task.done);
    if (activeTasks.length === 0) {
      setScoredTasks([]);
      setBackendRecommendedId(null);
      return;
    }

    const controller = new AbortController();
    const payload = { tasks: activeTasks.map(toEngineTask) };

    async function fetchScoredTasks() {
      try {
        const response = await fetch(`${apiBaseUrl}/tasks/eisenhower-score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Scoring API failed");
        }
        const data = (await response.json()) as EisenhowerApiResponse;
        setScoredTasks(data.scored_tasks ?? []);
        setBackendRecommendedId(data.recommended_next_task?.id ?? null);
      } catch {
        setScoredTasks([]);
        setBackendRecommendedId(null);
      }
    }

    fetchScoredTasks();
    return () => controller.abort();
  }, [apiBaseUrl, tasks]);

  const rankedIds = useMemo(
    () => scoredTasks
      .slice()
      .sort((a, b) => a.priority_rank - b.priority_rank)
      .map((item) => item.id),
    [scoredTasks],
  );
  const quadrantById = useMemo(
    () => Object.fromEntries(scoredTasks.map((item) => [item.id, item.quadrant])),
    [scoredTasks],
  );

  const activeTasks = tasks.filter((task) => !task.done);
  const taskById = new Map(activeTasks.map((task) => [task.id, task]));
  const orderedActiveTasks = rankedIds
    .map((id) => taskById.get(id))
    .filter((task): task is Task => Boolean(task));
  const fallbackActiveTasks = activeTasks.filter(
    (task) => !rankedIds.includes(task.id),
  );
  const sortedActiveTasks = [...orderedActiveTasks, ...fallbackActiveTasks];
  const resolvedRecommendedTask = backendRecommendedId
    ? taskById.get(backendRecommendedId)
    : undefined;

  const nextTask = resolvedRecommendedTask
    || sortedActiveTasks[0]
    || tasks.filter(t => !t.done && t.quadrant === 1)[0]
    || tasks.filter(t => !t.done)[0];
  const nextTaskDisplay = nextTask ? getTaskDisplay(nextTask) : null;
  const expandedQuad = QUADS.find(q => q.q === expandedQ);
  const expandedTasks = sortedActiveTasks.filter(
    (task) => (quadrantById[task.id] ?? task.quadrant) === expandedQ,
  );

  function goToFlow(task: Task) {
    setCurrentTask(task);
    navigate("/flow");
  }

  function handleNextTaskClick() {
    if (nextTask) goToFlow(nextTask);
  }

  const focusScore = Math.max(0, Math.min(100, Math.round(100 - (sleepData.debtHours * 5))));
  const focusColor = focusScore >= 80 ? "#00E87A" : focusScore >= 60 ? "#FFB830" : "#FF4D6D";

  return (
    <div className="min-h-full px-4 pt-6 pb-4 flex flex-col gap-4 relative">
      <CircadianWave />
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p style={{ color: "#4DA6FF", fontSize: 11, letterSpacing: 2, fontFamily: FONT, marginBottom: 2 }}>TRUNG TÂM ĐIỀU PHỐI</p>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: FONT }}>Neural Matrix</h1>
          </div>
          <div className="flex flex-col items-end">
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: FONT }}>18:25</span>
            <span style={{ color: "#00E87A", fontSize: 10, fontFamily: FONT }}>Đỉnh tập trung</span>
          </div>
        </div>

        {/* Nhiệm vụ tiếp theo */}
        {nextTask && (
          <button onClick={handleNextTaskClick} className="w-full text-left rounded-2xl p-4 relative overflow-hidden"
            style={{ background: "rgba(0,232,122,0.07)", border: "1px solid rgba(0,232,122,0.28)", animation: "pulse-green 2.5s ease-in-out infinite" }}>
            <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(90deg,transparent,rgba(0,232,122,0.2),transparent)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00E87A", animation: "blink-dot 1.5s ease-in-out infinite" }} />
                  <p style={{ color: "rgba(0,232,122,0.7)", fontSize: 10, letterSpacing: 2, fontFamily: FONT }}>NHIỆM VỤ TIẾP THEO</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: "rgba(0,232,122,0.12)", color: "#00E87A", fontFamily: FONT }}>→ Flow</span>
              </div>
              <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>{nextTaskDisplay?.title}</p>
              {nextTaskDisplay?.parentNote && (
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: FONT, marginTop: 2 }}>
                  {nextTaskDisplay.parentNote}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {nextTask.deadline && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: FONT }}>⏰ {nextTask.deadline}</span>}
                {nextTask.priority && <span style={{ color: "rgba(0,232,122,0.6)", fontSize: 11, fontFamily: FONT }}>Ưu tiên {nextTask.priority}</span>}
              </div>
            </div>
          </button>
        )}

        {/* Section label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <p style={{ color: "rgba(77,166,255,0.5)", fontSize: 10, letterSpacing: 2, fontFamily: FONT }}>MA TRẬN EISENHOWER</p>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Eisenhower Matrix */}
        <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          {/* Center brain node */}
          <div className="absolute z-10 rounded-full flex items-center justify-center"
            style={{ width: 32, height: 32, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(77,166,255,0.5),rgba(0,232,122,0.2))", border: "2px solid rgba(77,166,255,0.6)", boxShadow: "0 0 20px rgba(77,166,255,0.4)", animation: "pulse-blue 2s ease-in-out infinite" }}>
            <span style={{ fontSize: 14 }}>🧠</span>
          </div>
          {/* Cross lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
            <div className="absolute w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="absolute h-full w-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <div className="grid grid-cols-2 gap-0.5 p-0.5">
            {QUADS.map(q => {
              const qTasks = sortedActiveTasks.filter(
                (task) => (quadrantById[task.id] ?? task.quadrant) === q.q,
              );
              const corners = ["rounded-tl-2xl", "rounded-tr-2xl", "rounded-bl-2xl", "rounded-br-2xl"];
              return (
                <button key={q.q} onClick={() => setExpandedQ(q.q)}
                  className={`flex flex-col justify-start w-full ${corners[q.q - 1]} p-3 text-left transition-all duration-200`}
                  style={{ background: q.bg, border: `1px solid ${q.border}`, animation: q.q === 1 ? `${q.glow} 3s ease-in-out infinite` : "none", minHeight: 130 }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: q.color, boxShadow: `0 0 5px ${q.color}` }} />
                    <span style={{ color: q.color, fontSize: 8, letterSpacing: 1.5, fontFamily: FONT }}>{q.tag}</span>
                  </div>
                  {qTasks.slice(0, 2).map(t => {
                    const display = getTaskDisplay(t);
                    return (
                    <div key={t.id} className="flex items-start gap-1.5 mb-1.5">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: q.color, opacity: 0.8 }} />
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: FONT, lineHeight: 1.3 }}>
                          {display.title}
                        </p>
                        {display.parentNote && (
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 8, fontFamily: FONT, lineHeight: 1.2 }}>
                            {display.parentNote}
                          </p>
                        )}
                      </div>
                    </div>
                    );
                  })}
                  {qTasks.length > 2 && <p style={{ color: `${q.color}60`, fontSize: 9, fontFamily: FONT }}>+{qTasks.length - 2} khác</p>}
                  {qTasks.length === 0 && <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: FONT }}>Trống</p>}
                </button>
              );
            })}
          </div>
        </div>



        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Điểm tập trung", v: `${focusScore}%`, c: focusColor },
            { l: "Task xong", v: `${tasks.filter(t => t.done).length}/${tasks.length}`, c: "#4DA6FF" },
            { 
              l: "Năng lượng", 
              v: sleepData.debtHours <= 1.5 ? "CAO" : sleepData.debtHours <= 3.5 ? "TRUNG BÌNH" : "CẠN KIỆT", 
              c: sleepData.debtHours <= 1.5 ? "#00E87A" : sleepData.debtHours <= 3.5 ? "#FFB830" : "#FF4D6D" 
            },
          ].map(s => (
            <div key={s.l} className="rounded-xl p-2.5 text-center" style={glass()}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: FONT, marginBottom: 4 }}>{s.l}</p>
              <p style={{ color: s.c, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Task Selection Modal */}
      {expandedQ && expandedQuad && (
        <QuadModal
          q={expandedQuad}
          tasks={expandedTasks}
          onClose={() => setExpandedQ(null)}
          onConfirm={task => { setExpandedQ(null); goToFlow(task); }}
        />
      )}
    </div>
  );
}
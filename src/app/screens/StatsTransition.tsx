import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

const glass = (border = "rgba(255,255,255,0.08)") => ({
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${border}`,
  borderRadius: 16,
});

function fmtMins(m: number) {
  if (m < 60) return `${m} phút`;
  return `${(m / 60).toFixed(1)}h`;
}

function getTaskDisplay(task: ReturnType<typeof useApp>["tasks"][number]) {
  const subtasks = task.subtasks ?? [];
  if (subtasks.length === 0) {
    return { title: task.name, parentNote: null as string | null };
  }
  const firstPending = subtasks.find((subtask) => !subtask.done);
  const picked = firstPending ?? subtasks[0];
  return { title: picked.name, parentNote: `Task chính: ${task.name}` };
}

// ── Calming wave background ───────────────────────────────────────────────────
function CalmWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: 120, zIndex: 0 }}>
      <svg viewBox="0 0 390 120" className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="calmG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#4DA6FF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path d="M 0 70 Q 97 30 195 70 Q 293 110 390 70 L 390 120 L 0 120 Z" fill="url(#calmG)" />
        <path d="M 0 90 Q 97 55 195 90 Q 293 125 390 90 L 390 120 L 0 120 Z" fill="rgba(77,166,255,0.03)" />
      </svg>
    </div>
  );
}

// ── Glass badge icon components ───────────────────────────────────────────────
function TrophyIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <radialGradient id="trophyGlow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#00E87A" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#00C065" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#009A4E" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Cup body — glass fill */}
      <path d="M11 5h12l-2.5 12Q19 21 17 21Q15 21 13.5 17Z"
        fill="rgba(0,232,122,0.06)" stroke="rgba(0,232,122,0.65)" strokeWidth="1" strokeLinejoin="round" />
      {/* Inner glow core */}
      <ellipse cx="17" cy="13" rx="3.5" ry="5" fill="url(#trophyGlow)" />
      {/* Handles */}
      <path d="M11 7 Q6.5 7 6.5 12 Q6.5 16 11 16" fill="none" stroke="rgba(0,232,122,0.45)" strokeWidth="1" strokeLinecap="round" />
      <path d="M23 7 Q27.5 7 27.5 12 Q27.5 16 23 16" fill="none" stroke="rgba(0,232,122,0.45)" strokeWidth="1" strokeLinecap="round" />
      {/* Stem */}
      <line x1="17" y1="21" x2="17" y2="24" stroke="rgba(0,232,122,0.45)" strokeWidth="1" strokeLinecap="round" />
      {/* Base */}
      <rect x="13" y="24" width="8" height="2.5" rx="1.25" fill="rgba(0,232,122,0.1)" stroke="rgba(0,232,122,0.45)" strokeWidth="0.8" />
      {/* Glass specular highlight */}
      <path d="M13 7 Q14.5 6 16 7" stroke="rgba(255,255,255,0.45)" strokeWidth="0.75" fill="none" strokeLinecap="round" />
      {/* Outer ambient glow */}
      <ellipse cx="17" cy="13" rx="8" ry="9" fill="none" stroke="rgba(0,232,122,0.08)" strokeWidth="3" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4DA6FF" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#2880E0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1A60C0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Brain outline — glass fill */}
      <path d="M17 7 Q22 5 25 9 Q29 12 27 18 Q25 23 21 25 L17 26 L13 25 Q9 23 7 18 Q5 12 9 9 Q12 5 17 7Z"
        fill="rgba(77,166,255,0.06)" stroke="rgba(77,166,255,0.6)" strokeWidth="0.9" strokeLinejoin="round" />
      {/* Inner glow core */}
      <circle cx="17" cy="16" r="5" fill="url(#brainGlow)" />
      <circle cx="17" cy="16" r="2" fill="rgba(77,166,255,0.55)" />
      {/* Synapse fold lines */}
      <path d="M12 14 Q14.5 12.5 17 14.5 Q19.5 12.5 22 14" stroke="rgba(77,166,255,0.45)" strokeWidth="0.85" fill="none" strokeLinecap="round" />
      <path d="M11 18 Q14 16.5 17 18.5 Q20 16.5 23 18" stroke="rgba(77,166,255,0.35)" strokeWidth="0.75" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <line x1="17" y1="26" x2="17" y2="29" stroke="rgba(77,166,255,0.3)" strokeWidth="1" strokeLinecap="round" />
      {/* Specular highlight */}
      <path d="M12 9.5 Q13.5 8.5 15 9.5" stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" fill="none" strokeLinecap="round" />
      {/* Ambient glow ring */}
      <ellipse cx="17" cy="16" rx="9" ry="10" fill="none" stroke="rgba(77,166,255,0.07)" strokeWidth="3" />
    </svg>
  );
}

function BoltIcon({ baseColor = "255,180,30", glowColor = "255,195,60" }: { baseColor?: string, glowColor?: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <radialGradient id="boltGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`rgba(${glowColor},0.65)`} />
          <stop offset="55%" stopColor={`rgba(${glowColor},0.22)`} />
          <stop offset="100%" stopColor={`rgba(${glowColor},0)`} />
        </radialGradient>
      </defs>
      {/* Bolt outer shape — glass fill */}
      <path d="M20 4 L13 16 L19 16 L14 30 L25 14 L18.5 14 Z"
        fill={`rgba(${baseColor},0.08)`} stroke={`rgba(${baseColor},0.65)`} strokeWidth="1" strokeLinejoin="round" />
      {/* Inner glow core */}
      <path d="M19 8 L15 17 L20 17 L15.5 26"
        stroke={`rgba(${glowColor},0.5)`} strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="17" cy="17" rx="4" ry="5" fill="url(#boltGlow)" />
      {/* Specular highlight */}
      <path d="M17 6 Q18 5 19 6" stroke="rgba(255,255,255,0.45)" strokeWidth="0.75" fill="none" strokeLinecap="round" />
      {/* Ambient glow ring */}
      <ellipse cx="17" cy="17" rx="9" ry="11" fill="none" stroke={`rgba(${baseColor},0.07)`} strokeWidth="3" />
    </svg>
  );
}

// ── Scenario action card icons ────────────────────────────────────────────────
function CalendarForwardIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      {/* Calendar body */}
      <rect x="3" y="6" width="18" height="18" rx="2.5" fill="rgba(255,77,109,0.06)" stroke="rgba(255,143,163,0.55)" strokeWidth="1" />
      {/* Header fill */}
      <rect x="3" y="6" width="18" height="6" rx="2.5" fill="rgba(255,77,109,0.1)" />
      <rect x="3" y="10" width="18" height="2" fill="rgba(255,77,109,0.1)" />
      {/* Binder rings */}
      <line x1="9" y1="4" x2="9" y2="8.5" stroke="rgba(255,143,163,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15" y1="4" x2="15" y2="8.5" stroke="rgba(255,143,163,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Grid dots */}
      <circle cx="7.5" cy="16" r="1" fill="rgba(255,143,163,0.4)" />
      <circle cx="12" cy="16" r="1" fill="rgba(255,143,163,0.4)" />
      <circle cx="7.5" cy="20" r="1" fill="rgba(255,143,163,0.35)" />
      <circle cx="12" cy="20" r="1" fill="rgba(255,143,163,0.35)" />
      {/* Fast-forward chevrons */}
      <path d="M22 13 L27 17.5 L22 22" stroke="rgba(255,143,163,0.85)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18 15 L21.5 17.5 L18 20" stroke="rgba(255,143,163,0.45)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function BatteryRechargeIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      {/* Battery outer shell */}
      <rect x="2" y="9" width="22" height="13" rx="2.5" fill="rgba(77,166,255,0.06)" stroke="rgba(77,166,255,0.55)" strokeWidth="1" />
      {/* Battery cap */}
      <rect x="24" y="13" width="3.5" height="5" rx="1.5" fill="rgba(77,166,255,0.35)" />
      {/* Charge fill ~60% */}
      <rect x="4" y="11.5" width="10" height="8" rx="1.5" fill="rgba(77,166,255,0.22)" />
      {/* Animated lightning recharge bolt */}
      <path d="M16 11.5 L13 16 L16.5 16 L13.5 20.5"
        stroke="rgba(100,210,255,0.9)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Ambient glow on bolt */}
      <path d="M16 11.5 L13 16 L16.5 16 L13.5 20.5"
        stroke="rgba(100,210,255,0.25)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Specular on shell */}
      <path d="M4 11 Q5 10 7 11" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function NeuralLoopIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      {/* Outer loop arc */}
      <path d="M15 4 Q24 4 24 14 Q24 23 15 23 Q6 23 6 14 Q6 8 11 5.5"
        stroke="rgba(0,232,122,0.6)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Arrowhead */}
      <path d="M8 3.5 L11 5.5 L9 8.5"
        stroke="rgba(0,232,122,0.75)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Core synapse node */}
      <circle cx="15" cy="14" r="4" fill="rgba(0,232,122,0.1)" stroke="rgba(0,232,122,0.5)" strokeWidth="0.85" />
      <circle cx="15" cy="14" r="2" fill="rgba(0,232,122,0.55)" />
      {/* Dendrite spokes */}
      <line x1="15" y1="10" x2="15" y2="8" stroke="rgba(0,232,122,0.35)" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="18.5" y1="11" x2="20.5" y2="9" stroke="rgba(0,232,122,0.3)" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="18.5" y1="17" x2="20.5" y2="19" stroke="rgba(0,232,122,0.3)" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="11.5" y1="17" x2="9.5" y2="19" stroke="rgba(0,232,122,0.3)" strokeWidth="0.8" strokeLinecap="round" />
      {/* Ambient glow */}
      <circle cx="15" cy="14" r="6" fill="none" stroke="rgba(0,232,122,0.08)" strokeWidth="3" />
    </svg>
  );
}

// ── Scenario: tasks remaining ─────────────────────────────────────────────────
function ScenarioRemaining({ onChoice }: { onChoice: (choice: "end" | "break" | "continue") => void }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(77,166,255,0.05)", border: "1px solid rgba(77,166,255,0.18)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 20 }}> </span>
        <div>

          <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>Xong một việc rồi! Bây giờ chúng ta làm gì đây?</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button onClick={() => onChoice("end")}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200 group"
          style={{ background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.22)" }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(255,77,109,0.1)", borderRadius: 10, border: "1px solid rgba(255,77,109,0.2)" }}>
            <CalendarForwardIcon />
          </div>
          <div>
            <p style={{ color: "rgba(255,143,163,0.9)", fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Dời lịch &amp; Kết thúc</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT }}>Chuyển task còn lại sang ngày mai</p>
          </div>
        </button>

        <button onClick={() => onChoice("break")}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200"
          style={{ background: "rgba(77,166,255,0.07)", border: "1px solid rgba(77,166,255,0.2)" }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(77,166,255,0.1)", borderRadius: 10, border: "1px solid rgba(77,166,255,0.2)" }}>
            <BatteryRechargeIcon />
          </div>
          <div>
            <p style={{ color: "#4DA6FF", fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Nghỉ giải lao</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT }}>Phục hồi rồi tiếp tục</p>
          </div>
        </button>

        <button onClick={() => onChoice("continue")}
          className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200"
          style={{ background: "rgba(0,232,122,0.07)", border: "1px solid rgba(0,232,122,0.22)", animation: "pulse-green 3s ease-in-out infinite" }}>
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(0,232,122,0.1)", borderRadius: 10, border: "1px solid rgba(0,232,122,0.2)" }}>
            <NeuralLoopIcon />
          </div>
          <div>
            <p style={{ color: "#00E87A", fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Tiếp tục công việc</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: FONT }}>Chọn task tiếp theo ngay</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Scenario: all tasks done ──────────────────────────────────────────────────
function ScenarioAllDone({ onChoice }: { onChoice: (choice: "end" | "tomorrow") => void }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(0,232,122,0.05)", border: "1px solid rgba(0,232,122,0.2)" }}>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2"> </div>
        <p style={{ color: "rgba(0,232,122,0.7)", fontSize: 10, letterSpacing: 2, fontFamily: FONT, marginBottom: 6 }}>HOÀN THÀNH MỌI NHIỆM VỤ!</p>
        <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: FONT, lineHeight: 1.5 }}>
          Toàn bộ công việc hôm nay đã hoàn tất. Bạn có muốn thực hiện trước task của ngày mai không?
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onChoice("end")}
          className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl transition-all duration-200"
          style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.22)" }}>
          <span style={{ color: "#FF8FA3", fontSize: 11, fontWeight: 700, fontFamily: FONT }}>A</span>
          <span style={{ color: "#FF8FA3", fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Kết thúc</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT, textAlign: "center" }}>Nghỉ ngơi xứng đáng!</span>
        </button>
        <button onClick={() => onChoice("tomorrow")}
          className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl transition-all duration-200"
          style={{ background: "rgba(77,166,255,0.08)", border: "1px solid rgba(77,166,255,0.22)" }}>
          <span style={{ color: "#4DA6FF", fontSize: 11, fontWeight: 700, fontFamily: FONT }}>B</span>
          <span style={{ color: "#4DA6FF", fontSize: 13, fontWeight: 600, fontFamily: FONT, textAlign: "center" }}>Làm trước task ngày mai</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>Vào ma trận não</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export function StatsTransition() {
  const navigate = useNavigate();
  const { sessionStats, tasks, sleepData, setTasks } = useApp();
  // Simulate: if user wants to see "all done" scenario, use a toggle for demo
  const [demoAllDone, setDemoAllDone] = useState(false);
  const [showAllRemaining, setShowAllRemaining] = useState(false);

  const remainingTasks = tasks.filter((task) => !task.done);
  const remainingCount = remainingTasks.length;
  const allDone = demoAllDone || remainingCount === 0;
  
  const TYPE_TO_DIFFICULTY: Record<string, number> = { simple: 1, longterm: 2, complex: 3 };
  const totalDifficulty = tasks.reduce((sum, t) => sum + (t.difficulty ?? TYPE_TO_DIFFICULTY[t.type] ?? 1), 0);
  const doneDifficulty = tasks.filter(t => t.done).reduce((sum, t) => sum + (t.difficulty ?? TYPE_TO_DIFFICULTY[t.type] ?? 1), 0);
  const efficiency = totalDifficulty > 0 ? Math.round((doneDifficulty / totalDifficulty) * 100) : 0;
  
  const visibleRemainingTasks = showAllRemaining ? remainingTasks : remainingTasks.slice(0, 3);

  function handleRemainingChoice(choice: "end" | "break" | "continue") {
    if (choice === "end") navigate("/");
    else navigate("/dashboard");
  }

  function handleAllDoneChoice(choice: "end" | "tomorrow") {
    if (choice === "end") {
      navigate("/");
    } else {
      if (!tasks.some((t) => t.id === "extra_t1")) {
        setTasks((prev) => [
          ...prev,
          { id: "extra_t1", name: "Làm bài tập Cấu trúc dữ liệu", type: "complex", priority: 2, deadline: "07/05/2026 08:00", done: false, quadrant: 2 },
          { id: "extra_t2", name: "Tìm tài liệu cho bài Tiểu luận", type: "simple", priority: 2, deadline: "07/05/2026 10:00", done: false, quadrant: 2 },
          { id: "extra_t3", name: "Hoàn thành slide thuyết trình nhóm", type: "simple", priority: 2, deadline: "07/05/2026 12:00", done: false, quadrant: 2 },
        ]);
      }
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-full px-4 pt-6 pb-4 flex flex-col gap-4 relative">
      <CalmWave />
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p style={{ color: "#4DA6FF", fontSize: 11, letterSpacing: 2, fontFamily: FONT, marginBottom: 2 }}>PHIÊN LÀM VIỆC HOÀN TẤT</p>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: FONT }}>Thống kê </h1>
          </div>

        </div>

        {/* Session stats */}
        <div className="rounded-2xl p-4" style={glass()}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, fontFamily: FONT, marginBottom: 14 }}>THỐNG KÊ PHIÊN LÀM VIỆC</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p style={{ color: "#4DA6FF", fontSize: 26, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>
                {fmtMins(sessionStats.focusMinutes)}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT, marginTop: 4 }}>Thời gian tập trung</p>
            </div>
            <div className="text-center">
              <p style={{ color: "#00E87A", fontSize: 26, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>
                {sessionStats.tasksCompleted}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT, marginTop: 4 }}>Số task hoàn thành</p>
            </div>
            <div className="text-center">
              <p style={{ color: "#FFA500", fontSize: 26, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>
                {efficiency}%
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT, marginTop: 4 }}>Hiệu suất</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: FONT }}>
              <span>Tiến độ hôm nay</span>
              <span>{sessionStats.tasksCompleted}/{sessionStats.totalTasks} task</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${(sessionStats.tasksCompleted / Math.max(sessionStats.totalTasks, 1)) * 100}%`, background: "linear-gradient(90deg,#00E87A,#4DA6FF)", boxShadow: "0 0 8px rgba(0,232,122,0.4)" }} />
            </div>
          </div>
        </div>

        {/* Achievements / quick notes */}
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-xl p-3 flex flex-col items-center gap-2" style={{ background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.15)" }}>
            <TrophyIcon />
            <p style={{ color: "rgba(0,232,122,0.8)", fontSize: 11, fontWeight: 600, fontFamily: FONT, textAlign: "center" }}>Hoàn thành đúng hạn</p>
          </div>
          <div className="flex-1 rounded-xl p-3 flex flex-col items-center gap-2" style={{ background: "rgba(77,166,255,0.06)", border: "1px solid rgba(77,166,255,0.15)" }}>
            <BrainIcon />
            <p style={{ color: "rgba(77,166,255,0.8)", fontSize: 11, fontWeight: 600, fontFamily: FONT, textAlign: "center" }}>Tập trung cao độ</p>
          </div>
          {(() => {
            let label = "Năng lượng tốt";
            let colorStr = "255,165,0"; // orange
            if (sleepData.debtHours <= 1.5) {
              label = "Năng lượng cao";
              colorStr = "0,232,122"; // green
            } else if (sleepData.debtHours > 3.5) {
              label = "Năng lượng cạn";
              colorStr = "255,77,109"; // red
            }
            return (
              <div className="flex-1 rounded-xl p-3 flex flex-col items-center gap-2" style={{ background: `rgba(${colorStr},0.06)`, border: `1px solid rgba(${colorStr},0.15)` }}>
                <BoltIcon baseColor={colorStr} glowColor={colorStr} />
                <p style={{ color: `rgba(${colorStr},0.8)`, fontSize: 11, fontWeight: 600, fontFamily: FONT, textAlign: "center" }}>{label}</p>
              </div>
            );
          })()}
        </div>

        {/* Scenario demo toggle */}


        {/* Decision card */}
        {allDone
          ? <ScenarioAllDone onChoice={handleAllDoneChoice} />
          : <ScenarioRemaining onChoice={handleRemainingChoice} />
        }

        {/* Remaining tasks preview (when tasks left) */}
        {!allDone && remainingCount > 0 && (
          <div className="rounded-2xl p-4" style={glass("rgba(255,77,109,0.12)")}>
            <p style={{ color: "#FF8FA3", fontSize: 10, letterSpacing: 1.5, fontFamily: FONT, marginBottom: 10 }}>TASK CHƯA HOÀN THÀNH HÔM NAY</p>
            {visibleRemainingTasks.map(task => {
              const display = getTaskDisplay(task);
              return (
                <div key={task.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: FONT }}>{display.title}</p>
                    {display.parentNote && (
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: FONT, marginTop: 2 }}>
                        {display.parentNote}
                      </p>
                    )}
                  </div>
                  {task.deadline && <span style={{ color: "#FF8FA3", fontSize: 10, fontFamily: FONT }}>{task.deadline}</span>}
                </div>
              );
            })}
            {remainingCount > 3 && (
              <button
                onClick={() => setShowAllRemaining((prev) => !prev)}
                className="w-full mt-2 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontFamily: FONT,
                }}
              >
                {showAllRemaining ? "Thu gọn danh sách" : `+${remainingCount - 3} task khác`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
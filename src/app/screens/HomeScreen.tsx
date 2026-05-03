import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', 'Helvetica Neue', sans-serif`;

const glass = (border = "rgba(255,255,255,0.08)") => ({
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${border}`,
  borderRadius: 16,
});

// ── Overlay backdrop ──────────────────────────────────────────────────────────
function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 100, background: "rgba(2,11,24,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose} />
  );
}

// ── 24-hour Scroll Wheel Picker ───────────────────────────────────────────────
const ITEM_H = 44;
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const NAP_WINDOW_START_MIN = 11 * 60;
const NAP_WINDOW_END_MIN = 15 * 60;

type ICalFreeSlot = { start?: string; end?: string };
type ICalDayReport = { free?: ICalFreeSlot[] };
type ICalReport = Record<string, ICalDayReport>;
type NapSuggestionInfo = { value: string; sub: string };
type RecommendedTask = { id: string; reason?: string };
type RankedTask = { id: string; priority_rank: number };
type EatFrogApiResponse = {
  recommended_next_task?: RecommendedTask | null;
  ranked_tasks?: RankedTask[];
};
const APP_TIMEZONE = "Asia/Ho_Chi_Minh";

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

function durationTextToHours(duration?: string): number {
  if (!duration || !duration.includes(":")) return 1;
  const [hourText, minuteText] = duration.split(":");
  const hours = Number(hourText);
  const minutes = Number(minuteText);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 1;
  return Math.max(0.5, hours + minutes / 60);
}

const TYPE_TO_DIFFICULTY: Record<"simple" | "complex" | "longterm", 1 | 2 | 3> = {
  simple: 1,
  complex: 3,
  longterm: 2,
};

function toEngineTaskPayload(task: ReturnType<typeof useApp>["tasks"][number]) {
  return {
    id: task.id,
    name: task.name,
    deadline: task.deadline ?? null,
    importance: PRIORITY_TO_IMPORTANCE[task.priority ?? 2],
    difficulty: DIFFICULTY_TO_ENGINE[task.difficulty ?? TYPE_TO_DIFFICULTY[task.type]],
    total_duration: durationTextToHours(task.estimatedStudyTime),
    subtasks: (task.subtasks ?? []).map((subtask) => subtask.name),
  };
}

function toDailySlotsPayload(report: ICalReport | null) {
  if (!report) return [];
  return Object.entries(report).map(([date, dayReport]) => {
    const slots = (dayReport.free ?? [])
      .map((slot) => {
        const start = minuteOfDayFromIsoText(slot.start);
        const end = minuteOfDayFromIsoText(slot.end);
        if (start === null || end === null || end <= start) return null;
        return Number(((end - start) / 60).toFixed(2));
      })
      .filter((value): value is number => value !== null && value > 0);
    return { date, slots };
  });
}

function parseUiDeadline(deadline?: string): number {
  if (!deadline) return Number.MAX_SAFE_INTEGER;
  const text = deadline.trim();
  const ddmmyyyyWithTime = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const matchWithTime = text.match(ddmmyyyyWithTime);
  if (matchWithTime) {
    const [, dd, mm, yyyy, hh, min] = matchWithTime;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min)).getTime();
  }
  const matchDateOnly = text.match(ddmmyyyy);
  if (matchDateOnly) {
    const [, dd, mm, yyyy] = matchDateOnly;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 23, 59).getTime();
  }
  const isoDate = new Date(text).getTime();
  return Number.isFinite(isoDate) ? isoDate : Number.MAX_SAFE_INTEGER;
}

function localFallbackSort<T extends { quadrant: 1 | 2 | 3 | 4; priority?: 1 | 2 | 3 | 4; deadline?: string; id: string }>(
  tasks: T[],
): T[] {
  return tasks.slice().sort((a, b) => {
    if (a.quadrant !== b.quadrant) return a.quadrant - b.quadrant;
    const pa = a.priority ?? 4;
    const pb = b.priority ?? 4;
    if (pa !== pb) return pa - pb;
    const da = parseUiDeadline(a.deadline);
    const db = parseUiDeadline(b.deadline);
    if (da !== db) return da - db;
    return a.id.localeCompare(b.id);
  });
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

function getNowInAppTimezone(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dateKey = `${map.year}-${map.month}-${map.day}`;
  const hour = parseInt(map.hour ?? "0", 10);
  const minute = parseInt(map.minute ?? "0", 10);
  return {
    dateKey,
    minuteOfDay: hour * 60 + minute,
  };
}

function minuteOfDayFromIsoText(isoText?: string): number | null {
  if (!isoText) return null;
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes();
}

function formatMinuteOfDay(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildNapSuggestion(
  report: ICalReport | null,
  debtHours: number,
  iCalUploaded: boolean,
  isUploadingIcal: boolean,
  now: Date,
): NapSuggestionInfo {
  if (isUploadingIcal) {
    return { value: "Đang phân tích lịch", sub: "chờ dữ liệu từ backend" };
  }
  if (!iCalUploaded) {
    return { value: "Tải lịch để gợi ý", sub: "cần tải lịch" };
  }
  if (!report) {
    return { value: "Chưa có dữ liệu lịch", sub: "report chưa sẵn sàng" };
  }

  const nowInTz = getNowInAppTimezone(now);
  const todayKey = nowInTz.dateKey;
  const currentMinute = nowInTz.minuteOfDay;
  const effectiveWindowStart = Math.max(NAP_WINDOW_START_MIN, currentMinute);
  if (effectiveWindowStart >= NAP_WINDOW_END_MIN) {
    return { value: "Hết khung ngủ bù", sub: "đã qua 15:00 hôm nay" };
  }
  const todayFreeSlots = report[todayKey]?.free ?? [];

  let bestSlot: { start: number; end: number; duration: number } | null = null;
  let totalOverlapMins = 0;
  for (const slot of todayFreeSlots) {
    const slotStart = minuteOfDayFromIsoText(slot.start);
    const slotEnd = minuteOfDayFromIsoText(slot.end);
    if (slotStart === null || slotEnd === null || slotEnd <= slotStart) continue;

    const overlapStart = Math.max(slotStart, effectiveWindowStart);
    const overlapEnd = Math.min(slotEnd, NAP_WINDOW_END_MIN);
    if (overlapEnd <= overlapStart) continue;

    const overlapDuration = overlapEnd - overlapStart;
    totalOverlapMins += overlapDuration;
    if (!bestSlot || overlapDuration > bestSlot.duration) {
      bestSlot = { start: overlapStart, end: overlapEnd, duration: overlapDuration };
    }
  }

  if (!bestSlot) {
    return { value: "Không có khung ngủ bù", sub: "hôm nay 11:00-15:00 không rảnh" };
  }

  const slotLabel = `${formatMinuteOfDay(bestSlot.start)}-${formatMinuteOfDay(bestSlot.end)}`;
  const totalFreeLabel = `${Math.floor(totalOverlapMins / 60)}h${String(totalOverlapMins % 60).padStart(2, "0")}`;
  const debtLabel = `nợ ${debtHours.toFixed(1)}h`;

  if (debtHours >= 2) {
    const minimumNeededMins = Math.round(debtHours * 60 + 10);
    if (totalOverlapMins < minimumNeededMins) {
      const neededLabel = `${Math.floor(minimumNeededMins / 60)}h${String(minimumNeededMins % 60).padStart(2, "0")}`;
      return { value: "Khung rảnh chưa đủ", sub: `rảnh ${totalFreeLabel}, cần >= ${neededLabel}` };
    }
    if (bestSlot.duration >= 90) {
      return { value: "Full Cycle Nap (90 phút)", sub: `khung ${slotLabel}, ${debtLabel}, rảnh ${totalFreeLabel}` };
    }
    return { value: "Power Nap (30 phút)", sub: `khung ${slotLabel}, ${debtLabel}, rảnh ${totalFreeLabel}` };
  }

  return { value: "Power Nap (20-30 phút)", sub: `khung ${slotLabel}, ${debtLabel}, rảnh ${totalFreeLabel}` };
}

function getEnergyLevel(debtHours: number) {
  if (debtHours <= 1.5) return { label: "CAO", color: "#00E87A", sub: "Hiệu suất cao" };
  if (debtHours <= 3.5) return { label: "TRUNG BÌNH", color: "#FFB830", sub: "Cần chú ý" };
  return { label: "CẠN KIỆT", color: "#FF4D6D", sub: "Nguy cơ cao" };
}

function ScrollColumn({ items, value, onChange, rgb }: {
  items: string[]; value: string; onChange: (v: string) => void; rgb: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastVal = useRef(value);

  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0 && ref.current) ref.current.scrollTop = idx * ITEM_H;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScroll() {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== lastVal.current) {
      lastVal.current = items[clamped];
      onChange(items[clamped]);
    }
  }

  return (
    <div style={{ position: "relative", flex: 1, height: ITEM_H * 3, overflow: "hidden", borderRadius: 8 }}>
      {/* Top fade */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: ITEM_H * 0.85, zIndex: 2, background: "linear-gradient(to bottom,rgba(10,22,40,0.96),transparent)", pointerEvents: "none" }} />
      {/* Bottom fade */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: ITEM_H * 0.85, zIndex: 2, background: "linear-gradient(to top,rgba(10,22,40,0.96),transparent)", pointerEvents: "none" }} />
      {/* Selection lines */}
      <div style={{ position: "absolute", top: ITEM_H - 0.5, left: 4, right: 4, height: 1, zIndex: 3, background: `rgba(${rgb},0.38)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: ITEM_H * 2 - 0.5, left: 4, right: 4, height: 1, zIndex: 3, background: `rgba(${rgb},0.38)`, pointerEvents: "none" }} />
      {/* Selected row bg */}
      <div style={{ position: "absolute", top: ITEM_H, left: 0, right: 0, height: ITEM_H, zIndex: 1, background: `rgba(${rgb},0.07)`, pointerEvents: "none" }} />
      {/* Scrollable list */}
      <div ref={ref} onScroll={handleScroll}
        style={{ height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>
        <div style={{ height: ITEM_H }} />
        {items.map(item => (
          <div key={item}
            onClick={() => {
              onChange(item);
              lastVal.current = item;
              const idx = items.indexOf(item);
              if (ref.current) ref.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
            }}
            style={{
              height: ITEM_H, scrollSnapAlign: "center",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: item === value ? `rgb(${rgb})` : "rgba(255,255,255,0.22)",
              fontSize: item === value ? 26 : 19,
              fontWeight: item === value ? 700 : 400,
              fontFamily: FONT, cursor: "pointer",
              transition: "color 0.12s, font-size 0.12s",
            }}>
            {item}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

function TimePicker({ label, hour, minute, onHour, onMinute, rgb, borderRgb }: {
  label: string; hour: string; minute: string;
  onHour: (v: string) => void; onMinute: (v: string) => void;
  rgb: string; borderRgb: string;
}) {
  return (
    <div className="flex-1">
      <label style={{ color: `rgb(${rgb})`, fontSize: 11, fontFamily: FONT, display: "block", marginBottom: 6 }}>{label}</label>
      <div className="rounded-2xl p-3" style={{ background: `rgba(${rgb},0.07)`, border: `1px solid rgba(${borderRgb},0.35)` }}>
        <div className="flex items-center gap-1">
          <ScrollColumn items={HOURS} value={hour} onChange={onHour} rgb={rgb} />
          <span style={{ color: `rgb(${rgb})`, fontSize: 22, fontWeight: 700, fontFamily: FONT, flexShrink: 0, paddingBottom: 2 }}>:</span>
          <ScrollColumn items={MINUTES} value={minute} onChange={onMinute} rgb={rgb} />
        </div>
      </div>
    </div>
  );
}

// ── Modal: Nhập giờ ngủ thủ công ─────────────────────────────────────────────
function SleepModal({ onClose }: { onClose: () => void }) {
  const { sleepData, setSleepData } = useApp();

  const parseTime = (t: string) => {
    const [h = "22", m = "00"] = t.split(":");
    return { h: h.padStart(2, "0"), m: m.padStart(2, "0") };
  };

  const s0 = parseTime(sleepData.sleepTime);
  const w0 = parseTime(sleepData.wakeTime);

  const [sleepH, setSleepH] = useState(s0.h);
  const [sleepM, setSleepM] = useState(s0.m);
  const [wakeH,  setWakeH]  = useState(w0.h);
  const [wakeM,  setWakeM]  = useState(w0.m);

  function calcDebt(sh: string, sm: string, wh: string, wm: string) {
    let sleepMins = parseInt(sh) * 60 + parseInt(sm);
    let wakeMins  = parseInt(wh) * 60 + parseInt(wm);
    if (wakeMins <= sleepMins) wakeMins += 24 * 60;
    return Math.max(0, parseFloat((8 - (wakeMins - sleepMins) / 60).toFixed(1)));
  }

  function handleSave() {
    setSleepData({ sleepTime: sleepH + ":" + sleepM, wakeTime: wakeH + ":" + wakeM, debtHours: calcDebt(sleepH, sleepM, wakeH, wakeM) });
    onClose();
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 flex justify-center" style={{ zIndex: 101 }}>
        <div className="w-full max-w-sm mx-auto rounded-t-3xl p-5"
          style={{ background: "#0A1628", border: "1px solid rgba(77,166,255,0.2)", borderBottom: "none" }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
          <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: FONT, marginBottom: 4 }}>Khai báo giờ ngủ và thức</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: FONT, marginBottom: 20 }}>Định dạng 24 giờ — cuộn để chọn</p>
          <div className="flex gap-3 mb-5">
            <TimePicker
              label="Giờ đi ngủ"
              hour={sleepH} minute={sleepM}
              onHour={setSleepH} onMinute={setSleepM}
              rgb="255,77,109" borderRgb="255,77,109"
            />
            <TimePicker
              label="Giờ thức dậy"
              hour={wakeH} minute={wakeM}
              onHour={setWakeH} onMinute={setWakeM}
              rgb="0,232,122" borderRgb="0,232,122"
            />
          </div>
          <button onClick={handleSave} className="w-full py-3.5 rounded-2xl"
            style={{ background: "linear-gradient(135deg,rgba(0,232,122,0.22),rgba(0,180,90,0.15))", border: "1px solid rgba(0,232,122,0.45)", color: "#00E87A", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
            Lưu & Tính nợ ngủ
          </button>
        </div>
      </div>
    </>
  );
}

// ── Modal: Bắt đầu làm việc – chọn task ──────────────────────────────────────
function StartWorkModal({
  onClose,
  iCalReport,
}: {
  onClose: () => void;
  iCalReport: ICalReport | null;
}) {
  const { tasks, setCurrentTask } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [recommendReason, setRecommendReason] = useState<string | null>(null);
  const [rankedOrderIds, setRankedOrderIds] = useState<string[]>([]);
  const todayTasks = tasks.filter(t => !t.done);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const sortedTodayTasks = useMemo(() => {
    if (todayTasks.length === 0) return [];
    if (rankedOrderIds.length === 0) return localFallbackSort(todayTasks);

    const taskById = new Map(todayTasks.map((task) => [task.id, task]));
    const rankedTasks = rankedOrderIds
      .map((id) => taskById.get(id))
      .filter((task): task is (typeof todayTasks)[number] => Boolean(task));
    const unrankedTasks = localFallbackSort(
      todayTasks.filter((task) => !rankedOrderIds.includes(task.id)),
    );
    return [...rankedTasks, ...unrankedTasks];
  }, [rankedOrderIds, todayTasks]);

  useEffect(() => {
    const activeTasks = tasks.filter((task) => !task.done);
    if (activeTasks.length === 0) {
      setSelected(null);
      setRecommendReason(null);
      return;
    }

    const controller = new AbortController();
    async function fetchRecommendedTask() {
      try {
        const response = await fetch(`${apiBaseUrl}/tasks/eat-frog-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tasks: activeTasks.map(toEngineTaskPayload),
            daily_slots: toDailySlotsPayload(iCalReport),
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Planning API failed");
        }
        const data = (await response.json()) as EatFrogApiResponse;
        const rankedIds = (data.ranked_tasks ?? [])
          .slice()
          .sort((a, b) => a.priority_rank - b.priority_rank)
          .map((item) => item.id);
        const firstPriorityTaskId = rankedIds[0] ?? activeTasks[0]?.id ?? null;

        setRankedOrderIds(rankedIds);
        setSelected(firstPriorityTaskId);

        if (data.recommended_next_task?.id) {
          setRecommendReason(data.recommended_next_task.reason ?? null);
        } else {
          setRecommendReason(null);
        }
      } catch {
        setSelected(activeTasks[0]?.id ?? null);
        setRecommendReason(null);
        setRankedOrderIds([]);
      }
    }
    fetchRecommendedTask();
    return () => controller.abort();
  }, [apiBaseUrl, iCalReport, tasks]);

  function handleStart() {
    const task = tasks.find(t => t.id === selected);
    if (task) { setCurrentTask(task); navigate("/flow"); }
  }

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 flex justify-center" style={{ zIndex: 101 }}>
        <div className="w-full max-w-sm mx-auto rounded-t-3xl" style={{ background: "#0A1628", border: "1px solid rgba(0,232,122,0.2)", borderBottom: "none", maxHeight: "75vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="p-5 pb-3 flex-shrink-0">
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 18 }}>🐸</span>
              <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>Chọn task để bắt đầu</h3>
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: FONT }}>Chọn task khó nhất trước tiên</p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-3" style={{ scrollbarWidth: "none" }}>
            {sortedTodayTasks.map(task => {
              const display = getTaskDisplay(task);
              return (
              <div key={task.id} onClick={() => setSelected(task.id)}
                className="flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200"
                style={{
                  background: selected === task.id ? "rgba(0,232,122,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === task.id ? "rgba(0,232,122,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}>
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: selected === task.id ? "rgba(0,232,122,0.25)" : "rgba(255,255,255,0.07)", border: `1.5px solid ${selected === task.id ? "#00E87A" : "rgba(255,255,255,0.15)"}` }}>
                  {selected === task.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#00E87A" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: selected === task.id ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: FONT, fontWeight: 500 }} className="truncate">{display.title}</p>
                  {display.parentNote && (
                    <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, fontFamily: FONT, marginTop: 1 }} className="truncate">
                      {display.parentNote}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: task.quadrant === 1 ? "rgba(0,232,122,0.12)" : task.quadrant === 2 ? "rgba(77,166,255,0.12)" : task.quadrant === 3 ? "rgba(255,165,0,0.12)" : "rgba(255,77,109,0.12)", color: task.quadrant === 1 ? "#00E87A" : task.quadrant === 2 ? "#4DA6FF" : task.quadrant === 3 ? "#FFA500" : "#FF4D6D", fontFamily: FONT }}>
                      {task.quadrant === 1 ? "Ưu tiên 1" : task.quadrant === 2 ? "Ưu tiên 2" : task.quadrant === 3 ? "Ưu tiên 3" : "Ưu tiên 4"}
                    </span>
                    {task.deadline && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>{task.deadline}</span>}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={handleStart} disabled={!selected}
              className="w-full py-3.5 rounded-2xl transition-all duration-200"
              style={{ background: selected ? "linear-gradient(135deg,rgba(0,232,122,0.22),rgba(0,180,90,0.15))" : "rgba(255,255,255,0.04)", border: `1px solid ${selected ? "rgba(0,232,122,0.45)" : "rgba(255,255,255,0.08)"}`, color: selected ? "#00E87A" : "rgba(255,255,255,0.25)", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
              Bắt đầu làm việc ⚡
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Modal: Nghỉ ngơi / Ngày nghỉ ─────────────────────────────────────────────
function RestConfirmModal({ onClose }: { onClose: () => void }) {
  const { tasks } = useApp();
  const navigate = useNavigate();
  const unfinished = tasks.filter(t => !t.done);
  const urgent = unfinished.filter(t => t.quadrant === 1);

  function handleConfirm() { navigate("/"); onClose(); }

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed bottom-0 left-0 right-0 flex justify-center" style={{ zIndex: 101 }}>
        <div className="w-full max-w-sm mx-auto rounded-t-3xl" style={{ background: "#0A1628", border: "1px solid rgba(255,77,109,0.2)", borderBottom: "none", maxHeight: "72vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="p-5 pb-3 flex-shrink-0">
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 18 }}>⚠️</span>
              <h3 style={{ color: "#FF8FA3", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>Xác nhận nghỉ ngơi</h3>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: FONT }}>Bạn vẫn còn {unfinished.length} task chưa hoàn thành hôm nay</p>
          </div>

          {urgent.length > 0 && (
            <div className="mx-5 mb-3 p-3 rounded-xl flex-shrink-0" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)" }}>
              <p style={{ color: "#FF4D6D", fontSize: 11, fontWeight: 600, fontFamily: FONT, marginBottom: 6 }}>🚨 Task khẩn cấp chưa làm:</p>
              {urgent.map(t => (
                <div key={t.id} className="flex items-center justify-between mb-1.5">
                  <span style={{ color: "rgba(255,143,163,0.85)", fontSize: 12, fontFamily: FONT }}>{t.name}</span>
                  {t.deadline && <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,77,109,0.15)", color: "#FF8FA3", fontFamily: FONT }}>{t.deadline}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 pb-3">
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: FONT, marginBottom: 8 }}>Các task còn lại:</p>
            {unfinished.filter(t => t.quadrant !== 1).map(task => (
              <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl mb-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: FONT }}>{task.name}</span>
                {task.deadline && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>{task.deadline}</span>}
              </div>
            ))}
          </div>

          <div className="p-4 flex gap-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: FONT }}>
              Quay lại
            </button>
            <button onClick={handleConfirm} className="flex-1 py-3 rounded-2xl"
              style={{ background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.35)", color: "#FF8FA3", fontSize: 14, fontWeight: 600, fontFamily: FONT }}>
              Xác nhận nghỉ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export function HomeScreen() {
  const { tasks, sleepData, iCalUploaded, setICalUploaded, smartwatchConnected, setSmartWatchConnected } = useApp();
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [isUploadingIcal, setIsUploadingIcal] = useState(false);
  const [uploadedIcalName, setUploadedIcalName] = useState("");
  const [iCalReport, setIcalReport] = useState<ICalReport | null>(null);
  const [now, setNow] = useState(() => new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalToday = tasks.length;
  const urgentCount = tasks.filter(t => t.quadrant === 1 && !t.done).length;
  const debtHours = sleepData.debtHours;
  const energy = getEnergyLevel(debtHours);
  const napSuggestion = buildNapSuggestion(iCalReport, debtHours, iCalUploaded, isUploadingIcal, now);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);

  function openIcalPicker() {
    if (!isUploadingIcal) {
      fileInputRef.current?.click();
    }
  }

  async function handleIcalFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingIcal(true);
      setICalUploaded(false);
      setIcalReport(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiBaseUrl}/upload-ics/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối backend.");
      }

      const data = await response.json();
      if (data?.status !== "success") {
        throw new Error(data?.message || "Phân tích lịch thất bại.");
      }

      setUploadedIcalName(file.name);
      setIcalReport(data?.report ?? null);
      setICalUploaded(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload file thất bại.";
      alert(message);
      setIcalReport(null);
      setICalUploaded(false);
    } finally {
      setIsUploadingIcal(false);
      event.target.value = "";
    }
  }

  return (
    <div className="min-h-full px-4 pt-6 pb-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ color: "#4DA6FF", fontSize: 11, letterSpacing: 2, fontFamily: FONT, marginBottom: 2 }}>SMART DEADLINE MANAGEMENT</p>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, fontFamily: FONT }}>
            Trang chủ
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: FONT, marginTop: 2 }}>
            {todayLabel}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
          style={{ background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00E87A", animation: "blink-dot 2s ease-in-out infinite" }} />
          <span style={{ color: "#00E87A", fontSize: 10, fontFamily: FONT, letterSpacing: 0.5 }}>HOẠT ĐỘNG</span>
        </div>
      </div>

      {/* iCalendar Upload */}
      <div className="rounded-2xl p-4" style={glass("rgba(77,166,255,0.15)")}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics,text/calendar"
          onChange={handleIcalFileChange}
          style={{ display: "none" }}
        />
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: "rgba(77,166,255,0.7)", fontSize: 10, letterSpacing: 2, fontFamily: FONT }}>LỊCH LÀM VIỆC</p>
          {iCalUploaded && (
            <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: "rgba(0,232,122,0.1)", border: "1px solid rgba(0,232,122,0.3)", color: "#00E87A", fontFamily: FONT }}>
              ✓ Đã tải lên
            </span>
          )}
        </div>
        <button onClick={openIcalPicker}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all duration-200"
          style={{
            background: iCalUploaded ? "rgba(0,232,122,0.06)" : "rgba(77,166,255,0.06)",
            border: `1px solid ${iCalUploaded ? "rgba(0,232,122,0.25)" : "rgba(77,166,255,0.25)"}`,
            opacity: isUploadingIcal ? 0.75 : 1,
          }}>
          
          <div className="text-left">
            <p style={{ color: iCalUploaded ? "#00E87A" : "#4DA6FF", fontSize: 13, fontWeight: 600, fontFamily: FONT }}>
              {isUploadingIcal ? "Đang tải file iCalendar..." : iCalUploaded ? uploadedIcalName || "Đã tải file .ics" : "Tải lên file iCalendar"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>
              {isUploadingIcal ? "Đang gửi dữ liệu tới backend" : iCalUploaded ? "Phân tích hoàn tất" : "Nhấn để chọn file .ics"}
            </p>
          </div>
        </button>
      </div>

      {/* Sleep Sync */}
      <div className="rounded-2xl p-4" style={glass("rgba(255,77,109,0.12)")}>
        {/* Section header with pen/edit icon */}
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: "rgba(255,143,163,0.7)", fontSize: 10, letterSpacing: 2, fontFamily: FONT }}>DỮ LIỆU GIẤC NGỦ</p>
          <button onClick={() => setShowSleepModal(true)}
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{ width: 32, height: 32, background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.22)", boxShadow: "0 0 10px rgba(255,77,109,0.15)" }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M 10.5 2 L 13 4.5 L 5 12.5 L 2 13 L 2.5 10 Z" stroke="#FF8FA3" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M 9 3.5 L 11.5 6" stroke="#FF8FA3" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Smartwatch toggle */}
        <button onClick={() => setSmartWatchConnected(!smartwatchConnected)}
          className="flex items-center gap-2 w-full py-2.5 px-3 rounded-xl transition-all duration-200 mb-3"
          style={{
            background: smartwatchConnected ? "rgba(0,232,122,0.08)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${smartwatchConnected ? "rgba(0,232,122,0.3)" : "rgba(255,255,255,0.1)"}`,
          }}>
          {/* Smartwatch SVG icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <rect x="6" y="4" width="8" height="12" rx="2.5" stroke={smartwatchConnected ? "#00E87A" : "rgba(255,255,255,0.35)"} strokeWidth="1" fill="none"/>
            <rect x="8" y="2" width="4" height="2.5" rx="0.5" fill={smartwatchConnected ? "rgba(0,232,122,0.4)" : "rgba(255,255,255,0.12)"}/>
            <rect x="8" y="15.5" width="4" height="2.5" rx="0.5" fill={smartwatchConnected ? "rgba(0,232,122,0.4)" : "rgba(255,255,255,0.12)"}/>
            <circle cx="10" cy="10" r="2.5" fill={smartwatchConnected ? "rgba(0,232,122,0.25)" : "rgba(255,255,255,0.06)"} stroke={smartwatchConnected ? "rgba(0,232,122,0.6)" : "rgba(255,255,255,0.2)"} strokeWidth="0.75"/>
            <circle cx="10" cy="10" r="1" fill={smartwatchConnected ? "#00E87A" : "rgba(255,255,255,0.2)"}/>
          </svg>
          <div className="text-left">
            <p style={{ color: smartwatchConnected ? "#00E87A" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, fontFamily: FONT }}>
              {smartwatchConnected ? "Smartwatch đã kết nối" : "Đồng bộ Smartwatch"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT }}>
              {smartwatchConnected ? "Tự động đồng bộ" : "Nhấn để kết nối"}
            </p>
          </div>
        </button>

        {/* Thematic Sleep / Wake cards */}
        <div className="flex gap-3">
          {/* Ngủ lúc — Night sky */}
          <div className="flex-1 relative overflow-hidden rounded-xl" style={{
            background: "linear-gradient(155deg, #03061A 0%, #07052A 55%, #110628 100%)",
            border: "1px solid rgba(140,80,255,0.28)",
            minHeight: 90,
          }}>
            {/* Moon crescent */}
            <svg className="absolute" style={{ right: 6, top: 6, opacity: 0.18 }} width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path d="M 22 6 Q 13 10 13 19 Q 13 28 22 32 Q 9 33 7 21 Q 5 10 16 6 Z" fill="#C8A0FF"/>
            </svg>
            {/* Stardust */}
            {[{x:"12%",y:8},{x:"22%",y:22},{x:"55%",y:10},{x:"68%",y:30},{x:"38%",y:50},{x:"80%",y:18},{x:"45%",y:68}].map((s,i) => (
              <div key={i} className="absolute rounded-full" style={{ left: s.x, top: s.y, width: i%3===0?2:1.5, height: i%3===0?2:1.5, background: `rgba(200,160,255,${i%2===0?0.55:0.35})` }}/>
            ))}
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 3 }}>
              <p style={{ color: "rgba(190,145,255,0.55)", fontSize: 9, letterSpacing: 2, fontFamily: FONT }}>NGỦ LÚC</p>
              <p style={{ color: "#EAD8FF", fontSize: 22, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>{sleepData.sleepTime}</p>
            </div>
          </div>

          {/* Thức lúc — Sunrise */}
          <div className="flex-1 relative overflow-hidden rounded-xl" style={{
            background: "linear-gradient(155deg, #130904 0%, #2A1208 55%, #3C1E08 100%)",
            border: "1px solid rgba(255,160,50,0.22)",
            minHeight: 90,
          }}>
            {/* Sun glow orb */}
            <div className="absolute" style={{
              right: -12, top: -12,
              width: 64, height: 64,
              background: "radial-gradient(circle, rgba(255,195,60,0.38) 0%, rgba(255,140,30,0.16) 45%, transparent 70%)",
              borderRadius: "50%",
            }}/>
            {/* Sun rays */}
            <svg className="absolute" style={{ right: -4, top: -4, opacity: 0.18 }} width="52" height="52" viewBox="0 0 52 52" fill="none">
              {Array.from({length: 8}).map((_,i) => (
                <line key={i} x1="26" y1="26"
                  x2={26 + Math.cos(i * Math.PI / 4) * 23}
                  y2={26 + Math.sin(i * Math.PI / 4) * 23}
                  stroke="#FFB830" strokeWidth="1.2" strokeLinecap="round"/>
              ))}
              <circle cx="26" cy="26" r="8" fill="rgba(255,195,60,0.45)"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 3 }}>
              <p style={{ color: "rgba(255,175,80,0.55)", fontSize: 9, letterSpacing: 2, fontFamily: FONT }}>THỨC LÚC</p>
              <p style={{ color: "#FFD89A", fontSize: 22, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>{sleepData.wakeTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Card */}
      <div className="rounded-2xl p-4" style={glass()}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 2, fontFamily: FONT, marginBottom: 12 }}>TỔNG QUAN HÔM NAY</p>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCell label="Tổng số task" value={`${totalToday}`} sub="task hôm nay" color="#4DA6FF" />
          <StatCell label="Task khẩn cấp" value={`${urgentCount}`} sub="cần làm ngay" color="#FF4D6D" alert={urgentCount > 0} />
          <StatCell label="Năng lượng" value={energy.label} sub={`Nợ ngủ: ${debtHours}h - ${energy.sub}`} color={energy.color} small={energy.label.length > 5} />
          <StatCell label="Gợi ý giờ ngủ bù" value={napSuggestion.value} sub={napSuggestion.sub} color="#00E87A" small />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pb-2">
        <button onClick={() => setShowStartModal(true)}
          className="w-full py-4 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #012D16 0%, #014A24 50%, #013D1D 100%)",
            border: "1px solid rgba(0,232,122,0.45)",
            boxShadow: "0 0 24px rgba(0,232,122,0.18), 0 0 48px rgba(0,200,100,0.08)",
            animation: "breatheAura 2.8s ease-in-out infinite",
          }}>
          {/* Shimmer sweep */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(0,232,122,0.35),transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }} />
          <div className="relative flex items-center justify-center gap-3">
            {/* Sleek play/execute geometric symbol */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="rgba(0,232,122,0.55)" strokeWidth="1" fill="rgba(0,232,122,0.08)"/>
              <path d="M 8.5 7 L 14 10 L 8.5 13 Z" fill="#00E87A" opacity="0.9"/>
            </svg>
            <div>
              <p style={{ color: "#00E87A", fontSize: 15, fontWeight: 700, fontFamily: FONT }}>Bắt đầu làm việc</p>
              <p style={{ color: "rgba(0,232,122,0.5)", fontSize: 10, letterSpacing: 1, fontFamily: FONT }}>CHỌN TASK & VÀO FLOW</p>
            </div>
          </div>
        </button>
        <button onClick={() => setShowRestModal(true)}
          className="w-full py-3.5 rounded-2xl"
          style={{ background: "rgba(77,166,255,0.06)", border: "1px solid rgba(77,166,255,0.22)" }}>
          <div className="flex items-center justify-center gap-2">
            {/* Moon SVG icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M 11 3 Q 5 5 5 9 Q 5 14 11 15 Q 4 16 3 10 Q 2 5 8 3 Z" fill="#4DA6FF" opacity="0.7"/>
              <circle cx="13" cy="5" r="0.8" fill="rgba(77,166,255,0.5)"/>
              <circle cx="14.5" cy="8" r="0.5" fill="rgba(77,166,255,0.35)"/>
            </svg>
            <div>
              <p style={{ color: "#4DA6FF", fontSize: 14, fontWeight: 600, fontFamily: FONT }}>Nghỉ ngơi / Ngày nghỉ</p>
              <p style={{ color: "rgba(77,166,255,0.45)", fontSize: 10, letterSpacing: 1, fontFamily: FONT }}>CHẾ ĐỘ PHỤC HỒI</p>
            </div>
          </div>
        </button>
      </div>

      {/* Modals */}
      {showSleepModal && <SleepModal onClose={() => setShowSleepModal(false)} />}
      {showStartModal && <StartWorkModal onClose={() => setShowStartModal(false)} iCalReport={iCalReport} />}
      {showRestModal && <RestConfirmModal onClose={() => setShowRestModal(false)} />}
    </div>
  );
}

function StatCell({ label, value, sub, color, alert, small }: { label: string; value: string; sub: string; color: string; alert?: boolean; small?: boolean }) {
  return (
    <div className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}${alert ? "35" : "18"}`, animation: alert ? "pulse-pink 3s ease-in-out infinite" : "none" }}>
      <p style={{ color: `${color}80`, fontSize: 10, fontFamily: FONT, marginBottom: 4 }}>{label}</p>
      <p style={{ color, fontSize: small ? 12 : 22, fontWeight: 700, fontFamily: FONT, lineHeight: 1.1 }}>{value}</p>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: FONT, marginTop: 2 }}>{sub}</p>
    </div>
  );
}
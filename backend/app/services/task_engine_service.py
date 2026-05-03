from __future__ import annotations

import datetime
import math
from dataclasses import dataclass
from typing import Any

BUFFER_RATIO = 0.10
PANIC_THRESHOLD_HOURS = 24
DEFAULT_TASK_DURATION = 1.0
IMPORTANCE_WEIGHT = 10


@dataclass
class EngineTask:
    id: str
    name: str
    deadline: datetime.datetime | None
    importance: int
    difficulty: int
    remaining_hours: float
    source_deadline: str | None = None

    def calculate_priority(self, now: datetime.datetime, panic_threshold: float = 24.0) -> float:
        if self.deadline is None:
            urgency_score = 1.0
            return urgency_score + (self.importance * IMPORTANCE_WEIGHT)

        time_left = (self.deadline - now).total_seconds() / 3600
        if time_left <= 0:
            return 999999

        if time_left > panic_threshold:
            urgency_score = 100 / time_left
        else:
            urgency_score = (100 / time_left) * math.pow(
                2, (panic_threshold - time_left)
            )
        return urgency_score + (self.importance * IMPORTANCE_WEIGHT)

    def suggest_quadrant(self, now: datetime.datetime, panic_threshold: float = 24.0) -> int:
        if self.deadline is None:
            return 2 if self.importance >= 6 else 4

        time_left = (self.deadline - now).total_seconds() / 3600
        urgent = time_left <= panic_threshold
        important = self.importance >= 6
        if urgent and important:
            return 1
        if important:
            return 2
        if urgent:
            return 3
        return 4

    def build_reason(self, now: datetime.datetime, score: float, quadrant: int, panic_threshold: float = 24.0) -> str:
        if self.deadline is None:
            return (
                f"Không có deadline; giữ trọng số quan trọng {self.importance}/10, "
                f"điểm ưu tiên {round(score, 2)}."
            )

        time_left = (self.deadline - now).total_seconds() / 3600
        if time_left <= 0:
            return "Task đã quá hạn nên được đẩy lên ưu tiên cao nhất."

        urgency_msg = ""
        if time_left <= panic_threshold and panic_threshold > 24.0:
            urgency_msg = f" (Được đẩy lên khẩn cấp do là task gần nhất)"

        return (
            f"Còn khoảng {round(time_left, 1)}h tới hạn{urgency_msg}, "
            f"importance {self.importance}/10, quadrant Q{quadrant}."
        )


def _parse_deadline(deadline_text: str | None) -> datetime.datetime | None:
    if not deadline_text:
        return None

    cleaned = deadline_text.strip()
    patterns = (
        "%H:%M %d/%m/%Y",
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d",
    )
    for pattern in patterns:
        try:
            parsed = datetime.datetime.strptime(cleaned, pattern)
            if pattern in ("%d/%m/%Y", "%Y-%m-%d"):
                return parsed.replace(hour=23, minute=59)
            return parsed
        except ValueError:
            continue
    return None


def _duration_to_hours(duration: str | float | int | None) -> float:
    if duration is None:
        return DEFAULT_TASK_DURATION

    if isinstance(duration, (int, float)):
        return max(float(duration), 0.25)

    value = duration.strip()
    if not value:
        return DEFAULT_TASK_DURATION

    if ":" in value:
        hour_text, minute_text = value.split(":", 1)
        try:
            hours = int(hour_text)
            minutes = int(minute_text)
            total = hours + (minutes / 60)
            return max(total, 0.25)
        except ValueError:
            return DEFAULT_TASK_DURATION

    try:
        return max(float(value), 0.25)
    except ValueError:
        return DEFAULT_TASK_DURATION


def build_engine_tasks(raw_tasks: list[Any]) -> list[EngineTask]:
    tasks: list[EngineTask] = []
    for item in raw_tasks:
        total_duration = _duration_to_hours(getattr(item, "total_duration", None))
        if total_duration == DEFAULT_TASK_DURATION and getattr(item, "subtasks", None):
            total_duration = max(float(len(item.subtasks)), DEFAULT_TASK_DURATION)

        tasks.append(
            EngineTask(
                id=item.id,
                name=item.name,
                deadline=_parse_deadline(item.deadline),
                importance=item.importance,
                difficulty=item.difficulty,
                remaining_hours=total_duration,
                source_deadline=item.deadline,
            )
        )
    return tasks


def _get_dynamic_panic_threshold(tasks: list[EngineTask], now: datetime.datetime) -> float:
    min_time_left = None
    for t in tasks:
        if t.deadline:
            tl = (t.deadline - now).total_seconds() / 3600
            if tl > 0:
                if min_time_left is None or tl < min_time_left:
                    min_time_left = tl

    if min_time_left is None or min_time_left <= 24.0:
        return 24.0

    return float(math.ceil(min_time_left / 24.0) * 24.0)

def score_tasks(raw_tasks: list[Any]) -> dict[str, Any]:
    now = datetime.datetime.now()
    tasks = build_engine_tasks(raw_tasks)
    
    panic_threshold = _get_dynamic_panic_threshold(tasks, now)

    ordered = sorted(
        tasks,
        key=lambda t: (t.difficulty, t.calculate_priority(now, panic_threshold)),
        reverse=True,
    )

    scored_tasks: list[dict[str, Any]] = []
    for idx, task in enumerate(ordered):
        score = task.calculate_priority(now, panic_threshold)
        quadrant = task.suggest_quadrant(now, panic_threshold)
        scored_tasks.append(
            {
                "id": task.id,
                "name": task.name,
                "deadline": task.source_deadline,
                "importance": task.importance,
                "difficulty": task.difficulty,
                "score": round(score, 2),
                "quadrant": quadrant,
                "priority_rank": idx + 1,
                "reason": task.build_reason(now, score, quadrant, panic_threshold),
            }
        )

    return {
        "scored_tasks": scored_tasks,
        "recommended_next_task": scored_tasks[0] if scored_tasks else None,
    }


def normalize_daily_slots(daily_slots: list[Any] | None) -> list[dict[str, Any]]:
    if not daily_slots:
        return []

    normalized: list[dict[str, Any]] = []
    for day in daily_slots:
        date = getattr(day, "date", None)
        slots = getattr(day, "slots", None) or []
        numeric_slots: list[float] = []
        for slot in slots:
            try:
                value = float(slot)
            except (TypeError, ValueError):
                continue
            if value > 0:
                numeric_slots.append(value)
        if date and numeric_slots:
            normalized.append({"date": date, "slots": numeric_slots})
    return normalized


def plan_eat_that_frog(raw_tasks: list[Any], daily_slots: list[Any] | None) -> dict[str, Any]:
    now = datetime.datetime.now()
    tasks = build_engine_tasks(raw_tasks)
    schedule: dict[str, list[dict[str, Any]]] = {}
    normalized_slots = normalize_daily_slots(daily_slots)

    for day_data in normalized_slots:
        date = day_data["date"]
        schedule[date] = []

        for slot_capacity in day_data["slots"]:
            actual_capacity = slot_capacity * (1 - BUFFER_RATIO)
            while actual_capacity > 0.05:
                panic_threshold = _get_dynamic_panic_threshold(tasks, now)
                tasks.sort(
                    key=lambda t: (t.difficulty, t.calculate_priority(now, panic_threshold)),
                    reverse=True,
                )
                active_tasks = [task for task in tasks if task.remaining_hours > 0]
                if not active_tasks:
                    break

                current_task = active_tasks[0]
                work_session = min(current_task.remaining_hours, actual_capacity)
                priority_value = current_task.calculate_priority(now, panic_threshold)
                quadrant = current_task.suggest_quadrant(now, panic_threshold)
                schedule[date].append(
                    {
                        "task_id": current_task.id,
                        "task_name": current_task.name,
                        "duration_hours": round(work_session, 2),
                        "break_hours": round(work_session * BUFFER_RATIO, 2),
                        "priority_score": round(priority_value, 2),
                        "quadrant": quadrant,
                        "reason": current_task.build_reason(
                            now, priority_value, quadrant, panic_threshold
                        ),
                    }
                )
                current_task.remaining_hours -= work_session
                actual_capacity -= work_session

    ranked = score_tasks(raw_tasks)
    return {
        "plan_by_day": schedule,
        "recommended_next_task": ranked.get("recommended_next_task"),
        "ranked_tasks": ranked.get("scored_tasks", []),
    }

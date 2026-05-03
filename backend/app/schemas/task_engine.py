from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class TaskEngineInput(BaseModel):
    id: str = Field(..., description="ID task từ frontend")
    name: str = Field(..., min_length=1)
    deadline: str | None = Field(
        default=None, description="Hỗ trợ DD/MM/YYYY, HH:MM DD/MM/YYYY, ISO"
    )
    importance: int = Field(..., ge=1, le=10)
    difficulty: int = Field(..., ge=1, le=10)
    total_duration: str | float | int | None = Field(default=None)
    subtasks: list[str] = Field(default_factory=list)


class ScoredTask(BaseModel):
    id: str
    name: str
    deadline: str | None = None
    importance: int
    difficulty: int
    score: float
    quadrant: Literal[1, 2, 3, 4]
    priority_rank: int
    reason: str


class EisenhowerScoreRequest(BaseModel):
    tasks: list[TaskEngineInput] = Field(default_factory=list)


class EisenhowerScoreResponse(BaseModel):
    scored_tasks: list[ScoredTask]
    recommended_next_task: ScoredTask | None = None


class DailySlotInput(BaseModel):
    date: str = Field(..., description="YYYY-MM-DD hoặc DD/MM/YYYY")
    slots: list[float] = Field(default_factory=list, description="Danh sách giờ rảnh")


class EatFrogPlanRequest(BaseModel):
    tasks: list[TaskEngineInput] = Field(default_factory=list)
    daily_slots: list[DailySlotInput] = Field(default_factory=list)


class PlannedSession(BaseModel):
    task_id: str
    task_name: str
    duration_hours: float
    break_hours: float
    priority_score: float
    quadrant: Literal[1, 2, 3, 4]
    reason: str


class EatFrogPlanResponse(BaseModel):
    plan_by_day: dict[str, list[PlannedSession]]
    recommended_next_task: ScoredTask | None = None
    ranked_tasks: list[ScoredTask]


class AIPromptRequest(BaseModel):
    text: str = Field(..., description="Chuỗi JSON do AI trả về mà người dùng dán vào")


class AIPromptTaskResponse(BaseModel):
    name: str = Field(..., description="Tên nhiệm vụ")
    type: Literal["simple", "complex", "longterm"] = Field(
        ..., description="Loại nhiệm vụ"
    )
    priority: int = Field(
        default=2, description="Độ ưu tiên từ 1 đến 4", ge=1, le=4
    )
    difficulty: int = Field(
        default=2, description="Độ khó từ 1 đến 3", ge=1, le=3
    )
    deadline: str | None = Field(
        default=None, description="Deadline định dạng DD/MM/YYYY HH:MM hoặc null"
    )
    subtasks: list[str] = Field(
        default_factory=list, description="Danh sách các subtask"
    )
    estimated_study_time: str | None = Field(
        default=None,
        description="Thời gian dự kiến học định dạng HH:MM cho loại longterm",
    )

import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.task_engine import (
    EatFrogPlanRequest,
    EatFrogPlanResponse,
    EisenhowerScoreRequest,
    EisenhowerScoreResponse,
    AIPromptRequest,
    AIPromptTaskResponse,
)
from app.services.ical_service import analyze_all_free_time
from app.services.task_engine_service import plan_eat_that_frog, score_tasks
from app.services.gemini_service import analyze_pasted_task_json


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload-ics/")
async def upload_ics(file: UploadFile = File(...)):
    content = await file.read()
    ics_string = content.decode("utf-8")
    result = analyze_all_free_time(ics_string)

    if result.get("error"):
        return {"status": "error", "message": result["error"]}

    report = result["report"]
    total_days = len(report)
    return {
        "status": "success",
        "message": f"Đã phân tích xong {total_days} ngày.",
        "report": report,
    }


@app.post("/tasks/eisenhower-score", response_model=EisenhowerScoreResponse)
async def eisenhower_score(payload: EisenhowerScoreRequest):
    return score_tasks(payload.tasks)


@app.post("/tasks/eat-frog-plan", response_model=EatFrogPlanResponse)
async def eat_frog_plan(payload: EatFrogPlanRequest):
    return plan_eat_that_frog(payload.tasks, payload.daily_slots)


@app.post("/tasks/analyze-ai-prompt", response_model=AIPromptTaskResponse)
async def analyze_ai_prompt(payload: AIPromptRequest):
    return analyze_pasted_task_json(payload.text)

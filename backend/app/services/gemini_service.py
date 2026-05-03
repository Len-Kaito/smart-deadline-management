import os
from google import genai
from pydantic import BaseModel
from app.schemas.task_engine import AIPromptTaskResponse

def analyze_pasted_task_json(pasted_text: str) -> AIPromptTaskResponse:
    # Initialize the client. It will pick up GEMINI_API_KEY from environment
    client = genai.Client()
    
    # We use gemini-2.5-flash as the latest standard model
    # The user didn't specify 2.0 or 2.5 explicitly for code, but 2.5 is usually current. Let's stick to gemini-2.5-flash
    model_id = "gemini-2.5-flash"
    
    prompt = f"""
    Bạn là một trợ lý phân tích dữ liệu.
    Người dùng sẽ cung cấp một đoạn văn bản (thường là JSON) chứa thông tin của một nhiệm vụ.
    Nhiệm vụ của bạn là trích xuất thông tin đó và trả về đúng định dạng JSON yêu cầu.
    Nếu thiếu thông tin, hãy tự suy luận một cách hợp lý (ví dụ thiếu độ khó thì cho mặc định là 2, ưu tiên là 2).
    
    Dữ liệu người dùng cung cấp:
    {pasted_text}
    """
    
    response = client.models.generate_content(
        model=model_id,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": AIPromptTaskResponse,
            "temperature": 0.1,
        },
    )
    
    if not response.text:
        raise ValueError("Empty response from Gemini")
        
    return AIPromptTaskResponse.model_validate_json(response.text)

import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# Set Gemini API key
GEMINI_API_KEY = "AIzaSyBvY2E5iSzi9M_O8GB6fgxmb3Dy9gvREKo"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Define the input schema
class LLMRequest(BaseModel):
    prompt: str
    max_tokens: int = 50
    temperature: float = 0.7  # Default temperature value
    model: str = "gemini-pro"  # Default Gemini model

# Define the API endpoint
@app.post("/ask")
async def ask_llm(request: LLMRequest):
    print("\n--- Request Received ---")
    print(f"Prompt: {request.prompt}")
    print(f"Max Tokens: {request.max_tokens}")
    print(f"Temperature: {request.temperature}")
    print(f"Model: {request.model}")

    try:
        # Call Gemini API
        model = genai.GenerativeModel(request.model)
        response = model.generate_content(
            request.prompt,
            generation_config={
                "temperature": request.temperature,
                "max_output_tokens": request.max_tokens,
            }
        )
        
        # Extract the response text
        answer = response.text.strip()
        print("Generated Answer:", answer)

        return {"answer": answer}

    except Exception as e:
        print("\n!!! Error During Generation !!!")
        print(e)
        return {"error": "Error during generation"}

# Main entry point for the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

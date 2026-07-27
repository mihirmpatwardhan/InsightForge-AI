import os, time, requests
from pathlib import Path
from dotenv import load_dotenv
from google import genai as google_genai

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)


class MultiLLM:
    def __init__(self):
        raw_keys = os.getenv("GEMINI_API_KEYS", "")
        self.gemini_keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        self.current_index = 0
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    def gemini_key_count(self): return len(self.gemini_keys)
    def openrouter_loaded(self): return bool(self.openrouter_key)

    def use_openrouter(self, prompt: str):
        if not self.openrouter_key:
            return None
        try:
            r = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.openrouter_key}", "Content-Type": "application/json", "X-Title": "InsightForge AI"},
                json={"model": "anthropic/claude-3-haiku", "messages": [{"role": "user", "content": prompt}]},
                timeout=40
            )
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print("OpenRouter failed:", e)
        return None

    def use_gemini(self, prompt: str):
        if not self.gemini_keys: return None
        for _ in range(len(self.gemini_keys)):
            key = self.gemini_keys[self.current_index]
            for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
                try:
                    client = google_genai.Client(api_key=key)
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text:
                        return response.text.strip()
                except Exception as e:
                    print(f"Gemini {model_name} failed:", e)
            self.current_index = (self.current_index + 1) % len(self.gemini_keys)
            time.sleep(0.3)
        return None

    def generate(self, prompt: str) -> str:
        result = self.use_openrouter(prompt)
        if result: return result
        result = self.use_gemini(prompt)
        if result: return result
        return "⚠️ All AI models unavailable. Please check your API keys in .env"

    def get_status(self):
        return {"gemini_loaded": len(self.gemini_keys), "openrouter_loaded": bool(self.openrouter_key)}


llm = MultiLLM()

def generate_ai_text(prompt: str) -> str:
    return llm.generate(prompt)

def get_key_status():
    return llm.get_status()

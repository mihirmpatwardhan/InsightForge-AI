import os
import time
import requests
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(dotenv_path=".env", override=True)


class MultiLLM:
    def __init__(self):
        raw_keys = os.getenv("GEMINI_API_KEYS", "")
        self.gemini_keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        self.current_index = 0
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    def gemini_key_count(self):
        return len(self.gemini_keys)

    def openrouter_loaded(self):
        return bool(self.openrouter_key)

    def use_openrouter(self, prompt: str):
        if not self.openrouter_key:
            return None

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:8501",
                    "X-Title": "InsightForge AI"
                },
                json={
                    "model": "anthropic/claude-3-haiku",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=40
            )

            if response.status_code != 200:
                print("OpenRouter status:", response.status_code, response.text)
                return None

            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

        except Exception as e:
            print("OpenRouter failed:", str(e))
            return None

    def use_gemini(self, prompt: str):
        if not self.gemini_keys:
            return None

        last_error = None
        models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"]

        for _ in range(len(self.gemini_keys)):
            current_key = self.gemini_keys[self.current_index]
            for model_name in models_to_try:
                try:
                    genai.configure(api_key=current_key)
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)

                    try:
                        if response and response.text:
                            return response.text.strip()
                    except ValueError:
                        # Safety block or candidate issue
                        if response and hasattr(response, "candidates") and response.candidates:
                            parts = response.candidates[0].content.parts
                            text_parts = [p.text for p in parts if hasattr(p, "text")]
                            if text_parts:
                                return "\n".join(text_parts).strip()

                except Exception as e:
                    last_error = str(e)
                    continue

            self.current_index = (self.current_index + 1) % len(self.gemini_keys)
            time.sleep(0.5)

        print("Gemini failed:", last_error)
        return None

    def generate(self, prompt: str):
        result = self.use_openrouter(prompt)
        if result:
            return result

        result = self.use_gemini(prompt)
        if result:
            return result

        return (
            "⚠️ **AI Key Notice**: No active Gemini or OpenRouter API key found or the requests timed out.\n\n"
            "To enable full AI reporting, recommendations, and conversational data chat, please add your `GEMINI_API_KEYS` "
            "or `OPENROUTER_API_KEY` to the `.env` configuration file."
        )

    def get_status(self):
        return {
            "gemini_loaded": len(self.gemini_keys),
            "openrouter_loaded": bool(self.openrouter_key)
        }


llm = MultiLLM()


def generate_ai_text(prompt: str):
    return llm.generate(prompt)


def get_key_status():
    return llm.get_status()
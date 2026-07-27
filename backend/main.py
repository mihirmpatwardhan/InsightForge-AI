import io
import json
import base64
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from llm_handler import get_key_status
from ai_engine import (
    generate_report,
    generate_recommendations,
    generate_chat_response,
    generate_chart_explanation,
    generate_meeting_summary,
    generate_code,
    generate_schema_insights,
    generate_dataset_comparison,
)
from export_gen import create_docx_bytes, create_pdf_bytes, create_pptx_bytes
from predictive import linear_forecast, detect_anomalies

from database import engine, Base
from routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NexusViz AI Backend",
    description="Enterprise AI Data Intelligence API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

# ── Request Models ──

class ProfileRequest(BaseModel):
    file_name: str
    profile: dict
    chart_context: str = ""


class ChatRequest(BaseModel):
    file_name: str
    profile: dict
    chart_context: str = ""
    user_question: str
    history: List[dict] = []


class ChartExplainRequest(BaseModel):
    chart_type: str
    x_col: str
    y_col: str
    agg_func: str
    data_summary: dict


class CodeGenRequest(BaseModel):
    analysis_type: str
    x_col: str
    y_col: str
    agg_func: str
    dataset_name: str
    language: str  # pandas | sql | dax | plotly


class ForecastRequest(BaseModel):
    values: List[float]
    periods: int = 30


class AnomalyRequest(BaseModel):
    values: List[float]
    threshold_sigma: float = 2.5


class CompareRequest(BaseModel):
    profile_old: dict
    profile_new: dict
    name_old: str
    name_new: str


class SchemaRequest(BaseModel):
    profile: dict
    file_name: str


class ExportRequest(BaseModel):
    title: str
    content: str
    dataset_name: str = "Dataset"
    format: str  # pdf | docx | pptx


# ── Health & Status ──

@app.get("/api/status")
def status():
    key_info = get_key_status()
    return {
        "status": "running",
        "version": "2.0.0",
        "ai_keys": key_info,
    }


# ── AI Report Endpoints ──

@app.post("/api/report")
def api_report(req: ProfileRequest):
    try:
        result = generate_report(req.file_name, req.profile, req.chart_context)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/recommendations")
def api_recommendations(req: ProfileRequest):
    try:
        result = generate_recommendations(req.file_name, req.profile, req.chart_context)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
def api_chat(req: ChatRequest):
    try:
        result = generate_chat_response(req.file_name, req.profile, req.chart_context, req.user_question, req.history)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain-chart")
def api_explain_chart(req: ChartExplainRequest):
    try:
        result = generate_chart_explanation(req.chart_type, req.x_col, req.y_col, req.agg_func, req.data_summary)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/schema-insights")
def api_schema(req: SchemaRequest):
    try:
        result = generate_schema_insights(req.profile, req.file_name)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/compare-datasets")
def api_compare(req: CompareRequest):
    try:
        result = generate_dataset_comparison(req.profile_old, req.profile_new, req.name_old, req.name_new)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-code")
def api_generate_code(req: CodeGenRequest):
    try:
        result = generate_code(req.analysis_type, req.x_col, req.y_col, req.agg_func, req.dataset_name, req.language)
        return {"code": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Meeting Summary ──

@app.post("/api/meeting-summary")
async def api_meeting_summary(file: UploadFile = File(None), text: str = Form(None)):
    try:
        doc_text = ""
        if file:
            content = await file.read()
            filename = file.filename.lower()
            if filename.endswith(".txt"):
                doc_text = content.decode("utf-8", errors="ignore")
            elif filename.endswith(".pdf"):
                try:
                    import PyPDF2
                    reader = PyPDF2.PdfReader(io.BytesIO(content))
                    doc_text = "\n".join(page.extract_text() or "" for page in reader.pages)
                except Exception:
                    doc_text = content.decode("utf-8", errors="ignore")
            else:
                doc_text = content.decode("utf-8", errors="ignore")
        elif text:
            doc_text = text

        if not doc_text.strip():
            raise HTTPException(status_code=400, detail="No document content provided")

        result = generate_meeting_summary(doc_text)
        return {"text": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Predictive Analytics ──

@app.post("/api/predict")
def api_predict(req: ForecastRequest):
    try:
        result = linear_forecast(req.values, req.periods)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/detect-anomalies")
def api_anomalies(req: AnomalyRequest):
    try:
        result = detect_anomalies(req.values, req.threshold_sigma)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Export Hub ──

@app.post("/api/export")
def api_export(req: ExportRequest):
    try:
        fmt = req.format.lower()
        if fmt == "pdf":
            data = create_pdf_bytes(req.title, req.content)
            return Response(content=data, media_type="application/pdf",
                            headers={"Content-Disposition": "attachment; filename=NexusViz_Report.pdf"})
        elif fmt == "docx":
            data = create_docx_bytes(req.title, req.content)
            return Response(content=data, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            headers={"Content-Disposition": "attachment; filename=NexusViz_Report.docx"})
        elif fmt == "pptx":
            data = create_pptx_bytes(req.title, req.content, req.dataset_name)
            return Response(content=data, media_type="application/vnd.openxmlformats-presentationml.presentation",
                            headers={"Content-Disposition": "attachment; filename=NexusViz_Presentation.pptx"})
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {fmt}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

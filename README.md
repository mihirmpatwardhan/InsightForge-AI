<div align="center">
  <img src="frontend/public/favicon.svg" alt="InsightForge AI Logo" width="100"/>
  <h1>InsightForge AI</h1>
  <p><strong>Enterprise-Grade Automated Data Intelligence & Predictive Analytics Platform</strong></p>
  <p>
    Built to bridge the gap between raw data and actionable executive insights using modern statistical profiling and Generative AI.
  </p>
</div>

---

## 🚀 Overview

**InsightForge AI** is a full-stack, enterprise-ready data intelligence platform that automatically ingests raw datasets (CSV/Excel), performs deep statistical profiling, and uses advanced Generative AI to generate McKinsey-style business strategy reports, predictive models, and custom interactive dashboards.

Designed for performance and data privacy, all raw data is parsed locally in the browser. Only aggregated metadata is sent to the backend, ensuring maximum compliance and security for enterprise applications.

## ✨ Key Features

- **📊 Interactive Visual Analytics**  
  Automatically generates 19+ chart types (Bar, Line, Heatmap, 3D Scatter) using Plotly.js. Features full interactivity, resizing controls, and customizable dashboards.
- **🤖 Executive AI Strategy Reports**  
  Integrates with Google Gemini 2.0 AI to convert statistical data profiles into comprehensive business strategy reports, complete with risk assessments and actionable recommendations.
- **🔮 Predictive Forecasting**  
  Built-in Linear Regression models with 80% confidence interval bands and Z-score anomaly detection algorithms to identify outliers and forecast trends.
- **💬 Conversational Data Assistant**  
  Natural language interface allowing users to ask complex questions about their datasets and receive immediate statistical insights.
- **🧬 Schema & Data Drift Detection**  
  Automatically profiles columns, detects foreign keys, identifies missing values, and compares dataset versions to monitor overall data health and schema drift.
- **👩‍💻 Automated Code Generation**  
  Engineers and Data Scientists can instantly generate equivalent Pandas, SQL, DAX, and Plotly.js code to replicate the platform's insights in their production environments.
- **📤 Enterprise Export Hub**  
  Generate board-ready reports with one-click exports to PDF and DOCX.

## 🛠️ Technology Architecture

InsightForge AI is built on a highly scalable and modern technology stack:

### Frontend
- **React 19 & Vite**: Ultra-fast single-page application rendering and state management.
- **Plotly.js**: High-performance, interactive multi-axis charting engine.
- **Framer Motion**: Smooth micro-interactions and UI transitions.
- **PapaParse & SheetJS (XLSX)**: Client-side local data parsing to ensure zero raw-data leakage.

### Backend
- **FastAPI (Python 3.12)**: Asynchronous, highly performant RESTful API architecture.
- **Google GenAI SDK (Gemini 2.0)**: Multi-LLM intelligence pipeline.
- **Scikit-Learn & Numpy**: Advanced statistical processing and predictive modeling.
- **Bcrypt & PyJWT**: Secure user authentication and stateless session management.

## 🔒 Security & Privacy First

InsightForge AI is architected with enterprise security in mind:
1. **Local Parsing**: Large files are processed directly in the user's browser.
2. **Zero Raw-Data Transfer**: Only statistical aggregates (min/max/mean, column types) are transmitted to the API and AI engines.
3. **Stateless Auth**: JWT-based stateless authentication ensures secure API access.

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.12+
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mihirmpatwardhan/InsightForge-AI.git
   cd InsightForge-AI
   ```

2. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Create a .env file and add your Gemini API Key
   echo "GEMINI_API_KEY=your_api_key_here" > .env

   # Start the FastAPI server
   uvicorn main:app --reload --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Start the Vite development server
   npm run dev
   ```

4. **Open Application**
   Navigate to `http://localhost:5173` in your browser.

## 👨‍💻 Developer

**Mihir Patwardhan**  
A passionate software engineer focused on building scalable AI applications and modern user interfaces. 

---
*Built for enterprise performance. Forged with intelligence.*

import json
import re
from llm_handler import generate_ai_text


def generate_report(file_name: str, profile: dict, chart_context: str) -> str:
    prompt = f"""You are a senior data scientist and business analyst at a Fortune 500 company.

Analyze this dataset and write a comprehensive, structured executive business report.

Dataset: {file_name}
Profile: {json.dumps(profile, indent=2, default=str)}
Chart Context: {chart_context}

Structure your report EXACTLY as follows with these section headers:

# Executive Summary
# Key Business Insights
# Trends and Patterns
# Risks and Anomalies
# Strategic Recommendations
# Data Quality Assessment
# Final Conclusion

Rules:
- Use plain business English, no jargon
- Be specific and actionable
- Use bullet points for lists (- item)
- Bold key metrics using **bold**
- Do not include code
- Minimum 400 words"""
    return generate_ai_text(prompt)


def generate_recommendations(file_name: str, profile: dict, chart_context: str) -> str:
    prompt = f"""You are a senior business strategy consultant at McKinsey.

Generate 8-10 highly specific, actionable business recommendations for this dataset.

Dataset: {file_name}
Profile: {json.dumps(profile, indent=2, default=str)}
Chart Context: {chart_context}

Format each recommendation as:
## Recommendation N: [Short Title]
**Why**: [The specific data evidence behind this recommendation]
**Action**: [Specific, concrete action to take]
**Expected Impact**: [Quantified expected outcome if possible]

Rules:
- Base every recommendation on actual data patterns
- Be specific, not generic
- Focus on business value and ROI"""
    return generate_ai_text(prompt)


def generate_chat_response(file_name: str, profile: dict, chart_context: str, user_question: str, history: list = None) -> str:
    history_text = ""
    if history:
        for msg in history[-6:]:  # last 6 messages for context
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_text += f"\n{role}: {msg.get('content', '')}"

    prompt = f"""You are NexusViz AI — an intelligent, conversational data analytics assistant.

Dataset: {file_name}
Profile: {json.dumps(profile, indent=2, default=str)}
Current Chart: {chart_context}

Conversation history:{history_text}

Current Question: {user_question}

Instructions:
- Answer based specifically on the dataset context
- Use **bold** for key numbers and metrics
- Use bullet points where helpful
- If you cannot compute exact figures from profile data, be transparent about it
- Keep response concise but comprehensive
- Suggest follow-up actions where relevant"""
    return generate_ai_text(prompt)


def generate_chart_explanation(chart_type: str, x_col: str, y_col: str, agg_func: str, data_summary: dict) -> str:
    prompt = f"""You are a data visualization expert explaining charts to a business executive.

Explain this chart in simple business language:

Chart Type: {chart_type}
X-Axis: {x_col}
Y-Axis: {y_col}
Aggregation: {agg_func}
Data Summary: {json.dumps(data_summary, indent=2, default=str)}

Provide:
## What This Chart Shows
[1-2 sentences explaining the chart type and what it visualizes]

## Key Patterns
[3-4 bullet points of the most important patterns visible]

## Business Meaning
[What does this mean for the business? What action should be taken?]

## Suggested Next Steps
[What other analysis would complement this chart?]

Keep it under 300 words. Use bold for key insights."""
    return generate_ai_text(prompt)


def generate_meeting_summary(document_text: str) -> str:
    prompt = f"""You are an executive assistant at a top consulting firm.

Create a structured meeting summary from the following document/notes:

---
{document_text[:8000]}
---

Format your response as:

# Meeting Summary

## Date & Participants
[Extract if available, otherwise note "Not specified"]

## Key Discussion Points
[Bullet points of main topics discussed]

## Decisions Made
[List all decisions agreed upon]

## Action Items
[List each action item with responsible person if mentioned]

## Next Steps & Follow-ups
[What needs to happen next]

Rules:
- Be concise and structured
- Use **bold** for names and key decisions
- Use bullet points throughout"""
    return generate_ai_text(prompt)


def generate_code(analysis_type: str, x_col: str, y_col: str, agg_func: str, dataset_name: str, language: str) -> str:
    prompts = {
        "pandas": f"""Generate production-ready Python Pandas code for:
Dataset variable: df
X column: '{x_col}'
Y column: '{y_col}'
Aggregation: {agg_func}
Chart type: {analysis_type}

Include:
1. The groupby/aggregation code
2. Plotly Express visualization
3. Export to CSV

Use clean, commented code.""",

        "sql": f"""Generate a SQL query for:
Table: {dataset_name.replace(' ', '_').lower()}
X column: {x_col}
Y column: {y_col}
Aggregation: {agg_func.upper()}

Include comments and handle NULLs properly.""",

        "dax": f"""Generate Power BI DAX formula for:
Measure: {agg_func.upper()} of {y_col}
Grouped by: {x_col}
Table: {dataset_name}

Include the full DAX measure and explanation.""",

        "plotly": f"""Generate complete Python Plotly code for:
Chart: {analysis_type}
X: '{x_col}'
Y: '{y_col}'
Aggregation: {agg_func}

Include dark theme styling and export to HTML.""",
    }

    prompt = prompts.get(language.lower(), prompts["pandas"])
    return generate_ai_text(prompt)


def generate_schema_insights(profile: dict, file_name: str) -> str:
    prompt = f"""You are a database architect analyzing a dataset schema.

Dataset: {file_name}
Schema Profile: {json.dumps(profile, indent=2, default=str)}

Analyze and provide:

## Detected Column Roles
[Categorize each column: ID/Key, Metric, Dimension, Date, Flag/Boolean]

## Potential Relationships
[Identify likely foreign key relationships, hierarchies (e.g., Country > Region > City)]

## Data Type Issues
[Flag any columns with wrong types, e.g., dates stored as strings, IDs stored as floats]

## Recommended Data Model
[Suggest star/snowflake schema structure if applicable]

## Missing Important Columns
[What columns would improve this dataset?]

Be specific and technical."""
    return generate_ai_text(prompt)


def generate_dataset_comparison(profile_old: dict, profile_new: dict, name_old: str, name_new: str) -> str:
    prompt = f"""You are a data quality engineer comparing two versions of a dataset.

Old Dataset ({name_old}):
{json.dumps(profile_old, indent=2, default=str)}

New Dataset ({name_new}):
{json.dumps(profile_new, indent=2, default=str)}

Provide:

## Row Count Change
[How many rows added/removed and % change]

## Column Changes
[New columns, removed columns, renamed columns]

## Data Quality Changes
[Missing value changes per column, duplicate changes]

## Statistical Changes
[Mean/median shifts in numeric columns > 5%]

## Data Drift Risks
[Flag any suspicious changes that could indicate data pipeline issues]

## Recommendation
[Is the new dataset safe to use in production?]

Use **bold** for important numbers."""
    return generate_ai_text(prompt)

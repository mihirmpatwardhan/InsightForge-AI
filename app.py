import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
import pandas as pd

from file_handler import load_uploaded_files, merge_dataframes
from data_processor import (
    basic_clean_dataframe,
    get_column_types,
    dataset_profile,
    grouped_aggregation,
    auto_chart_suggestions,
    clean_missing_values,
    calculate_data_health
)
from report_generator import (
    generate_full_report,
    generate_recommendations,
    generate_chat_response
)
from export_generator import create_docx_bytes, create_pdf_bytes
from ui_helper import app_header, sidebar_inputs
from llm_handler import get_key_status


# ── Color Palettes ──
COLOR_PALETTES = {
    "Indigo Glow": ["#6366f1", "#8b5cf6", "#ec4899", "#38bdf8", "#34d399", "#f59e0b"],
    "Cyberpunk Pink": ["#ec4899", "#f43f5e", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"],
    "Emerald Neon": ["#10b981", "#34d399", "#06b6d4", "#6366f1", "#f59e0b", "#a855f7"],
    "Sunset Amber": ["#f59e0b", "#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"],
    "Ocean Blue": ["#38bdf8", "#0284c7", "#6366f1", "#14b8a6", "#8b5cf6", "#ec4899"],
}


def build_layout(palette_name="Indigo Glow"):
    colors = COLOR_PALETTES.get(palette_name, COLOR_PALETTES["Indigo Glow"])
    return dict(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(13,17,23,0.8)",
        font=dict(family="DM Sans, sans-serif", color="#94a3b8"),
        title_font=dict(family="Syne, sans-serif", size=18, color="#e2e8f0"),
        margin=dict(l=20, r=20, t=50, b=20),
        colorway=colors,
        xaxis=dict(gridcolor="rgba(99,102,241,0.1)", linecolor="rgba(99,102,241,0.2)"),
        yaxis=dict(gridcolor="rgba(99,102,241,0.1)", linecolor="rgba(99,102,241,0.2)"),
    )


def apply_layout(fig, palette_name="Indigo Glow"):
    fig.update_layout(**build_layout(palette_name))
    return fig


# ── Init Page Header ──
app_header()
selected_chart_type, selected_agg, analysis_mode, selected_color_theme = sidebar_inputs()

# ── Sidebar AI Key Status ──
key_status = get_key_status()
st.sidebar.markdown("### 🔑 AI Service Status")
gemini_count = key_status["gemini_loaded"]
openrouter_ok = key_status["openrouter_loaded"]

st.sidebar.markdown(
    f'<div class="key-badge">✓ Gemini Keys ({gemini_count})</div>',
    unsafe_allow_html=True
)
st.sidebar.markdown(
    f'<div class="key-badge {"" if openrouter_ok else "inactive"}">{"✓" if openrouter_ok else "✗"} OpenRouter {"Connected" if openrouter_ok else "Not loaded"}</div>',
    unsafe_allow_html=True
)

# ── File Upload Section ──
st.markdown("### 📂 Upload Your Dataset")
uploaded_files = st.file_uploader(
    "Drag & drop CSV or Excel files here — multi-file and multi-sheet supported",
    type=["csv", "xlsx", "xls"],
    accept_multiple_files=True
)

# ── Session State Initialization ──
if "report_text" not in st.session_state:
    st.session_state.report_text = ""
if "recommendation_text" not in st.session_state:
    st.session_state.recommendation_text = ""
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "cleaned_datasets" not in st.session_state:
    st.session_state.cleaned_datasets = {}

# ── Main Application Workflow ──
if uploaded_files:
    raw_dfs = load_uploaded_files(uploaded_files)

    if not raw_dfs:
        st.error("⚠️ No valid files were loaded. Please check file format.")
        st.stop()

    # Apply initial cleaning if not already cached
    for name, df in raw_dfs.items():
        if name not in st.session_state.cleaned_datasets:
            st.session_state.cleaned_datasets[name] = basic_clean_dataframe(df)

    cleaned_dfs = st.session_state.cleaned_datasets

    if analysis_mode == "Merge Files" and len(cleaned_dfs) > 1:
        active_df, merge_msg = merge_dataframes(cleaned_dfs)
        st.info(f"🔗 {merge_msg}")
        current_name = "Merged Dataset"
    else:
        file_names = list(cleaned_dfs.keys())
        current_name = st.selectbox("📄 Select file to analyze", file_names)
        active_df = cleaned_dfs[current_name]

    if active_df.empty:
        st.warning("⚠️ Selected dataset is empty.")
        st.stop()

    types = get_column_types(active_df)
    profile = dataset_profile(active_df)
    health = profile.get("health", calculate_data_health(active_df))

    # ── Metric Cards & Data Health Row ──
    st.markdown("---")
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("🗂 Rows", f"{profile['rows']:,}")
    c2.metric("📋 Columns", profile["columns"])
    c3.metric("🔢 Numeric", len(profile["numeric_columns"]))
    c4.metric("🏷 Categorical", len(profile["categorical_columns"]))

    health_color = "#34d399" if health["score"] >= 80 else "#f59e0b" if health["score"] >= 60 else "#f87171"
    c5.markdown(f"""
    <div style="
        background: linear-gradient(135deg, #0f172a, #1a2035);
        border: 1px solid rgba(99,102,241,0.25);
        border-radius: 14px;
        padding: 0.9rem 1.1rem;
        text-align: center;
    ">
        <div style="font-size:0.68rem;font-weight:600;letter-spacing:1.5px;color:#818cf8;text-transform:uppercase;">Data Health</div>
        <div style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:{health_color};margin-top:2px;">
            {health['score']}<span style="font-size:1rem;color:#94a3b8;">/100</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("---")

    # ── Interactive Filter & Cleaning Expander ──
    with st.expander("🛠️ Interactive Data Filters & Cleaning Tools"):
        f_col1, f_col2, f_col3 = st.columns(3)

        with f_col1:
            st.markdown("##### 🧹 Quick Cleaning")
            if st.button("Drop Duplicate Rows", key="btn_drop_dups"):
                prev_rows = len(st.session_state.cleaned_datasets[current_name])
                st.session_state.cleaned_datasets[current_name] = st.session_state.cleaned_datasets[current_name].drop_duplicates()
                new_rows = len(st.session_state.cleaned_datasets[current_name])
                st.success(f"Removed {prev_rows - new_rows} duplicate rows.")
                st.rerun()

            if st.button("Fill Numeric Missing (Mean)", key="btn_fill_mean"):
                st.session_state.cleaned_datasets[current_name] = clean_missing_values(
                    st.session_state.cleaned_datasets[current_name], strategy="fill_numeric_mean"
                )
                st.success("Numeric missing values filled with column means.")
                st.rerun()

        with f_col2:
            st.markdown("##### 🔍 Search Rows")
            search_query = st.text_input("Filter rows by keyword", key="search_query")
            if search_query:
                mask = active_df.astype(str).apply(lambda row: row.str.contains(search_query, case=False).any(), axis=1)
                active_df = active_df[mask]
                st.caption(f"Filtered to {len(active_df)} matching rows.")

        with f_col3:
            st.markdown("##### 🔄 Reset Data")
            if st.button("Reset Dataset to Original", key="btn_reset_df"):
                st.session_state.cleaned_datasets[current_name] = basic_clean_dataframe(raw_dfs[current_name])
                st.success("Dataset reset to original upload state.")
                st.rerun()

    # ── Navigation Tabs ──
    tab1, tab2, tab3, tab4 = st.tabs([
        "  🗃  Overview  ",
        "  📊  Charts & Plots  ",
        "  🤖  AI Intelligence Report  ",
        "  💬  Chat with Data  "
    ])

    # ══════════════════════ TAB 1 — OVERVIEW ══════════════════════
    with tab1:
        st.subheader("Dataset Preview & Structure")
        st.dataframe(active_df.head(100), use_container_width=True)

        col_a, col_b = st.columns(2)

        with col_a:
            with st.expander("🔍 Column Types & Missingness Summary"):
                dtype_df = active_df.dtypes.rename("Type").reset_index()
                dtype_df.columns = ["Column", "Type"]
                missing = active_df.isnull().sum().values
                dtype_df["Missing Count"] = missing
                dtype_df["Missing %"] = (missing / len(active_df) * 100).round(1)
                st.dataframe(dtype_df, use_container_width=True)

        with col_b:
            with st.expander("📐 Descriptive Statistics"):
                try:
                    num_desc = active_df.describe(include="all").T
                    st.dataframe(num_desc.astype(str), use_container_width=True)
                except Exception:
                    st.info("Descriptive summary unavailable for current dataset slice.")

        with st.expander("💡 AI-Friendly Visualization Suggestions"):
            suggestions = auto_chart_suggestions(active_df)
            if suggestions:
                for s in suggestions:
                    st.markdown(f"<span style='color:#a5b4fc;'>▸</span> {s}", unsafe_allow_html=True)
            else:
                st.write("No specific chart suggestions found.")

    # ══════════════════════ TAB 2 — CHARTS ══════════════════════
    with tab2:
        st.subheader("Customizable Visualizations")

        numeric_cols = types["numeric"]
        cat_cols = types["categorical"]
        all_cols = active_df.columns.tolist()

        col_x, col_y, col_c = st.columns(3)
        with col_x:
            x_col = st.selectbox("X-axis (Category / Dimension)", ["None"] + all_cols, key="x_col")
        with col_y:
            y_col = st.selectbox("Y-axis (Metric / Value)", ["None"] + numeric_cols + [c for c in all_cols if c not in numeric_cols], key="y_col")
        with col_c:
            color_col = st.selectbox("Color / Group Series", ["None"] + all_cols, key="color_col")

        chart_context = (
            f"Chart Type: {selected_chart_type}, X: {x_col}, Y: {y_col}, Color: {color_col}, Aggregation: {selected_agg}"
        )
        fig = None

        try:
            # ── Bar / Line / Area Charts with Multi-Column Grouping ──
            if selected_chart_type in ["Bar", "Line", "Area"]:
                if x_col != "None" and y_col != "None":
                    plot_df = active_df.copy()

                    # Perform aggregation if y is numeric
                    if y_col in numeric_cols:
                        group_target = [x_col]
                        if color_col != "None" and color_col != x_col:
                            group_target.append(color_col)
                        plot_df = grouped_aggregation(plot_df, group_target, y_col, selected_agg)

                    kw = dict(
                        x=x_col, y=y_col,
                        color=None if color_col == "None" else color_col,
                        template="plotly_dark"
                    )

                    if selected_chart_type == "Bar":
                        fig = px.bar(plot_df, **kw, title=f"Bar Chart: {y_col} by {x_col} ({selected_agg.upper()})", barmode="group")
                    elif selected_chart_type == "Line":
                        fig = px.line(plot_df, **kw, title=f"Line Chart: {y_col} over {x_col}", markers=True)
                    elif selected_chart_type == "Area":
                        fig = px.area(plot_df, **kw, title=f"Area Chart: {y_col} by {x_col}")

            # ── Pie / Donut Charts with Top-N Capping ──
            elif selected_chart_type in ["Pie", "Donut"]:
                if x_col != "None":
                    counts = active_df[x_col].astype(str).value_counts().reset_index()
                    counts.columns = [x_col, "Count"]

                    # Cap at top 10 categories to avoid clutter
                    if len(counts) > 10:
                        top_10 = counts.iloc[:10].copy()
                        other_count = counts.iloc[10:]["Count"].sum()
                        other_df = pd.DataFrame([{x_col: "Other Categories", "Count": other_count}])
                        counts = pd.concat([top_10, other_df], ignore_index=True)

                    fig = px.pie(
                        counts, names=x_col, values="Count",
                        title=f"{selected_chart_type} Chart: Distribution of {x_col}",
                        template="plotly_dark",
                        hole=0.45 if selected_chart_type == "Donut" else 0
                    )

            # ── Scatter Plot with Optional Trendline ──
            elif selected_chart_type == "Scatter":
                if x_col != "None" and y_col != "None":
                    fig = px.scatter(
                        active_df, x=x_col, y=y_col,
                        color=None if color_col == "None" else color_col,
                        title=f"Scatter Plot: {y_col} vs {x_col}",
                        template="plotly_dark",
                        hover_data=active_df.columns[:4]
                    )

            # ── Histogram ──
            elif selected_chart_type == "Histogram":
                target_col = x_col if x_col != "None" else (y_col if y_col != "None" else None)
                if target_col:
                    fig = px.histogram(
                        active_df, x=target_col,
                        color=None if color_col == "None" else color_col,
                        title=f"Histogram Distribution of {target_col}",
                        template="plotly_dark",
                        marginal="box"
                    )

            # ── Box Plot (Single variable or Grouped) ──
            elif selected_chart_type == "Box":
                target_y = y_col if y_col != "None" else (x_col if x_col != "None" and x_col in numeric_cols else None)
                target_x = x_col if x_col != "None" and x_col != target_y else None
                if target_y:
                    fig = px.box(
                        active_df, x=target_x, y=target_y,
                        color=None if color_col == "None" else color_col,
                        title=f"Box Plot of {target_y}" + (f" by {target_x}" if target_x else ""),
                        template="plotly_dark"
                    )

            # ── Heatmap Correlation Matrix ──
            elif selected_chart_type == "Heatmap":
                if len(numeric_cols) >= 2:
                    corr = active_df[numeric_cols].corr(numeric_only=True)
                    fig = go.Figure(data=go.Heatmap(
                        z=corr.values, x=corr.columns, y=corr.index,
                        text=corr.round(2).values, texttemplate="%{text}",
                        colorscale="Viridis"
                    ))
                    fig.update_layout(title="Correlation Heatmap Matrix", template="plotly_dark")
                else:
                    st.info("ℹ️ Heatmap requires at least 2 numeric columns in the dataset.")

            if fig is not None:
                fig = apply_layout(fig, palette_name=selected_color_theme)
                st.plotly_chart(fig, use_container_width=True)

                chart_html = fig.to_html(include_plotlyjs="cdn")
                st.download_button(
                    "⬇ Export Interactive Chart (HTML)",
                    data=chart_html,
                    file_name=f"{selected_chart_type.lower()}_chart.html",
                    mime="text/html"
                )
            else:
                st.info("ℹ️ Select suitable X and Y axes above to render the chart.")

        except Exception as e:
            st.error(f"Visualization notice: {e}")

    # ══════════════════════ TAB 3 — AI REPORT ══════════════════════
    with tab3:
        st.subheader("AI Executive Report & Recommendations")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### 📝 Comprehensive Business Report")
            if st.button("Generate Full AI Report", key="gen_report"):
                with st.spinner("Analyzing dataset & generating executive insights…"):
                    st.session_state.report_text = generate_full_report(
                        file_name=current_name,
                        profile=profile,
                        chart_context=chart_context
                    )

            if st.session_state.report_text:
                st.markdown(
                    f'<div class="report-box">',
                    unsafe_allow_html=True
                )
                st.markdown(st.session_state.report_text)
                st.markdown('</div>', unsafe_allow_html=True)

                st.markdown("")
                dl1, dl2 = st.columns(2)
                with dl1:
                    st.download_button(
                        "⬇ Download Word (DOCX)",
                        data=create_docx_bytes("InsightForge AI Executive Report", st.session_state.report_text),
                        file_name="InsightForge_AI_Report.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    )
                with dl2:
                    st.download_button(
                        "⬇ Download PDF Report",
                        data=create_pdf_bytes("InsightForge AI Executive Report", st.session_state.report_text),
                        file_name="InsightForge_AI_Report.pdf",
                        mime="application/pdf"
                    )

        with col2:
            st.markdown("#### 💡 Strategic Action Recommendations")
            if st.button("Generate AI Recommendations", key="gen_rec"):
                with st.spinner("Synthesizing strategic action points…"):
                    st.session_state.recommendation_text = generate_recommendations(
                        file_name=current_name,
                        profile=profile,
                        chart_context=chart_context
                    )

            if st.session_state.recommendation_text:
                st.markdown(
                    f'<div class="report-box">',
                    unsafe_allow_html=True
                )
                st.markdown(st.session_state.recommendation_text)
                st.markdown('</div>', unsafe_allow_html=True)

                st.markdown("")
                dl3, dl4 = st.columns(2)
                with dl3:
                    st.download_button(
                        "⬇ Download Word (DOCX)",
                        data=create_docx_bytes("InsightForge AI Recommendations", st.session_state.recommendation_text),
                        file_name="InsightForge_AI_Recommendations.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    )
                with dl4:
                    st.download_button(
                        "⬇ Download PDF Recommendations",
                        data=create_pdf_bytes("InsightForge AI Recommendations", st.session_state.recommendation_text),
                        file_name="InsightForge_AI_Recommendations.pdf",
                        mime="application/pdf"
                    )

        st.markdown("---")
        st.markdown("#### 📥 Export Cleaned Dataset")
        csv_data = active_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            "⬇ Download Processed CSV Dataset",
            data=csv_data,
            file_name=f"processed_{current_name.replace(' ', '_').lower()}.csv",
            mime="text/csv"
        )

    # ══════════════════════ TAB 4 — CHAT ══════════════════════
    with tab4:
        st.subheader("Interactive Conversational Data Chat")
        st.caption("Ask specific questions regarding performance, top categories, anomalies, correlations, or key trends.")

        # Suggested Prompt Chips
        st.markdown("##### 💡 Suggested Questions")
        chip_cols = st.columns(3)
        chip_selected = None
        with chip_cols[0]:
            if st.button("🔍 What are the top 3 insights?", key="chip1"):
                chip_selected = "What are the top 3 key business insights in this dataset?"
        with chip_cols[1]:
            if st.button("⚠️ Are there anomalies or outliers?", key="chip2"):
                chip_selected = "Are there any anomalies, extreme outliers, or data quality risks?"
        with chip_cols[2]:
            if st.button("📊 Which chart best represents this data?", key="chip3"):
                chip_selected = "Which visualization type best communicates the primary pattern in this dataset?"

        st.markdown("")
        chat_container = st.container()
        with chat_container:
            for msg in st.session_state.chat_history:
                with st.chat_message(msg["role"]):
                    st.markdown(msg["content"])

        user_question = st.chat_input("Ask a question about this dataset…") or chip_selected

        if user_question:
            st.session_state.chat_history.append({"role": "user", "content": user_question})
            with st.chat_message("user"):
                st.markdown(user_question)

            with st.chat_message("assistant"):
                with st.spinner("Analyzing dataset & formulating answer…"):
                    response = generate_chat_response(
                        file_name=current_name,
                        profile=profile,
                        chart_context=chart_context,
                        user_question=user_question
                    )
                    st.markdown(response)

            st.session_state.chat_history.append({"role": "assistant", "content": response})

        if st.session_state.chat_history:
            if st.button("🗑️ Clear Chat History", key="btn_clear_chat"):
                st.session_state.chat_history = []
                st.rerun()

else:
    st.markdown("""
    <div style='
        background: linear-gradient(135deg, #0d1322, #181b35);
        border: 2px dashed rgba(99,102,241,0.35);
        border-radius: 20px;
        padding: 4rem 2rem;
        text-align: center;
        margin-top: 1.5rem;
    '>
        <div style='font-size:3.5rem;margin-bottom:0.8rem;'>📂</div>
        <div style='font-family:Syne,sans-serif;font-size:1.5rem;font-weight:700;color:#e2e8f0;margin-bottom:0.5rem;'>
            No Dataset Uploaded Yet
        </div>
        <div style='color:#94a3b8;font-size:0.95rem;max-width:550px;margin:0 auto;'>
            Upload your <strong style="color:#a5b4fc">CSV</strong> or <strong style="color:#a5b4fc">Excel</strong> files in the uploader box above to launch instant visualization, interactive data cleaning, and AI intelligence reports.
        </div>
    </div>
    """, unsafe_allow_html=True)

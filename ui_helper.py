import streamlit as st


def app_header():
    st.set_page_config(
        page_title="InsightForge AI — Advanced Data Intelligence",
        layout="wide",
        page_icon="📊",
        initial_sidebar_state="expanded"
    )

    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    /* ── Base Reset & Typography ── */
    html, body, [class*="css"] {
        font-family: 'DM Sans', sans-serif;
    }

    /* ── App Background ── */
    .stApp {
        background: #060911;
        color: #e2e8f0;
    }

    /* ── Hide default Streamlit chrome ── */
    #MainMenu, footer, header { visibility: hidden; }
    .block-container {
        padding-top: 1.2rem;
        padding-bottom: 2.5rem;
        max-width: 1440px;
    }

    /* ── Hero Banner ── */
    .hero-banner {
        background: linear-gradient(135deg, #0d1322 0%, #1e1b4b 50%, #0d1322 100%);
        border: 1px solid rgba(99,102,241,0.3);
        border-radius: 20px;
        padding: 2.2rem 2.8rem;
        margin-bottom: 1.6rem;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .hero-banner::before {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 260px; height: 260px;
        background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
        border-radius: 50%;
    }
    .hero-banner::after {
        content: '';
        position: absolute;
        bottom: -50px; left: 15%;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%);
        border-radius: 50%;
    }
    .hero-title {
        font-family: 'Syne', sans-serif;
        font-size: 2.7rem;
        font-weight: 800;
        letter-spacing: -0.8px;
        background: linear-gradient(90deg, #a5b4fc 0%, #e879f9 50%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.3rem 0;
    }
    .hero-subtitle {
        font-size: 0.95rem;
        color: #94a3b8;
        font-weight: 300;
        letter-spacing: 0.3px;
        margin: 0;
    }
    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(99,102,241,0.15);
        border: 1px solid rgba(99,102,241,0.4);
        color: #a5b4fc;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 20px;
        margin-bottom: 0.8rem;
    }

    /* ── Sidebar ── */
    section[data-testid="stSidebar"] {
        background: #090d16 !important;
        border-right: 1px solid rgba(99,102,241,0.15);
    }
    section[data-testid="stSidebar"] .block-container {
        padding: 1.2rem 1rem;
    }
    .sidebar-logo {
        font-family: 'Syne', sans-serif;
        font-size: 1.35rem;
        font-weight: 800;
        background: linear-gradient(90deg, #a5b4fc, #e879f9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        padding: 0.4rem 0 0.8rem 0;
        border-bottom: 1px solid rgba(99,102,241,0.2);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .sidebar-section-label {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #64748b;
        margin: 1.2rem 0 0.4rem 0;
    }

    /* ── Metric Cards ── */
    div[data-testid="metric-container"] {
        background: linear-gradient(135deg, #0f172a, #131c31);
        border: 1px solid rgba(99,102,241,0.22);
        border-radius: 14px;
        padding: 1.1rem 1.3rem !important;
        transition: all 0.25s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    div[data-testid="metric-container"]:hover {
        border-color: rgba(99,102,241,0.55);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(99,102,241,0.15);
    }
    div[data-testid="metric-container"] [data-testid="stMetricLabel"] {
        font-size: 0.7rem !important;
        font-weight: 600 !important;
        letter-spacing: 1.5px !important;
        text-transform: uppercase !important;
        color: #818cf8 !important;
    }
    div[data-testid="metric-container"] [data-testid="stMetricValue"] {
        font-family: 'Syne', sans-serif !important;
        font-size: 1.9rem !important;
        font-weight: 800 !important;
        color: #f1f5f9 !important;
    }

    /* ── Health Score Badge Card ── */
    .health-card {
        background: linear-gradient(135deg, #0f172a, #1e1b4b);
        border: 1px solid rgba(99,102,241,0.3);
        border-radius: 14px;
        padding: 1rem 1.2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }
    .health-score {
        font-family: 'Syne', sans-serif;
        font-size: 1.8rem;
        font-weight: 800;
        color: #34d399;
    }
    .health-label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* ── Tabs Customization ── */
    .stTabs [data-baseweb="tab-list"] {
        background: #090d16;
        border-radius: 14px;
        padding: 5px;
        border: 1px solid rgba(99,102,241,0.2);
        gap: 6px;
    }
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        border-radius: 10px;
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 500;
        padding: 0.55rem 1.3rem;
        transition: all 0.2s ease;
    }
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #1e1b4b, #312e81) !important;
        color: #c7d2fe !important;
        font-weight: 600 !important;
        box-shadow: 0 4px 12px rgba(99,102,241,0.25);
    }
    .stTabs [data-baseweb="tab-highlight"], .stTabs [data-baseweb="tab-border"] {
        display: none;
    }

    /* ── DataFrames ── */
    .stDataFrame {
        border: 1px solid rgba(99,102,241,0.2) !important;
        border-radius: 12px !important;
        overflow: hidden;
    }
    .stDataFrame thead tr th {
        background: #161b2c !important;
        color: #a5b4fc !important;
        font-size: 0.78rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px !important;
        border-bottom: 1px solid rgba(99,102,241,0.3) !important;
    }

    /* ── Buttons ── */
    .stButton > button {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 10px !important;
        font-size: 0.85rem !important;
        font-weight: 600 !important;
        padding: 0.55rem 1.4rem !important;
        transition: all 0.2s ease !important;
        letter-spacing: 0.3px !important;
        box-shadow: 0 4px 15px rgba(99,102,241,0.35) !important;
    }
    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px rgba(99,102,241,0.5) !important;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }
    .stButton > button:active {
        transform: translateY(0) !important;
    }

    /* ── Download buttons ── */
    .stDownloadButton > button {
        background: rgba(99,102,241,0.12) !important;
        color: #a5b4fc !important;
        border: 1px solid rgba(99,102,241,0.35) !important;
        border-radius: 10px !important;
        font-size: 0.82rem !important;
        font-weight: 600 !important;
        padding: 0.5rem 1.2rem !important;
        transition: all 0.2s ease !important;
    }
    .stDownloadButton > button:hover {
        background: rgba(99,102,241,0.25) !important;
        border-color: rgba(99,102,241,0.7) !important;
        color: #ffffff !important;
    }

    /* ── Chat Messages ── */
    [data-testid="stChatMessage"] {
        background: #0d1322 !important;
        border: 1px solid rgba(99,102,241,0.2) !important;
        border-radius: 14px !important;
        margin-bottom: 0.7rem !important;
    }
    [data-testid="stChatInput"] textarea {
        background: #090d16 !important;
        border: 1px solid rgba(99,102,241,0.35) !important;
        border-radius: 12px !important;
        color: #f1f5f9 !important;
        font-size: 0.88rem !important;
    }
    [data-testid="stChatInput"] textarea:focus {
        border-color: rgba(99,102,241,0.7) !important;
        box-shadow: 0 0 0 2px rgba(99,102,241,0.2) !important;
    }

    /* ── Form Controls & Selectboxes ── */
    div[data-baseweb="select"] > div {
        background: #0f172a !important;
        border: 1px solid rgba(99,102,241,0.25) !important;
        border-radius: 10px !important;
        color: #f1f5f9 !important;
    }
    div[data-baseweb="select"] > div:hover {
        border-color: rgba(99,102,241,0.6) !important;
    }

    /* ── Key Status badges ── */
    .key-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(16,185,129,0.12);
        border: 1px solid rgba(16,185,129,0.35);
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 0.72rem;
        font-weight: 600;
        color: #34d399;
        margin-bottom: 5px;
    }
    .key-badge.inactive {
        background: rgba(239,68,68,0.1);
        border-color: rgba(239,68,68,0.3);
        color: #f87171;
    }

    /* ── Report Box Container ── */
    .report-box {
        background: #090f1d;
        border: 1px solid rgba(99,102,241,0.25);
        border-radius: 14px;
        padding: 1.4rem;
        font-size: 0.9rem;
        line-height: 1.7;
        color: #cbd5e1;
        max-height: 480px;
        overflow-y: auto;
    }

    /* ── Custom Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #090d16; }
    ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.7); }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="hero-banner">
        <div class="hero-badge">✦ AI-Powered Analytics & Intelligence</div>
        <div class="hero-title">📊 InsightForge AI</div>
        <p class="hero-subtitle">Instant visualization · Interactive data cleaning · AI reports & business recommendations</p>
    </div>
    """, unsafe_allow_html=True)


def sidebar_inputs():
    st.sidebar.markdown('<div class="sidebar-logo">⚡ InsightForge AI</div>', unsafe_allow_html=True)

    st.sidebar.markdown('<div class="sidebar-section-label">📈 Visualization</div>', unsafe_allow_html=True)
    chart_type = st.sidebar.selectbox(
        "Chart Type",
        ["Bar", "Line", "Pie", "Donut", "Scatter", "Histogram", "Box", "Heatmap", "Area"],
        key="sb_chart_type"
    )

    st.sidebar.markdown('<div class="sidebar-section-label">🔢 Aggregation</div>', unsafe_allow_html=True)
    agg_func = st.sidebar.selectbox(
        "Aggregation",
        ["sum", "mean", "median", "count", "min", "max"],
        key="sb_agg_func"
    )

    st.sidebar.markdown('<div class="sidebar-section-label">🎨 Color Palette</div>', unsafe_allow_html=True)
    color_theme = st.sidebar.selectbox(
        "Color Palette",
        ["Indigo Glow", "Cyberpunk Pink", "Emerald Neon", "Sunset Amber", "Ocean Blue"],
        key="sb_color_theme"
    )

    st.sidebar.markdown('<div class="sidebar-section-label">📂 File Analysis Mode</div>', unsafe_allow_html=True)
    mode = st.sidebar.radio(
        "File Mode",
        ["Analyze Separately", "Merge Files"],
        key="sb_file_mode"
    )

    st.sidebar.markdown("---")
    return chart_type, agg_func, mode, color_theme

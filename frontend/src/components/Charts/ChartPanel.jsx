import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useData } from '../../hooks/useData';
import { groupedAggregation, valueCounts } from '../../utils/dataParser';
import { generateChartExplanation } from '../../services/api';

// ── Chart type definitions ──
const CHART_TYPES = [
  { id: 'Bar',        icon: '▥', label: 'Bar' },
  { id: 'StackedBar', icon: '▦', label: 'Stacked Bar' },
  { id: 'Line',       icon: '◈', label: 'Line' },
  { id: 'Area',       icon: '◭', label: 'Area' },
  { id: 'Scatter',    icon: '◎', label: 'Scatter' },
  { id: 'Pie',        icon: '◔', label: 'Pie' },
  { id: 'Donut',      icon: '◉', label: 'Donut' },
  { id: 'Histogram',  icon: '▤', label: 'Histogram' },
  { id: 'Box',        icon: '▣', label: 'Box Plot' },
  { id: 'Violin',     icon: '◈', label: 'Violin' },
  { id: 'Heatmap',    icon: '▦', label: 'Heatmap' },
  { id: 'Treemap',    icon: '▧', label: 'Treemap' },
  { id: 'Sunburst',   icon: '◍', label: 'Sunburst' },
  { id: 'Funnel',     icon: '▽', label: 'Funnel' },
  { id: 'Waterfall',  icon: '▼', label: 'Waterfall' },
  { id: 'Bubble',     icon: '○', label: 'Bubble' },
  { id: 'Radar',      icon: '◇', label: 'Radar' },
  { id: 'Gauge',      icon: '◑', label: 'Gauge' },
  { id: 'Sankey',     icon: '≈', label: 'Sankey' },
];

// ── Color palettes ──
const PALETTES = {
  'Amber':   ['#d97706','#f59e0b','#fbbf24','#92400e','#78350f','#d4a017','#c2780c','#a16207'],
  'Blue':    ['#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#2563eb','#6366f1','#818cf8','#a5b4fc'],
  'Teal':    ['#14b8a6','#2dd4bf','#5eead4','#0f766e','#0d9488','#06b6d4','#67e8f9','#22d3ee'],
  'Rose':    ['#f43f5e','#fb7185','#fda4af','#be123c','#e11d48','#f97316','#fb923c','#fdba74'],
  'Mono':    ['#f5f5f5','#d4d4d4','#a3a3a3','#737373','#525252','#404040','#262626','#171717'],
  'Vivid':   ['#d97706','#3b82f6','#10b981','#ef4444','#8b5cf6','#f97316','#06b6d4','#ec4899'],
};

// ── Plotly base layout (dark, minimal) ──
const BASE_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor:  '#171717',
  font: {
    family: 'Inter, -apple-system, sans-serif',
    size: 12,
    color: '#a3a3a3',
  },
  title: {
    font: { family: 'Inter, sans-serif', size: 14, color: '#f5f5f5', weight: 600 },
    x: 0.02, xanchor: 'left',
  },
  margin: { l: 52, r: 24, t: 48, b: 52 },
  xaxis: {
    gridcolor: 'rgba(255,255,255,0.05)',
    linecolor: 'rgba(255,255,255,0.08)',
    tickfont: { color: '#737373', size: 11 },
    title: { font: { color: '#737373', size: 11 } },
    zeroline: false,
  },
  yaxis: {
    gridcolor: 'rgba(255,255,255,0.05)',
    linecolor: 'rgba(255,255,255,0.08)',
    tickfont: { color: '#737373', size: 11 },
    title: { font: { color: '#737373', size: 11 } },
    zeroline: false,
  },
  legend: {
    bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#a3a3a3', size: 11 },
    bordercolor: 'rgba(255,255,255,0.06)',
    borderwidth: 1,
  },
  hoverlabel: {
    bgcolor: '#222222',
    bordercolor: 'rgba(255,255,255,0.12)',
    font: { color: '#f5f5f5', family: 'Inter, sans-serif', size: 12 },
  },
  polar: {
    bgcolor: 'rgba(0,0,0,0)',
    radialaxis: { gridcolor: 'rgba(255,255,255,0.06)', tickfont: { color: '#737373' } },
    angularaxis: { gridcolor: 'rgba(255,255,255,0.06)', tickfont: { color: '#a3a3a3' } },
  },
};

const PLOTLY_CONFIG = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toImage'],
  modeBarStyle: { bgcolor: '#1c1c1c', color: '#a3a3a3' },
  toImageButtonOptions: { format: 'png', scale: 2 },
};

function renderMd(text) {
  if (!text) return '';
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}

export default function ChartPanel({ onPinChart }) {
  const { active } = useData();
  const plotRef = useRef(null);

  const [chartType, setChartType] = useState('Bar');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [colorCol, setColorCol] = useState('');
  const [aggFunc, setAggFunc] = useState('sum');
  const [palette, setPalette] = useState('Amber');
  const [showExplainer, setShowExplainer] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [renderError, setRenderError] = useState('');

  const data = active?.data || [];
  const cols = active?.columns || [];
  const colTypes = active?.columnTypes || {};
  const numCols = cols.filter((c) => colTypes[c] === 'numeric');
  const catCols = cols.filter((c) => colTypes[c] === 'categorical');
  const colors = PALETTES[palette] || PALETTES['Amber'];

  // Auto-select columns
  useEffect(() => {
    if (!active) return;
    setXCol(catCols[0] || '');
    setYCol(numCols[0] || '');
    setColorCol('');
  }, [active?.fileName]);

  // Re-render chart when settings change
  useEffect(() => {
    if (!plotRef.current || !active || data.length === 0) return;
    renderChart();
  }, [chartType, xCol, yCol, colorCol, aggFunc, palette, data.length]);

  function getTitle() {
    if (xCol && yCol) return `${yCol} by ${xCol}`;
    if (xCol) return xCol;
    return chartType;
  }

  function buildTraces() {
    const x = xCol || null;
    const y = yCol || null;
    const grpCol = colorCol || null;

    const needsAgg = x && y && numCols.includes(y);
    const groupCols = grpCol ? [x, grpCol] : x ? [x] : null;
    const aggData = needsAgg && groupCols ? groupedAggregation(data, groupCols, y, aggFunc) : data;

    switch (chartType) {
      case 'Bar':
      case 'StackedBar': {
        if (!x || !y) return null;
        if (grpCol && needsAgg) {
          const uniq = [...new Set(aggData.map((r) => String(r[grpCol] ?? '')))];
          return uniq.map((gv, i) => ({
            type: 'bar',
            name: gv,
            x: aggData.filter((r) => String(r[grpCol]) === gv).map((r) => r[x]),
            y: aggData.filter((r) => String(r[grpCol]) === gv).map((r) => r[y]),
            marker: { color: colors[i % colors.length] },
          }));
        }
        return [{ type: 'bar', x: aggData.map((r) => r[x]), y: aggData.map((r) => r[y]), marker: { color: colors[0] }, name: y }];
      }
      case 'Line': {
        if (!x || !y) return null;
        return [{ type: 'scatter', mode: 'lines+markers', x: aggData.map((r) => r[x]), y: aggData.map((r) => r[y]), line: { color: colors[0], width: 2 }, marker: { color: colors[0], size: 5 }, name: y }];
      }
      case 'Area': {
        if (!x || !y) return null;
        return [{ type: 'scatter', fill: 'tozeroy', mode: 'lines', x: aggData.map((r) => r[x]), y: aggData.map((r) => r[y]), fillcolor: `${colors[0]}28`, line: { color: colors[0], width: 2 }, name: y }];
      }
      case 'Scatter': {
        if (!x || !y) return null;
        return [{ type: 'scatter', mode: 'markers', x: data.map((r) => r[x]), y: data.map((r) => r[y]), marker: { color: colors[0], size: 7, opacity: 0.75 }, name: `${y} vs ${x}` }];
      }
      case 'Bubble': {
        if (!x || !y) return null;
        const sCol = numCols.find((c) => c !== x && c !== y) || y;
        const mx = Math.max(...data.map((r) => Number(r[sCol]) || 0)) || 1;
        return [{ type: 'scatter', mode: 'markers', x: data.map((r) => r[x]), y: data.map((r) => r[y]), marker: { size: data.map((r) => Math.max(4, (Number(r[sCol]) / mx) * 40)), color: colors[0], opacity: 0.65, sizemode: 'diameter' }, name: y }];
      }
      case 'Pie':
      case 'Donut': {
        if (!x) return null;
        const vc = valueCounts(data, x, 12);
        return [{ type: 'pie', labels: vc.map((c) => c.name), values: vc.map((c) => c.value), hole: chartType === 'Donut' ? 0.48 : 0, marker: { colors }, textinfo: 'percent+label', textfont: { color: '#f5f5f5', size: 11 } }];
      }
      case 'Histogram': {
        const col = x || y;
        if (!col) return null;
        return [{ type: 'histogram', x: data.map((r) => r[col]), marker: { color: colors[0] }, name: col, opacity: 0.85 }];
      }
      case 'Box': {
        if (!y) return null;
        if (x) {
          const uniq = [...new Set(data.map((r) => String(r[x] ?? '')))].slice(0, 20);
          return uniq.map((xv, i) => ({ type: 'box', name: xv, y: data.filter((r) => String(r[x]) === xv).map((r) => Number(r[y])), marker: { color: colors[i % colors.length] }, line: { color: colors[i % colors.length] } }));
        }
        return [{ type: 'box', y: data.map((r) => Number(r[y])), name: y, marker: { color: colors[0] } }];
      }
      case 'Violin': {
        if (!y) return null;
        return [{ type: 'violin', y: data.map((r) => Number(r[y])), box: { visible: true }, line: { color: colors[0] }, fillcolor: `${colors[0]}20`, name: y }];
      }
      case 'Heatmap': {
        if (numCols.length < 2) return null;
        const c2 = numCols.slice(0, 10);
        const corr = c2.map((c1) => c2.map((c2) => {
          const v1 = data.map((r) => Number(r[c1])).filter((v) => !isNaN(v));
          const v2 = data.map((r) => Number(r[c2])).filter((v) => !isNaN(v));
          const n = Math.min(v1.length, v2.length); if (n < 2) return 0;
          const m1 = v1.slice(0,n).reduce((a,b)=>a+b,0)/n, m2 = v2.slice(0,n).reduce((a,b)=>a+b,0)/n;
          const num = v1.slice(0,n).reduce((s,v,i)=>s+(v-m1)*(v2[i]-m2),0);
          const d1 = Math.sqrt(v1.slice(0,n).reduce((s,v)=>s+(v-m1)**2,0));
          const d2 = Math.sqrt(v2.slice(0,n).reduce((s,v)=>s+(v-m2)**2,0));
          return d1&&d2 ? +(num/(d1*d2)).toFixed(2) : 0;
        }));
        return [{ type: 'heatmap', z: corr, x: c2, y: c2, colorscale: [['0','#0f0f0f'],['0.5','#92400e'],['1','#d97706']], text: corr.map((r)=>r.map((v)=>v.toFixed(2))), texttemplate: '%{text}', textfont: { size: 10 } }];
      }
      case 'Treemap': {
        if (!x) return null;
        const vc = valueCounts(data, x, 25);
        return [{ type: 'treemap', labels: vc.map((c)=>c.name), parents: vc.map(()=>''), values: vc.map((c)=>c.value), marker: { colors } }];
      }
      case 'Sunburst': {
        if (!x) return null;
        const vc = valueCounts(data, x, 15);
        return [{ type: 'sunburst', labels: ['All', ...vc.map((c)=>c.name)], parents: ['', ...vc.map(()=>'All')], values: [vc.reduce((a,c)=>a+c.value,0), ...vc.map((c)=>c.value)], marker: { colors: ['transparent', ...colors] } }];
      }
      case 'Funnel': {
        if (!x || !y) return null;
        return [{ type: 'funnel', y: aggData.map((r)=>r[x]), x: aggData.map((r)=>r[y]), textinfo: 'value+percent initial', marker: { color: colors } }];
      }
      case 'Waterfall': {
        if (!x || !y) return null;
        const wd = aggData.slice(0, 14);
        return [{ type: 'waterfall', x: wd.map((r)=>r[x]), y: wd.map((r)=>r[y]), connector: { line: { color: 'rgba(255,255,255,0.08)' } }, increasing: { marker: { color: colors[0] } }, decreasing: { marker: { color: '#ef4444' } }, name: y }];
      }
      case 'Radar': {
        const rc = numCols.slice(0, 8); if (rc.length < 3) return null;
        const means = rc.map((c) => { const vals = data.map((r)=>Number(r[c])).filter((v)=>!isNaN(v)); return vals.reduce((a,b)=>a+b,0)/(vals.length||1); });
        const mx2 = Math.max(...means) || 1;
        return [{ type: 'scatterpolar', r: [...means.map((v)=>v/mx2*100), means[0]/mx2*100], theta: [...rc, rc[0]], fill: 'toself', fillcolor: `${colors[0]}25`, line: { color: colors[0], width: 2 }, name: 'Average' }];
      }
      case 'Gauge': {
        if (!y) return null;
        const vals = data.map((r)=>Number(r[y])).filter((v)=>!isNaN(v));
        const avg = vals.reduce((a,b)=>a+b,0)/(vals.length||1);
        const mx2 = Math.max(...vals) || 1;
        return [{ type: 'indicator', mode: 'gauge+number+delta', value: +avg.toFixed(2), title: { text: `Avg · ${y}`, font: { color: '#d4d4d4', size: 12 } }, gauge: { axis: { range: [0, mx2], tickcolor: '#737373', tickfont: { color: '#737373' } }, bar: { color: colors[0] }, bgcolor: '#171717', bordercolor: 'rgba(255,255,255,0.06)', steps: [{ range: [0, mx2*0.5], color: 'rgba(255,255,255,0.02)' }] }, number: { font: { color: '#f5f5f5' } } }];
      }
      case 'Sankey': {
        if (!catCols[0] || !catCols[1] || !numCols[0]) return null;
        const [src, tgt, val] = [catCols[0], catCols[1], numCols[0]];
        const nodes = [...new Set([...data.map((r)=>String(r[src])), ...data.map((r)=>String(r[tgt]))])];
        const links = data.slice(0, 80).map((r) => ({ source: nodes.indexOf(String(r[src])), target: nodes.indexOf(String(r[tgt])), value: Math.abs(Number(r[val]))||1 })).filter((l)=>l.source!==l.target&&l.source>=0&&l.target>=0);
        return [{ type: 'sankey', node: { label: nodes, pad: 12, thickness: 18, color: colors, line: { color: 'rgba(255,255,255,0.08)', width: 1 } }, link: { ...links[0] ? { source: links.map(l=>l.source), target: links.map(l=>l.target), value: links.map(l=>l.value) } : {} } }];
      }
      default: return null;
    }
  }

  function renderChart() {
    setRenderError('');
    try {
      const traces = buildTraces();
      if (!traces) { setRenderError('Select appropriate columns for this chart type.'); return; }

      const layout = {
        ...BASE_LAYOUT,
        title: { ...BASE_LAYOUT.title, text: getTitle() },
        colorway: colors,
        barmode: chartType === 'StackedBar' ? 'stack' : 'group',
        xaxis: { ...BASE_LAYOUT.xaxis, title: { text: xCol, font: BASE_LAYOUT.xaxis.title.font } },
        yaxis: { ...BASE_LAYOUT.yaxis, title: { text: yCol, font: BASE_LAYOUT.yaxis.title.font } },
      };

      Plotly.react(plotRef.current, traces, layout, PLOTLY_CONFIG);
    } catch (e) {
      setRenderError(e.message);
    }
  }

  async function handleExplain() {
    setShowExplainer(true);
    setExplaining(true);
    setExplanation('');
    try {
      const res = await generateChartExplanation(chartType, xCol, yCol, aggFunc, active?.profile?.describe_numeric || {});
      setExplanation(res.text);
    } catch (e) {
      setExplanation(`Failed to explain: ${e.message}`);
    } finally {
      setExplaining(false);
    }
  }

  function handleDownload() {
    if (!plotRef.current) return;
    Plotly.downloadImage(plotRef.current, { format: 'png', filename: `insightforge_${chartType}_${Date.now()}`, width: 1400, height: 700, scale: 2 });
  }

  const [chartSize, setChartSize] = useState('Medium'); // Small (340px), Medium (460px), Large (600px), Full (750px)
  const [activeSubTab, setActiveSubTab] = useState('builder'); // 'builder' | 'detailed' | 'trends'

  const sizeHeights = { Small: 340, Medium: 460, Large: 600, Full: 750 };

  // Trigger Plotly resize whenever chartSize changes
  useEffect(() => {
    if (plotRef.current) {
      Plotly.Plots.resize(plotRef.current);
    }
  }, [chartSize]);

  if (!active) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">◈</div>
        <div className="empty-state-title">No data loaded</div>
        <div className="empty-state-desc">Upload a CSV or Excel file to start creating charts.</div>
      </div>
    );
  }

  return (
    <div className="section-enter">
      {/* Sub-tab Navigation */}
      <div className="tabs-bar" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`tab-btn ${activeSubTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('builder')}
        >
          🎨 Visual Builder
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'detailed' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('detailed')}
        >
          📊 Detailed Analysis
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('trends')}
        >
          📈 Trends & Distributions
        </button>
      </div>

      {activeSubTab === 'builder' && (
        <>
          {/* Chart Type Picker */}
          <div className="chart-type-grid">
            {CHART_TYPES.map((ct) => (
              <button
                key={ct.id}
                className={`chart-type-btn ${chartType === ct.id ? 'active' : ''}`}
                onClick={() => setChartType(ct.id)}
              >
                <span className="chart-type-icon">{ct.icon}</span>
                <span>{ct.label}</span>
              </button>
            ))}
          </div>

          {/* Config row */}
          <div className="config-row">
            <div>
              <label>X Axis</label>
              <select className="select" value={xCol} onChange={(e) => setXCol(e.target.value)}>
                <option value="">— None —</option>
                {cols.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Y Axis (numeric)</label>
              <select className="select" value={yCol} onChange={(e) => setYCol(e.target.value)}>
                <option value="">— None —</option>
                {numCols.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Color / Group</label>
              <select className="select" value={colorCol} onChange={(e) => setColorCol(e.target.value)}>
                <option value="">— None —</option>
                {catCols.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Aggregation</label>
              <select className="select" value={aggFunc} onChange={(e) => setAggFunc(e.target.value)}>
                {['sum','mean','count','median','min','max'].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label>Color Palette</label>
              <select className="select" value={palette} onChange={(e) => setPalette(e.target.value)}>
                {Object.keys(PALETTES).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label>Chart Height</label>
              <select className="select" value={chartSize} onChange={(e) => setChartSize(e.target.value)}>
                {['Small', 'Medium', 'Large', 'Full'].map((s) => (
                  <option key={s} value={s}>{s} ({sizeHeights[s]}px)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Split Layout */}
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Chart Container */}
            <div className="chart-wrap" style={{ flex: 1, minWidth: 300, margin: 0 }}>
              <div className="chart-header">
                <div className="chart-title">{getTitle()}</div>
                <div className="chart-actions">
                  <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    {['Small', 'Medium', 'Large', 'Full'].map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${chartSize === s ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                        onClick={() => setChartSize(s)}
                      >
                        {s[0]}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={handleExplain}>Explain</button>
                  <button className="btn btn-subtle btn-sm" onClick={() => onPinChart && onPinChart({ chartType, xCol, yCol, colorCol, aggFunc, palette, title: getTitle() })}>Pin</button>
                  <button className="btn btn-subtle btn-sm" onClick={handleDownload}>↓ PNG</button>
                </div>
              </div>
              <div className="chart-body">
                {renderError && (
                  <div className="badge badge-warning" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
                    {renderError}
                  </div>
                )}
                <div ref={plotRef} style={{ width: '100%', minHeight: sizeHeights[chartSize] }} />
              </div>
            </div>

            {/* Explainer Panel */}
            {showExplainer && (
              <div className="ai-panel" style={{ width: '360px', minWidth: 280, flexShrink: 0, margin: 0 }}>
                <div className="ai-panel-header">
                  <div className="ai-panel-title">Chart Explanation</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowExplainer(false)}>Close</button>
                </div>
                <div className="ai-panel-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {explaining ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                      <div className="loading-dots"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div>
                      Analyzing chart…
                    </div>
                  ) : (
                    <div className="md-content" dangerouslySetInnerHTML={{ __html: renderMd(explanation) }} />
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeSubTab === 'detailed' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>📋 Top Categories Distribution</h3>
            {Object.keys(active.profile.top_categories || {}).length > 0 ? (
              Object.entries(active.profile.top_categories).map(([col, cats]) => (
                <div key={col} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-accent)', marginBottom: '0.35rem' }}>{col}</div>
                  {Object.entries(cats).map(([catName, count]) => (
                    <div key={catName} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', padding: '2px 0', borderBottom: '1px solid var(--border-faint)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{catName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No categorical columns available.</p>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>🔢 Numeric Metrics Summary</h3>
            {Object.keys(active.profile.describe_numeric || {}).length > 0 ? (
              Object.entries(active.profile.describe_numeric).map(([col, s]) => (
                <div key={col} style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{col}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <div>Mean: <strong style={{ color: 'var(--text-secondary)' }}>{s.mean}</strong></div>
                    <div>Median: <strong style={{ color: 'var(--text-secondary)' }}>{s.median}</strong></div>
                    <div>Min: <strong style={{ color: 'var(--text-secondary)' }}>{s.min}</strong></div>
                    <div>Max: <strong style={{ color: 'var(--text-secondary)' }}>{s.max}</strong></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>No numeric statistics available.</p>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'trends' && (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>📈 Trends & Distribution Matrix</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
            Switch to the <strong>Scatter</strong>, <strong>Box Plot</strong>, or <strong>Heatmap</strong> option in the Visual Builder for multi-variable trend and correlation analysis.
          </p>
          <button className="btn btn-primary" onClick={() => { setChartType('Heatmap'); setActiveSubTab('builder'); }}>
            View Correlation Heatmap →
          </button>
        </div>
      )}
    </div>
  );
}

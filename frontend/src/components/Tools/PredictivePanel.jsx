import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useData } from '../../hooks/useData';
import { runForecast, detectAnomalies } from '../../services/api';

const DARK_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(10,15,28,0.8)',
  font: { family: 'DM Sans, sans-serif', color: '#94a3b8' },
  margin: { l: 50, r: 30, t: 55, b: 50 },
  xaxis: { gridcolor: 'rgba(99,102,241,0.12)', linecolor: 'rgba(99,102,241,0.2)' },
  yaxis: { gridcolor: 'rgba(99,102,241,0.12)', linecolor: 'rgba(99,102,241,0.2)' },
  legend: { bgcolor: 'rgba(0,0,0,0)', font: { color: '#94a3b8', size: 11 } },
  hoverlabel: { bgcolor: '#161c2d', font: { color: '#f1f5f9' } },
};

export default function PredictivePanel() {
  const { active } = useData();
  const forecastRef = useRef(null);
  const anomalyRef = useRef(null);
  const [col, setCol] = useState('');
  const [periods, setPeriods] = useState(30);
  const [forecastResult, setForecastResult] = useState(null);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingAnomaly, setLoadingAnomaly] = useState(false);

  const numericCols = active?.columns?.filter((c) => active?.columnTypes?.[c] === 'numeric') || [];

  useEffect(() => { if (numericCols.length > 0 && !col) setCol(numericCols[0]); }, [active]);

  async function runForecastAction() {
    if (!col || !active) return;
    setLoadingForecast(true);
    try {
      const values = active.data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
      const res = await runForecast(values, periods);
      setForecastResult(res);
      plotForecast(values, res);
    } catch (e) { alert('Forecast error: ' + e.message); }
    finally { setLoadingForecast(false); }
  }

  async function runAnomalyAction() {
    if (!col || !active) return;
    setLoadingAnomaly(true);
    try {
      const values = active.data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
      const res = await detectAnomalies(values);
      setAnomalyResult(res);
      plotAnomalies(values, res);
    } catch (e) { alert('Anomaly error: ' + e.message); }
    finally { setLoadingAnomaly(false); }
  }

  function plotForecast(values, res) {
    if (!forecastRef.current) return;
    const n = values.length;
    const historicalX = Array.from({ length: n }, (_, i) => i + 1);
    const forecastX = res.forecast_indices.map((v) => v + 1);

    const traces = [
      { x: historicalX, y: values, type: 'scatter', mode: 'lines', name: `Historical ${col}`, line: { color: '#6366f1', width: 2 } },
      { x: res.fitted_indices.map((v) => v + 1), y: res.fitted_values, type: 'scatter', mode: 'lines', name: 'Trend Line', line: { color: '#94a3b8', width: 1, dash: 'dot' } },
      { x: forecastX, y: res.forecast_values, type: 'scatter', mode: 'lines', name: 'Forecast', line: { color: '#ec4899', width: 2.5 } },
      {
        x: [...forecastX, ...forecastX.slice().reverse()],
        y: [...res.ci_upper, ...res.ci_lower.slice().reverse()],
        type: 'scatter', fill: 'toself', fillcolor: 'rgba(236,72,153,0.12)',
        line: { color: 'transparent' }, name: '80% Confidence Band', showlegend: true,
      },
    ];
    Plotly.react(forecastRef.current, traces, { ...DARK_LAYOUT, title: { text: `${col} — Forecast (+${periods} periods)`, font: { family: 'Syne', size: 16, color: '#e2e8f0' } } }, { responsive: true, displaylogo: false });
  }

  function plotAnomalies(values, res) {
    if (!anomalyRef.current) return;
    const x = Array.from({ length: values.length }, (_, i) => i + 1);
    const anomalyIdx = new Set(res.anomalies.map((a) => a.index));
    const normalX = x.filter((_, i) => !anomalyIdx.has(i));
    const normalY = values.filter((_, i) => !anomalyIdx.has(i));
    const anomX = res.anomalies.map((a) => a.index + 1);
    const anomY = res.anomalies.map((a) => a.value);

    const traces = [
      { x: normalX, y: normalY, type: 'scatter', mode: 'markers', name: 'Normal', marker: { color: '#6366f1', size: 5, opacity: 0.7 } },
      { x: anomX, y: anomY, type: 'scatter', mode: 'markers', name: `Anomalies (${res.anomalies.length})`, marker: { color: '#ef4444', size: 10, symbol: 'diamond', line: { color: '#f87171', width: 2 } } },
    ];
    Plotly.react(anomalyRef.current, traces, { ...DARK_LAYOUT, title: { text: `${col} — Anomaly Detection`, font: { family: 'Syne', size: 16, color: '#e2e8f0' } } }, { responsive: true, displaylogo: false });
  }

  if (!active) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔮</div>
        <div className="empty-state-title">No Dataset Loaded</div>
        <div className="empty-state-desc">Upload a dataset to run predictive analytics and anomaly detection.</div>
      </div>
    );
  }

  return (
    <div className="section-enter">
      <div className="section-header">
        <div>
          <div className="section-title">🔮 Predictive Analytics</div>
          <div className="section-subtitle">Linear regression forecasting with 80% confidence intervals + Z-score anomaly detection</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label>Target Column</label>
          <select className="select" value={col} onChange={(e) => setCol(e.target.value)}>
            {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ width: 140 }}>
          <label>Forecast Periods</label>
          <input type="number" className="input" min={5} max={365} value={periods} onChange={(e) => setPeriods(Number(e.target.value))} />
        </div>
        <button className="btn btn-primary" onClick={runForecastAction} disabled={loadingForecast}>
          {loadingForecast ? <><div className="spinner" /> Running…</> : '🔮 Run Forecast'}
        </button>
        <button className="btn btn-ghost" onClick={runAnomalyAction} disabled={loadingAnomaly}>
          {loadingAnomaly ? <><div className="spinner" /> Detecting…</> : '⚠️ Detect Anomalies'}
        </button>
      </div>

      {/* Forecast Stats */}
      {forecastResult && !forecastResult.error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="stat-card"><div className="stat-label">Trend</div><div className="stat-value" style={{ fontSize: '1.2rem' }}>{forecastResult.trend}</div></div>
          <div className="stat-card"><div className="stat-label">R² Score</div><div className="stat-value">{(forecastResult.r_squared * 100).toFixed(1)}%</div></div>
          <div className="stat-card"><div className="stat-label">Slope (per period)</div><div className="stat-value" style={{ fontSize: '1.2rem' }}>{forecastResult.slope}</div></div>
          <div className="stat-card"><div className="stat-label">Confidence Level</div><div className="stat-value" style={{ color: 'var(--status-success)' }}>80%</div></div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {forecastResult && (
          <div className="chart-container chart-mount">
            <div ref={forecastRef} style={{ width: '100%', minHeight: 380 }} />
            <div className="forecast-legend">
              <div className="forecast-legend-item"><div className="forecast-legend-dot" style={{ background: '#6366f1' }} />Historical</div>
              <div className="forecast-legend-item"><div className="forecast-legend-dot" style={{ background: '#ec4899' }} />Forecast</div>
              <div className="forecast-legend-item"><div className="forecast-legend-dot" style={{ background: 'rgba(236,72,153,0.3)' }} />80% CI Band</div>
            </div>
          </div>
        )}
        {anomalyResult && (
          <div className="chart-container chart-mount">
            <div ref={anomalyRef} style={{ width: '100%', minHeight: 340 }} />
            {anomalyResult.stats && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <span className="badge badge-error">🔴 {anomalyResult.anomalies?.length || 0} Anomalies Detected</span>
                <span className="badge badge-info">Mean: {anomalyResult.stats.mean}</span>
                <span className="badge badge-info">Std Dev: {anomalyResult.stats.std}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

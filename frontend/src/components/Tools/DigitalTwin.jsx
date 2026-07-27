import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { buildProfile } from '../../utils/dataParser';

export default function DigitalTwin() {
  const { active, addToast } = useData();
  const [adjustments, setAdjustments] = useState({});
  const [simulatedProfile, setSimulatedProfile] = useState(null);

  const numericCols = active?.columns?.filter((c) => active?.columnTypes?.[c] === 'numeric') || [];

  function handleSlider(col, pct) {
    setAdjustments((prev) => ({ ...prev, [col]: pct }));
  }

  function runSimulation() {
    if (!active) return;
    const simData = active.data.map((row) => {
      const newRow = { ...row };
      Object.entries(adjustments).forEach(([col, pct]) => {
        if (newRow[col] !== null && !isNaN(Number(newRow[col]))) {
          newRow[col] = +(Number(newRow[col]) * (1 + pct / 100)).toFixed(4);
        }
      });
      return newRow;
    });
    const profile = buildProfile(simData, active.columns, active.columnTypes);
    setSimulatedProfile(profile);
    addToast('🧪 Simulation complete! See results below.', 'success');
  }

  function reset() {
    setAdjustments({});
    setSimulatedProfile(null);
  }

  if (!active) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧪</div>
        <div className="empty-state-title">No Dataset Loaded</div>
        <div className="empty-state-desc">Upload a dataset to simulate "What-If?" scenarios with the Digital Twin.</div>
      </div>
    );
  }

  return (
    <div className="section-enter">
      <div className="section-header">
        <div>
          <div className="section-title">🧪 Digital Twin — What-If Simulator</div>
          <div className="section-subtitle">Adjust numeric columns by a % change and see the effect on dataset statistics — before applying to real data</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>
          <button className="btn btn-primary" onClick={runSimulation}>⚡ Run Simulation</button>
        </div>
      </div>

      {/* Sliders */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          📐 Column Adjustments
        </div>
        {numericCols.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No numeric columns detected.</div>
        ) : (
          numericCols.map((col) => {
            const pct = adjustments[col] ?? 0;
            return (
              <div key={col} className="twin-slider-row">
                <div className="twin-slider-label">{col}</div>
                <input
                  type="range" className="twin-slider"
                  min={-100} max={200} step={1}
                  value={pct}
                  onChange={(e) => handleSlider(col, Number(e.target.value))}
                />
                <div className="twin-slider-value" style={{ color: pct > 0 ? 'var(--status-success)' : pct < 0 ? '#f87171' : 'var(--text-accent)' }}>
                  {pct > 0 ? '+' : ''}{pct}%
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Results Comparison */}
      {simulatedProfile && (
        <div>
          <div className="section-title" style={{ marginBottom: '1rem' }}>📊 Before vs After Simulation</div>
          <div className="compare-grid">
            {/* Original */}
            <div className="glass-panel" style={{ padding: '1.2rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🔵 Original Data
              </div>
              {Object.entries(active.profile.describe_numeric || {}).map(([col, stat]) => (
                <div key={col} style={{ marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-accent)' }}>{col}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Mean: <strong>{stat.mean?.toLocaleString()}</strong> · Max: {stat.max?.toLocaleString()} · Min: {stat.min?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {/* Simulated */}
            <div className="glass-panel" style={{ padding: '1.2rem', borderColor: 'var(--border-strong)' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--status-emerald)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🟢 Simulated Data
              </div>
              {Object.entries(simulatedProfile.describe_numeric || {}).map(([col, stat]) => {
                const origStat = active.profile.describe_numeric?.[col];
                const diff = origStat ? ((stat.mean - origStat.mean) / (origStat.mean || 1) * 100).toFixed(1) : 0;
                return (
                  <div key={col} style={{ marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-success)' }}>{col}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Mean: <strong>{stat.mean?.toLocaleString()}</strong>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: Number(diff) > 0 ? 'var(--status-success)' : '#f87171' }}>
                        ({Number(diff) > 0 ? '+' : ''}{diff}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary note */}
          <div className="twin-result">
            ⚠️ <strong>This is a simulation only.</strong> No changes have been applied to your actual dataset.
            The original data remains untouched. Use these insights to make informed decisions before modifying real data.
          </div>
        </div>
      )}
    </div>
  );
}

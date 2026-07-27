import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useData } from '../../hooks/useData';

const DARK_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(10,15,28,0.8)',
  font: { family: 'DM Sans, sans-serif', color: '#94a3b8' },
  margin: { l: 50, r: 30, t: 45, b: 50 },
  xaxis: { gridcolor: 'rgba(99,102,241,0.12)' },
  yaxis: { gridcolor: 'rgba(99,102,241,0.12)' },
  legend: { bgcolor: 'rgba(0,0,0,0)' },
};

function PinnedChart({ config }) {
  const { datasets } = useData();
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    // Minimal re-render of pinned chart
    Plotly.react(ref.current, [{ type: 'bar', x: ['No data'], y: [0] }], {
      ...DARK_LAYOUT, title: { text: config.title, font: { family: 'Syne', size: 14, color: '#e2e8f0' } }
    }, { responsive: true, displaylogo: false });
  }, []);

  return <div ref={ref} style={{ width: '100%', minHeight: 280 }} />;
}

export default function Dashboard() {
  const { pinnedCharts, unpinChart } = useData();

  if (pinnedCharts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📌</div>
        <div className="empty-state-title">Your Dashboard is Empty</div>
        <div className="empty-state-desc">
          Go to <strong>Charts</strong> and click <strong>📌 Pin</strong> on any chart to add it here.
          Build your personal analytics pinboard!
        </div>
      </div>
    );
  }

  return (
    <div className="section-enter">
      <div className="section-header">
        <div>
          <div className="section-title">📌 My Custom Dashboard</div>
          <div className="section-subtitle">{pinnedCharts.length} pinned chart{pinnedCharts.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: '1.25rem' }}>
        {pinnedCharts.map((chart) => (
          <div key={chart.id} className="chart-wrap" style={{ margin: 0 }}>
            <div className="chart-header">
              <div className="chart-title">{chart.title}</div>
              <button className="btn btn-danger btn-sm" onClick={() => unpinChart(chart.id)}>✕ Unpin</button>
            </div>
            <div className="chart-body" style={{ minHeight: 300 }}>
              <PinnedChart config={chart} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

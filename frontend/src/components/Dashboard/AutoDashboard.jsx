import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useData } from '../../hooks/useData';
import { groupedAggregation, valueCounts } from '../../utils/dataParser';
import { Zap } from 'lucide-react';

const DARK_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(10,15,28,0.8)',
  font: { family: 'DM Sans, sans-serif', color: '#94a3b8' },
  margin: { l: 40, r: 20, t: 40, b: 40 },
  xaxis: { gridcolor: 'rgba(99,102,241,0.12)', tickfont: { size: 10 } },
  yaxis: { gridcolor: 'rgba(99,102,241,0.12)', tickfont: { size: 10 } },
  legend: { bgcolor: 'rgba(0,0,0,0)', font: { size: 10 } },
};

function AutoChart({ config, data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !data) return;

    let traces = [];
    if (config.type === 'bar') {
      const agg = groupedAggregation(data, [config.x], config.y, 'sum');
      traces = [{ type: 'bar', x: agg.map(r => r[config.x]), y: agg.map(r => r[config.y]), marker: { color: '#3b82f6' } }];
    } else if (config.type === 'pie') {
      const vc = valueCounts(data, config.x, 7);
      traces = [{ type: 'pie', labels: vc.map(c => c.name), values: vc.map(c => c.value), hole: 0.4, textinfo: 'percent' }];
    } else if (config.type === 'scatter') {
      traces = [{ type: 'scatter', mode: 'markers', x: data.map(r => r[config.x]), y: data.map(r => r[config.y]), marker: { color: '#10b981', size: 6, opacity: 0.7 } }];
    } else if (config.type === 'line') {
      const agg = groupedAggregation(data, [config.x], config.y, 'mean');
      traces = [{ type: 'scatter', mode: 'lines+markers', x: agg.map(r => r[config.x]), y: agg.map(r => r[config.y]), line: { color: '#8b5cf6', width: 2 } }];
    }

    Plotly.react(ref.current, traces, {
      ...DARK_LAYOUT,
      title: { text: config.title, font: { family: 'Syne', size: 14, color: '#e2e8f0' } }
    }, { responsive: true, displaylogo: false });
  }, [config, data]);

  return <div ref={ref} style={{ width: '100%', minHeight: 300 }} />;
}

export default function AutoDashboard() {
  const { active } = useData();
  const [charts, setCharts] = useState([]);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      if (!active) return;
      const { columns, columnTypes } = active;
      const num = columns.filter(c => columnTypes[c] === 'numeric');
      const cat = columns.filter(c => columnTypes[c] === 'categorical');
      
      const newCharts = [];
      if (cat.length > 0 && num.length > 0) {
        newCharts.push({ id: 1, type: 'bar', x: cat[0], y: num[0], title: `${num[0]} by ${cat[0]}` });
      }
      if (cat.length > 0) {
        newCharts.push({ id: 2, type: 'pie', x: cat[cat.length > 1 ? 1 : 0], title: `Distribution of ${cat[cat.length > 1 ? 1 : 0]}` });
      }
      if (num.length > 1) {
        newCharts.push({ id: 3, type: 'scatter', x: num[0], y: num[1], title: `${num[1]} vs ${num[0]}` });
      }
      if (cat.length > 0 && num.length > 1) {
        newCharts.push({ id: 4, type: 'line', x: cat[0], y: num[1], title: `Average ${num[1]} across ${cat[0]}` });
      }
      setCharts(newCharts);
      setGenerating(false);
    }, 800);
  };

  if (!active) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">No data loaded</div>
      </div>
    );
  }

  return (
    <div className="section-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Auto-Generate Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.95rem' }}>Instantly generate a Power BI style canvas for your dataset.</p>
        </div>
        <button onClick={generate} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          <Zap size={18} /> {generating ? 'Analyzing...' : 'Generate Dashboard'}
        </button>
      </div>

      {charts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {charts.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem' }}>
              <AutoChart config={c} data={active.data} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Click the button above to auto-magically analyze your dataset schema and render the most optimal charts.</p>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { generateSchemaInsights } from '../../services/api';
import { compareDatasets } from '../../services/api';

function MdRender({ text }) {
  const html = (text || '')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--text-accent);margin:0.8rem 0 0.3rem;font-size:1rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--text-primary);margin:1rem 0 0.4rem">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '• $1<br/>').replace(/\n/g, '<br/>');
  return <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function SchemaDetector() {
  const { active, datasets } = useData();
  const [schemaResult, setSchemaResult] = useState('');
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [compareOld, setCompareOld] = useState('');
  const [compareNew, setCompareNew] = useState('');
  const [compareResult, setCompareResult] = useState('');
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [activeTab, setActiveTab] = useState('schema');

  const dsNames = Object.keys(datasets);

  async function runSchema() {
    if (!active) return;
    setLoadingSchema(true);
    setSchemaResult('');
    try {
      const res = await generateSchemaInsights(active.profile, active.fileName);
      setSchemaResult(res.text);
    } catch (e) { setSchemaResult(`Error: ${e.message}`); }
    finally { setLoadingSchema(false); }
  }

  async function runCompare() {
    if (!compareOld || !compareNew || compareOld === compareNew) {
      alert('Please select two different datasets.'); return;
    }
    setLoadingCompare(true);
    setCompareResult('');
    try {
      const old = datasets[compareOld];
      const nw = datasets[compareNew];
      const res = await compareDatasets(old.profile, nw.profile, compareOld, compareNew);
      setCompareResult(res.text);
    } catch (e) { setCompareResult(`Error: ${e.message}`); }
    finally { setLoadingCompare(false); }
  }

  // Schema Field Roles from column types
  const schemaFields = active?.columns?.map((col) => {
    const type = active.columnTypes?.[col] || 'categorical';
    const lower = col.toLowerCase();
    let role = 'dimension';
    if (lower.includes('id') || lower.includes('key') || lower.includes('code')) role = 'id';
    else if (type === 'numeric') role = 'metric';
    else if (type === 'datetime') role = 'date';
    else if (lower.includes('flag') || lower.includes('is_') || lower.includes('has_')) role = 'flag';
    return { col, type, role };
  }) || [];

  return (
    <div className="section-enter">
      <div className="section-header">
        <div>
          <div className="section-title">🔍 Schema & Dataset Intelligence</div>
          <div className="section-subtitle">Detect column roles, relationships, data quality issues & compare datasets</div>
        </div>
      </div>

      <div className="tabs-bar" style={{ marginBottom: '1.25rem' }}>
        <button className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`} onClick={() => setActiveTab('schema')}>🔍 Schema Detection</button>
        <button className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>🔄 Dataset Comparison</button>
      </div>

      {activeTab === 'schema' && (
        <>
          {active ? (
            <>
              {/* Visual Column Roles */}
              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                  📋 Detected Column Roles
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.4rem' }}>
                  {schemaFields.map(({ col, type, role }) => (
                    <div key={col} className="schema-field">
                      <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{col}</span>
                      <span className={`schema-field-role role-${role}`}>{role}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" onClick={runSchema} disabled={loadingSchema}>
                {loadingSchema ? <><div className="spinner" /> Analyzing Schema…</> : '🤖 AI Schema Deep Analysis'}
              </button>

              {schemaResult && (
                <div className="ai-panel" style={{ marginTop: '1rem' }}>
                  <div className="ai-panel-header"><div className="ai-panel-title">🔍 AI Schema Report</div></div>
                  <div className="ai-panel-body" style={{ maxHeight: 480, overflowY: 'auto' }}><MdRender text={schemaResult} /></div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No Dataset Loaded</div>
            </div>
          )}
        </>
      )}

      {activeTab === 'compare' && (
        <div>
          {dsNames.length < 2 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔄</div>
              <div className="empty-state-title">Upload 2 Datasets to Compare</div>
              <div className="empty-state-desc">Upload two CSV or Excel files, then select them to compare changes.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Old / Baseline Dataset</label>
                  <select className="select" value={compareOld} onChange={(e) => setCompareOld(e.target.value)}>
                    <option value="">— Select —</option>
                    {dsNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label>New / Updated Dataset</label>
                  <select className="select" value={compareNew} onChange={(e) => setCompareNew(e.target.value)}>
                    <option value="">— Select —</option>
                    {dsNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={runCompare} disabled={loadingCompare}>
                {loadingCompare ? <><div className="spinner" /> Comparing…</> : '🔄 Compare Datasets'}
              </button>
              {compareResult && (
                <div className="ai-panel" style={{ marginTop: '1rem' }}>
                  <div className="ai-panel-header"><div className="ai-panel-title">🔄 Dataset Comparison Report</div></div>
                  <div className="ai-panel-body" style={{ maxHeight: 480, overflowY: 'auto' }}><MdRender text={compareResult} /></div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

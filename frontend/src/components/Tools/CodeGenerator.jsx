import React, { useState } from 'react';
import { generateCode } from '../../services/api';
import { useData } from '../../hooks/useData';

const LANGS = [
  { id: 'pandas', label: '🐍 Pandas', desc: 'Python DataFrame code' },
  { id: 'sql', label: '🗄 SQL', desc: 'SQL Query' },
  { id: 'dax', label: '📊 DAX', desc: 'Power BI Measure' },
  { id: 'plotly', label: '📈 Plotly', desc: 'Plotly Python chart' },
];

export default function CodeGenerator() {
  const { active } = useData();
  const [lang, setLang] = useState('pandas');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [aggFunc, setAggFunc] = useState('sum');
  const [chartType, setChartType] = useState('Bar');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const numericCols = active?.columns?.filter((c) => active?.columnTypes?.[c] === 'numeric') || [];
  const allCols = active?.columns || [];

  async function generate() {
    setLoading(true);
    setCode('');
    try {
      const res = await generateCode(chartType, xCol || 'category', yCol || 'value', aggFunc, active?.fileName || 'Dataset', lang);
      setCode(res.code);
    } catch (e) {
      setCode(`# Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="section-enter">
      <div className="section-header">
        <div>
          <div className="section-title">💻 AI Code Generator</div>
          <div className="section-subtitle">Generate ready-to-use Pandas, SQL, DAX, or Plotly code from your analysis</div>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="code-lang-tabs">
        {LANGS.map((l) => (
          <button key={l.id} className={`code-lang-btn ${lang === l.id ? 'active' : ''}`} onClick={() => setLang(l.id)}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Config */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', margin: '1rem 0' }}>
        <div>
          <label>X-Axis / Group Column</label>
          <select className="select" value={xCol} onChange={(e) => setXCol(e.target.value)}>
            <option value="">— Select —</option>
            {allCols.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Y-Axis / Value Column</label>
          <select className="select" value={yCol} onChange={(e) => setYCol(e.target.value)}>
            <option value="">— Select —</option>
            {numericCols.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Aggregation</label>
          <select className="select" value={aggFunc} onChange={(e) => setAggFunc(e.target.value)}>
            {['sum','mean','count','median','min','max'].map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label>Chart / Analysis Type</label>
          <select className="select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
            {['Bar','Line','Scatter','Pie','Heatmap','Histogram','Box'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ marginBottom: '1rem' }}>
        {loading ? <><div className="spinner" /> Generating Code…</> : `⚡ Generate ${LANGS.find((l) => l.id === lang)?.label} Code`}
      </button>

      {/* Code Output */}
      {code && (
        <div className="code-output">
          <pre className="code-block">{code}</pre>
          <button className="copy-btn" onClick={copyCode}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
        </div>
      )}

      {/* Info about each language */}
      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {LANGS.map((l) => (
          <div key={l.id} className={`card ${lang === l.id ? '' : ''}`} style={{ borderColor: lang === l.id ? 'var(--border-strong)' : undefined }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{l.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

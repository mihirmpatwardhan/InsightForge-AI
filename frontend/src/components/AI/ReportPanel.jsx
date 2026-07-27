import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { generateReport, generateRecommendations } from '../../services/api';
import { exportDocument } from '../../services/api';

function MarkdownRender({ text }) {
  if (!text) return null;
  const html = text
    .replace(/^### (.+)$/gm, '<h3 style="color:var(--text-accent);margin:0.8rem 0 0.3rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--text-primary);margin:1rem 0 0.4rem;font-size:1.05rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--text-primary);margin:1.2rem 0 0.5rem;font-size:1.2rem">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin:0.2rem 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '\n');
  return <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ReportPanel() {
  const { active } = useData();
  const [reportText, setReportText] = useState('');
  const [recText, setRecText] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [activeTab, setActiveTab] = useState('report');
  const [exporting, setExporting] = useState('');

  const profile = active?.profile || {};
  const fileName = active?.fileName || 'Dataset';

  async function genReport() {
    setLoadingReport(true);
    try {
      const res = await generateReport(fileName, profile);
      setReportText(res.text);
      setActiveTab('report');
    } catch (e) { setReportText(`Error: ${e.message}`); }
    finally { setLoadingReport(false); }
  }

  async function genRec() {
    setLoadingRec(true);
    try {
      const res = await generateRecommendations(fileName, profile);
      setRecText(res.text);
      setActiveTab('rec');
    } catch (e) { setRecText(`Error: ${e.message}`); }
    finally { setLoadingRec(false); }
  }

  async function handleExport(format) {
    const text = activeTab === 'report' ? reportText : recText;
    const title = activeTab === 'report' ? 'AI Executive Report' : 'AI Recommendations';
    if (!text) return;
    setExporting(format);
    try { await exportDocument(title, text, format, fileName); }
    catch (e) { alert(`Export failed: ${e.message}`); }
    finally { setExporting(''); }
  }

  if (!active) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🤖</div>
        <div className="empty-state-title">No Dataset Loaded</div>
        <div className="empty-state-desc">Upload a dataset to generate AI-powered executive reports and recommendations.</div>
      </div>
    );
  }

  return (
    <div className="section-enter">
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={genReport} disabled={loadingReport}>
          {loadingReport ? <><div className="spinner" /> Generating…</> : '📄 Generate Full AI Report'}
        </button>
        <button className="btn btn-primary" onClick={genRec} disabled={loadingRec} style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
          {loadingRec ? <><div className="spinner" /> Generating…</> : '💡 Generate Recommendations'}
        </button>
      </div>

      {/* Tabs */}
      {(reportText || recText) && (
        <div className="tabs-bar" style={{ marginBottom: '1rem' }}>
          {reportText && <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>📄 Full Report</button>}
          {recText && <button className={`tab-btn ${activeTab === 'rec' ? 'active' : ''}`} onClick={() => setActiveTab('rec')}>💡 Recommendations</button>}
        </div>
      )}

      {/* Content */}
      {(reportText || recText) && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <div className="ai-panel-title">
              {activeTab === 'report' ? '📄 AI Executive Report' : '💡 Strategic Recommendations'}
              <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>AI Generated</span>
            </div>
            {/* Export Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['pdf', 'docx', 'pptx'].map((fmt) => (
                <button key={fmt} className="btn btn-ghost btn-sm" onClick={() => handleExport(fmt)} disabled={!!exporting}>
                  {exporting === fmt ? <div className="spinner" /> : `⬇ ${fmt.toUpperCase()}`}
                </button>
              ))}
            </div>
          </div>
          <div className="ai-panel-body" style={{ maxHeight: 520, overflowY: 'auto' }}>
            <MarkdownRender text={activeTab === 'report' ? reportText : recText} />
          </div>
        </div>
      )}

      {/* Download Processed CSV */}
      {active && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="section-subtitle" style={{ marginBottom: '0.75rem' }}>📥 Export Processed Dataset</div>
          <button className="btn btn-ghost" onClick={() => {
            import('../../utils/dataParser').then(({ exportCSV }) => exportCSV(active.data, `${fileName}_processed.csv`));
          }}>⬇ Download Processed CSV</button>
        </div>
      )}
    </div>
  );
}

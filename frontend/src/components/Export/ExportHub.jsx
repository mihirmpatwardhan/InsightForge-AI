import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { exportDocument } from '../../services/api';
import { exportCSV } from '../../utils/dataParser';

const EXPORT_CARDS = [
  { id: 'pdf',  icon: '📄', label: 'PDF Report', desc: 'Styled AI executive report', color: '#ef4444', require: 'report' },
  { id: 'docx', icon: '📝', label: 'Word Document', desc: 'Formatted .docx with sections', color: '#2563eb', require: 'report' },
  { id: 'pptx', icon: '🖥', label: 'PowerPoint', desc: 'Branded enterprise presentation', color: '#d97706', require: 'report' },
  { id: 'csv',  icon: '📊', label: 'Processed CSV', desc: 'Cleaned & processed data', color: '#059669', require: 'data' },
];

export default function ExportHub() {
  const { active } = useData();
  const [reportText] = useState('');
  const [exporting, setExporting] = useState('');
  const [customTitle, setCustomTitle] = useState('NexusViz AI Analysis Report');

  async function handleExport(card) {
    if (card.require === 'data') {
      if (!active) { alert('Upload a dataset first.'); return; }
      exportCSV(active.data, `${active.fileName}_processed.csv`);
      return;
    }
    setExporting(card.id);
    try {
      const content = reportText || `# ${customTitle}\n\n## Overview\nDataset: ${active?.fileName || 'N/A'}\nRows: ${active?.profile?.rows || 0}\nColumns: ${active?.profile?.columns || 0}\n\n## Data Quality\nHealth Score: ${active?.profile?.health?.score || 'N/A'}/100\nStatus: ${active?.profile?.health?.status || 'N/A'}\n\n## Numeric Statistics\n${Object.entries(active?.profile?.describe_numeric || {}).map(([col, s]) => `- **${col}**: Mean ${s.mean}, Max ${s.max}, Min ${s.min}`).join('\n')}\n\n## Notes\nGenerate a full AI report from the AI Report page for richer content.\n`;
      await exportDocument(customTitle, content, card.id, active?.fileName || 'Dataset');
    } catch (e) {
      alert(`Export failed: ${e.message}`);
    } finally { setExporting(''); }
  }

  return (
    <div className="section-enter">
      <div className="section-header">
        <div>
          <div className="section-title">📤 Export Hub</div>
          <div className="section-subtitle">Export your analysis, reports, and data in any format</div>
        </div>
      </div>

      {/* Custom Report Title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label>Report / Presentation Title</label>
        <input className="input" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Enter a title for exported documents" />
      </div>

      {/* Export Cards */}
      <div className="export-grid" style={{ marginBottom: '1.5rem' }}>
        {EXPORT_CARDS.map((card) => (
          <button
            key={card.id}
            className="export-card"
            onClick={() => handleExport(card)}
            disabled={!!exporting}
            style={{ borderColor: exporting === card.id ? card.color : undefined }}
          >
            {exporting === card.id ? <div className="spinner" style={{ width: 32, height: 32 }} /> : <div className="export-card-icon">{card.icon}</div>}
            <div className="export-card-label" style={{ color: card.color }}>{card.label}</div>
            <div className="export-card-desc">{card.desc}</div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="glass-panel" style={{ padding: '1.2rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem', color: 'var(--text-accent)' }}>💡 Pro Tips</div>
        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 2 }}>
          <li>Generate a full <strong style={{ color: 'var(--text-secondary)' }}>AI Report</strong> from the AI Report page first for richer PDF/DOCX/PPTX content</li>
          <li><strong style={{ color: 'var(--text-secondary)' }}>PowerPoint</strong> exports include dark-themed slides with branding</li>
          <li><strong style={{ color: 'var(--text-secondary)' }}>Processed CSV</strong> exports the cleaned version of your dataset</li>
          <li>All charts can be saved as <strong style={{ color: 'var(--text-secondary)' }}>PNG</strong> from the Charts page</li>
        </ul>
      </div>
    </div>
  );
}

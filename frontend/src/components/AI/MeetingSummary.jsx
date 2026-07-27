import React, { useState } from 'react';
import { generateMeetingSummary, generateMeetingSummaryFile, exportDocument } from '../../services/api';

function MdRender({ text }) {
  if (!text) return null;
  const html = text
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--text-accent);margin:0.8rem 0 0.3rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--text-primary);margin:1rem 0 0.4rem">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '• $1<br/>')
    .replace(/\n/g, '<br/>');
  return <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function MeetingSummary() {
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState('');

  async function generate() {
    setLoading(true);
    setResult('');
    try {
      let res;
      if (mode === 'text') {
        if (!text.trim()) throw new Error('Please paste meeting notes');
        res = await generateMeetingSummary(text);
      } else {
        if (!file) throw new Error('Please select a file');
        res = await generateMeetingSummaryFile(file);
      }
      setResult(res.text);
    } catch (e) {
      setResult(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(fmt) {
    setExporting(fmt);
    try { await exportDocument('Meeting Summary', result, fmt); }
    catch (e) { alert(e.message); }
    finally { setExporting(''); }
  }

  return (
    <div className="section-enter" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="section-header">
        <div>
          <div className="section-title">📝 AI Meeting Summary Generator</div>
          <div className="section-subtitle">Paste meeting notes or upload a document — get an instant structured summary</div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="tabs-bar" style={{ marginBottom: '1.25rem', maxWidth: 300 }}>
        <button className={`tab-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>✏️ Paste Text</button>
        <button className={`tab-btn ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>📎 Upload File</button>
      </div>

      {mode === 'text' ? (
        <textarea
          className="textarea"
          style={{ minHeight: 200, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
          placeholder="Paste your meeting notes, transcript, or discussion points here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <div
          className="upload-zone"
          style={{ padding: '2rem' }}
          onClick={() => document.getElementById('meeting-file-input').click()}
        >
          <input id="meeting-file-input" type="file" accept=".txt,.pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0])} />
          <div className="upload-icon" style={{ fontSize: '2rem' }}>📎</div>
          <div className="upload-title" style={{ fontSize: '1rem' }}>
            {file ? `📄 ${file.name}` : 'Click to select document (.txt, .pdf)'}
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? <><div className="spinner" /> Summarizing…</> : '🧠 Generate AI Summary'}
      </button>

      {result && (
        <div className="ai-panel" style={{ marginTop: '1.25rem' }}>
          <div className="ai-panel-header">
            <div className="ai-panel-title">📋 Meeting Summary</div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['pdf', 'docx'].map((fmt) => (
                <button key={fmt} className="btn btn-ghost btn-sm" onClick={() => handleExport(fmt)} disabled={!!exporting}>
                  {exporting === fmt ? <div className="spinner" /> : `⬇ ${fmt.toUpperCase()}`}
                </button>
              ))}
            </div>
          </div>
          <div className="ai-panel-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
            <MdRender text={result} />
          </div>
        </div>
      )}
    </div>
  );
}

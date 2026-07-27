import React, { useState, useCallback, useRef } from 'react';
import { useData } from '../../hooks/useData';
import Logo from '../Common/Logo';

// Sample Dataset Generator for instant demo testing
const SAMPLE_DATA = [
  { Region: 'North America', Category: 'Electronics', Sales: 125000, Profit: 32000, Units: 450, Date: '2026-01-15' },
  { Region: 'Europe', Category: 'Electronics', Sales: 98000, Profit: 24000, Units: 320, Date: '2026-01-18' },
  { Region: 'Asia Pacific', Category: 'Furniture', Sales: 145000, Profit: 41000, Units: 580, Date: '2026-02-02' },
  { Region: 'North America', Category: 'Furniture', Sales: 87000, Profit: 19000, Units: 290, Date: '2026-02-10' },
  { Region: 'Latin America', Category: 'Office Supplies', Sales: 62000, Profit: 15000, Units: 410, Date: '2026-02-14' },
  { Region: 'Europe', Category: 'Office Supplies', Sales: 79000, Profit: 18500, Units: 490, Date: '2026-03-01' },
  { Region: 'Asia Pacific', Category: 'Electronics', Sales: 189000, Profit: 52000, Units: 640, Date: '2026-03-12' },
  { Region: 'North America', Category: 'Technology', Sales: 21000, Profit: 68000, Units: 720, Date: '2026-03-25' },
  { Region: 'Europe', Category: 'Furniture', Sales: 112000, Profit: 28000, Units: 380, Date: '2026-04-05' },
  { Region: 'Latin America', Category: 'Electronics', Sales: 94000, Profit: 21500, Units: 310, Date: '2026-04-18' },
];

export default function FileUploader({ onNavigate }) {
  const { loadFiles, setDatasets, setActiveDataset, addToast } = useData();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queued, setQueued] = useState([]);
  const inputRef = useRef(null);

  const fmt = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;

  const handleFiles = useCallback(async (files) => {
    const valid = Array.from(files).filter((f) => /\.(csv|xlsx|xls)$/i.test(f.name));
    if (valid.length === 0) return;
    setQueued(valid.map((f) => ({ name: f.name, size: fmt(f.size) })));
    setLoading(true);
    const lastLoaded = await loadFiles(valid);
    setLoading(false);
    if (lastLoaded) {
      onNavigate('overview');
    }
  }, [loadFiles, onNavigate]);

  const loadSampleData = () => {
    const columns = ['Region', 'Category', 'Sales', 'Profit', 'Units', 'Date'];
    const columnTypes = { Region: 'categorical', Category: 'categorical', Sales: 'numeric', Profit: 'numeric', Units: 'numeric', Date: 'datetime' };
    const sampleProfile = {
      rows: SAMPLE_DATA.length,
      columns: columns.length,
      numeric_columns: ['Sales', 'Profit', 'Units'],
      categorical_columns: ['Region', 'Category'],
      datetime_columns: ['Date'],
      missing_values: {},
      describe_numeric: {
        Sales: { count: 10, mean: 120200, min: 21000, max: 210000, median: 105000 },
        Profit: { count: 10, mean: 31900, min: 15000, max: 68000, median: 26000 },
        Units: { count: 10, mean: 464, min: 290, max: 720, median: 430 },
      },
      top_categories: {
        Region: { 'North America': 3, Europe: 3, 'Asia Pacific': 2, 'Latin America': 2 },
        Category: { Electronics: 4, Furniture: 3, 'Office Supplies': 2, Technology: 1 },
      },
      health: { score: 100, status: 'Excellent', duplicate_rows: 0, missing_cells: 0, total_cells: 60 },
    };

    setDatasets({
      'Sample_Sales_Data.csv': {
        data: SAMPLE_DATA,
        columns,
        columnTypes,
        profile: sampleProfile,
        fileName: 'Sample_Sales_Data.csv',
      },
    });
    setActiveDataset('Sample_Sales_Data.csv');
    addToast('📊 Loaded Sample Sales Dataset!', 'success');
    onNavigate('overview');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeQueued = (name) => setQueued((q) => q.filter((f) => f.name !== name));

  return (
    <div className="section-enter" style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <Logo size={36} />
          <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: 600, lineHeight: 1.6 }}>
            Enterprise data intelligence platform. Upload any CSV or Excel file or test with sample data to instantly generate interactive charts, predictive analytics, and executive AI reports.
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={loadSampleData}>
          ⚡ Load Sample Demo Dataset
        </button>
      </div>

      {/* Main Grid Layout: Upload Zone Left + Quick Feature Cards Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
          onDrop={onDrop}
          onClick={() => !loading && inputRef.current?.click()}
          style={{ cursor: loading ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 320 }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {loading ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              </div>
              <div className="upload-title" style={{ fontSize: '1rem' }}>Parsing your file…</div>
              <div className="upload-subtitle">Detecting column types and building data profile</div>
            </>
          ) : (
            <>
              <div className="upload-icon" style={{ fontSize: '3rem' }}>↑</div>
              <div className="upload-title" style={{ fontSize: '1.1rem' }}>
                {dragging ? 'Release to upload' : 'Drop dataset file here'}
              </div>
              <button className="btn btn-subtle btn-md" style={{ marginTop: '0.85rem', border: '1px solid var(--accent)', color: 'var(--text-accent)', fontWeight: 600 }}>
                📂 Select File from Computer
              </button>
              <div className="upload-subtitle" style={{ marginTop: '0.85rem' }}>Multiple files supported · Auto-detects CSV encoding & Excel sheets</div>
              <div className="format-chips" style={{ marginTop: '1rem' }}>
                {['.CSV', '.XLSX', '.XLS'].map((f) => (
                  <span key={f} className="format-chip">{f}</span>
                ))}
              </div>
            </>
          )}

          {/* Queued Files */}
          {queued.length > 0 && (
            <div className="file-list" style={{ marginTop: '1.25rem' }}>
              {queued.map((f) => (
                <div key={f.name} className="file-item">
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>◈</span>
                  <span className="file-item-name">{f.name}</span>
                  <span className="file-item-size">{f.size}</span>
                  {!loading && (
                    <span className="file-item-remove" onClick={(e) => { e.stopPropagation(); removeQueued(f.name); }}>✕</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Explorer Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { id: 'charts', icon: '◈', title: 'Interactive Charts', desc: '19+ customizable chart types with size controls and Plotly rendering.' },
            { id: 'ai-report', icon: '◎', title: 'AI Executive Reports', desc: 'McKinsey-style business analysis with risk and data assessment.' },
            { id: 'predict', icon: '◬', title: 'Predictive Analytics', desc: 'Linear regression forecasting with 80% CI bands and Z-score anomaly detection.' },
            { id: 'schema', icon: '◉', title: 'Schema Intelligence', desc: 'Column role detection, data quality checks, and dataset revision compare.' },
          ].map((item) => (
            <div key={item.id} className="card lift" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
              <button
                className="btn btn-subtle btn-sm"
                style={{ marginTop: '0.85rem', width: 'fit-content' }}
                onClick={() => onNavigate(item.id)}
              >
                Open {item.title} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


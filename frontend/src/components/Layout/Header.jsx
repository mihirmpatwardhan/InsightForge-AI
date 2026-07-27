import React from 'react';
import { useData } from '../../hooks/useData';

const PAGE_LABELS = {
  upload: 'Dataset Ingestion & Upload',
  overview: 'Dataset Overview & Metrics',
  charts: 'Interactive Visual Analytics',
  'ai-report': 'Executive AI Strategy Report',
  chat: 'Conversational Data Assistant',
  predict: 'Predictive Forecasting & Anomalies',
  'code-gen': 'Automated Code Generator',
  schema: 'Schema Architecture & Data Drift',
  meeting: 'Executive Meeting Summarizer',
  twin: 'Digital Twin Simulation',
  dashboard: 'Custom Analytics Dashboard',
  export: 'Executive Export Hub',
};

export default function Header({ activePage, sidebarExpanded, onMobileToggle, onNavigate }) {
  const { datasets, activeDataset, setActiveDataset, active } = useData();
  const dsNames = Object.keys(datasets);

  return (
    <header className={`header ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <div className="header-left">
        <button 
          className="btn btn-ghost btn-sm mobile-menu-toggle"
          onClick={onMobileToggle}
          title="Open Navigation"
          style={{ padding: '0.3rem 0.5rem', display: 'none' }}
        >
          ☰
        </button>
        <div>
          <div className="header-page-title">{PAGE_LABELS[activePage] || activePage}</div>
          {active && (
            <div className="header-meta">
              {active.profile.rows?.toLocaleString()} rows &middot; {active.profile.columns} cols &middot; Health {active.profile.health.score}/100
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {dsNames.length > 1 && (
          <div className="dataset-select-wrap">
            <select value={activeDataset || ''} onChange={(e) => setActiveDataset(e.target.value)}>
              {dsNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onNavigate && onNavigate('upload')}
          title="Upload new dataset file"
        >
          📂 Upload New Dataset
        </button>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import Logo from '../Common/Logo';

const NAV = [
  { section: 'Data Management', items: [
    { id: 'upload',   icon: '📂', label: 'Upload Dataset' },
    { id: 'overview', icon: '▦',  label: 'Dataset Overview' },
    { id: 'charts',   icon: '◈',  label: 'Charts & Visuals' },
  ]},
  { section: 'AI Analytics', items: [
    { id: 'ai-report', icon: '◎', label: 'Executive AI Report' },
    { id: 'chat',      icon: '◷', label: 'Conversational Data Chat' },
    { id: 'predict',   icon: '◬', label: 'Predictive Analytics' },
    { id: 'code-gen',  icon: '◧', label: 'Code Generator' },
    { id: 'schema',    icon: '◉', label: 'Schema & Data Drift' },
    { id: 'meeting',   icon: '◪', label: 'Meeting Summarizer' },
    { id: 'twin',      icon: '◫', label: 'Digital Twin Simulation' },
  ]},
  { section: 'Reporting & Export', items: [
    { id: 'dashboard', icon: '◰', label: 'Custom Dashboard' },
    { id: 'export',    icon: '◱', label: 'Export Hub (PDF/DOCX)' },
  ]},
];

export default function Sidebar({ activePage, onNavigate, mobileOpen, onMobileClose }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={onMobileClose} />
      )}
      <aside className={`sidebar ${expanded ? 'expanded' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <Logo size={28} showText={expanded} to={null} />
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="nav-group-label">{group.section}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onMobileClose) onMobileClose();
                  }}
                  title={!expanded ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Toggle */}
        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={() => setExpanded((e) => !e)}>
            {expanded ? '‹' : '›'}
          </button>
        </div>
      </aside>
    </>
  );
}

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { removeDuplicates, fillMissingValues, fmtNumber } from '../../utils/dataParser';

export default function OverviewPage({ onNavigate }) {
  const { active, updateDataset, addToast } = useData();
  const [cleaning, setCleaning] = useState(false);
  const [fillStrategy, setFillStrategy] = useState('mean');
  const [showAllStats, setShowAllStats] = useState(false);

  if (!active) return null;

  const { profile, data, columns, columnTypes, fileName } = active;
  const missingEntries = Object.entries(profile.missing_values || {});
  const scoreColor = profile.health.score >= 85 ? 'var(--status-success)' : profile.health.score >= 65 ? 'var(--status-warning)' : 'var(--status-error)';
  const circumference = 2 * Math.PI * 28;
  const dash = (profile.health.score / 100) * circumference;

  async function handleClean() {
    setCleaning(true);
    await new Promise((r) => setTimeout(r, 300));
    let cleaned = removeDuplicates(data);
    cleaned = fillMissingValues(cleaned, columns, columnTypes, fillStrategy);
    updateDataset(fileName, cleaned);
    addToast(`Dataset cleaned successfully.`, 'success');
    setCleaning(false);
  }

  return (
    <div className="section-enter">
      {/* Dataset Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            Active Dataset
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
            {fileName}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            {profile.rows?.toLocaleString()} rows &middot; {profile.columns} columns &middot;&nbsp;
            {profile.numeric_columns?.length} numeric &middot; {profile.categorical_columns?.length} categorical &middot; {profile.datetime_columns?.length} datetime
          </div>
        </div>

        {/* Health Ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="health-ring">
            <svg viewBox="0 0 64 64">
              <circle className="health-ring-bg" cx="32" cy="32" r="28" />
              <circle
                className="health-ring-fill"
                cx="32" cy="32" r="28"
                stroke={scoreColor}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset="0"
              />
            </svg>
            <div className="health-ring-text">
              <span className="health-score" style={{ color: scoreColor }}>{profile.health.score}</span>
              <span className="health-label-sm">score</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: scoreColor }}>{profile.health.status}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {profile.health.missing_cells} missing · {profile.health.duplicate_rows} duplicates
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Rows', value: profile.rows?.toLocaleString() },
          { label: 'Columns', value: profile.columns },
          { label: 'Quality Score', value: `${profile.health.score}`, unit: '/ 100' },
          { label: 'Missing Cells', value: profile.health.missing_cells?.toLocaleString() },
          { label: 'Duplicate Rows', value: profile.health.duplicate_rows?.toLocaleString() },
          { label: 'Numeric Columns', value: profile.numeric_columns?.length },
        ].map((k) => (
          <div key={k.label} className="stat-card">
            <div className="stat-label">{k.label}</div>
            <div className="stat-value">
              {k.value}
              {k.unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '2px' }}>{k.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Data Cleaner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
            Data Cleaner
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Remove duplicates and fill missing values with one click
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="select" style={{ width: 'auto' }} value={fillStrategy} onChange={(e) => setFillStrategy(e.target.value)}>
            <option value="mean">Fill with mean</option>
            <option value="median">Fill with median</option>
            <option value="zero">Fill with zero</option>
          </select>
          <button className="btn btn-primary" onClick={handleClean} disabled={cleaning}>
            {cleaning ? <><div className="spinner" /> Cleaning…</> : 'Clean Dataset'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ marginBottom: '0.75rem' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '0.6rem' }}>
          {[
            { id: 'charts',    label: 'Charts', desc: '19 chart types with AI explainer' },
            { id: 'ai-report', label: 'AI Report', desc: 'Executive report + PPT export' },
            { id: 'chat',      label: 'Data Chat', desc: 'Ask questions about your data' },
            { id: 'predict',   label: 'Predictions', desc: 'Forecast + anomaly detection' },
            { id: 'code-gen',  label: 'Code Generator', desc: 'Pandas, SQL, DAX, Plotly' },
            { id: 'twin',      label: 'Digital Twin', desc: 'What-if scenario simulator' },
          ].map((a) => (
            <button key={a.id} onClick={() => onNavigate(a.id)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--t-fast)',
                outline: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{a.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Numeric Stats Table */}
      {Object.keys(profile.describe_numeric || {}).length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div className="section-title">Column Statistics</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAllStats((v) => !v)}>
              {showAllStats ? 'Show less' : 'Show all'}
            </button>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column</th><th>Count</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(profile.describe_numeric || {})
                  .slice(0, showAllStats ? undefined : 6)
                  .map(([col, s]) => (
                    <tr key={col}>
                      <td style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{col}</td>
                      <td>{s.count?.toLocaleString()}</td>
                      <td>{fmtNumber(s.mean)}</td>
                      <td>{fmtNumber(s.median)}</td>
                      <td>{fmtNumber(s.min)}</td>
                      <td>{fmtNumber(s.max)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Missing Values */}
      {missingEntries.length > 0 && (
        <div>
          <div className="section-title" style={{ marginBottom: '0.65rem' }}>Missing Values</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.45rem' }}>
            {missingEntries.map(([col, count]) => {
              const pct = ((count / (profile.rows || 1)) * 100);
              const isHigh = pct > 30;
              return (
                <div key={col} style={{
                  padding: '0.55rem 0.75rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{col}</span>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: isHigh ? 'var(--status-error)' : 'var(--status-warning)' }}>
                      {count} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(100, pct)}%`,
                      background: isHigh ? 'var(--status-error)' : 'var(--status-warning)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

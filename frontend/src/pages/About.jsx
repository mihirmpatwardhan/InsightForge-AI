import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Logo from '../components/Common/Logo';
import { motion } from 'framer-motion';

export default function About() {
  const features = [
    { icon: '📊', name: 'Interactive Visual Analytics', desc: 'Instantly generate 19+ chart types including Bar, Line, Heatmap, Scatter, and 3D Surface with complete interactivity.' },
    { icon: '🤖', name: 'Executive AI Reports', desc: 'Generate McKinsey-style strategic insights and PDF reports automatically from your raw dataset.' },
    { icon: '🔮', name: 'Predictive Forecasting', desc: 'Run linear regressions with 80% confidence intervals and Z-score anomaly detection algorithms.' },
    { icon: '💬', name: 'Conversational Data Chat', desc: 'Ask natural language questions about your data and receive instant statistical answers and filtered views.' },
    { icon: '🧬', name: 'Schema & Data Drift', desc: 'Automatically detect foreign keys, missing values, and compare dataset versions to monitor data health.' },
    { icon: '👩‍💻', name: 'Automated Code Gen', desc: 'Instantly export pandas, SQL, DAX, and Plotly.js code to replicate your analysis in production environments.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Global Navbar */}
      <Navbar />

      <main style={{ width: '100%', padding: '4rem 6%', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Hero Section: 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '6rem', alignItems: 'center', marginBottom: '6rem' }}>
            <div>
              <div className="badge badge-accent" style={{ marginBottom: '1rem', padding: '6px 14px', fontSize: '0.8rem' }}>
                💡 About InsightForge AI
              </div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Empowering Teams to Make <br/>
                <span style={{ color: 'var(--text-accent)' }}>Data-Driven Decisions</span>
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                InsightForge AI was built to solve a fundamental business problem: raw data is abundant, but actionable executive insights take hours of manual effort. Our platform bridges this gap by combining automated statistical profiling with generative AI capabilities.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started for Free →
              </Link>
            </div>
            
            {/* Visual Graphic Element */}
            <div style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-xl)', 
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--accent)', filter: 'blur(80px)', opacity: 0.15 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dataset Intelligence Process</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { step: '1', title: 'Data Ingestion & Parsing', color: 'var(--status-success)' },
                  { step: '2', title: 'Statistical Profiling & Cleaning', color: 'var(--status-warning)' },
                  { step: '3', title: 'AI Feature & Insight Extraction', color: 'var(--text-accent)' },
                  { step: '4', title: 'Executive Report Generation', color: '#8884d8' }
                ].map(s => (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                      {s.step}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section style={{ marginBottom: '5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Enterprise Platform Features
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
                Everything you need to turn raw datasets into board-ready insights in seconds.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              {features.map((item) => (
                <div key={item.name} className="card lift" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{item.name}</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="glass-panel" style={{ padding: '3rem', marginBottom: '3.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Privacy & Security First
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 auto', maxWidth: '800px' }}>
              All dataset files are parsed <strong>locally in your browser</strong> using PapaParse and XLSX. Only aggregated statistical profiles (column types, min/max/mean metrics, missing value counts) are sent to the AI backend — ensuring your raw sensitive rows stay 100% protected and are never uploaded to any server.
            </p>
          </section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '2.5rem 6% 2rem', marginTop: '4rem' }}>
        <div style={{ width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Logo size={28} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} InsightForge AI. Enterprise Data Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}

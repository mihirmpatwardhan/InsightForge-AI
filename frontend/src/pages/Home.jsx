import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import Logo from '../components/Common/Logo';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    {
      icon: '📊',
      title: 'Auto-Generated Dashboards',
      desc: 'Instantly transform raw CSV or Excel datasets into interactive Power BI-style charts with intelligent column grouping.',
    },
    {
      icon: '🔮',
      title: 'Predictive Analytics',
      desc: 'Run linear regression forecasting with 80% confidence bands and Z-score anomaly detection in one click.',
    },
    {
      icon: '🤖',
      title: 'AI Executive Reports',
      desc: 'Generate comprehensive McKinsey-style business strategy reports, data quality assessments, and actionable recommendations.',
    },
    {
      icon: '🔍',
      title: 'Schema & Dataset Compare',
      desc: 'Detect foreign key relationships, data drift, missing value shifts, and schema issues across dataset revisions.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="home-hero" style={{ padding: '5rem 6% 3rem', textAlign: 'center', width: '100%', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="badge badge-accent" style={{ marginBottom: '1.5rem', padding: '6px 14px', fontSize: '0.8rem' }}>
            ⚡ Enterprise-Grade AI Data Intelligence Platform
          </div>
          
          <h1 className="home-hero-title" style={{ fontSize: '3.75rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Forging Raw Data into <br/>
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Actionable Intelligence
            </span>
          </h1>

          <p className="home-hero-text" style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}>
            InsightForge AI automatically cleans your data, renders deep statistical visualizations, builds predictive forecast models, and generates executive business reports.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Start Analyzing Free →
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Learn How It Works
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '5rem', textAlign: 'left' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="card lift"
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ fontSize: '2.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '3rem 6% 2rem', marginTop: '4rem' }}>
        <div style={{ width: '100%', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <Logo size={32} />
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '300px', marginTop: '0.75rem' }}>
              Enterprise data intelligence platform built with React, FastAPI, Plotly, and Gemini AI.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Navigation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
                <Link to="/about" style={{ color: 'var(--text-secondary)' }}>About</Link>
                <Link to="/login" style={{ color: 'var(--text-secondary)' }}>Sign In</Link>
                <Link to="/signup" style={{ color: 'var(--text-secondary)' }}>Sign Up</Link>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Features</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Auto Dashboards</span>
                <span>Predictive Forecasting</span>
                <span>AI Executive Reports</span>
                <span>Export PDF / DOCX / PPTX</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', margin: '0 auto', borderTop: '1px solid var(--border-faint)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>© {new Date().getFullYear()} InsightForge AI. All rights reserved.</div>
          <div>Built for enterprise performance & speed</div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './hooks/useData';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FileUploader from './components/Upload/FileUploader';
import OverviewPage from './components/Overview/OverviewPage';
import ChartPanel from './components/Charts/ChartPanel';
import ReportPanel from './components/AI/ReportPanel';
import ChatPanel from './components/AI/ChatPanel';
import MeetingSummary from './components/AI/MeetingSummary';
import PredictivePanel from './components/Tools/PredictivePanel';
import CodeGenerator from './components/Tools/CodeGenerator';
import SchemaDetector from './components/Tools/SchemaDetector';
import DigitalTwin from './components/Tools/DigitalTwin';
import Dashboard from './components/Dashboard/Dashboard';
import ExportHub from './components/Export/ExportHub';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/globals.css';
import './styles/components.css';
import './styles/animations.css';

// ── Toast Container ──
function Toasts() {
  const { toasts, removeToast } = useData();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Landing (no dataset) ──
function Landing({ onNavigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <FileUploader onNavigate={onNavigate} />
      <Toasts />
    </div>
  );
}

// ── Main App Shell ──
function AppShell() {
  const { active, pinChart } = useData();
  const [page, setPage] = useState('overview');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  function navigate(id) {
    setPage(id);
    setMobileOpen(false);
  }

  // If no dataset is active, force the user to the upload page. Otherwise, show their requested page.
  const activePage = !active ? 'upload' : page;

  function renderPage() {
    switch (activePage) {
      case 'upload':    return <FileUploader onNavigate={navigate} />;
      case 'overview':  return <OverviewPage onNavigate={navigate} />;
      case 'charts':    return <ChartPanel onPinChart={pinChart} />;
      case 'ai-report': return <ReportPanel />;
      case 'chat':      return <ChatPanel />;
      case 'predict':   return <PredictivePanel />;
      case 'code-gen':  return <CodeGenerator />;
      case 'schema':    return <SchemaDetector />;
      case 'meeting':   return <MeetingSummary />;
      case 'twin':      return <DigitalTwin />;
      case 'dashboard': return <Dashboard />;
      case 'export':    return <ExportHub />;
      default:          return <FileUploader onNavigate={navigate} />;
    }
  }

  return (
    <div className="app-layout">
      <Sidebar 
        activePage={activePage} 
        onNavigate={navigate} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`main-area ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <Header 
          activePage={activePage} 
          sidebarExpanded={sidebarExpanded} 
          onMobileToggle={() => setMobileOpen((m) => !m)}
          onNavigate={navigate}
        />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
      <Toasts />

      {/* Floating Scroll To Top Button */}
      <button
        className="floating-scroll-top"
        onClick={() => {
          document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

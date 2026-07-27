import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 32, showText = true, to = '/' }) {
  const logoSvg = (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect width="240" height="240" rx="44" fill="#1C1C1C"/>
      <rect x="2" y="2" width="236" height="236" rx="42" stroke="url(#logo_border)" strokeWidth="3" strokeOpacity="0.4"/>
      
      {/* Monogram Bar Columns */}
      <rect x="48" y="125" width="24" height="50" rx="5" fill="#78350F"/>
      <rect x="78" y="100" width="24" height="75" rx="5" fill="#B45309"/>
      <rect x="108" y="75" width="24" height="100" rx="5" fill="#D97706"/>
      <rect x="138" y="50" width="24" height="125" rx="5" fill="url(#logo_bar)"/>
      
      {/* Top Anvil Crest Line */}
      <path d="M42 125L168 50H194L168 80H42V125Z" fill="url(#logo_crest)" opacity="0.9"/>
      
      {/* Top Insight Spark Node */}
      <circle cx="184" cy="50" r="9" fill="#FBBF24"/>
      <circle cx="184" cy="50" r="16" stroke="#FBBF24" strokeWidth="2" strokeDasharray="3 3" opacity="0.6"/>
      
      <defs>
        <linearGradient id="logo_bar" x1="138" y1="50" x2="162" y2="175" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B"/>
          <stop offset="1" stopColor="#D97706"/>
        </linearGradient>
        <linearGradient id="logo_crest" x1="42" y1="50" x2="194" y2="125" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24"/>
          <stop offset="1" stopColor="#B45309"/>
        </linearGradient>
        <linearGradient id="logo_border" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B"/>
          <stop offset="1" stopColor="#171717"/>
        </linearGradient>
      </defs>
    </svg>
  );

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
      {logoSvg}
      {showText && (
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          InsightForge <span style={{ color: 'var(--text-accent)' }}>AI</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>;
  }

  return content;
}

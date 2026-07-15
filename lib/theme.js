// lib/theme.js
// Chalk & Circuit brand colors, applied to a CoGrader-style layout.
export const C = {
  navy: '#1c3557',
  gold: '#b57c2a',
  green: '#1a7a3e',
  red: '#b03a2e',
  purple: '#7a4fb5',
  blue: '#2d6cb0',
  bg: '#f7f5f0',
  card: '#ffffff',
  border: '#e3ddd0',  // matches Student Portfolio / Lesson Planner ecosystem tokens
  muted: '#8a7d6e',
  sidebarBg: '#fafaf7',
}

export const LEVELS = ['Developing', 'Emerging', 'Proficient', 'Extending']

export const LEVEL_COLORS = {
  Developing: '#b03a2e',
  Emerging: '#b57c2a',
  Proficient: '#2d6cb0',
  Extending: '#1a7a3e',
}

// Header/sidebar wordmark stays serif across the whole Chalk & Circuit
// ecosystem (matches Student Portfolio and Lesson Planner). Page body
// content uses the same sans family those apps use, for a consistent
// feel across all three products.
export const FONT_BRAND = 'Georgia, serif'
export const FONT_BODY = "'Segoe UI', sans-serif"

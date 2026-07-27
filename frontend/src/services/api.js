// NexusViz AI — Frontend API Service
// Communicates with FastAPI backend at /api/*

const BASE = '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res;
}

async function post(endpoint, body) {
  const res = await request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  return res.json();
}

// ── Status ──
export async function getStatus() {
  const res = await request('/status');
  return res.json();
}

// ── AI Reports ──
export async function generateReport(fileName, profile, chartContext = '') {
  return post('/report', { file_name: fileName, profile, chart_context: chartContext });
}
export async function generateRecommendations(fileName, profile, chartContext = '') {
  return post('/recommendations', { file_name: fileName, profile, chart_context: chartContext });
}
export async function generateChatResponse(fileName, profile, chartContext, userQuestion, history = []) {
  return post('/chat', { file_name: fileName, profile, chart_context: chartContext, user_question: userQuestion, history });
}
export async function generateChartExplanation(chartType, xCol, yCol, aggFunc, dataSummary) {
  return post('/explain-chart', { chart_type: chartType, x_col: xCol, y_col: yCol, agg_func: aggFunc, data_summary: dataSummary });
}
export async function generateSchemaInsights(profile, fileName) {
  return post('/schema-insights', { profile, file_name: fileName });
}
export async function compareDatasets(profileOld, profileNew, nameOld, nameNew) {
  return post('/compare-datasets', { profile_old: profileOld, profile_new: profileNew, name_old: nameOld, name_new: nameNew });
}
export async function generateCode(analysisType, xCol, yCol, aggFunc, datasetName, language) {
  return post('/generate-code', { analysis_type: analysisType, x_col: xCol, y_col: yCol, agg_func: aggFunc, dataset_name: datasetName, language });
}

// ── Meeting Summary ──
export async function generateMeetingSummary(text) {
  const formData = new FormData();
  formData.append('text', text);
  const res = await request('/meeting-summary', {
    method: 'POST',
    headers: {},
    body: formData,
  });
  return res.json();
}
export async function generateMeetingSummaryFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request('/meeting-summary', {
    method: 'POST',
    headers: {},
    body: formData,
  });
  return res.json();
}

// ── Predictive Analytics ──
export async function runForecast(values, periods = 30) {
  return post('/predict', { values, periods });
}
export async function detectAnomalies(values, thresholdSigma = 2.5) {
  return post('/detect-anomalies', { values, threshold_sigma: thresholdSigma });
}

// ── Export Hub ──
export async function exportDocument(title, content, format, datasetName = 'Dataset') {
  const res = await request('/export', {
    method: 'POST',
    body: JSON.stringify({ title, content, format, dataset_name: datasetName }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const exts = { pdf: '.pdf', docx: '.docx', pptx: '.pptx' };
  a.download = `NexusViz_${title.replace(/\s+/g, '_')}${exts[format] || '.pdf'}`;
  a.click();
  URL.revokeObjectURL(url);
}

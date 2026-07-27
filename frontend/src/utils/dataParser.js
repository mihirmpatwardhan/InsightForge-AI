import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ── Helpers ──
const isNumeric = (val) => val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
const isDate = (val) => {
  if (!val || typeof val !== 'string') return false;
  if (/^\d{4}$/.test(val.trim())) return false; // skip 4-digit years
  const d = new Date(val);
  return !isNaN(d.getTime()) && val.length > 5;
};

// ── Parse CSV File ──
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length && results.data.length === 0) {
          reject(new Error('CSV parse failed: ' + results.errors[0].message));
        } else {
          resolve({ data: results.data, columns: results.meta.fields || [] });
        }
      },
      error: (err) => reject(err),
    });
  });
}

// ── Parse Excel File ──
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const sheets = {};
        wb.SheetNames.forEach((name) => {
          const ws = wb.Sheets[name];
          const data = XLSX.utils.sheet_to_json(ws, { defval: null });
          const columns = data.length > 0 ? Object.keys(data[0]) : [];
          sheets[name] = { data, columns };
        });
        resolve(sheets);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ── Determine Column Types ──
export function detectColumnTypes(data, columns) {
  const types = {};
  columns.forEach((col) => {
    const vals = data.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== '');
    if (vals.length === 0) { types[col] = 'empty'; return; }
    const numericCount = vals.filter(isNumeric).length;
    const dateCount = vals.filter(isDate).length;
    if (numericCount / vals.length > 0.85) types[col] = 'numeric';
    else if (dateCount / vals.length > 0.7) types[col] = 'datetime';
    else types[col] = 'categorical';
  });
  return types;
}

// ── Coerce Numeric ──
export function coerceData(data, columnTypes) {
  return data.map((row) => {
    const newRow = { ...row };
    Object.entries(columnTypes).forEach(([col, type]) => {
      if (type === 'numeric' && newRow[col] !== null && newRow[col] !== '') {
        newRow[col] = Number(newRow[col]);
        if (isNaN(newRow[col])) newRow[col] = null;
      }
    });
    return newRow;
  });
}

// ── Dataset Profile ──
export function buildProfile(data, columns, columnTypes) {
  const numericCols = columns.filter((c) => columnTypes[c] === 'numeric');
  const catCols = columns.filter((c) => columnTypes[c] === 'categorical');
  const dateCols = columns.filter((c) => columnTypes[c] === 'datetime');

  // Missing values
  const missingValues = {};
  columns.forEach((col) => {
    const missing = data.filter((r) => r[col] === null || r[col] === undefined || r[col] === '').length;
    if (missing > 0) missingValues[col] = missing;
  });

  // Top categories
  const topCategories = {};
  catCols.slice(0, 5).forEach((col) => {
    const counts = {};
    data.forEach((r) => {
      const v = String(r[col] ?? '(null)');
      counts[v] = (counts[v] || 0) + 1;
    });
    topCategories[col] = Object.fromEntries(
      Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    );
  });

  // Numeric describe
  const describeNumeric = {};
  numericCols.forEach((col) => {
    const vals = data.map((r) => r[col]).filter((v) => v !== null && !isNaN(v)).map(Number).sort((a, b) => a - b);
    if (vals.length === 0) return;
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / vals.length;
    const mid = Math.floor(vals.length / 2);
    describeNumeric[col] = {
      count: vals.length,
      mean: +mean.toFixed(2),
      min: vals[0],
      max: vals[vals.length - 1],
      median: vals.length % 2 ? vals[mid] : +(((vals[mid - 1] + vals[mid]) / 2).toFixed(2)),
    };
  });

  // Health score
  const totalCells = data.length * columns.length;
  const missingCells = Object.values(missingValues).reduce((a, b) => a + b, 0);
  const seen = new Set();
  const dupRows = data.filter((r) => {
    const key = JSON.stringify(r);
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  }).length;
  const missingPenalty = totalCells > 0 ? (missingCells / totalCells) * 50 : 0;
  const dupPenalty = data.length > 0 ? (dupRows / data.length) * 30 : 0;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - missingPenalty - dupPenalty)));
  const healthStatus = healthScore >= 85 ? 'Excellent' : healthScore >= 70 ? 'Good' : healthScore >= 50 ? 'Fair' : 'Needs Cleaning';

  return {
    rows: data.length,
    columns: columns.length,
    numeric_columns: numericCols,
    categorical_columns: catCols,
    datetime_columns: dateCols,
    missing_values: missingValues,
    describe_numeric: describeNumeric,
    top_categories: topCategories,
    health: { score: healthScore, status: healthStatus, duplicate_rows: dupRows, missing_cells: missingCells, total_cells: totalCells },
  };
}

// ── Grouped Aggregation ──
export function groupedAggregation(data, groupCols, valueCol, aggFunc) {
  if (!Array.isArray(groupCols)) groupCols = [groupCols];
  const groups = {};
  data.forEach((row) => {
    const key = groupCols.map((c) => String(row[c] ?? '(null)')).join(' | ');
    if (!groups[key]) groups[key] = { ...Object.fromEntries(groupCols.map((c, i) => [c, groupCols.length === 1 ? row[c] : key])), _vals: [] };
    const v = Number(row[valueCol]);
    if (!isNaN(v)) groups[key]._vals.push(v);
  });

  return Object.values(groups).map((g) => {
    const vals = g._vals;
    let result;
    if (vals.length === 0) { result = 0; }
    else {
      switch (aggFunc) {
        case 'sum':    result = vals.reduce((a, b) => a + b, 0); break;
        case 'mean':   result = vals.reduce((a, b) => a + b, 0) / vals.length; break;
        case 'count':  result = vals.length; break;
        case 'min':    result = Math.min(...vals); break;
        case 'max':    result = Math.max(...vals); break;
        case 'median': {
          const sorted = [...vals].sort((a, b) => a - b);
          const m = Math.floor(sorted.length / 2);
          result = sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
          break;
        }
        default: result = vals.reduce((a, b) => a + b, 0);
      }
    }
    const row = { ...g };
    delete row._vals;
    row[valueCol] = +result.toFixed(4);
    return row;
  }).sort((a, b) => b[valueCol] - a[valueCol]);
}

// ── Remove Duplicates ──
export function removeDuplicates(data) {
  const seen = new Set();
  return data.filter((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Fill Missing Values ──
export function fillMissingValues(data, columns, columnTypes, strategy) {
  const stats = {};
  columns.forEach((col) => {
    if (columnTypes[col] === 'numeric') {
      const vals = data.map((r) => r[col]).filter((v) => v !== null && !isNaN(Number(v))).map(Number);
      if (vals.length === 0) return;
      if (strategy === 'mean') stats[col] = vals.reduce((a, b) => a + b, 0) / vals.length;
      else if (strategy === 'median') {
        const sorted = [...vals].sort((a, b) => a - b);
        const m = Math.floor(sorted.length / 2);
        stats[col] = sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
      } else if (strategy === 'zero') stats[col] = 0;
    }
  });
  return data.map((row) => {
    const newRow = { ...row };
    columns.forEach((col) => {
      if (newRow[col] === null || newRow[col] === undefined || newRow[col] === '') {
        if (stats[col] !== undefined) newRow[col] = +stats[col].toFixed(4);
      }
    });
    return newRow;
  });
}

// ── Value Count (for Pie/Donut, top-N capped) ──
export function valueCounts(data, col, topN = 10) {
  const counts = {};
  data.forEach((r) => { const v = String(r[col] ?? '(null)'); counts[v] = (counts[v] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length <= topN) return sorted.map(([name, value]) => ({ name, value }));
  const top = sorted.slice(0, topN);
  const otherCount = sorted.slice(topN).reduce((a, [, v]) => a + v, 0);
  return [...top.map(([name, value]) => ({ name, value })), { name: 'Other', value: otherCount }];
}

// ── Export CSV (client-side) ──
export function exportCSV(data, fileName = 'data.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Format Number ──
export function fmtNumber(n) {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

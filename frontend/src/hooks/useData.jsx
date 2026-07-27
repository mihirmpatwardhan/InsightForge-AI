import React, { createContext, useContext, useState, useCallback } from 'react';
import { parseCSV, parseExcel, detectColumnTypes, coerceData, buildProfile } from '../utils/dataParser';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [datasets, setDatasets] = useState({});      // { name: { data, columns, columnTypes, profile } }
  const [activeDataset, setActiveDataset] = useState(null);
  const [pinnedCharts, setPinnedCharts] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadFiles = useCallback(async (files) => {
    const newDatasets = { ...datasets };
    let lastLoaded = null;

    for (const file of files) {
      try {
        const name = file.name;
        if (name.toLowerCase().endsWith('.csv')) {
          const { data, columns } = await parseCSV(file);
          const columnTypes = detectColumnTypes(data, columns);
          const coerced = coerceData(data, columnTypes);
          const profile = buildProfile(coerced, columns, columnTypes);
          newDatasets[name] = { data: coerced, columns, columnTypes, profile, fileName: name };
          addToast(`✅ Loaded: ${name} (${coerced.length} rows)`, 'success');
          lastLoaded = name;
        } else if (/\.xlsx?$/i.test(name)) {
          const sheets = await parseExcel(file);
          const sheetNames = Object.keys(sheets);
          sheetNames.forEach((sheetName) => {
            const { data, columns } = sheets[sheetName];
            const columnTypes = detectColumnTypes(data, columns);
            const coerced = coerceData(data, columnTypes);
            const profile = buildProfile(coerced, columns, columnTypes);
            const key = sheetNames.length > 1 ? `${name} (${sheetName})` : name;
            newDatasets[key] = { data: coerced, columns, columnTypes, profile, fileName: name };
            lastLoaded = key;
          });
          addToast(`✅ Loaded: ${name} (${sheetNames.length} sheet${sheetNames.length > 1 ? 's' : ''})`, 'success');
        }
      } catch (err) {
        addToast(`❌ Error loading ${file.name}: ${err.message}`, 'error');
      }
    }
    
    setDatasets(newDatasets);
    if (lastLoaded) {
      setActiveDataset(lastLoaded);
    }
    return lastLoaded;
  }, [datasets, addToast]);

  const updateDataset = useCallback((name, newData) => {
    setDatasets((prev) => {
      const ds = prev[name];
      if (!ds) return prev;
      const profile = buildProfile(newData, ds.columns, ds.columnTypes);
      return { ...prev, [name]: { ...ds, data: newData, profile } };
    });
  }, []);

  const removeDataset = useCallback((name) => {
    setDatasets((prev) => {
      const next = { ...prev };
      delete next[name];
      if (activeDataset === name) {
        const remaining = Object.keys(next);
        setActiveDataset(remaining[0] || null);
      }
      return next;
    });
  }, [activeDataset]);

  const pinChart = useCallback((chartConfig) => {
    setPinnedCharts((prev) => [...prev, { ...chartConfig, id: Date.now() }]);
    addToast('📌 Chart pinned to dashboard!', 'success');
  }, [addToast]);

  const unpinChart = useCallback((id) => {
    setPinnedCharts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const active = activeDataset ? datasets[activeDataset] : null;

  return (
    <DataContext.Provider value={{
      datasets, activeDataset, setActiveDataset,
      active, loadFiles, updateDataset, removeDataset,
      pinnedCharts, pinChart, unpinChart,
      compareMode, setCompareMode, compareTarget, setCompareTarget,
      toasts, addToast, removeToast,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}

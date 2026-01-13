
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { FileUploader } from './components/FileUploader';
import { QRScanner } from './components/QRScanner';
import { EmployeeCard } from './components/EmployeeCard';
import { ManualSearch } from './components/ManualSearch';
import { DataStatus } from './components/DataStatus';
import { Report } from './components/Report';
import { SubmissionModal } from './components/SubmissionModal';
import { Employee, AppStatus, SyncPackage, SyncMetadata, NormalizedPackage } from './types';
import { STORAGE_KEY, SYNC_URL, SYNC_BASE_URL, SYNC_INTERVAL_MS, LAST_SYNC_KEY } from './constants';
import LZString from 'https://esm.sh/lz-string';

enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT'
}

const CHUNK_SIZE = 55000; // Leave room for overhead in the 64KB limit

/** 
 * HIGH CAPACITY NORMALIZATION ENGINE
 */
const normalize = (employees: Employee[]): NormalizedPackage => {
  const meals: string[] = [];
  const comps: string[] = [];
  const camps: string[] = [];
  const accs: string[] = [];

  const getIdx = (arr: string[], val: string) => {
    let idx = arr.indexOf(val);
    if (idx === -1) {
      idx = arr.length;
      arr.push(val);
    }
    return idx;
  };

  const rows = employees.map(e => [
    e.employeeId,
    e.employeeName,
    getIdx(meals, e.mealType),
    getIdx(comps, e.companyName),
    getIdx(camps, e.campAllocation),
    getIdx(accs, e.accessCard),
    e.cardNumber
  ]);

  return { r: rows, m: meals, c: comps, l: camps, a: accs };
};

const denormalize = (pkg: NormalizedPackage): Employee[] => {
  return pkg.r.map(row => ({
    employeeId: row[0],
    employeeName: row[1],
    mealType: pkg.m[row[2]],
    companyName: pkg.c[row[3]],
    campAllocation: pkg.l[row[4]],
    accessCard: pkg.a[row[5]],
    cardNumber: row[6]
  }));
};

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [metadata, setMetadata] = useState<SyncMetadata | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem(LAST_SYNC_KEY));

  const [isLocalOnly, setIsLocalOnly] = useState(false);
  const [localFileName, setLocalFileName] = useState<string>('');
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  const syncFromCloud = useCallback(async (isAuto = false) => {
    if (isLocalOnly && isAuto) return;
    if (!isAuto) {
      setIsSyncing(true);
      setSyncProgress('Manifest...');
    }

    try {
      const response = await fetch(SYNC_URL, { 
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const manifest: SyncPackage = await response.json();
        
        // Fetch all chunks in parallel
        const chunkPromises = [];
        for (let i = 0; i < manifest.chunkCount; i++) {
          chunkPromises.push(
            fetch(`${SYNC_BASE_URL}_chunk_${i}`, { mode: 'cors' }).then(res => res.text())
          );
        }

        if (!isAuto) setSyncProgress(`Chunks (0/${manifest.chunkCount})`);
        
        const chunks = await Promise.all(chunkPromises);
        const fullCompressedStr = chunks.join('');
        
        const decompressedStr = LZString.decompressFromBase64(fullCompressedStr);
        if (decompressedStr) {
          const data = JSON.parse(decompressedStr);
          const cloudEmployees = data.r ? denormalize(data as NormalizedPackage) : data;
          
          const cloudDataStr = JSON.stringify(cloudEmployees);
          const localDataStr = JSON.stringify(employees);
          
          if (!isLocalOnly && (cloudDataStr !== localDataStr)) {
            setEmployees(cloudEmployees);
            setMetadata(manifest.metadata || null);
            localStorage.setItem(STORAGE_KEY, cloudDataStr);
            const now = new Date().toLocaleTimeString();
            setLastSynced(now);
            localStorage.setItem(LAST_SYNC_KEY, now);
          }
        }
      }
    } catch (err) {
      console.warn('Sync failed or bucket empty.');
    } finally {
      if (!isAuto) {
        setIsSyncing(false);
        setSyncProgress('');
      }
      setIsInitialLoad(false);
    }
  }, [employees, isLocalOnly]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setEmployees(parsed);
      } catch (e) {}
    }
    syncFromCloud();
    const interval = setInterval(() => syncFromCloud(true), SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [syncFromCloud]);

  const handleDataLoaded = (data: Employee[], fileName: string) => {
    setEmployees(data);
    setLocalFileName(fileName);
    setIsLocalOnly(true);
    setCurrentEmployee(null);
    setErrorMsg('');
    setStatus(AppStatus.IDLE);
  };

  const handleFinalSubmit = async (submitterName: string) => {
    setIsSyncing(true);
    setIsSubmissionModalOpen(false);
    setErrorMsg('');

    try {
      setSyncProgress('Normalizing...');
      const normalizedData = normalize(employees);
      
      setSyncProgress('Compressing...');
      const compressedStr = LZString.compressToBase64(JSON.stringify(normalizedData));

      // Split into chunks
      const chunks: string[] = [];
      for (let i = 0; i < compressedStr.length; i += CHUNK_SIZE) {
        chunks.push(compressedStr.substring(i, i + CHUNK_SIZE));
      }

      setSyncProgress(`Uploading 0/${chunks.length}`);
      
      // Upload chunks in sequence to ensure stability
      for (let i = 0; i < chunks.length; i++) {
        setSyncProgress(`Uploading ${i + 1}/${chunks.length}`);
        const chunkRes = await fetch(`${SYNC_BASE_URL}_chunk_${i}`, {
          method: 'PUT',
          mode: 'cors',
          body: chunks[i],
        });
        if (!chunkRes.ok) throw new Error(`Chunk ${i} upload failed`);
      }

      // Finally, upload the manifest
      setSyncProgress('Finalizing...');
      const manifest: SyncPackage = {
        chunkCount: chunks.length,
        metadata: {
          submitterName,
          fileName: localFileName,
          timestamp: new Date().toLocaleString()
        },
        v: 5
      };

      const manifestRes = await fetch(SYNC_URL, {
        method: 'PUT',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });

      if (manifestRes.ok) {
        setMetadata(manifest.metadata);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
        setLastSynced(new Date().toLocaleTimeString());
        setIsLocalOnly(false);
        setErrorMsg('');
        setStatus(AppStatus.IDLE);
      } else {
        throw new Error("Manifest upload failed");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Push failed: ${err.message || 'Check connection'}`);
      setStatus(AppStatus.ERROR);
    } finally {
      setIsSyncing(false);
      setSyncProgress('');
    }
  };

  const lookupEmployee = useCallback((query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    const found = employees.find(emp => 
      emp.cardNumber?.toString().toLowerCase() === trimmedQuery || 
      emp.employeeId?.toString().toLowerCase() === trimmedQuery
    );
    if (found) {
      setCurrentEmployee(found);
      setStatus(AppStatus.RESULT);
      setErrorMsg('');
    } else {
      setErrorMsg(`Not found: "${trimmedQuery}"`);
      setStatus(AppStatus.ERROR);
      setCurrentEmployee(null);
    }
  }, [employees]);

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24">
        <div className="flex justify-center mb-4">
          <div className="bg-zinc-900/50 p-1 rounded-2xl border border-white/5 flex">
            {['DASHBOARD', 'REPORT'].map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'}`}
              >
                {mode === 'DASHBOARD' ? 'Scanner' : 'Report'}
              </button>
            ))}
          </div>
        </div>

        {viewMode === ViewMode.DASHBOARD ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <DataStatus 
              count={employees.length} 
              metadata={isLocalOnly ? { submitterName: 'PREPARING...', fileName: localFileName, timestamp: 'Chunking Active' } : metadata}
              onClear={() => { 
                setEmployees([]); 
                setMetadata(null); 
                setIsLocalOnly(false);
                localStorage.removeItem(STORAGE_KEY); 
              }} 
              onRefresh={() => syncFromCloud()}
              lastSynced={lastSynced}
            />

            {isLocalOnly && (
              <div className="animate-in slide-in-from-top-4 duration-500">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-full animate-bounce">
                       <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                       </svg>
                    </div>
                    <div>
                      <h4 className="text-emerald-400 font-black text-xs uppercase tracking-widest">Multi-Chunk Storage Ready</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Successfully segmented {employees.length} records. Capacity: Unlimited.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSubmissionModalOpen(true)}
                    className="whitespace-nowrap bg-emerald-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                  >
                    Push All Chunks
                  </button>
                </div>
              </div>
            )}

            {isInitialLoad && employees.length === 0 ? (
              <div className="glass-card rounded-3xl p-16 text-center animate-pulse border border-cyan-500/20">
                <p className="text-cyan-500 font-black tracking-widest uppercase text-xs">Assembling Cloud Segments...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      setStatus(status === AppStatus.SCANNING ? AppStatus.IDLE : AppStatus.SCANNING);
                      setCurrentEmployee(null);
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${status === AppStatus.SCANNING ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg'}`}
                  >
                    {status === AppStatus.SCANNING ? 'Stop Scanner' : 'Launch QR Scan'}
                  </button>
                  <div className="flex-[1.5]">
                    <ManualSearch onSearch={lookupEmployee} />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-2xl border text-center font-bold text-sm bg-red-500/10 border-red-500/30 text-red-300 animate-bounce">
                    {errorMsg}
                  </div>
                )}
                
                {status === AppStatus.SCANNING && (
                  <div className="glass-card rounded-3xl p-4 overflow-hidden border-2 border-cyan-500/20">
                    <QRScanner onScanSuccess={lookupEmployee} onScanError={() => {}} />
                  </div>
                )}
                
                {status === AppStatus.RESULT && currentEmployee && (
                  <EmployeeCard employee={currentEmployee} />
                )}
                
                <div className="pt-10 mt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Master Database</h3>
                    <p className="text-[9px] text-zinc-700 uppercase">Support for 8,000+ rows using cloud segmentation</p>
                  </div>
                  <div className="w-full sm:w-auto min-w-[200px]">
                    <FileUploader 
                      onDataLoaded={handleDataLoaded} 
                      label="Upload Excel File" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Report 
            employees={employees} 
            onRecordSelect={(emp) => { 
              setCurrentEmployee(emp); 
              setStatus(AppStatus.RESULT); 
              setViewMode(ViewMode.DASHBOARD); 
            }} 
          />
        )}
      </div>

      <SubmissionModal 
        isOpen={isSubmissionModalOpen}
        fileName={localFileName}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleFinalSubmit}
      />

      {isSyncing && (
        <div className="fixed bottom-6 right-6 bg-cyan-500 text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse shadow-2xl z-50 border border-white/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-black animate-ping"></div>
          {syncProgress || 'Syncing...'}
        </div>
      )}
    </Layout>
  );
};

export default App;

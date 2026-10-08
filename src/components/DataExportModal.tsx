import React, { useRef, useState } from 'react';
import { ETRAAppState } from '../types';
import { exportStateToJson, exportTasksToCsv, exportClientsToCsv } from '../utils/storage';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  HardDrive
} from 'lucide-react';

interface DataExportModalProps {
  state: ETRAAppState;
  onClose: () => void;
  onImportState: (newState: ETRAAppState) => void;
  onResetDemoData: () => void;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  state,
  onClose,
  onImportState,
  onResetDemoData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExportJson = () => {
    exportStateToJson(state, `etra_hospitality_backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleExportTasksCsv = () => {
    exportTasksToCsv(state.macroTasks, state.clients);
  };

  const handleExportClientsCsv = () => {
    exportClientsToCsv(state.clients);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!parsed.clients || !parsed.macroTasks || !parsed.audits) {
          throw new Error('Formato file non valido: mancano le entità fondamentali.');
        }

        onImportState(parsed);
        setImportStatus('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: unknown) {
        setImportStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Errore nel caricamento del file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const totalTasks = state.macroTasks.reduce((acc, m) => acc + (m.microTasks?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl border border-[#223049] bg-[#0E1523] text-neutral-100 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#223049] px-6 py-4 bg-[#101828]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#182438] text-[#DFBA73] border border-[#C5A059]/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">
                Gestione Dati & Persistenza
              </h3>
              <p className="text-xs text-neutral-400">
                Salvataggio locale automatico, esportazioni CSV / JSON e ripristino
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1A253A] hover:text-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Storage status banner */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
            <HardDrive className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-300">Persistenza Locale Attiva (LocalStorage)</div>
              <p className="text-emerald-200/80 mt-0.5 leading-relaxed">
                Tutte le modifiche a slider di avanzamento, stati, note di lavoro, clienti e audit sono salvate in tempo reale nel browser.
                Attualmente memorizzati: <strong>{state.clients.length} strutture</strong>, <strong>{totalTasks} micro-attività</strong>.
              </p>
            </div>
          </div>

          {/* Export section */}
          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Esportazione Dati
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2.5 rounded-xl border border-[#223049] bg-[#121B2C] p-3 text-left hover:border-[#C5A059] hover:bg-[#152238] transition-all group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182438] text-[#DFBA73] group-hover:scale-105 transition-transform">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100">Backup Completo (JSON)</div>
                  <div className="text-[11px] text-neutral-400">Database completo per ripristino</div>
                </div>
              </button>

              <button
                onClick={handleExportTasksCsv}
                className="flex items-center gap-2.5 rounded-xl border border-[#223049] bg-[#121B2C] p-3 text-left hover:border-[#C5A059] hover:bg-[#152238] transition-all group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182438] text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100">Attività & Gantt (CSV)</div>
                  <div className="text-[11px] text-neutral-400">Foglio Excel con SAL, note e scadenze</div>
                </div>
              </button>

              <button
                onClick={handleExportClientsCsv}
                className="flex items-center gap-2.5 rounded-xl border border-[#223049] bg-[#121B2C] p-3 text-left hover:border-[#C5A059] hover:bg-[#152238] transition-all group sm:col-span-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182438] text-amber-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-100">Anagrafica Clienti & Servizi (CSV)</div>
                  <div className="text-[11px] text-neutral-400">Elenco boutique hotel, contratti, retainer e PMS</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Importazione Backup (JSON)
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#223049] bg-[#121B2C] p-4 text-xs font-medium text-neutral-300 hover:border-[#C5A059] hover:text-[#DFBA73] transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Seleziona file JSON dal computer da ripristinare</span>
            </button>

            {importStatus === 'success' && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Dati importati con successo! Aggiornamento in corso...</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Reset section */}
          <div className="border-t border-[#223049] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-300">Ripristina Dati Esempio ETRA</div>
                <div className="text-[11px] text-neutral-400">Ricarica il portfolio boutique demo (Venezia, Chianti, Firenze)</div>
              </div>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#223049] bg-[#141E30] px-3 py-1.5 text-xs text-neutral-300 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Dati Demo</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onResetDemoData();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                  >
                    Conferma Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="rounded-lg bg-[#182438] px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white"
                  >
                    Annulla
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#223049] bg-[#101828] px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#1A263B] border border-[#223049] px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-[#202E47] transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

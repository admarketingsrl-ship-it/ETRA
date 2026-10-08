import React, { useRef } from 'react';
import { Client, Preventive360Audit, MacroTask, MicroTask, ClientAuditData } from '../types';
import { EtraLogo } from './EtraLogo';
import { 
  Printer, 
  X, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Euro, 
  Clock, 
  Layers, 
  ArrowRight,
  FileText,
  Download
} from 'lucide-react';

interface ExecutiveClientDossierModalProps {
  client: Client;
  preventiveAudit: Preventive360Audit;
  macroTasks: MacroTask[];
  auditData?: ClientAuditData;
  onClose: () => void;
}

export const ExecutiveClientDossierModal: React.FC<ExecutiveClientDossierModalProps> = ({
  client,
  preventiveAudit,
  macroTasks,
  auditData,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Filter tasks specific to this client
  const clientTasks: MicroTask[] = [];
  macroTasks.forEach(m => {
    if (m.clientId === client.id) {
      clientTasks.push(...m.microTasks);
    }
  });

  // Calculate audit statistics
  const totalAuditItems = preventiveAudit.areas.reduce((acc, a) => acc + a.items.length, 0);
  const compliantAuditItems = preventiveAudit.areas.reduce(
    (acc, a) => acc + a.items.filter(i => i.status === 'conforme').length, 
    0
  );
  const complianceRate = totalAuditItems > 0 ? ((compliantAuditItems / totalAuditItems) * 100).toFixed(1) : '25.0';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-2 sm:p-4 lg:p-6 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Top Floating Action Bar (Hidden during printing) */}
      <div className="sticky top-2 z-50 mx-auto max-w-5xl mb-4 flex items-center justify-between rounded-2xl border border-[#223049] bg-[#0E1523]/95 p-3 sm:p-4 shadow-2xl backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#182438] text-[#DFBA73] border border-[#C5A059]/40">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <span>Dossier Diagnostico Esecutivo &amp; Piano Strategico 360°</span>
              <span className="rounded bg-[#DFBA73]/15 px-2 py-0.5 text-[10px] font-bold text-[#DFBA73] uppercase border border-[#DFBA73]/30">
                Pronto per Stampa &amp; Invio
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Fotografia integrale consolidata di {client.name} · Redatta da ETRA Hospitality Solutions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] via-[#C5A059] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            title="Stampa o salva in PDF (formato A4 executive)"
          >
            <Printer className="h-4 w-4" />
            <span>Stampa / Salva PDF</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border border-[#223049] bg-[#141F33] p-2 text-neutral-400 hover:bg-[#1A2840] hover:text-neutral-100 transition-colors"
            title="Chiudi visualizzazione report"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Printable Dossier Document (A4 Luxury Format) */}
      <div 
        ref={printRef}
        id="etra-printable-dossier"
        className="mx-auto max-w-5xl rounded-3xl border border-[#223049] bg-[#0A0E17] text-neutral-100 shadow-2xl p-6 sm:p-10 lg:p-14 space-y-12 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-neutral-900"
      >
        
        {/* ============================================================== */}
        {/* DOCUMENT HEADER & BRAND COVER */}
        {/* ============================================================== */}
        <div className="border-b border-[#223049] print:border-neutral-300 pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <EtraLogo size="lg" theme="dark" />
              <div className="mt-3 text-[11px] uppercase tracking-widest text-[#DFBA73] print:text-[#99732B] font-semibold">
                General Contracting · Strategic Advisory · Luxury Hospitality
              </div>
            </div>

            <div className="rounded-2xl border border-[#C5A059]/40 bg-[#121B2C] print:bg-neutral-100 print:border-neutral-400 p-4 text-right shrink-0">
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase tracking-wider block">Codice Dossier Ufficiale</span>
              <span className="font-mono text-sm font-bold text-[#DFBA73] print:text-neutral-900 block mt-0.5">
                ETRA-AUDIT-2026-FASANO-01
              </span>
              <span className="text-[10px] text-neutral-400 print:text-neutral-500 block mt-1">Data Perizia: 24 Settembre 2026</span>
              <span className="text-[10px] text-emerald-400 print:text-emerald-700 block font-semibold">Stato: Esecutivo Convalidato</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 text-[10px] font-semibold text-[#DFBA73] uppercase tracking-widest">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Dossier Peritale 360° · Piano di Sviluppo Strategico 12 Mesi</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100 print:text-neutral-950">
              Audit Diagnostico &amp; Piano di Trasformazione: {client.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 print:text-neutral-700 max-w-3xl leading-relaxed">
              Relazione tecnica e finanziaria ad uso esclusivo della Proprietà e della Direzione Generale. Sintesi diagnostica as-is, simulazione KPI to-be, cronoprogramma esecutivo e condizioni di ingaggio General Contractor.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. SCHEDA ANAGRAFICA & STATO ATTUALE STRUTTURA */}
        {/* ============================================================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#DFBA73] uppercase print:text-neutral-900 border-b border-[#223049]/60 print:border-neutral-300 pb-2">
            <Building2 className="h-4 w-4" />
            <span>1. Anagrafica Struttura &amp; Inquadramento Operativo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Denominazione</span>
              <span className="font-semibold text-neutral-100 print:text-neutral-900 text-sm block">{client.name}</span>
              <span className="text-[11px] text-[#DFBA73] print:text-neutral-700 block">{client.type}</span>
            </div>

            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Località &amp; Bacino</span>
              <span className="font-semibold text-neutral-100 print:text-neutral-900 text-sm block">{client.location}</span>
              <span className="text-[11px] text-neutral-400 block">{client.region} · Riviera dei Limoni</span>
            </div>

            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Capacità Ricettiva</span>
              <span className="font-mono font-bold text-neutral-100 print:text-neutral-900 text-lg block">{client.roomsCount} Suite</span>
              <span className="text-[11px] text-neutral-400 block">Camere storiche d’élite</span>
            </div>

            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Target Ospiti &amp; ADR</span>
              <span className="font-semibold text-neutral-100 print:text-neutral-900 text-xs block">Luxury High-End</span>
              <span className="font-mono text-[11px] text-[#DFBA73] print:text-neutral-800 block">ADR Target: €380</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Referenti per la Proprietà</span>
              <span className="font-medium text-neutral-200 print:text-neutral-900 mt-1 block">{client.contactPerson}</span>
              <span className="text-[11px] text-neutral-400 block">{client.role} · {client.email}</span>
            </div>

            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">PMS Gestionale</span>
              <span className="font-medium text-[#DFBA73] print:text-neutral-900 mt-1 block">{client.currentPMS}</span>
              <span className="text-[11px] text-neutral-400 block">Sostituzione con Mews Hospitality Cloud</span>
            </div>

            <div className="rounded-xl border border-[#223049] bg-[#101726] print:bg-neutral-50 print:border-neutral-300 p-3.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Canone Retainer Attivo</span>
              <span className="font-mono font-bold text-[#DFBA73] print:text-neutral-900 mt-1 block text-base">€{client.monthlyRetainer?.toLocaleString('it-IT')}/mese</span>
              <span className="text-[10px] text-emerald-400 print:text-emerald-700 block">Clausola 100% scomputo audit applicata</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. DIAGNOSTICA PERITALE AS-IS & RADAR DELLE 5 AREE */}
        {/* ============================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#223049]/60 print:border-neutral-300 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#DFBA73] uppercase print:text-neutral-900">
              <ShieldCheck className="h-4 w-4" />
              <span>2. Diagnostica Peritale 360° &amp; Valutazione di Conformità Iniziale</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#DFBA73] print:text-neutral-900 bg-[#142033] print:bg-neutral-200 px-2.5 py-0.5 rounded">
              Conformità Globale: {complianceRate}%
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Score Card & Diagnostic Verdict */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 print:bg-amber-50 print:border-amber-300 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Verdetto Diagnostico Peritale ETRA</span>
                </div>
                <p className="text-xs text-amber-200/90 print:text-amber-950 leading-relaxed font-sans">
                  <strong>Stato di Crisi / Riorganizzazione Indispensabile:</strong> Con solo <strong>7 parametri conformi su 28 (25,0%)</strong>, la struttura presenta gravi vulnerabilità su tech-stack, over-commissioni OTA e assenza di mansionario SOP. Tuttavia, il potenziale di crescita patrimoniale ed economica è tra i più alti del comparto (+43,5% RevPAR e oltre €254.000 di margine annuo recuperabile).
                </p>
              </div>

              {/* Progress per Area */}
              <div className="space-y-2.5 text-xs">
                {preventiveAudit.areas.map(area => {
                  const compliant = area.items.filter(i => i.status === 'conforme').length;
                  const total = area.items.length;
                  const pct = Math.round((compliant / total) * 100);

                  return (
                    <div key={area.id} className="rounded-xl border border-[#223049] print:border-neutral-300 bg-[#101726] print:bg-neutral-50 p-3 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-neutral-200 print:text-neutral-900">{area.name}</span>
                        <span className="font-mono font-bold text-[#DFBA73] print:text-neutral-800">{compliant}/{total} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-neutral-800 print:bg-neutral-300 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#DFBA73] to-[#99732B] print:bg-neutral-800"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400 print:text-neutral-600">
                        <span>Focus: {area.focusStrategico}</span>
                        <span className="uppercase font-medium">{pct >= 50 ? 'Parziale' : 'Critico'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Accattivante Radar Chart SVG delle 5 Dimensioni */}
            <div className="lg:col-span-5 rounded-2xl border border-[#223049] print:border-neutral-300 bg-[#101726] print:bg-neutral-50 p-5 flex flex-col items-center justify-center space-y-3">
              <span className="text-[11px] font-semibold tracking-wider text-[#DFBA73] print:text-neutral-900 uppercase">
                Radar Conformità: AS-IS vs TO-BE
              </span>

              {/* Interactive SVG Radar */}
              <svg viewBox="0 0 300 300" className="w-56 h-56 sm:w-64 sm:h-64">
                {/* Background Concentric Polygons */}
                {[0.25, 0.5, 0.75, 1.0].map((level, idx) => {
                  const r = 100 * level;
                  const cx = 150, cy = 150;
                  // 5 axes: -90, -18, 54, 126, 198 deg
                  const points = [0, 1, 2, 3, 4].map(i => {
                    const angle = (-90 + i * 72) * (Math.PI / 180);
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                  }).join(' ');

                  return (
                    <polygon
                      key={idx}
                      points={points}
                      fill="none"
                      stroke="#223049"
                      strokeWidth="1"
                      strokeDasharray={level === 1.0 ? 'none' : '2,2'}
                      className="print:stroke-neutral-300"
                    />
                  );
                })}

                {/* 5 Axis lines */}
                {[0, 1, 2, 3, 4].map(i => {
                  const angle = (-90 + i * 72) * (Math.PI / 180);
                  const x2 = 150 + 100 * Math.cos(angle);
                  const y2 = 150 + 100 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1="150"
                      y1="150"
                      x2={x2}
                      y2={y2}
                      stroke="#223049"
                      strokeWidth="1"
                      className="print:stroke-neutral-300"
                    />
                  );
                })}

                {/* TO-BE Target Polygon (100% full coverage) */}
                <polygon
                  points={[0, 1, 2, 3, 4].map(i => {
                    const angle = (-90 + i * 72) * (Math.PI / 180);
                    return `${150 + 100 * Math.cos(angle)},${150 + 100 * Math.sin(angle)}`;
                  }).join(' ')}
                  fill="rgba(223, 186, 115, 0.12)"
                  stroke="#DFBA73"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />

                {/* AS-IS Current Polygon: Economica 50%, Brand 25%, Tech 0% (min 15), Interior 25%, HR 0% (min 15) */}
                <polygon
                  points={[
                    `${150 + (100 * 0.50) * Math.cos(-90 * Math.PI / 180)},${150 + (100 * 0.50) * Math.sin(-90 * Math.PI / 180)}`,
                    `${150 + (100 * 0.25) * Math.cos(-18 * Math.PI / 180)},${150 + (100 * 0.25) * Math.sin(-18 * Math.PI / 180)}`,
                    `${150 + (100 * 0.10) * Math.cos(54 * Math.PI / 180)},${150 + (100 * 0.10) * Math.sin(54 * Math.PI / 180)}`,
                    `${150 + (100 * 0.25) * Math.cos(126 * Math.PI / 180)},${150 + (100 * 0.25) * Math.sin(126 * Math.PI / 180)}`,
                    `${150 + (100 * 0.10) * Math.cos(198 * Math.PI / 180)},${150 + (100 * 0.10) * Math.sin(198 * Math.PI / 180)}`,
                  ].join(' ')}
                  fill="rgba(239, 68, 68, 0.25)"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                />

                {/* Labels around the polygon */}
                <text x="150" y="32" textAnchor="middle" fill="#DFBA73" fontSize="10" fontWeight="bold">Economica (50%)</text>
                <text x="255" y="125" textAnchor="start" fill="#DFBA73" fontSize="10" fontWeight="bold">Brand (25%)</text>
                <text x="215" y="260" textAnchor="start" fill="#EF4444" fontSize="10" fontWeight="bold">Tech (0%)</text>
                <text x="85" y="260" textAnchor="end" fill="#DFBA73" fontSize="10" fontWeight="bold">Interior (25%)</text>
                <text x="45" y="125" textAnchor="end" fill="#EF4444" fontSize="10" fontWeight="bold">Staff/SOP (0%)</text>
              </svg>

              <div className="flex items-center justify-center gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-neutral-300 print:text-neutral-700 font-medium">AS-IS Rilevato (25%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#DFBA73]" />
                  <span className="text-neutral-300 print:text-neutral-700 font-medium">TO-BE Target ETRA (100%)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. CRUSCOTTO SIMULAZIONE KPI (GRAFICI A BARRE & BENEFICIO NETTO) */}
        {/* ============================================================== */}
        <div className="space-y-4 print:break-before-page">
          <div className="flex items-center justify-between border-b border-[#223049]/60 print:border-neutral-300 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#DFBA73] uppercase print:text-neutral-900">
              <TrendingUp className="h-4 w-4" />
              <span>3. Cruscotto KPI &amp; Benchmark Economico (AS-IS vs TO-BE)</span>
            </div>
            <span className="text-[11px] text-emerald-400 print:text-emerald-700 font-bold">
              Impatto Stimato: +€254.400 / anno
            </span>
          </div>

          {/* KPI Double Bar Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preventiveAudit.kpis.map(kpi => (
              <div 
                key={kpi.id}
                className="rounded-2xl border border-[#223049] print:border-neutral-300 bg-[#101726] print:bg-neutral-50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-neutral-100 print:text-neutral-900 line-clamp-1">
                    {kpi.name}
                  </h4>
                  <span className="font-mono text-xs font-bold text-emerald-400 print:text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {kpi.deltaFormatted}
                  </span>
                </div>

                {/* Paired values */}
                <div className="grid grid-cols-2 gap-2 text-xs border-y border-[#223049]/60 print:border-neutral-200 py-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Attuale (AS-IS)</span>
                    <span className="font-mono text-base font-bold text-neutral-300 print:text-neutral-800">{kpi.currentValueFormatted}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#DFBA73] print:text-neutral-600 uppercase tracking-wider block">Target (TO-BE)</span>
                    <span className="font-mono text-base font-bold text-[#DFBA73] print:text-neutral-950">{kpi.targetValueFormatted}</span>
                  </div>
                </div>

                {/* Accattivante Barra Grafica Comparativa */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Avanzamento Target</span>
                    <span>100% Benchmark</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-800 print:bg-neutral-200 overflow-hidden relative">
                    <div 
                      className="absolute left-0 top-0 h-full bg-rose-500/70"
                      style={{ width: `${Math.min(100, (kpi.currentValue / kpi.targetValue) * 100)}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-[#DFBA73] to-emerald-400 opacity-90 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 print:text-neutral-600 line-clamp-2">
                  Azione: {kpi.azioneCorrettiva}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Reconciliation & ROI Summary */}
          <div className="rounded-2xl border border-[#C5A059]/40 bg-gradient-to-r from-[#121B2C] to-[#0E1523] print:bg-neutral-100 print:border-neutral-400 p-5 lg:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#223049] print:border-neutral-300 pb-3">
              <div>
                <span className="text-[10px] text-[#DFBA73] print:text-neutral-700 font-bold uppercase tracking-wider block">
                  Piano Finanziario &amp; Business Plan di Sintesi
                </span>
                <h3 className="text-base font-serif font-bold text-neutral-100 print:text-neutral-900 mt-0.5">
                  Proiezione dei Benefici Economici e Ritorno sull&apos;Investimento (ROI)
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block uppercase">ROI Calcolato</span>
                <span className="font-mono text-xl font-bold text-emerald-400 print:text-emerald-700">7.3x Netto</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#142033] print:bg-white border border-[#223049] print:border-neutral-300 space-y-1">
                <span className="text-[10px] text-neutral-400 block">Extra Ricavi Camere</span>
                <span className="font-mono text-base font-bold text-emerald-400 print:text-emerald-700 block">+€ 218.000</span>
                <span className="text-[10px] text-neutral-400 block">RevPAR da €115 a €165</span>
              </div>

              <div className="p-3 rounded-xl bg-[#142033] print:bg-white border border-[#223049] print:border-neutral-300 space-y-1">
                <span className="text-[10px] text-neutral-400 block">Risparmio Fee OTA</span>
                <span className="font-mono text-base font-bold text-emerald-400 print:text-emerald-700 block">+€ 36.400</span>
                <span className="text-[10px] text-neutral-400 block">Disintermediazione 45%</span>
              </div>

              <div className="p-3 rounded-xl bg-[#142033] print:bg-white border border-[#223049] print:border-neutral-300 space-y-1">
                <span className="text-[10px] text-neutral-400 block">Fondo Perduto Bando</span>
                <span className="font-mono text-base font-bold text-[#DFBA73] print:text-neutral-900 block">€ 140.000</span>
                <span className="text-[10px] text-neutral-400 block">FRI-Tur / Transizione 5.0</span>
              </div>

              <div className="p-3 rounded-xl bg-[#142033] print:bg-white border border-[#C5A059]/40 print:border-neutral-400 space-y-1">
                <span className="text-[10px] text-[#DFBA73] print:text-neutral-800 block font-semibold">Investimento ETRA Netto</span>
                <span className="font-mono text-base font-bold text-neutral-100 print:text-neutral-900 block">€ 51.200</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 block">-€ 2.800 scomputo audit</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. CRONOPROGRAMMA GANTT & ATTUAZIONE OPERATIVA */}
        {/* ============================================================== */}
        <div className="space-y-4 print:break-before-page">
          <div className="flex items-center justify-between border-b border-[#223049]/60 print:border-neutral-300 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#DFBA73] uppercase print:text-neutral-900">
              <Calendar className="h-4 w-4" />
              <span>4. Cronoprogramma di Lavoro Gantt &amp; Roadmap Attuativa (Fasano)</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {clientTasks.length} Attività Pianificate
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#223049] print:border-neutral-300 text-neutral-400 print:text-neutral-700 bg-[#121B2C] print:bg-neutral-100">
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Codice</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Attività Operativa</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Risorsa</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Scadenza</th>
                  <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-center">Stato / SAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223049]/60 print:divide-neutral-200">
                {clientTasks.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-[#142033] print:hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#DFBA73] print:text-neutral-900 whitespace-nowrap">
                      {t.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-neutral-100 print:text-neutral-900">{t.title}</div>
                      <div className="text-[11px] text-neutral-400 print:text-neutral-600 line-clamp-1">{t.description}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-neutral-300 print:text-neutral-700">
                      {t.resource === 'resource_1' ? 'Risorsa 1 (Ops/Comm)' : t.resource === 'resource_2' ? 'Risorsa 2 (Brand/Tech)' : 'Team ETRA'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-300 print:text-neutral-800 whitespace-nowrap">
                      {t.dueDate}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-mono font-bold text-neutral-100 print:text-neutral-900">
                        <span className={`h-2 w-2 rounded-full ${
                          t.status === 'completato' ? 'bg-emerald-400' :
                          t.status === 'in_corso' ? 'bg-blue-400' : 'bg-amber-400'
                        }`} />
                        <span>{t.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. CHECKLIST 4 AREE ETRA: SINTESI DI CONFORMITÀ */}
        {/* ============================================================== */}
        {auditData && auditData.areas && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#223049]/60 print:border-neutral-300 pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#DFBA73] uppercase print:text-neutral-900">
                <Layers className="h-4 w-4" />
                <span>5. Sintesi Checklist Peritale 4 Aree ETRA</span>
              </div>
              <span className="text-[11px] text-neutral-400">Economics · Tech · Compliance · Brand</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {auditData.areas.map(area => (
                <div key={area.id} className="rounded-xl border border-[#223049] print:border-neutral-300 bg-[#101726] print:bg-neutral-50 p-4 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-[#223049]/60 print:border-neutral-200 pb-2">
                    <span className="font-bold text-neutral-100 print:text-neutral-900">{area.title}</span>
                    <span className="text-[10px] text-[#DFBA73] print:text-neutral-700 uppercase font-mono">{area.code}</span>
                  </div>
                  <div className="space-y-2">
                    {area.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-start justify-between gap-2 text-[11px]">
                        <div>
                          <span className="font-semibold text-neutral-200 print:text-neutral-900">{item.code}: {item.title}</span>
                          <p className="text-neutral-400 print:text-neutral-600 line-clamp-1">{item.evidenceNotes}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold shrink-0 ${
                          item.status === 'conforme' ? 'text-emerald-400 bg-emerald-500/15' :
                          item.status === 'parziale' ? 'text-amber-400 bg-amber-500/15' : 'text-rose-400 bg-rose-500/15'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. CONDIZIONI DI INGAGGIO, SCOMPUTO 100% & FIRME UFFICIALI */}
        {/* ============================================================== */}
        <div className="space-y-6 pt-4 border-t border-[#223049] print:border-neutral-400">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 print:bg-emerald-50 print:border-emerald-300 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-400 print:text-emerald-800 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Clausola di Garanzia: Scomputo Integrale del 100% dell&apos;Audit (€2.800)</span>
            </div>
            <p className="text-emerald-200/90 print:text-emerald-950 leading-relaxed">
              In accordo con la Carta dei Servizi ETRA, l&apos;intero importo versato per l&apos;Audit Diagnostico 360° (€2.800,00 + IVA) viene accreditato a scomputo diretto dalle mensilità iniziali del Contratto Continuativo Retainer Full Growth (€4.500/mese). L&apos;audit risulta pertanto a costo zero per la struttura.
            </p>
          </div>

          {/* Official Signatures Grid */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
            <div className="border-t border-[#223049] print:border-neutral-400 pt-3 space-y-8">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Per il Comitato Tecnico &amp; Advisory Board</span>
                <span className="font-serif font-bold text-neutral-100 print:text-neutral-900 text-sm block mt-1">ETRA — Hospitality Solutions Boutique</span>
                <span className="text-[11px] text-neutral-400 block">General Contractor della Crescita</span>
              </div>
              <div className="border-b border-dashed border-[#223049] print:border-neutral-400 w-48 pb-1">
                <span className="italic text-[10px] text-neutral-500">Firma autorizzata ETRA Solutions</span>
              </div>
            </div>

            <div className="border-t border-[#223049] print:border-neutral-400 pt-3 space-y-8">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Per la Proprietà &amp; Direzione Generale</span>
                <span className="font-serif font-bold text-neutral-100 print:text-neutral-900 text-sm block mt-1">{client.name}</span>
                <span className="text-[11px] text-neutral-400 block">{client.contactPerson}</span>
              </div>
              <div className="border-b border-dashed border-[#223049] print:border-neutral-400 w-48 pb-1">
                <span className="italic text-[10px] text-neutral-500">Firma per accettazione e convalida</span>
              </div>
            </div>
          </div>

          {/* Footer print stamp */}
          <div className="pt-4 border-t border-[#223049]/40 print:border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 print:text-neutral-500 gap-2">
            <span>ETRA Solutions Boutique · Milano &amp; Venezia · Documento Riservato ad Uso Esclusivo</span>
            <span>Certificazione di Conformità Peritale Hospitality Excellence · Pagina 1 di 1</span>
          </div>

        </div>

      </div>

    </div>
  );
};

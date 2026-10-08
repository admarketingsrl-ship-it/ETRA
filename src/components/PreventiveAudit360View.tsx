import React, { useState } from 'react';
import { 
  Preventive360Audit, 
  FieldAuditCoreArea, 
  FieldAuditItem, 
  FieldAuditEvaluationState, 
  FieldAuditPriority, 
  KpiSimulationItem,
  FieldAuditCoreAreaId,
  Client
} from '../types';
import { INITIAL_PREVENTIVE_AUDIT_FASANO, createBlankPreventiveAudit } from '../data/preventiveAuditData';
import { exportPreventiveAuditToCsv } from '../utils/storage';
import { EtraLogo } from './EtraLogo';
import { 
  ClipboardCheck, 
  Printer, 
  Plus, 
  RotateCcw, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Building2, 
  Calendar, 
  User, 
  SlidersHorizontal,
  Table as TableIcon,
  BarChart3,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Download,
  Calculator,
  ChevronRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

interface PreventiveAudit360ViewProps {
  preventiveAudits: Record<string, Preventive360Audit>;
  selectedAuditId: string;
  onSelectAudit: (id: string) => void;
  onUpdateAudit: (audit: Preventive360Audit) => void;
  onAddAudit: (audit: Preventive360Audit) => void;
  clients?: Client[];
}

export const PreventiveAudit360View: React.FC<PreventiveAudit360ViewProps> = ({
  preventiveAudits,
  selectedAuditId,
  onSelectAudit,
  onUpdateAudit,
  onAddAudit,
  clients = [],
}) => {
  // Ensure we have an active audit
  const activeAudit: Preventive360Audit = 
    preventiveAudits[selectedAuditId] || 
    Object.values(preventiveAudits)[0] || 
    INITIAL_PREVENTIVE_AUDIT_FASANO;

  // View sub-tab: 'dashboard_sim' (Page 1) | 'field_sheet' (Page 3) | 'kpi_analysis' (Page 4)
  const [subTab, setSubTab] = useState<'dashboard_sim' | 'field_sheet' | 'kpi_analysis'>('dashboard_sim');

  // Filters for field sheet
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal for new audit structure
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [selectedCrmClientId, setSelectedCrmClientId] = useState<string>('custom');
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelType, setNewHotelType] = useState('Boutique Hotel (Luxury / Historic)');

  // Printable modal state
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Interactive KPI Simulator Modal
  const [showKpiSimulatorModal, setShowKpiSimulatorModal] = useState(false);
  const [simRoomsCount, setSimRoomsCount] = useState<number>(25);

  // Dynamic calculations for the 5 core areas based on the active items in the audit
  const areaSummaries = activeAudit.areas.map(area => {
    const totalItems = area.items.length;
    const conformiCount = area.items.filter(item => item.status === 'conforme').length;
    const daMigliorareCount = area.items.filter(item => item.status === 'da_migliorare').length;
    const nonConformiCount = area.items.filter(item => item.status === 'non_conforme').length;
    const compliancePercent = totalItems > 0 ? (conformiCount / totalItems) * 100 : 0;
    
    // Global priority: if any item is critica -> Alta/Critica, else Media
    const hasCritica = area.items.some(i => i.priority === 'critica');
    const hasAlta = area.items.some(i => i.priority === 'alta');
    const prioritaGlobale: 'Alta' | 'Media' | 'Bassa' = hasCritica || hasAlta ? 'Alta' : 'Media';
    
    // Overall status: if compliance < 50% -> Critico
    const statoComplessivo = compliancePercent < 50 ? 'Critico' : compliancePercent < 80 ? 'Da Monitorare' : 'Adeguato';

    return {
      areaId: area.id,
      name: area.name,
      shortName: area.shortName,
      focusStrategico: area.focusStrategico,
      totalItems,
      conformiCount,
      daMigliorareCount,
      nonConformiCount,
      compliancePercent,
      compliancePercentFormatted: `${compliancePercent.toFixed(1).replace('.', ',')}%`,
      prioritaGlobale,
      statoComplessivo,
    };
  });

  const totalAuditItems = areaSummaries.reduce((acc, a) => acc + a.totalItems, 0);
  const totalConformi = areaSummaries.reduce((acc, a) => acc + a.conformiCount, 0);
  const totalDaMigliorare = areaSummaries.reduce((acc, a) => acc + a.daMigliorareCount, 0);
  const totalNonConformi = areaSummaries.reduce((acc, a) => acc + a.nonConformiCount, 0);
  const totalCompliancePercent = totalAuditItems > 0 ? (totalConformi / totalAuditItems) * 100 : 0;
  const totalComplianceFormatted = `${totalCompliancePercent.toFixed(1).replace('.', ',')}%`;
  const overallDiagnosisStatus = totalCompliancePercent < 50 ? 'Critico — Necessita Intervento ETRA' : totalCompliancePercent < 80 ? 'Parzialmente Conforme — Ottimizzazione' : 'Conforme — Consolidamento';

  // Recommended ETRA Retainer Tier based on diagnostic result
  const recommendedTier = totalCompliancePercent < 50 
    ? {
        name: 'EXECUTIVE GENERAL CONTRACTOR',
        range: '€ 4.500 – € 6.500 / mese',
        rationale: 'Elevato deficit su PMS Cloud, SOP e BI. Richiede affiancamento totale e direzione esecutiva su tutti i pilastri.',
        badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-300'
      }
    : totalCompliancePercent < 80
    ? {
        name: 'FULL GROWTH & ACCELERATION',
        range: '€ 3.000 – € 4.500 / mese',
        rationale: 'Struttura solida ma con rilevanti inefficienze distributive e RMS. Focalizzazione su RevPAR e Brand Disintermediation.',
        badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
      }
    : {
        name: 'ESSENTIAL BOUTIQUE',
        range: '€ 1.800 – € 2.800 / mese',
        rationale: 'Compliance avanzata. Intervento di mantenimento, governance continuativa e fine-tuning ricavi.',
        badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
      };

  // Handler to update an item in the field sheet
  const handleUpdateItem = (areaId: FieldAuditCoreAreaId, itemId: string, updates: Partial<FieldAuditItem>) => {
    const updatedAreas = activeAudit.areas.map(area => {
      if (area.id === areaId) {
        const updatedItems = area.items.map(item => {
          if (item.id === itemId) {
            const newItem = { ...item, ...updates };
            // Update statusLabel automatically if status changed
            if (updates.status) {
              if (updates.status === 'conforme') newItem.statusLabel = 'Conforme / Concluso';
              else if (updates.status === 'da_migliorare') newItem.statusLabel = 'Da Migliorare';
              else if (updates.status === 'non_conforme') newItem.statusLabel = 'Non Conforme / Mancante';
            }
            return newItem;
          }
          return item;
        });
        return { ...area, items: updatedItems };
      }
      return area;
    });

    onUpdateAudit({
      ...activeAudit,
      areas: updatedAreas,
    });
  };

  // Handler to update a KPI simulation item
  const handleUpdateKpi = (kpiId: string, currentVal: number, targetVal: number) => {
    const updatedKpis = activeAudit.kpis.map(kpi => {
      if (kpi.id === kpiId) {
        const newKpi = { ...kpi, currentValue: currentVal, targetValue: targetVal };
        
        if (kpi.unit === '%') {
          newKpi.currentValueFormatted = `${currentVal.toFixed(1).replace('.', ',')}%`;
          newKpi.targetValueFormatted = `${targetVal.toFixed(1).replace('.', ',')}%`;
          const diffPp = targetVal - currentVal;
          newKpi.deltaNumeric = diffPp;
          newKpi.deltaFormatted = `${diffPp >= 0 ? '+' : ''}${diffPp.toFixed(1).replace('.', ',')}% pp`;
        } else if (kpi.unit === '€') {
          newKpi.currentValueFormatted = `€ ${currentVal.toFixed(2).replace('.', ',')}`;
          newKpi.targetValueFormatted = `€ ${targetVal.toFixed(2).replace('.', ',')}`;
          const percentInc = currentVal > 0 ? ((targetVal - currentVal) / currentVal) * 100 : 0;
          newKpi.deltaNumeric = percentInc;
          newKpi.deltaFormatted = `${percentInc >= 0 ? '+' : ''}${percentInc.toFixed(1).replace('.', ',')}%`;
        } else {
          newKpi.currentValueFormatted = `${currentVal.toFixed(1).replace('.', ',')}`;
          newKpi.targetValueFormatted = `${targetVal.toFixed(1).replace('.', ',')}`;
          const diff = targetVal - currentVal;
          newKpi.deltaNumeric = diff;
          newKpi.deltaFormatted = `${diff >= 0 ? '+' : ''}${diff.toFixed(1).replace('.', ',')}`;
        }
        return newKpi;
      }
      return kpi;
    });

    onUpdateAudit({
      ...activeAudit,
      kpis: updatedKpis,
    });
  };

  // Quick calculations for simulated annual returns
  const revparKpi = activeAudit.kpis.find(k => k.id === 'kpi_revpar');
  const directKpi = activeAudit.kpis.find(k => k.id === 'kpi_direct_share');
  
  const currentRevpar = revparKpi ? revparKpi.currentValue : 115;
  const targetRevpar = revparKpi ? revparKpi.targetValue : 165;
  const annualIncrementalRevparRevenue = Math.round((targetRevpar - currentRevpar) * simRoomsCount * 365);

  const currentDirect = directKpi ? directKpi.currentValue : 18;
  const targetDirect = directKpi ? directKpi.targetValue : 45;
  // Estimated OTA commission savings on direct share gained (avg room price * rooms * 365 * 65% occ * direct shift * 18% OTA fee)
  const estimatedOtaSaving = Math.round(
    targetRevpar * simRoomsCount * 365 * ((targetDirect - currentDirect) / 100) * 0.18
  );

  // Create new audit
  const handleCreateNewAudit = (e: React.FormEvent) => {
    e.preventDefault();
    let name = newHotelName.trim();
    let type = newHotelType;

    if (selectedCrmClientId !== 'custom') {
      const crmClient = clients.find(c => c.id === selectedCrmClientId);
      if (crmClient) {
        name = crmClient.name;
        type = crmClient.type;
        setSimRoomsCount(crmClient.roomsCount || 25);
      }
    }

    if (!name) return;

    const newAudit = createBlankPreventiveAudit(name, type);
    onAddAudit(newAudit);
    onSelectAudit(newAudit.id);
    setShowNewAuditModal(false);
    setNewHotelName('');
    setSelectedCrmClientId('custom');
  };

  // Reset to original PDF benchmark
  const handleResetToPdfBenchmark = () => {
    onUpdateAudit(JSON.parse(JSON.stringify(INITIAL_PREVENTIVE_AUDIT_FASANO)));
  };

  // Filter items for field sheet
  const allFlattenedItems = activeAudit.areas.flatMap(area => 
    area.items.map(item => ({ ...item, areaId: area.id, areaName: area.name }))
  );

  const filteredItems = allFlattenedItems.filter(item => {
    const matchArea = selectedAreaFilter === 'all' || item.areaId === selectedAreaFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchSearch = searchQuery === '' || 
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.noteDiCampo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitOrValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.strategicAction.toLowerCase().includes(searchQuery.toLowerCase());
    return matchArea && matchStatus && matchSearch;
  });

  const getStatusBadge = (status: FieldAuditEvaluationState, label: string) => {
    switch (status) {
      case 'conforme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>{label}</span>
          </span>
        );
      case 'da_migliorare':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>{label}</span>
          </span>
        );
      case 'non_conforme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3 shrink-0" />
            <span>{label}</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: FieldAuditPriority) => {
    switch (priority) {
      case 'critica':
        return <span className="font-bold text-rose-400 uppercase tracking-wide">Critica</span>;
      case 'alta':
        return <span className="font-semibold text-rose-400">Alta</span>;
      case 'media':
        return <span className="font-medium text-amber-400">Media</span>;
      case 'bassa':
        return <span className="font-medium text-emerald-400">Bassa</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Bar: Selector, Hotel Name & Action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-[#223049] bg-[#0E1523] p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#DFBA73] uppercase mb-1">
            <ClipboardCheck className="h-4 w-4" />
            <span>Audit Diagnostico Preventivo 360° · Metodologia Certificata ETRA</span>
          </div>
          <h1 className="font-serif text-xl lg:text-2xl font-medium text-neutral-100 flex items-center gap-2">
            <span>Diagnosi Preventiva &amp; Simulation KPI</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#18263D] border border-[#223049] text-[#DFBA73]">
              AS-IS vs TO-BE
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Rilevazione peritale delle 28 voci operative sulle 5 Aree Core e proiezione dei differenziali di crescita generabili con ETRA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audit Selector Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-[#223049] bg-[#141F33] px-3 py-1.5 text-xs">
            <Building2 className="h-4 w-4 text-[#C5A059]" />
            <select
              value={activeAudit.id}
              onChange={(e) => onSelectAudit(e.target.value)}
              className="bg-transparent font-medium text-neutral-100 focus:outline-none cursor-pointer"
            >
              {Object.values(preventiveAudits).map(aud => (
                <option key={aud.id} value={aud.id} className="bg-[#0E1523] text-neutral-100">
                  {aud.hotelName} ({aud.auditDate})
                </option>
              ))}
            </select>
          </div>

          {/* New Audit Button */}
          <button
            onClick={() => setShowNewAuditModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#223049] bg-[#162338] px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:border-[#C5A059]/60 hover:text-[#DFBA73] transition-all"
            title="Avvia audit preventivo per una nuova struttura"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuovo Audit</span>
          </button>

          {/* Interactive KPI Simulator */}
          <button
            onClick={() => setShowKpiSimulatorModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#C5A059]/40 bg-[#1A253A] px-3 py-1.5 text-xs font-semibold text-[#DFBA73] hover:bg-[#202E47] transition-all shadow-sm"
            title="Apri il simulatore parametrico KPI & ROI"
          >
            <Calculator className="h-3.5 w-3.5 text-[#DFBA73]" />
            <span>Simulatore KPI &amp; ROI</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportPreventiveAuditToCsv(activeAudit)}
            className="flex items-center gap-1.5 rounded-xl border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white transition-colors"
            title="Scarica foglio CSV delle 28 voci di campo"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Esporta CSV</span>
          </button>

          {/* Reset to PDF Benchmark */}
          <button
            onClick={handleResetToPdfBenchmark}
            className="flex items-center gap-1 rounded-xl border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Ricarica i dati esatti del PDF (Hotel Boutique Fasano 2026-09-24)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dati PDF</span>
          </button>

          {/* Print Dossier Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-1.5 text-xs font-semibold text-neutral-950 shadow-md hover:brightness-110 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Esporta / Stampa PDF</span>
          </button>
        </div>
      </div>

      {/* ANAGRAFICA STRUTTURA & AUDIT SUMMARY (Header matching Page 1 of PDF) */}
      <div className="rounded-2xl border border-[#223049] bg-[#111A2B] p-4 lg:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-[#DFBA73] uppercase tracking-wider">
            ANAGRAFICA STRUTTURA &amp; AUDIT SUMMARY
          </div>
          <div className="text-[11px] text-neutral-400">
            Tasso di conformità: <span className="font-mono font-bold text-rose-400">{totalComplianceFormatted}</span> ({totalConformi} su {totalAuditItems} voci)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="rounded-xl bg-[#0E1523] border border-[#223049] p-3">
            <span className="text-[10px] text-neutral-400 uppercase block">Nome Struttura Ricettiva:</span>
            <input
              type="text"
              value={activeAudit.hotelName}
              onChange={(e) => onUpdateAudit({ ...activeAudit, hotelName: e.target.value })}
              className="font-serif font-bold text-sm text-neutral-100 bg-transparent w-full focus:outline-none focus:border-b border-[#C5A059] mt-0.5"
            />
          </div>

          <div className="rounded-xl bg-[#0E1523] border border-[#223049] p-3">
            <span className="text-[10px] text-neutral-400 uppercase block">Tipologia / Segmento:</span>
            <input
              type="text"
              value={activeAudit.hotelType}
              onChange={(e) => onUpdateAudit({ ...activeAudit, hotelType: e.target.value })}
              className="font-medium text-neutral-200 bg-transparent w-full focus:outline-none focus:border-b border-[#C5A059] mt-0.5"
            />
          </div>

          <div className="rounded-xl bg-[#0E1523] border border-[#223049] p-3">
            <span className="text-[10px] text-neutral-400 uppercase block">Data Audit:</span>
            <input
              type="date"
              value={activeAudit.auditDate}
              onChange={(e) => onUpdateAudit({ ...activeAudit, auditDate: e.target.value })}
              className="font-mono font-semibold text-neutral-100 bg-transparent w-full focus:outline-none mt-0.5"
            />
          </div>

          <div className="rounded-xl bg-[#0E1523] border border-[#223049] p-3">
            <span className="text-[10px] text-neutral-400 uppercase block">Consulente / Auditor ETRA:</span>
            <input
              type="text"
              value={activeAudit.auditorName}
              onChange={(e) => onUpdateAudit({ ...activeAudit, auditorName: e.target.value })}
              className="font-medium text-[#DFBA73] bg-transparent w-full focus:outline-none focus:border-b border-[#C5A059] mt-0.5"
            />
          </div>
        </div>

        {/* Diagnostic recommendation banner */}
        <div className={`mt-4 rounded-xl border p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${recommendedTier.badgeColor}`}>
          <div>
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Verdetto Diagnostico ETRA: {overallDiagnosisStatus}</span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">{recommendedTier.rationale}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase opacity-75 block">Tier Contrattuale Consigliato</span>
              <span className="font-bold text-xs font-mono">{recommendedTier.name} ({recommendedTier.range})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Nav Tabs: matching the 3 PDF Pages */}
      <div className="flex rounded-xl bg-[#0E1523] p-1 border border-[#223049] overflow-x-auto">
        <button
          onClick={() => setSubTab('dashboard_sim')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
            subTab === 'dashboard_sim'
              ? 'bg-[#18263D] text-[#DFBA73] shadow-sm border border-[#C5A059]/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#121B2C]'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>1. Dashboard Executive &amp; Simulazione KPI</span>
        </button>

        <button
          onClick={() => setSubTab('field_sheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
            subTab === 'field_sheet'
              ? 'bg-[#18263D] text-[#DFBA73] shadow-sm border border-[#C5A059]/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#121B2C]'
          }`}
        >
          <TableIcon className="h-4 w-4" />
          <span>2. Scheda di Campo (28 Voci Operative)</span>
        </button>

        <button
          onClick={() => setSubTab('kpi_analysis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
            subTab === 'kpi_analysis'
              ? 'bg-[#18263D] text-[#DFBA73] shadow-sm border border-[#C5A059]/40'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#121B2C]'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>3. Scheda di Analisi Dettagliata KPI</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: DASHBOARD EXECUTIVE & SIMULAZIONE KPI (Page 1 of PDF) */}
      {/* ========================================================================= */}
      {subTab === 'dashboard_sim' && (
        <div className="space-y-8">
          
          {/* TABELLA 1: RIEPILOGO AVANZAMENTO E COMPLIANCE AUDIT (5 AREE CORE) */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#223049] pb-3">
              <div>
                <h3 className="font-serif text-base font-semibold text-neutral-100 flex items-center gap-2">
                  <span className="font-mono text-[#DFBA73]">1.</span>
                  <span>RIEPILOGO AVANZAMENTO E COMPLIANCE AUDIT (5 AREE CORE)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Conformità rilevata sulle 28 voci peritali. Calcolo automatico basato sulle verifiche effettuate in scheda di campo.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase block">Compliance Globale</span>
                <span className="font-mono text-xl font-bold text-rose-400 tabular-nums">
                  {totalComplianceFormatted}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#223049] bg-[#121B2C] text-neutral-300 font-semibold">
                    <th className="p-3">Area Core</th>
                    <th className="p-3">Focus Strategico ETRA</th>
                    <th className="p-3 text-center">Totale Voci Audit</th>
                    <th className="p-3 text-center">Conformi / Adeguati</th>
                    <th className="p-3 text-center">% Compliance Attuale</th>
                    <th className="p-3 text-center">Priorità Globale</th>
                    <th className="p-3 text-center">Stato Complessivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223049]/60">
                  {areaSummaries.map((row) => (
                    <tr key={row.areaId} className="hover:bg-[#121B2C]/60 transition-colors">
                      <td className="p-3 font-semibold text-neutral-100">{row.name}</td>
                      <td className="p-3 text-neutral-300">{row.focusStrategico}</td>
                      <td className="p-3 font-mono text-center text-neutral-200">{row.totalItems}</td>
                      <td className="p-3 font-mono text-center font-bold text-neutral-100">{row.conformiCount}</td>
                      <td className="p-3 font-mono text-center font-bold text-[#DFBA73]">
                        {row.compliancePercentFormatted}
                      </td>
                      <td className="p-3 text-center font-semibold text-rose-400">{row.prioritaGlobale}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          row.compliancePercent < 50 
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                            : row.compliancePercent < 80 
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {row.statoComplessivo}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totale Row */}
                  <tr className="bg-[#142033] font-bold border-t-2 border-[#223049]">
                    <td className="p-3 text-[#DFBA73]">TOTALE AUDIT DIAGNOSTICO</td>
                    <td className="p-3 text-neutral-300">Valutazione Complessiva della Struttura</td>
                    <td className="p-3 font-mono text-center text-neutral-100">{totalAuditItems}</td>
                    <td className="p-3 font-mono text-center text-emerald-400">{totalConformi}</td>
                    <td className="p-3 font-mono text-center text-rose-400 text-sm">
                      {totalComplianceFormatted}
                    </td>
                    <td className="p-3 text-center text-neutral-400">-</td>
                    <td className="p-3 text-center text-rose-400">
                      <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                        {overallDiagnosisStatus}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TABELLA 2: SIMULAZIONE IMPATTO KPI STRATEGICI (AS-IS VS TO-BE) */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#223049] pb-3">
              <div>
                <h3 className="font-serif text-base font-semibold text-neutral-100 flex items-center gap-2">
                  <span className="font-mono text-[#DFBA73]">2.</span>
                  <span>SIMULAZIONE IMPATTO KPI STRATEGICI (STATO ATTUALE VS TARGET ROADMAP ETRA)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Proiezione dei differenziali di crescita generabili attraverso l&apos;intervento di ETRA.
                </p>
              </div>

              <button
                onClick={() => setShowKpiSimulatorModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#C5A059]/50 bg-[#162338] px-3 py-1.5 text-xs font-semibold text-[#DFBA73] hover:bg-[#1E2E47] transition-all self-start sm:self-auto"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Simula &amp; Modifica Valori</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-[#223049] bg-[#121B2C] text-neutral-300 font-semibold">
                    <th className="p-3">KPI / Indicatore Chiave</th>
                    <th className="p-3">Area di Riferimento</th>
                    <th className="p-3 text-center">Valore Attuale (AS-IS)</th>
                    <th className="p-3 text-center">Target ETRA (TO-BE)</th>
                    <th className="p-3 text-center">Delta / Incremento</th>
                    <th className="p-3 text-center">Benchmark Luxury/Boutique</th>
                    <th className="p-3">Impatto Strategico Expected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223049]/60">
                  {activeAudit.kpis.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-[#121B2C]/60 transition-colors">
                      <td className="p-3 font-semibold text-neutral-100">{kpi.name}</td>
                      <td className="p-3 text-neutral-300">{kpi.area}</td>
                      <td className="p-3 font-mono text-center font-bold text-neutral-200">
                        {kpi.currentValueFormatted}
                      </td>
                      <td className="p-3 font-mono text-center font-bold text-emerald-400">
                        {kpi.targetValueFormatted}
                      </td>
                      <td className="p-3 font-mono text-center font-bold text-[#DFBA73]">
                        {kpi.deltaFormatted}
                      </td>
                      <td className="p-3 font-mono text-center text-neutral-400">{kpi.benchmarkRange}</td>
                      <td className="p-3 text-neutral-200">{kpi.expectedImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simulated Economic Impact Widget */}
            <div className="rounded-xl border border-[#223049] bg-[#121B2C] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#C5A059]/15 text-[#DFBA73]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-100 block">Stima Ritorno Economico Annuale (su base {simRoomsCount} camere)</span>
                  <span className="text-[11px] text-neutral-400">
                    Incremento RevPAR (+€{(targetRevpar - currentRevpar).toFixed(2)}) e risparmio commissionale disintermediazione (+{(targetDirect - currentDirect).toFixed(1)} pp).
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Extra Fatturato Camere</span>
                  <span className="font-mono text-base font-bold text-emerald-400">+€ {annualIncrementalRevparRevenue.toLocaleString('it-IT')}</span>
                </div>
                <div className="border-l border-[#223049] pl-4">
                  <span className="text-[10px] text-neutral-400 uppercase block">Risparmio Fee OTA</span>
                  <span className="font-mono text-base font-bold text-[#DFBA73]">+€ {estimatedOtaSaving.toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 3: GRAFICI COMPARATIVI (Ricreati fedelmente dal PDF) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Grafico 1: Avanzamento Compliance per Area Core ETRA (%) */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#223049] pb-3">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Avanzamento Compliance per Area Core ETRA (%)
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                  <span className="h-2.5 w-2.5 bg-[#3B82F6] rounded-sm" />
                  <span>% Compliance Attuale</span>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-l border-[#223049]">
                {areaSummaries.map((area) => {
                  const heightPercent = Math.max(area.compliancePercent, 3);
                  return (
                    <div key={area.areaId} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="font-mono text-[10px] text-neutral-300 font-bold">
                        {area.compliancePercent.toFixed(1)}%
                      </span>
                      <div className="w-full max-w-[48px] rounded-t bg-[#3B82F6] group-hover:brightness-110 transition-all" style={{ height: `${heightPercent}%` }} />
                      <span className="text-[10px] text-neutral-400 text-center leading-tight truncate w-full" title={area.name}>
                        {area.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grafico 2: Simulazione KPI: Stato Attuale (AS-IS) vs Target ETRA (TO-BE) */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#223049] pb-3">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Simulazione KPI: Stato Attuale (AS-IS) vs Target ETRA (TO-BE)
                </h4>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="h-2.5 w-2.5 bg-[#3B82F6] rounded-sm" />
                    <span>Valore Attuale (AS-IS)</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <span className="h-2.5 w-2.5 bg-[#DC2626] rounded-sm" />
                    <span>Target ETRA (TO-BE)</span>
                  </div>
                </div>
              </div>

              {/* Paired Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-l border-[#223049]">
                {activeAudit.kpis.map((kpi) => {
                  const maxRef = 180;
                  const currentH = Math.min(100, Math.max(4, (kpi.currentValue / maxRef) * 100));
                  const targetH = Math.min(100, Math.max(4, (kpi.targetValue / maxRef) * 100));

                  return (
                    <div key={kpi.id} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="flex items-end justify-center gap-1 w-full h-full">
                        <div 
                          className="w-1/2 max-w-[20px] rounded-t bg-[#3B82F6] group-hover:brightness-110 transition-all" 
                          style={{ height: `${currentH}%` }}
                          title={`AS-IS: ${kpi.currentValueFormatted}`}
                        />
                        <div 
                          className="w-1/2 max-w-[20px] rounded-t bg-[#DC2626] group-hover:brightness-110 transition-all" 
                          style={{ height: `${targetH}%` }}
                          title={`TO-BE: ${kpi.targetValueFormatted}`}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-400 text-center leading-tight truncate w-full" title={kpi.name}>
                        {kpi.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SCHEDA DI CAMPO (28 VOCI OPERATIVE) (Page 3 of PDF) */}
      {/* ========================================================================= */}
      {subTab === 'field_sheet' && (
        <div className="space-y-4">
          
          {/* Controls & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-xl border border-[#223049] bg-[#0A101C] p-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per codice (ECO-01), parametro, valore..."
                className="w-full rounded-lg border border-[#223049] bg-[#121B2C] pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Area Core:</span>
                <select
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="rounded-lg border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="all">Tutte le 5 Aree</option>
                  <option value="economica">1. Economica e Finanziaria</option>
                  <option value="brand">2. Brand e Reputazionale</option>
                  <option value="technology">3. Technology, IA &amp; Compliance</option>
                  <option value="interior">4. Interior &amp; Spaziale</option>
                  <option value="capitale_umano">5. Capitale Umano e Processi</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">Stato:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="all">Tutti gli Stati</option>
                  <option value="conforme">Conforme / Adeguato</option>
                  <option value="da_migliorare">Da Migliorare</option>
                  <option value="non_conforme">Non Conforme / Mancante</option>
                </select>
              </div>

              <button
                onClick={() => exportPreventiveAuditToCsv(activeAudit)}
                className="flex items-center gap-1.5 rounded-lg border border-[#223049] bg-[#162338] px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white transition-colors"
                title="Esporta foglio CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* 28-Item Field Sheet Table */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] overflow-hidden shadow-sm">
            <div className="p-4 bg-[#111A2B] border-b border-[#223049] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-neutral-100">
                  ETRA — AUDIT DIAGNOSTICO 360° (SCHEDA DI CAMPO OPERATIVA)
                </h3>
                <p className="text-xs text-neutral-400">
                  Checklist di rilevazione e misurazione parametri per la struttura ({filteredItems.length} di 28 visualizzati). Clicca sui campi per modificare valori, note o stati.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-[#223049] bg-[#121B2C] text-neutral-300 font-semibold">
                    <th className="p-2.5 w-16">Codice</th>
                    <th className="p-2.5 min-w-[200px]">Parametro / Oggetto di Analisi</th>
                    <th className="p-2.5 min-w-[180px]">Valore Rilevato / Note di Campo</th>
                    <th className="p-2.5 w-36">Unità Misura / Valore</th>
                    <th className="p-2.5 w-44 text-center">Stato / Valutazione</th>
                    <th className="p-2.5 w-24 text-center">Priorità</th>
                    <th className="p-2.5 min-w-[200px]">Azione / Output Strategico ETRA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#223049]/50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#121B2C]/70 transition-colors">
                      {/* Codice */}
                      <td className="p-2.5 font-mono font-bold text-[#DFBA73] align-top">
                        {item.code}
                      </td>

                      {/* Parametro */}
                      <td className="p-2.5 font-semibold text-neutral-100 align-top">
                        <div>{item.name}</div>
                        <span className="text-[10px] text-neutral-400 font-normal">{item.areaName}</span>
                      </td>

                      {/* Note di Campo */}
                      <td className="p-2.5 align-top">
                        <textarea
                          rows={2}
                          value={item.noteDiCampo}
                          onChange={(e) => handleUpdateItem(item.areaId as FieldAuditCoreAreaId, item.id, { noteDiCampo: e.target.value })}
                          className="w-full rounded bg-[#142033] border border-[#223049] p-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#C5A059]"
                        />
                      </td>

                      {/* Valore / Unità Misura */}
                      <td className="p-2.5 align-top">
                        <input
                          type="text"
                          value={item.unitOrValue}
                          onChange={(e) => handleUpdateItem(item.areaId as FieldAuditCoreAreaId, item.id, { unitOrValue: e.target.value })}
                          className="w-full rounded bg-[#142033] border border-[#223049] p-1.5 font-mono text-xs text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                        />
                      </td>

                      {/* Stato Selector */}
                      <td className="p-2.5 text-center align-top">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateItem(item.areaId as FieldAuditCoreAreaId, item.id, { status: e.target.value as FieldAuditEvaluationState })}
                          className="w-full rounded bg-[#142033] border border-[#223049] p-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="conforme">Conforme / Adeguato</option>
                          <option value="da_migliorare">Da Migliorare</option>
                          <option value="non_conforme">Non Conforme / Mancante</option>
                        </select>
                        <div className="mt-1">
                          {getStatusBadge(item.status, item.statusLabel)}
                        </div>
                      </td>

                      {/* Priorità Selector */}
                      <td className="p-2.5 text-center align-top">
                        <select
                          value={item.priority}
                          onChange={(e) => handleUpdateItem(item.areaId as FieldAuditCoreAreaId, item.id, { priority: e.target.value as FieldAuditPriority })}
                          className="rounded bg-[#142033] border border-[#223049] p-1 text-xs text-neutral-200 focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="bassa">Bassa</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                          <option value="critica">Critica</option>
                        </select>
                        <div className="mt-1">
                          {getPriorityBadge(item.priority)}
                        </div>
                      </td>

                      {/* Azione / Output */}
                      <td className="p-2.5 align-top">
                        <input
                          type="text"
                          value={item.strategicAction}
                          onChange={(e) => handleUpdateItem(item.areaId as FieldAuditCoreAreaId, item.id, { strategicAction: e.target.value })}
                          className="w-full rounded bg-[#142033] border border-[#223049] p-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#C5A059]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SCHEDA DI ANALISI DETTAGLIATA KPI (Page 4 of PDF) */}
      {/* ========================================================================= */}
      {subTab === 'kpi_analysis' && (
        <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4">
          <div className="border-b border-[#223049] pb-3">
            <h3 className="font-serif text-base font-semibold text-neutral-100">
              ETRA — SCHEDA DI ANALISI DETTAGLIATA KPI
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Definizioni, Metodologia di Calcolo, Benchmark di Settore Luxury/Boutique ed Azioni Correttive Strategiche.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[#223049] bg-[#121B2C] text-neutral-300 font-semibold">
                  <th className="p-3 w-48">KPI / Indicatore</th>
                  <th className="p-3 w-32">Area</th>
                  <th className="p-3 min-w-[200px]">Formula / Formula di Calcolo</th>
                  <th className="p-3 w-36 text-center">Target Benchmark ETRA</th>
                  <th className="p-3 min-w-[180px]">Metodologia di Rilevazione</th>
                  <th className="p-3 min-w-[200px]">Azione Correttiva Strategica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223049]/50">
                {activeAudit.kpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-[#121B2C]/70 transition-colors">
                    <td className="p-3 font-semibold text-neutral-100">{kpi.name}</td>
                    <td className="p-3 text-neutral-300 font-mono text-[11px]">{kpi.area}</td>
                    <td className="p-3 text-neutral-200 font-mono text-[11px] bg-[#101726] rounded">
                      {kpi.formula}
                    </td>
                    <td className="p-3 font-mono font-bold text-center text-[#DFBA73]">
                      {kpi.benchmarkRange}
                    </td>
                    <td className="p-3 text-neutral-300">{kpi.metodologia}</td>
                    <td className="p-3 text-neutral-100 font-medium">{kpi.azioneCorrettiva}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SIMULATORE INTERATTIVO KPI & ROI */}
      {showKpiSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#223049] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-100 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#DFBA73]" />
                  <span>Simulatore Parametrico KPI &amp; ROI</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Regola i valori attuali (AS-IS) e i target concordati (TO-BE) per aggiornare in tempo reale grafici e proiezioni.
                </p>
              </div>
              <button 
                onClick={() => setShowKpiSimulatorModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A253A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* General Property Parameter: Rooms count */}
            <div className="rounded-xl bg-[#142033] border border-[#223049] p-3 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-semibold text-neutral-200 block">Numero Camere / Chiavi della Struttura:</span>
                <span className="text-[11px] text-neutral-400">Usato per calcolare l&apos;impatto economico annuo sul fatturato.</span>
              </div>
              <input
                type="number"
                min={1}
                max={500}
                value={simRoomsCount}
                onChange={(e) => setSimRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 rounded bg-[#0A101C] border border-[#223049] p-2 font-mono text-center font-bold text-neutral-100 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Sliders for each KPI */}
            <div className="space-y-4">
              {activeAudit.kpis.map((kpi) => {
                const isCurrency = kpi.unit === '€';
                const isPercent = kpi.unit === '%';
                const min = 0;
                const max = isCurrency ? 400 : isPercent ? 100 : 10;
                const step = isCurrency ? 1 : isPercent ? 0.5 : 0.1;

                return (
                  <div key={kpi.id} className="rounded-xl border border-[#223049] bg-[#121B2C] p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-100">{kpi.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{kpi.benchmarkRange}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* AS-IS Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-neutral-400">Attuale (AS-IS):</span>
                          <span className="font-mono font-bold text-neutral-200">{kpi.currentValueFormatted}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={kpi.currentValue}
                          onChange={(e) => handleUpdateKpi(kpi.id, parseFloat(e.target.value), kpi.targetValue)}
                          className="w-full accent-[#3B82F6] cursor-pointer"
                        />
                      </div>

                      {/* TO-BE Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-neutral-400">Target ETRA (TO-BE):</span>
                          <span className="font-mono font-bold text-emerald-400">{kpi.targetValueFormatted}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={kpi.targetValue}
                          onChange={(e) => handleUpdateKpi(kpi.id, kpi.currentValue, parseFloat(e.target.value))}
                          className="w-full accent-[#DC2626] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowKpiSimulatorModal(false)}
                className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-5 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
              >
                Applica e Chiudi Simulatore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUOVO AUDIT STRUTTURA */}
      {showNewAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-neutral-100 mb-1">
              Nuovo Audit Diagnostico Preventivo 360°
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Inizializza la scheda di campo (28 voci operative) e la simulazione KPI per una struttura cliente.
            </p>
            <form onSubmit={handleCreateNewAudit} className="space-y-4 text-xs">
              
              {/* Option to select from CRM Clients */}
              {clients.length > 0 && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Collega a Cliente da Anagrafica CRM</label>
                  <select
                    value={selectedCrmClientId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCrmClientId(val);
                      if (val !== 'custom') {
                        const c = clients.find(cl => cl.id === val);
                        if (c) {
                          setNewHotelName(c.name);
                          setNewHotelType(c.type);
                          setSimRoomsCount(c.roomsCount || 25);
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="custom">-- Struttura Personalizzata / Nuovo Lead --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type} · {c.roomsCount} camere)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Nome Struttura Ricettiva</label>
                <input
                  type="text"
                  required
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  placeholder="es. Villa dei Cedri Relais & SPA..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Tipologia / Segmento</label>
                <input
                  type="text"
                  value={newHotelType}
                  onChange={(e) => setNewHotelType(e.target.value)}
                  placeholder="es. Boutique Hotel (Luxury / Historic)"
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAuditModal(false)}
                  className="rounded-xl bg-[#182438] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-[#202E47]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Inizializza Audit 360°
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STAMPA / ESPORTAZIONE PDF DOSSIER */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl my-8 rounded-2xl border border-[#223049] bg-[#0A0E17] text-neutral-100 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#223049] pb-4">
              <div className="flex items-center gap-3">
                <EtraLogo size="sm" theme="dark" className="h-8 w-auto" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-100">
                    Dossier Executive Audit Diagnostico 360° &amp; Simulation KPI
                  </h3>
                  <p className="text-xs text-[#DFBA73]">
                    {activeAudit.hotelName} · Data: {activeAudit.auditDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Stampa / Salva in PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-xl bg-[#1A253A] border border-[#223049] px-3 py-2 text-xs text-neutral-300 hover:bg-[#202E47]"
                >
                  Chiudi
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-6 text-xs text-neutral-200">
              
              {/* Anagrafica Summary Box */}
              <div className="rounded-xl bg-[#121B2C] p-4 border border-[#223049] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Nome Struttura Ricettiva</span>
                  <span className="font-semibold text-sm text-neutral-100">{activeAudit.hotelName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Tipologia / Segmento</span>
                  <span className="font-semibold">{activeAudit.hotelType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Data Audit</span>
                  <span className="font-mono font-semibold">{activeAudit.auditDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Consulente / Auditor</span>
                  <span className="font-medium text-[#DFBA73]">{activeAudit.auditorName}</span>
                </div>
              </div>

              {/* Diagnosis Verdict Banner */}
              <div className={`rounded-xl border p-3 flex items-center justify-between gap-4 ${recommendedTier.badgeColor}`}>
                <div>
                  <span className="font-bold text-sm block">Valutazione Globale: {overallDiagnosisStatus}</span>
                  <p className="text-[11px] opacity-90 mt-0.5">{recommendedTier.rationale}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase opacity-75 block">Tier Contrattuale Proposto</span>
                  <span className="font-bold font-mono text-xs">{recommendedTier.name} ({recommendedTier.range})</span>
                </div>
              </div>

              {/* Summary Table 1 */}
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#DFBA73] mb-2 uppercase tracking-wider">
                  1. Riepilogo Avanzamento e Compliance Audit (5 Aree Core)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-[#223049]">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead className="bg-[#142033] text-neutral-300">
                      <tr>
                        <th className="p-2">Area Core</th>
                        <th className="p-2">Focus Strategico</th>
                        <th className="p-2 text-center">Totale Voci</th>
                        <th className="p-2 text-center">Conformi</th>
                        <th className="p-2 text-center">% Compliance</th>
                        <th className="p-2 text-center">Priorità</th>
                        <th className="p-2 text-center">Stato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#223049]">
                      {areaSummaries.map(a => (
                        <tr key={a.areaId}>
                          <td className="p-2 font-medium">{a.name}</td>
                          <td className="p-2 text-neutral-300">{a.focusStrategico}</td>
                          <td className="p-2 text-center font-mono">{a.totalItems}</td>
                          <td className="p-2 text-center font-mono font-bold">{a.conformiCount}</td>
                          <td className="p-2 text-center font-mono font-bold text-[#DFBA73]">{a.compliancePercentFormatted}</td>
                          <td className="p-2 text-center font-semibold text-rose-400">{a.prioritaGlobale}</td>
                          <td className="p-2 text-center text-rose-400 font-bold">{a.statoComplessivo}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#121B2C] font-bold">
                        <td className="p-2 text-[#DFBA73]">TOTALE AUDIT DIAGNOSTICO</td>
                        <td className="p-2 text-neutral-300">Valutazione Complessiva della Struttura</td>
                        <td className="p-2 text-center font-mono">{totalAuditItems}</td>
                        <td className="p-2 text-center font-mono text-emerald-400">{totalConformi}</td>
                        <td className="p-2 text-center font-mono text-rose-400">{totalComplianceFormatted}</td>
                        <td className="p-2 text-center">-</td>
                        <td className="p-2 text-center text-rose-400">{overallDiagnosisStatus}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KPI Simulation Table */}
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#DFBA73] mb-2 uppercase tracking-wider">
                  2. Simulazione Impatto KPI Strategici (AS-IS vs TO-BE)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-[#223049]">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead className="bg-[#142033] text-neutral-300">
                      <tr>
                        <th className="p-2">KPI / Indicatore</th>
                        <th className="p-2">Valore Attuale (AS-IS)</th>
                        <th className="p-2">Target ETRA (TO-BE)</th>
                        <th className="p-2">Delta / Incremento</th>
                        <th className="p-2">Benchmark Luxury</th>
                        <th className="p-2">Impatto Expected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#223049]">
                      {activeAudit.kpis.map(kpi => (
                        <tr key={kpi.id}>
                          <td className="p-2 font-medium">{kpi.name}</td>
                          <td className="p-2 font-mono font-bold">{kpi.currentValueFormatted}</td>
                          <td className="p-2 font-mono font-bold text-emerald-400">{kpi.targetValueFormatted}</td>
                          <td className="p-2 font-mono font-bold text-[#DFBA73]">{kpi.deltaFormatted}</td>
                          <td className="p-2 font-mono text-neutral-400">{kpi.benchmarkRange}</td>
                          <td className="p-2 text-neutral-300">{kpi.expectedImpact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete 28 items field checklist */}
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#DFBA73] mb-2 uppercase tracking-wider">
                  3. Dettaglio Scheda di Campo (28 Voci di Rilevazione)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-[#223049]">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead className="bg-[#142033] text-neutral-300">
                      <tr>
                        <th className="p-1.5 w-14">Codice</th>
                        <th className="p-1.5">Parametro / Analisi</th>
                        <th className="p-1.5">Valore Rilevato</th>
                        <th className="p-1.5 text-center">Stato</th>
                        <th className="p-1.5 text-center">Priorità</th>
                        <th className="p-1.5">Azione Strategica ETRA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#223049]/40">
                      {activeAudit.areas.flatMap(area => area.items).map(item => (
                        <tr key={item.id}>
                          <td className="p-1.5 font-mono font-bold text-[#DFBA73]">{item.code}</td>
                          <td className="p-1.5 font-medium">{item.name}</td>
                          <td className="p-1.5 font-mono text-neutral-300">{item.unitOrValue}</td>
                          <td className="p-1.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                              item.status === 'conforme' ? 'text-emerald-400 bg-emerald-500/10' :
                              item.status === 'da_migliorare' ? 'text-amber-400 bg-amber-500/10' :
                              'text-rose-400 bg-rose-500/10'
                            }`}>
                              {item.statusLabel}
                            </span>
                          </td>
                          <td className="p-1.5 text-center font-semibold">{item.priority}</td>
                          <td className="p-1.5 text-neutral-200">{item.strategicAction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Accreditation Footer */}
              <div className="pt-6 border-t border-[#223049] grid grid-cols-2 gap-8 text-[11px] text-neutral-400">
                <div>
                  <span className="block mb-6">Per la Struttura Ricettiva:</span>
                  <div className="border-b border-[#223049] pb-1 font-semibold text-neutral-200">
                    Firma Legale Rappresentante
                  </div>
                </div>
                <div className="text-right">
                  <span className="block mb-6">Per ETRA — Hospitality Solutions Boutique:</span>
                  <div className="border-b border-[#223049] pb-1 font-semibold text-[#DFBA73]">
                    {activeAudit.auditorName} · Lead Senior Advisor
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

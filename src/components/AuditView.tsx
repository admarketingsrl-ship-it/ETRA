import React, { useState } from 'react';
import { 
  Client, 
  ClientAuditData, 
  AuditArea, 
  AuditChecklistItem, 
  AuditComplianceStatus, 
  AuditPriority,
  AuditAreaId
} from '../types';
import { evaluateAuditData } from '../utils/calculations';
import { 
  ClipboardCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Printer, 
  Sparkles, 
  Building2, 
  FileText, 
  ArrowRight, 
  Calendar, 
  SlidersHorizontal,
  BookmarkCheck,
  TrendingUp,
  Cpu,
  Scale,
  Gem
} from 'lucide-react';

interface AuditViewProps {
  clients: Client[];
  audits: Record<string, ClientAuditData>;
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onUpdateAudit: (clientId: string, updatedAudit: ClientAuditData) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  clients,
  audits,
  selectedClientId,
  onSelectClient,
  onUpdateAudit,
}) => {
  // Target client for audit (if 'all' was selected, default to first client)
  const currentClientId = selectedClientId === 'all' ? (clients[0]?.id || 'client_1') : selectedClientId;
  const activeClient = clients.find(c => c.id === currentClientId) || clients[0];
  const currentAudit = audits[currentClientId];

  // Active Area tab
  const [activeAreaTab, setActiveAreaTab] = useState<AuditAreaId>('economics');

  // Executive printable summary modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Evaluate scores and action plan
  const evaluation = evaluateAuditData(currentAudit);

  const getAreaIcon = (areaId: AuditAreaId) => {
    switch (areaId) {
      case 'economics': return <TrendingUp className="h-4 w-4" />;
      case 'technology': return <Cpu className="h-4 w-4" />;
      case 'compliance': return <Scale className="h-4 w-4" />;
      case 'brand': return <Gem className="h-4 w-4" />;
    }
  };

  const handleUpdateItemStatus = (areaId: AuditAreaId, itemId: string, status: AuditComplianceStatus) => {
    if (!currentAudit) return;

    const updatedAreas = currentAudit.areas.map(area => {
      if (area.id === areaId) {
        const updatedItems = area.items.map(item => {
          if (item.id === itemId) {
            let priority = item.priorityAction;
            if (status === 'critico') priority = 'immediata';
            else if (status === 'parziale' && priority === 'nessuna') priority = 'media';
            else if (status === 'conforme') priority = 'nessuna';

            return { ...item, status, priorityAction: priority };
          }
          return item;
        });
        return { ...area, items: updatedItems };
      }
      return area;
    });

    const updatedAudit: ClientAuditData = {
      ...currentAudit,
      lastUpdated: new Date().toISOString().slice(0, 10),
      areas: updatedAreas,
    };

    onUpdateAudit(currentClientId, updatedAudit);
  };

  const handleUpdateItemNotes = (areaId: AuditAreaId, itemId: string, evidenceNotes: string) => {
    if (!currentAudit) return;

    const updatedAreas = currentAudit.areas.map(area => {
      if (area.id === areaId) {
        const updatedItems = area.items.map(item => {
          if (item.id === itemId) {
            return { ...item, evidenceNotes };
          }
          return item;
        });
        return { ...area, items: updatedItems };
      }
      return area;
    });

    const updatedAudit: ClientAuditData = {
      ...currentAudit,
      lastUpdated: new Date().toISOString().slice(0, 10),
      areas: updatedAreas,
    };

    onUpdateAudit(currentClientId, updatedAudit);
  };

  const handleUpdateItemPriority = (areaId: AuditAreaId, itemId: string, priorityAction: AuditPriority) => {
    if (!currentAudit) return;

    const updatedAreas = currentAudit.areas.map(area => {
      if (area.id === areaId) {
        const updatedItems = area.items.map(item => {
          if (item.id === itemId) {
            return { ...item, priorityAction };
          }
          return item;
        });
        return { ...area, items: updatedItems };
      }
      return area;
    });

    const updatedAudit: ClientAuditData = {
      ...currentAudit,
      lastUpdated: new Date().toISOString().slice(0, 10),
      areas: updatedAreas,
    };

    onUpdateAudit(currentClientId, updatedAudit);
  };

  const handleUpdateExecutiveNotes = (notes: string) => {
    if (!currentAudit) return;
    const updatedAudit: ClientAuditData = {
      ...currentAudit,
      lastUpdated: new Date().toISOString().slice(0, 10),
      executiveNotes: notes,
    };
    onUpdateAudit(currentClientId, updatedAudit);
  };

  const activeArea = currentAudit?.areas?.find(a => a.id === activeAreaTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Client Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-[#223049] bg-[#0E1523] p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#DFBA73] uppercase mb-1">
            <ClipboardCheck className="h-4 w-4" />
            <span>Metodologia Esclusiva ETRA · Audit Diagnostico a 360° (&quot;Logic &amp; Vision&quot;)</span>
          </div>
          <h1 className="font-serif text-xl lg:text-2xl font-medium text-neutral-100">
            Valutazione Preliminare e Conformità Struttura
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Screening peritale sui 4 pilastri strategici di ETRA: Economics, Technology, Compliance normativa (CIN / EAA 2025) e Brand Identity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Client select for Audit */}
          <div className="flex items-center gap-2 rounded-xl border border-[#223049] bg-[#141F33] px-3 py-2 text-xs">
            <Building2 className="h-4 w-4 text-[#C5A059]" />
            <select
              value={currentClientId}
              onChange={(e) => onSelectClient(e.target.value)}
              className="bg-transparent font-medium text-neutral-100 focus:outline-none cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#0E1523] text-neutral-100">
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 shadow-sm hover:brightness-110 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Esporta Report Esecutivo</span>
          </button>
        </div>
      </div>

      {/* 4-Week Protocol & 100% Refund Clause Callout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-3">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-mono">
            <span>Settimana 1</span>
            <span className="text-emerald-400 font-bold">100% OK</span>
          </div>
          <div className="font-semibold text-neutral-100 mt-1">Data Gathering</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Estrazione PMS, bilancino, contratti software.</div>
        </div>

        <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-3">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-mono">
            <span>Settimana 2</span>
            <span className="text-blue-400 font-bold">IN CORSO</span>
          </div>
          <div className="font-semibold text-neutral-100 mt-1">Deep Inspection</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Intervista con GM, audit impianti e front-desk.</div>
        </div>

        <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-3">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] uppercase font-mono">
            <span>Settimana 3</span>
            <span>PROGRAMMATO</span>
          </div>
          <div className="font-semibold text-neutral-100 mt-1">Dossier Diagnostico</div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Mappatura sprechi, over-commissioni e rischi.</div>
        </div>

        <div className="rounded-xl border border-[#C5A059]/40 bg-[#121B2C] p-3">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#DFBA73]">
            <span>Settimana 4</span>
            <span className="font-bold">BONUS 100%</span>
          </div>
          <div className="font-semibold text-[#DFBA73] mt-1">Presentation &amp; Retainer</div>
          <div className="text-[11px] text-neutral-300 mt-0.5">100% valore Audit rimborsato su canone Retainer!</div>
        </div>
      </div>

      {/* Audit Overall Health Index Scoreboard */}
      <div className="rounded-2xl border border-[#223049] bg-gradient-to-r from-[#0C1322] via-[#111A2C] to-[#0A0E17] p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Global Score */}
          <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-[#223049] pb-4 md:pb-0 md:pr-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1C2C47] to-[#0E1523] border border-[#C5A059]/40 shadow-inner">
              <span className="font-mono text-3xl font-extrabold text-[#DFBA73] tabular-nums">
                {evaluation.overallHealthScore}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-[#DFBA73] uppercase block">
                Overall Health Index
              </span>
              <h3 className="text-base font-semibold text-neutral-100 mt-0.5">
                Indice Globale di Salute
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {evaluation.overallHealthScore >= 80 
                  ? 'Standard eccellente in linea con l’ospitalità di lusso.' 
                  : evaluation.overallHealthScore >= 60 
                  ? 'Conformità moderata con margini di efficientamento.'
                  : 'Criticità rilevanti: necessario piano correttivo tempestivo.'}
              </p>
            </div>
          </div>

          {/* Area mini score breakdown (8 cols) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {evaluation.areaScores.map(areaScore => (
              <div 
                key={areaScore.areaId}
                onClick={() => setActiveAreaTab(areaScore.areaId as AuditAreaId)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  activeAreaTab === areaScore.areaId
                    ? 'border-[#C5A059] bg-[#162238] shadow-sm'
                    : 'border-[#223049] bg-[#0E1523] hover:border-[#354868]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="truncate">{areaScore.title}</span>
                  <span className="font-mono font-bold text-neutral-200">{areaScore.score}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#1A263D] overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      areaScore.score >= 75 ? 'bg-emerald-400' : areaScore.score >= 50 ? 'bg-[#DFBA73]' : 'bg-rose-500'
                    }`}
                    style={{ width: `${areaScore.score}%` }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>{areaScore.conformeCount} ok</span>
                  <span className={areaScore.criticoCount > 0 ? 'text-rose-400 font-semibold' : ''}>
                    {areaScore.criticoCount} alert
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 4 Macro-Aree Navigation Tabs */}
      <div className="flex rounded-xl bg-[#0E1523] p-1 border border-[#223049] overflow-x-auto">
        {currentAudit?.areas?.map(area => {
          const isSelected = activeAreaTab === area.id;
          const scoreObj = evaluation.areaScores.find(s => s.areaId === area.id);

          return (
            <button
              key={area.id}
              onClick={() => setActiveAreaTab(area.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                isSelected
                  ? 'bg-[#18263D] text-[#DFBA73] shadow-sm font-semibold border border-[#C5A059]/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#121B2C]'
              }`}
            >
              {getAreaIcon(area.id)}
              <span>{area.code}: {area.title}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-200">
                {scoreObj?.score ?? 0}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Area Checklist Section */}
      {activeArea && (
        <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#223049] pb-4">
            <div>
              <span className="text-[10px] font-semibold text-[#DFBA73] uppercase tracking-wider block">
                {activeArea.code} · {activeArea.subtitle}
              </span>
              <h2 className="text-lg font-semibold text-neutral-100 mt-0.5">
                {activeArea.title}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
                {activeArea.description}
              </p>
            </div>
            <div className="text-xs font-mono text-neutral-400 self-start sm:self-auto">
              Peso area: <strong>{activeArea.weight}%</strong>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4">
            {activeArea.items.map((item: AuditChecklistItem) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#223049] bg-[#111A2B] p-5 space-y-4 hover:border-[#354868] transition-all"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#DFBA73] bg-[#17253B] px-2 py-0.5 rounded border border-[#223049]">
                        {item.code}
                      </span>
                      <h3 className="text-sm font-semibold text-neutral-100">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>
                    {/* Gold Standard ETRA */}
                    <div className="text-[11px] text-[#DFBA73] bg-[#162234] border border-[#C5A059]/20 rounded-lg p-2 mt-1">
                      <strong>Gold Standard ETRA:</strong> {item.standardEtra}
                    </div>
                  </div>

                  {/* Compliance Status Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start shrink-0">
                    <button
                      onClick={() => handleUpdateItemStatus(activeArea.id, item.id, 'conforme')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        item.status === 'conforme'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'border-[#223049] bg-[#141F33] text-neutral-400 hover:text-emerald-400'
                      }`}
                      title="Punteggio 100%"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Conforme</span>
                    </button>

                    <button
                      onClick={() => handleUpdateItemStatus(activeArea.id, item.id, 'parziale')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        item.status === 'parziale'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                          : 'border-[#223049] bg-[#141F33] text-neutral-400 hover:text-amber-400'
                      }`}
                      title="Punteggio 50%"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Parziale</span>
                    </button>

                    <button
                      onClick={() => handleUpdateItemStatus(activeArea.id, item.id, 'critico')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        item.status === 'critico'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-sm'
                          : 'border-[#223049] bg-[#141F33] text-neutral-400 hover:text-rose-400'
                      }`}
                      title="Punteggio 0% - Alert Critico"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Critico</span>
                    </button>

                    <button
                      onClick={() => handleUpdateItemStatus(activeArea.id, item.id, 'na')}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs border transition-all ${
                        item.status === 'na'
                          ? 'bg-neutral-700/50 border-neutral-500 text-neutral-300'
                          : 'border-[#223049] bg-[#141F33] text-neutral-500 hover:text-neutral-300'
                      }`}
                      title="Non Applicabile"
                    >
                      <span>N/A</span>
                    </button>
                  </div>
                </div>

                {/* Evidence notes & Priority action */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#223049]/60">
                  <div className="md:col-span-8">
                    <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                      Evidenze & Note di Audit Rilevate:
                    </label>
                    <textarea
                      rows={2}
                      value={item.evidenceNotes || ''}
                      onChange={(e) => handleUpdateItemNotes(activeArea.id, item.id, e.target.value)}
                      placeholder="Registra dati quantitativi, screenshot, rilievi o documenti esaminati..."
                      className="w-full rounded-lg border border-[#223049] bg-[#0E1523] p-2 text-xs text-neutral-200 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-neutral-400 block mb-1">
                        Priorità d’Intervento ETRA:
                      </label>
                      <select
                        value={item.priorityAction}
                        onChange={(e) => handleUpdateItemPriority(activeArea.id, item.id, e.target.value as AuditPriority)}
                        className="w-full rounded-lg border border-[#223049] bg-[#0E1523] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
                      >
                        <option value="immediata">Priorità Immediata (Urgenza 30gg)</option>
                        <option value="media">Priorità Media (Apertura Stagionale)</option>
                        <option value="strategica">Priorità Strategica (Lungo Periodo)</option>
                        <option value="nessuna">Nessuna Azione Necessaria</option>
                      </select>
                    </div>

                    {item.actionRecommendation && (
                      <div className="text-[11px] text-neutral-400 leading-tight">
                        <span className="text-[#DFBA73] font-medium">Piano consigliato: </span>
                        {item.actionRecommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automatic Summaries: Criticità Riscontrate & Piano d'Azione Preliminare */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Sommario delle Criticità Riscontrate (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-rose-500/30 bg-[#0E1523] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#223049] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <h3 className="text-sm font-semibold text-neutral-100">
                Sommario Criticità Riscontrate ({evaluation.criticalItems.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-400 font-mono">Punti Rossi / Alert</span>
          </div>

          <div className="space-y-3">
            {evaluation.criticalItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#223049] p-6 text-center text-xs text-emerald-400">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
                <span>Nessuna criticità grave rilevata nell&apos;audit corrente.</span>
              </div>
            ) : (
              evaluation.criticalItems.map(({ areaTitle, item }) => (
                <div 
                  key={item.id}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-400">{item.code}</span>
                    <span className="text-[10px] text-neutral-400">{areaTitle}</span>
                  </div>
                  <div className="font-semibold text-neutral-100">{item.title}</div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {item.evidenceNotes || item.description}
                  </p>
                  <div className="text-[11px] text-rose-300 font-medium pt-1">
                    ↳ Raccomandazione: {item.actionRecommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Piano d'Azione Preliminare ETRA (6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#C5A059]/40 bg-[#0E1523] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#223049] pb-3">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-[#DFBA73]" />
              <h3 className="text-sm font-semibold text-neutral-100">
                Piano d’Azione Preliminare ETRA ({evaluation.actionPlan.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#DFBA73] font-mono">Prioritizzato per Urgenza</span>
          </div>

          <div className="space-y-3">
            {evaluation.actionPlan.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#223049] p-6 text-center text-xs text-neutral-400">
                Nessuna azione preliminare generata. Completa la checklist per generare la roadmap.
              </div>
            ) : (
              evaluation.actionPlan.map((action, idx) => {
                const isUrgent = action.priority === 'immediata';
                return (
                  <div 
                    key={idx}
                    className="rounded-xl border border-[#223049] bg-[#111A2B] p-3.5 text-xs space-y-1.5 hover:border-[#C5A059]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#DFBA73]">{action.code}</span>
                        <span className="text-neutral-400 text-[10px]">{action.area}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isUrgent ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-[#18263D] text-[#DFBA73]'
                      }`}>
                        {action.priority}
                      </span>
                    </div>

                    <div className="font-medium text-neutral-200">
                      {action.itemTitle}
                    </div>

                    <p className="text-xs text-neutral-100 font-medium leading-relaxed bg-[#142033] p-2 rounded-lg border border-[#223049]">
                      {action.action}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Note Esecutive Globali */}
      <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-3">
        <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          Note Esecutive & Conclusioni del Team Advisory ETRA
        </div>
        <textarea
          rows={3}
          value={currentAudit?.executiveNotes || ''}
          onChange={(e) => handleUpdateExecutiveNotes(e.target.value)}
          placeholder="Inserisci la sintesi conclusiva per la Proprietà o il Direttore Generale..."
          className="w-full rounded-xl border border-[#223049] bg-[#111A2B] p-3 text-xs sm:text-sm text-neutral-100 focus:border-[#C5A059] focus:outline-none"
        />
      </div>

      {/* Printable Executive Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#223049] bg-[#0B0F17] text-neutral-100 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#223049] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DFBA73] to-[#99732B] text-neutral-950 font-serif font-bold text-xl">
                  E
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-100">
                    ETRA — Hospitality Solutions Boutique
                  </h3>
                  <p className="text-xs text-[#DFBA73]">
                    Report Esecutivo di Audit Diagnostico a 360°
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Stampa / Salva PDF
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
              
              <div className="rounded-xl bg-[#121B2C] p-4 border border-[#223049] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Struttura Esaminata</span>
                  <span className="font-semibold text-sm text-neutral-100">{activeClient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Tipologia & Location</span>
                  <span className="font-semibold">{activeClient.type} · {activeClient.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Data Validazione</span>
                  <span className="font-mono font-semibold">{currentAudit.lastUpdated}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Health Score ETRA</span>
                  <span className="font-mono text-base font-bold text-[#DFBA73]">{evaluation.overallHealthScore}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-sm font-semibold text-[#DFBA73] mb-2 uppercase tracking-wider">
                  1. Quadro Sintetico delle 4 Aree
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {evaluation.areaScores.map(a => (
                    <div key={a.areaId} className="rounded-lg bg-[#141F33] p-3 border border-[#223049]">
                      <div className="text-[11px] text-neutral-300 font-medium">{a.title}</div>
                      <div className="text-xl font-mono font-bold text-[#DFBA73] mt-1">{a.score}%</div>
                      <div className="text-[10px] text-neutral-400 mt-1">{a.conformeCount} conformi · {a.criticoCount} alert</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-serif text-sm font-semibold text-rose-400 mb-2 uppercase tracking-wider">
                  2. Matrice delle Criticità Rilevate
                </h4>
                <div className="space-y-2">
                  {evaluation.criticalItems.map(({ item }) => (
                    <div key={item.id} className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3">
                      <span className="font-mono font-bold text-rose-400">{item.code}: </span>
                      <strong className="text-neutral-100">{item.title}</strong>
                      <p className="text-neutral-300 mt-1">{item.evidenceNotes}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-serif text-sm font-semibold text-[#DFBA73] mb-2 uppercase tracking-wider">
                  3. Piano d’Azione e Raccomandazioni Strategiche
                </h4>
                <div className="space-y-2">
                  {evaluation.actionPlan.map((act, i) => (
                    <div key={i} className="rounded-lg bg-[#141F33] border border-[#223049] p-3">
                      <span className="font-mono text-[#DFBA73] font-bold">Step {i + 1} ({act.code}) — </span>
                      <span className="text-neutral-200">{act.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentAudit.executiveNotes && (
                <div>
                  <h4 className="font-serif text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
                    4. Verbale Conclusivo Team Advisory
                  </h4>
                  <p className="rounded-lg bg-[#111A2B] border border-[#223049] p-3 leading-relaxed">
                    {currentAudit.executiveNotes}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

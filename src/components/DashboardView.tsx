import React from 'react';
import { Client, MacroTask, MicroTask } from '../types';
import { calculateDashboardMetrics } from '../utils/calculations';
import { 
  CheckCircle2, 
  Clock, 
  Hourglass, 
  TrendingUp, 
  Briefcase, 
  Laptop, 
  AlertCircle, 
  Calendar, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface DashboardViewProps {
  clients: Client[];
  macroTasks: MacroTask[];
  selectedClientId: string;
  onNavigateTab: (tab: 'dashboard' | 'gantt' | 'clients' | 'preventive_audit' | 'audit' | 'manual') => void;
  onSelectClient: (clientId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  macroTasks,
  selectedClientId,
  onNavigateTab,
  onSelectClient,
}) => {
  const metrics = calculateDashboardMetrics(macroTasks, selectedClientId);
  const activeClient = clients.find(c => c.id === selectedClientId);

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'media':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completato': return 'Completato';
      case 'in_corso': return 'In Corso';
      case 'in_attesa': return 'In Attesa';
      default: return 'Non Avviato';
    }
  };

  const totalKeys = clients.reduce((acc, c) => acc + (c.roomsCount || 0), 0);
  const totalMonthlyRetainer = clients.reduce((acc, c) => acc + (c.monthlyRetainer || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner: Luxury Welcome & Context */}
      <div className="relative overflow-hidden rounded-2xl border border-[#223049] bg-gradient-to-r from-[#0C1322] via-[#101A2E] to-[#0A0E17] p-6 lg:p-8">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#C5A059]/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#DFBA73] uppercase mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Hospitality Solutions Boutique · Executive Suite</span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-medium tracking-wide text-neutral-100">
              {activeClient ? activeClient.name : 'Quadro Generale di Controllo Strutture'}
            </h1>
            <p className="mt-1 text-xs lg:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {activeClient 
                ? `${activeClient.type} a ${activeClient.location} · ${activeClient.roomsCount} camere · PMS: ${activeClient.currentPMS}`
                : 'Supervisione strategica consolidata su boutique hotel, residenze d’epoca e relais d’élite gestiti da ETRA.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('gantt')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2.5 text-xs font-semibold text-neutral-950 shadow-md hover:brightness-110 transition-all"
            >
              <span>Apri Gantt Operativo</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('preventive_audit')}
              className="flex items-center gap-2 rounded-xl border border-[#223049] bg-[#141F33] px-4 py-2.5 text-xs font-medium text-neutral-200 hover:border-[#C5A059]/60 hover:text-[#DFBA73] transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Audit Preventivo 360°</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. KPI Cards in Alto */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Indicatori KPI Principali
          </h2>
          <span className="text-[11px] text-neutral-400">
            {selectedClientId === 'all' ? 'Tutti i progetti consolidati' : `Filtro: ${activeClient?.name}`}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1: Avanzamento Globale */}
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#C5A059]/40 bg-gradient-to-b from-[#131D30] to-[#0E1523] p-4 relative overflow-hidden group">
            <div className="text-[11px] font-medium text-neutral-400">Avanzamento Globale</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[#DFBA73] tracking-tight tabular-nums">
                {metrics.globalProgressPercentage}%
              </span>
              <TrendingUp className="h-4 w-4 text-[#DFBA73]" />
            </div>
            {/* Visual Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div 
                className="h-full bg-gradient-to-r from-[#DFBA73] to-[#99732B] transition-all duration-500 rounded-full"
                style={{ width: `${metrics.globalProgressPercentage}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-neutral-400">Media ponderata micro-attività</div>
          </div>

          {/* Card 2: Totale Attività */}
          <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-4 hover:border-[#354868] transition-colors">
            <div className="text-[11px] font-medium text-neutral-400">Totale Attività</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-neutral-100 tabular-nums">
                {metrics.totalMicroTasks}
              </span>
              <span className="text-[11px] text-neutral-400">micro-task</span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Briefcase className="h-3 w-3 text-[#C5A059]" />
              <span>Attività operative attive</span>
            </div>
          </div>

          {/* Card 3: Completate */}
          <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-4 hover:border-emerald-500/40 transition-colors">
            <div className="text-[11px] font-medium text-emerald-400">Completate (SAL)</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-emerald-400 tabular-nums">
                {metrics.completedTasks}
              </span>
              <span className="text-[11px] text-emerald-400/70 font-mono">
                {metrics.totalMicroTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalMicroTasks) * 100) : 0}%
              </span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Collaudi positivi</span>
            </div>
          </div>

          {/* Card 4: In Corso */}
          <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-4 hover:border-blue-500/40 transition-colors">
            <div className="text-[11px] font-medium text-blue-400">In Corso</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-blue-400 tabular-nums">
                {metrics.inProgressTasks}
              </span>
              <span className="text-[11px] text-blue-400/70 font-mono">
                {metrics.totalMicroTasks > 0 ? Math.round((metrics.inProgressTasks / metrics.totalMicroTasks) * 100) : 0}%
              </span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-blue-400" />
              <span>In lavorazione attiva</span>
            </div>
          </div>

          {/* Card 5: Non Avviate / In Attesa */}
          <div className="rounded-xl border border-[#223049] bg-[#0E1523] p-4 hover:border-amber-500/40 transition-colors">
            <div className="text-[11px] font-medium text-neutral-400">In Attesa / Da Avviare</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-neutral-300 tabular-nums">
                {metrics.notStartedTasks + metrics.waitingTasks}
              </span>
              <span className="text-[11px] text-amber-400/80 font-mono">
                ({metrics.waitingTasks} bloccate)
              </span>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Hourglass className="h-3 w-3 text-amber-400" />
              <span>In coda di scheduling</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Ripartizione per Risorsa & Scadenze Imminenti (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Metriche di Ripartizione per Risorsa (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Ripartizione e Carico per Risorsa
            </h2>
            <span className="text-[11px] text-neutral-400">Calcolo su micro-attività correlate</span>
          </div>

          <div className="space-y-4">
            
            {/* Risorsa 1: Commerciale / Operations */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 hover:border-[#C5A059]/50 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DFBA73] to-[#99732B] text-neutral-950 font-bold shadow-md">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-[#DFBA73] transition-colors">
                      Risorsa 1 — Commerciale & Operations
                    </h3>
                    <p className="text-xs text-neutral-400">
                      General Contractor, Revenue Management, P&L, Fornitori e Cantieri
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-[#DFBA73] tabular-nums">
                    {metrics.r1ProgressPercentage}%
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Avanzamento</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2.5 w-full rounded-full bg-[#182438] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#DFBA73] to-[#A8833C] transition-all duration-500"
                  style={{ width: `${metrics.r1ProgressPercentage}%` }}
                />
              </div>

              {/* Stat pills */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#223049]/60 pt-3 text-xs text-neutral-300">
                <div className="rounded-lg bg-[#121B2C] p-2 text-center">
                  <span className="block text-[10px] text-neutral-400">Totale Assegnate</span>
                  <span className="font-mono font-bold text-neutral-100 tabular-nums">{metrics.r1TotalTasks}</span>
                </div>
                <div className="rounded-lg bg-[#121B2C] p-2 text-center">
                  <span className="block text-[10px] text-emerald-400">Completate</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{metrics.r1CompletedTasks}</span>
                </div>
                <div className="rounded-lg bg-[#121B2C] p-2 text-center">
                  <span className="block text-[10px] text-blue-400">In Lavorazione</span>
                  <span className="font-mono font-bold text-blue-400 tabular-nums">{metrics.r1InProgressTasks}</span>
                </div>
              </div>
            </div>

            {/* Risorsa 2: Brand & Digital */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 hover:border-blue-500/50 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white font-bold shadow-md">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-blue-400 transition-colors">
                      Risorsa 2 — Brand & Digital
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Digital Guest Journey, Cloud PMS, EAA 2025, Mobile Key e Storytelling
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-blue-400 tabular-nums">
                    {metrics.r2ProgressPercentage}%
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Avanzamento</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2.5 w-full rounded-full bg-[#182438] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB] transition-all duration-500"
                  style={{ width: `${metrics.r2ProgressPercentage}%` }}
                />
              </div>

              {/* Stat pills */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#223049]/60 pt-3 text-xs text-neutral-300">
                <div className="rounded-lg bg-[#121B2C] p-2 text-center">
                  <span className="block text-[10px] text-neutral-400">Totale Assegnate</span>
                  <span className="font-mono font-bold text-neutral-100 tabular-nums">{metrics.r2TotalTasks}</span>
                </div>
                <div className="rounded-lg bg-[#121B2C] p-2 text-center">
                  <span className="block text-[10px] text-emerald-400">Completate</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{metrics.r2CompletedTasks}</span>
                </div>
                <div className="rounded-lg bg-[#121B2C] p-2 text-center">
                  <span className="block text-[10px] text-blue-400">In Lavorazione</span>
                  <span className="font-mono font-bold text-blue-400 tabular-nums">{metrics.r2InProgressTasks}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Feed delle Ultime Attività o Scadenze Imminenti (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Scadenze Imminenti & SAL
            </h2>
            <button
              onClick={() => onNavigateTab('gantt')}
              className="text-[11px] text-[#DFBA73] hover:underline flex items-center gap-1"
            >
              <span>Vedi tutte</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-4 space-y-3">
            {metrics.upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Nessuna scadenza in sospeso per la selezione attuale.
              </div>
            ) : (
              metrics.upcomingDeadlines.map((task: MicroTask) => {
                const isOverdue = new Date(task.dueDate).getTime() < new Date().getTime();
                return (
                  <div
                    key={task.id}
                    className="group rounded-xl border border-[#223049] bg-[#121B2C] p-3 text-xs hover:border-[#C5A059]/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#DFBA73]">
                          {task.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border font-medium ${getPriorityBadgeClass(task.priority)}`}>
                          Priorità {task.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-400">
                        <Calendar className="h-3 w-3 text-neutral-400" />
                        <span className={isOverdue ? 'text-rose-400 font-semibold' : ''}>
                          {task.dueDate}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 font-medium text-neutral-100 line-clamp-1 group-hover:text-[#DFBA73] transition-colors">
                      {task.title}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400 border-t border-[#223049]/50 pt-2">
                      <span>{task.resource === 'resource_1' ? 'Risorsa 1 (Ops)' : task.resource === 'resource_2' ? 'Risorsa 2 (Brand)' : 'Team ETRA'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400">{getStatusText(task.status)}</span>
                        <span className="font-mono text-neutral-200">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 3. Portfolio Strutture Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Portfolio Boutique Hotels & Strutture Gestite
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Totale chiavi monitorate: <strong className="text-neutral-200">{totalKeys}</strong> · Retainer complessivo attivo: <strong className="text-[#DFBA73]">€{totalMonthlyRetainer.toLocaleString('it-IT')}/mese</strong>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('clients')}
            className="text-xs text-[#DFBA73] hover:underline flex items-center gap-1 font-medium"
          >
            <span>Gestione Anagrafica & Servizi</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clients.map(client => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all text-left group ${
                selectedClientId === client.id
                  ? 'border-[#C5A059] bg-[#142033] shadow-lg shadow-[#C5A059]/5'
                  : 'border-[#223049] bg-[#0E1523] hover:border-[#354868] hover:bg-[#111A2A]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#DFBA73] uppercase tracking-wider">
                    {client.type}
                  </span>
                  <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-[#DFBA73] transition-colors mt-0.5">
                    {client.name}
                  </h3>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#182438] text-neutral-400 group-hover:text-[#DFBA73]">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>

              <p className="text-xs text-neutral-400 mt-2 line-clamp-1">
                {client.location} · {client.roomsCount} camere
              </p>

              <div className="mt-4 border-t border-[#223049]/60 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block">PMS Attuale</span>
                  <span className="font-medium text-neutral-200 truncate max-w-[130px] block">{client.currentPMS}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 block">Servizi Attivi</span>
                  <span className="font-mono font-bold text-[#DFBA73]">{client.services.length} moduli</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

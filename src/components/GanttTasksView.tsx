import React, { useState } from 'react';
import { 
  Client, 
  MacroTask, 
  MicroTask, 
  TaskStatus, 
  TaskPriority, 
  ResourceId, 
  SupplierLink 
} from '../types';
import { calculateMacroProgress } from '../utils/calculations';
import { WorkNotesModal } from './WorkNotesModal';
import { SuppliersModal } from './SuppliersModal';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Calendar, 
  FileText, 
  Building2, 
  Search, 
  ListOrdered, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Layers, 
  ArrowRight, 
  GitBranch, 
  Table,
  RotateCcw,
  ChevronsUpDown,
  ChevronsDownUp,
  SlidersHorizontal,
  FolderKanban,
  CheckSquare,
  Sparkles
} from 'lucide-react';

interface GanttTasksViewProps {
  clients: Client[];
  macroTasks: MacroTask[];
  selectedClientId: string;
  onUpdateMicroTask: (macroId: string, updatedTask: MicroTask) => void;
  onAddMacroTask: (newMacro: MacroTask) => void;
  onAddMicroTask: (macroId: string, newMicro: MicroTask) => void;
  onDeleteMicroTask: (macroId: string, taskId: string) => void;
  onSaveNote: (taskId: string, newNote: string, author: string) => void;
  onUpdateSuppliersAndLinks: (taskId: string, suppliers: string[], links: SupplierLink[]) => void;
  onResetTasks?: () => void;
}

// Days from the official CSV: 12/10 to 09/11
const OFFICIAL_CSV_DAYS = [
  '12/10', '13/10', '14/10', '15/10', '16/10', '17/10', '18/10', '19/10',
  '20/10', '21/10', '22/10', '23/10', '24/10', '25/10', '26/10', '27/10',
  '28/10', '29/10', '30/10', '31/10', '01/11', '02/11', '03/11', '04/11',
  '05/11', '06/11', '07/11', '08/11', '09/11'
];

export const GanttTasksView: React.FC<GanttTasksViewProps> = ({
  clients,
  macroTasks,
  selectedClientId,
  onUpdateMicroTask,
  onAddMacroTask,
  onAddMicroTask,
  onDeleteMicroTask,
  onSaveNote,
  onUpdateSuppliersAndLinks,
  onResetTasks,
}) => {
  // View mode: Table vs Gantt visual timeline vs daily matrix
  const [viewMode, setViewMode] = useState<'table' | 'gantt' | 'matrix'>('table');
  
  // Filters
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'resource_1' | 'resource_2'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded macro accordions
  const [expandedMacros, setExpandedMacros] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    macroTasks.forEach(m => { init[m.id] = true; });
    return init;
  });

  // Expand / Collapse all
  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    macroTasks.forEach(m => { all[m.id] = true; });
    setExpandedMacros(all);
  };

  const handleCollapseAll = () => {
    setExpandedMacros({});
  };

  // Modals for notes and suppliers
  const [activeNotesTask, setActiveNotesTask] = useState<MicroTask | null>(null);
  const [activeSuppliersTask, setActiveSuppliersTask] = useState<MicroTask | null>(null);

  // New Macro Modal state
  const [showAddMacroModal, setShowAddMacroModal] = useState(false);
  const [newMacroTitle, setNewMacroTitle] = useState('');
  const [newMacroCategory, setNewMacroCategory] = useState('Consolidation & Asset Interni');
  const [newMacroClient, setNewMacroClient] = useState(selectedClientId !== 'all' ? selectedClientId : 'etra_launch');

  // New Micro Modal state
  const [selectedMacroForNewMicro, setSelectedMacroForNewMicro] = useState<string | null>(null);
  const [newMicroTitle, setNewMicroTitle] = useState('');
  const [newMicroResource, setNewMicroResource] = useState<ResourceId>('resource_1');
  const [newMicroPriority, setNewMicroPriority] = useState<TaskPriority>('media');
  const [newMicroStartDate, setNewMicroStartDate] = useState('2026-10-12');
  const [newMicroDueDate, setNewMicroDueDate] = useState('2026-10-14');
  const [newMicroDuration, setNewMicroDuration] = useState(2);
  const [newMicroDependsOn, setNewMicroDependsOn] = useState('-');

  const toggleMacroExpand = (macroId: string) => {
    setExpandedMacros(prev => ({ ...prev, [macroId]: !prev[macroId] }));
  };

  const handleCreateMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMacroTitle.trim()) return;

    const count = macroTasks.length + 1;
    const newMacro: MacroTask = {
      id: 'macro_' + Date.now(),
      clientId: newMacroClient,
      code: `FASE ${count}`,
      title: newMacroTitle.trim(),
      category: newMacroCategory,
      description: 'Macro-area operativa pianificata per ETRA Hospitality Solutions.',
      microTasks: [],
    };

    onAddMacroTask(newMacro);
    setNewMacroTitle('');
    setShowAddMacroModal(false);
  };

  const handleCreateMicro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMacroForNewMicro || !newMicroTitle.trim()) return;

    const parentMacro = macroTasks.find(m => m.id === selectedMacroForNewMicro);
    const microCount = (parentMacro?.microTasks?.length || 0) + 1;

    const newMicro: MicroTask = {
      id: 'micro_' + Date.now(),
      officialId: microCount + 30,
      macroTaskId: selectedMacroForNewMicro,
      clientId: parentMacro?.clientId || 'etra_launch',
      code: `${parentMacro?.code.replace('FASE ', '') || '1'}.${microCount}`,
      title: newMicroTitle.trim(),
      description: 'Micro-attività operativa.',
      resource: newMicroResource,
      dependsOn: newMicroDependsOn,
      durationDays: Number(newMicroDuration) || 1,
      status: 'non_avviato',
      progress: 0,
      priority: newMicroPriority,
      startDate: newMicroStartDate,
      dueDate: newMicroDueDate,
      notes: [],
      suppliers: [],
      links: [],
    };

    onAddMicroTask(selectedMacroForNewMicro, newMicro);
    setNewMicroTitle('');
    setSelectedMacroForNewMicro(null);
  };

  // Filter Macro & Micro Tasks
  const filteredMacroTasks = macroTasks
    .filter(macro => {
      // Project / Structure filter
      if (projectFilter !== 'all') {
        if (projectFilter === 'etra_launch') {
          if (macro.clientId !== 'etra_launch') return false;
        } else {
          if (macro.clientId !== projectFilter) return false;
        }
      }

      // Phase filter
      if (phaseFilter !== 'all') {
        if (phaseFilter === 'phase_1' && macro.code !== 'FASE 1') return false;
        if (phaseFilter === 'phase_2' && macro.code !== 'FASE 2') return false;
        if (phaseFilter === 'phase_3' && macro.code !== 'FASE 3') return false;
        if (phaseFilter === 'phase_4' && macro.code !== 'FASE 4') return false;
        if (phaseFilter === 'phase_5' && macro.code !== 'FASE 5') return false;
        if (phaseFilter === 'clients' && macro.clientId === 'etra_launch') return false;
      }

      return true;
    })
    .map(macro => {
      const filteredMicro = (macro.microTasks || []).filter(task => {
        const matchesResource = resourceFilter === 'all' || task.resource === resourceFilter || task.resource === 'both';
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesSearch = searchQuery === '' || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.rif && task.rif.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          macro.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesResource && matchesStatus && matchesSearch;
      });

      return {
        ...macro,
        microTasks: filteredMicro,
      };
    })
    .filter(macro => macro.microTasks.length > 0 || searchQuery === '');

  // Calculate official CSV comparison metrics
  const allCurrentTasks = filteredMacroTasks.flatMap(m => m.microTasks);
  const totalTasksCount = allCurrentTasks.length;
  const completedTasksCount = allCurrentTasks.filter(t => t.status === 'completato').length;
  const inProgressTasksCount = allCurrentTasks.filter(t => t.status === 'in_corso').length;
  const notStartedTasksCount = allCurrentTasks.filter(t => t.status === 'non_avviato').length;

  const globalAvg = totalTasksCount > 0 
    ? Math.round(allCurrentTasks.reduce((acc, t) => acc + t.progress, 0) / totalTasksCount) 
    : 0;

  const r1Tasks = allCurrentTasks.filter(t => t.resource === 'resource_1');
  const r2Tasks = allCurrentTasks.filter(t => t.resource === 'resource_2');

  const r1Avg = r1Tasks.length > 0 ? Math.round(r1Tasks.reduce((acc, t) => acc + t.progress, 0) / r1Tasks.length) : 0;
  const r2Avg = r2Tasks.length > 0 ? Math.round(r2Tasks.reduce((acc, t) => acc + t.progress, 0) / r2Tasks.length) : 0;

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'alta': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'media': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'bassa': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'completato': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'in_corso': return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
      case 'in_attesa': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      default: return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  // Helper to check if task is active on a given day "DD/MM"
  const isTaskActiveOnDay = (task: MicroTask, dayStr: string): boolean => {
    if (!task.startDate || !task.dueDate) return false;
    const [d, m] = dayStr.split('/');
    const year = '2026';
    const dayDate = new Date(`${year}-${m}-${d}T00:00:00`);
    const start = new Date(`${task.startDate}T00:00:00`);
    const due = new Date(`${task.dueDate}T23:59:59`);
    return dayDate >= start && dayDate <= due;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Official CSV Summary */}
      <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#DFBA73] uppercase mb-1">
              <Layers className="h-4 w-4" />
              <span>Cronoprogramma &amp; Piano Operativo ETRA</span>
            </div>
            <h1 className="font-serif text-xl lg:text-2xl font-medium text-neutral-100 flex items-center gap-2.5">
              <span>Gantt, Macro-Fasi &amp; Task Manager Operativo</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-[#18263D] border border-[#223049] text-[#DFBA73]">
                {totalTasksCount} Attività
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Pianificazione per Fasi (Consolidation, Protocollo Audit, Go-To-Market, Client Acquisition, Scalabilità) con SAL in tempo reale e allocazione per Risorsa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View mode toggle: Table, Visual Gantt, and Daily Matrix */}
            <div className="flex rounded-xl bg-[#141F33] p-1 border border-[#223049]">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#1C2C47] text-[#DFBA73] shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Tabella Operativa</span>
              </button>

              <button
                onClick={() => setViewMode('gantt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'gantt'
                    ? 'bg-[#1C2C47] text-[#DFBA73] shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Timeline Barre</span>
              </button>

              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-[#1C2C47] text-[#DFBA73] shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Matrice calendario giornaliero da foglio CSV (12/10 – 09/11)"
              >
                <Table className="h-3.5 w-3.5" />
                <span>Matrice CSV</span>
              </button>
            </div>

            {/* Reset Tasks Button */}
            {onResetTasks && (
              <button
                onClick={() => {
                  if (window.confirm("Ripristinare l'intero cronoprogramma con tutte le attività predefinite delle 5 Fasi e dei Clienti?")) {
                    onResetTasks();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#223049] bg-[#121B2C] px-3 py-2 text-xs font-medium text-neutral-300 hover:border-[#DFBA73] hover:text-[#DFBA73] transition-all"
                title="Ripristina tutte le 5 Fasi del progetto e le attività dei clienti"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#DFBA73]" />
                <span className="hidden sm:inline">Ripristina Attività</span>
              </button>
            )}

            {/* Add Macro button */}
            <button
              onClick={() => setShowAddMacroModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-3.5 py-2 text-xs font-semibold text-neutral-950 shadow-sm hover:brightness-110 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Nuova Fase</span>
            </button>
          </div>
        </div>

        {/* Global Progress & Resource Benchmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#223049]/60 text-xs">
          
          {/* Global Progress Card */}
          <div className="rounded-xl bg-[#121B2C] border border-[#223049] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Avanzamento Globale</span>
              <span className="font-mono font-bold text-neutral-200">{globalAvg}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[#1A263D] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#DFBA73] to-[#99732B] rounded-full transition-all duration-300"
                style={{ width: `${globalAvg}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span className="text-emerald-400 font-bold">{completedTasksCount} fatte</span>
              <span className="text-blue-400">{inProgressTasksCount} in corso</span>
              <span className="text-neutral-500">{notStartedTasksCount} da fare</span>
            </div>
          </div>

          {/* Risorsa 1 Card */}
          <div className="rounded-xl bg-[#121B2C] border border-[#223049] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-300">
              <div className="flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#DFBA73]" />
                <span>Risorsa 1 (Ops &amp; Comm)</span>
              </div>
              <span className="font-mono font-bold text-[#DFBA73]">{r1Avg}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[#1A263D] overflow-hidden">
              <div 
                className="h-full bg-[#DFBA73] rounded-full transition-all duration-300"
                style={{ width: `${r1Avg}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>{r1Tasks.length} micro-attività</span>
              <span className="text-emerald-400">{r1Tasks.filter(t => t.status === 'completato').length} OK</span>
            </div>
          </div>

          {/* Risorsa 2 Card */}
          <div className="rounded-xl bg-[#121B2C] border border-[#223049] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-300">
              <div className="flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Risorsa 2 (Brand &amp; Digital)</span>
              </div>
              <span className="font-mono font-bold text-blue-400">{r2Avg}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[#1A263D] overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${r2Avg}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>{r2Tasks.length} micro-attività</span>
              <span className="text-emerald-400">{r2Tasks.filter(t => t.status === 'completato').length} OK</span>
            </div>
          </div>

          {/* Accordion Controls & Info */}
          <div className="rounded-xl bg-[#121B2C] border border-[#223049] p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">Fasi Visibili</span>
              <span className="font-mono font-bold text-neutral-200">{filteredMacroTasks.length} Macro</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleExpandAll}
                className="flex-1 flex items-center justify-center gap-1 rounded bg-[#18263D] hover:bg-[#20324E] text-[11px] py-1 text-neutral-300 transition-colors"
                title="Espandi tutte le macro-fasi"
              >
                <ChevronsUpDown className="h-3 w-3" />
                <span>Espandi</span>
              </button>
              <button
                onClick={handleCollapseAll}
                className="flex-1 flex items-center justify-center gap-1 rounded bg-[#18263D] hover:bg-[#20324E] text-[11px] py-1 text-neutral-300 transition-colors"
                title="Comprimi tutte le macro-fasi"
              >
                <ChevronsDownUp className="h-3 w-3" />
                <span>Comprimi</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-xl border border-[#223049] bg-[#0A101C] p-3 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca attività per nome, codice, Rif, note..."
            className="w-full rounded-lg border border-[#223049] bg-[#121B2C] pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Project / Structure Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400">Progetto / Struttura:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-lg border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">Tutte le Strutture &amp; Progetti</option>
              <option value="etra_launch">Progetto Quadro ETRA (Fasi 1 – 5)</option>
              <option value="hotel_fasano">Hotel Boutique Fasano</option>
              <option value="client_1">Palazzo Vendramin (Venezia)</option>
              <option value="client_2">Relais Villa Mirabella (Chianti)</option>
            </select>
          </div>

          {/* Phase Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400">Fase:</span>
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="rounded-lg border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">Tutte le Fasi</option>
              <option value="phase_1">Fase 1: Asset Interni</option>
              <option value="phase_2">Fase 2: Protocollo Audit 360°</option>
              <option value="phase_3">Fase 3: Go-To-Market</option>
              <option value="phase_4">Fase 4: Client Acquisition</option>
              <option value="phase_5">Fase 5: Scalabilità &amp; BI</option>
              <option value="clients">Piani Strutture Clienti</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400">Risorsa:</span>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value as any)}
              className="rounded-lg border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">Tutte le Risorse</option>
              <option value="resource_1">Risorsa 1 (Ops &amp; Comm)</option>
              <option value="resource_2">Risorsa 2 (Brand &amp; Digital)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400">Stato:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-[#223049] bg-[#121B2C] px-2.5 py-1.5 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
            >
              <option value="all">Tutti gli Stati</option>
              <option value="completato">Completato</option>
              <option value="in_corso">In Corso</option>
              <option value="in_attesa">In Attesa</option>
              <option value="non_avviato">Non Avviato</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(projectFilter !== 'all' || phaseFilter !== 'all' || resourceFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setProjectFilter('all');
                setPhaseFilter('all');
                setResourceFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-[#DFBA73] hover:underline px-2"
            >
              Azzera filtri
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: TABELLA OPERATIVA */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {filteredMacroTasks.length === 0 ? (
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-12 text-center text-neutral-400 space-y-3">
              <FolderKanban className="h-10 w-10 text-neutral-600 mx-auto" />
              <p className="text-sm">Nessuna attività trovata con i filtri attuali.</p>
              {onResetTasks && (
                <button
                  onClick={onResetTasks}
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Ripristina Tutte le Attività Predefinite
                </button>
              )}
            </div>
          ) : (
            filteredMacroTasks.map((macro) => {
              const macroProgress = calculateMacroProgress(macro);
              const isExpanded = expandedMacros[macro.id] ?? true;

              return (
                <div 
                  key={macro.id} 
                  className="rounded-2xl border border-[#223049] bg-[#0E1523] overflow-hidden transition-all shadow-sm"
                >
                  {/* Macro Header */}
                  <div 
                    onClick={() => toggleMacroExpand(macro.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111A2B] px-5 py-4 cursor-pointer hover:bg-[#152136] transition-colors border-b border-[#223049]/60"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-neutral-400 hover:text-neutral-100">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-950 bg-[#DFBA73] px-2 py-0.5 rounded">
                          {macro.code}
                        </span>
                        <h2 className="text-sm sm:text-base font-semibold text-neutral-100">
                          {macro.title}
                        </h2>
                      </div>

                      <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-[#162238] px-2.5 py-0.5 rounded-full border border-[#223049]">
                        <span>{macro.category}</span>
                      </span>

                      <span className="text-[11px] text-neutral-400 font-mono">
                        ({macro.microTasks.length} micro)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:justify-end pl-7 sm:pl-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">SAL Macro:</span>
                        <div className="h-2 w-20 sm:w-28 rounded-full bg-[#1A263D] overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#DFBA73] to-[#99732B] rounded-full transition-all duration-300"
                            style={{ width: `${macroProgress}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#DFBA73] tabular-nums">
                          {macroProgress}%
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMacroForNewMicro(macro.id);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-[#223049] bg-[#162238] px-2.5 py-1 text-xs font-medium text-neutral-200 hover:border-[#C5A059]/60 hover:text-[#DFBA73] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Aggiungi</span>
                      </button>
                    </div>
                  </div>

                  {/* Micro Tasks list */}
                  {isExpanded && (
                    <div className="divide-y divide-[#223049]/40">
                      {macro.microTasks.map((task) => (
                        <div 
                          key={task.id}
                          className="p-4 sm:p-5 hover:bg-[#111A2B]/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          {/* Left: Code, Rif, Title, Dependencies, Resource */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-[#DFBA73]">
                                ID {task.officialId || task.code}
                              </span>
                              {task.rif && (
                                <span className="font-mono text-[10px] bg-[#162238] text-neutral-300 px-2 py-0.5 rounded border border-[#223049]" title="Riferimento procedura">
                                  Rif: {task.rif}
                                </span>
                              )}
                              {task.dependsOn && task.dependsOn !== '-' && (
                                <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20" title="Dipende da altre attività">
                                  <GitBranch className="h-3 w-3" />
                                  <span>Dipende da: {task.dependsOn}</span>
                                </span>
                              )}

                              {/* Resource selector */}
                              <select
                                value={task.resource}
                                onChange={(e) => onUpdateMicroTask(macro.id, { ...task, resource: e.target.value as ResourceId })}
                                className="rounded border border-[#223049] bg-[#141F33] px-2 py-0.5 text-[11px] text-neutral-300 focus:outline-none"
                              >
                                <option value="resource_1">Risorsa 1 (Ops &amp; Comm)</option>
                                <option value="resource_2">Risorsa 2 (Brand &amp; Digital)</option>
                              </select>

                              {/* Priority */}
                              <select
                                value={task.priority}
                                onChange={(e) => onUpdateMicroTask(macro.id, { ...task, priority: e.target.value as TaskPriority })}
                                className={`rounded px-2 py-0.5 text-[11px] font-medium border ${getPriorityBadgeClass(task.priority)}`}
                              >
                                <option value="alta">Priorità Alta</option>
                                <option value="media">Priorità Media</option>
                                <option value="bassa">Priorità Bassa</option>
                              </select>

                              {/* Duration & Dates */}
                              <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                                <Calendar className="h-3 w-3 text-neutral-400" />
                                <span>{task.startDate} → {task.dueDate}</span>
                                {task.durationDays && (
                                  <span className="text-[#DFBA73]">({task.durationDays}gg)</span>
                                )}
                              </div>
                            </div>

                            <h3 className="text-xs sm:text-sm font-semibold text-neutral-100">
                              {task.title}
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                              {task.description}
                            </p>
                          </div>

                          {/* Center: Slider & Status Dropdown */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:w-96">
                            {/* Status */}
                            <div className="w-full sm:w-36">
                              <label className="text-[10px] text-neutral-400 block mb-1">Stato</label>
                              <select
                                value={task.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as TaskStatus;
                                  let newProgress = task.progress;
                                  if (newStatus === 'completato' && task.progress < 100) newProgress = 100;
                                  if (newStatus === 'non_avviato' && task.progress > 0) newProgress = 0;
                                  onUpdateMicroTask(macro.id, { ...task, status: newStatus, progress: newProgress });
                                }}
                                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusBadgeClass(task.status)}`}
                              >
                                <option value="non_avviato">Non Avviato</option>
                                <option value="in_corso">In Corso</option>
                                <option value="in_attesa">In Attesa</option>
                                <option value="completato">Completato</option>
                              </select>
                            </div>

                            {/* Slider */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-neutral-400">Avanzamento:</span>
                                <span className="font-mono font-bold text-[#DFBA73] tabular-nums">
                                  {task.progress}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={task.progress}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  let updatedStatus = task.status;
                                  if (val === 100) updatedStatus = 'completato';
                                  else if (val > 0 && task.status === 'non_avviato') updatedStatus = 'in_corso';
                                  else if (val === 0 && task.status === 'completato') updatedStatus = 'non_avviato';

                                  onUpdateMicroTask(macro.id, { ...task, progress: val, status: updatedStatus });
                                }}
                                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                              />
                            </div>
                          </div>

                          {/* Right: Notes, Suppliers & Delete */}
                          <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t border-[#223049]/40 lg:border-t-0">
                            <button
                              onClick={() => setActiveNotesTask(task)}
                              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                                task.notes && task.notes.length > 0
                                  ? 'border-[#C5A059]/40 bg-[#172338] text-[#DFBA73]'
                                  : 'border-[#223049] bg-[#121B2C] text-neutral-400 hover:text-neutral-200'
                              }`}
                              title="Note e appunti operativi"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Note</span>
                              {task.notes && task.notes.length > 0 && (
                                <span className="rounded-full bg-[#DFBA73]/20 px-1.5 py-0.2 text-[10px] font-mono text-[#DFBA73]">
                                  {task.notes.length}
                                </span>
                              )}
                            </button>

                            <button
                              onClick={() => setActiveSuppliersTask(task)}
                              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                                (task.suppliers && task.suppliers.length > 0) || (task.links && task.links.length > 0)
                                  ? 'border-[#3B82F6]/40 bg-[#132035] text-blue-300'
                                  : 'border-[#223049] bg-[#121B2C] text-neutral-400 hover:text-neutral-200'
                              }`}
                              title="Fornitori e link"
                            >
                              <Building2 className="h-3.5 w-3.5" />
                              <span>Fornitori</span>
                              {task.suppliers && task.suppliers.length > 0 && (
                                <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-mono text-blue-300">
                                  {task.suppliers.length}
                                </span>
                              )}
                            </button>

                            <button
                              onClick={() => onDeleteMicroTask(macro.id, task.id)}
                              className="rounded-lg p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Elimina micro-attività"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: TIMELINE BARRE (GANTT) */}
      {viewMode === 'gantt' && (
        <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#223049] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#DFBA73]" />
                <span>Visualizzazione Temporale ad Asta (Cronoprogramma Grafico)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Avanzamento temporale e dipendenze tra attività (2026-10-12 → 2026-12-11).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-neutral-300">Completato (100%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-500" />
                <span className="text-neutral-300">In Corso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-neutral-700" />
                <span className="text-neutral-300">Non Avviato</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 overflow-x-auto pb-4">
            {filteredMacroTasks.map((macro) => {
              const macroProgress = calculateMacroProgress(macro);

              return (
                <div key={macro.id} className="space-y-2 min-w-[750px]">
                  <div className="flex items-center justify-between rounded-lg bg-[#141F33] p-3 text-xs border border-[#223049]">
                    <div className="flex items-center gap-2 font-semibold text-neutral-100">
                      <span className="font-mono text-[#DFBA73] font-bold">{macro.code}</span>
                      <span>{macro.title}</span>
                    </div>
                    <span className="font-mono font-bold text-[#DFBA73]">{macroProgress}% complessivo</span>
                  </div>

                  <div className="space-y-1.5 pl-4">
                    {macro.microTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="group flex items-center justify-between gap-4 rounded-lg bg-[#101726] p-2.5 text-xs hover:bg-[#152136] transition-colors border border-[#223049]/40"
                      >
                        <div className="w-1/3 truncate">
                          <span className="font-mono text-[#DFBA73] mr-1.5 font-bold">#{task.officialId || task.code}</span>
                          <span className="text-neutral-200 font-medium">{task.title}</span>
                        </div>

                        <div className="flex-1 px-4">
                          <div className="relative h-5 w-full rounded-md bg-[#192438] overflow-hidden flex items-center">
                            <div 
                              className={`h-full rounded-md transition-all duration-300 ${
                                task.status === 'completato' 
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                  : task.status === 'in_corso'
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                                  : 'bg-neutral-700'
                              }`}
                              style={{ width: `${Math.max(task.progress, 5)}%` }}
                            />
                            <span className="absolute left-3 text-[10px] font-mono font-bold text-white drop-shadow">
                              {task.progress}%
                            </span>
                          </div>
                        </div>

                        <div className="w-60 text-right font-mono text-[11px] text-neutral-400 flex items-center justify-end gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${task.resource === 'resource_1' ? 'text-[#DFBA73] bg-[#DFBA73]/10' : 'text-blue-400 bg-blue-500/10'}`}>
                            {task.resource === 'resource_1' ? 'R1' : 'R2'}
                          </span>
                          <span>{task.startDate}</span>
                          <span>→</span>
                          <span className="text-neutral-200">{task.dueDate}</span>
                          {task.durationDays && <span className="text-[#DFBA73]">({task.durationDays}gg)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: MATRICE GIORNALIERA (EXACT CSV CALENDAR 12/10 -> 09/11) */}
      {viewMode === 'matrix' && (
        <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#223049] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Table className="h-4 w-4 text-[#DFBA73]" />
                <span>Matrice Calendario Giornaliero (Settimane 1 - 5)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Rappresentazione fedele delle colonne temporali 12/10 - 09/11 del file CSV ufficiale ETRA.
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">29 Giorni Lavorativi Mappati</span>
          </div>

          <div className="overflow-x-auto pb-4">
            <table className="w-full text-[11px] border-collapse text-left min-w-[1200px]">
              <thead>
                <tr className="border-b border-[#223049] bg-[#101828] text-neutral-400 font-mono">
                  <th className="p-2 w-10">ID</th>
                  <th className="p-2 w-16">Rif</th>
                  <th className="p-2 min-w-[220px]">Attività</th>
                  <th className="p-2 w-24">Risorsa</th>
                  <th className="p-2 w-16 text-center">Stato</th>
                  <th className="p-2 w-12 text-center">%</th>
                  {OFFICIAL_CSV_DAYS.map(day => (
                    <th key={day} className="p-1 text-center w-8 text-[9px] border-l border-[#223049]/40">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223049]/40">
                {allCurrentTasks.map(task => (
                  <tr key={task.id} className="hover:bg-[#121B2C]/80 transition-colors">
                    <td className="p-2 font-mono font-bold text-[#DFBA73]">{task.officialId || '-'}</td>
                    <td className="p-2 font-mono text-neutral-400">{task.rif || '-'}</td>
                    <td className="p-2 font-medium text-neutral-200 truncate max-w-xs" title={task.title}>
                      {task.title}
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${task.resource === 'resource_1' ? 'text-[#DFBA73] bg-[#DFBA73]/10' : 'text-blue-400 bg-blue-500/10'}`}>
                        {task.resource === 'resource_1' ? 'Risorsa 1' : 'Risorsa 2'}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] border font-semibold ${getStatusBadgeClass(task.status)}`}>
                        {task.status === 'completato' ? 'OK' : task.status === 'in_corso' ? 'WORK' : 'TODO'}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-bold text-center text-[#DFBA73]">
                      {task.progress}%
                    </td>
                    {OFFICIAL_CSV_DAYS.map(day => {
                      const isActive = isTaskActiveOnDay(task, day);
                      return (
                        <td 
                          key={day} 
                          className={`p-1 text-center border-l border-[#223049]/30 ${
                            isActive 
                              ? task.resource === 'resource_1'
                                ? 'bg-[#DFBA73]/30 text-[#DFBA73] font-bold'
                                : 'bg-blue-500/30 text-blue-300 font-bold'
                              : ''
                          }`}
                        >
                          {isActive ? (task.resource === 'resource_1' ? 'R1' : 'R2') : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NUOVA MACRO-FASE */}
      {showAddMacroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-neutral-100 mb-1">
              Crea Nuova Macro-Fase di Lavoro
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Aggiungi un raggruppamento per attività al cronoprogramma generale.
            </p>
            <form onSubmit={handleCreateMacro} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Titolo Macro-Fase</label>
                <input
                  type="text"
                  required
                  value={newMacroTitle}
                  onChange={(e) => setNewMacroTitle(e.target.value)}
                  placeholder="es. Fase 6 — Masterclass Excellence Staff..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Categoria / Ambito</label>
                <input
                  type="text"
                  value={newMacroCategory}
                  onChange={(e) => setNewMacroCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Progetto / Struttura di Riferimento</label>
                <select
                  value={newMacroClient}
                  onChange={(e) => setNewMacroClient(e.target.value)}
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="etra_launch">Progetto Quadro ETRA</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMacroModal(false)}
                  className="rounded-xl bg-[#182438] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-[#202E47]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Crea Macro-Fase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUOVA MICRO-ATTIVITÀ */}
      {selectedMacroForNewMicro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-neutral-100 mb-1">
              Nuova Micro-Attività Operativa
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Aggiungi un'attività di dettaglio con date, risorsa e priorità.
            </p>
            <form onSubmit={handleCreateMicro} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Titolo Attività</label>
                <input
                  type="text"
                  required
                  value={newMicroTitle}
                  onChange={(e) => setNewMicroTitle(e.target.value)}
                  placeholder="es. Configurazione integrazione Stripe & Mews..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Risorsa Incaricata</label>
                  <select
                    value={newMicroResource}
                    onChange={(e) => setNewMicroResource(e.target.value as any)}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="resource_1">Risorsa 1 (Ops &amp; Comm)</option>
                    <option value="resource_2">Risorsa 2 (Brand &amp; Digital)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Priorità</label>
                  <select
                    value={newMicroPriority}
                    onChange={(e) => setNewMicroPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="bassa">Bassa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Data Inizio</label>
                  <input
                    type="date"
                    value={newMicroStartDate}
                    onChange={(e) => setNewMicroStartDate(e.target.value)}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Data Scadenza</label>
                  <input
                    type="date"
                    value={newMicroDueDate}
                    onChange={(e) => setNewMicroDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Durata (giorni)</label>
                  <input
                    type="number"
                    min={1}
                    value={newMicroDuration}
                    onChange={(e) => setNewMicroDuration(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Dipende da (ID)</label>
                  <input
                    type="text"
                    value={newMicroDependsOn}
                    onChange={(e) => setNewMicroDependsOn(e.target.value)}
                    placeholder="es. 1, 2 o '-'"
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMacroForNewMicro(null)}
                  className="rounded-xl bg-[#182438] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-[#202E47]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Aggiungi Attività
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOTE E APPUNTI DI LAVORO */}
      {activeNotesTask && (
        <WorkNotesModal
          task={activeNotesTask}
          onClose={() => setActiveNotesTask(null)}
          onSaveNote={(taskId, noteText, author) => {
            onSaveNote(taskId, noteText, author);
            setActiveNotesTask(prev => prev ? {
              ...prev,
              notes: [...(prev.notes || []), {
                id: 'n_' + Date.now(),
                text: noteText,
                author,
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
              }]
            } : null);
          }}
        />
      )}

      {/* MODAL: FORNITORI E LINK */}
      {activeSuppliersTask && (
        <SuppliersModal
          task={activeSuppliersTask}
          onClose={() => setActiveSuppliersTask(null)}
          onUpdateSuppliersAndLinks={(taskId: string, suppliers: string[], links: SupplierLink[]) => {
            onUpdateSuppliersAndLinks(taskId, suppliers, links);
            setActiveSuppliersTask(prev => prev ? { ...prev, suppliers, links } : null);
          }}
        />
      )}

    </div>
  );
};

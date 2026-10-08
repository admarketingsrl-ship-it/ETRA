import React, { useState } from 'react';
import { Client } from '../types';
import { EtraLogo } from './EtraLogo';
import { 
  Building2, 
  Moon, 
  Sun, 
  Database, 
  CheckCircle2, 
  LayoutDashboard, 
  KanbanSquare, 
  Users2, 
  ClipboardCheck,
  ChevronDown,
  BookOpen,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'gantt' | 'clients' | 'preventive_audit' | 'audit' | 'manual';
  setActiveTab: (tab: 'dashboard' | 'gantt' | 'clients' | 'preventive_audit' | 'audit' | 'manual') => void;
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onOpenDataModal: () => void;
  isAutoSaved: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  clients,
  selectedClientId,
  setSelectedClientId,
  theme,
  toggleTheme,
  onOpenDataModal,
  isAutoSaved,
  onLogout,
}) => {
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#223049] bg-[#0A0E17]/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Wordmark with official ETRA logo vector */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="group flex items-center gap-2 text-left focus:outline-none"
            title="Torna alla Dashboard"
          >
            <EtraLogo size="sm" theme={theme} className="h-9 w-auto" />
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#152033] text-[#DFBA73] shadow-inner font-semibold'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#121A28]'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('gantt')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'gantt'
                ? 'bg-[#152033] text-[#DFBA73] shadow-inner font-semibold'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#121A28]'
            }`}
          >
            <KanbanSquare className="h-4 w-4" />
            <span>Gantt & Cronoprogramma</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'clients'
                ? 'bg-[#152033] text-[#DFBA73] shadow-inner font-semibold'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#121A28]'
            }`}
          >
            <Users2 className="h-4 w-4" />
            <span>Clienti & Retainer</span>
          </button>

          <button
            onClick={() => setActiveTab('preventive_audit')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'preventive_audit'
                ? 'bg-[#152033] text-[#DFBA73] shadow-inner font-semibold border border-[#C5A059]/30'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#121A28]'
            }`}
            title="Audit Diagnostico Preventivo 360° & Simulation KPI (Modello PDF Certificato)"
          >
            <ClipboardCheck className="h-4 w-4 text-[#C5A059]" />
            <span>Audit Preventivo 360°</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#152033] text-[#DFBA73] shadow-inner font-semibold'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#121A28]'
            }`}
            title="Checklist Standard 4 Aree ETRA"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Checklist 4 Aree</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-[#152033] text-[#DFBA73] shadow-inner font-semibold'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-[#121A28]'
            }`}
            title="Manuale Operativo: Modello di Ingaggio e Pricing Strategy"
          >
            <BookOpen className="h-4 w-4 text-[#C5A059]" />
            <span>Manuale & Pricing</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Client Filter Selector */}
          <div className="relative">
            <button
              onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#223049] bg-[#101726] px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-[#C5A059]/50 hover:bg-[#152033] transition-colors"
              title="Filtra per cliente attivo"
            >
              <Building2 className="h-3.5 w-3.5 text-[#C5A059]" />
              <span className="max-w-[120px] sm:max-w-[150px] truncate">
                {selectedClientId === 'all' ? 'Tutte le Strutture' : selectedClient?.name || 'Cliente'}
              </span>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {clientDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-xl border border-[#223049] bg-[#0E1523] p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setClientDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Seleziona Struttura
                </div>
                <button
                  onClick={() => {
                    setSelectedClientId('all');
                    setClientDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                    selectedClientId === 'all'
                      ? 'bg-[#1A253A] text-[#DFBA73] font-semibold'
                      : 'text-neutral-300 hover:bg-[#141C2C]'
                  }`}
                >
                  <span>Vista Consolidata (Tutte)</span>
                  {selectedClientId === 'all' && <CheckCircle2 className="h-3.5 w-3.5 text-[#DFBA73]" />}
                </button>
                <div className="my-1 border-t border-[#223049]/60" />
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setClientDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                      selectedClientId === client.id
                        ? 'bg-[#1A253A] text-[#DFBA73] font-semibold'
                        : 'text-neutral-300 hover:bg-[#141C2C]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{client.name}</div>
                      <div className="text-[10px] text-neutral-400">{client.location} · {client.roomsCount} camere</div>
                    </div>
                    {selectedClientId === client.id && <CheckCircle2 className="h-3.5 w-3.5 text-[#DFBA73] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data Backup / Export Button */}
          <button
            onClick={onOpenDataModal}
            className="flex items-center gap-1.5 rounded-lg border border-[#223049] bg-[#101726] px-2.5 py-1.5 text-xs font-medium text-neutral-200 hover:border-[#C5A059]/50 hover:bg-[#152033] transition-colors"
            title="Salvataggio locale & Esportazione dati"
          >
            <Database className="h-3.5 w-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Dati</span>
            {isAutoSaved && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Salvataggio automatico attivo" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#223049] bg-[#101726] text-neutral-300 hover:text-[#DFBA73] hover:border-[#C5A059]/50 transition-colors"
            title={theme === 'dark' ? 'Passa al tema Chiaro' : 'Passa al tema Scuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Lock / Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex h-8 items-center gap-1.5 px-2.5 rounded-lg border border-[#223049] bg-[#101726] text-neutral-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors text-xs font-medium cursor-pointer"
              title="Blocca sessione portale (richiede password ETRA8581)"
            >
              <Lock className="h-3.5 w-3.5 text-[#DFBA73]" />
              <span className="hidden lg:inline text-[11px]">Blocca</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden border-t border-[#223049]/60 px-2 py-1.5 gap-1 overflow-x-auto bg-[#0A0E17]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-[#152033] text-[#DFBA73]' : 'text-neutral-400'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'gantt' ? 'bg-[#152033] text-[#DFBA73]' : 'text-neutral-400'
          }`}
        >
          <KanbanSquare className="h-3.5 w-3.5" />
          <span>Gantt</span>
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'clients' ? 'bg-[#152033] text-[#DFBA73]' : 'text-neutral-400'
          }`}
        >
          <Users2 className="h-3.5 w-3.5" />
          <span>Clienti</span>
        </button>
        <button
          onClick={() => setActiveTab('preventive_audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'preventive_audit' ? 'bg-[#152033] text-[#DFBA73] font-bold' : 'text-neutral-400'
          }`}
        >
          <ClipboardCheck className="h-3.5 w-3.5 text-[#C5A059]" />
          <span>Audit Prev. 360°</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-[#152033] text-[#DFBA73]' : 'text-neutral-400'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Checklist 4 Aree</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
            activeTab === 'manual' ? 'bg-[#152033] text-[#DFBA73]' : 'text-neutral-400'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Manuale &amp; Pricing</span>
        </button>
      </div>
    </header>
  );
};

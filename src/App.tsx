import React, { useState, useEffect } from 'react';
import { 
  ETRAAppState, 
  MacroTask, 
  MicroTask, 
  Client, 
  ClientAuditData, 
  SupplierLink 
} from './types';
import { loadStoredState, saveStateToStorage } from './utils/storage';
import { INITIAL_CLIENTS, INITIAL_MACRO_TASKS, INITIAL_AUDIT_DATA } from './data/initialData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { GanttTasksView } from './components/GanttTasksView';
import { ClientsServicesView } from './components/ClientsServicesView';
import { AuditView } from './components/AuditView';
import { PreventiveAudit360View } from './components/PreventiveAudit360View';
import { PricingManualView } from './components/PricingManualView';
import { DataExportModal } from './components/DataExportModal';
import { INITIAL_PREVENTIVE_AUDIT_FASANO } from './data/preventiveAuditData';
import { Preventive360Audit } from './types';

export default function App() {
  const [state, setState] = useState<ETRAAppState>(() => loadStoredState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gantt' | 'clients' | 'preventive_audit' | 'audit' | 'manual'>('preventive_audit');
  const [showDataModal, setShowDataModal] = useState(false);
  const [isAutoSaved, setIsAutoSaved] = useState(true);

  // Auto-save whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
    setIsAutoSaved(true);
    const timer = setTimeout(() => setIsAutoSaved(true), 1500);
    return () => clearTimeout(timer);
  }, [state]);

  // Update a single micro-task
  const handleUpdateMicroTask = (macroId: string, updatedTask: MicroTask) => {
    setState(prev => {
      const updatedMacros = prev.macroTasks.map(macro => {
        if (macro.id === macroId) {
          const updatedMicroTasks = macro.microTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
          return { ...macro, microTasks: updatedMicroTasks };
        }
        return macro;
      });
      return { ...prev, macroTasks: updatedMacros };
    });
  };

  // Add new macro task
  const handleAddMacroTask = (newMacro: MacroTask) => {
    setState(prev => ({
      ...prev,
      macroTasks: [...prev.macroTasks, newMacro],
    }));
  };

  // Add new micro task
  const handleAddMicroTask = (macroId: string, newMicro: MicroTask) => {
    setState(prev => {
      const updatedMacros = prev.macroTasks.map(macro => {
        if (macro.id === macroId) {
          return { ...macro, microTasks: [...macro.microTasks, newMicro] };
        }
        return macro;
      });
      return { ...prev, macroTasks: updatedMacros };
    });
  };

  // Delete micro task
  const handleDeleteMicroTask = (macroId: string, taskId: string) => {
    setState(prev => {
      const updatedMacros = prev.macroTasks.map(macro => {
        if (macro.id === macroId) {
          return { ...macro, microTasks: macro.microTasks.filter(t => t.id !== taskId) };
        }
        return macro;
      });
      return { ...prev, macroTasks: updatedMacros };
    });
  };

  // Save work note to task
  const handleSaveNote = (taskId: string, newNoteText: string, author: string) => {
    setState(prev => {
      const updatedMacros = prev.macroTasks.map(macro => {
        const updatedMicro = macro.microTasks.map(task => {
          if (task.id === taskId) {
            const newNote = {
              id: 'n_' + Date.now(),
              text: newNoteText,
              author,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            };
            return {
              ...task,
              notes: [...(task.notes || []), newNote],
            };
          }
          return task;
        });
        return { ...macro, microTasks: updatedMicro };
      });
      return { ...prev, macroTasks: updatedMacros };
    });
  };

  // Update suppliers and links on a task
  const handleUpdateSuppliersAndLinks = (taskId: string, suppliers: string[], links: SupplierLink[]) => {
    setState(prev => {
      const updatedMacros = prev.macroTasks.map(macro => {
        const updatedMicro = macro.microTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, suppliers, links };
          }
          return task;
        });
        return { ...macro, microTasks: updatedMicro };
      });
      return { ...prev, macroTasks: updatedMacros };
    });
  };

  // Update client
  const handleUpdateClient = (updatedClient: Client) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === updatedClient.id ? updatedClient : c),
    }));
  };

  // Add new client
  const handleAddClient = (newClient: Client) => {
    setState(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
    }));
  };

  // Update client audit data
  const handleUpdateAudit = (clientId: string, updatedAudit: ClientAuditData) => {
    setState(prev => ({
      ...prev,
      audits: {
        ...prev.audits,
        [clientId]: updatedAudit,
      },
    }));
  };

  // Preventive 360 Audit Handlers (based on PDF)
  const handleUpdatePreventiveAudit = (updatedAudit: Preventive360Audit) => {
    setState(prev => ({
      ...prev,
      preventiveAudits: {
        ...(prev.preventiveAudits || {}),
        [updatedAudit.id]: updatedAudit,
      },
    }));
  };

  const handleAddPreventiveAudit = (newAudit: Preventive360Audit) => {
    setState(prev => ({
      ...prev,
      preventiveAudits: {
        ...(prev.preventiveAudits || {}),
        [newAudit.id]: newAudit,
      },
      selectedPreventiveAuditId: newAudit.id,
    }));
  };

  const handleSelectPreventiveAudit = (auditId: string) => {
    setState(prev => ({
      ...prev,
      selectedPreventiveAuditId: auditId,
    }));
  };

  // Import full state
  const handleImportState = (newState: ETRAAppState) => {
    setState(newState);
  };

  // Reset only Gantt tasks to full official task list
  const handleResetGanttTasks = () => {
    setState(prev => ({
      ...prev,
      macroTasks: INITIAL_MACRO_TASKS,
    }));
  };

  // Reset to demo data
  const handleResetDemoData = () => {
    const demoState: ETRAAppState = {
      clients: INITIAL_CLIENTS,
      macroTasks: INITIAL_MACRO_TASKS,
      audits: INITIAL_AUDIT_DATA,
      preventiveAudits: { [INITIAL_PREVENTIVE_AUDIT_FASANO.id]: INITIAL_PREVENTIVE_AUDIT_FASANO },
      selectedPreventiveAuditId: INITIAL_PREVENTIVE_AUDIT_FASANO.id,
      selectedClientId: 'all',
      theme: 'dark',
    };
    setState(demoState);
  };

  // Toggle theme
  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Select client
  const handleSelectClient = (clientId: string) => {
    setState(prev => ({ ...prev, selectedClientId: clientId }));
  };

  const isDark = state.theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#080C14] text-neutral-100' : 'bg-[#F6F7F9] text-neutral-900'} font-sans flex flex-col selection:bg-[#C5A059]/30 selection:text-white transition-colors duration-200`}>
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clients={state.clients}
        selectedClientId={state.selectedClientId}
        setSelectedClientId={handleSelectClient}
        theme={state.theme}
        toggleTheme={toggleTheme}
        onOpenDataModal={() => setShowDataModal(true)}
        isAutoSaved={isAutoSaved}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            clients={state.clients}
            macroTasks={state.macroTasks}
            selectedClientId={state.selectedClientId}
            onNavigateTab={setActiveTab}
            onSelectClient={handleSelectClient}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttTasksView
            clients={state.clients}
            macroTasks={state.macroTasks}
            selectedClientId={state.selectedClientId}
            onUpdateMicroTask={handleUpdateMicroTask}
            onAddMacroTask={handleAddMacroTask}
            onAddMicroTask={handleAddMicroTask}
            onDeleteMicroTask={handleDeleteMicroTask}
            onSaveNote={handleSaveNote}
            onUpdateSuppliersAndLinks={handleUpdateSuppliersAndLinks}
            onResetTasks={handleResetGanttTasks}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsServicesView
            clients={state.clients}
            selectedClientId={state.selectedClientId}
            onSelectClient={handleSelectClient}
            onUpdateClient={handleUpdateClient}
            onAddClient={handleAddClient}
          />
        )}

        {activeTab === 'preventive_audit' && (
          <PreventiveAudit360View
            preventiveAudits={state.preventiveAudits || { [INITIAL_PREVENTIVE_AUDIT_FASANO.id]: INITIAL_PREVENTIVE_AUDIT_FASANO }}
            selectedAuditId={state.selectedPreventiveAuditId || INITIAL_PREVENTIVE_AUDIT_FASANO.id}
            onSelectAudit={handleSelectPreventiveAudit}
            onUpdateAudit={handleUpdatePreventiveAudit}
            onAddAudit={handleAddPreventiveAudit}
            clients={state.clients}
          />
        )}

        {activeTab === 'audit' && (
          <AuditView
            clients={state.clients}
            audits={state.audits}
            selectedClientId={state.selectedClientId}
            onSelectClient={handleSelectClient}
            onUpdateAudit={handleUpdateAudit}
          />
        )}

        {activeTab === 'manual' && (
          <PricingManualView />
        )}
      </main>

      {/* Quiet Footer adhering to anti-slop rules (No fake telemetry tickers) */}
      <footer className="border-t border-[#223049]/60 bg-[#070B12] py-6 text-xs text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-neutral-200">ETRA</span>
            <span>·</span>
            <span>Hospitality Solutions Boutique</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Audit 360°</span>
            <span>·</span>
            <span>General Contracting</span>
            <span>·</span>
            <span>Digital Guest Journey</span>
            <span>·</span>
            <span>Compliance CIN & EAA 2025</span>
          </div>
        </div>
      </footer>

      {/* Data Export / Backup Modal */}
      {showDataModal && (
        <DataExportModal
          state={state}
          onClose={() => setShowDataModal(false)}
          onImportState={handleImportState}
          onResetDemoData={handleResetDemoData}
        />
      )}

    </div>
  );
}

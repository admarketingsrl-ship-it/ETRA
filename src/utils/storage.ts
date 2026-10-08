import { Client, MacroTask, ClientAuditData, ETRAAppState } from '../types';
import { INITIAL_CLIENTS, INITIAL_MACRO_TASKS, INITIAL_AUDIT_DATA, OFFICIAL_RETAINER_TIERS, AVAILABLE_ETRA_SERVICES } from '../data/initialData';
import { INITIAL_PREVENTIVE_AUDIT_FASANO } from '../data/preventiveAuditData';

const STORAGE_KEY = 'etra_hospitality_state_v1';

export function loadStoredState(): ETRAAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.clients && parsed.macroTasks && parsed.audits) {
        // Ensure all project phases and macro tasks are present even if older state was saved
        const existingMacroIds = new Set((parsed.macroTasks as MacroTask[]).map(m => m.id));
        const mergedMacroTasks = [
          ...parsed.macroTasks,
          ...INITIAL_MACRO_TASKS.filter(m => !existingMacroIds.has(m.id)),
        ];

        // Ensure hotel_fasano is fully hydrated with all showcase services and milestones
        const mergedClients = (parsed.clients as Client[]).map(c => {
          if (c.id === 'hotel_fasano') {
            const defaultFasano = INITIAL_CLIENTS.find(ic => ic.id === 'hotel_fasano');
            if (defaultFasano && (!c.services || c.services.length < 4)) {
              return {
                ...defaultFasano,
                ...c,
                services: defaultFasano.services,
                contractMilestones: defaultFasano.contractMilestones,
              };
            }
          }
          return c;
        });

        // Ensure hotel_fasano is in clients if not already
        if (!mergedClients.some(c => c.id === 'hotel_fasano')) {
          const defaultFasano = INITIAL_CLIENTS.find(ic => ic.id === 'hotel_fasano');
          if (defaultFasano) mergedClients.unshift(defaultFasano);
        }

        const mergedAudits = {
          ...INITIAL_AUDIT_DATA,
          ...parsed.audits,
        };

        return {
          clients: mergedClients,
          macroTasks: mergedMacroTasks,
          audits: mergedAudits,
          preventiveAudits: {
            [INITIAL_PREVENTIVE_AUDIT_FASANO.id]: INITIAL_PREVENTIVE_AUDIT_FASANO,
            ...(parsed.preventiveAudits || {}),
          },
          selectedPreventiveAuditId: parsed.selectedPreventiveAuditId || INITIAL_PREVENTIVE_AUDIT_FASANO.id,
          selectedClientId: parsed.selectedClientId || 'all',
          theme: parsed.theme || 'dark',
          retainerTiers: parsed.retainerTiers || OFFICIAL_RETAINER_TIERS,
          availableServices: parsed.availableServices || AVAILABLE_ETRA_SERVICES,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load stored state from localStorage:', err);
  }

  // Default fallback
  return {
    clients: INITIAL_CLIENTS,
    macroTasks: INITIAL_MACRO_TASKS,
    audits: INITIAL_AUDIT_DATA,
    preventiveAudits: { [INITIAL_PREVENTIVE_AUDIT_FASANO.id]: INITIAL_PREVENTIVE_AUDIT_FASANO },
    selectedPreventiveAuditId: INITIAL_PREVENTIVE_AUDIT_FASANO.id,
    selectedClientId: 'all',
    theme: 'dark',
    retainerTiers: OFFICIAL_RETAINER_TIERS,
    availableServices: AVAILABLE_ETRA_SERVICES,
  };
}

export function saveStateToStorage(state: ETRAAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportStateToJson(state: ETRAAppState, filename = 'etra_hospitality_backup.json'): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportTasksToCsv(macroTasks: MacroTask[], clients: Client[]): void {
  const clientMap = new Map(clients.map(c => [c.id, c.name]));
  
  const headers = [
    'Macro ID',
    'Macro Titolo',
    'Cliente',
    'Micro Codice',
    'Titolo Micro-Attività',
    'Risorsa',
    'Stato',
    'Avanzamento %',
    'Priorità',
    'Data Inizio',
    'Data Scadenza',
    'Fornitori',
    'Note Recenti',
  ];

  const rows: string[][] = [];

  macroTasks.forEach(macro => {
    const clientName = clientMap.get(macro.clientId) || 'Globale';
    macro.microTasks.forEach(task => {
      const lastNote = task.notes && task.notes.length > 0
        ? task.notes[task.notes.length - 1].text.replace(/[\r\n]+/g, ' ')
        : (task.quickNote || '');
      
      const suppliersStr = (task.suppliers || []).join('; ');

      rows.push([
        `"${macro.code}"`,
        `"${macro.title.replace(/"/g, '""')}"`,
        `"${clientName.replace(/"/g, '""')}"`,
        `"${task.code}"`,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.resource === 'resource_1' ? 'Risorsa 1 (Ops/Comm)' : task.resource === 'resource_2' ? 'Risorsa 2 (Brand/Digital)' : 'Team ETRA'}"`,
        `"${task.status}"`,
        `${task.progress}`,
        `"${task.priority}"`,
        `"${task.startDate}"`,
        `"${task.dueDate}"`,
        `"${suppliersStr.replace(/"/g, '""')}"`,
        `"${lastNote.replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `etra_avanzamento_lavori_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportClientsToCsv(clients: Client[]): void {
  const headers = [
    'ID',
    'Nome Struttura',
    'Tipologia',
    'Località',
    'Regione',
    'Camere/Chiavi',
    'PMS Attuale',
    'Referente',
    'Email',
    'Telefono',
    'Retainer Mensile €',
    'Stato Contrattuale',
    'Servizi Attivi',
  ];

  const rows: string[][] = clients.map(client => {
    const servicesList = client.services.map(s => `${s.serviceName} (${s.status})`).join('; ');
    return [
      `"${client.id}"`,
      `"${client.name.replace(/"/g, '""')}"`,
      `"${client.type}"`,
      `"${client.location.replace(/"/g, '""')}"`,
      `"${client.region}"`,
      `${client.roomsCount}`,
      `"${client.currentPMS.replace(/"/g, '""')}"`,
      `"${client.contactPerson.replace(/"/g, '""')}"`,
      `"${client.email}"`,
      `"${client.phone}"`,
      `${client.monthlyRetainer}`,
      `"${client.status}"`,
      `"${servicesList.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `etra_anagrafica_clienti_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportPreventiveAuditToCsv(audit: import('../types').Preventive360Audit): void {
  const headers = [
    'Area Core',
    'Codice',
    'Parametro / Oggetto Analisi',
    'Note di Campo / Rilevazione',
    'Valore / Unità Misura',
    'Stato Valutazione',
    'Priorità',
    'Azione Correttiva ETRA',
  ];

  const rows: string[][] = [];

  audit.areas.forEach(area => {
    area.items.forEach(item => {
      rows.push([
        `"${area.name.replace(/"/g, '""')}"`,
        `"${item.code}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.noteDiCampo.replace(/"/g, '""')}"`,
        `"${item.unitOrValue.replace(/"/g, '""')}"`,
        `"${item.statusLabel.replace(/"/g, '""')}"`,
        `"${item.priority}"`,
        `"${item.strategicAction.replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `etra_audit_preventivo_${audit.hotelName.toLowerCase().replace(/\s+/g, '_')}_${audit.auditDate}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

import React, { useState } from 'react';
import { 
  Client, 
  ClientServiceAssignment, 
  ClientServiceStatus, 
  BoutiqueType,
  ContractMilestone,
  EtraServiceDefinition
} from '../types';
import { AVAILABLE_ETRA_SERVICES } from '../data/initialData';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Pencil,
  Trash2,
  X,
  FileCheck2,
  AlertTriangle,
  Settings2,
  RotateCcw
} from 'lucide-react';

interface ClientsServicesViewProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onUpdateClient: (updatedClient: Client) => void;
  onAddClient: (newClient: Client) => void;
  onDeleteClient: (clientId: string) => void;
  availableServices?: EtraServiceDefinition[];
  onUpdateAvailableServices?: (services: EtraServiceDefinition[]) => void;
}

export const ClientsServicesView: React.FC<ClientsServicesViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onUpdateClient,
  onAddClient,
  onDeleteClient,
  availableServices = AVAILABLE_ETRA_SERVICES,
  onUpdateAvailableServices,
}) => {
  // Currently displayed/edited client
  const [activeClient, setActiveClient] = useState<Client>(
    clients.find(c => c.id === selectedClientId) || clients[0] || {} as Client
  );

  // Modal for new client
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientType, setNewClientType] = useState<BoutiqueType>("Boutique Hotel");
  const [newClientLocation, setNewClientLocation] = useState('');
  const [newClientRooms, setNewClientRooms] = useState(16);
  const [newClientPMS, setNewClientPMS] = useState('Mews PMS');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Modal for editing client
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editClientForm, setEditClientForm] = useState<Partial<Client>>({});

  // Modal for deleting client
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Modal for customizing service catalog prices
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogList, setCatalogList] = useState<EtraServiceDefinition[]>(availableServices);
  const [editingCatalogService, setEditingCatalogService] = useState<EtraServiceDefinition | null>(null);

  // Modal to add milestone
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(new Date().toISOString().slice(0, 10));

  // Sync if selectedClientId changes from header
  React.useEffect(() => {
    if (selectedClientId !== 'all') {
      const found = clients.find(c => c.id === selectedClientId);
      if (found) setActiveClient(found);
    } else if (clients.length > 0 && (!activeClient.id || !clients.some(c => c.id === activeClient.id))) {
      setActiveClient(clients[0]);
    }
  }, [selectedClientId, clients]);

  // Handler to open edit client modal
  const handleOpenEditClient = () => {
    if (!activeClient.id) return;
    setEditClientForm({ ...activeClient });
    setShowEditClientModal(true);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClientForm.id) return;

    const updated: Client = {
      ...activeClient,
      ...editClientForm,
      name: editClientForm.name?.trim() || activeClient.name,
      roomsCount: Number(editClientForm.roomsCount) || activeClient.roomsCount,
      monthlyRetainer: Number(editClientForm.monthlyRetainer) || activeClient.monthlyRetainer,
    } as Client;

    setActiveClient(updated);
    onUpdateClient(updated);
    setShowEditClientModal(false);
  };

  const handleConfirmDeleteClient = () => {
    if (!activeClient.id) return;
    const toDeleteId = activeClient.id;
    setShowDeleteConfirmModal(false);
    onDeleteClient(toDeleteId);
  };

  // Handler to toggle / activate service
  const handleToggleService = (serviceDef: EtraServiceDefinition) => {
    const existingIndex = activeClient.services.findIndex(s => s.serviceId === serviceDef.id);
    let updatedServices: ClientServiceAssignment[];

    if (existingIndex >= 0) {
      // Remove service
      updatedServices = activeClient.services.filter(s => s.serviceId !== serviceDef.id);
    } else {
      // Add service
      const newAssignment: ClientServiceAssignment = {
        serviceId: serviceDef.id,
        serviceName: serviceDef.name,
        status: 'in_setup',
        monthlyFee: serviceDef.defaultMonthlyFee,
        startDate: new Date().toISOString().slice(0, 10),
        notes: `Attivato modulo ${serviceDef.name}.`,
      };
      updatedServices = [...activeClient.services, newAssignment];
    }

    // Recalculate monthly retainer
    const newMonthlyRetainer = updatedServices.reduce((acc, s) => acc + (s.monthlyFee || 0), 0);

    const updatedClient = {
      ...activeClient,
      services: updatedServices,
      monthlyRetainer: newMonthlyRetainer,
    };

    setActiveClient(updatedClient);
    onUpdateClient(updatedClient);
  };

  const handleUpdateServiceStatus = (serviceId: string, status: ClientServiceStatus) => {
    const updatedServices = activeClient.services.map(s => {
      if (s.serviceId === serviceId) {
        return { ...s, status };
      }
      return s;
    });

    const updatedClient = { ...activeClient, services: updatedServices };
    setActiveClient(updatedClient);
    onUpdateClient(updatedClient);
  };

  const handleUpdateServiceFee = (serviceId: string, fee: number) => {
    const updatedServices = activeClient.services.map(s => {
      if (s.serviceId === serviceId) {
        return { ...s, monthlyFee: fee };
      }
      return s;
    });

    const newRetainer = updatedServices.reduce((acc, s) => acc + (s.monthlyFee || 0), 0);
    const updatedClient = { ...activeClient, services: updatedServices, monthlyRetainer: newRetainer };
    setActiveClient(updatedClient);
    onUpdateClient(updatedClient);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = activeClient.contractMilestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });

    const updatedClient = { ...activeClient, contractMilestones: updatedMilestones };
    setActiveClient(updatedClient);
    onUpdateClient(updatedClient);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newEntry: ContractMilestone = {
      id: 'm_' + Date.now(),
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim(),
      date: newMilestoneDate,
      completed: false,
    };

    const updatedMilestones = [...activeClient.contractMilestones, newEntry];
    const updatedClient = { ...activeClient, contractMilestones: updatedMilestones };
    setActiveClient(updatedClient);
    onUpdateClient(updatedClient);
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setShowAddMilestoneModal(false);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: Client = {
      id: 'client_' + Date.now(),
      name: newClientName.trim(),
      type: newClientType,
      location: newClientLocation.trim() || 'Italia',
      region: 'Italia',
      roomsCount: Number(newClientRooms) || 12,
      currentPMS: newClientPMS.trim() || 'In Valutazione',
      contactPerson: newClientContact.trim() || 'Direzione Generale',
      role: 'General Manager',
      email: newClientEmail.trim() || 'info@boutique.it',
      phone: newClientPhone.trim() || '+39 000 000000',
      targetGuest: 'Luxury High-End International Travelers',
      joinedDate: new Date().toISOString().slice(0, 10),
      monthlyRetainer: 2800,
      status: 'attivo',
      services: [
        {
          serviceId: 'audit_360',
          serviceName: 'Audit Diagnostico 360°',
          status: 'in_setup',
          monthlyFee: 2800,
          startDate: new Date().toISOString().slice(0, 10),
          notes: 'Fase diagnostica iniziale su 4 pilastri ETRA.',
        },
      ],
      contractMilestones: [
        {
          id: 'm_init_' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          title: 'Apertura Fascicolo & Kickoff Audit ETRA',
          description: 'Inizio raccolta dati contabili e sopralluogo iniziale.',
          completed: false,
        },
      ],
      notes: newClientNotes.trim() || 'Struttura d’eccellenza integrata nel portfolio ETRA.',
    };

    onAddClient(newClient);
    setActiveClient(newClient);
    onSelectClient(newClient.id);
    setShowAddClientModal(false);
  };

  // Handlers for modifying service catalog prices
  const handleOpenCatalogModal = () => {
    setCatalogList(availableServices);
    setShowCatalogModal(true);
  };

  const handleSaveCatalogFee = (serviceId: string, newFee: number) => {
    const updated = catalogList.map(s => s.id === serviceId ? { ...s, defaultMonthlyFee: newFee } : s);
    setCatalogList(updated);
    if (onUpdateAvailableServices) onUpdateAvailableServices(updated);
  };

  const getStatusBadge = (status: ClientServiceStatus) => {
    switch (status) {
      case 'attivo': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'in_setup': return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
      case 'in_valutazione': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'concluso': return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#223049] bg-[#0E1523] p-4 lg:p-5">
        <div>
          <h1 className="font-serif text-xl lg:text-2xl font-medium text-neutral-100 flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-[#DFBA73]" />
            <span>CRM Strutture &amp; Abbinamento Servizi Boutique</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Anagrafica strutture ricettive, schede clienti completamente modificabili ed eliminabili, e listino servizi flessibile.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleOpenCatalogModal}
            className="flex items-center gap-1.5 rounded-xl border border-[#223049] bg-[#121B2C] px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-[#C5A059]/60 hover:text-[#DFBA73] transition-all"
            title="Personalizza i prezzi predefiniti dei servizi ETRA"
          >
            <Settings2 className="h-4 w-4" />
            <span>Listino Servizi</span>
          </button>

          <button
            onClick={() => setShowAddClientModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 shadow-sm hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nuova Struttura</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Client List Tabs (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              Strutture nel Portfolio ({clients.length})
            </span>
            <span className="text-[11px] text-[#DFBA73]">Gestione Operativa</span>
          </div>

          <div className="space-y-2.5">
            {clients.map(client => {
              const isSelected = activeClient.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => {
                    setActiveClient(client);
                    onSelectClient(client.id);
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all text-left group ${
                    isSelected
                      ? 'border-[#C5A059] bg-[#142033] shadow-md'
                      : 'border-[#223049] bg-[#0E1523] hover:border-[#354868] hover:bg-[#111A2A]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-[#DFBA73] uppercase tracking-wider block">
                        {client.type}
                      </span>
                      <h3 className={`text-sm font-semibold mt-0.5 ${isSelected ? 'text-[#DFBA73]' : 'text-neutral-100 group-hover:text-neutral-200'}`}>
                        {client.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-neutral-200 bg-[#1A263D] px-2 py-0.5 rounded border border-[#223049]">
                      €{client.monthlyRetainer?.toLocaleString('it-IT')}/m
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-neutral-400 border-t border-[#223049]/50 pt-2">
                    <span>{client.location}</span>
                    <span>{client.roomsCount} camere</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {client.services?.map(s => (
                      <span key={s.serviceId} className="text-[10px] bg-[#152136] text-neutral-300 px-2 py-0.5 rounded border border-[#223049]">
                        {s.serviceName}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {clients.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#223049] bg-[#0E1523]/50 p-6 text-center text-xs text-neutral-400 space-y-3">
                <p>Nessuna struttura presente nel database.</p>
                <button
                  onClick={() => setShowAddClientModal(true)}
                  className="rounded-lg bg-[#DFBA73] px-3 py-1.5 text-neutral-950 font-semibold"
                >
                  Aggiungi Prima Struttura
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Sheet & Service Matcher (8 Cols) */}
        {activeClient && activeClient.id ? (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Client Header Card with EDIT and DELETE actions */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#223049] pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#DFBA73]/10 border border-[#DFBA73]/30 px-2.5 py-0.5 text-xs font-semibold text-[#DFBA73]">
                      {activeClient.type}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-300">{activeClient.location}</span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                      activeClient.status === 'attivo' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {activeClient.status || 'attivo'}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-neutral-100 mt-2">
                    {activeClient.name}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                    {activeClient.notes}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="rounded-xl border border-[#C5A059]/40 bg-[#131D30] p-3 text-right">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Valore Retainer Mensile</span>
                    <span className="font-mono text-2xl font-bold text-[#DFBA73]">
                      €{activeClient.monthlyRetainer?.toLocaleString('it-IT')}
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Fatturazione ricorrente ETRA</span>
                  </div>

                  {/* ACTION BAR: MODIFICA SCHEDA & ELIMINA STRUTTURA */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenEditClient}
                      className="flex items-center gap-1.5 rounded-lg border border-[#C5A059]/50 bg-[#17243A] px-3 py-1.5 text-xs font-medium text-[#DFBA73] hover:bg-[#1E2E4A] hover:border-[#DFBA73] transition-all cursor-pointer shadow-sm"
                      title="Modifica tutti i dati e le informazioni di questa scheda cliente"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Modifica Scheda</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirmModal(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/40 hover:border-rose-400 transition-all cursor-pointer"
                      title="Elimina definitivamente questa struttura dal portfolio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Elimina</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Contact and Property Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="rounded-xl bg-[#121B2C] p-3 border border-[#223049]">
                  <span className="text-[10px] text-neutral-400 block">Referente &amp; Ruolo</span>
                  <span className="font-medium text-neutral-200 mt-0.5 block truncate">{activeClient.contactPerson}</span>
                  <span className="text-[11px] text-neutral-400 truncate block">{activeClient.role}</span>
                </div>

                <div className="rounded-xl bg-[#121B2C] p-3 border border-[#223049]">
                  <span className="text-[10px] text-neutral-400 block">Contatti Diretti</span>
                  <span className="font-medium text-neutral-200 mt-0.5 block truncate">{activeClient.email}</span>
                  <span className="text-[11px] text-neutral-400 truncate block">{activeClient.phone}</span>
                </div>

                <div className="rounded-xl bg-[#121B2C] p-3 border border-[#223049]">
                  <span className="text-[10px] text-neutral-400 block">Camere / Suite</span>
                  <span className="font-mono font-bold text-neutral-100 mt-0.5 block text-base">{activeClient.roomsCount} chiavi</span>
                  <span className="text-[10px] text-neutral-400 block">Struttura d’élite</span>
                </div>

                <div className="rounded-xl bg-[#121B2C] p-3 border border-[#223049]">
                  <span className="text-[10px] text-neutral-400 block">PMS Attuale</span>
                  <span className="font-medium text-[#DFBA73] mt-0.5 block truncate">{activeClient.currentPMS}</span>
                  <span className="text-[10px] text-neutral-400 block">Integrazioni attive</span>
                </div>
              </div>

            </div>

            {/* Service Matching Matrix */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-4">
              
              {/* 100% Audit Refund Clause Banner */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Clausola Ufficiale di Rimborso/Scomputo 100% dell&apos;Audit</span>
                </div>
                <p className="text-emerald-200/80 leading-relaxed">
                  Qualora il cliente decida di sottoscrivere il Contratto Continuativo (Retainer) entro 30 giorni dalla consegna dell&apos;Audit 360°, 
                  il <strong>100% dell&apos;importo dell&apos;Audit (€1.800 – €3.500)</strong> viene accreditato a scomputo dalle prime mensilità del contratto.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#223049] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#C5A059]" />
                    <span>Abbinamento Moduli &amp; Tiers Retainer ETRA</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Attiva i pacchetti standard del Manuale Operativo oppure configura i moduli su misura con prezzi personalizzati.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenCatalogModal}
                    className="text-xs text-[#DFBA73] hover:underline flex items-center gap-1"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Modifica Prezzi Listino</span>
                  </button>
                  <span className="text-xs text-neutral-400 font-mono">
                    {activeClient.services?.length || 0} su {availableServices.length} attivi
                  </span>
                </div>
              </div>

              {/* Service Cards */}
              <div className="space-y-3 pt-1">
                {availableServices.map(serviceDef => {
                  const activeAssignment = activeClient.services?.find(s => s.serviceId === serviceDef.id);
                  const isActivated = !!activeAssignment;

                  return (
                    <div
                      key={serviceDef.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isActivated 
                          ? 'border-[#C5A059]/50 bg-[#121D30]' 
                          : 'border-[#223049] bg-[#0C121E] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Checkbox button */}
                          <button
                            onClick={() => handleToggleService(serviceDef)}
                            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                              isActivated
                                ? 'border-[#DFBA73] bg-[#DFBA73] text-neutral-950 font-bold'
                                : 'border-neutral-600 bg-neutral-900 text-transparent hover:border-neutral-400'
                            }`}
                          >
                            ✓
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-neutral-100">
                                {serviceDef.name}
                              </span>
                              <span className="text-[10px] text-neutral-400 bg-[#162238] px-2 py-0.5 rounded border border-[#223049]">
                                {serviceDef.category}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                              {serviceDef.description}
                            </p>
                          </div>
                        </div>

                        {/* Right controls when active */}
                        {isActivated && (
                          <div className="flex items-center gap-3 self-end sm:self-center pl-8 sm:pl-0">
                            {/* Status select */}
                            <select
                              value={activeAssignment.status}
                              onChange={(e) => handleUpdateServiceStatus(serviceDef.id, e.target.value as ClientServiceStatus)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(activeAssignment.status)}`}
                            >
                              <option value="attivo">Attivo</option>
                              <option value="in_setup">In Setup</option>
                              <option value="in_valutazione">In Valutazione</option>
                              <option value="concluso">Concluso</option>
                            </select>

                            {/* Fee input */}
                            <div className="flex items-center gap-1 rounded-lg border border-[#223049] bg-[#141F33] px-2 py-1 text-xs">
                              <span className="text-neutral-400">€</span>
                              <input
                                type="number"
                                value={activeAssignment.monthlyFee}
                                onChange={(e) => handleUpdateServiceFee(serviceDef.id, Number(e.target.value))}
                                className="w-20 bg-transparent font-mono font-bold text-neutral-100 focus:outline-none text-right"
                                title="Prezzo canone mensile concordato con il cliente"
                              />
                              <span className="text-neutral-400">/m</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contract Milestones */}
            <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-[#C5A059]" />
                    <span>Storico Contrattuale &amp; Milestone Raggiunte</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Cronologia delle verifiche di SAL, presentazioni alla proprietà e rinnovi contrattuali.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddMilestoneModal(true)}
                  className="flex items-center gap-1 rounded-lg border border-[#223049] bg-[#141F33] px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-[#C5A059]/60 hover:text-[#DFBA73] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nuova Milestone</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {(!activeClient.contractMilestones || activeClient.contractMilestones.length === 0) ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    Nessuna milestone registrata per questa struttura.
                  </div>
                ) : (
                  activeClient.contractMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-3 rounded-xl border border-[#223049] bg-[#121B2C] p-3.5 text-xs hover:border-[#C5A059]/40 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleMilestone(milestone.id)}
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                          milestone.completed 
                            ? 'border-emerald-500 bg-emerald-500 text-white font-bold' 
                            : 'border-neutral-600 bg-neutral-900 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${milestone.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                            {milestone.title}
                          </span>
                          <span className="font-mono text-[11px] text-neutral-400">
                            {milestone.date}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-neutral-400 mt-1">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#223049] bg-[#0E1523]/50 p-12 text-center text-neutral-400">
            <Building2 className="h-10 w-10 text-[#C5A059]/40 mb-3" />
            <h3 className="font-serif text-lg text-neutral-200">Seleziona o Crea una Struttura</h3>
            <p className="text-xs text-neutral-400 max-w-sm mt-1">
              Scegli una scheda dal pannello laterale per visualizzare e personalizzare i dati contrattuali e i servizi abbinati.
            </p>
          </div>
        )}

      </div>

      {/* MODAL: MODIFICA SCHEDA CLIENTE */}
      {showEditClientModal && editClientForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl rounded-2xl border border-[#223049] bg-[#0E1523] text-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#223049] px-6 py-4 bg-[#111A2B]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182438] text-[#DFBA73] border border-[#C5A059]/30">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-100">
                    Modifica Scheda Struttura
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Aggiorna i dati anagrafici, operativi ed economici del cliente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditClientModal(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1A253A] hover:text-neutral-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditClient} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Nome Struttura</label>
                  <input
                    type="text"
                    required
                    value={editClientForm.name || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Tipologia Struttura</label>
                  <select
                    value={editClientForm.type || 'Boutique Hotel'}
                    onChange={(e) => setEditClientForm({ ...editClientForm, type: e.target.value as BoutiqueType })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Boutique Hotel">Boutique Hotel</option>
                    <option value="Residenza d'Epoca">Residenza d&apos;Epoca</option>
                    <option value="Relais di Charme">Relais di Charme</option>
                    <option value="Dimora Storica">Dimora Storica</option>
                    <option value="Luxury Resort">Luxury Resort</option>
                    <option value="Chalet di Pregio">Chalet di Pregio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Località</label>
                  <input
                    type="text"
                    required
                    value={editClientForm.location || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, location: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Numero Camere / Suite</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={editClientForm.roomsCount || 10}
                    onChange={(e) => setEditClientForm({ ...editClientForm, roomsCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 font-mono text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">PMS Gestionale Attuale</label>
                  <input
                    type="text"
                    value={editClientForm.currentPMS || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, currentPMS: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Referente / Proprietà</label>
                  <input
                    type="text"
                    value={editClientForm.contactPerson || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Ruolo Referente</label>
                  <input
                    type="text"
                    value={editClientForm.role || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, role: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Email Diretta</label>
                  <input
                    type="email"
                    value={editClientForm.email || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, email: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Telefono / WhatsApp</label>
                  <input
                    type="text"
                    value={editClientForm.phone || ''}
                    onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Stato Contratto</label>
                  <select
                    value={editClientForm.status || 'attivo'}
                    onChange={(e) => setEditClientForm({ ...editClientForm, status: e.target.value as any })}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="attivo">Attivo</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="in_trattativa">In Trattativa</option>
                    <option value="sospeso">Sospeso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Valore Canone Mensile Retainer Totale (€ / mese)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={editClientForm.monthlyRetainer || 0}
                  onChange={(e) => setEditClientForm({ ...editClientForm, monthlyRetainer: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 font-mono text-[#DFBA73] font-bold text-sm focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Note &amp; Strategia di Ingaggio</label>
                <textarea
                  rows={3}
                  value={editClientForm.notes || ''}
                  onChange={(e) => setEditClientForm({ ...editClientForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#223049] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#223049] bg-[#121B2C] text-neutral-300 hover:text-neutral-100 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-5 py-2 font-semibold text-neutral-950 shadow-md hover:brightness-110 cursor-pointer"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span>Salva Modifiche Scheda</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFERMA ELIMINAZIONE CLIENTE */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0E1523] p-6 text-neutral-100 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-100">
                  Elimina Scheda Struttura
                </h3>
                <p className="text-xs text-neutral-400">
                  Operazione irreversibile di cancellazione
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#141A28] p-3.5 rounded-xl border border-[#223049]">
              Sei sicuro di voler eliminare la scheda di <strong className="text-neutral-100">{activeClient.name}</strong> ({activeClient.roomsCount} camere, {activeClient.location})? 
              La struttura verrà rimossa dal CRM e dal selettore del portale.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-[#223049] bg-[#121B2C] text-xs font-medium text-neutral-300 hover:text-neutral-100"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClient}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-500 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Elimina Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PERSONALIZZAZIONE PREZZI LISTINO SERVIZI */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl rounded-2xl border border-[#223049] bg-[#0E1523] text-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#223049] px-6 py-4 bg-[#111A2B]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182438] text-[#DFBA73] border border-[#C5A059]/30">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-100">
                    Personalizza Listino Servizi ETRA
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Modifica i prezzi canone standard applicati di default quando associ un modulo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1A253A] hover:text-neutral-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                {catalogList.map(serv => (
                  <div key={serv.id} className="rounded-xl border border-[#223049] bg-[#121B2C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-neutral-100 flex items-center gap-2">
                        <span>{serv.name}</span>
                        <span className="text-[10px] text-neutral-400 bg-[#162238] px-2 py-0.5 rounded border border-[#223049]">
                          {serv.category}
                        </span>
                      </div>
                      <p className="text-neutral-400 mt-1 max-w-md">
                        {serv.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-neutral-400">Canone Default: €</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={serv.defaultMonthlyFee}
                        onChange={(e) => handleSaveCatalogFee(serv.id, Number(e.target.value))}
                        className="w-24 rounded-lg border border-[#223049] bg-[#142033] px-2.5 py-1.5 font-mono text-[#DFBA73] font-bold text-right focus:border-[#C5A059] focus:outline-none"
                      />
                      <span className="text-neutral-400">/m</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#223049] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCatalogList(AVAILABLE_ETRA_SERVICES);
                    if (onUpdateAvailableServices) onUpdateAvailableServices(AVAILABLE_ETRA_SERVICES);
                  }}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#DFBA73]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ripristina Listino Iniziale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="rounded-xl bg-[#DFBA73] px-5 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
                >
                  Chiudi &amp; Applica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-neutral-100">
                Registra Nuova Struttura Cliente
              </h3>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-neutral-400 hover:text-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Nome Struttura</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="es. Villa San Michele Dimora Storica..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Tipologia Struttura</label>
                  <select
                    value={newClientType}
                    onChange={(e) => setNewClientType(e.target.value as BoutiqueType)}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Boutique Hotel">Boutique Hotel</option>
                    <option value="Residenza d'Epoca">Residenza d&apos;Epoca</option>
                    <option value="Relais di Charme">Relais di Charme</option>
                    <option value="Dimora Storica">Dimora Storica</option>
                    <option value="Luxury Resort">Luxury Resort</option>
                    <option value="Chalet di Pregio">Chalet di Pregio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Località</label>
                  <input
                    type="text"
                    required
                    value={newClientLocation}
                    onChange={(e) => setNewClientLocation(e.target.value)}
                    placeholder="es. Ravello, Costiera Amalfitana"
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Numero Camere / Suite</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    required
                    value={newClientRooms}
                    onChange={(e) => setNewClientRooms(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">PMS Attuale</label>
                  <input
                    type="text"
                    value={newClientPMS}
                    onChange={(e) => setNewClientPMS(e.target.value)}
                    placeholder="es. Mews / Cloudbeds / Legacy"
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Referente / Proprietà</label>
                  <input
                    type="text"
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    placeholder="Nome e cognome"
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="email@struttura.it"
                    className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Telefono</label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+39 000 0000000"
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Note &amp; Target Struttura</label>
                <textarea
                  rows={2}
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Caratteristiche peculiari, obiettivi di revpar, particolarità storiche..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="rounded-xl bg-[#182438] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-[#202E47]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110 cursor-pointer"
                >
                  Salva Nuova Struttura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Milestone */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl">
            <h3 className="text-base font-semibold text-neutral-100 mb-3">
              Aggiungi Milestone Contrattuale
            </h3>
            <form onSubmit={handleAddMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Titolo Milestone</label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="es. Approvazione Piano Tariffario Q2..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Data Scadenza / Raggiungimento</label>
                <input
                  type="date"
                  required
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Descrizione / Obiettivo</label>
                <textarea
                  rows={2}
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  placeholder="Dettaglio accordo o delibera..."
                  className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-2.5 text-xs text-neutral-100 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="rounded-xl bg-[#182438] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-[#202E47]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110 cursor-pointer"
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

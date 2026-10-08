import React, { useState } from 'react';
import { 
  Client, 
  ClientServiceAssignment, 
  ClientServiceStatus, 
  BoutiqueType,
  ContractMilestone 
} from '../types';
import { AVAILABLE_ETRA_SERVICES } from '../data/initialData';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Euro, 
  Calendar, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Trash2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ClientsServicesViewProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  onUpdateClient: (updatedClient: Client) => void;
  onAddClient: (newClient: Client) => void;
}

export const ClientsServicesView: React.FC<ClientsServicesViewProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  onUpdateClient,
  onAddClient,
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
    }
  }, [selectedClientId, clients]);

  // Handler to toggle / activate service
  const handleToggleService = (serviceDef: typeof AVAILABLE_ETRA_SERVICES[0]) => {
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
            <span>CRM & Abbinamento Servizi Boutique</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Anagrafica strutture ricettive d’élite, abbinamento flessibile dei servizi ETRA e storico contrattuale.
          </p>
        </div>

        <button
          onClick={() => setShowAddClientModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 shadow-sm hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nuova Struttura Cliente</span>
        </button>
      </div>

      {/* Main Grid: Client Selector List on Left (4 cols), Client Details & Service Matcher on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Client List Tabs (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase px-1">
            Strutture nel Portfolio ({clients.length})
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
                      €{client.monthlyRetainer.toLocaleString('it-IT')}/m
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-neutral-400 border-t border-[#223049]/50 pt-2">
                    <span>{client.location}</span>
                    <span>{client.roomsCount} camere</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {client.services.map(s => (
                      <span key={s.serviceId} className="text-[10px] bg-[#152136] text-neutral-300 px-2 py-0.5 rounded border border-[#223049]">
                        {s.serviceName}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Sheet & Service Matcher (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Client Header Card */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#223049] pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#DFBA73]/10 border border-[#DFBA73]/30 px-2.5 py-0.5 text-xs font-semibold text-[#DFBA73]">
                    {activeClient.type}
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs text-neutral-300">{activeClient.location}</span>
                </div>
                <h2 className="font-serif text-2xl font-medium text-neutral-100 mt-1">
                  {activeClient.name}
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                  {activeClient.notes}
                </p>
              </div>

              <div className="rounded-xl border border-[#C5A059]/40 bg-[#131D30] p-3 text-right shrink-0">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Valore Retainer Mensile</span>
                <span className="font-mono text-2xl font-bold text-[#DFBA73]">
                  €{activeClient.monthlyRetainer?.toLocaleString('it-IT')}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Fatturazione ricorrente ETRA</span>
              </div>
            </div>

            {/* Quick Contact and Property Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="rounded-xl bg-[#121B2C] p-3 border border-[#223049]">
                <span className="text-[10px] text-neutral-400 block">Referente & Ruolo</span>
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
                  Attiva i pacchetti standard del Manuale Operativo oppure configura i moduli su misura.
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {activeClient.services.length} su {AVAILABLE_ETRA_SERVICES.length} attivi
              </span>
            </div>

            {/* Quick Tier Assignment Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                Applica Preset di Ingaggio Ufficiale:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const essential = AVAILABLE_ETRA_SERVICES.find(s => s.id === 'retainer_essential');
                    if (essential) handleToggleService(essential);
                  }}
                  className="rounded-lg border border-[#223049] bg-[#121B2C] p-2.5 text-left hover:border-[#C5A059] transition-all"
                >
                  <div className="text-[11px] font-semibold text-neutral-200">Essential Boutique</div>
                  <div className="text-[10px] text-[#DFBA73] font-mono">€1.500 – €2.500/m</div>
                </button>

                <button
                  onClick={() => {
                    const full = AVAILABLE_ETRA_SERVICES.find(s => s.id === 'retainer_full_growth');
                    if (full) handleToggleService(full);
                  }}
                  className="rounded-lg border border-[#C5A059]/60 bg-[#162338] p-2.5 text-left hover:brightness-110 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#DFBA73]">Full Growth</span>
                    <span className="text-[9px] bg-[#DFBA73]/20 text-[#DFBA73] px-1 rounded">Consigliato</span>
                  </div>
                  <div className="text-[10px] text-neutral-200 font-mono">€3.000 – €5.000/m</div>
                </button>

                <button
                  onClick={() => {
                    const exec = AVAILABLE_ETRA_SERVICES.find(s => s.id === 'retainer_executive_gc');
                    if (exec) handleToggleService(exec);
                  }}
                  className="rounded-lg border border-[#223049] bg-[#121B2C] p-2.5 text-left hover:border-[#C5A059] transition-all"
                >
                  <div className="text-[11px] font-semibold text-neutral-200">Executive GC</div>
                  <div className="text-[10px] text-[#DFBA73] font-mono">€5.500 – €9.000/m</div>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              {AVAILABLE_ETRA_SERVICES.map(serviceDef => {
                const activeAssignment = activeClient.services.find(s => s.serviceId === serviceDef.id);
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
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
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
                              className="w-16 bg-transparent font-mono font-bold text-neutral-100 focus:outline-none text-right"
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

          {/* Contract Milestones & Commercial Timeline */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[#C5A059]" />
                  <span>Storico Contrattuale & Milestone Raggiunte</span>
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
              {activeClient.contractMilestones?.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  Nessuna milestone registrata per questa struttura.
                </div>
              ) : (
                activeClient.contractMilestones?.map((milestone) => (
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
                      title={milestone.completed ? 'Segna come da completare' : 'Segna come completata'}
                    >
                      ✓
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold ${milestone.completed ? 'text-neutral-400 line-through' : 'text-neutral-100'}`}>
                          {milestone.title}
                        </span>
                        <span className="font-mono text-[11px] text-[#DFBA73] shrink-0">
                          {milestone.date}
                        </span>
                      </div>
                      <p className="text-neutral-400 mt-1 text-[11px]">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Add New Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-[#223049] bg-[#0E1523] p-6 text-neutral-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-neutral-100 mb-1">
              Nuova Struttura nel Portfolio ETRA
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Inserisci i dati anagrafici e dimensionali del boutique hotel o residenza d’epoca.
            </p>
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
                <label className="block text-neutral-300 font-medium mb-1">Note & Target Struttura</label>
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
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
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
                  className="rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 hover:brightness-110"
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

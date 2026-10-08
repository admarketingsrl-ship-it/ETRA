export type ResourceId = 'resource_1' | 'resource_2' | 'both';

export interface ResourceInfo {
  id: ResourceId;
  name: string;
  role: string;
  shortLabel: string;
  avatarColor: string;
}

export type TaskStatus = 'non_avviato' | 'in_corso' | 'in_attesa' | 'completato';
export type TaskPriority = 'alta' | 'media' | 'bassa';

export interface WorkNote {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface SupplierLink {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export interface MicroTask {
  id: string;
  officialId?: number; // 1-18 from official CSV
  macroTaskId: string;
  clientId: string;
  code: string; // e.g. "1.1", "1.2"
  rif?: string; // from CSV e.g. "1, 2", "1, 1", "1, 3", "3, 1"
  phase?: number; // 1, 2, 3, 4, 5
  title: string;
  description: string;
  resource: ResourceId;
  dependsOn?: string; // e.g. "-", "1", "8, 9"
  durationDays?: number; // e.g. 2, 3, 8
  status: TaskStatus;
  progress: number; // 0 - 100
  priority: TaskPriority;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  notes: WorkNote[];
  quickNote?: string;
  suppliers: string[];
  links: SupplierLink[];
}

export interface MacroTask {
  id: string;
  clientId: string;
  code: string; // e.g. "M1", "M2", "FASE 1", "FASE 3"
  phase?: number;
  title: string;
  category: string;
  description: string;
  microTasks: MicroTask[];
}

export type RetainerTierId = 'essential' | 'full_growth' | 'executive_gc' | 'custom';

export interface RetainerTier {
  id: RetainerTierId;
  name: string;
  priceRange: string;
  minFee: number;
  maxFee: number;
  isRecommended?: boolean;
  coverage: string[];
}

export type ClientServiceStatus = 'attivo' | 'in_setup' | 'concluso' | 'in_valutazione';

export interface ClientServiceAssignment {
  serviceId: string;
  serviceName: string;
  status: ClientServiceStatus;
  monthlyFee: number;
  startDate: string;
  notes?: string;
}

export interface ContractMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  completed: boolean;
}

export type BoutiqueType = 
  | 'Boutique Hotel'
  | "Residenza d'Epoca"
  | 'Relais di Charme'
  | 'Dimora Storica'
  | 'Luxury Resort'
  | 'Chalet di Pregio';

export interface Client {
  id: string;
  name: string;
  type: BoutiqueType;
  location: string;
  region: string;
  roomsCount: number;
  currentPMS: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  targetGuest: string;
  joinedDate: string;
  monthlyRetainer: number;
  status: 'attivo' | 'onboarding' | 'in_trattativa' | 'sospeso';
  services: ClientServiceAssignment[];
  contractMilestones: ContractMilestone[];
  notes: string;
}

export type AuditComplianceStatus = 'conforme' | 'parziale' | 'critico' | 'na' | 'non_valutato';
export type AuditPriority = 'immediata' | 'media' | 'strategica' | 'nessuna';

export interface AuditChecklistItem {
  id: string;
  code: string;
  title: string;
  description: string;
  standardEtra: string; // Il gold standard raccomandato da ETRA
  status: AuditComplianceStatus;
  evidenceNotes: string;
  priorityAction: AuditPriority;
  actionRecommendation: string;
}

export type AuditAreaId = 'economics' | 'technology' | 'compliance' | 'brand';

export interface AuditArea {
  id: AuditAreaId;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  weight: number;
  items: AuditChecklistItem[];
}

export interface ClientAuditData {
  clientId: string;
  lastUpdated: string;
  auditorName: string;
  areas: AuditArea[];
  executiveNotes?: string;
}

export type FieldAuditEvaluationState = 
  | 'conforme' // 'Conforme / Concluso' or 'Presente / Adeguato'
  | 'da_migliorare' // 'Da Migliorare'
  | 'non_conforme'; // 'Non Conforme / Mancante'

export type FieldAuditPriority = 'bassa' | 'media' | 'alta' | 'critica';

export interface FieldAuditItem {
  id: string;
  code: string; // e.g. "ECO-01"
  name: string; // "Periodo Dati Storici Contabili Analizzati"
  noteDiCampo: string; // "Ultimi 3 anni contabili completi"
  unitOrValue: string; // "Anni: 3"
  status: FieldAuditEvaluationState;
  statusLabel: string; // "Conforme / Concluso", "Presente / Adeguato", "Da Migliorare", "Non Conforme / Mancante"
  priority: FieldAuditPriority;
  strategicAction: string; // "Verifica Trend Storico"
}

export type FieldAuditCoreAreaId = 
  | 'economica' 
  | 'brand' 
  | 'technology' 
  | 'interior' 
  | 'capitale_umano';

export interface FieldAuditCoreArea {
  id: FieldAuditCoreAreaId;
  order: number;
  name: string; // "1. Area Economica e Finanziaria (Logic)"
  shortName: string; // "1. Area Economica"
  category: 'logic' | 'vision';
  focusStrategico: string; // "KPI, GOP/RevPAR, Costi Fissi/Variabili, BI & Business Plan"
  items: FieldAuditItem[];
}

export interface KpiSimulationItem {
  id: string;
  name: string; // "RevPAR (Revenue Per Available Room)"
  area: string; // "Economica (Logic)"
  currentValue: number;
  currentValueFormatted: string; // "€ 115,00"
  targetValue: number;
  targetValueFormatted: string; // "€ 165,00"
  unit: string; // "€" or "%" or "points"
  deltaFormatted: string; // "+43,5%"
  deltaNumeric: number; // percentage or absolute delta
  benchmarkRange: string; // "€ 150 - € 200"
  expectedImpact: string; // "Aumento redditività per camera"
  formula: string; // "Fatturato Camere Totale / Camere Disponibili Totali"
  metodologia: string; // "Estrazione diretta da PMS / RMS Cloud"
  azioneCorrettiva: string; // "Implementazione algoritmi di Dynamic Pricing e RMS AI"
}

export interface Preventive360Audit {
  id: string;
  hotelName: string; // "Hotel Boutique Fasano"
  hotelType: string; // "Boutique Hotel (Luxury / Historic)"
  auditDate: string; // "2026-09-24"
  auditorName: string; // "Team ETRA Solutions"
  areas: FieldAuditCoreArea[];
  kpis: KpiSimulationItem[];
  executiveNotes?: string;
}

export interface ETRAAppState {
  clients: Client[];
  macroTasks: MacroTask[];
  audits: Record<string, ClientAuditData>;
  preventiveAudits?: Record<string, Preventive360Audit>;
  selectedPreventiveAuditId?: string;
  selectedClientId: string; // 'all' or specific client id
  theme: 'dark' | 'light';
}

import React, { useState } from 'react';
import { OFFICIAL_RETAINER_TIERS, SUCCESS_FEE_CONFIG, AUDIT_EXECUTION_PROTOCOL } from '../data/initialData';
import { 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Euro, 
  Check, 
  FileText, 
  ArrowRight,
  HelpCircle,
  Gem
} from 'lucide-react';

export const PricingManualView: React.FC = () => {
  // Interactive Simulator States
  // Bandi
  const [bandoAmount, setBandoAmount] = useState<number>(150000);
  const [bandoSuccessFeePercent, setBandoSuccessFeePercent] = useState<number>(8);
  const [bandoOpeningFee, setBandoOpeningFee] = useState<number>(1000);

  // Disintermediazione
  const [roomRevenue, setRoomRevenue] = useState<number>(450000);
  const [currentOtaPercent, setCurrentOtaPercent] = useState<number>(68);
  const [targetOtaPercent, setTargetOtaPercent] = useState<number>(35);
  const [etraSuccessFeePercent, setEtraSuccessFeePercent] = useState<number>(6);
  const [avgOtaCommission, setAvgOtaCommission] = useState<number>(20);

  // Calcoli simulatori
  const bandoEstimatedSuccessFee = Math.round((bandoAmount * bandoSuccessFeePercent) / 100);
  const bandoTotalRevenueEtra = bandoOpeningFee + bandoEstimatedSuccessFee;

  const currentOtaRevenue = (roomRevenue * currentOtaPercent) / 100;
  const targetOtaRevenue = (roomRevenue * targetOtaPercent) / 100;
  const disintermediatedAmount = Math.max(0, currentOtaRevenue - targetOtaRevenue);
  const otaCommissionsSaved = Math.round((disintermediatedAmount * avgOtaCommission) / 100);
  const etraDisintermediationFee = Math.round((disintermediatedAmount * etraSuccessFeePercent) / 100);
  const hotelNetBenefit = otaCommissionsSaved - etraDisintermediationFee;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#223049] bg-gradient-to-r from-[#0C1322] via-[#101A2E] to-[#0A0E17] p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#DFBA73] uppercase mb-2">
              <BookOpen className="h-4 w-4" />
              <span>Documento Operativo Ufficiale · Versione 1.0</span>
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl font-medium tracking-wide text-neutral-100">
              Manuale Operativo: Modello di Ingaggio & Pricing Strategy
            </h1>
            <p className="mt-1 text-xs lg:text-sm text-neutral-400 max-w-3xl leading-relaxed">
              Linee guida per l&apos;acquisizione, la contrattualizzazione e la monetizzazione dei servizi consulenziali ETRA. Il modello si fonda sul principio della <strong>&quot;Logic &amp; Vision&quot;</strong>, combinando rigore analitico ed estetica.
            </p>
          </div>

          <div className="rounded-xl border border-[#C5A059]/40 bg-[#142033] p-4 text-right shrink-0">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Target Interno</span>
            <span className="font-serif font-bold text-neutral-100 text-sm block">Management &amp; Advisory Board</span>
            <span className="text-[11px] text-[#DFBA73] block mt-0.5">3 Pilastri Progressivi</span>
          </div>
        </div>
      </div>

      {/* 1. I TRE PILASTRI PROGRESSIVI */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          1. Architettura del Modello di Ingaggio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Pilastro 1 */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-3 hover:border-[#C5A059]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#DFBA73] bg-[#162238] px-2 py-0.5 rounded border border-[#223049]">
                Fase 1
              </span>
              <span className="text-xs text-neutral-400">Ingresso &amp; Valutazione</span>
            </div>
            <h3 className="text-base font-semibold text-neutral-100">
              Audit Diagnostico 360°
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cavallo di troia commerciale: analisi peritale prima della cura su Economics, Tech, Compliance e Brand.
            </p>
            <div className="border-t border-[#223049]/60 pt-3">
              <div className="text-[11px] text-[#DFBA73] font-medium">
                Listino: €1.800 – €3.500
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">
                ↳ 100% rimborsabile se convertito in Retainer entro 30gg!
              </div>
            </div>
          </div>

          {/* Pilastro 2 */}
          <div className="rounded-2xl border border-[#C5A059]/50 bg-[#121B2C] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#DFBA73] bg-[#1A263D] px-2 py-0.5 rounded border border-[#C5A059]/30">
                Fase 2
              </span>
              <span className="text-xs text-neutral-400">Gestione Continuativa</span>
            </div>
            <h3 className="text-base font-semibold text-neutral-100">
              General Contractor della Crescita
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Contratto continuativo (Retainer 12 mesi) a regia unica: finanza, tecnologia, marketing, legal e interior design.
            </p>
            <div className="border-t border-[#223049]/60 pt-3">
              <div className="text-[11px] text-[#DFBA73] font-medium">
                3 Livelli di Servizio (Tiers)
              </div>
              <div className="text-[10px] text-neutral-300 mt-0.5">
                Da €1.500 a €9.000 / mese con addebito SDD anticipato.
              </div>
            </div>
          </div>

          {/* Pilastro 3 */}
          <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-3 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-400 bg-[#142035] px-2 py-0.5 rounded border border-[#223049]">
                Fase 3
              </span>
              <span className="text-xs text-neutral-400">Allineamento Interessi</span>
            </div>
            <h3 className="text-base font-semibold text-neutral-100">
              Pricing Orientato ai Risultati
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Condivisione del rischio d&apos;impresa applicando success fee eque sui risultati concreti e misurabili.
            </p>
            <div className="border-t border-[#223049]/60 pt-3">
              <div className="text-[11px] text-blue-400 font-medium">
                Due Direttrici Ibride
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                5%–12% Bandi/FRI-Tur e 5%–8% disintermediazione oltre baseline.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. I TRE PACCHETTI RETAINER UFFICIALI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              2. Struttura dell&apos;Offerta Retainer (Canone Mensile 12 Mesi)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Posizionamento come General Contractor della Crescita con regia unica.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFICIAL_RETAINER_TIERS.map(tier => (
            <div
              key={tier.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                tier.isRecommended
                  ? 'border-[#C5A059] bg-[#121B2C] shadow-lg shadow-[#C5A059]/5'
                  : 'border-[#223049] bg-[#0E1523]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                    Livello Servizio
                  </span>
                  {tier.isRecommended && (
                    <span className="flex items-center gap-1 rounded-full bg-[#DFBA73]/15 border border-[#DFBA73]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#DFBA73]">
                      <Sparkles className="h-3 w-3" />
                      <span>Consigliato</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-100">
                    {tier.name}
                  </h3>
                  <div className="font-mono text-2xl font-bold text-[#DFBA73] mt-2">
                    {tier.priceRange}
                  </div>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">Impegno contrattuale minimo 12 mesi</span>
                </div>

                <div className="border-t border-[#223049]/60 pt-4 space-y-2.5">
                  <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase block">
                    Ambito di Copertura Incluso:
                  </span>
                  {tier.coverage.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="h-4 w-4 text-[#DFBA73] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#223049]/60">
                <div className="text-[10px] text-neutral-400 text-center">
                  Fatturazione anticipata entro il 5 del mese via SDD
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SIMULATORE SUCCESS FEE (ROI & BENEFIT SIMULATOR) */}
      <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 lg:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#DFBA73] uppercase mb-1">
            <Calculator className="h-4 w-4" />
            <span>Simulatore Interattivo Success Fee &amp; Risparmio Hotel</span>
          </div>
          <h2 className="font-serif text-xl font-semibold text-neutral-100">
            Allineamento Interessi: Calcolo ROI per Finanza Agevolata &amp; Disintermediazione
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Verifica il beneficio economico per la struttura e la marginalità per ETRA applicando le clausole ibride.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-[#223049] pt-6">
          
          {/* Direttrice 1: Finanza Agevolata e Bandi */}
          <div className="rounded-xl border border-[#223049] bg-[#111A2B] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#223049] pb-3">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Euro className="h-4 w-4 text-[#DFBA73]" />
                <span>Direttrice 1: Finanza Agevolata &amp; Bandi</span>
              </h3>
              <span className="text-[11px] text-[#DFBA73] font-mono">Fondi FRI-Tur / PNRR</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1">Importo Contributo Ottenuto (€):</label>
                <input
                  type="number"
                  step="10000"
                  value={bandoAmount}
                  onChange={(e) => setBandoAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Fee Apertura Pratica:</label>
                  <select
                    value={bandoOpeningFee}
                    onChange={(e) => setBandoOpeningFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 text-neutral-200 focus:outline-none"
                  >
                    <option value={800}>€ 800 (Base)</option>
                    <option value={1000}>€ 1.000 (Standard)</option>
                    <option value={1500}>€ 1.500 (Complessa)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Success Fee (% sui fondi):</label>
                  <select
                    value={bandoSuccessFeePercent}
                    onChange={(e) => setBandoSuccessFeePercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 text-neutral-200 focus:outline-none"
                  >
                    <option value={5}>5% (Minimo)</option>
                    <option value={8}>8% (Standard)</option>
                    <option value={10}>10% (A fondo perduto)</option>
                    <option value={12}>12% (Massimo)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="rounded-xl bg-[#0E1523] border border-[#223049] p-4 text-xs space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Fee tecnica anticipata:</span>
                <span className="font-mono text-neutral-200">€{bandoOpeningFee.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Success Fee a graduatoria approvata ({bandoSuccessFeePercent}%):</span>
                <span className="font-mono text-[#DFBA73] font-bold">€{bandoEstimatedSuccessFee.toLocaleString('it-IT')}</span>
              </div>
              <div className="border-t border-[#223049]/60 pt-2 flex justify-between font-semibold text-neutral-100">
                <span>Totale Ricavo ETRA sulla Pratica:</span>
                <span className="font-mono text-emerald-400">€{bandoTotalRevenueEtra.toLocaleString('it-IT')}</span>
              </div>
            </div>
          </div>

          {/* Direttrice 2: Disintermediazione e Prenotazioni Dirette */}
          <div className="rounded-xl border border-[#223049] bg-[#111A2B] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#223049] pb-3">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Direttrice 2: Disintermediazione OTA</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono">Commissioni Risparmiate</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1">Fatturato Camere Annuo (€):</label>
                  <input
                    type="number"
                    step="25000"
                    value={roomRevenue}
                    onChange={(e) => setRoomRevenue(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Commissione Media OTA (%):</label>
                  <input
                    type="number"
                    value={avgOtaCommission}
                    onChange={(e) => setAvgOtaCommission(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 block mb-1">OTA Iniziale (%):</label>
                  <input
                    type="number"
                    value={currentOtaPercent}
                    onChange={(e) => setCurrentOtaPercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Target Diretto (%):</label>
                  <input
                    type="number"
                    value={targetOtaPercent}
                    onChange={(e) => setTargetOtaPercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-200"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Fee ETRA (%):</label>
                  <select
                    value={etraSuccessFeePercent}
                    onChange={(e) => setEtraSuccessFeePercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 text-neutral-200"
                  >
                    <option value={5}>5%</option>
                    <option value={6}>6%</option>
                    <option value={7}>7%</option>
                    <option value={8}>8%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="rounded-xl bg-[#0E1523] border border-[#223049] p-4 text-xs space-y-2">
              <div className="flex justify-between text-neutral-400">
                <span>Fatturato disintermediato:</span>
                <span className="font-mono text-neutral-200">€{disintermediatedAmount.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Commissioni OTA non pagate all&apos;intermediario:</span>
                <span className="font-mono text-emerald-400 font-bold">€{otaCommissionsSaved.toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Success Fee ETRA ({etraSuccessFeePercent}%):</span>
                <span className="font-mono text-[#DFBA73]">€{etraDisintermediationFee.toLocaleString('it-IT')}</span>
              </div>
              <div className="border-t border-[#223049]/60 pt-2 flex justify-between font-semibold text-neutral-100">
                <span>Risparmio Netto per l&apos;Hotel:</span>
                <span className="font-mono text-emerald-400 text-sm">€{hotelNetBenefit.toLocaleString('it-IT')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. PROTOCOLLO ESECUZIONE AUDIT 360° IN 4 SETTIMANE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            3. Protocollo Esecutivo Audit Diagnostico 360° (4 Settimane)
          </h2>
          <span className="text-[11px] text-[#DFBA73]">
            Clausola Rimborso 100% su Retainer attiva
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUDIT_EXECUTION_PROTOCOL.map((step, idx) => (
            <div 
              key={idx}
              className="rounded-2xl border border-[#223049] bg-[#0E1523] p-5 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#DFBA73] bg-[#162238] px-2.5 py-0.5 rounded border border-[#223049]">
                  {step.week}
                </span>
                <span className="text-[10px] text-neutral-400">Fase {idx + 1}</span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 pt-1">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {step.tasks}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PROCEDURA CONTRACT-TO-CASH */}
      <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 space-y-4">
        <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          4. Procedura Contract-To-Cash (Dalla Trattativa all&apos;Incasso)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-[#111A2B] p-4 border border-[#223049] space-y-2">
            <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
              <span className="font-mono text-[#DFBA73]">1.</span>
              <span>Proposta Commerciale Audit</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Firma della lettera d&apos;incarico per l&apos;Audit Diagnostico 360°. Incasso del 100% dell&apos;importo alla firma dell&apos;incarico.
            </p>
          </div>

          <div className="rounded-xl bg-[#111A2B] p-4 border border-[#223049] space-y-2">
            <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
              <span className="font-mono text-[#DFBA73]">2.</span>
              <span>Presentazione Report &amp; Retainer</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Consegna formale del Dossier Diagnostico e firma del Contratto Continuativo 12 mesi con applicazione dello sconto valore Audit sulle prime mensilità.
            </p>
          </div>

          <div className="rounded-xl bg-[#111A2B] p-4 border border-[#223049] space-y-2">
            <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
              <span className="font-mono text-[#DFBA73]">3.</span>
              <span>Fatturazione &amp; Incassi Ricorrenti</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Canone Retainer fatturato anticipatamente con addebito diretto SDD/RID bancario entro il 5 del mese; rendicontazione trimestrale success fee da PMS.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

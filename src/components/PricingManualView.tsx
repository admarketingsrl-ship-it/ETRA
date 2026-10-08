import React, { useState } from 'react';
import { OFFICIAL_RETAINER_TIERS, AUDIT_EXECUTION_PROTOCOL } from '../data/initialData';
import { RetainerTier } from '../types';
import { 
  BookOpen, 
  Sparkles, 
  Calculator, 
  Euro, 
  Check, 
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  FileCheck2
} from 'lucide-react';

interface PricingManualViewProps {
  retainerTiers?: RetainerTier[];
  onUpdateRetainerTiers?: (updatedTiers: RetainerTier[]) => void;
  onResetRetainerTiers?: () => void;
}

export const PricingManualView: React.FC<PricingManualViewProps> = ({
  retainerTiers = OFFICIAL_RETAINER_TIERS,
  onUpdateRetainerTiers,
  onResetRetainerTiers,
}) => {
  // Editing state for tiers
  const [editingTier, setEditingTier] = useState<RetainerTier | null>(null);
  const [isNewTier, setIsNewTier] = useState(false);
  const [coverageInput, setCoverageInput] = useState('');

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

  // Handlers for Tier Editing
  const handleOpenEditTier = (tier: RetainerTier) => {
    setEditingTier({ ...tier, coverage: [...tier.coverage] });
    setCoverageInput(tier.coverage.join('\n'));
    setIsNewTier(false);
  };

  const handleOpenNewTier = () => {
    const newTier: RetainerTier = {
      id: `custom_${Date.now()}` as any,
      name: 'NUOVO PACCHETTO RETAINER',
      priceRange: '€ 2.000 – € 4.000 / mese',
      minFee: 2000,
      maxFee: 4000,
      isRecommended: false,
      coverage: [
        'Consulenza specialistica dedicata',
        'Analisi delle performance periodica',
        'Supervisione strategica',
      ],
    };
    setEditingTier(newTier);
    setCoverageInput(newTier.coverage.join('\n'));
    setIsNewTier(true);
  };

  const handleSaveTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier || !onUpdateRetainerTiers) return;

    const parsedCoverage = coverageInput
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const finalizedTier: RetainerTier = {
      ...editingTier,
      coverage: parsedCoverage.length > 0 ? parsedCoverage : ['Servizi su misura definiti con la proprietà'],
    };

    let updatedList: RetainerTier[];
    if (isNewTier) {
      updatedList = [...retainerTiers, finalizedTier];
    } else {
      updatedList = retainerTiers.map(t => t.id === finalizedTier.id ? finalizedTier : t);
    }

    onUpdateRetainerTiers(updatedList);
    setEditingTier(null);
  };

  const handleDeleteTier = (tierId: string) => {
    if (!onUpdateRetainerTiers) return;
    if (window.confirm('Sei sicuro di voler rimuovere questo pacchetto dal listino?')) {
      const updatedList = retainerTiers.filter(t => t.id !== tierId);
      onUpdateRetainerTiers(updatedList);
      if (editingTier?.id === tierId) setEditingTier(null);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Vuoi ripristinare i pacchetti e i prezzi ufficiali del Manuale ETRA?')) {
      if (onResetRetainerTiers) {
        onResetRetainerTiers();
      } else if (onUpdateRetainerTiers) {
        onUpdateRetainerTiers(OFFICIAL_RETAINER_TIERS);
      }
      setEditingTier(null);
    }
  };

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
              Manuale Operativo: Modello di Ingaggio &amp; Pricing Strategy
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
                {retainerTiers.length} Livelli di Servizio Configurati
              </div>
              <div className="text-[10px] text-neutral-300 mt-0.5">
                Tariffe operative personalizzabili direttamente dal portale.
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

      {/* 2. I PACCHETTI RETAINER (MODIFICABILI ED EDITABILI OPERATIVAMENTE) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#223049] pb-4">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
              <span>2. Struttura dell&apos;Offerta Retainer &amp; Listino Pacchetti</span>
              <span className="text-[10px] text-[#DFBA73] bg-[#142033] px-2 py-0.5 rounded border border-[#223049]">
                Prezzi Modificabili Direttamente
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tutti i prezzi, le descrizioni e i servizi inclusi sono personalizzabili in tempo reale per le tue trattative commerciali.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onUpdateRetainerTiers && (
              <button
                onClick={handleOpenNewTier}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-3.5 py-2 text-xs font-semibold text-neutral-950 shadow-sm hover:brightness-110 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Aggiungi Pacchetto</span>
              </button>
            )}

            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 rounded-xl border border-[#223049] bg-[#121B2C] px-3 py-2 text-xs font-medium text-neutral-300 hover:border-[#C5A059]/60 hover:text-[#DFBA73] transition-all"
              title="Ripristina i pacchetti originali ETRA"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ripristina Default</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {retainerTiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative group ${
                tier.isRecommended
                  ? 'border-[#C5A059] bg-[#121B2C] shadow-lg shadow-[#C5A059]/5'
                  : 'border-[#223049] bg-[#0E1523] hover:border-[#334666]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      Livello Servizio
                    </span>
                    {tier.isRecommended && (
                      <span className="flex items-center gap-1 rounded-full bg-[#DFBA73]/15 border border-[#DFBA73]/40 px-2 py-0.5 text-[10px] font-semibold text-[#DFBA73]">
                        <Sparkles className="h-3 w-3" />
                        <span>Consigliato</span>
                      </span>
                    )}
                  </div>

                  {/* Edit button */}
                  {onUpdateRetainerTiers && (
                    <button
                      onClick={() => handleOpenEditTier(tier)}
                      className="flex items-center gap-1 rounded-lg border border-[#223049] bg-[#142033] px-2 py-1 text-[11px] text-[#DFBA73] hover:border-[#C5A059] hover:bg-[#1A2840] transition-colors"
                      title="Modifica prezzi e condizioni di questo pacchetto"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Modifica</span>
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-100">
                    {tier.name}
                  </h3>
                  <div className="font-mono text-2xl font-bold text-[#DFBA73] mt-2">
                    {tier.priceRange}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                    <span>Min: €{tier.minFee.toLocaleString('it-IT')}</span>
                    <span>Max: €{tier.maxFee.toLocaleString('it-IT')}</span>
                    <span>12 Mesi</span>
                  </div>
                </div>

                <div className="border-t border-[#223049]/60 pt-4 space-y-2.5">
                  <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase block">
                    Ambito di Copertura Incluso ({tier.coverage.length}):
                  </span>
                  {tier.coverage.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="h-4 w-4 text-[#DFBA73] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#223049]/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">
                  Fatturazione anticipata SDD entro il 5
                </span>
                {onUpdateRetainerTiers && (
                  <button
                    onClick={() => handleOpenEditTier(tier)}
                    className="text-[11px] text-[#DFBA73] hover:underline"
                  >
                    Modifica Prezzo →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-xl rounded-2xl border border-[#223049] bg-[#0E1523] text-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#223049] px-6 py-4 bg-[#111A2B]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#182438] text-[#DFBA73] border border-[#C5A059]/30">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-100">
                    {isNewTier ? 'Nuovo Pacchetto Retainer' : `Modifica Pacchetto: ${editingTier.name}`}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Personalizza il listino prezzi e i servizi inclusi per la proposta operativa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTier(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1A253A] hover:text-neutral-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveTier} className="p-6 space-y-4 overflow-y-auto">
              
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Nome Pacchetto / Livello di Servizio
                </label>
                <input
                  type="text"
                  required
                  value={editingTier.name}
                  onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })}
                  placeholder="Es. ESSENTIAL BOUTIQUE, FULL GROWTH..."
                  className="w-full rounded-xl border border-[#223049] bg-[#142033] px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Etichetta Prezzo Visualizzata (Range o Importo Mensile)
                </label>
                <input
                  type="text"
                  required
                  value={editingTier.priceRange}
                  onChange={(e) => setEditingTier({ ...editingTier, priceRange: e.target.value })}
                  placeholder="Es. € 3.000 – € 5.000 / mese"
                  className="w-full rounded-xl border border-[#223049] bg-[#142033] px-3.5 py-2.5 text-sm font-mono text-[#DFBA73] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Tariffa Minima (€ / mese)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={editingTier.minFee}
                    onChange={(e) => setEditingTier({ ...editingTier, minFee: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#223049] bg-[#142033] px-3.5 py-2.5 text-sm font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Tariffa Massima (€ / mese)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={editingTier.maxFee}
                    onChange={(e) => setEditingTier({ ...editingTier, maxFee: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#223049] bg-[#142033] px-3.5 py-2.5 text-sm font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tier-recommended"
                  checked={!!editingTier.isRecommended}
                  onChange={(e) => setEditingTier({ ...editingTier, isRecommended: e.target.checked })}
                  className="h-4 w-4 rounded border-[#223049] bg-[#142033] text-[#C5A059] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="tier-recommended" className="text-xs font-medium text-neutral-300 cursor-pointer">
                  Contrassegna come &quot;Pacchetto Consigliato&quot; (badge in evidenza dorato)
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Voci di Copertura e Servizi Inclusi (una voce per riga)
                  </label>
                  <span className="text-[11px] text-neutral-400">Inserisci una riga per ogni punto elenco</span>
                </div>
                <textarea
                  rows={5}
                  value={coverageInput}
                  onChange={(e) => setCoverageInput(e.target.value)}
                  placeholder="Controllo di gestione trimestrale&#10;Revenue Management dinamico&#10;Marketing e Digital Guest Journey"
                  className="w-full rounded-xl border border-[#223049] bg-[#142033] p-3 text-xs text-neutral-100 focus:outline-none focus:border-[#C5A059] font-sans leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#223049] flex items-center justify-between">
                <div>
                  {!isNewTier && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(editingTier.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Rimuovi Pacchetto</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingTier(null)}
                    className="px-4 py-2 rounded-xl border border-[#223049] bg-[#121B2C] text-xs font-medium text-neutral-300 hover:text-neutral-100 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-5 py-2 text-xs font-semibold text-neutral-950 shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>Salva Modifiche Pacchetto</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

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
                  <label className="text-neutral-300 block mb-1">Success Fee (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={bandoSuccessFeePercent}
                    onChange={(e) => setBandoSuccessFeePercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Apertura Pratica Fissa (€):</label>
                  <input
                    type="number"
                    step="100"
                    value={bandoOpeningFee}
                    onChange={(e) => setBandoOpeningFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Risultato Bandi */}
              <div className="rounded-lg bg-[#142033] p-3.5 border border-[#223049] space-y-2 mt-2">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Success Fee ETRA maturata:</span>
                  <span className="font-mono font-bold text-[#DFBA73]">€{bandoEstimatedSuccessFee.toLocaleString('it-IT')}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-200 border-t border-[#223049]/60 pt-2 font-medium">
                  <span>Totale Fatturato ETRA su Pratica:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">€{bandoTotalRevenueEtra.toLocaleString('it-IT')}</span>
                </div>
                <div className="text-[10px] text-neutral-400 pt-1">
                  Incasso netto per l&apos;hotel: €{(bandoAmount - bandoTotalRevenueEtra).toLocaleString('it-IT')} a fondo perduto/tasso agevolato.
                </div>
              </div>
            </div>
          </div>

          {/* Direttrice 2: Disintermediazione OTA */}
          <div className="rounded-xl border border-[#223049] bg-[#111A2B] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#223049] pb-3">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <Euro className="h-4 w-4 text-[#DFBA73]" />
                <span>Direttrice 2: Disintermediazione OTA</span>
              </h3>
              <span className="text-[11px] text-blue-400 font-mono">Direct Booking Strategy</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1">Fatturato Camere Annuo Struttura (€):</label>
                <input
                  type="number"
                  step="25000"
                  value={roomRevenue}
                  onChange={(e) => setRoomRevenue(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1">Quota OTA Attuale (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={currentOtaPercent}
                    onChange={(e) => setCurrentOtaPercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Obiettivo OTA Target (%):</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={targetOtaPercent}
                    onChange={(e) => setTargetOtaPercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1">Commissione Media OTA (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="30"
                    value={avgOtaCommission}
                    onChange={(e) => setAvgOtaCommission(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Success Fee ETRA (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={etraSuccessFeePercent}
                    onChange={(e) => setEtraSuccessFeePercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#223049] bg-[#142033] p-2 font-mono text-neutral-100 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Risultato Disintermediazione */}
              <div className="rounded-lg bg-[#142033] p-3.5 border border-[#223049] space-y-2 mt-2">
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Fatturato disintermediato:</span>
                  <span className="font-mono font-bold text-neutral-100">€{disintermediatedAmount.toLocaleString('it-IT')}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Commissioni OTA risparmiate dall&apos;hotel:</span>
                  <span className="font-mono font-bold text-emerald-400">€{otaCommissionsSaved.toLocaleString('it-IT')}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Success Fee ETRA riconosciuta:</span>
                  <span className="font-mono font-bold text-[#DFBA73]">€{etraDisintermediationFee.toLocaleString('it-IT')}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-200 border-t border-[#223049]/60 pt-2 font-medium">
                  <span>Risparmio Netto Rimasto all&apos;Hotel:</span>
                  <span className="font-mono text-base font-bold text-emerald-300">€{hotelNetBenefit.toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. PROTOCOLLO ESECUTIVO DI AUDIT IN 4 SETTIMANE */}
      <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            3. Protocollo Esecutivo di Audit (4 Settimane)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cronologia standard di erogazione per garantire il massimo rigore metodologico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUDIT_EXECUTION_PROTOCOL.map((phase, idx) => (
            <div key={idx} className="rounded-xl border border-[#223049] bg-[#111A2B] p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-[#DFBA73] bg-[#162238] px-2 py-0.5 rounded border border-[#223049]">
                {phase.week}
              </span>
              <h3 className="text-sm font-semibold text-neutral-100">
                {phase.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {phase.tasks}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ROADMAP CONTRATTUALE */}
      <div className="rounded-2xl border border-[#223049] bg-[#0E1523] p-6 lg:p-8 space-y-4">
        <h2 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          4. Regole di Ingaggio &amp; Condizioni Amministrative
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

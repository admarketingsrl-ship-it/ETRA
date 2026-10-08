import React, { useState } from 'react';
import { MicroTask, SupplierLink } from '../types';
import { X, ExternalLink, Plus, Trash2, Link as LinkIcon, Building2 } from 'lucide-react';

interface SuppliersModalProps {
  task: MicroTask;
  onClose: () => void;
  onUpdateSuppliersAndLinks: (taskId: string, suppliers: string[], links: SupplierLink[]) => void;
}

export const SuppliersModal: React.FC<SuppliersModalProps> = ({
  task,
  onClose,
  onUpdateSuppliersAndLinks,
}) => {
  const [suppliers, setSuppliers] = useState<string[]>(task.suppliers || []);
  const [links, setLinks] = useState<SupplierLink[]>(task.links || []);

  const [newSupplierName, setNewSupplierName] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    const updated = [...suppliers, newSupplierName.trim()];
    setSuppliers(updated);
    setNewSupplierName('');
    onUpdateSuppliersAndLinks(task.id, updated, links);
  };

  const handleRemoveSupplier = (indexToRemove: number) => {
    const updated = suppliers.filter((_, idx) => idx !== indexToRemove);
    setSuppliers(updated);
    onUpdateSuppliersAndLinks(task.id, updated, links);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const newEntry: SupplierLink = {
      id: 'l_' + Date.now(),
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
    };
    const updated = [...links, newEntry];
    setLinks(updated);
    setNewLinkTitle('');
    setNewLinkUrl('');
    onUpdateSuppliersAndLinks(task.id, suppliers, updated);
  };

  const handleRemoveLink = (linkId: string) => {
    const updated = links.filter(l => l.id !== linkId);
    setLinks(updated);
    onUpdateSuppliersAndLinks(task.id, suppliers, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-[#223049] bg-[#0E1523] text-neutral-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#223049] px-6 py-4 bg-[#101828]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#182438] text-[#DFBA73] border border-[#C5A059]/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-mono text-[#DFBA73] font-semibold">{task.code}</span>
                <span>·</span>
                <span>Fornitori & Link di Riferimento</span>
              </div>
              <h3 className="text-base font-semibold text-neutral-100 line-clamp-1">
                {task.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1A253A] hover:text-neutral-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Fornitori Coinvolti */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Fornitori & Partner Esterni ({suppliers.length})
              </span>
              <span className="text-[11px] text-neutral-400">es. Mews, Cloudbeds, Ditte edili, Fotografi</span>
            </div>

            {suppliers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#223049] p-4 text-center text-xs text-neutral-400">
                Nessun fornitore registrato per questa attività.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suppliers.map((supplier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-[#223049] bg-[#141E30] px-3 py-1.5 text-xs text-neutral-200 group hover:border-[#C5A059]/50"
                  >
                    <span>{supplier}</span>
                    <button
                      onClick={() => handleRemoveSupplier(idx)}
                      className="text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Rimuovi fornitore"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Supplier Form */}
            <form onSubmit={handleAddSupplier} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Aggiungi nome fornitore / ditta (es. Mews, Studio Rossi)..."
                className="flex-1 rounded-xl border border-[#223049] bg-[#121B2C] px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newSupplierName.trim()}
                className="flex items-center gap-1 rounded-xl bg-[#1A263B] border border-[#223049] px-3 py-2 text-xs font-medium text-neutral-200 hover:border-[#C5A059]/60 hover:text-[#DFBA73] disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Aggiungi</span>
              </button>
            </form>
          </div>

          <div className="border-t border-[#223049]" />

          {/* Section 2: Link Utili & Risorse */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Link & Risorse Collegate ({links.length})
              </span>
              <span className="text-[11px] text-neutral-400">Drive, preventivi, portali, specifiche</span>
            </div>

            {links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#223049] p-4 text-center text-xs text-neutral-400">
                Nessun link o documentazione archiviata.
              </div>
            ) : (
              <div className="space-y-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-xl border border-[#223049] bg-[#121B2C] p-3 text-xs hover:border-[#C5A059]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-3">
                      <LinkIcon className="h-4 w-4 text-[#C5A059] shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-neutral-100 truncate">{link.title}</div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-mono text-[11px] text-[#C5A059] hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="text-neutral-400 hover:text-rose-400 p-1 transition-colors"
                      title="Elimina link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Link Form */}
            <form onSubmit={handleAddLink} className="space-y-2 rounded-xl border border-[#223049] bg-[#101828] p-3">
              <div className="text-xs font-medium text-neutral-300">Aggiungi nuovo link:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Titolo (es. Cartella Google Drive, Foglio Tariffe)"
                  className="rounded-lg border border-[#223049] bg-[#141E30] px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
                />
                <input
                  type="text"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="URL (es. https://...)"
                  className="rounded-lg border border-[#223049] bg-[#141E30] px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-all hover:brightness-110 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Salva Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#223049] bg-[#101828] px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#1A263B] border border-[#223049] px-4 py-2 text-xs font-medium text-neutral-200 hover:bg-[#202E47] transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

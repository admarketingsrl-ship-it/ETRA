import React, { useState } from 'react';
import { MicroTask, WorkNote } from '../types';
import { X, Send, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

interface WorkNotesModalProps {
  task: MicroTask;
  onClose: () => void;
  onSaveNote: (taskId: string, newNote: string, author: string) => void;
}

export const WorkNotesModal: React.FC<WorkNotesModalProps> = ({
  task,
  onClose,
  onSaveNote,
}) => {
  const [noteText, setNoteText] = useState('');
  const [author, setAuthor] = useState('Risorsa 1 (Ops & Comm)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    onSaveNote(task.id, noteText.trim(), author);
    setNoteText('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
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
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-mono text-[#DFBA73] font-semibold">{task.code}</span>
                <span>·</span>
                <span>Appunti & Note di Lavoro</span>
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

        {/* Content: History of Notes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Cronologia Note & Verbale di Avanzamento ({task.notes?.length || 0})
          </div>

          {(!task.notes || task.notes.length === 0) ? (
            <div className="rounded-xl border border-dashed border-[#223049] p-8 text-center text-neutral-400">
              <p className="text-sm">Nessuna nota registrata per questa attività.</p>
              <p className="text-xs text-neutral-400 mt-1">
                Inserisci di seguito appunti operativi, decisioni prese in meeting o avanzamenti dei fornitori.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {task.notes.map((note: WorkNote) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-[#223049] bg-[#121B2C] p-4 text-sm transition-all hover:border-[#C5A059]/40"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span className="flex items-center gap-1.5 font-medium text-[#DFBA73]">
                      <User className="h-3.5 w-3.5" />
                      {note.author}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {note.timestamp}
                    </span>
                  </div>
                  <p className="text-neutral-200 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Add new note form */}
        <div className="border-t border-[#223049] bg-[#101828] p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="author-select" className="text-xs font-medium text-neutral-300">
                Firma Nota come:
              </label>
              <select
                id="author-select"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="rounded-lg border border-[#223049] bg-[#141E30] px-3 py-1 text-xs text-neutral-200 focus:border-[#C5A059] focus:outline-none"
              >
                <option value="Risorsa 1 (Ops & Comm)">Risorsa 1 (Commerciale & Operations)</option>
                <option value="Risorsa 2 (Brand & Digital)">Risorsa 2 (Brand & Digital)</option>
                <option value="Team Advisory ETRA">Team Advisory ETRA</option>
                <option value="Direzione Struttura">Direzione Struttura</option>
              </select>
            </div>

            <div className="relative">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Scrivi qui la nota rapida, aggiornamento di cantiere o verbale di call..."
                rows={3}
                className="w-full rounded-xl border border-[#223049] bg-[#141E30] p-3 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:border-[#C5A059] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                {savedSuccess && (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Nota salvata con successo!</span>
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#99732B] px-4 py-2 text-xs font-semibold text-neutral-950 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Aggiungi Nota</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

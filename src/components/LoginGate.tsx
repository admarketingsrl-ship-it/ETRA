import React, { useState } from 'react';
import { EtraLogo } from './EtraLogo';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

interface LoginGateProps {
  onAuthenticated: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'ETRA8581') {
      try {
        localStorage.setItem('etra_auth_session', 'authenticated_ETRA8581');
      } catch {
        // ignore storage errors
      }
      setError(false);
      onAuthenticated();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070B12] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient luxury lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#16253D]/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Container */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Card */}
        <div className="rounded-3xl border border-[#223049] bg-gradient-to-b from-[#0F1726]/95 via-[#0D1422]/95 to-[#090D15]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* Logo & Headline */}
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="p-3 rounded-2xl bg-[#142033]/80 border border-[#C5A059]/30 shadow-lg shadow-[#C5A059]/5">
              <EtraLogo size="md" theme="dark" />
            </div>
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 text-[10px] font-semibold text-[#DFBA73] uppercase tracking-widest mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Accesso Riservato Management</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-neutral-100">
                Hospitality Solutions Boutique
              </h1>
              <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Piattaforma gestionale e operativa per il controllo strategico dell&apos;ospitalità d&apos;élite.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="etra-password" className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-[#DFBA73]" />
                  <span>Chiave di Accesso</span>
                </label>
                <span className="text-[11px] text-neutral-400">Codice Riservato</span>
              </div>

              <div className={`relative transition-transform ${shake ? 'animate-bounce' : ''}`}>
                <input
                  id="etra-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Inserisci la password (es. ETRA8581)"
                  autoFocus
                  required
                  className={`w-full rounded-xl border bg-[#121B2C] px-4 py-3 pl-10 pr-11 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all ${
                    error
                      ? 'border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-950/20'
                      : 'border-[#223049] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20'
                  }`}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  tabIndex={-1}
                  title={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1 animate-in fade-in duration-200">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Password errata. Riprova con la chiave corretta.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DFBA73] via-[#C5A059] to-[#99732B] px-4 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-[#C5A059]/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Accedi al Portale ETRA</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Bottom Security Note */}
          <div className="mt-8 pt-6 border-t border-[#223049]/60 text-center text-[11px] text-neutral-400 flex flex-col items-center gap-1">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-[#DFBA73]" />
              <span>Sessione crittografata ad uso esclusivo autorizzato</span>
            </span>
            <span>ETRA — Boutique Hospitality Management</span>
          </div>

        </div>

      </div>
    </div>
  );
};

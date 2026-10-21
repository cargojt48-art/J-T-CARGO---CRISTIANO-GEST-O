import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  LayoutDashboard, 
  FileText, 
  Search, 
  Share2, 
  Check, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { TransportPartner } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'map' | 'external_form' | 'track_protocol';
  setCurrentTab: (tab: 'dashboard' | 'map' | 'external_form' | 'track_protocol') => void;
  partners: TransportPartner[];
  onResetData: () => void;
  isSupabaseConnected?: boolean;
  isLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  partners,
  onResetData,
  isSupabaseConnected = false,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);

  const pendingDocsCount = partners.filter(p => p.status === 'pendente_documento').length;
  const inAnalysisCount = partners.filter(p => p.status === 'em_analise').length;

  const handleCopyLink = () => {
    // Generate a shareable URL to the external registration form
    const currentOrigin = window.location.origin;
    const shareUrl = `${currentOrigin}?view=credenciamento-externo`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-3 sm:gap-6">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer shrink-0 group select-none" 
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900/40 rounded-[10px] flex items-center justify-center">
                <Truck className="w-6 h-6 text-white group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                  J&amp;T CARGO <span className="text-emerald-400 font-bold">- CRISTIANO</span>
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Homologação Logística
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap leading-tight mt-0.5">
                Credenciamento &amp; Abrangência de Transportadores
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner shrink-0">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Dashboard &amp; Auditoria</span>
              <span className="md:hidden">Dashboard</span>
              {pendingDocsCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full shadow-sm">
                  {pendingDocsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Mapa de Abrangência</span>
            </button>

            <button
              onClick={() => setCurrentTab('external_form')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'external_form'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-teal-400" />
              <span className="font-semibold text-emerald-300">Link de Inscrição</span>
              <span className="hidden lg:inline text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Externo
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('track_protocol')}
              className={`flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'track_protocol'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Consultar Protocolo</span>
              <span className="lg:hidden">Protocolo</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Supabase status indicator */}
            <div 
              title={isSupabaseConnected ? 'Conectado ao Supabase (PostgreSQL em tempo real)' : 'Armazenamento Local (localStorage)'}
              className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">{isSupabaseConnected ? 'Supabase' : 'Local'}</span>
              {isLoading && (
                <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin ml-1" />
              )}
            </div>

            <button
              onClick={handleCopyLink}
              title="Copiar link público para enviar a novos transportadores"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="whitespace-nowrap">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden md:inline whitespace-nowrap">Copiar Link do Formulário</span>
                  <span className="md:hidden whitespace-nowrap">Copiar Link</span>
                </>
              )}
            </button>

            <button
              onClick={onResetData}
              title="Sincronizar / Atualizar dados do banco"
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-700"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

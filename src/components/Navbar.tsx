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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  partners,
  onResetData,
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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Transpo<span className="text-emerald-400">Doc</span></span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Homologação Logística
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Credenciamento & Abrangência de Transportadores</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Auditoria</span>
              {pendingDocsCount > 0 && (
                <span className="bg-amber-500 text-slate-900 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingDocsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Mapa de Abrangência</span>
            </button>

            <button
              onClick={() => setCurrentTab('external_form')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentTab === 'external_form'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Link de Inscrição</span>
              <span className="hidden md:inline text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded">Externo</span>
            </button>

            <button
              onClick={() => setCurrentTab('track_protocol')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                currentTab === 'track_protocol'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Consultar Protocolo</span>
              <span className="sm:hidden">Status</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              title="Copiar link público para enviar a novos transportadores"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar Link do Formulário</span>
                  <span className="sm:hidden">Copiar</span>
                </>
              )}
            </button>

            <button
              onClick={onResetData}
              title="Restaurar dados de demonstração"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

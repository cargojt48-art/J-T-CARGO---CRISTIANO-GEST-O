import React, { useState, useEffect } from 'react';
import { TransportPartner } from './types';
import { 
  getPartners, 
  savePartner, 
  deletePartner, 
  seedInitialPartners, 
  subscribeToPartnerChanges 
} from './services/partnerService';
import { isSupabaseConfigured } from './services/supabase';
import { resetToInitial } from './services/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CoverageMap } from './components/CoverageMap';
import { ExternalRegistrationForm } from './components/ExternalRegistrationForm';
import { StatusTrackerModal } from './components/StatusTrackerModal';
import { PartnerAuditModal } from './components/PartnerAuditModal';
import { Truck, FileText, Search, ShieldCheck } from 'lucide-react';

export default function App() {
  // Check if opened via external link with query parameter
  const [isExternalView] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'credenciamento-externo';
  });

  const [partners, setPartners] = useState<TransportPartner[]>([]);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'external_form' | 'track_protocol'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'credenciamento-externo') {
      return 'external_form';
    }
    return 'dashboard';
  });
  const [auditPartner, setAuditPartner] = useState<TransportPartner | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Guard tab switching so external visitors can NEVER access dashboard or map
  const handleSetTab = (tab: 'dashboard' | 'map' | 'external_form' | 'track_protocol') => {
    if (isExternalView && (tab === 'dashboard' || tab === 'map')) {
      return; // Block access to internal management
    }
    setCurrentTab(tab);
  };

  // Load partners on mount (from Supabase with fallback to localStorage)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const loaded = await getPartners();
        if (isMounted) {
          setPartners(loaded);
        }
      } catch (err) {
        console.error('Falha ao carregar parceiros:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    // Subscribe to real-time updates from Supabase
    const unsubscribe = subscribeToPartnerChanges(
      (inserted) => {
        setPartners(prev => {
          if (prev.some(p => p.id === inserted.id)) return prev;
          return [inserted, ...prev];
        });
      },
      (updated) => {
        setPartners(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        setAuditPartner(curr => (curr && curr.id === updated.id ? updated : curr));
      },
      (deletedId) => {
        setPartners(prev => prev.filter(p => p.id !== deletedId));
        setAuditPartner(curr => (curr && curr.id === deletedId ? null : curr));
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Update a partner in the list and sync with database
  const handleUpdatePartner = async (updated: TransportPartner) => {
    const updatedList = partners.map(p => (p.id === updated.id ? updated : p));
    setPartners(updatedList);
    if (auditPartner && auditPartner.id === updated.id) {
      setAuditPartner(updated);
    }
    await savePartner(updated);
  };

  // Add newly registered partner via external form
  const handleRegisterSuccess = async (newPartner: TransportPartner) => {
    const updatedList = [newPartner, ...partners];
    setPartners(updatedList);
    await savePartner(newPartner);
  };

  // Delete partner
  const handleDeletePartner = async (id: string) => {
    setPartners(prev => prev.filter(p => p.id !== id));
    if (auditPartner?.id === id) {
      setAuditPartner(null);
    }
    await deletePartner(id);
  };

  // Refresh/sync partners from database
  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      const list = await getPartners();
      setPartners(list);
    } catch (err) {
      console.error('Erro ao sincronizar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to map and focus on partner
  const handleGoToMapForPartner = (partner: TransportPartner) => {
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      
      {/* Top Navigation */}
      {isExternalView ? (
        /* Public Portal Header - Strictly for external partners */
        <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 py-2">
              {/* Brand */}
              <div className="flex items-center space-x-3.5 select-none">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-slate-900/40 rounded-[10px] flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                      J&amp;T CARGO <span className="text-emerald-400 font-bold">- CRISTIANO</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 whitespace-nowrap leading-tight mt-0.5">
                    Portal de Credenciamento &amp; Homologação de Frotas
                  </p>
                </div>
              </div>

              {/* Public Portal Tabs */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <nav className="flex items-center space-x-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => handleSetTab('external_form')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      currentTab === 'external_form'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Inscrição</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetTab('track_protocol')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      currentTab === 'track_protocol'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Consultar Protocolo</span>
                  </button>
                </nav>

                <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ambiente Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : (
        /* Internal Corporate Navbar - Full access for managers/auditors */
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleSetTab}
          partners={partners}
          onResetData={handleRefreshData}
          isSupabaseConnected={isSupabaseConfigured}
          isLoading={isLoading}
        />
      )}

      {/* Main View Body */}
      <main className="flex-1">
        {isLoading && partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Internal Only: Dashboard */}
            {!isExternalView && currentTab === 'dashboard' && (
              <Dashboard
                partners={partners}
                onOpenAudit={(partner) => setAuditPartner(partner)}
                onGoToMapForPartner={handleGoToMapForPartner}
                onGoToRegistration={() => handleSetTab('external_form')}
                onDeletePartner={handleDeletePartner}
              />
            )}

            {/* Internal Only: Coverage Map */}
            {!isExternalView && currentTab === 'map' && (
              <CoverageMap
                partners={partners}
                onSelectPartnerForAudit={(partner) => setAuditPartner(partner)}
              />
            )}

            {/* Registration Form (Public & Internal) */}
            {currentTab === 'external_form' && (
              <ExternalRegistrationForm
                onRegisterSuccess={handleRegisterSuccess}
                onGoToDashboard={() => handleSetTab('dashboard')}
                onGoToMap={() => handleSetTab('map')}
                isExternalView={isExternalView}
                onGoToTrackProtocol={() => handleSetTab('track_protocol')}
              />
            )}

            {/* Protocol Status Tracker */}
            {currentTab === 'track_protocol' && (
              <StatusTrackerModal
                partners={partners}
                onUpdatePartner={handleUpdatePartner}
                onGoToDashboard={() => handleSetTab('dashboard')}
                isExternalView={isExternalView}
              />
            )}
          </>
        )}
      </main>

      {/* Auditor Modal for 12 Documents - Only for Internal Management */}
      {!isExternalView && auditPartner && (
        <PartnerAuditModal
          partner={auditPartner}
          isOpen={Boolean(auditPartner)}
          onClose={() => setAuditPartner(null)}
          onUpdatePartner={handleUpdatePartner}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          J&amp;T CARGO - CRISTIANO &copy; {new Date().getFullYear()} • {isExternalView ? 'Portal Oficial de Credenciamento de Transportadores' : 'Plataforma Integrada de Credenciamento, Auditoria e Abrangência'}
        </p>
        <div className="flex items-center space-x-2 text-[11px]">
          {isExternalView ? (
            <div className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Canal Oficial e Seguro para Homologação de Prestadores</span>
            </div>
          ) : (
            <>
              <span className={`inline-block w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isSupabaseConfigured ? 'Banco de Dados: Supabase PostgreSQL (Ativo)' : 'Banco de Dados: Local Storage'}</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

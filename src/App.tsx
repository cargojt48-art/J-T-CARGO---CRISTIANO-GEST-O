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

export default function App() {
  const [partners, setPartners] = useState<TransportPartner[]>([]);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'external_form' | 'track_protocol'>('dashboard');
  const [auditPartner, setAuditPartner] = useState<TransportPartner | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

    // Check if opened via external link with query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'credenciamento-externo') {
      setCurrentTab('external_form');
    }

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

  // Reset to initial mock data (and seed to Supabase if connected)
  const handleResetData = async () => {
    if (confirm('Deseja restaurar os dados de demonstração com as transportadoras padrão?')) {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          await seedInitialPartners();
          const list = await getPartners();
          setPartners(list);
        } else {
          const initial = resetToInitial();
          setPartners(initial);
        }
        alert('Dados restaurados com sucesso!');
      } catch (err) {
        console.error('Erro ao restaurar:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Navigate to map and focus on partner
  const handleGoToMapForPartner = (partner: TransportPartner) => {
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        partners={partners}
        onResetData={handleResetData}
        isSupabaseConnected={isSupabaseConfigured}
        isLoading={isLoading}
      />

      {/* Main View Body */}
      <main className="flex-1">
        {isLoading && partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600">Conectando ao Supabase e carregando parceiros...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                partners={partners}
                onOpenAudit={(partner) => setAuditPartner(partner)}
                onGoToMapForPartner={handleGoToMapForPartner}
                onGoToRegistration={() => setCurrentTab('external_form')}
                onDeletePartner={handleDeletePartner}
              />
            )}

            {currentTab === 'map' && (
              <CoverageMap
                partners={partners}
                onSelectPartnerForAudit={(partner) => setAuditPartner(partner)}
              />
            )}

            {currentTab === 'external_form' && (
              <ExternalRegistrationForm
                onRegisterSuccess={handleRegisterSuccess}
                onGoToDashboard={() => setCurrentTab('dashboard')}
                onGoToMap={() => setCurrentTab('map')}
              />
            )}

            {currentTab === 'track_protocol' && (
              <StatusTrackerModal
                partners={partners}
                onUpdatePartner={handleUpdatePartner}
                onGoToDashboard={() => setCurrentTab('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Auditor Modal for 12 Documents */}
      {auditPartner && (
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
          J&amp;T CARGO - CRISTIANO &copy; {new Date().getFullYear()} • Plataforma Integrada de Credenciamento, Auditoria e Abrangência
        </p>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className={`inline-block w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span>{isSupabaseConfigured ? 'Banco de Dados: Supabase PostgreSQL (Ativo)' : 'Banco de Dados: Local Storage'}</span>
        </div>
      </footer>
    </div>
  );
}

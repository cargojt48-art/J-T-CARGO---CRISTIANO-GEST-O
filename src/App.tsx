import React, { useState, useEffect } from 'react';
import { 
  TransportPartner 
} from './types';
import { 
  loadPartners, 
  savePartners, 
  resetToInitial 
} from './services/storage';
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

  // Load from local storage on mount
  useEffect(() => {
    const loaded = loadPartners();
    setPartners(loaded);

    // Check if opened via external link with query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'credenciamento-externo') {
      setCurrentTab('external_form');
    }
  }, []);

  // Update a partner in the list and save
  const handleUpdatePartner = (updated: TransportPartner) => {
    const updatedList = partners.map(p => (p.id === updated.id ? updated : p));
    setPartners(updatedList);
    savePartners(updatedList);
    // Also update modal state if open
    if (auditPartner && auditPartner.id === updated.id) {
      setAuditPartner(updated);
    }
  };

  // Add newly registered partner via external form
  const handleRegisterSuccess = (newPartner: TransportPartner) => {
    const updatedList = [newPartner, ...partners];
    setPartners(updatedList);
    savePartners(updatedList);
  };

  // Delete partner
  const handleDeletePartner = (id: string) => {
    const updatedList = partners.filter(p => p.id !== id);
    setPartners(updatedList);
    savePartners(updatedList);
  };

  // Reset to initial mock
  const handleResetData = () => {
    if (confirm('Deseja restaurar os dados de demonstração com as transportadoras padrão?')) {
      const initial = resetToInitial();
      setPartners(initial);
      alert('Dados restaurados com sucesso!');
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
      />

      {/* Main View Body */}
      <main className="flex-1">
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
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center">
        <p>
          TranspoDoc &copy; {new Date().getFullYear()} • Plataforma Integrada de Credenciamento, Auditoria e Abrangência de Transportadores Rodoviários
        </p>
      </footer>
    </div>
  );
}

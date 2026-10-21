import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Truck, 
  FileCheck, 
  Plus, 
  ExternalLink, 
  Share2, 
  Download, 
  Trash2, 
  Eye, 
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TransportPartner, PartnerStatus } from '../types';
import { BRAZIL_STATES } from '../data/brazilCities';

interface DashboardProps {
  partners: TransportPartner[];
  onOpenAudit: (partner: TransportPartner) => void;
  onGoToMapForPartner: (partner: TransportPartner) => void;
  onGoToRegistration: () => void;
  onDeletePartner: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  partners,
  onOpenAudit,
  onGoToMapForPartner,
  onGoToRegistration,
  onDeletePartner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [partnerToDelete, setPartnerToDelete] = useState<TransportPartner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);

  // KPIs
  const totalCount = partners.length;
  const approvedCount = partners.filter(p => p.status === 'homologado').length;
  const inAnalysisCount = partners.filter(p => p.status === 'em_analise').length;
  const pendingDocsCount = partners.filter(p => p.status === 'pendente_documento').length;
  const rejectedCount = partners.filter(p => p.status === 'rejeitado').length;

  // Expiring or expired alerts (RNTRC or Insurance)
  const expiringAlerts = partners.filter(p => {
    const isRntrcExpired = p.rntrc.status === 'vencido' || (p.rntrc.validUntil && new Date(p.rntrc.validUntil) < new Date());
    const isInsuranceExpired = p.insurance?.hasInsurance && p.insurance?.validUntil && new Date(p.insurance.validUntil) < new Date();
    return isRntrcExpired || isInsuranceExpired;
  });

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.companyName.toLowerCase().includes(q) || (p.tradeName && p.tradeName.toLowerCase().includes(q));
        const matchesCnpj = p.cnpj.includes(q);
        const matchesProtocol = p.protocol.toLowerCase().includes(q);
        const matchesCity = p.coverage.baseCity.toLowerCase().includes(q) || p.coverage.baseState.toLowerCase().includes(q);
        if (!matchesName && !matchesCnpj && !matchesProtocol && !matchesCity) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // State
      if (stateFilter !== 'all' && p.coverage.baseState !== stateFilter && !p.coverage.statesServed.includes(stateFilter)) {
        return false;
      }

      return true;
    });
  }, [partners, searchQuery, statusFilter, stateFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Razao Social',
      'Nome Fantasia',
      'CNPJ',
      'Inscricao Estadual',
      'Cidade Base',
      'UF',
      'Raio (km)',
      'RNTRC',
      'Status RNTRC',
      'Status Geral',
      'Conformidade (%)',
      'Email Assinatura',
    ];

    const rows = filteredPartners.map(p => [
      p.protocol,
      `"${p.companyName}"`,
      `"${p.tradeName || ''}"`,
      `"${p.cnpj}"`,
      `"${p.stateRegistration}"`,
      `"${p.coverage.baseCity}"`,
      p.coverage.baseState,
      p.coverage.radiusKm,
      `"${p.rntrc.number}"`,
      p.rntrc.status,
      p.status,
      `${p.complianceScore}%`,
      `"${p.electronicSignatureEmail}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_transportadores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão & Homologação de Transportadores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Acompanhe o status dos 12 documentos cadastrais, aprove parceiros e monitore a abrangência geográfica de operações.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onGoToRegistration}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Novo Credenciamento Externo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Cadastrados
            </span>
            <Building2 className={`w-4 h-4 ${statusFilter === 'all' ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-black mt-2">{totalCount}</div>
          <div className={`text-[10px] mt-1 ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Transportadoras na base
          </div>
        </div>

        {/* Homologados */}
        <div 
          onClick={() => setStatusFilter('homologado')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'homologado'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'homologado' ? 'text-emerald-200' : 'text-emerald-700'}`}>
              Homologados
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'homologado' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-600 group-hover:text-emerald-700" style={{ color: statusFilter === 'homologado' ? '#fff' : undefined }}>
            {approvedCount}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === 'homologado' ? 'text-emerald-100' : 'text-slate-500'}`}>
            100% aptos para frete
          </div>
        </div>

        {/* Em Análise */}
        <div 
          onClick={() => setStatusFilter('em_analise')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'em_analise'
              ? 'bg-blue-700 text-white border-blue-700 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'em_analise' ? 'text-blue-200' : 'text-blue-700'}`}>
              Em Análise
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'em_analise' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <div className="text-2xl font-black mt-2" style={{ color: statusFilter === 'em_analise' ? '#fff' : '#2563eb' }}>
            {inAnalysisCount}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === 'em_analise' ? 'text-blue-100' : 'text-slate-500'}`}>
            Aguardando validação
          </div>
        </div>

        {/* Pendentes */}
        <div 
          onClick={() => setStatusFilter('pendente_documento')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pendente_documento'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'pendente_documento' ? 'text-amber-100' : 'text-amber-700'}`}>
              Doc. Pendente
            </span>
            <AlertTriangle className={`w-4 h-4 ${statusFilter === 'pendente_documento' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <div className="text-2xl font-black mt-2" style={{ color: statusFilter === 'pendente_documento' ? '#fff' : '#d97706' }}>
            {pendingDocsCount}
          </div>
          <div className={`text-[10px] mt-1 ${statusFilter === 'pendente_documento' ? 'text-amber-100' : 'text-slate-500'}`}>
            Requer correção / reenvio
          </div>
        </div>

        {/* Alertas Regulatórios */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl border border-rose-200 bg-rose-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Alertas ANTT / Seguro
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black mt-2 text-rose-700">
            {expiringAlerts.length}
          </div>
          <div className="text-[10px] mt-1 text-rose-600 font-medium">
            RNTRC ou Seguros vencidos
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por Razão, Fantasia, CNPJ, Protocolo ou Cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">Todos os Status</option>
              <option value="homologado">Homologados</option>
              <option value="em_analise">Em Análise</option>
              <option value="pendente_documento">Pendente de Documento</option>
              <option value="rejeitado">Rejeitados</option>
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">Todos os Estados (UF)</option>
              {BRAZIL_STATES.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>

            <div className="border-l border-slate-200 pl-2 flex items-center space-x-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-bold ${
                  viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Visualização em Tabela"
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg text-xs font-bold ${
                  viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Visualização em Cards"
              >
                Cards
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Table or Card List */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Nenhum transportador encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tente ajustar os termos de busca ou remover os filtros aplicados.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Transportador / CNPJ</th>
                  <th className="py-3 px-4">Base & Raio</th>
                  <th className="py-3 px-4">RNTRC (ANTT)</th>
                  <th className="py-3 px-4">Conformidade (12 Docs)</th>
                  <th className="py-3 px-4">Status de Homologação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredPartners.map((partner) => {
                  const docList = Object.values(partner.documents);
                  const approvedCountDoc = docList.filter(d => d.status === 'aprovado').length;
                  const rejectedCountDoc = docList.filter(d => d.status === 'reprovado').length;
                  const isRntrcExpired = partner.rntrc.status === 'vencido' || (partner.rntrc.validUntil && new Date(partner.rntrc.validUntil) < new Date());

                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & CNPJ */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                            <span>{partner.companyName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {partner.tradeName && <span className="font-medium text-slate-700">{partner.tradeName} • </span>}
                            <span className="font-mono text-slate-600">{partner.cnpj}</span>
                          </div>
                          <span className="inline-block mt-1 text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                            {partner.protocol}
                          </span>
                        </div>
                      </td>

                      {/* Base & Radius */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-slate-800 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{partner.coverage.baseCity} ({partner.coverage.baseState})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Raio: <strong className="text-slate-800">{partner.coverage.radiusKm} km</strong> ({partner.coverage.citiesServed.length} cidades)
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {partner.coverage.statesServed.map(s => (
                              <span key={s} className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* RNTRC */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{partner.rntrc.number}</span>
                          <span className="text-[10px] text-slate-500 ml-1">({partner.rntrc.category})</span>
                          <div className="mt-0.5">
                            {isRntrcExpired ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                Vencido ({partner.rntrc.validUntil})
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                Válido até {partner.rntrc.validUntil}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Compliance Score */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800">{partner.complianceScore}%</span>
                            <span className="text-slate-400 text-[10px]">{approvedCountDoc}/12 docs</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${
                                partner.complianceScore === 100 
                                  ? 'bg-emerald-500' 
                                  : partner.complianceScore >= 70 
                                    ? 'bg-blue-500' 
                                    : partner.complianceScore >= 40 
                                      ? 'bg-amber-500' 
                                      : 'bg-rose-500'
                              }`}
                              style={{ width: `${partner.complianceScore}%` }}
                            />
                          </div>
                          {rejectedCountDoc > 0 && (
                            <span className="text-[10px] text-amber-700 font-semibold block">
                              {rejectedCountDoc} {rejectedCountDoc === 1 ? 'doc pendente' : 'docs pendentes'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {partner.status === 'homologado' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Homologado
                          </span>
                        )}
                        {partner.status === 'em_analise' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Em Análise
                          </span>
                        )}
                        {partner.status === 'pendente_documento' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Pendente Doc
                          </span>
                        )}
                        {partner.status === 'rejeitado' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            Rejeitado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onOpenAudit(partner)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Auditar os 12 documentos"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Auditar</span>
                          </button>

                          <button
                            onClick={() => onGoToMapForPartner(partner)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver raio e geolocalização no mapa"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPartnerToDelete(partner);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir parceiro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => {
            const isRntrcExpired = partner.rntrc.status === 'vencido' || (partner.rntrc.validUntil && new Date(partner.rntrc.validUntil) < new Date());

            return (
              <div 
                key={partner.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {partner.protocol}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {partner.companyName}
                      </h3>
                      {partner.tradeName && (
                        <p className="text-xs text-slate-500 font-medium">{partner.tradeName}</p>
                      )}
                    </div>

                    <div>
                      {partner.status === 'homologado' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Homologado
                        </span>
                      )}
                      {partner.status === 'em_analise' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                          Em Análise
                        </span>
                      )}
                      {partner.status === 'pendente_documento' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pendente Doc
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1 border-t border-slate-100 pt-3">
                    <p><span className="text-slate-400">CNPJ:</span> <span className="font-mono">{partner.cnpj}</span></p>
                    <p><span className="text-slate-400">Sede:</span> <strong>{partner.coverage.baseCity} ({partner.coverage.baseState})</strong></p>
                    <p><span className="text-slate-400">Raio:</span> <strong>{partner.coverage.radiusKm} km</strong></p>
                    <p>
                      <span className="text-slate-400">RNTRC:</span> <strong className="font-mono">{partner.rntrc.number}</strong>
                      {isRntrcExpired && <span className="text-rose-600 text-[10px] font-bold ml-1">(VENCIDO)</span>}
                    </p>
                  </div>

                  {/* Compliance score */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-slate-600">Conformidade Documental</span>
                      <span className="text-slate-900">{partner.complianceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${
                          partner.complianceScore === 100 
                            ? 'bg-emerald-500' 
                            : partner.complianceScore >= 70 
                              ? 'bg-blue-500' 
                              : partner.complianceScore >= 40 
                                ? 'bg-amber-500' 
                                : 'bg-rose-500'
                        }`}
                        style={{ width: `${partner.complianceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onGoToMapForPartner(partner)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center space-x-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Ver no Mapa</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPartnerToDelete(partner);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir parceiro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenAudit(partner)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Auditar Documentos</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Excluir Transportadora?</h3>
              <p className="text-sm text-slate-600 mt-2">
                Tem certeza de que deseja remover <strong className="text-slate-900 font-bold">{partnerToDelete.companyName}</strong> da base de dados e do mapa?
              </p>
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                Esta ação apagará permanentemente o cadastro e seus 12 documentos vinculados.
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPartnerToDelete(null)}
                className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const name = partnerToDelete.companyName;
                  try {
                    await onDeletePartner(partnerToDelete.id);
                    setDeletedToast(`Transportadora "${name}" excluída com sucesso!`);
                    setTimeout(() => setDeletedToast(null), 4000);
                  } catch (err) {
                    console.error('Erro ao excluir parceiro:', err);
                  } finally {
                    setIsDeleting(false);
                    setPartnerToDelete(null);
                  }
                }}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {deletedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200">{deletedToast}</span>
        </div>
      )}

    </div>
  );
};

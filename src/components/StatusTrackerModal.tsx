import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  FileText, 
  UploadCloud, 
  Check, 
  Building2, 
  Mail, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { TransportPartner, DocumentItem } from '../types';

interface StatusTrackerModalProps {
  partners: TransportPartner[];
  onUpdatePartner: (partner: TransportPartner) => void;
  onGoToDashboard: () => void;
}

export const StatusTrackerModal: React.FC<StatusTrackerModalProps> = ({
  partners,
  onUpdatePartner,
  onGoToDashboard,
}) => {
  const [protocolInput, setProtocolInput] = useState<string>('');
  const [searchedPartner, setSearchedPartner] = useState<TransportPartner | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [reuploadedSuccess, setReuploadedSuccess] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = protocolInput.trim().toUpperCase();
    const found = partners.find(p => p.protocol.toUpperCase() === clean || p.cnpj.replace(/\D/g, '') === clean.replace(/\D/g, ''));
    setSearchedPartner(found || null);
    setHasSearched(true);
    setReuploadedSuccess(null);
  };

  const handleQuickSelect = (protocol: string) => {
    setProtocolInput(protocol);
    const found = partners.find(p => p.protocol === protocol);
    setSearchedPartner(found || null);
    setHasSearched(true);
    setReuploadedSuccess(null);
  };

  const handleReuploadDoc = (docKey: keyof TransportPartner['documents'], e: React.ChangeEvent<HTMLInputElement>) => {
    if (!searchedPartner) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const updatedDocuments = {
      ...searchedPartner.documents,
      [docKey]: {
        ...searchedPartner.documents[docKey],
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toISOString(),
        status: 'em_analise' as const,
        notes: 'Documento corrigido e reenviado pelo prestador. Aguardando revalidação.',
      },
    };

    const updated: TransportPartner = {
      ...searchedPartner,
      documents: updatedDocuments,
      status: 'em_analise',
      updatedAt: new Date().toISOString(),
    };

    setSearchedPartner(updated);
    onUpdatePartner(updated);
    setReuploadedSuccess(`Arquivo "${file.name}" reenviado com sucesso para a equipe de compliance.`);
    setTimeout(() => setReuploadedSuccess(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Acompanhamento de Homologação & Documentos
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Consulte o andamento da análise dos seus 12 documentos cadastrais informando o número do seu Protocolo ou CNPJ.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Digite seu Protocolo (ex: TRP-2026-9855) ou CNPJ..."
              value={protocolInput}
              onChange={(e) => setProtocolInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Consultar Inscrição</span>
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Exemplos cadastrados:</span>
          {partners.slice(0, 3).map((p) => (
            <button
              key={p.protocol}
              type="button"
              onClick={() => handleQuickSelect(p.protocol)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono rounded-lg border border-slate-700 text-[11px] transition-colors cursor-pointer"
            >
              {p.protocol} ({p.status === 'homologado' ? 'Aprovado' : 'Com Pendência'})
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {hasSearched && !searchedPartner && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Protocolo não localizado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Verifique se o número do protocolo ou CNPJ foi digitado corretamente. Caso tenha acabado de submeter a inscrição, verifique se a gravação foi confirmada.
          </p>
        </div>
      )}

      {searchedPartner && (
        <div className="space-y-6 animate-in fade-in">
          
          {reuploadedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reuploadedSuccess}</span>
            </div>
          )}

          {/* Partner Status Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {searchedPartner.protocol}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {searchedPartner.companyName}
                </h3>
                <p className="text-xs text-slate-500">
                  Nome Fantasia: {searchedPartner.tradeName || 'N/A'} • CNPJ: <span className="font-mono">{searchedPartner.cnpj}</span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Status Geral</span>
                <div className="mt-1">
                  {searchedPartner.status === 'homologado' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Homologado & Aprovado
                    </span>
                  )}
                  {searchedPartner.status === 'em_analise' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
                      Em Análise Documental
                    </span>
                  )}
                  {searchedPartner.status === 'pendente_documento' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                      Ação Necessária: Pendência de Documentos
                    </span>
                  )}
                  {searchedPartner.status === 'rejeitado' && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                      Cadastro Recusado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Auditor remarks if pending */}
            {searchedPartner.auditorNotes && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
                <strong className="text-slate-900 block mb-1">Último Parecer da Equipe de Compliance:</strong>
                <p>{searchedPartner.auditorNotes}</p>
              </div>
            )}
          </div>

          {/* Detailed Document Checklist with Re-upload functionality */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Status Detalhado dos 12 Documentos</h4>
                <p className="text-xs text-slate-500">Documentos com pendência possuem opção direta para reenvio</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                {searchedPartner.complianceScore}% Conforme
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {(Object.keys(searchedPartner.documents) as (keyof typeof searchedPartner.documents)[]).map((key) => {
                const doc = searchedPartner.documents[key];
                const isRejected = doc.status === 'reprovado';
                const isPending = doc.status === 'pendente';

                return (
                  <div key={key} className={`p-4 transition-colors ${isRejected ? 'bg-rose-50/40' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{doc.name}</h5>
                          {doc.isRequired && (
                            <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-semibold border border-rose-200">
                              Obrigatório
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                          {doc.fileName ? (
                            <span className="font-mono text-[11px] text-slate-700">
                              Arquivo: {doc.fileName} {doc.fileSize && `(${doc.fileSize})`}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Nenhum documento enviado</span>
                          )}
                        </div>

                        {/* Auditor Feedback Note */}
                        {doc.notes && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
                            <strong>Instrução da Auditoria:</strong> {doc.notes}
                          </div>
                        )}
                      </div>

                      {/* Status & Re-upload trigger */}
                      <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                        {doc.status === 'aprovado' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Aprovado
                          </span>
                        )}
                        {doc.status === 'em_analise' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Em Análise
                          </span>
                        )}
                        {doc.status === 'reprovado' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            Reprovado
                          </span>
                        )}
                        {doc.status === 'pendente' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            Pendente
                          </span>
                        )}

                        {/* Re-upload button if rejected or pending */}
                        {(isRejected || isPending) && (
                          <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Reenviar Arquivo</span>
                            <input
                              type="file"
                              onChange={(e) => handleReuploadDoc(key, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

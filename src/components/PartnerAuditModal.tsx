import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Download, 
  Send, 
  Building2, 
  CreditCard, 
  Shield, 
  MapPin, 
  UserCheck, 
  Mail, 
  Phone, 
  Save, 
  Check, 
  Copy,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { TransportPartner, DocStatus, PartnerStatus, DocumentItem } from '../types';
import { calculateComplianceScore } from '../services/storage';

interface PartnerAuditModalProps {
  partner: TransportPartner;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePartner: (updated: TransportPartner) => void;
}

export const PartnerAuditModal: React.FC<PartnerAuditModalProps> = ({
  partner,
  isOpen,
  onClose,
  onUpdatePartner,
}) => {
  const [currentPartner, setCurrentPartner] = useState<TransportPartner>({ ...partner });
  const [rejectingDocKey, setRejectingDocKey] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  if (!isOpen) return null;

  const docKeyList: { key: keyof typeof partner.documents; label: string; number: number; desc: string; isFillOnly?: boolean }[] = [
    { key: 'cnpjCard', label: 'Cartão do CNPJ', number: 1, desc: 'Comprovante cadastral da Receita Federal' },
    { key: 'socialContract', label: 'Contrato Social e Alterações', number: 2, desc: 'Ato constitutivo registrado na Junta Comercial' },
    { key: 'legalRepDocument', label: 'Documento do Representante Legal', number: 3, desc: 'RG e CPF ou CNH dos sócios administradores' },
    { key: 'addressProof', label: 'Comprovante de Endereço da Empresa', number: 4, desc: 'Conta de consumo recente (< 60 dias) da matriz/filial' },
    { key: 'rntrcCertificate', label: 'RNTRC Válido (ANTT)', number: 5, desc: 'Registro Nacional de Transportadores Rodoviários' },
    { key: 'bankProof', label: 'Dados Bancários da Empresa', number: 6, desc: 'Extrato ou carta bancária com titularidade e Chave PIX' },
    { key: 'insurancePolicy', label: 'Apólice de Seguro Vigente', number: 7, desc: 'RCTR-C e RC-DC (Opcional se contratante possuir apólice própria)' },
    { key: 'stateRegistrationProof', label: 'Inscrição Estadual (IE)', number: 8, desc: 'Dado fiscal informado no cadastro (Preenchimento)', isFillOnly: true },
    { key: 'citiesCoverageList', label: 'Lista de Cidades Cobertas', number: 9, desc: 'Malha de atendimento informada no cadastro (Preenchimento)', isFillOnly: true },
    { key: 'contactsSheet', label: 'Contatos dos Responsáveis', number: 10, desc: 'Contatos operacionais e plantão informados (Preenchimento)', isFillOnly: true },
    { key: 'electronicSignatureDoc', label: 'E-mail para Assinatura Eletrônica', number: 11, desc: 'E-mail oficial para assinatura digital do contrato (Preenchimento)', isFillOnly: true },
    { key: 'sampleNfeCte', label: 'Exemplo de NF-e e/ou CT-e Emitido', number: 12, desc: 'Exemplo de conhecimento de transporte recente' },
  ];

  const handleSetDocStatus = (docKey: keyof typeof partner.documents, newStatus: DocStatus, notes?: string) => {
    const updatedDocuments = {
      ...currentPartner.documents,
      [docKey]: {
        ...currentPartner.documents[docKey],
        status: newStatus,
        notes: notes !== undefined ? notes : currentPartner.documents[docKey].notes,
      },
    };

    const tempPartner: TransportPartner = {
      ...currentPartner,
      documents: updatedDocuments,
      updatedAt: new Date().toISOString(),
    };

    const newScore = calculateComplianceScore(tempPartner);
    
    // Auto calculate suggested status if desired
    let newStatusPartner = tempPartner.status;
    const hasRejected = Object.values(updatedDocuments).some(d => d.status === 'reprovado');
    const allApproved = Object.values(updatedDocuments).filter(d => d.isRequired).every(d => d.status === 'aprovado');
    
    if (hasRejected) {
      newStatusPartner = 'pendente_documento';
    } else if (allApproved) {
      newStatusPartner = 'homologado';
    } else {
      newStatusPartner = 'em_analise';
    }

    const updated = {
      ...tempPartner,
      complianceScore: newScore,
      status: newStatusPartner,
    };

    setCurrentPartner(updated);
    onUpdatePartner(updated);
  };

  const handleOpenReject = (docKey: string, currentNotes?: string) => {
    setRejectingDocKey(docKey);
    setRejectionReason(currentNotes || '');
  };

  const handleConfirmReject = (docKey: keyof typeof partner.documents) => {
    handleSetDocStatus(docKey, 'reprovado', rejectionReason);
    setRejectingDocKey(null);
    setRejectionReason('');
  };

  const handleApproveAll = () => {
    const updatedDocuments = { ...currentPartner.documents };
    (Object.keys(updatedDocuments) as (keyof typeof updatedDocuments)[]).forEach((key) => {
      if (updatedDocuments[key].fileName || updatedDocuments[key].isRequired) {
        updatedDocuments[key] = {
          ...updatedDocuments[key],
          status: 'aprovado',
          notes: 'Aprovado na auditoria integral de compliance.',
        };
      }
    });

    const updated: TransportPartner = {
      ...currentPartner,
      documents: updatedDocuments,
      status: 'homologado',
      complianceScore: 100,
      lastAuditedBy: 'Equipe de Compliance Logística',
      lastAuditedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentPartner(updated);
    onUpdatePartner(updated);
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  const handleSaveAuditNotes = (notes: string) => {
    const updated: TransportPartner = {
      ...currentPartner,
      auditorNotes: notes,
      lastAuditedBy: 'Auditor Logístico',
      lastAuditedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentPartner(updated);
    onUpdatePartner(updated);
  };

  const handleGlobalStatusChange = (status: PartnerStatus) => {
    const updated: TransportPartner = {
      ...currentPartner,
      status,
      lastAuditedBy: 'Auditor Logístico',
      lastAuditedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentPartner(updated);
    onUpdatePartner(updated);
  };

  // Generate pending notifications copy for WhatsApp / Email
  const generatePendingMessage = () => {
    const rejectedDocs = docKeyList.filter(item => currentPartner.documents[item.key].status === 'reprovado');
    const missingDocs = docKeyList.filter(item => currentPartner.documents[item.key].isRequired && !currentPartner.documents[item.key].fileName);

    let message = `Olá, equipe da *${currentPartner.tradeName || currentPartner.companyName}*!\n\n`;
    message += `Estamos revisando seu processo de credenciamento e homologação (Protocolo: *${currentPartner.protocol}*).\n`;
    message += `Para prosseguirmos com a sua aprovação, identificamos os seguintes itens que necessitam de ajuste ou reenvio:\n\n`;

    if (rejectedDocs.length > 0) {
      message += `📌 *Documentos que precisam de correção:*\n`;
      rejectedDocs.forEach((d) => {
        const doc = currentPartner.documents[d.key];
        message += `• *${d.label}*: ${doc.notes || 'Necessário reenviar documento legível e atualizado'}\n`;
      });
      message += `\n`;
    }

    if (missingDocs.length > 0) {
      message += `📎 *Documentos ainda não enviados:*\n`;
      missingDocs.forEach((d) => {
        message += `• *${d.label}*\n`;
      });
      message += `\n`;
    }

    message += `Por favor, acesse o link de acompanhamento com seu número de protocolo e anexe os documentos solicitados:\n`;
    message += `Protocolo: *${currentPartner.protocol}*\n`;
    message += `Agradecemos a parceria e agilidade!\n— Departamento de Homologação & Compliance de Transportes`;

    return message;
  };

  const copyPendingMessage = () => {
    const text = generatePendingMessage();
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {currentPartner.companyName}
                </h2>
                <span className="text-xs font-mono bg-slate-800 text-emerald-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {currentPartner.protocol}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Nome Fantasia: <span className="text-slate-100 font-medium">{currentPartner.tradeName || 'N/A'}</span> • CNPJ: <span className="font-mono text-slate-200">{currentPartner.cnpj}</span> • Sede: {currentPartner.address.city}/{currentPartner.address.state}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header / Status & Compliance bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Status Atual</span>
              <div className="flex items-center space-x-2 mt-0.5">
                {currentPartner.status === 'homologado' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Homologado / Aprovado
                  </span>
                )}
                {currentPartner.status === 'em_analise' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Em Análise Documental
                  </span>
                )}
                {currentPartner.status === 'pendente_documento' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Pendente de Documento
                  </span>
                )}
                {currentPartner.status === 'rejeitado' && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Cadastro Rejeitado
                  </span>
                )}
              </div>
            </div>

            {/* Score gauge */}
            <div className="min-w-[180px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Conformidade Documental</span>
                <span className="font-bold text-slate-900">{currentPartner.complianceScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    currentPartner.complianceScore === 100 
                      ? 'bg-emerald-500' 
                      : currentPartner.complianceScore >= 70 
                        ? 'bg-blue-500' 
                        : currentPartner.complianceScore >= 40 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                  }`}
                  style={{ width: `${currentPartner.complianceScore}%` }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="text-xs text-slate-600 border-l border-slate-200 pl-4 hidden md:block">
              <div>RNTRC: <strong className="font-mono">{currentPartner.rntrc.number}</strong> ({currentPartner.rntrc.category}) - Validade: {currentPartner.rntrc.validUntil || 'N/A'}</div>
              <div>Raio de Atuação: <strong>{currentPartner.coverage.radiusKm} km</strong> em torno de {currentPartner.coverage.baseCity}/{currentPartner.coverage.baseState}</div>
            </div>
          </div>

          {/* Quick Actions in audit */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleApproveAll}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aprovar Todos Documentos</span>
            </button>

            <button
              onClick={copyPendingMessage}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Gera mensagem pré-formatada para WhatsApp/E-mail informando pendências"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Cobrar Pendências (WhatsApp)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          
          {feedbackSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Todos os documentos foram marcados como homologados e a pontuação foi atualizada para 100%!</span>
            </div>
          )}

          {/* Key Partner Info Tabs/Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Dados Bancários */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs uppercase tracking-wider mb-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Dados Bancários Cadastrados</span>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p><span className="text-slate-500">Banco:</span> {currentPartner.bankDetails.bankName} (Cód: {currentPartner.bankDetails.bankCode})</p>
                <p><span className="text-slate-500">Agência/Conta:</span> {currentPartner.bankDetails.agency} / {currentPartner.bankDetails.account} ({currentPartner.bankDetails.accountType})</p>
                <p><span className="text-slate-500">Chave PIX:</span> <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{currentPartner.bankDetails.pixKey}</span> ({currentPartner.bankDetails.pixKeyType})</p>
              </div>
            </div>

            {/* Seguro e RNTRC */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Seguro de Carga & ANTT</span>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p>
                  <span className="text-slate-500">RNTRC:</span> <strong className="font-mono">{currentPartner.rntrc.number}</strong> 
                  <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    currentPartner.rntrc.status === 'valido' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {currentPartner.rntrc.status === 'valido' ? 'Válido' : 'Vencido'}
                  </span>
                </p>
                <p><span className="text-slate-500">Seguradora:</span> {currentPartner.insurance?.hasInsurance ? currentPartner.insurance.insurer : 'Não informada / Apólice própria'}</p>
                <p><span className="text-slate-500">Vigência Apólice:</span> {currentPartner.insurance?.validUntil || 'Sem seguro cadastrado'}</p>
              </div>
            </div>

            {/* Contatos & Assinatura */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs uppercase tracking-wider mb-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Contato & Assinatura Eletrônica</span>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p><span className="text-slate-500">Responsável:</span> {currentPartner.contacts[0]?.name || currentPartner.legalRepresentative.fullName}</p>
                <p><span className="text-slate-500">Telefone:</span> {currentPartner.contacts[0]?.phone || 'N/A'}</p>
                <p><span className="text-slate-500">E-mail Contrato:</span> <strong className="text-emerald-700">{currentPartner.electronicSignatureEmail}</strong></p>
              </div>
            </div>
          </div>

          {/* Checklist of 12 Required Documents */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900/5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Auditoria dos 12 Documentos Cadastrais
                </h3>
                <p className="text-xs text-slate-500">
                  Avalie individualmente a conformidade de cada documento exigido no credenciamento
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Aprovados: {Object.values(currentPartner.documents).filter(d => d.status === 'aprovado').length} de 12
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {docKeyList.map((item) => {
                const doc = currentPartner.documents[item.key];
                const isRejecting = rejectingDocKey === item.key;

                return (
                  <div key={item.key} className="p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      
                      {/* Left: Info */}
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {item.number}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {item.label}
                            </h4>
                            {doc.isRequired ? (
                              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                Obrigatório
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                Opcional
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                              {doc.category}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.desc}
                          </p>

                          {/* File info OR Fill-only declared value */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            {item.isFillOnly ? (
                              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                                <span className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Dado Declarado no Cadastro:
                                </span>
                                <span className="text-slate-800 text-xs font-semibold">
                                  {item.key === 'stateRegistrationProof' && (
                                    currentPartner.isStateRegistrationExempt 
                                      ? 'ISENTO de Inscrição Estadual' 
                                      : (currentPartner.stateRegistration || 'Não informado')
                                  )}
                                  {item.key === 'citiesCoverageList' && (
                                    currentPartner.coverage?.citiesServed?.length > 0
                                      ? currentPartner.coverage.citiesServed.join(', ')
                                      : 'Nenhuma cidade informada'
                                  )}
                                  {item.key === 'contactsSheet' && (
                                    currentPartner.contacts?.length > 0 
                                      ? currentPartner.contacts.map(c => `${c.name} (${c.role}) • Tel: ${c.phone} • E-mail: ${c.email}`).join(' | ')
                                      : 'Nenhum contato informado'
                                  )}
                                  {item.key === 'electronicSignatureDoc' && (
                                    currentPartner.electronicSignatureEmail || 'Nenhum e-mail informado'
                                  )}
                                </span>
                              </div>
                            ) : (
                              <>
                                {doc.fileName ? (
                                  <div className="flex items-center space-x-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="font-medium font-mono text-[11px] truncate max-w-xs">{doc.fileName}</span>
                                    {doc.fileSize && <span className="text-slate-400 text-[10px]">({doc.fileSize})</span>}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">Nenhum arquivo anexado</span>
                                )}

                                {doc.documentNumber && (
                                  <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                    Nº: <strong className="font-mono">{doc.documentNumber}</strong>
                                  </span>
                                )}

                                {doc.expiryDate && (
                                  <span className={`text-[11px] px-2 py-0.5 rounded border ${
                                    new Date(doc.expiryDate) < new Date()
                                      ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    Vencimento: {doc.expiryDate} {new Date(doc.expiryDate) < new Date() && '(VENCIDO)'}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          {/* Status notes / rejection message */}
                          {doc.notes && (
                            <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start space-x-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span><strong>Parecer do Auditor:</strong> {doc.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status badge & Action buttons */}
                      <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                        
                        {/* Current Status Badge */}
                        <div className="mr-2">
                          {doc.status === 'aprovado' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Aprovado
                            </span>
                          )}
                          {doc.status === 'em_analise' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                              <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              Em Análise
                            </span>
                          )}
                          {doc.status === 'reprovado' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              Pendente / Reprovado
                            </span>
                          )}
                          {doc.status === 'pendente' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                              Não Enviado
                            </span>
                          )}
                        </div>

                        {/* Action: Approve */}
                        <button
                          onClick={() => handleSetDocStatus(item.key, 'aprovado', 'Documento auditado e aprovado em conformidade.')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer ${
                            doc.status === 'aprovado'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                          }`}
                          title="Aprovar documento"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </button>

                        {/* Action: Reject / Request Correction */}
                        <button
                          onClick={() => handleOpenReject(item.key, doc.notes)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer ${
                            doc.status === 'reprovado'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                          }`}
                          title="Apontar pendência ou reprovar"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Apontar Pendência</span>
                        </button>

                        {/* Action: View / Download */}
                        {!item.isFillOnly && doc.fileName && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Visualizar documento"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline rejection prompt */}
                    {isRejecting && (
                      <div className="mt-3 p-3 bg-rose-50/80 border border-rose-200 rounded-xl">
                        <label className="block text-xs font-bold text-rose-900 mb-1">
                          Descreva o motivo da pendência / reprovação deste documento:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ex: Documento ilegível, certidão vencida em XX/XX, falta assinatura dos sócios..."
                            className="flex-1 text-xs px-3 py-1.5 border border-rose-300 rounded-lg focus:outline-emerald-500 bg-white"
                          />
                          <button
                            onClick={() => handleConfirmReject(item.key)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Confirmar Pendência
                          </button>
                          <button
                            onClick={() => setRejectingDocKey(null)}
                            className="px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Conclusion and Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Parecer Final do Auditor & Decisão de Homologação
            </h3>
            
            <textarea
              rows={3}
              value={currentPartner.auditorNotes || ''}
              onChange={(e) => handleSaveAuditNotes(e.target.value)}
              placeholder="Digite aqui anotações internas da equipe de compliance sobre o transportador, capacidade operacional, histórico de sinistros..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-emerald-500 text-slate-800"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700">Alterar Status Geral:</span>
                <button
                  onClick={() => handleGlobalStatusChange('homologado')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    currentPartner.status === 'homologado'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  Homologado
                </button>

                <button
                  onClick={() => handleGlobalStatusChange('em_analise')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    currentPartner.status === 'em_analise'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  Em Análise
                </button>

                <button
                  onClick={() => handleGlobalStatusChange('pendente_documento')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    currentPartner.status === 'pendente_documento'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  Pendente de Doc
                </button>

                <button
                  onClick={() => handleGlobalStatusChange('rejeitado')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    currentPartner.status === 'rejeitado'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  Rejeitado
                </button>
              </div>

              <div className="text-xs text-slate-500">
                {currentPartner.lastAuditedAt && (
                  <span>Última auditoria em: {new Date(currentPartner.lastAuditedAt).toLocaleString('pt-BR')} por {currentPartner.lastAuditedBy || 'Equipe'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Todas as alterações são salvas automaticamente no banco de dados.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
          >
            Concluir & Fechar Auditoria
          </button>
        </div>

        {/* Document Preview Lightbox Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{previewDoc.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{previewDoc.fileName}</p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulated Document Viewer */}
              <div className="my-6 p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                <FileText className="w-16 h-16 text-emerald-600 mb-3" />
                <h5 className="font-semibold text-slate-800 text-sm">{previewDoc.name}</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Arquivo: <span className="font-mono">{previewDoc.fileName}</span> ({previewDoc.fileSize || '380 KB'})
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Enviado em: {previewDoc.uploadedAt ? new Date(previewDoc.uploadedAt).toLocaleString('pt-BR') : 'Hoje'}
                </p>

                <div className="mt-4 flex gap-3">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Download simulado do arquivo: ${previewDoc.fileName}`);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo Completo</span>
                  </a>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg"
                >
                  Fechar Visualizador
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

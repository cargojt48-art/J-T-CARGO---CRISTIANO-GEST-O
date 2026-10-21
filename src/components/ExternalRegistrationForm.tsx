import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Shield, 
  UserCheck, 
  Mail, 
  Phone, 
  Truck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Copy, 
  AlertCircle,
  HelpCircle,
  Plus,
  X
} from 'lucide-react';
import { TransportPartner, DocumentItem } from '../types';
import { 
  BRAZIL_CITIES, 
  BRAZIL_STATES, 
  findCityCoords, 
  getCitiesByState, 
  STATE_COORDINATES 
} from '../data/brazilCities';

interface ExternalRegistrationFormProps {
  onRegisterSuccess: (partner: TransportPartner) => void;
  onGoToDashboard: () => void;
  onGoToMap: () => void;
}

export const ExternalRegistrationForm: React.FC<ExternalRegistrationFormProps> = ({
  onRegisterSuccess,
  onGoToDashboard,
  onGoToMap,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState<boolean>(false);

  // Form State
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [stateRegistration, setStateRegistration] = useState('');
  const [isStateRegistrationExempt, setIsStateRegistrationExempt] = useState(false);
  
  // Representante Legal
  const [repName, setRepName] = useState('');
  const [repCpf, setRepCpf] = useState('');
  const [repRg, setRepRg] = useState('');
  const [repRole, setRepRole] = useState('Sócio-Administrador');
  const [signatureEmail, setSignatureEmail] = useState('');

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');

  // RNTRC
  const [rntrcNumber, setRntrcNumber] = useState('');
  const [rntrcCategory, setRntrcCategory] = useState<'ETC' | 'TAC' | 'CTC'>('ETC');
  const [rntrcValidUntil, setRntrcValidUntil] = useState('2028-10-20');

  // Dados Bancários
  const [bankName, setBankName] = useState('Banco Itaú');
  const [bankCode, setBankCode] = useState('341');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [accountType, setAccountType] = useState<'corrente' | 'poupanca'>('corrente');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cnpj' | 'email' | 'telefone' | 'aleatoria'>('cnpj');

  // Seguro (opcional)
  const [hasInsurance, setHasInsurance] = useState(true);
  const [insurer, setInsurer] = useState('Porto Seguro Cargas');
  const [policyNumber, setPolicyNumber] = useState('PS-2026-9921');
  const [insuranceValidUntil, setInsuranceValidUntil] = useState('2027-06-30');

  // Abrangência e Operação
  const [baseState, setBaseState] = useState('ES');
  const [baseCity, setBaseCity] = useState('Vila Velha');
  const [radiusKm, setRadiusKm] = useState<number>(350);
  const [statesServed, setStatesServed] = useState<string[]>(['ES']);
  const [activeCityStateTab, setActiveCityStateTab] = useState<string>('ES');
  const [selectedCities, setSelectedCities] = useState<string[]>(['Vila Velha', 'Vitória', 'Serra', 'Cariacica']);
  const [customCityInput, setCustomCityInput] = useState<string>('');
  const [citiesServedInput, setCitiesServedInput] = useState('Vila Velha, Vitória, Serra, Cariacica');
  const [operationTypes, setOperationTypes] = useState<string[]>(['lotacao', 'fracionado']);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['toco_truck', 'carreta_ls']);

  // Helpers para seleção dinâmica de cidades por estado
  const handleBaseStateChange = (newUf: string) => {
    setBaseState(newUf);
    setActiveCityStateTab(newUf);
    if (!statesServed.includes(newUf)) {
      setStatesServed(prev => [...prev, newUf]);
    }
    const stateCities = getCitiesByState(newUf);
    if (stateCities.length > 0) {
      setBaseCity(stateCities[0].name);
    }
  };

  const handleToggleCity = (cityName: string) => {
    let next: string[];
    if (selectedCities.includes(cityName)) {
      next = selectedCities.filter(c => c !== cityName);
    } else {
      next = [...selectedCities, cityName];
    }
    setSelectedCities(next);
    setCitiesServedInput(next.join(', '));
  };

  const handleAddCustomCity = () => {
    const trimmed = customCityInput.trim();
    if (!trimmed) return;
    if (!selectedCities.includes(trimmed)) {
      const next = [...selectedCities, trimmed];
      setSelectedCities(next);
      setCitiesServedInput(next.join(', '));
    }
    setCustomCityInput('');
  };

  const handleSelectAllStateCities = (uf: string) => {
    const stateCities = getCitiesByState(uf).map(c => c.name);
    const set = new Set([...selectedCities, ...stateCities]);
    const next = Array.from(set);
    setSelectedCities(next);
    setCitiesServedInput(next.join(', '));
  };

  const handleClearStateCities = (uf: string) => {
    const stateCities = getCitiesByState(uf).map(c => c.name);
    const next = selectedCities.filter(c => !stateCities.includes(c));
    setSelectedCities(next);
    setCitiesServedInput(next.join(', '));
  };

  // Contatos
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Gerente Operacional');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Documentos Anexados
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: { name: string; size: string } }>({});

  // Helper to simulate or handle file upload
  const handleFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [docKey]: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        },
      }));
    }
  };


  const handleStateServedToggle = (uf: string) => {
    if (statesServed.includes(uf)) {
      setStatesServed(statesServed.filter(s => s !== uf));
    } else {
      setStatesServed([...statesServed, uf]);
    }
  };

  const handleOperationTypeToggle = (type: string) => {
    if (operationTypes.includes(type)) {
      setOperationTypes(operationTypes.filter(t => t !== type));
    } else {
      setOperationTypes([...operationTypes, type]);
    }
  };

  const handleVehicleTypeToggle = (type: string) => {
    if (vehicleTypes.includes(type)) {
      setVehicleTypes(vehicleTypes.filter(t => t !== type));
    } else {
      setVehicleTypes([...vehicleTypes, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate Protocol
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const protocol = `TRP-2026-${randomNum}`;
    const id = `ptn-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const coords = findCityCoords(baseCity, baseState);

    const parsedCities = citiesServedInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const makeDoc = (
      docKey: string, 
      name: string, 
      category: string, 
      isRequired: boolean, 
      extra?: { docNum?: string; expiry?: string }
    ): DocumentItem => {
      const up = uploadedFiles[docKey];
      return {
        id: `doc-${docKey}-${Date.now()}`,
        name,
        category,
        fileName: up ? up.name : '',
        fileSize: up ? up.size : '',
        fileType: 'application/pdf',
        uploadedAt: up ? nowIso : undefined,
        status: up ? 'em_analise' : (isRequired ? 'pendente' : 'em_analise'),
        isRequired,
        documentNumber: extra?.docNum,
        expiryDate: extra?.expiry,
      };
    };

    const newPartner: TransportPartner = {
      id,
      protocol,
      createdAt: nowIso,
      updatedAt: nowIso,
      cnpj: cnpj || '00.000.000/0001-00',
      companyName: companyName || 'Transportadora Sem Razão Social',
      tradeName: tradeName || companyName,
      stateRegistration: isStateRegistrationExempt ? 'ISENTO' : (stateRegistration || 'Não informada'),
      isStateRegistrationExempt,
      address: {
        street: street || 'Endereço Principal',
        number: number || 'S/N',
        complement,
        district: district || 'Centro',
        city: city || baseCity,
        state: state || baseState,
        zipCode: zipCode || '00000-000',
      },
      legalRepresentative: {
        fullName: repName || 'Representante Legal',
        cpf: repCpf || '000.000.000-00',
        rg: repRg || '00.000.000',
        rgEmitter: 'SSP',
        role: repRole || 'Sócio',
      },
      rntrc: {
        number: rntrcNumber || '00000000',
        category: rntrcCategory,
        validUntil: rntrcValidUntil || '2028-12-31',
        status: 'valido',
      },
      bankDetails: {
        bankName: bankName || 'Banco Principal',
        bankCode: bankCode || '000',
        agency: agency || '0000',
        account: account || '00000-0',
        accountType,
        pixKey: pixKey || cnpj,
        pixKeyType,
        proofFileName: uploadedFiles['bankProof']?.name,
      },
      insurance: {
        hasInsurance,
        insurer: hasInsurance ? insurer : '',
        policyNumber: hasInsurance ? policyNumber : '',
        validUntil: hasInsurance ? insuranceValidUntil : '',
      },
      coverage: {
        baseCity,
        baseState,
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: Number(radiusKm) || 300,
        statesServed: statesServed.length > 0 ? statesServed : [baseState],
        citiesServed: parsedCities.length > 0 ? parsedCities : [baseCity],
        operationTypes: operationTypes as any,
        vehicleTypes: vehicleTypes as any,
      },
      contacts: [
        {
          name: contactName || repName,
          role: contactRole,
          phone: contactPhone,
          email: contactEmail || signatureEmail,
          isWhatsApp: true,
        },
      ],
      electronicSignatureEmail: signatureEmail || contactEmail,
      documents: {
        cnpjCard: makeDoc('cnpjCard', 'Cartão do CNPJ', 'Fiscal', true, { docNum: cnpj }),
        socialContract: makeDoc('socialContract', 'Contrato Social e Alterações', 'Societário', true),
        legalRepDocument: makeDoc('legalRepDocument', 'Documento do Representante Legal (RG e CPF)', 'Identificação', true),
        addressProof: makeDoc('addressProof', 'Comprovante de Endereço da Empresa', 'Cadastral', true),
        rntrcCertificate: makeDoc('rntrcCertificate', 'RNTRC Válido (ANTT)', 'Regulatório', true, { docNum: rntrcNumber, expiry: rntrcValidUntil }),
        bankProof: makeDoc('bankProof', 'Dados Bancários da Empresa', 'Financeiro', true),
        insurancePolicy: makeDoc('insurancePolicy', 'Apólice de Seguro Vigente (RCTR-C / RC-DC)', 'Seguros', false, { docNum: policyNumber, expiry: insuranceValidUntil }),
        stateRegistrationProof: {
          id: `doc-stateRegistrationProof-${Date.now()}`,
          name: 'Inscrição Estadual (IE)',
          category: 'Fiscal',
          fileName: isStateRegistrationExempt ? 'Isento de Inscrição Estadual' : `IE: ${stateRegistration}`,
          status: 'aprovado',
          isRequired: false,
          documentNumber: isStateRegistrationExempt ? 'ISENTO' : stateRegistration,
          notes: isStateRegistrationExempt ? 'Empresa declarada isenta de Inscrição Estadual' : `Inscrição Estadual informada: ${stateRegistration}`,
        },
        citiesCoverageList: {
          id: `doc-citiesCoverageList-${Date.now()}`,
          name: 'Lista de Cidades Cobertas',
          category: 'Operacional',
          fileName: `${parsedCities.length} cidades cadastradas`,
          status: 'aprovado',
          isRequired: false,
          notes: `Malha atendida informada: ${parsedCities.join(', ')}`,
        },
        contactsSheet: {
          id: `doc-contactsSheet-${Date.now()}`,
          name: 'Informações de Contato dos Responsáveis',
          category: 'Operacional',
          fileName: `${contactName || repName} (${contactRole})`,
          status: 'aprovado',
          isRequired: false,
          notes: `Responsável: ${contactName || repName} | Tel: ${contactPhone} | E-mail: ${contactEmail || signatureEmail}`,
        },
        electronicSignatureDoc: {
          id: `doc-electronicSignatureDoc-${Date.now()}`,
          name: 'E-mail para Assinatura Eletrônica do Contrato',
          category: 'Jurídico',
          fileName: signatureEmail || contactEmail,
          status: 'aprovado',
          isRequired: false,
          notes: `E-mail cadastrado para assinatura digital: ${signatureEmail || contactEmail}`,
        },
        sampleNfeCte: makeDoc('sampleNfeCte', 'Exemplo de NF-e e/ou CT-e Emitido', 'Fiscal', true),
      },
      status: 'em_analise',
      complianceScore: 50,
      auditorNotes: 'Inscrição submetida pelo transportador via link externo público. Documentos em fila de auditoria.',
    };

    onRegisterSuccess(newPartner);
    setSubmittedProtocol(protocol);
  };

  const copyProtocol = () => {
    if (submittedProtocol) {
      navigator.clipboard.writeText(submittedProtocol);
      setCopiedProtocol(true);
      setTimeout(() => setCopiedProtocol(false), 2500);
    }
  };

  // If already submitted, display celebratory success screen with next actions
  if (submittedProtocol) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 sm:p-12 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inscrição Realizada com Sucesso!
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            Seus dados cadastrais e documentos foram transmitidos em segurança para a nossa mesa de compliance e homologação logística.
          </p>

          {/* Protocol Card */}
          <div className="my-8 p-6 bg-slate-900 text-white rounded-2xl max-w-md mx-auto shadow-xl border border-slate-800">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Número do seu Protocolo
            </span>
            <div className="text-3xl font-mono font-bold text-white mt-1 tracking-wider">
              {submittedProtocol}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Guarde este protocolo para consultar o andamento da análise documental ou enviar correções.
            </p>

            <button
              onClick={copyProtocol}
              className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {copiedProtocol ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Protocolo Copiado para a Área de Transferência!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Número de Protocolo</span>
                </>
              )}
            </button>
          </div>

          {/* Next steps explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-xl mx-auto mb-8 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>O que acontece agora?</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li>1. <strong>Auditoria de Documentos:</strong> Nossa equipe irá checar CNPJ, RNTRC na ANTT, e apólice de carga em até 24h úteis.</li>
              <li>2. <strong>Minuta Contratual:</strong> O contrato de prestação de serviços logísticos será enviado para o e-mail: <strong className="text-slate-800">{signatureEmail || 'informado no cadastro'}</strong> para assinatura eletrônica.</li>
              <li>3. <strong>Homologação no Mapa:</strong> Após aprovação dos 12 requisitos, sua transportadora passa a constar ativa na malha e pronta para carregamento.</li>
            </ul>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onGoToDashboard}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Ir para o Dashboard de Auditoria &rarr;
            </button>

            <button
              onClick={onGoToMap}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Ver Cobertura no Mapa &rarr;
            </button>

            <button
              onClick={() => {
                setSubmittedProtocol(null);
                setCurrentStep(1);
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cadastrar Outro Prestador
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Truck className="w-3.5 h-3.5" />
              <span>Formulário Externo de Credenciamento</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Inscrição de Transportadores & Prestadores de Serviço
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Cadastre sua empresa, informe seu raio de abrangência geográfica e anexe os documentos comprobatórios necessários para homologação de rotas e contratos de frete.
            </p>
          </div>

        </div>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { step: 1, label: '1. Identificação & IE' },
          { step: 2, label: '2. RNTRC & Banco' },
          { step: 3, label: '3. Abrangência & Contatos' },
          { step: 4, label: '4. Documentos Anexos' },
        ].map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setCurrentStep(item.step)}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              currentStep === item.step
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : currentStep > item.step
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[11px] font-bold truncate">{item.label}</div>
            <div className="text-[9px] text-slate-400 mt-0.5 hidden sm:block">
              {item.step === 1 && 'CNPJ, IE & Assinatura'}
              {item.step === 2 && 'ANTT, Endereço & Conta'}
              {item.step === 3 && 'Cidades, Frota & Contatos'}
              {item.step === 4 && '8 Uploads Comprobatórios'}
            </div>
          </button>
        ))}
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* STEP 1: Dados da Empresa & Representante */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Passo 1: Dados da Empresa & Representante Legal</span>
              </h3>
              <p className="text-xs text-slate-500">
                Informações cadastrais oficiais constantes no Cartão do CNPJ e Contrato Social
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cartão do CNPJ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <span>8. Inscrição Estadual (IE) *</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">Preenchimento</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={isStateRegistrationExempt}
                    placeholder={isStateRegistrationExempt ? 'ISENTO' : 'Ex: 114.882.930.119'}
                    value={isStateRegistrationExempt ? 'ISENTO' : stateRegistration}
                    onChange={(e) => setStateRegistration(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-slate-100"
                  />
                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isStateRegistrationExempt}
                      onChange={(e) => setIsStateRegistrationExempt(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Isento</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razão Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome empresarial conforme Contrato Social"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  placeholder="Como a transportadora é conhecida no mercado"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Representante Legal */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Documento de Identificação do Representante Legal (RG e CPF)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo do Representante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do sócio / administrador"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CPF do Representante *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={repCpf}
                    onChange={(e) => setRepCpf(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RG do Representante *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000-0 SSP/UF"
                    value={repRg}
                    onChange={(e) => setRepRg(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* 11. E-mail para Assinatura Eletrônica do Contrato */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>11. E-mail para Assinatura Eletrônica do Contrato *</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Preenchimento Cadastral</span>
              </div>
              <p className="text-[11px] text-emerald-800 mb-2">
                Este e-mail receberá os links oficiais para assinatura eletrônica do contrato (DocuSign/ClickSign). Não requer anexo de arquivo.
              </p>
              <input
                type="email"
                required
                placeholder="exemplo: juridico@transportadora.com.br ou diretor@transportadora.com.br"
                value={signatureEmail}
                onChange={(e) => setSignatureEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Avançar para RNTRC & Dados Bancários</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RNTRC, Endereço & Dados Bancários */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Passo 2: RNTRC (ANTT), Endereço da Empresa & Dados Bancários</span>
              </h3>
              <p className="text-xs text-slate-500">
                Informações para emissão de CT-e, validação regulatória perante a ANTT e repasses financeiros
              </p>
            </div>

            {/* RNTRC */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>RNTRC Válido (ANTT)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número do RNTRC *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 48921045"
                    value={rntrcNumber}
                    onChange={(e) => setRntrcNumber(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria ANTT *</label>
                  <select
                    value={rntrcCategory}
                    onChange={(e) => setRntrcCategory(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="ETC">ETC - Empresa de Transporte de Cargas</option>
                    <option value="TAC">TAC - Transportador Autônomo de Cargas</option>
                    <option value="CTC">CTC - Cooperativa de Transporte de Cargas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Validade do RNTRC *</label>
                  <input
                    type="date"
                    required
                    value={rntrcValidUntil}
                    onChange={(e) => setRntrcValidUntil(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Endereço da Empresa */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Comprovante de Endereço da Empresa</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro / Avenida / Rodovia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Presidente Wilson"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número & Complemento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1400, Galpão B"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bairro"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade da Sede *</label>
                  <input
                    type="text"
                    required
                    placeholder="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF) *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {BRAZIL_STATES.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Dados Bancários da Empresa (Conta PJ vinculada ao CNPJ)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banco *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Itaú, Bradesco, Banco do Brasil"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agência (com dígito) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 0342"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Conta Corrente (com dígito) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 89102-4"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chave PIX da Empresa *</label>
                  <div className="flex gap-2">
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value as any)}
                      className="text-xs px-2.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Telefone</option>
                      <option value="aleatoria">Aleatória</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Chave PIX para pagamento de frete"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Avançar para Abrangência & Seguro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Abrangência Operacional, Cidades & Seguro */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Passo 3: Área de Abrangência Geográfica, Cidades & Apólice de Seguro</span>
              </h3>
              <p className="text-xs text-slate-500">
                Defina onde sua empresa opera e seu raio de atendimento para visualização em nosso mapa logístico
              </p>
            </div>

            {/* Base e Raio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estado Polo (UF) *</label>
                <select
                  value={baseState}
                  onChange={(e) => handleBaseStateChange(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {BRAZIL_STATES.map(uf => (
                    <option key={uf} value={uf}>{uf} - {STATE_COORDINATES[uf]?.name || uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cidade Polo / Base Operacional *</label>
                <select
                  value={baseCity}
                  onChange={(e) => setBaseCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {getCitiesByState(baseState).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                  {!getCitiesByState(baseState).some(c => c.name === baseCity) && baseCity && (
                    <option value={baseCity}>{baseCity}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Raio de Atuação Operacional: <strong className="text-emerald-600">{radiusKm} km</strong>
                </label>
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="range"
                    min={50}
                    max={1200}
                    step={25}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                    {radiusKm} km
                  </span>
                </div>
              </div>
            </div>

            {/* Estados Atendidos (Seleção de múltiplos estados de atuação) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Estados Atendidos (Marque todos onde sua transportadora atua):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BRAZIL_STATES.map((uf) => {
                  const isChecked = statesServed.includes(uf);
                  return (
                    <button
                      key={uf}
                      type="button"
                      onClick={() => handleStateServedToggle(uf)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {uf}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9. Lista das Cidades Atendidas / Cobertas (Seleção Dinâmica e Clicável) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>9. Lista das Cidades Atendidas / Cobertas</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Selecione o estado e clique diretamente nas cidades atendidas para adicioná-las ou removê-las
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded self-start sm:self-auto">
                  Seleção Interativa de Cidades
                </span>
              </div>

              {/* Abas dos estados atendidos */}
              <div className="flex items-center space-x-1 border-b border-slate-200 pb-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 mr-2 shrink-0">Estado ativo:</span>
                {(statesServed.length > 0 ? statesServed : [baseState]).map((uf) => (
                  <button
                    key={uf}
                    type="button"
                    onClick={() => setActiveCityStateTab(uf)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeCityStateTab === uf
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {uf} ({STATE_COORDINATES[uf]?.name || uf})
                  </button>
                ))}
              </div>

              {/* Botões rápidos e Cidades Clicáveis daquele Estado */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Cidades de <strong>{STATE_COORDINATES[activeCityStateTab]?.name || activeCityStateTab} ({activeCityStateTab})</strong>:
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllStateCities(activeCityStateTab)}
                      className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      + Marcar Todas de {activeCityStateTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearStateCities(activeCityStateTab)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Desmarcar {activeCityStateTab}
                    </button>
                  </div>
                </div>

                {/* Grade de cidades clicáveis */}
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-3 bg-white border border-slate-200 rounded-xl">
                  {getCitiesByState(activeCityStateTab).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma cidade pré-cadastrada para este estado. Utilize o campo abaixo para adicionar.</p>
                  ) : (
                    getCitiesByState(activeCityStateTab).map((city) => {
                      const isSelected = selectedCities.includes(city.name);
                      return (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => handleToggleCity(city.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{city.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Campo para Adicionar Outro Bairro ou Cidade (Ex: Ulisses Guimarães, Praia da Costa, etc.) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adicionar outra cidade, polo ou bairro específico:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Ulisses Guimarães, Praia da Costa, Polo Industrial..."
                    value={customCityInput}
                    onChange={(e) => setCustomCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCity();
                      }
                    }}
                    className="flex-1 text-xs px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCity}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Lista Visual das Cidades Selecionadas */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Cidades Cobertas Selecionadas (<strong className="text-emerald-600">{selectedCities.length}</strong>):
                  </span>
                  {selectedCities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCities([]);
                        setCitiesServedInput('');
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Limpar Todas
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl">
                  {selectedCities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">Nenhuma cidade selecionada. Clique nas cidades acima para montar sua malha.</p>
                  ) : (
                    selectedCities.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleCity(c)}
                          className="text-emerald-700 hover:text-rose-600 ml-1 p-0.5 rounded-full hover:bg-emerald-100"
                          title={`Remover ${c}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Tipos de Veículos da Frota */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tipos de Veículos Disponíveis na Frota:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'fiorino_vuc', label: 'Utilitários / VUC / Fiorino' },
                  { id: 'toco_truck', label: 'Toco / Truck (3/4 e Pesado)' },
                  { id: 'carreta_ls', label: 'Carreta / Cavalo Mecânico LS' },
                  { id: 'bitrem_rodotrem', label: 'Bitrem / Rodotrem / Graneleiro' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleVehicleTypeToggle(item.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      vehicleTypes.includes(item.id)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apólice(s) de Seguro Vigente(s) (opcional) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Apólice(s) de Seguro Vigente(s) (RCTR-C / RC-DC)</span>
                    <span className="text-[10px] font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Opcional</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Caso sua empresa já possua apólice própria averbada para transporte rodoviário de cargas
                  </p>
                </div>
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInsurance}
                    onChange={(e) => setHasInsurance(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Possuo Seguro Próprio</span>
                </label>
              </div>

              {hasInsurance && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Companhia Seguradora</label>
                    <input
                      type="text"
                      placeholder="Ex: Porto Seguro, Tokio Marine, Sompo, Mapfre"
                      value={insurer}
                      onChange={(e) => setInsurer(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número da Apólice</label>
                    <input
                      type="text"
                      placeholder="Número da Apólice"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Validade da Apólice</label>
                    <input
                      type="date"
                      value={insuranceValidUntil}
                      onChange={(e) => setInsuranceValidUntil(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 10. Informações de Contato dos Responsáveis (Preenchimento) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>10. Informações de Contato dos Responsáveis</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Contatos operacionais, comercial e plantão 24h para agendamentos e chamados de carga (Preenchimento direto)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Preenchimento Cadastral
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Departamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Operações / Plantão"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Operacional *</label>
                  <input
                    type="email"
                    required
                    placeholder="operacional@empresa.com.br"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Avançar para Anexo de Documentos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Upload dos 8 Documentos Comprobatórios */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Passo 4: Anexo de Documentos Comprobatórios</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Faça o upload dos 8 documentos em formato PDF, PNG, JPG ou XML.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl shrink-0">
                8 Documentos para Anexo
              </span>
            </div>

            {/* Banner explicativo: itens preenchidos sem necessidade de anexo */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950">
              <div className="font-bold mb-1.5 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Itens com Preenchimento Concluído (Sem necessidade de anexo de arquivo):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <strong className="text-slate-800 block">8. Inscrição Estadual:</strong>
                  <span className="text-slate-600">{isStateRegistrationExempt ? 'Isento' : (stateRegistration || 'Preenchida no Passo 1')}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <strong className="text-slate-800 block">9. Cidades Cobertas:</strong>
                  <span className="text-slate-600 truncate block">{citiesServedInput ? 'Cidades informadas' : 'Preenchida no Passo 3'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <strong className="text-slate-800 block">10. Contatos dos Responsáveis:</strong>
                  <span className="text-slate-600 truncate block">{contactName ? `${contactName} (${contactRole})` : 'Informado no Passo 3'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <strong className="text-slate-800 block">11. E-mail de Assinatura:</strong>
                  <span className="text-slate-600 truncate block">{signatureEmail || 'Informado no Passo 1'}</span>
                </div>
              </div>
            </div>

            {/* Document upload grid: apenas os 8 documentos que exigem arquivos anexos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'cnpjCard', label: '1. Cartão do CNPJ', req: true, desc: 'Comprovante recente emitido no site da Receita' },
                { key: 'socialContract', label: '2. Contrato Social e suas alterações', req: true, desc: 'Última alteração consolidada registrada em Junta' },
                { key: 'legalRepDocument', label: '3. Documento do Representante Legal (RG e CPF)', req: true, desc: 'Ou CNH em arquivo legível' },
                { key: 'addressProof', label: '4. Comprovante de endereço da empresa', req: true, desc: 'Conta de água, luz ou telefone recente (< 60 dias)' },
                { key: 'rntrcCertificate', label: '5. RNTRC válido (ANTT)', req: true, desc: 'Certidão ou cartão do transportador emitido na ANTT' },
                { key: 'bankProof', label: '6. Dados bancários da empresa', req: true, desc: 'Comprovante de conta corrente ou declaração do banco' },
                { key: 'insurancePolicy', label: '7. Apólice(s) de seguro vigente(s)', req: false, desc: 'RCTR-C / RC-DC (Opcional)' },
                { key: 'sampleNfeCte', label: '12. Exemplo de NF-e e/ou CT-e emitido pela empresa', req: true, desc: 'Conhecimento de transporte eletrônico ou nota fiscal recente' },
              ].map((item) => {
                const uploaded = uploadedFiles[item.key];

                return (
                  <div 
                    key={item.key} 
                    className={`p-4 rounded-2xl border transition-all ${
                      uploaded 
                        ? 'bg-emerald-50/50 border-emerald-300' 
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                          {item.req ? (
                            <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              Obrigatório
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                              Opcional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>

                      {uploaded && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </div>

                    {/* Upload button / selected file info */}
                    <div className="mt-3">
                      {uploaded ? (
                        <div className="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                          <div className="flex items-center space-x-1.5 text-slate-700 truncate mr-2">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-mono text-[11px] font-medium truncate">{uploaded.name}</span>
                            <span className="text-slate-400 text-[10px]">({uploaded.size})</span>
                          </div>
                          <label className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer shrink-0">
                            Substituir
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(item.key, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-white rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-all cursor-pointer">
                          <UploadCloud className="w-4 h-4 text-slate-400" />
                          <span>Selecionar Arquivo PDF / Imagem</span>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(item.key, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Terms and Submission button */}
            <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600 space-y-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input type="checkbox" required defaultChecked className="mt-0.5 rounded text-emerald-600" />
                <span>
                  Declaro que as informações cadastrais e documentos anexados são autênticos e correspondem às operações fiscais da nossa empresa, concordando com a checagem regulatória perante a ANTT e Receita Federal.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enviar Inscrição & Gerar Protocolo</span>
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};

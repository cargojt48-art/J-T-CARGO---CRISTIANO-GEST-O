export type DocStatus = 'pendente' | 'aprovado' | 'reprovado' | 'em_analise';

export type PartnerStatus = 'em_analise' | 'homologado' | 'pendente_documento' | 'rejeitado';

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: DocStatus;
  notes?: string;
  isRequired: boolean;
  expiryDate?: string;
  documentNumber?: string;
}

export interface ContactPerson {
  name: string;
  role: string;
  phone: string;
  email: string;
  isWhatsApp: boolean;
}

export interface BankData {
  bankName: string;
  bankCode: string;
  agency: string;
  account: string;
  accountType: 'corrente' | 'poupanca';
  pixKey: string;
  pixKeyType: 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  proofFileName?: string;
  proofFileUrl?: string;
}

export interface CoverageArea {
  baseCity: string;
  baseState: string;
  lat: number;
  lng: number;
  radiusKm: number;
  statesServed: string[];
  citiesServed: string[];
  operationTypes: ('lotacao' | 'fracionado' | 'distribuicao_urbana' | 'refrigerado' | 'dedicado')[];
  vehicleTypes: ('fiorino_vuc' | 'toco_truck' | 'carreta_ls' | 'bitrem_rodotrem')[];
}

export interface TransportPartner {
  id: string;
  protocol: string;
  createdAt: string;
  updatedAt: string;
  
  // 1. CNPJ e Razão
  cnpj: string;
  companyName: string;
  tradeName: string;
  openingDate?: string;
  
  // 2. Inscrição Estadual
  stateRegistration: string;
  isStateRegistrationExempt: boolean;
  
  // 3. Endereço
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // 4. Representante Legal
  legalRepresentative: {
    fullName: string;
    cpf: string;
    rg: string;
    rgEmitter: string;
    role: string;
  };
  
  // 5. RNTRC (ANTT)
  rntrc: {
    number: string;
    category: 'ETC' | 'TAC' | 'CTC';
    validUntil: string;
    status: 'valido' | 'vencido' | 'em_renovacao';
  };
  
  // 6. Dados Bancários
  bankDetails: BankData;
  
  // 7. Apólice de Seguro
  insurance?: {
    hasInsurance: boolean;
    insurer: string;
    brokerName?: string;
    policyNumber: string;
    rctrcNumber?: string;
    rcdcNumber?: string;
    validUntil: string;
    insuredAmount?: number;
  };
  
  // 8. Cobertura e Abrangência
  coverage: CoverageArea;
  
  // 9. Contatos dos Responsáveis
  contacts: ContactPerson[];
  
  // 10. Assinatura Eletrônica
  electronicSignatureEmail: string;
  
  // 11. Lista dos 12 Documentos Anexados
  documents: {
    cnpjCard: DocumentItem;
    socialContract: DocumentItem;
    legalRepDocument: DocumentItem;
    addressProof: DocumentItem;
    rntrcCertificate: DocumentItem;
    bankProof: DocumentItem;
    insurancePolicy: DocumentItem;
    stateRegistrationProof: DocumentItem;
    citiesCoverageList: DocumentItem;
    contactsSheet: DocumentItem;
    electronicSignatureDoc: DocumentItem;
    sampleNfeCte: DocumentItem;
  };

  // Status de Homologação
  status: PartnerStatus;
  complianceScore: number; // 0 a 100%
  auditorNotes?: string;
  lastAuditedBy?: string;
  lastAuditedAt?: string;
}

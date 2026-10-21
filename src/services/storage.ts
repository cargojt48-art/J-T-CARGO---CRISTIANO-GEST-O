import { TransportPartner, DocStatus, PartnerStatus } from '../types';
import { INITIAL_PARTNERS } from '../data/initialPartners';

const STORAGE_KEY = 'transpodoc_partners_v1';
const INITIALIZED_KEY = 'transpodoc_initialized_v1';

export function loadPartners(): TransportPartner[] {
  try {
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!isInitialized) {
      // First time ever opening the app: initialize demo data
      localStorage.setItem(INITIALIZED_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PARTNERS));
      return INITIAL_PARTNERS;
    }

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed; // Can be [] if user deleted all records
    }
    return [];
  } catch (err) {
    console.error('Error loading partners from localStorage:', err);
    return [];
  }
}

export function savePartners(partners: TransportPartner[]): void {
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  } catch (err) {
    console.error('Error saving partners to localStorage:', err);
  }
}

export function calculateComplianceScore(partner: TransportPartner): number {
  const docKeys = Object.keys(partner.documents) as (keyof typeof partner.documents)[];
  let approvedCount = 0;
  let totalApplicable = 0;

  docKeys.forEach((key) => {
    const doc = partner.documents[key];
    // Insurance is optional, if not provided and not required, we can exclude or consider if uploaded
    if (key === 'insurancePolicy' && !doc.fileName && !partner.insurance?.hasInsurance) {
      return; // Skip optional
    }
    totalApplicable++;
    if (doc.status === 'aprovado') {
      approvedCount++;
    } else if (
      (key === 'stateRegistrationProof' && (partner.stateRegistration || partner.isStateRegistrationExempt)) ||
      (key === 'citiesCoverageList' && partner.coverage?.citiesServed?.length > 0) ||
      (key === 'contactsSheet' && partner.contacts?.length > 0) ||
      (key === 'electronicSignatureDoc' && partner.electronicSignatureEmail)
    ) {
      approvedCount++;
    }
  });

  if (totalApplicable === 0) return 0;
  return Math.round((approvedCount / totalApplicable) * 100);
}

export function determineSuggestedStatus(partner: TransportPartner): PartnerStatus {
  const docValues = Object.values(partner.documents);
  const hasRejected = docValues.some(d => d.status === 'reprovado');
  if (hasRejected) return 'pendente_documento';

  const requiredDocs = docValues.filter(d => d.isRequired);
  const allRequiredApproved = requiredDocs.every(d => d.status === 'aprovado');
  
  if (allRequiredApproved) return 'homologado';
  return 'em_analise';
}

export function resetToInitial(): TransportPartner[] {
  localStorage.setItem(INITIALIZED_KEY, 'true');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PARTNERS));
  return INITIAL_PARTNERS;
}

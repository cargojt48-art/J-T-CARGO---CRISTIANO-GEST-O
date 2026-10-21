import { TransportPartner } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { loadPartners as loadLocalPartners, savePartners as saveLocalPartners } from './storage';
import { INITIAL_PARTNERS } from '../data/initialPartners';

export interface DbPartnerRow {
  id: string;
  protocol: string;
  created_at?: string;
  updated_at?: string;
  cnpj: string;
  company_name: string;
  trade_name?: string;
  opening_date?: string;
  state_registration?: string;
  is_state_registration_exempt?: boolean;
  address: any;
  legal_representative: any;
  rntrc: any;
  bank_details: any;
  insurance?: any;
  coverage: any;
  contacts: any[];
  electronic_signature_email?: string;
  documents: any;
  status: string;
  compliance_score?: number;
  auditor_notes?: string;
  last_audited_by?: string;
  last_audited_at?: string;
}

// Map Database Row -> Application TransportPartner
export function mapRowToPartner(row: DbPartnerRow): TransportPartner {
  return {
    id: row.id,
    protocol: row.protocol,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    cnpj: row.cnpj,
    companyName: row.company_name,
    tradeName: row.trade_name || '',
    openingDate: row.opening_date,
    stateRegistration: row.state_registration || '',
    isStateRegistrationExempt: Boolean(row.is_state_registration_exempt),
    address: row.address || {},
    legalRepresentative: row.legal_representative || {},
    rntrc: row.rntrc || {},
    bankDetails: row.bank_details || {},
    insurance: row.insurance,
    coverage: row.coverage || {},
    contacts: Array.isArray(row.contacts) ? row.contacts : [],
    electronicSignatureEmail: row.electronic_signature_email || '',
    documents: row.documents || {},
    status: (row.status as any) || 'em_analise',
    complianceScore: row.compliance_score ?? 0,
    auditorNotes: row.auditor_notes,
    lastAuditedBy: row.last_audited_by,
    lastAuditedAt: row.last_audited_at,
  };
}

// Map Application TransportPartner -> Database Row
export function mapPartnerToRow(partner: TransportPartner): DbPartnerRow {
  return {
    id: partner.id,
    protocol: partner.protocol,
    cnpj: partner.cnpj,
    company_name: partner.companyName,
    trade_name: partner.tradeName,
    opening_date: partner.openingDate,
    state_registration: partner.stateRegistration,
    is_state_registration_exempt: partner.isStateRegistrationExempt,
    address: partner.address,
    legal_representative: partner.legalRepresentative,
    rntrc: partner.rntrc,
    bank_details: partner.bankDetails,
    insurance: partner.insurance,
    coverage: partner.coverage,
    contacts: partner.contacts,
    electronic_signature_email: partner.electronicSignatureEmail,
    documents: partner.documents,
    status: partner.status,
    compliance_score: partner.complianceScore,
    auditor_notes: partner.auditorNotes,
    last_audited_by: partner.lastAuditedBy,
    last_audited_at: partner.lastAuditedAt,
    updated_at: new Date().toISOString(),
  };
}

// 1. Fetch all partners
export async function getPartners(): Promise<TransportPartner[]> {
  if (!isSupabaseConfigured) {
    console.info('[PartnerService] Supabase not configured, using localStorage.');
    return loadLocalPartners();
  }

  try {
    const { data, error } = await supabase
      .from('transport_partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[PartnerService] Supabase fetch error, fallback to local:', error.message);
      return loadLocalPartners();
    }

    if (data && data.length > 0) {
      const parsed = data.map(mapRowToPartner);
      saveLocalPartners(parsed); // Sync local cache
      return parsed;
    }

    // Se estiver vazio, salva cache local vazio e retorna []
    saveLocalPartners([]);
    return [];
  } catch (err) {
    console.error('[PartnerService] Unexpected error fetching partners:', err);
    return loadLocalPartners();
  }
}

// 2. Save or update partner
export async function savePartner(partner: TransportPartner): Promise<TransportPartner> {
  // Always update local cache first for instant feedback
  const localList = loadLocalPartners();
  const existingIdx = localList.findIndex(p => p.id === partner.id);
  let updatedList: TransportPartner[];
  if (existingIdx >= 0) {
    updatedList = localList.map(p => (p.id === partner.id ? partner : p));
  } else {
    updatedList = [partner, ...localList];
  }
  saveLocalPartners(updatedList);

  if (isSupabaseConfigured) {
    try {
      const row = mapPartnerToRow(partner);
      const { data, error } = await supabase
        .from('transport_partners')
        .upsert(row)
        .select()
        .single();

      if (error) {
        console.error('[PartnerService] Error saving to Supabase:', error);
      } else if (data) {
        return mapRowToPartner(data);
      }
    } catch (err) {
      console.error('[PartnerService] Network error saving to Supabase:', err);
    }
  }

  return partner;
}

// 3. Delete partner
export async function deletePartner(id: string): Promise<boolean> {
  // Remove from local storage
  const localList = loadLocalPartners().filter(p => p.id !== id);
  saveLocalPartners(localList);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('transport_partners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[PartnerService] Error deleting from Supabase:', error);
        return false;
      }
    } catch (err) {
      console.error('[PartnerService] Network error deleting from Supabase:', err);
      return false;
    }
  }
  return true;
}

// 4. Upload document to Supabase Storage
export async function uploadDocumentFile(
  partnerId: string,
  docKey: string,
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // Return a local object URL if offline
    return URL.createObjectURL(file);
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${partnerId}/${Date.now()}_${docKey}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('partner-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[PartnerService] Storage upload failed:', uploadError.message);
      return URL.createObjectURL(file);
    }

    const { data: urlData } = supabase.storage
      .from('partner-documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[PartnerService] Unexpected error uploading document:', err);
    return URL.createObjectURL(file);
  }
}

// 5. Seed initial mock partners to Supabase
export async function seedInitialPartners(): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const rows = INITIAL_PARTNERS.map(mapPartnerToRow);
    const { error } = await supabase.from('transport_partners').upsert(rows);
    if (error) {
      console.error('[PartnerService] Error seeding initial partners:', error);
    } else {
      console.info('[PartnerService] Initial partners seeded to Supabase successfully!');
    }
  } catch (err) {
    console.error('[PartnerService] Exception during seed:', err);
  }
}

// 6. Realtime subscription
export function subscribeToPartnerChanges(
  onInsert?: (partner: TransportPartner) => void,
  onUpdate?: (partner: TransportPartner) => void,
  onDelete?: (id: string) => void
) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel('realtime_transport_partners')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transport_partners' },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(mapRowToPartner(payload.new as DbPartnerRow));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'transport_partners' },
      (payload) => {
        if (onUpdate && payload.new) {
          onUpdate(mapRowToPartner(payload.new as DbPartnerRow));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'transport_partners' },
      (payload) => {
        if (onDelete && payload.old) {
          onDelete((payload.old as any).id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

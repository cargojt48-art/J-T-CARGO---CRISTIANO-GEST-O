-- ========================================================
-- Schema para o Sistema de Gestão e Homologação de Transportadores / Colaboradores
-- Projeto: J&T CARGO / TranspoDoc
-- Supabase Project: https://qqgjjztilgpenbhiygwo.supabase.co
-- ========================================================

-- 1. Criação da Tabela de Transportadores / Parceiros
CREATE TABLE IF NOT EXISTS public.transport_partners (
  id TEXT PRIMARY KEY,
  protocol TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Dados da Empresa
  cnpj TEXT NOT NULL,
  company_name TEXT NOT NULL,
  trade_name TEXT,
  opening_date TEXT,
  
  -- Inscrição Estadual
  state_registration TEXT,
  is_state_registration_exempt BOOLEAN DEFAULT false,
  
  -- Estruturas em JSONB para flexibilidade e compatibilidade total
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  legal_representative JSONB NOT NULL DEFAULT '{}'::jsonb,
  rntrc JSONB NOT NULL DEFAULT '{}'::jsonb,
  bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  insurance JSONB DEFAULT '{}'::jsonb,
  coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Assinatura e Documentos (12 documentos auditáveis)
  electronic_signature_email TEXT,
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status e Auditoria
  status TEXT NOT NULL DEFAULT 'em_analise',
  compliance_score INTEGER DEFAULT 0,
  auditor_notes TEXT,
  last_audited_by TEXT,
  last_audited_at TIMESTAMPTZ
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_transport_partners_protocol ON public.transport_partners(protocol);
CREATE INDEX IF NOT EXISTS idx_transport_partners_cnpj ON public.transport_partners(cnpj);
CREATE INDEX IF NOT EXISTS idx_transport_partners_status ON public.transport_partners(status);
CREATE INDEX IF NOT EXISTS idx_transport_partners_created_at ON public.transport_partners(created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.transport_partners ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso:
-- Permitir leitura para todos (para consulta de protocolo e dashboard)
CREATE POLICY "Permitir leitura pública de transportadores"
ON public.transport_partners
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir inserção pública (para novos credenciamentos via formulário externo)
CREATE POLICY "Permitir cadastro público de novos parceiros"
ON public.transport_partners
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir atualização (para auditoria e reenvio de documentos pelo protocolo)
CREATE POLICY "Permitir atualização de parceiros"
ON public.transport_partners
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir exclusão (para limpeza de cadastros pelo dashboard)
CREATE POLICY "Permitir exclusão de parceiros"
ON public.transport_partners
FOR DELETE
TO anon, authenticated
USING (true);

-- 4. Criação do Bucket de Armazenamento para os 12 Documentos (Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o Storage Bucket
CREATE POLICY "Permitir upload público de documentos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'partner-documents');

CREATE POLICY "Permitir leitura pública dos documentos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'partner-documents');

CREATE POLICY "Permitir atualização pública dos documentos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'partner-documents');

-- 5. Função e Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_transport_partners_updated_at ON public.transport_partners;
CREATE TRIGGER trigger_set_transport_partners_updated_at
BEFORE UPDATE ON public.transport_partners
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Habilitar Realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.transport_partners;

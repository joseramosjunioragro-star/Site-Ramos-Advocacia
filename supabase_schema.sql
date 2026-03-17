-- TerraForte — Plataforma de Proteção Agrícola Digital
-- Supabase PostgreSQL Schema
-- Lei 14.620/2023 — Títulos Executivos Extrajudiciais

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  razao_social TEXT,
  cpf TEXT UNIQUE,
  cnpj TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  cidade TEXT,
  estado CHAR(2),
  role TEXT NOT NULL CHECK (role IN ('produtor', 'comprador', 'corretor', 'feirante')),
  score_reputacao DECIMAL(2,1) DEFAULT 5.0 CHECK (score_reputacao >= 1 AND score_reputacao <= 5),
  usos_gratuitos_restantes INT DEFAULT 3,
  plano TEXT DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'transacional', 'mensalista', 'feirante')),
  volume_mensal DECIMAL(12,2) DEFAULT 0,
  gov_br_id TEXT, -- OAuth2 Gov.BR
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: negociacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS negociacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('padrao', 'futuro', 'giro')),
  produto TEXT NOT NULL,
  variedade TEXT,
  quantidade TEXT,
  classificacao TEXT,
  volume_estimado TEXT,
  local_origem TEXT,
  destino TEXT,
  data_entrega DATE,
  data_vencimento DATE,
  data_colheita DATE,
  valor DECIMAL(12,2) NOT NULL,
  valor_entrada DECIMAL(12,2),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativa', 'vencida', 'notificada', 'em_execucao', 'concluida')),

  -- Produtor (credor)
  produtor_id UUID REFERENCES usuarios(id),

  -- Comprador
  comprador_nome TEXT,
  comprador_cpf TEXT,
  comprador_cnpj TEXT,
  comprador_whatsapp TEXT,
  comprador_id UUID REFERENCES usuarios(id), -- opcional se cadastrado
  comprador_solidario BOOLEAN DEFAULT FALSE, -- corretor assume dívida

  -- Registro forense
  ip_assinatura INET,
  timestamp_assinatura TIMESTAMPTZ DEFAULT NOW(),
  hash_contrato TEXT, -- SHA-256 do PDF

  -- Cláusulas especiais
  clausula_imprevisibilidade BOOLEAN DEFAULT FALSE, -- para tipo=futuro
  clausula_corretor_solidario BOOLEAN DEFAULT FALSE,

  -- Metadados
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: aditivos_contratuais
-- ============================================================
CREATE TABLE IF NOT EXISTS aditivos_contratuais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacao_id UUID NOT NULL REFERENCES negociacoes(id),
  solicitante_id UUID REFERENCES usuarios(id),
  nova_data_vencimento DATE NOT NULL,
  motivo TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'recusado')),
  -- Score NÃO penalizado quando aceito
  penaliza_score BOOLEAN DEFAULT FALSE,
  ip_registro INET,
  timestamp_registro TIMESTAMPTZ DEFAULT NOW(),
  aceito_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: cobrancas_log
-- ============================================================
CREATE TABLE IF NOT EXISTS cobrancas_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacao_id UUID NOT NULL REFERENCES negociacoes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('notificacao', 'execucao', 'baixa')),
  ip_registro INET,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  hash_pacote TEXT, -- SHA-256 do pacote forense
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: provas_forenses
-- ============================================================
CREATE TABLE IF NOT EXISTS provas_forenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  negociacao_id UUID REFERENCES negociacoes(id),
  tipo_prova TEXT CHECK (tipo_prova IN ('conversa', 'recibo', 'foto', 'documento', 'outro')),
  descricao TEXT NOT NULL,
  arquivo_url TEXT, -- Supabase Storage
  arquivo_nome TEXT,
  ip_coleta INET NOT NULL,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  hash_sha256 TEXT NOT NULL, -- ISO 27037
  hash_blockchain TEXT, -- Registro simulado EOS
  valido_pericia BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: denuncias
-- ============================================================
CREATE TABLE IF NOT EXISTS denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  denunciante_id UUID REFERENCES usuarios(id),
  denunciado_nome TEXT NOT NULL,
  denunciado_cpf TEXT,
  tipo_fraude TEXT NOT NULL CHECK (tipo_fraude IN ('calote', 'produto', 'quantidade', 'identidade', 'outro')),
  descricao TEXT NOT NULL,
  prova_id UUID REFERENCES provas_forenses(id),
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'encerrada')),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: pagamentos_plataforma
-- ============================================================
CREATE TABLE IF NOT EXISTS pagamentos_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  negociacao_id UUID REFERENCES negociacoes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('transacional', 'mensalidade', 'feirante_fixo')),
  valor_transacao DECIMAL(12,2),
  taxa_percentual DECIMAL(5,4),
  valor_taxa DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  -- Integração Asaas (mockada)
  asaas_charge_id TEXT,
  asaas_payment_url TEXT,
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: notificacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'warning', 'danger', 'success')),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  negociacao_id UUID REFERENCES negociacoes(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE negociacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aditivos_contratuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE provas_forenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Usuários só veem seus próprios dados
CREATE POLICY "usuarios_own" ON usuarios FOR ALL USING (auth.uid() = id);

-- Negociações visíveis para produtor e comprador
CREATE POLICY "negociacoes_own" ON negociacoes FOR ALL
USING (
  auth.uid() = produtor_id OR
  auth.uid() = comprador_id
);

-- Aditivos visíveis pelos participantes da negociação
CREATE POLICY "aditivos_negociacao" ON aditivos_contratuais FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM negociacoes n
    WHERE n.id = negociacao_id
    AND (n.produtor_id = auth.uid() OR n.comprador_id = auth.uid())
  )
);

-- Provas forenses visíveis apenas pelo dono
CREATE POLICY "provas_own" ON provas_forenses FOR ALL USING (auth.uid() = usuario_id);

-- Denúncias visíveis apenas pelo denunciante
CREATE POLICY "denuncias_own" ON denuncias FOR ALL USING (auth.uid() = denunciante_id);

-- Cobranças visíveis pelos participantes da negociação
CREATE POLICY "cobrancas_negociacao" ON cobrancas_log FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM negociacoes n
    WHERE n.id = negociacao_id
    AND (n.produtor_id = auth.uid() OR n.comprador_id = auth.uid())
  )
);

-- Pagamentos visíveis pelo usuário dono
CREATE POLICY "pagamentos_own" ON pagamentos_plataforma FOR ALL USING (auth.uid() = usuario_id);

-- Notificações visíveis apenas pelo destinatário
CREATE POLICY "notificacoes_own" ON notificacoes FOR ALL USING (auth.uid() = usuario_id);

-- ============================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================

-- Trigger: Atualizar score quando negociação vence
CREATE OR REPLACE FUNCTION penalizar_score_devedor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'notificada' AND OLD.status = 'vencida' THEN
    UPDATE usuarios
    SET score_reputacao = GREATEST(1.0, score_reputacao - 0.5)
    WHERE id = (
      SELECT comprador_id FROM negociacoes WHERE id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_penalizar_score
AFTER UPDATE ON negociacoes
FOR EACH ROW
EXECUTE FUNCTION penalizar_score_devedor();

-- Trigger: Decrementar usos gratuitos
CREATE OR REPLACE FUNCTION decrementar_usos_gratuitos()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usuarios
  SET usos_gratuitos_restantes = GREATEST(0, usos_gratuitos_restantes - 1),
      volume_mensal = volume_mensal + NEW.valor
  WHERE id = NEW.produtor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usos_gratuitos
AFTER INSERT ON negociacoes
FOR EACH ROW
EXECUTE FUNCTION decrementar_usos_gratuitos();

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_negociacoes_produtor ON negociacoes(produtor_id);
CREATE INDEX idx_negociacoes_comprador ON negociacoes(comprador_id);
CREATE INDEX idx_negociacoes_status ON negociacoes(status);
CREATE INDEX idx_negociacoes_vencimento ON negociacoes(data_vencimento);
CREATE INDEX idx_aditivos_negociacao ON aditivos_contratuais(negociacao_id);
CREATE INDEX idx_provas_usuario ON provas_forenses(usuario_id);
CREATE INDEX idx_provas_hash ON provas_forenses(hash_sha256);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(usuario_id, lida);
CREATE INDEX idx_cobrancas_negociacao ON cobrancas_log(negociacao_id);
CREATE INDEX idx_pagamentos_usuario ON pagamentos_plataforma(usuario_id);

-- ============================================================
-- SUPABASE STORAGE — Bucket para Provas Forenses
-- Run via: Supabase Dashboard > SQL Editor
-- ============================================================

-- Private bucket: files are accessible only via signed URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'provas-forenses',
  'provas-forenses',
  false,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Users may only upload files into their own folder ({userId}/...)
CREATE POLICY "provas_storage_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'provas-forenses'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users may only read their own evidence files
CREATE POLICY "provas_storage_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'provas-forenses'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users may not delete evidence (immutable after registration)
-- If deletion is needed, it must be done by an admin role only.

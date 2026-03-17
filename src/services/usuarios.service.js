import { supabase } from '../lib/supabase';

// Maps DB snake_case → store camelCase
function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nome,
    razaoSocial: row.razao_social,
    cpf: row.cpf,
    cnpj: row.cnpj,
    email: row.email,
    whatsapp: row.whatsapp,
    city: row.cidade,
    state: row.estado,
    role: row.role,
    reputation: parseFloat(row.score_reputacao) || 5.0,
    freeTrials: row.usos_gratuitos_restantes ?? 3,
    plan: row.plano || 'gratuito',
    monthlyVolume: parseFloat(row.volume_mensal) || 0,
    govBrId: row.gov_br_id,
    createdAt: row.criado_em,
  };
}

// Maps store camelCase → DB snake_case
function mapUserToDb(user) {
  return {
    nome: user.name,
    razao_social: user.razaoSocial || null,
    cpf: user.cpf || null,
    cnpj: user.cnpj || null,
    email: user.email,
    whatsapp: user.whatsapp || null,
    cidade: user.city || null,
    estado: user.state || null,
    role: user.role,
  };
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return mapUser(data);
}

export async function createProfile(userId, userData) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ id: userId, ...mapUserToDb(userData) })
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
}

export async function upsertProfile(userId, userData) {
  const { data, error } = await supabase
    .from('usuarios')
    .upsert({ id: userId, ...mapUserToDb(userData), atualizado_em: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
}

export async function updateReputation(userId, newScore) {
  const clamped = Math.min(5.0, Math.max(1.0, +newScore.toFixed(1)));
  const { data, error } = await supabase
    .from('usuarios')
    .update({ score_reputacao: clamped, atualizado_em: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
}

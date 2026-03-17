import { supabase } from '../lib/supabase';

function mapNotif(row) {
  return {
    id: row.id,
    message: row.mensagem,
    type: row.tipo,
    read: row.lida,
    negociacaoId: row.negociacao_id,
    createdAt: row.criado_em,
  };
}

export async function listNotificacoes(userId) {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('usuario_id', userId)
    .order('criado_em', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map(mapNotif);
}

export async function markRead(notifId) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', notifId);
  if (error) throw error;
}

export async function markAllRead(userId) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('usuario_id', userId)
    .eq('lida', false);
  if (error) throw error;
}

/**
 * Insert a notification into the DB.
 * Errors are logged but not re-thrown so callers aren't blocked by notification failures.
 */
export async function createNotificacao(userId, tipo, mensagem, negociacaoId = null) {
  if (!supabase) return;
  const { error } = await supabase.from('notificacoes').insert({
    usuario_id: userId,
    tipo,
    mensagem,
    negociacao_id: negociacaoId,
    lida: false,
  });
  if (error) console.error('[TerraForte] createNotificacao:', error.message);
}

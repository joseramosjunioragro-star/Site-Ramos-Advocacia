import { supabase } from '../lib/supabase';

export async function createAditivo(negId, solicitanteId, { novaData, motivo, ip }) {
  const { data, error } = await supabase
    .from('aditivos_contratuais')
    .insert({
      negociacao_id: negId,
      solicitante_id: solicitanteId,
      nova_data_vencimento: novaData,
      motivo,
      status: 'pendente',
      penaliza_score: false,
      ip_registro: ip || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function acceptAditivo(aditivoId, negId, novaData) {
  // Accept the aditivo and update the negociacao's due date in parallel
  const [aditivoResult, negResult] = await Promise.all([
    supabase
      .from('aditivos_contratuais')
      .update({ status: 'aceito', aceito_em: new Date().toISOString() })
      .eq('id', aditivoId)
      .select()
      .single(),
    supabase
      .from('negociacoes')
      .update({ data_vencimento: novaData, status: 'ativa', atualizado_em: new Date().toISOString() })
      .eq('id', negId)
      .select()
      .single(),
  ]);
  if (aditivoResult.error) throw aditivoResult.error;
  if (negResult.error) throw negResult.error;
  return { aditivo: aditivoResult.data, negociacao: negResult.data };
}

import { supabase } from '../lib/supabase';

/**
 * Register a crop-loss notice for a venda_antecipada contract.
 * Sets negociação status to 'perda_safra_em_apuracao' and creates a perdas_safra record.
 */
export async function createPerdaSafra(negId, produtorId, data) {
  const payload = {
    negociacao_id: negId,
    produtor_id: produtorId,
    tipo_evento: data.tipoEvento,
    data_ocorrencia: data.dataOcorrencia,
    descricao: data.descricao,
    hash_evidencias: data.hashEvidencias || null,
    arquivo_url: data.arquivoUrl || null,
    status_revisao: 'em_apuracao',
    ip_registro: data.ip || null,
  };

  const { data: row, error } = await supabase
    .from('perdas_safra')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return row;
}

/**
 * List all crop-loss records for a given negociação.
 */
export async function listPerdasSafra(negId) {
  const { data, error } = await supabase
    .from('perdas_safra')
    .select('*')
    .eq('negociacao_id', negId)
    .order('criado_em', { ascending: false });

  if (error) throw error;
  return data || [];
}

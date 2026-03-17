import { supabase } from '../lib/supabase';
import { sha256 } from '../utils/helpers';

function mapAditivo(row) {
  return {
    id: row.id,
    novaData: row.nova_data_vencimento,
    motivo: row.motivo,
    status: row.status,
    penalizaScore: row.penaliza_score,
    ip: row.ip_registro,
    dataCriacao: row.criado_em,
    aceitoEm: row.aceito_em,
  };
}

function mapNeg(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    produto: row.produto,
    variedade: row.variedade,
    quantidade: row.quantidade,
    classificacao: row.classificacao,
    volumeEstimado: row.volume_estimado,
    local: row.local_origem,
    destino: row.destino,
    dataEntrega: row.data_entrega,
    dataVencimento: row.data_vencimento,
    dataColheita: row.data_colheita,
    valor: parseFloat(row.valor),
    valorEntrada: row.valor_entrada ? parseFloat(row.valor_entrada) : undefined,
    status: row.status,
    produtorId: row.produtor_id,
    comprador: row.comprador_nome,
    compradorCpf: row.comprador_cpf,
    compradorCnpj: row.comprador_cnpj,
    compradorWhatsapp: row.comprador_whatsapp,
    compradorId: row.comprador_id,
    compradorSolidario: row.comprador_solidario,
    ipAssinatura: row.ip_assinatura,
    timestampAssinatura: row.timestamp_assinatura,
    hashContrato: row.hash_contrato,
    clausulaImprevisibilidade: row.clausula_imprevisibilidade,
    clausulaCorretorSolidario: row.clausula_corretor_solidario,
    dataCriacao: row.criado_em,
    aditivos: (row.aditivos_contratuais || []).map(mapAditivo),
  };
}

function mapNegToDb(neg, produtorId) {
  return {
    produtor_id: produtorId,
    tipo: neg.tipo,
    produto: neg.produto,
    variedade: neg.variedade || null,
    quantidade: neg.quantidade || null,
    classificacao: neg.classificacao || null,
    volume_estimado: neg.volumeEstimado || null,
    local_origem: neg.local || null,
    destino: neg.destino || null,
    data_entrega: neg.dataEntrega || null,
    data_vencimento: neg.dataVencimento,
    data_colheita: neg.dataColheita || null,
    valor: neg.valor,
    valor_entrada: neg.valorEntrada || null,
    status: neg.status || 'pendente',
    comprador_nome: neg.comprador || null,
    comprador_cpf: neg.compradorCpf || null,
    comprador_cnpj: neg.compradorCnpj || null,
    comprador_whatsapp: neg.compradorWhatsapp || null,
    comprador_solidario: neg.compradorSolidario || false,
    ip_assinatura: neg.ipAssinatura || null,
    timestamp_assinatura: neg.timestampAssinatura || new Date().toISOString(),
    clausula_imprevisibilidade: neg.clausulaImprevisibilidade || false,
    clausula_corretor_solidario: neg.clausulaCorretorSolidario || false,
  };
}

export async function listNegociacoes(userId) {
  const { data, error } = await supabase
    .from('negociacoes')
    .select('*, aditivos_contratuais(*)')
    .or(`produtor_id.eq.${userId},comprador_id.eq.${userId}`)
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapNeg);
}

export async function createNegociacao(neg, produtorId) {
  const ts = new Date().toISOString();
  const dbPayload = mapNegToDb(neg, produtorId);
  dbPayload.timestamp_assinatura = ts;

  // Compute real SHA-256 hash of canonical contract data for forensic integrity
  const contractString = JSON.stringify({
    produtor_id: produtorId,
    tipo: dbPayload.tipo,
    produto: dbPayload.produto,
    valor: dbPayload.valor,
    data_vencimento: dbPayload.data_vencimento,
    comprador_nome: dbPayload.comprador_nome,
    timestamp: ts,
  });
  dbPayload.hash_contrato = await sha256(contractString);

  const { data, error } = await supabase
    .from('negociacoes')
    .insert(dbPayload)
    .select('*, aditivos_contratuais(*)')
    .single();
  if (error) throw error;
  return mapNeg(data);
}

export async function updateNegociacaoStatus(negId, status) {
  const { data, error } = await supabase
    .from('negociacoes')
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', negId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNegociacaoVencimento(negId, novaData, status = 'ativa') {
  const { data, error } = await supabase
    .from('negociacoes')
    .update({ data_vencimento: novaData, status, atualizado_em: new Date().toISOString() })
    .eq('id', negId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

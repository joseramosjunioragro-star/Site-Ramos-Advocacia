import { supabase } from '../lib/supabase';

export async function createDenuncia(denuncianteId, { descricao, tipoFraude, denunciadoNome, denunciadoCpf, ip, hash }) {
  // 1. Create forensic evidence record
  const { data: prova, error: provaError } = await supabase
    .from('provas_forenses')
    .insert({
      usuario_id: denuncianteId,
      tipo_prova: 'documento',
      descricao,
      ip_coleta: ip || '0.0.0.0',
      hash_sha256: hash,
      valido_pericia: true,
    })
    .select()
    .single();
  if (provaError) throw provaError;

  // 2. Create denuncia linked to the proof
  const { data: denuncia, error: denunciaError } = await supabase
    .from('denuncias')
    .insert({
      denunciante_id: denuncianteId,
      denunciado_nome: denunciadoNome,
      denunciado_cpf: denunciadoCpf || null,
      tipo_fraude: tipoFraude || 'outro',
      descricao,
      prova_id: prova.id,
      status: 'aberta',
    })
    .select()
    .single();
  if (denunciaError) throw denunciaError;

  return { prova, denuncia };
}

import { supabase } from '../lib/supabase';

/**
 * Create a forensic evidence record (provas_forenses) and an associated
 * denuncia (denuncias) atomically.
 *
 * @param {string} denuncianteId  - authenticated user's UUID
 * @param {object} params
 *   descricao      {string}  - detailed description of the evidence
 *   tipoFraude     {string}  - one of: calote|produto|quantidade|identidade|outro
 *   denunciadoNome {string}  - name of the accused party
 *   denunciadoCpf  {string?} - CPF of the accused (optional)
 *   ip             {string}  - client IP captured at registration time
 *   hash           {string}  - real SHA-256 of file contents or description text
 *   arquivoUrl     {string?} - Supabase Storage path (from uploadProvaFile)
 *   arquivoNome    {string?} - original filename
 *   tipoProva      {string}  - one of: conversa|recibo|foto|documento|outro
 */
export async function createDenuncia(denuncianteId, {
  descricao,
  tipoFraude,
  denunciadoNome,
  denunciadoCpf,
  ip,
  hash,
  arquivoUrl,
  arquivoNome,
  tipoProva,
}) {
  // 1. Insert forensic evidence record
  const { data: prova, error: provaError } = await supabase
    .from('provas_forenses')
    .insert({
      usuario_id: denuncianteId,
      tipo_prova: tipoProva || 'documento',
      descricao,
      arquivo_url: arquivoUrl || null,
      arquivo_nome: arquivoNome || null,
      ip_coleta: ip || '0.0.0.0',
      hash_sha256: hash,
      valido_pericia: true,
    })
    .select()
    .single();
  if (provaError) throw provaError;

  // 2. Link evidence to denuncia
  const { data: denuncia, error: denunciaError } = await supabase
    .from('denuncias')
    .insert({
      denunciante_id: denuncianteId,
      denunciado_nome: denunciadoNome || 'N/A',
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

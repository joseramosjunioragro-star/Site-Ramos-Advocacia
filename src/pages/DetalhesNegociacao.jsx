import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, AlertCircle, CheckCircle, Clock, FileText,
  Calendar, MapPin, User, Phone, DollarSign, Gavel, Share2,
  RefreshCw, Package, X, Check
} from 'lucide-react';
import useStore from '../store/useStore';
import Modal from '../components/Modal';
import {
  formatCurrency, formatDate, formatDateTime, getStatusColor,
  getStatusLabel, getTipoLabel, diasParaVencer, calcularTaxa, gerarHashSHA256Simulado
} from '../utils/helpers';

export default function DetalhesNegociacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const negociacoes = useStore((s) => s.negociacoes);
  const user = useStore((s) => s.user);
  const addAditivo = useStore((s) => s.addAditivo);
  const aceitarAditivo = useStore((s) => s.aceitarAditivo);
  const notificarDevedor = useStore((s) => s.notificarDevedor);
  const executarDivida = useStore((s) => s.executarDivida);
  const darBaixa = useStore((s) => s.darBaixa);

  const neg = negociacoes.find((n) => n.id === id);

  const [showRenegModal, setShowRenegModal] = useState(false);
  const [showExecutarModal, setShowExecutarModal] = useState(false);
  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showForenseModal, setShowForenseModal] = useState(false);
  const [renegForm, setRenegForm] = useState({ novaData: '', motivo: '' });
  const [pacoteForense, setPacoteForense] = useState(null);
  const [baixaConfirmada, setBaixaConfirmada] = useState(false);

  if (!neg) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Negociação não encontrada</p>
        <button onClick={() => navigate('/negociacoes')} className="mt-4 btn-primary px-6 py-3">Voltar</button>
      </div>
    );
  }

  const colors = getStatusColor(neg.status);
  const dias = diasParaVencer(neg.dataVencimento);
  const taxa = calcularTaxa(neg.valor, user.plan);
  const isVencida = ['vencida', 'notificada', 'em_execucao'].includes(neg.status);

  const handleRenegociacao = () => {
    if (!renegForm.novaData) return;
    addAditivo(neg.id, { novaData: renegForm.novaData, motivo: renegForm.motivo, solicitante: user.name });
    setShowRenegModal(false);
    setRenegForm({ novaData: '', motivo: '' });
  };

  const handleExecutar = () => {
    const hash = gerarHashSHA256Simulado(neg.id + neg.timestampAssinatura);
    setPacoteForense({
      hash,
      arquivos: ['Contrato_' + neg.id + '.pdf', 'Historico_Aditivos.pdf', 'Log_Timestamps.json', 'IP_Evidence.txt'],
      timestamp: new Date().toUTCString(),
    });
    executarDivida(neg.id);
    setShowExecutarModal(false);
    setShowForenseModal(true);
  };

  const handleNotificar = () => {
    notificarDevedor(neg.id);
  };

  const handleBaixa = () => {
    darBaixa(neg.id);
    setBaixaConfirmada(true);
  };

  const pendingAditivos = neg.aditivos?.filter((a) => a.status === 'pendente') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${isVencida ? 'from-red-700 to-red-800' : 'from-green-700 to-green-800'} text-white px-4 py-5`}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4 text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className={`status-badge ${colors.bg} ${colors.text} mb-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {getStatusLabel(neg.status)}
            </div>
            <h1 className="text-xl font-bold">{neg.produto}</h1>
            <p className="text-sm opacity-80">{neg.variedade || getTipoLabel(neg.tipo)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{formatCurrency(neg.valor)}</p>
            {dias !== null && (
              <p className={`text-xs mt-1 font-medium ${dias < 0 ? 'text-red-300' : 'text-green-200'}`}>
                {dias < 0 ? `Venceu há ${Math.abs(dias)} dias` : `Vence em ${dias} dias`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Aditivos Pendentes Alert */}
        {pendingAditivos.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
              <RefreshCw size={14} /> Solicitação de Prazo Pendente
            </p>
            {pendingAditivos.map((a) => (
              <div key={a.id} className="bg-white border border-blue-100 rounded-xl p-3 mb-2">
                <p className="text-xs text-gray-700 mb-1"><strong>Nova data:</strong> {formatDate(a.novaData)}</p>
                <p className="text-xs text-gray-600 mb-2"><strong>Motivo:</strong> {a.motivo}</p>
                <button
                  onClick={() => aceitarAditivo(neg.id, a.id)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Aceitar Prazo — Sem Penalidade no Score
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText size={16} className="text-green-600" /> Detalhes do Contrato
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Tipo</p>
              <p className="font-semibold text-gray-800 text-sm">{getTipoLabel(neg.tipo)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Quantidade</p>
              <p className="font-semibold text-gray-800 text-sm">{neg.quantidade || neg.volumeEstimado || '—'}</p>
            </div>
            {neg.classificacao && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Classificação</p>
                <p className="font-semibold text-gray-800 text-sm">{neg.classificacao}</p>
              </div>
            )}
            {neg.valorEntrada && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Entrada Paga</p>
                <p className="font-semibold text-green-700 text-sm">{formatCurrency(neg.valorEntrada)}</p>
              </div>
            )}
          </div>

          {(neg.local || neg.destino) && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
              <MapPin size={14} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">{neg.local} → {neg.destino}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Criado em {formatDate(neg.dataCriacao)} • Vence em {formatDate(neg.dataVencimento)}</p>
              {neg.dataColheita && <p className="text-xs text-gray-500">Colheita: {formatDate(neg.dataColheita)}</p>}
            </div>
          </div>
        </div>

        {/* Comprador */}
        {neg.comprador && (
          <div className="card space-y-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> Comprador
            </h2>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-blue-700 text-sm">{neg.comprador[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{neg.comprador}</p>
                {neg.compradorWhatsapp && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {neg.compradorWhatsapp}</p>}
                {neg.compradorSolidario && <p className="text-xs text-red-500 font-medium mt-0.5">⚠️ Corretor como Comprador Solidário</p>}
              </div>
            </div>
          </div>
        )}

        {/* Aditivos History */}
        {neg.aditivos?.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
              <RefreshCw size={16} className="text-purple-600" /> Aditivos Contratuais
            </h2>
            {neg.aditivos.map((a) => (
              <div key={a.id} className={`border-l-4 ${a.status === 'aceito' ? 'border-green-400' : 'border-yellow-400'} pl-3 py-2 mb-3`}>
                <p className="text-xs font-bold text-gray-700">Aditivo #{a.id.slice(-4)}</p>
                <p className="text-xs text-gray-500">Nova data: {formatDate(a.novaData)}</p>
                <p className="text-xs text-gray-500">Motivo: {a.motivo}</p>
                <p className="text-xs text-gray-500">Registrado: {formatDate(a.dataCriacao)}</p>
                <span className={`text-xs font-semibold ${a.status === 'aceito' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {a.status === 'aceito' ? '✓ Aceito — Score preservado' : '⏳ Aguardando aceite'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Assinatura Forense */}
        {neg.ipAssinatura && (
          <div className="card">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Shield size={16} className="text-green-600" /> Registro Forense
            </h2>
            <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-500 space-y-1">
              <p>ID: {neg.id}</p>
              <p>IP: {neg.ipAssinatura}</p>
              <p>Timestamp UTC: {new Date(neg.timestampAssinatura || neg.dataCriacao).toUTCString()}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Pedir mais prazo — para qualquer status ativo */}
          {['ativa', 'pendente'].includes(neg.status) && (
            <button
              onClick={() => setShowRenegModal(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw size={18} /> Pedir Mais Prazo (Aditivo)
            </button>
          )}

          {/* Notificar devedor — vencida */}
          {neg.status === 'vencida' && (
            <button
              onClick={handleNotificar}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <AlertCircle size={18} /> Assinar e Notificar Devedor
            </button>
          )}

          {/* Executar — notificada */}
          {(neg.status === 'notificada') && (
            <button
              onClick={() => setShowExecutarModal(true)}
              className="w-full btn-danger py-4 flex items-center justify-center gap-2 shadow-lg"
            >
              <Gavel size={18} /> Executar Dívida na Justiça
            </button>
          )}

          {/* Ver PDF */}
          <button
            onClick={() => setShowPDFModal(true)}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Ver PDF do Contrato
          </button>

          {/* Dar Baixa */}
          {!['concluida', 'em_execucao'].includes(neg.status) && (
            <button
              onClick={() => setShowBaixaModal(true)}
              className="w-full border-2 border-green-300 text-green-700 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Informar Pagamento / Dar Baixa
            </button>
          )}
        </div>
      </div>

      {/* Renegociação Modal */}
      <Modal isOpen={showRenegModal} onClose={() => setShowRenegModal(false)} title="🤝 Pedir Mais Prazo">
        <p className="text-sm text-gray-500 mb-4">
          Solicite um novo prazo. Se aceito pelo credor, nenhum score de reputação será penalizado.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nova Data de Vencimento</label>
            <input
              type="date"
              className="input-field"
              value={renegForm.novaData}
              onChange={(e) => setRenegForm({ ...renegForm, novaData: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motivo</label>
            <textarea
              className="input-field min-h-24 resize-none"
              placeholder="Ex: Problema logístico, aguardando recebimento de outra venda..."
              value={renegForm.motivo}
              onChange={(e) => setRenegForm({ ...renegForm, motivo: e.target.value })}
            />
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2">
            <CheckCircle size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">Se o credor aceitar, este aditivo eletrônico terá validade jurídica e não impactará os scores de nenhuma das partes.</p>
          </div>
          <button
            onClick={handleRenegociacao}
            disabled={!renegForm.novaData}
            className="w-full btn-primary disabled:opacity-50"
          >
            Enviar Solicitação
          </button>
        </div>
      </Modal>

      {/* Executar Dívida Modal */}
      <Modal isOpen={showExecutarModal} onClose={() => setShowExecutarModal(false)} title="⚖️ Executar Dívida">
        <div className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-bold text-red-700 mb-2">Atenção — Ação Irreversível</p>
            <p className="text-sm text-red-600 leading-relaxed">
              Ao confirmar, o sistema gerará o <strong>Pacote Forense</strong> com todos os documentos necessários para execução judicial:
            </p>
            <ul className="text-xs text-red-500 mt-2 text-left space-y-1">
              <li>• PDF do Contrato Assinado</li>
              <li>• Histórico de Aditivos Contratuais</li>
              <li>• Log de IP e Timestamps de cobrança</li>
              <li>• Hash de integridade (ISO 27037)</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowExecutarModal(false)} className="flex-1 border border-gray-200 py-3 rounded-xl text-gray-600 font-semibold">
              Cancelar
            </button>
            <button onClick={handleExecutar} className="flex-1 btn-danger py-3">
              Confirmar Execução
            </button>
          </div>
        </div>
      </Modal>

      {/* Pacote Forense Modal */}
      <Modal isOpen={showForenseModal} onClose={() => setShowForenseModal(false)} title="🔒 Pacote Forense Gerado">
        {pacoteForense && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gavel size={28} className="text-green-700" />
              </div>
              <p className="font-bold text-gray-800">Pacote Enviado para Assessoria</p>
              <p className="text-sm text-gray-500 mt-1">Os documentos foram empacotados e enviados para análise jurídica</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700 mb-2">Arquivos do Pacote:</p>
              {pacoteForense.arquivos.map((f) => (
                <div key={f} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                  <FileText size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-600">{f}</p>
                  <CheckCircle size={12} className="text-green-500 ml-auto" />
                </div>
              ))}
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <p className="text-xs font-bold text-purple-800 mb-1">Hash Blockchain (EOS) — ISO 27037</p>
              <p className="text-xs font-mono text-purple-600 break-all">{pacoteForense.hash}</p>
              <p className="text-xs text-purple-500 mt-1">Registrado em: {pacoteForense.timestamp}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Baixa Modal */}
      <Modal isOpen={showBaixaModal} onClose={() => { setShowBaixaModal(false); setBaixaConfirmada(false); }} title="💰 Dar Baixa no Contrato">
        {!baixaConfirmada ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="font-bold text-yellow-800 mb-2">Pagamento Externo / Acordo por Fora</p>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Para baixar este contrato com validade jurídica, é necessário o pagamento da taxa da plataforma:
              </p>
              <p className="text-2xl font-black text-yellow-800 mt-3 text-center">{formatCurrency(taxa)}</p>
              <p className="text-xs text-yellow-600 text-center mt-1">Taxa {user.plan === 'mensalista' ? '0,5%' : '1,5%'} sobre {formatCurrency(neg.valor)}</p>
            </div>
            {user.freeTrials > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-sm text-green-700 font-bold">✓ Usar 1 uso gratuito restante ({user.freeTrials} disponíveis)</p>
              </div>
            )}
            <button onClick={handleBaixa} className="w-full btn-primary">
              {user.freeTrials > 0 ? 'Usar Uso Gratuito — Dar Baixa' : `Pagar ${formatCurrency(taxa)} e Dar Baixa`}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="font-bold text-gray-800 text-lg">Contrato Encerrado!</p>
            <p className="text-sm text-gray-500 mt-2">Status atualizado para <strong>Concluído</strong> com validade jurídica plena.</p>
            <button onClick={() => { setShowBaixaModal(false); setBaixaConfirmada(false); }} className="mt-4 btn-primary px-8">
              Fechar
            </button>
          </div>
        )}
      </Modal>

      {/* PDF Modal */}
      <Modal isOpen={showPDFModal} onClose={() => setShowPDFModal(false)} title="📄 Contrato" size="large">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-700 space-y-3 max-h-96 overflow-y-auto">
          <div className="text-center border-b border-gray-200 pb-3">
            <p className="font-black text-sm">CONTRATO DE {neg.tipo === 'futuro' ? 'COMPRA E VENDA ANTECIPADA' : neg.tipo === 'giro' ? 'VENDA RÁPIDA' : 'COMPRA E VENDA'}</p>
            <p className="text-gray-500 text-xs">TerraForte — Plataforma de Proteção Agrícola Digital</p>
            <p className="text-gray-400 text-xs">ID: {neg.id}</p>
          </div>
          <div className="space-y-2">
            <p><strong>PRODUTO:</strong> {neg.produto} {neg.variedade ? `— ${neg.variedade}` : ''}</p>
            <p><strong>QUANTIDADE:</strong> {neg.quantidade || neg.volumeEstimado || 'N/A'}</p>
            {neg.classificacao && <p><strong>CLASSIFICAÇÃO:</strong> {neg.classificacao}</p>}
            <p><strong>VALOR TOTAL:</strong> {formatCurrency(neg.valor)}</p>
            {neg.valorEntrada && <p><strong>VALOR DE ENTRADA:</strong> {formatCurrency(neg.valorEntrada)}</p>}
            {neg.local && <p><strong>ORIGEM:</strong> {neg.local}</p>}
            {neg.destino && <p><strong>DESTINO:</strong> {neg.destino}</p>}
            <p><strong>COMPRADOR:</strong> {neg.comprador || 'A confirmar'}</p>
            {neg.compradorCPF && <p><strong>CPF/CNPJ:</strong> {neg.compradorCPF}</p>}
            {neg.dataEntrega && <p><strong>ENTREGA:</strong> {formatDate(neg.dataEntrega)}</p>}
            <p><strong>VENCIMENTO:</strong> {formatDate(neg.dataVencimento)}</p>
            {neg.dataColheita && <p><strong>COLHEITA PREVISTA:</strong> {formatDate(neg.dataColheita)}</p>}
          </div>

          <div className="border border-blue-300 bg-blue-50 p-3 rounded-lg">
            <p className="font-bold text-blue-900 text-xs mb-1">CLÁUSULA DE VALIDADE JURÍDICA — ART. 784, § 4º DO CPC</p>
            <p className="text-blue-800 text-xs leading-relaxed">
              "As partes reconhecem que a presente assinatura eletrônica avançada possui plena validade jurídica nos termos do art. 784, § 4º do Código de Processo Civil, dispensando a necessidade de testemunhas. Este instrumento constitui Título Executivo Extrajudicial nos termos da Lei nº 14.620/2023, podendo ser objeto de execução forçada perante o Poder Judiciário."
            </p>
            {neg.tipo === 'futuro' && (
              <p className="text-blue-800 text-xs leading-relaxed mt-2">
                "CLÁUSULA DE IMPREVISIBILIDADE: As partes afastam expressamente a aplicação da teoria da imprevisibilidade (art. 478 do Código Civil) para quaisquer eventos climáticos, variações de preço ou condições de mercado, conforme jurisprudência consolidada do Superior Tribunal de Justiça."
              </p>
            )}
            {neg.compradorSolidario && (
              <p className="text-red-700 text-xs leading-relaxed mt-2 font-bold">
                "RESPONSABILIDADE SOLIDÁRIA: Por ausência de indicação de Comprador Final, o Corretor signatário assume integral responsabilidade pelo pagamento como devedor solidário."
              </p>
            )}
          </div>

          <div className="border border-gray-200 bg-gray-50 p-3 rounded-lg font-mono">
            <p className="font-bold text-gray-700 text-xs mb-1">REGISTRO DE ASSINATURA ELETRÔNICA</p>
            <p className="text-gray-500 text-xs">IP: {neg.ipAssinatura || 'N/A'}</p>
            <p className="text-gray-500 text-xs">Timestamp UTC: {neg.timestampAssinatura ? new Date(neg.timestampAssinatura).toUTCString() : 'N/A'}</p>
            <p className="text-gray-500 text-xs">Status: {getStatusLabel(neg.status)}</p>
          </div>

          {neg.aditivos?.filter(a => a.status === 'aceito').length > 0 && (
            <div className="border border-green-200 bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-green-800 text-xs mb-1">ADITIVOS CONTRATUAIS</p>
              {neg.aditivos.filter(a => a.status === 'aceito').map((a, i) => (
                <p key={a.id} className="text-green-700 text-xs">Aditivo {i+1}: Nova data {formatDate(a.novaData)} — {a.motivo}</p>
              ))}
            </div>
          )}

          <p className="text-center text-gray-400 text-xs border-t border-gray-100 pt-2">
            Documento gerado pela TerraForte — Plataforma de Proteção Agrícola Digital<br />
            terraforte.app • Lei 14.620/2023
          </p>
        </div>
      </Modal>
    </div>
  );
}

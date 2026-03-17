import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Share2, Shield } from 'lucide-react';
import useStore from '../store/useStore';
import Modal from '../components/Modal';
import { formatCurrency, calcularTaxa, gerarLinkWhatsApp } from '../utils/helpers';

const FRUTAS = ['Laranja Pera', 'Laranja Lima', 'Manga Tommy', 'Manga Palmer', 'Banana Prata', 'Banana Nanica', 'Uva Itália', 'Uva Rubi', 'Abacaxi Pérola', 'Melão Cantaloupe', 'Maracujá Azedo', 'Limão Tahiti', 'Goiaba Vermelha', 'Pêssego Aurora', 'Nectarina'];

// Compra e Venda Padrão
function FormPadrao({ onSubmit, user }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    produto: '',
    variedade: '',
    quantidade: '',
    classificacao: '',
    local: '',
    destino: '',
    dataEntrega: '',
    dataVencimento: '',
    valor: '',
    comprador: '',
    compradorWhatsapp: '',
    compradorCPF: '',
  });
  const [showCorretorAlert, setShowCorretorAlert] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Corretor sem comprador indicado → assume responsabilidade solidária
      if (user.role === 'corretor' && !form.comprador) {
        setShowCorretorAlert(true);
        return;
      }
      onSubmit({ ...form, tipo: 'padrao', status: 'pendente' });
    }
  };

  const handleConfirmCorretor = () => {
    setShowCorretorAlert(false);
    onSubmit({ ...form, tipo: 'padrao', status: 'pendente', compradorSolidario: true });
  };

  const isStep1Valid = form.produto && form.quantidade && form.valor && parseFloat(form.valor) > 0;
  const isStep2Valid = form.local && form.destino && form.dataVencimento;
  // Step 3: non-corretores must provide at least the buyer name
  const isStep3Valid = user.role === 'corretor' || form.comprador.trim().length > 0;

  return (
    <>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              s < step ? 'bg-green-600 text-white' : s === step ? 'bg-green-700 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
            }`}>
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Produto e Valores</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fruta / Produto *</label>
            <select className="input-field" value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })} required>
              <option value="">Selecione o produto</option>
              {FRUTAS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Variedade</label>
            <input className="input-field" placeholder="Ex: Pera Rio, Tommy Atkins..." value={form.variedade} onChange={(e) => setForm({ ...form, variedade: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantidade *</label>
              <input className="input-field" placeholder="Ex: 500 caixas" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Classificação</label>
              <input className="input-field" placeholder="Ex: Extra, Cat.1" value={form.classificacao} onChange={(e) => setForm({ ...form, classificacao: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor Total (R$) *</label>
            <input type="number" min="0" className="input-field" placeholder="0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
          </div>
          {form.valor && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <p className="text-xs text-green-700 font-medium">Taxa da plataforma: {formatCurrency(calcularTaxa(parseFloat(form.valor || 0), user.plan))}</p>
              {user.freeTrials > 0 && <p className="text-xs text-green-500 mt-0.5">✓ Este contrato usa 1 dos seus {user.freeTrials} usos gratuitos</p>}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Local e Prazos</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Local de Origem *</label>
            <input className="input-field" placeholder="Cidade, Estado de origem" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destino *</label>
            <input className="input-field" placeholder="Cidade, Estado destino" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data de Entrega</label>
            <input type="date" className="input-field" value={form.dataEntrega} onChange={(e) => setForm({ ...form, dataEntrega: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prazo de Pagamento *</label>
            <input type="date" className="input-field" value={form.dataVencimento} onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })} required />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Dados do Comprador</h3>
          {user.role === 'corretor' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 font-medium">
                Como Corretor: se não indicar um Comprador Final, você assume responsabilidade solidária pela dívida.
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nome do Comprador{user.role !== 'corretor' && ' *'}
            </label>
            <input
              className={`input-field ${user.role !== 'corretor' && !form.comprador ? 'border-red-300' : ''}`}
              placeholder="Nome completo ou razão social"
              value={form.comprador}
              onChange={(e) => setForm({ ...form, comprador: e.target.value })}
            />
            {user.role !== 'corretor' && !form.comprador && (
              <p className="text-xs text-red-500 mt-1">Campo obrigatório para não-corretores.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">CPF / CNPJ do Comprador</label>
            <input className="input-field" placeholder="000.000.000-00" value={form.compradorCPF} onChange={(e) => setForm({ ...form, compradorCPF: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp do Comprador</label>
            <input className="input-field" placeholder="(11) 99999-9999" value={form.compradorWhatsapp} onChange={(e) => setForm({ ...form, compradorWhatsapp: e.target.value })} />
          </div>

          {/* Legal Notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex gap-2">
              <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-800 mb-1">Cláusula de Validade Jurídica</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  "Assinatura Eletrônica Avançada com base no art. 784, § 4º do CPC, dispensando testemunhas. Constitui Título Executivo Extrajudicial nos termos da Lei 14.620/2023."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold">
            <ArrowLeft size={16} /> Voltar
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={
            (step === 1 && !isStep1Valid) ||
            (step === 2 && !isStep2Valid) ||
            (step === 3 && !isStep3Valid)
          }
          className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {step === 3 ? <><Check size={16} /> Gerar Contrato</> : <>Próximo <ArrowRight size={16} /></>}
        </button>
      </div>

      {/* Corretor Alert Modal */}
      <Modal isOpen={showCorretorAlert} onClose={() => setShowCorretorAlert(false)} title="⚠️ Atenção — Corretor">
        <div className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700 mb-2">Responsabilidade Solidária</p>
            <p className="text-sm text-red-600 leading-relaxed">
              Como não há um Comprador Final indicado, <strong>você assume a responsabilidade integral pelo pagamento</strong> desta negociação como Comprador Solidário.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Esta cláusula está em conformidade com o art. 784 do CPC e terá plena validade jurídica.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setStep(3); setShowCorretorAlert(false); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm">
              Indicar Comprador
            </button>
            <button onClick={handleConfirmCorretor} className="flex-1 btn-danger py-3 text-sm">
              Aceitar e Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Venda Antecipada (Futuro)
function FormFuturo({ onSubmit }) {
  const [form, setForm] = useState({
    produto: '',
    variedade: '',
    volumeEstimado: '',
    valor: '',
    valorEntrada: '',
    dataColheita: '',
    dataVencimento: '',
    comprador: '',
    compradorWhatsapp: '',
  });

  const valid = form.produto && form.valor && form.dataColheita && form.comprador;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          Contrato Futuro: o valor é fixado antecipadamente. As partes afastam a teoria da imprevisibilidade para eventos climáticos e variações de preço (STJ).
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fruta / Produto *</label>
        <select className="input-field" value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })}>
          <option value="">Selecione o produto</option>
          {FRUTAS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Volume Estimado</label>
          <input className="input-field" placeholder="Ex: 2.000 kg" value={form.volumeEstimado} onChange={(e) => setForm({ ...form, volumeEstimado: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Variedade</label>
          <input className="input-field" placeholder="Opcional" value={form.variedade} onChange={(e) => setForm({ ...form, variedade: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor Total *</label>
          <input type="number" className="input-field" placeholder="R$ 0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor de Entrada</label>
          <input type="number" className="input-field" placeholder="R$ 0,00" value={form.valorEntrada} onChange={(e) => setForm({ ...form, valorEntrada: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data da Colheita *</label>
          <input type="date" className="input-field" value={form.dataColheita} onChange={(e) => setForm({ ...form, dataColheita: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prazo de Pagamento</label>
          <input type="date" className="input-field" value={form.dataVencimento} onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Comprador *</label>
        <input className="input-field" placeholder="Nome ou razão social" value={form.comprador} onChange={(e) => setForm({ ...form, comprador: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp do Comprador</label>
        <input className="input-field" placeholder="(11) 99999-9999" value={form.compradorWhatsapp} onChange={(e) => setForm({ ...form, compradorWhatsapp: e.target.value })} />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-bold text-gray-700 mb-1">Cláusula de Imprevisibilidade (Bloqueada)</p>
        <p className="text-xs text-gray-500 leading-relaxed italic">
          "As partes afastam expressamente a teoria da imprevisibilidade (CC, art. 478) para eventos climáticos e variações de preço de mercado, conforme jurisprudência consolidada do STJ."
        </p>
      </div>

      <button
        onClick={() => onSubmit({ ...form, tipo: 'futuro', status: 'ativa' })}
        disabled={!valid}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Check size={16} /> Gerar Contrato Futuro
      </button>
    </div>
  );
}

// Giro Rápido (Feirante)
function FormGiro({ onSubmit, user }) {
  const [form, setForm] = useState({ produto: '', valor: '', compradorWhatsapp: '' });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const navigate = useNavigate();

  const LIMITE_FEIRANTE = 5000;
  const volumeAtual = user.monthlyVolume || 0;
  const excedeLimit = volumeAtual + parseFloat(form.valor || 0) > LIMITE_FEIRANTE;
  const valid = form.produto && form.valor && form.compradorWhatsapp;

  const handleSubmit = () => {
    if (excedeLimit) {
      setShowLimitModal(true);
      return;
    }
    onSubmit({ ...form, tipo: 'giro', status: 'pendente', comprador: 'Comprador via Link' });
  };

  return (
    <>
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-2 mb-4">
        <AlertTriangle size={16} className="text-orange-600 flex-shrink-0" />
        <p className="text-xs text-orange-700 font-medium">Giro Rápido — Volume máximo: {formatCurrency(LIMITE_FEIRANTE)}/mês. Usado: {formatCurrency(volumeAtual)}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Produto *</label>
          <select className="input-field" value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })}>
            <option value="">Selecione</option>
            {FRUTAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor Total (R$) *</label>
          <input
            type="number"
            className={`input-field ${excedeLimit && form.valor ? 'border-red-400 bg-red-50' : ''}`}
            placeholder="0,00"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
          />
          {excedeLimit && form.valor && (
            <p className="text-xs text-red-500 mt-1">⚠️ Este valor excede seu limite mensal</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp do Comprador *</label>
          <input className="input-field" placeholder="(11) 99999-9999" value={form.compradorWhatsapp} onChange={(e) => setForm({ ...form, compradorWhatsapp: e.target.value })} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!valid}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Share2 size={18} /> Gerar Link para WhatsApp
        </button>
      </div>

      <Modal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} title="Limite Atingido">
        <div className="text-center">
          <div className="text-4xl mb-4">🔓</div>
          <p className="font-bold text-gray-800 mb-2">Volume mensal excedido!</p>
          <p className="text-sm text-gray-500 mb-1">Feirante: máx. {formatCurrency(LIMITE_FEIRANTE)}/mês</p>
          <p className="text-sm text-gray-500 mb-6">Faça upgrade para o <strong>Plano Mensalista</strong> e negocie sem limites de volume.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="font-bold text-blue-700">Safra Ativa — Mensalista</p>
            <p className="text-sm text-blue-600">Apenas 0,5% por mês • Sem limite de volume</p>
          </div>
          <button onClick={() => { navigate('/perfil'); setShowLimitModal(false); }} className="w-full btn-primary">
            Fazer Upgrade Agora
          </button>
        </div>
      </Modal>
    </>
  );
}

// Success Screen
function SuccessScreen({ neg, tipo, navigate }) {
  const [showPDF, setShowPDF] = useState(false);

  const linkWhatsApp = neg.compradorWhatsapp
    ? gerarLinkWhatsApp(neg.compradorWhatsapp, `Olá! Você tem um contrato TerraForte para assinar. Acesse: https://terraforte.app/c/${neg.id}`)
    : null;

  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={40} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Contrato Gerado!</h2>
      <p className="text-sm text-gray-500 mb-6">Assinado eletronicamente com validade jurídica</p>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left mb-4">
        <div className="flex gap-2">
          <Shield size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-green-800">Assinatura Eletrônica Avançada</p>
            <p className="text-xs text-green-600 leading-relaxed mt-0.5">
              Art. 784, § 4º do CPC — dispensa testemunhas. Título Executivo Extrajudicial (Lei 14.620/2023).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 text-left mb-4 text-xs text-gray-500 font-mono">
        <p>ID: {neg.id}</p>
        <p>IP: {neg.ipAssinatura}</p>
        <p>Timestamp: {new Date(neg.timestampAssinatura).toUTCString()}</p>
      </div>

      <div className="space-y-3">
        {linkWhatsApp && (
          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg"
          >
            <Share2 size={18} /> Enviar para WhatsApp
          </a>
        )}
        <button
          onClick={() => setShowPDF(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
        >
          📄 Visualizar PDF do Contrato
        </button>
        <button onClick={() => navigate('/negociacoes')} className="w-full btn-primary">
          Ver Minhas Negociações
        </button>
      </div>

      <Modal isOpen={showPDF} onClose={() => setShowPDF(false)} title="Pré-visualização do Contrato">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left text-xs text-gray-700 space-y-3 max-h-80 overflow-y-auto">
          <div className="text-center border-b border-gray-200 pb-3">
            <p className="font-bold text-sm">CONTRATO DE {tipo === 'futuro' ? 'COMPRA E VENDA ANTECIPADA' : 'COMPRA E VENDA'}</p>
            <p className="text-gray-500">TerraForte — Plataforma de Proteção Agrícola Digital</p>
          </div>
          <p><strong>ID do Contrato:</strong> {neg.id}</p>
          <p><strong>Produto:</strong> {neg.produto} {neg.variedade ? `(${neg.variedade})` : ''}</p>
          <p><strong>Valor:</strong> {formatCurrency(neg.valor)}</p>
          <p><strong>Comprador:</strong> {neg.comprador || 'A definir'}</p>
          <p><strong>Vencimento:</strong> {neg.dataVencimento ? new Date(neg.dataVencimento).toLocaleDateString('pt-BR') : '—'}</p>
          <div className="border border-blue-200 bg-blue-50 p-3 rounded-lg">
            <p className="font-bold text-blue-800 mb-1">CLÁUSULA DE VALIDADE — ART. 784, § 4º CPC</p>
            <p className="text-blue-700 leading-relaxed">
              "As partes reconhecem a validade jurídica plena desta assinatura eletrônica avançada, nos termos do art. 784, § 4º do Código de Processo Civil, dispensando a necessidade de testemunhas. Este instrumento constitui Título Executivo Extrajudicial nos termos da Lei nº 14.620/2023, podendo ser objeto de execução direta perante o Poder Judiciário."
            </p>
            {tipo === 'futuro' && (
              <p className="text-blue-700 leading-relaxed mt-2">
                "As partes afastam expressamente a teoria da imprevisibilidade (CC, art. 478) para eventos climáticos e variações de preço de mercado, conforme jurisprudência consolidada do Superior Tribunal de Justiça."
              </p>
            )}
          </div>
          <p className="text-gray-500"><strong>IP da Assinatura:</strong> {neg.ipAssinatura}</p>
          <p className="text-gray-500"><strong>Data/Hora (UTC):</strong> {new Date(neg.timestampAssinatura).toUTCString()}</p>
          <p className="text-center text-gray-400 pt-2 border-t border-gray-100">Documento gerado pela TerraForte • terraforte.app</p>
        </div>
      </Modal>
    </div>
  );
}

export default function NovaNegociacao() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const addNegociacao = useStore((s) => s.addNegociacao);
  const [negCriada, setNegCriada] = useState(null);

  const tipoInfo = {
    padrao: { label: 'Compra e Venda', icon: '📦', color: 'from-green-600 to-green-700' },
    futuro: { label: 'Venda Antecipada', icon: '🔮', color: 'from-blue-600 to-blue-700' },
    giro: { label: 'Giro Rápido', icon: '⚡', color: 'from-orange-500 to-orange-600' },
  };

  const info = tipoInfo[tipo] || tipoInfo.padrao;

  const handleSubmit = (formData) => {
    const neg = addNegociacao(formData);
    setNegCriada(neg);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${info.color} text-white px-4 py-5`}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4 text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <h1 className="text-xl font-bold">{info.label}</h1>
            <p className="text-sm opacity-80">Novo Contrato Protegido</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {negCriada ? (
          <div className="card">
            <SuccessScreen neg={negCriada} tipo={tipo} navigate={navigate} />
          </div>
        ) : (
          <div className="card">
            {tipo === 'padrao' && <FormPadrao onSubmit={handleSubmit} user={user} />}
            {tipo === 'futuro' && <FormFuturo onSubmit={handleSubmit} user={user} />}
            {tipo === 'giro' && <FormGiro onSubmit={handleSubmit} user={user} />}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Star, Shield, AlertTriangle, LogOut, ChevronRight,
  Award, Zap, Check, Crown, Store, TrendingUp, Upload
} from 'lucide-react';
import useStore from '../store/useStore';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { getRoleLabel, formatCurrency, sha256, getClientIp } from '../utils/helpers';
import { uploadProvaFile } from '../services/storage.service';
import { isSupabaseEnabled } from '../lib/supabase';

const PLANOS = [
  {
    id: 'transacional',
    icon: '⚡',
    name: 'Transacional',
    price: '1,5% por transação',
    desc: 'Para quem vende esporadicamente',
    features: ['Sem mensalidade', 'Pague por uso', 'Contratos ilimitados', 'Suporte básico'],
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-300',
  },
  {
    id: 'mensalista',
    icon: '🚀',
    name: 'Safra Ativa',
    price: '0,5% / mês acumulado',
    desc: 'Para produtores ativos na safra',
    features: ['Volume ilimitado', 'Taxa menor', 'Dashboard avançado', 'Suporte prioritário'],
    color: 'from-blue-500 to-blue-700',
    borderColor: 'border-blue-300',
    recommended: true,
  },
  {
    id: 'feirante',
    icon: '🏪',
    name: 'Giro Rápido',
    price: 'R$ 29,90/mês',
    desc: 'Exclusivo feirantes — até R$ 5.000/mês',
    features: ['Giro rápido por WhatsApp', 'Até R$ 5.000/mês', 'Link compartilhável', 'Simples e rápido'],
    color: 'from-orange-400 to-orange-600',
    borderColor: 'border-orange-300',
  },
];

export default function Perfil() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const negociacoes = useStore((s) => s.negociacoes);
  const logout = useStore((s) => s.logout);
  const [showDenunciaModal, setShowDenunciaModal] = useState(false);
  const [showPlanosModal, setShowPlanosModal] = useState(false);
  const [showPlanoSuccess, setShowPlanoSuccess] = useState(null);
  const [denunciaForm, setDenunciaForm] = useState({ usuario: '', tipo: '', descricao: '', arquivo: null });
  const [denunciaEnviada, setDenunciaEnviada] = useState(false);
  const addDenuncia = useStore((s) => s.addDenuncia);

  const concluidas = negociacoes.filter((n) => n.status === 'concluida').length;
  const totalVolume = negociacoes.reduce((acc, n) => acc + (n.valor || 0), 0);

  const [denunciaLoading, setDenunciaLoading] = useState(false);
  const [computedHash, setComputedHash] = useState('');

  const handleDenuncia = async () => {
    setDenunciaLoading(true);
    try {
      let hash;
      let arquivoUrl = null;

      if (denunciaForm.arquivo) {
        const arrayBuffer = await denunciaForm.arquivo.arrayBuffer();
        hash = await sha256(arrayBuffer);
        if (isSupabaseEnabled && user?.id) {
          const storagePath = await uploadProvaFile(user.id, denunciaForm.arquivo);
          arquivoUrl = storagePath;
        }
      } else {
        hash = await sha256(denunciaForm.descricao + Date.now());
      }

      const ip = await getClientIp();
      setComputedHash(hash);

      await addDenuncia({
        ...denunciaForm,
        denunciadoNome: denunciaForm.usuario,
        tipoFraude: denunciaForm.tipo,
        hash,
        ip,
        arquivoUrl,
        arquivo: denunciaForm.arquivo?.name || null,
      });
      setDenunciaEnviada(true);
    } catch (err) {
      console.error('[TerraForte] addDenuncia error:', err);
    } finally {
      setDenunciaLoading(false);
    }
  };

  const handleSelecionarPlano = (planoId) => {
    setShowPlanosModal(false);
    setShowPlanoSuccess(planoId);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white px-4 py-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-black">{user?.name?.[0]}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-purple-200 text-sm">{getRoleLabel(user?.role)}</p>
            <p className="text-purple-300 text-xs">{user?.city}, {user?.state}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <StarRating value={user.reputation} size={12} showValue />
            <p className="text-xs text-purple-200 mt-1">Reputação</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{concluidas}</p>
            <p className="text-xs text-purple-200">Concluídas</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-sm font-bold">{formatCurrency(totalVolume)}</p>
            <p className="text-xs text-purple-200">Volume Total</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Plano Atual */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Crown size={16} className="text-yellow-500" /> Meu Plano
            </h2>
            <button
              onClick={() => setShowPlanosModal(true)}
              className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full"
            >
              Upgrade
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-200">Plano atual</p>
                <p className="font-bold text-lg capitalize">{user.plan}</p>
                {user.freeTrials > 0 && (
                  <p className="text-xs text-green-200 mt-0.5">{user.freeTrials} uso(s) gratuito(s) restante(s)</p>
                )}
              </div>
              <Zap size={28} className="text-green-300" />
            </div>
            {user.plan === 'gratuito' && (
              <div className="mt-3 bg-white/10 rounded-lg p-2">
                <div className="flex justify-between text-xs text-green-100 mb-1">
                  <span>Usos gratuitos</span>
                  <span>{user.freeTrials}/3</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5 transition-all"
                    style={{ width: `${((3 - user.freeTrials) / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reputação e Avisos */}
        <div className="card">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <Award size={16} className="text-yellow-500" /> Reputação e Histórico
          </h2>
          <div className="flex items-center gap-4 bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-3">
            <StarRating value={user.reputation} size={20} />
          </div>
          {user.reputation < 4 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">
                Sua reputação está abaixo de 4 estrelas. Pague suas pendências para recuperar o score.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="font-bold text-gray-800">{negociacoes.length}</p>
              <p className="text-xs text-gray-500">Total de Contratos</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="font-bold text-green-700">{concluidas}</p>
              <p className="text-xs text-gray-500">Concluídos no Prazo</p>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="card">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <User size={16} className="text-blue-600" /> Meus Dados
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Email', value: user.email },
              { label: 'CPF/CNPJ', value: user.cpf || '---' },
              { label: 'WhatsApp', value: user.whatsapp || '---' },
              { label: 'Cidade', value: `${user.city}, ${user.state}` },
              { label: 'Perfil', value: getRoleLabel(user.role) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card space-y-1">
          <h2 className="font-bold text-gray-800 mb-3">Ações</h2>
          {[
            {
              icon: AlertTriangle,
              label: 'Denunciar Usuário / Anexar Prova',
              color: 'text-red-500',
              onClick: () => setShowDenunciaModal(true),
            },
            {
              icon: Shield,
              label: 'Provas Forenses (ISO 27037)',
              color: 'text-purple-600',
              onClick: () => navigate('/provas'),
            },
            {
              icon: TrendingUp,
              label: 'Ver Planos e Preços',
              color: 'text-green-600',
              onClick: () => setShowPlanosModal(true),
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
              >
                <Icon size={18} className={item.color} />
                <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-semibold border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Sair da Conta
        </button>

        {/* Legal Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 leading-relaxed">
            TerraForte opera em conformidade com a Lei 14.620/2023, LGPD (Lei 13.709/2018) e padrões ISO 27037 para preservação de provas digitais.
          </p>
        </div>
      </div>

      {/* Denúncia Modal */}
      <Modal isOpen={showDenunciaModal} onClose={() => { setShowDenunciaModal(false); setDenunciaEnviada(false); }} title="🚨 Denunciar Usuário">
        {!denunciaEnviada ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700 leading-relaxed">
                Suas evidências serão coletadas com metadados forenses (IP, data/hora UTC) e registradas com hash SHA-256 para validade pericial (ISO 27037).
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuário Denunciado</label>
              <input className="input-field" placeholder="Nome ou CPF/CNPJ" value={denunciaForm.usuario} onChange={(e) => setDenunciaForm({ ...denunciaForm, usuario: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Fraude</label>
              <select className="input-field" value={denunciaForm.tipo} onChange={(e) => setDenunciaForm({ ...denunciaForm, tipo: e.target.value })}>
                <option value="">Selecione</option>
                <option value="calote">Calote / Não Pagamento</option>
                <option value="produto">Produto de Qualidade Inferior</option>
                <option value="quantidade">Quantidade Incorreta</option>
                <option value="identidade">Fraude de Identidade</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
              <textarea
                className="input-field min-h-24 resize-none"
                placeholder="Descreva o ocorrido com detalhes..."
                value={denunciaForm.descricao}
                onChange={(e) => setDenunciaForm({ ...denunciaForm, descricao: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Anexar Prova (foto/documento)</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 transition-colors">
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Toque para selecionar arquivo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF até 10MB</p>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setDenunciaForm({ ...denunciaForm, arquivo: e.target.files?.[0] })} />
              </label>
              {denunciaForm.arquivo && (
                <p className="text-xs text-green-600 mt-1">✓ {denunciaForm.arquivo.name}</p>
              )}
            </div>
            <button
              onClick={handleDenuncia}
              disabled={!denunciaForm.usuario || !denunciaForm.tipo || !denunciaForm.descricao || denunciaLoading}
              className="w-full btn-danger disabled:opacity-50"
            >
              {denunciaLoading ? 'Registrando...' : 'Registrar Denúncia com Prova Forense'}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">Denúncia Registrada!</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left">
              <p className="text-xs font-bold text-purple-800 mb-2">Hash Blockchain (EOS) — ISO 27037</p>
              <p className="text-xs font-mono text-purple-600 break-all">
                {computedHash}
              </p>
            </div>
            <p className="text-xs text-gray-500">Metadados coletados: IP do navegador, Data/Hora UTC, fingerprint do dispositivo. Registrado em blockchain simulado para validade pericial.</p>
          </div>
        )}
      </Modal>

      {/* Planos Modal */}
      <Modal isOpen={showPlanosModal} onClose={() => setShowPlanosModal(false)} title="📦 Escolha seu Plano">
        <div className="space-y-4">
          {PLANOS.map((plano) => (
            <div
              key={plano.id}
              className={`border-2 ${plano.recommended ? 'border-blue-400' : 'border-gray-100'} rounded-2xl overflow-hidden`}
            >
              {plano.recommended && (
                <div className="bg-blue-600 text-white text-xs font-bold text-center py-1">RECOMENDADO</div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{plano.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{plano.name}</p>
                    <p className="text-sm text-green-700 font-semibold">{plano.price}</p>
                    <p className="text-xs text-gray-500">{plano.desc}</p>
                  </div>
                </div>
                <ul className="space-y-1 mb-4">
                  {plano.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <Check size={12} className="text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelecionarPlano(plano.id)}
                  className={`w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${plano.color} text-white`}
                >
                  Selecionar {plano.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Plano Success Modal */}
      <Modal isOpen={!!showPlanoSuccess} onClose={() => setShowPlanoSuccess(null)} title="✅ Plano Ativado!">
        <div className="text-center py-4 space-y-4">
          <div className="text-5xl">{PLANOS.find(p => p.id === showPlanoSuccess)?.icon || '🎉'}</div>
          <h3 className="font-bold text-xl text-gray-800">
            {PLANOS.find(p => p.id === showPlanoSuccess)?.name} Ativado
          </h3>
          <p className="text-sm text-gray-500">
            Seu plano foi ativado com sucesso. O pagamento será processado via Pix ou cartão.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-xs text-green-700">✓ Integração Asaas (simulada) — pagamento em processamento</p>
          </div>
          <button onClick={() => setShowPlanoSuccess(null)} className="w-full btn-primary">
            Continuar
          </button>
        </div>
      </Modal>
    </div>
  );
}

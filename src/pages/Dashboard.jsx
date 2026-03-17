import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, DollarSign, UserCheck, Shield, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { formatCurrency, getStatusColor, getStatusLabel } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const negociacoes = useStore((s) => s.negociacoes);
  const notifications = useStore((s) => s.notifications);

  const [showNovaModal, setShowNovaModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const vencidas = negociacoes.filter((n) => n.status === 'vencida' || n.status === 'notificada').length;
  const ativas = negociacoes.filter((n) => n.status === 'ativa').length;
  const totalVolume = negociacoes.reduce((acc, n) => acc + (n.valor || 0), 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const tiposNegociacao = [
    {
      type: 'padrao',
      icon: '📦',
      label: 'Compra e Venda',
      sublabel: 'Pronta Entrega',
      desc: 'Negociação padrão com entrega imediata',
      color: 'from-green-500 to-green-600',
      roles: ['produtor', 'comprador', 'corretor'],
    },
    {
      type: 'futuro',
      icon: '🔮',
      label: 'Venda Antecipada',
      sublabel: 'Mercado Futuro',
      desc: 'Valor fixado antes da colheita',
      color: 'from-blue-500 to-blue-700',
      roles: ['produtor', 'comprador', 'corretor'],
    },
    {
      type: 'giro',
      icon: '⚡',
      label: 'Giro Rápido',
      sublabel: 'Exclusivo Feirantes',
      desc: 'Apenas 3 campos, link rápido',
      color: 'from-orange-400 to-orange-600',
      roles: ['feirante'],
    },
  ];

  const handleTipoSelect = (tipo) => {
    if (user.freeTrials <= 0 && user.plan === 'gratuito') {
      setShowNovaModal(false);
      setShowUpgradeModal(true);
      return;
    }
    if (tipo.type === 'giro' && user.role !== 'feirante') {
      return;
    }
    setShowNovaModal(false);
    navigate(`/nova-negociacao/${tipo.type}`);
  };

  return (
    <div className="p-4 space-y-4">
      {/* User Header */}
      <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-200 text-xs font-medium">Olá,</p>
            <h2 className="text-xl font-bold">{user?.name?.split(' ')[0]}</h2>
            <p className="text-green-200 text-xs">{user?.city}, {user?.state}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-xl px-3 py-2">
              <p className="text-xs text-green-200">Reputação</p>
              <StarRating value={user.reputation} size={14} showValue />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">{ativas}</p>
            <p className="text-xs text-green-200">Ativas</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${vencidas > 0 ? 'bg-red-500/30' : 'bg-white/15'}`}>
            <p className="text-xl font-bold">{vencidas}</p>
            <p className="text-xs text-green-200">Vencidas</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-sm font-bold">{formatCurrency(totalVolume)}</p>
            <p className="text-xs text-green-200">Volume</p>
          </div>
        </div>

        {/* Free trials */}
        {user.freeTrials > 0 && (
          <div className="mt-3 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <Zap size={14} className="text-yellow-300" />
            <p className="text-xs text-yellow-200 font-medium">
              {user.freeTrials} {user.freeTrials === 1 ? 'uso gratuito restante' : 'usos gratuitos restantes'}
            </p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {unreadNotifs > 0 && (
        <div
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
          onClick={() => navigate('/notificacoes')}
        >
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">{unreadNotifs} alerta{unreadNotifs > 1 ? 's' : ''} pendente{unreadNotifs > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-500 mt-0.5">Toque para ver detalhes →</p>
          </div>
        </div>
      )}

      {/* 4 Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Nova Negociação */}
        <button
          onClick={() => setShowNovaModal(true)}
          className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 min-h-[140px]"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Plus size={28} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm leading-tight">Nova</p>
            <p className="font-bold text-sm leading-tight">Negociação</p>
          </div>
        </button>

        {/* Minhas Negociações */}
        <button
          onClick={() => navigate('/negociacoes')}
          className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 min-h-[140px]"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <FileText size={28} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm leading-tight">Minhas</p>
            <p className="font-bold text-sm leading-tight">Negociações</p>
            <span className="mt-1 bg-white/30 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {negociacoes.length}
            </span>
          </div>
        </button>

        {/* Cobranças */}
        <button
          onClick={() => navigate('/cobrancas')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 min-h-[140px]"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <DollarSign size={28} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm leading-tight">Cobranças</p>
            <p className="font-bold text-sm leading-tight">/ Faturas</p>
            {vencidas > 0 && (
              <span className="mt-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {vencidas} urgente{vencidas > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </button>

        {/* Perfil e Reputação */}
        <button
          onClick={() => navigate('/perfil')}
          className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 min-h-[140px]"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <UserCheck size={28} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm leading-tight">Perfil e</p>
            <p className="font-bold text-sm leading-tight">Reputação</p>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" />
            Atividade Recente
          </h3>
          <button onClick={() => navigate('/negociacoes')} className="text-xs text-green-600 font-semibold">
            Ver todas →
          </button>
        </div>
        <div className="space-y-2">
          {negociacoes.slice(0, 3).map((neg) => {
            const colors = getStatusColor(neg.status);
            return (
              <button
                key={neg.id}
                onClick={() => navigate(`/negociacoes/${neg.id}`)}
                className="w-full bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                  <span className="text-base">
                    {neg.tipo === 'padrao' ? '📦' : neg.tipo === 'futuro' ? '🔮' : '⚡'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{neg.produto}</p>
                  <p className="text-xs text-gray-400 truncate">{neg.comprador}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-gray-800">{formatCurrency(neg.valor)}</p>
                  <span className={`text-xs font-medium ${colors.text}`}>{getStatusLabel(neg.status)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legal Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-800">Assinatura Eletrônica Avançada</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Art. 784, § 4º do CPC — todos os contratos dispõem de validade jurídica dispensando testemunhas.
          </p>
        </div>
      </div>

      {/* Nova Negociação Modal */}
      <Modal isOpen={showNovaModal} onClose={() => setShowNovaModal(false)} title="Nova Negociação">
        <p className="text-sm text-gray-500 mb-4">Escolha o tipo de negociação:</p>
        <div className="space-y-3">
          {tiposNegociacao.map((tipo) => {
            const disabled = tipo.type === 'giro' && user.role !== 'feirante';
            return (
              <button
                key={tipo.type}
                onClick={() => !disabled && handleTipoSelect(tipo)}
                disabled={disabled}
                className={`w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50 border border-gray-100'
                    : 'bg-gradient-to-r ' + tipo.color + ' text-white shadow-lg hover:shadow-xl active:scale-95'
                }`}
              >
                <div className="text-3xl">{tipo.icon}</div>
                <div>
                  <p className="font-bold text-sm">{tipo.label}</p>
                  <p className="text-xs opacity-80">{tipo.sublabel}</p>
                  <p className="text-xs opacity-70 mt-0.5">{tipo.desc}</p>
                </div>
                {disabled && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    Apenas feirantes
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Upgrade Modal */}
      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Limite Gratuito Atingido">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-gray-700 font-semibold mb-2">Seus 3 usos gratuitos foram utilizados</p>
          <p className="text-sm text-gray-500 mb-6">Escolha um plano para continuar protegendo seus negócios:</p>
          <div className="space-y-3">
            <div className="border-2 border-green-500 rounded-2xl p-4 bg-green-50">
              <p className="font-bold text-green-700">Transacional</p>
              <p className="text-sm text-green-600">1,5% por transação</p>
              <p className="text-xs text-gray-500 mt-1">Ideal para vendas esporádicas</p>
            </div>
            <div className="border-2 border-blue-500 rounded-2xl p-4 bg-blue-50">
              <p className="font-bold text-blue-700">Safra Ativa (Mensalista)</p>
              <p className="text-sm text-blue-600">0,5% acumulado/mês</p>
              <p className="text-xs text-gray-500 mt-1">Para produtores ativos</p>
            </div>
            <div className="border-2 border-orange-400 rounded-2xl p-4 bg-orange-50">
              <p className="font-bold text-orange-700">Feirante — Giro Rápido</p>
              <p className="text-sm text-orange-600">R$ 29,90/mês — até R$ 5.000 volume</p>
              <p className="text-xs text-gray-500 mt-1">Volume rápido, preço fixo</p>
            </div>
          </div>
          <button
            onClick={() => { navigate('/perfil'); setShowUpgradeModal(false); }}
            className="w-full btn-primary mt-4"
          >
            Ver Planos e Assinar
          </button>
        </div>
      </Modal>
    </div>
  );
}

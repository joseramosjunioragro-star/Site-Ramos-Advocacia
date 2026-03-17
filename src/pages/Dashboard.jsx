import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, DollarSign, UserCheck, Shield,
  AlertCircle, TrendingUp, Zap, ChevronRight,
  Wheat, ArrowUpRight,
} from 'lucide-react';
import useStore from '../store/useStore';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { formatCurrency, getStatusColor, getStatusLabel, getRoleLabel, diasParaVencer } from '../utils/helpers';

// ─── Contract type definitions ───────────────────────────────────────────────
const TIPOS_NEGOCIACAO = [
  {
    type: 'padrao',
    icon: '📦',
    label: 'Compra e Venda',
    sublabel: 'Pronta Entrega',
    desc: 'Negociação padrão com entrega imediata',
    gradient: 'from-green-500 to-green-600',
    feirante: false,
  },
  {
    type: 'futuro',
    icon: '🔮',
    label: 'Venda Antecipada',
    sublabel: 'Mercado Futuro',
    desc: 'Valor fixado antes da colheita',
    gradient: 'from-blue-500 to-blue-700',
    feirante: false,
  },
  {
    type: 'giro',
    icon: '⚡',
    label: 'Giro Rápido',
    sublabel: 'Exclusivo Feirantes',
    desc: 'Apenas 3 campos, link rápido',
    gradient: 'from-orange-400 to-orange-600',
    feirante: true,
  },
];

// ─── Action button data ───────────────────────────────────────────────────────
function useActionButtons(negociacoes, navigate, setShowNovaModal) {
  const vencidas = negociacoes.filter(
    (n) => n.status === 'vencida' || n.status === 'notificada' || n.status === 'em_execucao',
  ).length;
  const ativas = negociacoes.filter((n) => n.status === 'ativa').length;
  const pendentes = negociacoes.filter((n) => n.status === 'pendente').length;

  return [
    {
      label: 'Nova',
      sublabel: 'Negociação',
      icon: Plus,
      gradient: 'from-emerald-500 to-green-700',
      shadow: 'shadow-emerald-200',
      onClick: () => setShowNovaModal(true),
      badge: null,
      meta: 'Criar contrato protegido',
    },
    {
      label: 'Meus',
      sublabel: 'Contratos',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-200',
      onClick: () => navigate('/negociacoes'),
      badge: negociacoes.length > 0 ? negociacoes.length : null,
      badgeColor: 'bg-white/25',
      meta: `${ativas} ativo${ativas !== 1 ? 's' : ''} • ${pendentes} pendente${pendentes !== 1 ? 's' : ''}`,
    },
    {
      label: 'Cobranças',
      sublabel: 'e Faturas',
      icon: DollarSign,
      gradient: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-200',
      onClick: () => navigate('/cobrancas'),
      badge: vencidas > 0 ? vencidas : null,
      badgeColor: 'bg-red-500',
      badgePulse: true,
      meta: vencidas > 0 ? `${vencidas} urgente${vencidas !== 1 ? 's' : ''}` : 'Tudo em dia',
    },
    {
      label: 'Perfil',
      sublabel: 'e Reputação',
      icon: UserCheck,
      gradient: 'from-violet-500 to-purple-700',
      shadow: 'shadow-violet-200',
      onClick: () => navigate('/perfil'),
      badge: null,
      meta: 'Score e planos',
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionButton({ btn, index }) {
  const Icon = btn.icon;
  return (
    <button
      onClick={btn.onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`
        relative bg-gradient-to-br ${btn.gradient} text-white rounded-2xl p-4
        flex flex-col justify-between gap-2 shadow-lg ${btn.shadow}
        min-h-[130px] transition-all duration-200
        hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl
        active:scale-95 active:brightness-95
        fade-up
      `}
    >
      {/* Badge */}
      {btn.badge !== null && (
        <span
          className={`
            absolute top-3 right-3 min-w-[22px] h-[22px] px-1.5 rounded-full
            text-white text-xs font-black flex items-center justify-center
            ${btn.badgeColor ?? 'bg-white/25'}
            ${btn.badgePulse ? 'ring-2 ring-white/40 animate-pulse' : ''}
          `}
        >
          {btn.badge}
        </span>
      )}

      {/* Icon */}
      <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
        <Icon size={22} strokeWidth={2.2} />
      </div>

      {/* Label */}
      <div>
        <p className="font-black text-[15px] leading-tight">{btn.label}</p>
        <p className="font-black text-[15px] leading-tight opacity-90">{btn.sublabel}</p>
        <p className="text-[11px] opacity-60 mt-1 leading-tight">{btn.meta}</p>
      </div>
    </button>
  );
}

function StatPill({ value, label, highlight }) {
  return (
    <div className={`rounded-xl p-3 text-center flex-1 ${highlight ? 'bg-red-500/30 ring-1 ring-red-400/40' : 'bg-white/15'}`}>
      <p className="text-lg font-black leading-none">{value}</p>
      <p className="text-[11px] text-white/70 mt-0.5 font-medium">{label}</p>
    </div>
  );
}

function ActivityRow({ neg, onClick, index }) {
  const colors = getStatusColor(neg.status);
  const dias = diasParaVencer(neg.dataVencimento);
  const isUrgent = dias !== null && dias < 0;

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
      className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left fade-up"
    >
      {/* Type icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
        <span className="text-lg leading-none">
          {neg.tipo === 'padrao' ? '📦' : neg.tipo === 'futuro' ? '🔮' : '⚡'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate leading-tight">{neg.produto}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{neg.comprador || 'Comprador a confirmar'}</p>
      </div>

      {/* Value + status */}
      <div className="text-right flex-shrink-0 flex items-center gap-2">
        <div>
          <p className="font-bold text-sm text-gray-800 leading-tight">{formatCurrency(neg.valor)}</p>
          <p className={`text-[11px] font-semibold mt-0.5 ${isUrgent ? 'text-red-500' : colors.text}`}>
            {isUrgent ? `${Math.abs(dias)}d vencido` : getStatusLabel(neg.status)}
          </p>
        </div>
        <ChevronRight size={14} className="text-gray-300" />
      </div>
    </button>
  );
}

function FreeTrialsBar({ used, total }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="mt-3 bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/15">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-yellow-300" />
          <p className="text-xs text-yellow-200 font-semibold">
            {total - used} uso{total - used !== 1 ? 's' : ''} gratuito{total - used !== 1 ? 's' : ''} restante{total - used !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-xs text-white/50 font-medium">{used}/{total}</p>
      </div>
      <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full trials-bar"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const negociacoes = useStore((s) => s.negociacoes);
  const notifications = useStore((s) => s.notifications);

  const [showNovaModal, setShowNovaModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const vencidas = negociacoes.filter(
    (n) => n.status === 'vencida' || n.status === 'notificada' || n.status === 'em_execucao',
  ).length;
  const ativas = negociacoes.filter((n) => n.status === 'ativa').length;
  const totalVolume = negociacoes.reduce((acc, n) => acc + (n.valor || 0), 0);
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const freeTrialsUsed = 3 - user.freeTrials;

  const actionButtons = useActionButtons(negociacoes, navigate, setShowNovaModal);

  const handleTipoSelect = (tipo) => {
    if (user.freeTrials <= 0 && user.plan === 'gratuito') {
      setShowNovaModal(false);
      setShowUpgradeModal(true);
      return;
    }
    if (tipo.feirante && user.role !== 'feirante') return;
    setShowNovaModal(false);
    navigate(`/nova-negociacao/${tipo.type}`);
  };

  return (
    <div className="pb-2">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 px-4 pt-5 pb-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        {/* User row */}
        <div className="flex items-center gap-3 mb-5 relative">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-black text-white">{user?.name?.[0]}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs font-medium">Bem-vindo de volta,</p>
            <p className="text-white font-black text-lg leading-tight truncate">
              {user?.name?.split(' ')[0]}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full font-medium">
                {getRoleLabel(user?.role)}
              </span>
              <span className="text-[11px] text-white/40">{user?.city}, {user?.state}</span>
            </div>
          </div>

          {/* Reputation */}
          <div className="bg-white/10 rounded-xl px-3 py-2 text-center border border-white/15 flex-shrink-0">
            <p className="text-[10px] text-white/50 font-medium mb-0.5">Score</p>
            <StarRating value={user.reputation} size={13} showValue light />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 relative">
          <StatPill value={ativas} label="Ativas" />
          <StatPill value={vencidas} label="Vencidas" highlight={vencidas > 0} />
          <StatPill value={formatCurrency(totalVolume)} label="Volume total" />
        </div>

        {/* Free trials */}
        {user.freeTrials > 0 && (
          <FreeTrialsBar used={freeTrialsUsed} total={3} />
        )}
        {user.freeTrials === 0 && user.plan === 'gratuito' && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-3.5 py-2.5"
          >
            <Zap size={13} className="text-yellow-300" />
            <p className="text-xs text-yellow-200 font-semibold">Usos gratuitos esgotados — Ver planos</p>
            <ArrowUpRight size={12} className="text-yellow-300 ml-auto" />
          </button>
        )}
      </div>

      <div className="px-4 space-y-5 pt-4">

        {/* ── Urgent alert ──────────────────────────────────────────────────── */}
        {unreadNotifs > 0 && (
          <button
            onClick={() => navigate('/notificacoes')}
            className="w-full bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-left alert-pulse"
          >
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-700 leading-tight">
                {unreadNotifs} alerta{unreadNotifs !== 1 ? 's' : ''} pendente{unreadNotifs !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-400 mt-0.5">Toque para ver detalhes</p>
            </div>
            <ChevronRight size={16} className="text-red-300 flex-shrink-0" />
          </button>
        )}

        {/* ── 4 Action buttons ─────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {actionButtons.map((btn, i) => (
              <ActionButton key={btn.label} btn={btn} index={i} />
            ))}
          </div>
        </div>

        {/* ── Recent activity ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={13} className="text-green-500" />
              Atividade recente
            </p>
            <button
              onClick={() => navigate('/negociacoes')}
              className="text-xs text-green-600 font-bold flex items-center gap-0.5"
            >
              Ver todas <ChevronRight size={12} />
            </button>
          </div>

          {negociacoes.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <Wheat size={26} className="text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">Nenhum contrato ainda</p>
                <p className="text-xs text-gray-400 mt-0.5">Crie sua primeira negociação protegida</p>
              </div>
              <button
                onClick={() => setShowNovaModal(true)}
                className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-200"
              >
                + Nova negociação
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {negociacoes.slice(0, 4).map((neg, i) => (
                <ActivityRow
                  key={neg.id}
                  neg={neg}
                  index={i}
                  onClick={() => navigate(`/negociacoes/${neg.id}`)}
                />
              ))}

              {/* Volume footer */}
              {negociacoes.length > 0 && (
                <div className="flex items-center justify-between pt-1 px-1">
                  <p className="text-xs text-gray-400">
                    {negociacoes.length} contrato{negociacoes.length !== 1 ? 's' : ''} no total
                  </p>
                  <p className="text-xs font-bold text-gray-600">{formatCurrency(totalVolume)} em volume</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Legal banner ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-2">
          <Shield size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-600 leading-relaxed">
            <span className="font-bold">Assinatura Eletrônica Avançada</span> — art. 784 §4º do CPC.
            Contratos com validade de Título Executivo Extrajudicial (Lei 14.620/2023).
          </p>
        </div>

      </div>

      {/* ── Nova Negociação modal ─────────────────────────────────────────────── */}
      <Modal isOpen={showNovaModal} onClose={() => setShowNovaModal(false)} title="Nova Negociação">
        <p className="text-sm text-gray-500 mb-4">Escolha o tipo de contrato:</p>
        <div className="space-y-2.5">
          {TIPOS_NEGOCIACAO.map((tipo) => {
            const disabled = tipo.feirante && user.role !== 'feirante';
            return (
              <button
                key={tipo.type}
                onClick={() => !disabled && handleTipoSelect(tipo)}
                disabled={disabled}
                className={`
                  w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all
                  ${disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50 border border-gray-100'
                    : `bg-gradient-to-r ${tipo.gradient} text-white shadow-md hover:shadow-lg active:scale-[0.98]`
                  }
                `}
              >
                <span className="text-3xl">{tipo.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{tipo.label}</p>
                  <p className="text-xs opacity-75 mt-0.5">{tipo.sublabel} — {tipo.desc}</p>
                </div>
                {disabled
                  ? <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full flex-shrink-0">Só feirantes</span>
                  : <ChevronRight size={16} className="text-white/60 flex-shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </Modal>

      {/* ── Upgrade / paywall modal ───────────────────────────────────────────── */}
      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Limite Gratuito Atingido">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">🔒</div>
          <p className="text-gray-800 font-bold mb-1">3 usos gratuitos utilizados</p>
          <p className="text-sm text-gray-500 mb-5">Escolha um plano para continuar protegendo seus negócios:</p>
          <div className="space-y-2 text-left">
            {[
              { color: 'border-green-400 bg-green-50', name: 'Transacional', price: '1,5% por transação', desc: 'Ideal para vendas esporádicas' },
              { color: 'border-blue-400 bg-blue-50', name: 'Safra Ativa', price: '0,5% acumulado/mês', desc: 'Para produtores ativos na safra', highlight: true },
              { color: 'border-orange-400 bg-orange-50', name: 'Giro Rápido', price: 'R$ 29,90/mês', desc: 'Feirantes — até R$ 5.000/mês' },
            ].map((p) => (
              <div key={p.name} className={`border-2 ${p.color} rounded-xl p-3 flex items-center justify-between`}>
                <div>
                  <p className="font-bold text-sm text-gray-800">{p.name} {p.highlight && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full ml-1">Popular</span>}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                </div>
                <p className="text-xs font-bold text-gray-700 flex-shrink-0 ml-3">{p.price}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => { navigate('/perfil'); setShowUpgradeModal(false); }}
            className="w-full btn-primary mt-5"
          >
            Ver Planos e Assinar
          </button>
        </div>
      </Modal>
    </div>
  );
}

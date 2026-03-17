import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, DollarSign, Gavel, ChevronRight, TrendingDown } from 'lucide-react';
import useStore from '../store/useStore';
import { formatCurrency, diasParaVencer } from '../utils/helpers';

export default function Cobrancas() {
  const navigate = useNavigate();
  const negociacoes = useStore((s) => s.negociacoes);

  const vencidas = negociacoes.filter((n) => n.status === 'vencida');
  const notificadas = negociacoes.filter((n) => n.status === 'notificada');
  const emExecucao = negociacoes.filter((n) => n.status === 'em_execucao');
  const ativas = negociacoes.filter((n) => n.status === 'ativa');
  const pendentes = negociacoes.filter((n) => n.status === 'pendente');

  const totalInadimplente = [...vencidas, ...notificadas, ...emExecucao]
    .reduce((acc, n) => acc + (n.valor || 0), 0);

  const totalAReceber = [...ativas, ...pendentes]
    .reduce((acc, n) => acc + (n.valor || 0), 0);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 py-5">
        <h1 className="text-xl font-bold mb-4">Cobranças e Faturas</h1>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-500/30 border border-red-400/30 rounded-2xl p-4">
            <p className="text-xs text-red-200 mb-1">Inadimplente</p>
            <p className="text-xl font-black">{formatCurrency(totalInadimplente)}</p>
            <p className="text-xs text-red-200 mt-0.5">{vencidas.length + notificadas.length + emExecucao.length} contratos</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-4">
            <p className="text-xs text-orange-200 mb-1">A Receber</p>
            <p className="text-xl font-black">{formatCurrency(totalAReceber)}</p>
            <p className="text-xs text-orange-200 mt-0.5">{ativas.length + pendentes.length} contratos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Urgente - Vencidas */}
        {(vencidas.length > 0 || notificadas.length > 0 || emExecucao.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-500" />
              <h2 className="font-bold text-red-700">Urgente — Ação Necessária</h2>
            </div>
            <div className="space-y-2">
              {[...emExecucao, ...notificadas, ...vencidas].map((neg) => {
                const dias = diasParaVencer(neg.dataVencimento);
                const statusConfig = {
                  em_execucao: { bg: 'bg-red-700', text: 'Em Execução Judicial', icon: Gavel, textColor: 'text-white' },
                  notificada: { bg: 'bg-orange-500', text: 'Notificado', icon: AlertCircle, textColor: 'text-white' },
                  vencida: { bg: 'bg-red-100', text: 'Vencida', icon: TrendingDown, textColor: 'text-red-800' },
                };
                const cfg = statusConfig[neg.status] || statusConfig.vencida;
                const Icon = cfg.icon;

                return (
                  <button
                    key={neg.id}
                    onClick={() => navigate(`/negociacoes/${neg.id}`)}
                    className={`w-full ${neg.status === 'em_execucao' ? 'bg-red-700 text-white' : neg.status === 'notificada' ? 'bg-orange-500 text-white' : 'bg-white border border-red-100'} rounded-2xl p-4 text-left shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={14} className={neg.status !== 'vencida' ? 'text-white' : 'text-red-500'} />
                          <span className={`text-xs font-bold ${neg.status !== 'vencida' ? 'text-white/80' : 'text-red-500'}`}>
                            {cfg.text}
                          </span>
                        </div>
                        <p className={`font-bold ${neg.status !== 'vencida' ? 'text-white' : 'text-gray-800'}`}>{neg.produto}</p>
                        <p className={`text-xs ${neg.status !== 'vencida' ? 'text-white/70' : 'text-gray-500'}`}>{neg.comprador}</p>
                        <p className={`text-xs mt-1 font-medium ${neg.status !== 'vencida' ? 'text-white/80' : 'text-red-500'}`}>
                          Venceu há {Math.abs(dias || 0)} dias
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${neg.status !== 'vencida' ? 'text-white' : 'text-red-700'}`}>
                          {formatCurrency(neg.valor)}
                        </p>
                        <ChevronRight size={16} className={neg.status !== 'vencida' ? 'text-white/50 ml-auto' : 'text-red-300 ml-auto'} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* A Receber */}
        {(ativas.length > 0 || pendentes.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-green-600" />
              <h2 className="font-bold text-gray-800">A Receber</h2>
            </div>
            <div className="space-y-2">
              {[...ativas, ...pendentes].map((neg) => {
                const dias = diasParaVencer(neg.dataVencimento);
                return (
                  <button
                    key={neg.id}
                    onClick={() => navigate(`/negociacoes/${neg.id}`)}
                    className="w-full bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${neg.status === 'ativa' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {neg.status === 'ativa' ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{neg.produto}</p>
                      <p className="text-xs text-gray-500 truncate">{neg.comprador}</p>
                      {dias !== null && (
                        <p className={`text-xs font-medium ${dias <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {dias > 0 ? `Vence em ${dias} dias` : 'Vencimento hoje'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatCurrency(neg.valor)}</p>
                      <ChevronRight size={14} className="text-gray-300 ml-auto" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Resumo financeiro */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-green-600" /> Resumo Financeiro
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Total de contratos', value: negociacoes.length, unit: 'contratos' },
              { label: 'Volume total negociado', value: formatCurrency(negociacoes.reduce((a, n) => a + (n.valor || 0), 0)), unit: '' },
              { label: 'Em dia / Pendente', value: formatCurrency(totalAReceber), unit: '' },
              { label: 'Inadimplente', value: formatCurrency(totalInadimplente), unit: '', danger: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className={`font-bold text-sm ${item.danger ? 'text-red-600' : 'text-gray-800'}`}>
                  {item.value} {item.unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {negociacoes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💰</div>
            <p className="text-gray-500 font-medium">Nenhuma cobrança pendente</p>
            <p className="text-sm text-gray-400 mt-1">Todos os contratos estão em dia!</p>
          </div>
        )}
      </div>
    </div>
  );
}

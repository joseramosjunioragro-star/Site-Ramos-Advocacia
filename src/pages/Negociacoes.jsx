import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import useStore from '../store/useStore';
import NegociacaoCard from '../components/NegociacaoCard';

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'ativa', label: 'Ativas' },
  { key: 'vencida', label: 'Vencidas' },
  { key: 'concluida', label: 'Concluídas' },
];

export default function Negociacoes() {
  const navigate = useNavigate();
  const negociacoes = useStore((s) => s.negociacoes);
  const [tab, setTab] = useState('todas');
  const [search, setSearch] = useState('');

  const filtered = negociacoes.filter((n) => {
    const matchTab = tab === 'todas' || n.status === tab ||
      (tab === 'vencida' && (n.status === 'vencida' || n.status === 'notificada' || n.status === 'em_execucao'));
    const matchSearch = !search ||
      n.produto?.toLowerCase().includes(search.toLowerCase()) ||
      n.comprador?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    todas: negociacoes.length,
    pendente: negociacoes.filter((n) => n.status === 'pendente').length,
    ativa: negociacoes.filter((n) => n.status === 'ativa').length,
    vencida: negociacoes.filter((n) => ['vencida', 'notificada', 'em_execucao'].includes(n.status)).length,
    concluida: negociacoes.filter((n) => n.status === 'concluida').length,
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Minhas Negociações</h1>
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
          <input
            className="w-full bg-white/20 text-white placeholder-blue-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
            placeholder="Buscar produto ou comprador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-400'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">Nenhuma negociação encontrada</p>
            <p className="text-sm text-gray-400 mt-1">Crie uma nova negociação para começar</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 btn-primary px-6 py-3"
            >
              Nova Negociação
            </button>
          </div>
        ) : (
          filtered.map((neg) => <NegociacaoCard key={neg.id} neg={neg} />)
        )}
      </div>
    </div>
  );
}

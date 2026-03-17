import { create } from 'zustand';

const mockUser = {
  id: 'user-001',
  name: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@example.com',
  whatsapp: '(11) 99999-9999',
  city: 'Ribeirão Preto',
  state: 'SP',
  role: 'produtor',
  reputation: 4.5,
  freeTrials: 3,
  plan: 'gratuito',
  monthlyVolume: 0,
};

const mockNegociacoes = [
  {
    id: 'neg-001',
    tipo: 'padrao',
    produto: 'Laranja Pera',
    variedade: 'Pera Rio',
    quantidade: '500 caixas',
    valor: 12500,
    comprador: 'Maria Santos',
    compradorWhatsapp: '(11) 98888-8888',
    dataVencimento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'vencida',
    local: 'Matão, SP',
    destino: 'São Paulo, SP',
    ipAssinatura: '177.92.1.45',
    timestampAssinatura: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    aditivos: [],
  },
  {
    id: 'neg-002',
    tipo: 'futuro',
    produto: 'Manga Tommy',
    variedade: 'Tommy Atkins',
    quantidade: '1000 kg estimados',
    valor: 8000,
    valorEntrada: 2000,
    comprador: 'Distribuidora Fresca Ltda',
    compradorWhatsapp: '(62) 97777-7777',
    dataVencimento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    dataColheita: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ativa',
    local: 'Petrolina, PE',
    destino: 'Goiânia, GO',
    ipAssinatura: '200.162.45.10',
    timestampAssinatura: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aditivos: [],
  },
  {
    id: 'neg-003',
    tipo: 'giro',
    produto: 'Banana Prata',
    valor: 450,
    comprador: 'Pedro Feirante',
    compradorWhatsapp: '(21) 96666-6666',
    dataVencimento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pendente',
    ipAssinatura: null,
    timestampAssinatura: null,
    aditivos: [],
  },
  {
    id: 'neg-004',
    tipo: 'padrao',
    produto: 'Uva Itália',
    variedade: 'Itália',
    quantidade: '200 caixas',
    valor: 6400,
    comprador: 'Supermercado Central',
    compradorWhatsapp: '(16) 95555-5555',
    dataVencimento: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dataCriacao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'concluida',
    local: 'Jales, SP',
    destino: 'Ribeirão Preto, SP',
    ipAssinatura: '189.28.200.3',
    timestampAssinatura: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    aditivos: [],
  },
];

const mockDenuncias = [];

const useStore = create((set, get) => ({
  // Auth
  isAuthenticated: true,
  user: mockUser,

  // Negociações
  negociacoes: mockNegociacoes,
  denuncias: mockDenuncias,

  // Notifications
  notifications: [
    { id: 'n1', message: 'Sua negociação com Distribuidora Fresca vence em 45 dias', type: 'info', read: false },
    { id: 'n2', message: 'Negociação com Maria Santos está VENCIDA há 5 dias', type: 'danger', read: false },
  ],

  login: (userData) => set({ isAuthenticated: true, user: { ...mockUser, ...userData } }),
  logout: () => set({ isAuthenticated: false, user: null }),

  addNegociacao: (neg) => {
    const newNeg = {
      ...neg,
      id: `neg-${Date.now()}`,
      dataCriacao: new Date().toISOString(),
      ipAssinatura: '177.92.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      timestampAssinatura: new Date().toISOString(),
      aditivos: [],
    };
    set((state) => ({
      negociacoes: [newNeg, ...state.negociacoes],
      user: {
        ...state.user,
        freeTrials: state.user.freeTrials > 0 ? state.user.freeTrials - 1 : 0,
        monthlyVolume: state.user.monthlyVolume + (neg.valor || 0),
      },
    }));
    return newNeg;
  },

  updateNegociacao: (id, updates) => set((state) => ({
    negociacoes: state.negociacoes.map((n) => n.id === id ? { ...n, ...updates } : n),
  })),

  addAditivo: (negId, aditivo) => set((state) => ({
    negociacoes: state.negociacoes.map((n) =>
      n.id === negId
        ? {
            ...n,
            dataVencimento: aditivo.novaData,
            aditivos: [...n.aditivos, {
              ...aditivo,
              id: `adi-${Date.now()}`,
              dataCriacao: new Date().toISOString(),
              status: 'pendente',
            }],
          }
        : n
    ),
  })),

  // Clamp reputation between 1.0 and 5.0
  _adjustReputation: (current, delta) => Math.min(5.0, Math.max(1.0, +(current + delta).toFixed(1))),

  aceitarAditivo: (negId, aditivoId) => set((state) => ({
    // Score is NOT penalized when an aditivo is mutually accepted — only update status
    negociacoes: state.negociacoes.map((n) =>
      n.id === negId
        ? {
            ...n,
            // Also update the contract due date to the accepted new date
            dataVencimento: n.aditivos.find((a) => a.id === aditivoId)?.novaData || n.dataVencimento,
            status: 'ativa',
            aditivos: n.aditivos.map((a) =>
              a.id === aditivoId ? { ...a, status: 'aceito', aceitoEm: new Date().toISOString() } : a
            ),
          }
        : n
    ),
  })),

  executarDivida: (negId) => set((state) => {
    // Penalizar reputação do credor logado pelo não recebimento (−0.5)
    const newReputation = Math.min(5.0, Math.max(1.0, +(state.user.reputation - 0.5).toFixed(1)));
    return {
      negociacoes: state.negociacoes.map((n) =>
        n.id === negId ? { ...n, status: 'em_execucao' } : n
      ),
      // In production this would target the debtor's record via Supabase RPC
      user: { ...state.user, reputation: newReputation },
    };
  }),

  notificarDevedor: (negId) => set((state) => ({
    negociacoes: state.negociacoes.map((n) =>
      n.id === negId ? { ...n, status: 'notificada' } : n
    ),
    // Penalizar score do usuário logado em −0.5 ao notificar devedor
    user: {
      ...state.user,
      reputation: Math.min(5.0, Math.max(1.0, +(state.user.reputation - 0.5).toFixed(1))),
    },
  })),

  darBaixa: (negId) => set((state) => ({
    negociacoes: state.negociacoes.map((n) =>
      n.id === negId ? { ...n, status: 'concluida' } : n
    ),
  })),

  addDenuncia: (denuncia) => set((state) => ({
    denuncias: [{
      ...denuncia,
      id: `den-${Date.now()}`,
      dataCriacao: new Date().toISOString(),
      ip: '177.92.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      timestampUTC: new Date().toUTCString(),
      hash: gerarHashSHA256(denuncia.descricao + Date.now()),
    }, ...state.denuncias],
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),

  clearNotifications: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
}));

function gerarHashSHA256(str) {
  // Simulated deterministic hash for demo
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex + hex + hex + hex + hex).substring(0, 64).toUpperCase();
}

export default useStore;

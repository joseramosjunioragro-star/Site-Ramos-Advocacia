import { create } from 'zustand';
import { isSupabaseEnabled } from '../lib/supabase';
import { signOut } from '../services/auth.service';
import * as negService from '../services/negociacoes.service';
import * as aditivoService from '../services/aditivos.service';
import * as notifService from '../services/notificacoes.service';
import * as denunciaService from '../services/denuncias.service';
import * as usuariosService from '../services/usuarios.service';

// ─── Mock data (offline / demo mode) ────────────────────────────────────────

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

// ─── Store ───────────────────────────────────────────────────────────────────

const useStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  isAuthenticated: !isSupabaseEnabled, // auto-authenticated in offline mode
  isInitialized: false,
  isLoading: false,
  user: isSupabaseEnabled ? null : mockUser,
  negociacoes: isSupabaseEnabled ? [] : mockNegociacoes,
  denuncias: [],
  notifications: isSupabaseEnabled
    ? []
    : [
        { id: 'n1', message: 'Sua negociação com Distribuidora Fresca vence em 45 dias', type: 'info', read: false },
        { id: 'n2', message: 'Negociação com Maria Santos está VENCIDA há 5 dias', type: 'danger', read: false },
      ],

  // ── Init ───────────────────────────────────────────────────────────────────
  initialize: async (session) => {
    if (!isSupabaseEnabled) {
      set({ isInitialized: true });
      return;
    }

    if (!session) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const [profile, negs, notifs] = await Promise.all([
        usuariosService.getProfile(session.user.id),
        negService.listNegociacoes(session.user.id),
        notifService.listNotificacoes(session.user.id),
      ]);

      set({
        isAuthenticated: true,
        user: profile || { id: session.user.id, email: session.user.email, role: 'produtor', freeTrials: 3, plan: 'gratuito', reputation: 5.0, monthlyVolume: 0 },
        negociacoes: negs,
        notifications: notifs,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err) {
      console.error('[TerraForte] initialize error:', err);
      set({ isInitialized: true, isLoading: false });
    }
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  login: (userData) => set({ isAuthenticated: true, user: { ...mockUser, ...userData } }),

  logout: async () => {
    if (isSupabaseEnabled) {
      try { await signOut(); } catch (_) { /* ignore */ }
    }
    set({
      isAuthenticated: false,
      user: null,
      negociacoes: [],
      notifications: [],
      denuncias: [],
      isInitialized: isSupabaseEnabled ? false : true,
    });
  },

  setUser: (user) => set({ user }),

  // ── Negociações ────────────────────────────────────────────────────────────
  addNegociacao: async (neg) => {
    const state = get();

    if (!isSupabaseEnabled) {
      const newNeg = {
        ...neg,
        id: `neg-${Date.now()}`,
        dataCriacao: new Date().toISOString(),
        ipAssinatura: '177.92.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        timestampAssinatura: new Date().toISOString(),
        aditivos: [],
      };
      set((s) => ({
        negociacoes: [newNeg, ...s.negociacoes],
        user: {
          ...s.user,
          freeTrials: s.user.freeTrials > 0 ? s.user.freeTrials - 1 : 0,
          monthlyVolume: s.user.monthlyVolume + (neg.valor || 0),
        },
      }));
      return newNeg;
    }

    const created = await negService.createNegociacao(neg, state.user.id);
    set((s) => ({
      negociacoes: [created, ...s.negociacoes],
      user: {
        ...s.user,
        freeTrials: Math.max(0, (s.user.freeTrials || 0) - 1),
        monthlyVolume: (s.user.monthlyVolume || 0) + (neg.valor || 0),
      },
    }));
    return created;
  },

  updateNegociacao: (id, updates) => set((s) => ({
    negociacoes: s.negociacoes.map((n) => n.id === id ? { ...n, ...updates } : n),
  })),

  // ── Aditivos ───────────────────────────────────────────────────────────────
  addAditivo: async (negId, aditivo) => {
    const state = get();

    if (!isSupabaseEnabled) {
      set((s) => ({
        negociacoes: s.negociacoes.map((n) =>
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
      }));
      return;
    }

    const created = await aditivoService.createAditivo(negId, state.user.id, aditivo);
    set((s) => ({
      negociacoes: s.negociacoes.map((n) =>
        n.id === negId
          ? {
              ...n,
              dataVencimento: aditivo.novaData,
              aditivos: [...n.aditivos, {
                id: created.id,
                novaData: created.nova_data_vencimento,
                motivo: created.motivo,
                status: created.status,
                dataCriacao: created.criado_em,
              }],
            }
          : n
      ),
    }));
  },

  aceitarAditivo: async (negId, aditivoId) => {
    const state = get();
    const neg = state.negociacoes.find((n) => n.id === negId);
    const aditivo = neg?.aditivos.find((a) => a.id === aditivoId);
    const novaData = aditivo?.novaData || neg?.dataVencimento;

    if (!isSupabaseEnabled) {
      set((s) => ({
        negociacoes: s.negociacoes.map((n) =>
          n.id === negId
            ? {
                ...n,
                dataVencimento: novaData,
                status: 'ativa',
                aditivos: n.aditivos.map((a) =>
                  a.id === aditivoId ? { ...a, status: 'aceito', aceitoEm: new Date().toISOString() } : a
                ),
              }
            : n
        ),
      }));
      return;
    }

    await aditivoService.acceptAditivo(aditivoId, negId, novaData);
    set((s) => ({
      negociacoes: s.negociacoes.map((n) =>
        n.id === negId
          ? {
              ...n,
              dataVencimento: novaData,
              status: 'ativa',
              aditivos: n.aditivos.map((a) =>
                a.id === aditivoId ? { ...a, status: 'aceito', aceitoEm: new Date().toISOString() } : a
              ),
            }
          : n
      ),
    }));
  },

  // ── Debt actions ───────────────────────────────────────────────────────────
  notificarDevedor: async (negId) => {
    if (isSupabaseEnabled) {
      await negService.updateNegociacaoStatus(negId, 'notificada');
    }
    set((s) => ({
      negociacoes: s.negociacoes.map((n) => n.id === negId ? { ...n, status: 'notificada' } : n),
      user: {
        ...s.user,
        reputation: Math.min(5.0, Math.max(1.0, +((s.user?.reputation || 5.0) - 0.5).toFixed(1))),
      },
    }));
  },

  executarDivida: async (negId) => {
    if (isSupabaseEnabled) {
      await negService.updateNegociacaoStatus(negId, 'em_execucao');
    }
    set((s) => ({
      negociacoes: s.negociacoes.map((n) => n.id === negId ? { ...n, status: 'em_execucao' } : n),
      user: {
        ...s.user,
        reputation: Math.min(5.0, Math.max(1.0, +((s.user?.reputation || 5.0) - 0.5).toFixed(1))),
      },
    }));
  },

  darBaixa: async (negId) => {
    if (isSupabaseEnabled) {
      await negService.updateNegociacaoStatus(negId, 'concluida');
    }
    set((s) => ({
      negociacoes: s.negociacoes.map((n) => n.id === negId ? { ...n, status: 'concluida' } : n),
    }));
  },

  // ── Denúncias ──────────────────────────────────────────────────────────────
  addDenuncia: async (denuncia) => {
    const state = get();

    if (!isSupabaseEnabled) {
      set((s) => ({
        denuncias: [{
          ...denuncia,
          id: `den-${Date.now()}`,
          dataCriacao: new Date().toISOString(),
          ip: '177.92.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
          timestampUTC: new Date().toUTCString(),
          hash: gerarHashSHA256(denuncia.descricao + Date.now()),
        }, ...s.denuncias],
      }));
      return;
    }

    await denunciaService.createDenuncia(state.user.id, denuncia);
    set((s) => ({
      denuncias: [{
        ...denuncia,
        id: `den-${Date.now()}`,
        dataCriacao: new Date().toISOString(),
        timestampUTC: new Date().toUTCString(),
      }, ...s.denuncias],
    }));
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  markNotificationRead: async (id) => {
    if (isSupabaseEnabled) {
      await notifService.markRead(id);
    }
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    }));
  },

  clearNotifications: async () => {
    const state = get();
    if (isSupabaseEnabled && state.user?.id) {
      await notifService.markAllRead(state.user.id);
    }
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));

function gerarHashSHA256(str) {
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

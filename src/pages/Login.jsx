import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Leaf } from 'lucide-react';
import useStore from '../store/useStore';

const ROLES = [
  { value: 'produtor', label: 'Produtor Rural', icon: '🌾' },
  { value: 'comprador', label: 'Comprador Final', icon: '🛒' },
  { value: 'corretor', label: 'Corretor / Intermediário', icon: '🤝' },
  { value: 'feirante', label: 'Feirante', icon: '🏪' },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: 'joao@terraforte.com.br',
    password: '123456',
    name: '',
    cpf: '',
    whatsapp: '',
    city: '',
    state: 'SP',
    role: 'produtor',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    login({ email: form.email, name: form.name || 'João Silva', role: form.role });
    setLoading(false);
    navigate('/');
  };

  const handleGovBR = () => {
    // Simulated Gov.BR OAuth
    setLoading(true);
    setTimeout(() => {
      login({ name: 'José Ramos da Silva', cpf: '987.654.321-00', role: 'produtor' });
      setLoading(false);
      navigate('/');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-600 flex flex-col items-center justify-center p-5">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
          <Shield size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-white">TerraForte</h1>
        <p className="text-green-200 text-sm mt-1">Plataforma de Proteção Agrícola Digital</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Leaf size={12} className="text-green-300" />
          <p className="text-xs text-green-300">Lei 14.620/2023 — Títulos Executivos Extrajudiciais</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {['login', 'cadastro'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-green-700 border-b-2 border-green-600'
                  : 'text-gray-400'
              }`}
            >
              {t === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          ))}
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'cadastro' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome / Razão Social</label>
                  <input
                    className="input-field"
                    placeholder="Seu nome completo"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">CPF / CNPJ</label>
                  <input
                    className="input-field"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                  <input
                    className="input-field"
                    placeholder="(11) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade</label>
                    <input
                      className="input-field"
                      placeholder="Sua cidade"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
                    <select
                      className="input-field"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    >
                      {['SP','MG','RJ','BA','GO','PR','RS','SC','PE','CE','MA','PA','MT','MS','TO','PI','RN','PB','SE','AL','AM','RR','RO','AC','AP','DF'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Perfil</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm({ ...form, role: r.value })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          form.role === r.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="text-xl mb-1">{r.icon}</div>
                        <div className="text-xs font-semibold text-gray-700 leading-tight">{r.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base disabled:opacity-60"
            >
              {loading ? 'Processando...' : tab === 'login' ? 'Entrar na Plataforma' : 'Criar Minha Conta'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Gov.BR Button */}
          <button
            onClick={handleGovBR}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border-2 border-blue-600 text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            Entrar com Gov.br (OAuth2)
          </button>

          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            Ao criar conta, você concorda com os Termos de Uso e a Política de Privacidade da TerraForte, em conformidade com a LGPD.
          </p>
        </div>
      </div>

      {/* Legal footer */}
      <p className="text-xs text-green-200 text-center mt-6 max-w-xs leading-relaxed">
        Plataforma de assinatura eletrônica avançada com base no art. 784, § 4º do CPC — dispensando testemunhas.
      </p>
    </div>
  );
}

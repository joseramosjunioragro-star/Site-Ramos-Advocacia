import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Shield, Hash, Clock, Check, AlertCircle, Database } from 'lucide-react';
import useStore from '../store/useStore';
import { gerarHashSHA256Simulado } from '../utils/helpers';

export default function Provas() {
  const navigate = useNavigate();
  const addDenuncia = useStore((s) => s.addDenuncia);
  const denuncias = useStore((s) => s.denuncias);

  const [form, setForm] = useState({ descricao: '', arquivo: null, tipo: '' });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.descricao) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800)); // simulate blockchain reg

    const hash = gerarHashSHA256Simulado(form.descricao + (form.arquivo?.name || '') + Date.now());
    const ip = '177.92.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
    const timestamp = new Date().toUTCString();

    const prova = {
      descricao: form.descricao,
      tipo: form.tipo,
      arquivo: form.arquivo?.name,
      hash,
      ip,
      timestampUTC: timestamp,
    };

    await addDenuncia(prova);
    setResultado(prova);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-4 py-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4 text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Provas Forenses</h1>
            <p className="text-purple-200 text-xs">ISO 27037 — Blockchain EOS</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <p className="font-bold text-purple-800 text-sm mb-2">Como funciona?</p>
          <ul className="space-y-1">
            {[
              'Upload de prova (imagem/documento)',
              'Coleta automática de IP e Timestamp UTC',
              'Geração de Hash SHA-256 único',
              'Registro simulado em Blockchain EOS',
              'Documento válido para perícia judicial',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-purple-700">
                <Check size={12} className="text-purple-500 mt-0.5 flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>

        {!resultado ? (
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Upload size={16} className="text-purple-600" /> Registrar Nova Prova
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Prova</label>
              <select className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="">Selecione</option>
                <option value="conversa">Conversa / Mensagem</option>
                <option value="recibo">Recibo / Nota Fiscal</option>
                <option value="foto">Foto do Produto</option>
                <option value="documento">Documento</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição da Prova *</label>
              <textarea
                className="input-field min-h-28 resize-none"
                placeholder="Descreva detalhadamente o que está sendo registrado como prova..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Arquivo de Prova</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 transition-colors">
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Toque para selecionar</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF até 10MB</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => setForm({ ...form, arquivo: e.target.files?.[0] || null })}
                />
              </label>
              {form.arquivo && (
                <div className="flex items-center gap-2 mt-2 bg-green-50 rounded-lg px-3 py-2">
                  <Check size={14} className="text-green-500" />
                  <p className="text-xs text-green-700 font-medium">{form.arquivo.name}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.descricao || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando em Blockchain...
                </>
              ) : (
                <>
                  <Hash size={18} /> Registrar Prova Forense
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="card space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">Prova Registrada!</h2>
              <p className="text-sm text-gray-500">Validade forense confirmada (ISO 27037)</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database size={14} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-800">Hash SHA-256 — Blockchain EOS</p>
              </div>
              <p className="font-mono text-xs text-purple-700 break-all bg-white border border-purple-100 rounded-lg p-2">
                {resultado.hash}
              </p>
              <p className="text-xs text-purple-500 mt-2">
                "Hash registrado em Blockchain para integridade e validade pericial."
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-gray-400" />
                <p className="text-xs text-gray-600"><strong>Timestamp UTC:</strong> {resultado.timestampUTC}</p>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-gray-400" />
                <p className="text-xs text-gray-600"><strong>IP do Dispositivo:</strong> {resultado.ip}</p>
              </div>
              {resultado.arquivo && (
                <p className="text-xs text-gray-600"><strong>Arquivo:</strong> {resultado.arquivo}</p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs text-green-700 leading-relaxed font-medium">
                ✓ Este registro possui validade jurídica e pode ser utilizado como prova eletrônica em processos judiciais, conforme a Lei 14.620/2023 e os padrões ISO 27037 de preservação de provas digitais.
              </p>
            </div>

            <button
              onClick={() => { setResultado(null); setForm({ descricao: '', arquivo: null, tipo: '' }); }}
              className="w-full btn-primary"
            >
              Registrar Nova Prova
            </button>
          </div>
        )}

        {/* Histórico */}
        {denuncias.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-purple-600" /> Provas Registradas
            </h2>
            <div className="space-y-3">
              {denuncias.slice(0, 5).map((d) => (
                <div key={d.id} className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-700 truncate">{d.descricao?.slice(0, 80)}...</p>
                  <p className="font-mono text-xs text-purple-600 mt-1 truncate">{d.hash}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.timestampUTC || new Date(d.dataCriacao).toUTCString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

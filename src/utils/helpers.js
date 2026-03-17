export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR');
}

export function isVencida(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function diasParaVencer(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getTipoLabel(tipo) {
  const map = {
    padrao: 'Compra e Venda',
    futuro: 'Venda Antecipada',
    giro: 'Giro Rápido',
  };
  return map[tipo] || tipo;
}

export function getStatusColor(status) {
  const map = {
    ativa: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    vencida: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    notificada: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    em_execucao: { bg: 'bg-red-200', text: 'text-red-800', dot: 'bg-red-700' },
    concluida: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  };
  return map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
}

export function getStatusLabel(status) {
  const map = {
    ativa: 'Ativa',
    pendente: 'Pendente',
    vencida: 'Vencida',
    notificada: 'Notificada',
    em_execucao: 'Em Execução',
    concluida: 'Concluída',
  };
  return map[status] || status;
}

export function calcularTaxa(valor, plano) {
  if (plano === 'mensalista') return valor * 0.005;
  if (plano === 'feirante') return 29.90;
  return valor * 0.015;
}

export function gerarHashSHA256Simulado(input) {
  let hash = 0;
  const str = String(input) + Date.now();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex.repeat(8)).substring(0, 64).toUpperCase();
}

export function gerarLinkWhatsApp(phone, message) {
  const clean = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/55${clean}?text=${encoded}`;
}

export function getRoleLabel(role) {
  const map = {
    produtor: 'Produtor Rural',
    comprador: 'Comprador Final',
    corretor: 'Corretor / Intermediário',
    feirante: 'Feirante',
  };
  return map[role] || role;
}

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

/**
 * Real SHA-256 via Web Crypto API (secure context / HTTPS required).
 * Accepts a string, ArrayBuffer, or File/Blob.
 * Falls back to the simulated version when crypto.subtle is unavailable
 * (e.g. development over plain HTTP on a non-localhost origin).
 */
export async function sha256(input) {
  if (!crypto?.subtle) {
    // Graceful degradation – not cryptographically secure
    console.warn('[TerraForte] crypto.subtle unavailable; using simulated hash');
    return gerarHashSHA256Simulado(
      typeof input === 'string' ? input : `file-${Date.now()}`
    );
  }

  let data;
  if (typeof input === 'string') {
    data = new TextEncoder().encode(input);
  } else if (input instanceof ArrayBuffer) {
    data = input;
  } else {
    // File or Blob
    data = await input.arrayBuffer();
  }

  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Attempt to get the client's public IP via ipify.
 * Times out after 3 s and returns '0.0.0.0' on failure.
 * NOTE: For forensic-grade evidence, capture IP server-side (Edge Function).
 */
export async function getClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    });
    const { ip } = await res.json();
    return ip;
  } catch {
    return '0.0.0.0';
  }
}

/**
 * Simulated (non-cryptographic) hash — kept for offline/mock mode only.
 * Do NOT use for production forensic evidence.
 */
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

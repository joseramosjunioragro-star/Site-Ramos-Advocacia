import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Clock, CheckCircle, FileText } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getTipoLabel, diasParaVencer } from '../utils/helpers';

const StatusIcon = ({ status }) => {
  if (status === 'vencida' || status === 'notificada' || status === 'em_execucao') return <AlertCircle size={16} className="text-red-500" />;
  if (status === 'concluida') return <CheckCircle size={16} className="text-blue-500" />;
  if (status === 'ativa') return <Clock size={16} className="text-green-500" />;
  return <FileText size={16} className="text-yellow-500" />;
};

export default function NegociacaoCard({ neg }) {
  const colors = getStatusColor(neg.status);
  const dias = diasParaVencer(neg.dataVencimento);

  return (
    <Link to={`/negociacoes/${neg.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`status-badge ${colors.bg} ${colors.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {getStatusLabel(neg.status)}
              </span>
              <span className="text-xs text-gray-400">{getTipoLabel(neg.tipo)}</span>
            </div>
            <h3 className="font-bold text-gray-800 truncate">{neg.produto}</h3>
            <p className="text-sm text-gray-500 truncate">{neg.comprador}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div className="text-right">
              <p className="font-bold text-gray-800">{formatCurrency(neg.valor)}</p>
              <p className="text-xs text-gray-400">
                {dias !== null
                  ? dias < 0
                    ? `Venceu há ${Math.abs(dias)}d`
                    : `Vence em ${dias}d`
                  : formatDate(neg.dataVencimento)}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        </div>

        {neg.aditivos?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-blue-600 font-medium">
              {neg.aditivos.length} aditivo(s) registrado(s)
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

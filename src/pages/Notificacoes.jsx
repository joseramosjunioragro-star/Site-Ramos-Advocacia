import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, AlertCircle, Info, Check, CheckCheck } from 'lucide-react';
import useStore from '../store/useStore';

export default function Notificacoes() {
  const navigate = useNavigate();
  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const clearNotifications = useStore((s) => s.clearNotifications);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 mb-4 text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Notificações</h1>
              <p className="text-gray-300 text-xs">{notifications.filter(n => !n.read).length} não lidas</p>
            </div>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={clearNotifications} className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-medium">
              <CheckCheck size={12} /> Marcar todas
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Sem notificações</p>
            <p className="text-sm text-gray-400">Você está em dia!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-3 cursor-pointer transition-opacity ${
                n.read ? 'opacity-60 border-gray-100' : 'border-gray-200 shadow-md'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.type === 'danger' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {n.type === 'danger'
                  ? <AlertCircle size={18} className="text-red-500" />
                  : <Info size={18} className="text-blue-500" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-800 font-semibold'}`}>
                  {n.message}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

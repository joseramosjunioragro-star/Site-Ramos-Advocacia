import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, DollarSign, User, Bell } from 'lucide-react';
import useStore from '../store/useStore';

export default function Layout({ children }) {
  const location = useLocation();
  const notifications = useStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/negociacoes', icon: FileText, label: 'Contratos' },
    { path: '/cobrancas', icon: DollarSign, label: 'Cobranças' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">TF</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">TerraForte</h1>
            <p className="text-xs text-green-200 leading-none">Proteção Agrícola Digital</p>
          </div>
        </div>
        <Link to="/notificacoes" className="relative p-1">
          <Bell size={22} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex z-40 shadow-2xl">
        {navItems.map((item) => {
          const NavIcon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                active ? 'text-green-700' : 'text-gray-400'
              }`}
            >
              <NavIcon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{item.label}</span>
              {active && <span className="w-1 h-1 bg-green-600 rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

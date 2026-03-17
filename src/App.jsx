import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import { isSupabaseEnabled } from './lib/supabase';
import { getSession, onAuthStateChange } from './services/auth.service';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Negociacoes from './pages/Negociacoes';
import DetalhesNegociacao from './pages/DetalhesNegociacao';
import NovaNegociacao from './pages/NovaNegociacao';
import Cobrancas from './pages/Cobrancas';
import Perfil from './pages/Perfil';
import Provas from './pages/Provas';
import Notificacoes from './pages/Notificacoes';

function PrivateRoute({ children }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const isInitialized = useStore((s) => s.isInitialized);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-green-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium opacity-80">Carregando TerraForte...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const initialize = useStore((s) => s.initialize);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      initialize(null);
      return;
    }

    // Seed initial session
    getSession().then((session) => initialize(session)).catch(() => initialize(null));

    // Listen for auth state changes (sign in / sign out)
    const { data: { subscription } } = onAuthStateChange((session) => {
      if (session) {
        initialize(session);
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/negociacoes" element={<Negociacoes />} />
                <Route path="/negociacoes/:id" element={<DetalhesNegociacao />} />
                <Route path="/nova-negociacao/:tipo" element={<NovaNegociacao />} />
                <Route path="/cobrancas" element={<Cobrancas />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/provas" element={<Provas />} />
                <Route path="/notificacoes" element={<Notificacoes />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

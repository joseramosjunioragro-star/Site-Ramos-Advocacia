import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
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
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
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

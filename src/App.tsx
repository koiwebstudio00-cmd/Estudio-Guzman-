import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CasesList } from './pages/CasesList';
import { NewCase } from './pages/NewCase';
import { CaseDetail } from './pages/CaseDetail';
import { Tasks } from './pages/Tasks';
import { Contacts } from './pages/Contacts';
import { Team } from './pages/Team';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/juicios" element={<CasesList />} />
            <Route path="/juicios/nuevo" element={<NewCase />} />
            <Route path="/juicios/:id" element={<CaseDetail />} />
            <Route path="/tareas" element={<Tasks />} />
            <Route path="/contactos" element={<Contacts />} />
            <Route path="/equipo" element={<Team />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CasesList } from './pages/CasesList';
import { NewCase } from './pages/NewCase';
import { CaseDetail } from './pages/CaseDetail';
import { Tasks } from './pages/Tasks';
import { Contacts } from './pages/Contacts';
import { Team } from './pages/Team';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Feedback } from './pages/Feedback';
import { Activity } from './pages/Activity';
import { PermissionRoute } from './auth/PermissionRoute';
import { Profile } from './pages/Profile';
import { ContactDetail } from './pages/ContactDetail';
import { Notifications } from './pages/Notifications';
import { SubCaseDetail } from './pages/SubCaseDetail';
import { ActionDetail } from './pages/ActionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={(
            <ProtectedRoute>
                <Layout>
                  <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/juicios" element={<CasesList />} />
            <Route path="/juicios/nuevo" element={<NewCase />} />
            <Route path="/juicios/:id" element={<CaseDetail />} />
            <Route path="/juicios/:id/cuadernos/:subCaseId" element={<SubCaseDetail />} />
            <Route path="/juicios/:id/cuadernos/:subCaseId/actuaciones/:actionId" element={<ActionDetail />} />
            <Route path="/juicios/:id/actuaciones/:actionId" element={<ActionDetail />} />
            <Route path="/tareas" element={<Tasks />} />
            <Route path="/contactos" element={<Contacts />} />
            <Route path="/contactos/:id" element={<PermissionRoute permission="contacts.read"><ContactDetail /></PermissionRoute>} />
            <Route path="/equipo" element={<Team />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/notificaciones" element={<Notifications />} />
            <Route path="/actividad" element={<PermissionRoute permission="audit.read"><Activity /></PermissionRoute>} />
            <Route path="/sugerencias" element={<PermissionRoute anyOf={['feedback.create', 'feedback.manage']}><Feedback /></PermissionRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
            </ProtectedRoute>
          )} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

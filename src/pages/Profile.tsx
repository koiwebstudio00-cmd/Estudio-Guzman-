import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const permissionLabels: Record<string, string> = {
  'dashboard.read': 'Ver inicio',
  'cases.read': 'Ver juicios',
  'cases.create': 'Crear juicios',
  'cases.update': 'Editar juicios',
  'cases.change_status': 'Cambiar estado de juicios',
  'contacts.read': 'Ver contactos',
  'contacts.create': 'Crear contactos',
  'contacts.update': 'Editar contactos',
  'contacts.delete': 'Dar de baja contactos',
  'tasks.read': 'Ver tareas',
  'tasks.create': 'Crear tareas',
  'tasks.update': 'Editar tareas',
  'users.read': 'Ver equipo',
  'users.create': 'Crear usuarios',
  'users.update': 'Editar usuarios',
  'audit.read': 'Ver actividad',
  'feedback.manage': 'Gestionar sugerencias',
};

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-stone-500">Datos de tu cuenta y accesos habilitados.</p>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-stone-900 text-2xl font-semibold text-white" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-2">
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-stone-500">{user.role.name}</p>
            </div>
            <Badge variant="secondary">Cuenta activa</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la cuenta</CardTitle>
            <CardDescription>Información asociada a tu sesión.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden="true" />
              <div><p className="text-xs uppercase tracking-wide text-stone-400">Email</p><p className="break-all text-sm font-medium">{user.email}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden="true" />
              <div><p className="text-xs uppercase tracking-wide text-stone-400">Rol</p><p className="text-sm font-medium">{user.role.name}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden="true" />
              <div><p className="text-xs uppercase tracking-wide text-stone-400">Identificador</p><p className="break-all font-mono text-xs text-stone-600">{user.id}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" aria-hidden="true" /> Accesos habilitados</CardTitle>
            <CardDescription>{user.permissions.length} permisos asignados mediante tu rol.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {user.permissions.map((permission) => <Badge key={permission} variant="outline">{permissionLabels[permission] ?? permission}</Badge>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

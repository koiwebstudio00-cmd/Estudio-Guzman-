import { useState, type FormEvent } from 'react';
import { KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ApiProblem } from '../lib/api';

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
  'users.manage': 'Administrar usuarios',
  'audit.read': 'Ver actividad',
  'feedback.manage': 'Gestionar sugerencias',
};

const errorMessage = (error: unknown) => error instanceof ApiProblem
  ? error.message
  : 'No se pudo completar la operación.';

export function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  if (!user) return null;

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingProfile(true);
    try {
      await updateProfile({
        version: user.version,
        name: String(form.get('name')),
        email: String(form.get('email')),
        avatarUrl: String(form.get('avatarUrl')).trim() || null,
      });
      toast.success('Perfil actualizado.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get('newPassword'));
    if (newPassword !== String(form.get('confirmPassword'))) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(String(form.get('currentPassword')), newPassword);
      toast.success('Contraseña actualizada. Volvé a iniciar sesión.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <header><h1 className="text-3xl font-semibold tracking-tight">Mi perfil</h1><p className="text-stone-500">Actualizá tus datos personales y la seguridad de tu cuenta.</p></header>

      <Card><CardContent className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center">
        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-20 w-20 shrink-0 rounded-full object-cover" /> : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-stone-900 text-2xl font-semibold text-white" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>}
        <div className="min-w-0 space-y-2"><div><h2 className="text-2xl font-semibold">{user.name}</h2><p className="text-stone-500">{user.role.name}</p></div><Badge variant="secondary">Cuenta activa</Badge></div>
      </CardContent></Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Datos de la cuenta</CardTitle><CardDescription>Podés modificar tu nombre, email y avatar.</CardDescription></CardHeader><CardContent>
          <form key={user.version} onSubmit={submitProfile} className="space-y-4">
            <div><Label htmlFor="profile-name">Nombre</Label><Input id="profile-name" name="name" defaultValue={user.name} minLength={2} maxLength={160} required /></div>
            <div><Label htmlFor="profile-email">Email</Label><Input id="profile-email" name="email" type="email" defaultValue={user.email} maxLength={320} required /></div>
            <div><Label htmlFor="profile-avatar">URL del avatar</Label><Input id="profile-avatar" name="avatarUrl" type="url" defaultValue={user.avatarUrl ?? ''} maxLength={2000} placeholder="https://…" /></div>
            <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Guardando…' : 'Guardar datos'}</Button>
          </form>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" aria-hidden="true" /> Cambiar contraseña</CardTitle><CardDescription>Por seguridad se cerrarán todas tus sesiones después del cambio.</CardDescription></CardHeader><CardContent>
          <form onSubmit={submitPassword} className="space-y-4">
            <div><Label htmlFor="current-password">Contraseña actual</Label><Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" maxLength={200} required /></div>
            <div><Label htmlFor="new-password">Nueva contraseña</Label><Input id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={200} required /></div>
            <div><Label htmlFor="confirm-password">Repetir nueva contraseña</Label><Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={200} required /></div>
            <p className="text-xs text-stone-500">Debe incluir mayúscula, minúscula y número.</p>
            <Button type="submit" disabled={savingPassword}>{savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}</Button>
          </form>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Información de la cuenta</CardTitle><CardDescription>Datos administrativos que no podés modificar.</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden="true" /><div><p className="text-xs uppercase tracking-wide text-stone-400">Email</p><p className="break-all text-sm font-medium">{user.email}</p></div></div>
          <div className="flex items-start gap-3"><UserRound className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden="true" /><div><p className="text-xs uppercase tracking-wide text-stone-400">Rol</p><p className="text-sm font-medium">{user.role.name}</p></div></div>
          <div className="flex items-start gap-3"><KeyRound className="mt-0.5 h-4 w-4 text-stone-400" aria-hidden="true" /><div><p className="text-xs uppercase tracking-wide text-stone-400">Identificador</p><p className="break-all font-mono text-xs text-stone-600">{user.id}</p></div></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" aria-hidden="true" /> Accesos habilitados</CardTitle><CardDescription>{user.permissions.length} permisos asignados mediante tu rol.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{user.permissions.map((permission) => <Badge key={permission} variant="outline">{permissionLabels[permission] ?? permission}</Badge>)}</CardContent></Card>
      </div>
    </div>
  );
}

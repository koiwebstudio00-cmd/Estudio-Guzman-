import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BarChart3, ShieldCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { createRole, createUser, getRoles, getUsers, updateRole, updateRolePermissions, updateUser } from '../features/team/api';
import type { TeamRole, TeamUser, UserStatus } from '../features/team/types';
import { generateSecurePassword } from '../features/team/password';
import { AvatarPicker } from '../features/team/AvatarPicker';
import { ApiProblem } from '../lib/api';
import { getTeamMetrics } from '../features/dashboard/api';
import type { TeamMetric } from '../features/dashboard/types';

const statusLabels: Record<UserStatus, string> = { ACTIVE: 'Activo', SUSPENDED: 'Suspendido', DISABLED: 'Deshabilitado' };
const message = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo completar la operación.';
const ymd = (date: Date) => date.toISOString().slice(0, 10);

export const Team = () => {
  const { user: currentUser, can } = useAuth();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [roleDialog, setRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);
  const [metrics, setMetrics] = useState<TeamMetric[]>([]); const [metricsError, setMetricsError] = useState<string | null>(null); const [to, setTo] = useState(ymd(new Date())); const [from, setFrom] = useState(ymd(new Date(Date.now() - 29 * 86_400_000)));

  const permissionCatalog = useMemo(() => {
    const catalog = new Map<string, string>();
    roles.flatMap((role) => role.permissions).forEach((permission) => catalog.set(permission.code, permission.description ?? permission.code));
    return [...catalog.entries()].sort(([first], [second]) => first.localeCompare(second));
  }, [roles]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextUsers, nextRoles] = await Promise.all([getUsers(), getRoles()]);
      setUsers(nextUsers);
      setRoles(nextRoles);
    } catch (requestError) {
      setError(message(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  useEffect(() => { if (!can('team_metrics.read')) return; let active = true; setMetricsError(null); void getTeamMetrics(from, to).then((response) => { if (active) setMetrics(response.data); }).catch((requestError) => { if (active) setMetricsError(message(requestError)); }); return () => { active = false; }; }, [can, from, to]);
  if (loading) return <p className="text-stone-500">Cargando equipo…</p>;

  return <div className="space-y-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-3xl font-semibold tracking-tight">Equipo</h1><p className="text-stone-500">Usuarios, estados, roles y permisos efectivos del estudio.</p></div>
      {can('users.manage') && can('roles.manage') && <Button onClick={() => { setEditingUser(null); setUserDialog(true); }}><UserPlus className="h-4 w-4" /> Agregar integrante</Button>}
    </div>
    {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

    <section>
      <h2 className="mb-4 text-xl font-semibold">Integrantes</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {users.map((member) => <Card key={member.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-3">{member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-11 w-11 rounded-full border object-cover" /> : <div className="grid h-11 w-11 place-items-center rounded-full bg-stone-100 font-semibold">{member.name.charAt(0).toUpperCase()}</div>}<div><CardTitle>{member.name}</CardTitle><p className="text-sm text-stone-500">{member.email}</p></div></div>
            <Badge variant={member.status === 'ACTIVE' ? 'secondary' : 'destructive'}>{statusLabels[member.status]}</Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between"><div><p className="font-medium">{member.role.name}</p><p className="text-xs text-stone-500">{member.permissions.length} permisos</p></div>
            {can('users.manage') && member.id !== currentUser?.id && <Button variant="outline" size="sm" onClick={() => { setEditingUser(member); setUserDialog(true); }}>Administrar</Button>}
          </CardContent>
        </Card>)}
      </div>
    </section>

    {can('team_metrics.read') ? <section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-semibold"><BarChart3 className="h-5 w-5" /> Métricas del equipo</h2><p className="text-sm text-stone-500">Tareas completadas en el rango; asignaciones y vencidas al día de hoy.</p></div><div className="flex gap-2"><label className="text-xs text-stone-500">Desde<Input aria-label="Métricas desde" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="text-xs text-stone-500">Hasta<Input aria-label="Métricas hasta" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label></div></div>{metricsError ? <div role="alert" className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800">{metricsError}. El resto del equipo sigue disponible.</div> : <div className="overflow-hidden rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-stone-50"><tr><th className="p-3">Integrante</th><th className="p-3 text-right">Asignadas</th><th className="p-3 text-right">Completadas</th><th className="p-3 text-right">Vencidas</th><th className="p-3 text-right">Causas a cargo</th></tr></thead><tbody>{metrics.map((item) => <tr key={item.userId} className="border-t"><td className="p-3 font-medium">{item.name}</td><td className="p-3 text-right">{item.assigned}</td><td className="p-3 text-right">{item.completed}</td><td className={`p-3 text-right ${item.overdue ? 'font-medium text-red-600' : ''}`}>{item.overdue}</td><td className="p-3 text-right">{item.primaryCases}</td></tr>)}</tbody></table></div>}</section> : null}

    <section>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Roles y permisos</h2>{can('roles.manage') && <Button variant="outline" onClick={() => { setEditingRole(null); setRoleDialog(true); }}><ShieldCheck className="h-4 w-4" /> Crear rol</Button>}</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{roles.map((role) => <Card key={role.id}><CardHeader><CardTitle>{role.name}</CardTitle><p className="text-sm text-stone-500">{role.code} · {role.userCount} usuarios</p></CardHeader><CardContent className="flex items-center justify-between gap-4"><p className="text-sm text-stone-600">{role.permissions.length} permisos asignados</p>{can('roles.manage') && role.id !== currentUser?.role.id && <Button variant="outline" size="sm" onClick={() => { setEditingRole(role); setRoleDialog(true); }}>Editar</Button>}</CardContent></Card>)}</div>
    </section>

    <UserDialog open={userDialog} user={editingUser} roles={roles} onOpenChange={setUserDialog} onSaved={(saved) => setUsers((current) => current.some(({ id }) => id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)))} />
    <RoleDialog open={roleDialog} role={editingRole} permissions={permissionCatalog} onOpenChange={setRoleDialog} onSaved={() => { setRoleDialog(false); void load(); }} />
  </div>;
};

function UserDialog({ open, user, roles, onOpenChange, onSaved }: { open: boolean; user: TeamUser | null; roles: TeamRole[]; onOpenChange(open: boolean): void; onSaved(user: TeamUser): void }) {
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  useEffect(() => { if (open) { setPassword(''); setAvatarUrl(user?.avatarUrl ?? ''); } }, [open, user]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const saved = user ? await updateUser(user.id, { version: user.version, email: String(form.get('email')), name: String(form.get('name')), avatarUrl: avatarUrl || null, roleId: String(form.get('roleId')), status: String(form.get('status')) as UserStatus, ...(password ? { password } : {}) }) : await createUser({ email: String(form.get('email')), name: String(form.get('name')), roleId: String(form.get('roleId')), password });
      onSaved(saved); onOpenChange(false); toast.success(user ? 'Usuario actualizado.' : 'Usuario creado.');
    } catch (error) { toast.error(message(error)); } finally { setSubmitting(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>{user ? 'Administrar usuario' : 'Agregar integrante'}</DialogTitle><DialogDescription>{user ? 'Cambiar rol o estado revoca las sesiones.' : 'Definí una contraseña inicial y compartila de forma segura con el nuevo integrante.'}</DialogDescription></DialogHeader>
    <div><Label htmlFor="team-name">Nombre</Label><Input id="team-name" name="name" defaultValue={user?.name} required /></div>
    <div><Label htmlFor="team-email">Email</Label><Input id="team-email" name="email" type="email" defaultValue={user?.email} required /></div>
    {user ? <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} /> : null}
    <div><div className="mb-1 flex items-center justify-between gap-3"><Label htmlFor="team-password">{user ? 'Nueva contraseña' : 'Contraseña inicial'}</Label><Button type="button" variant="outline" size="sm" onClick={() => setPassword(generateSecurePassword())}>Generar contraseña segura</Button></div><Input id="team-password" name="password" type="text" autoComplete="new-password" minLength={8} maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} required={!user} placeholder={user ? 'Dejar vacío para conservar la actual' : undefined} /><p className="mt-1 text-xs text-stone-500">{user ? 'Si definís una nueva contraseña, se cerrarán todas las sesiones de este usuario.' : 'Copiala antes de guardar para enviársela al usuario.'}</p></div>
    <div><Label htmlFor="team-role">Rol</Label><select id="team-role" name="roleId" defaultValue={user?.role.id ?? roles[0]?.id} className="mt-1 h-9 w-full rounded-md border bg-white px-3" required>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div>
    {user && <div><Label htmlFor="team-status">Estado</Label><select id="team-status" name="status" defaultValue={user.status} className="mt-1 h-9 w-full rounded-md border bg-white px-3">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}
    <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar'}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

function RoleDialog({ open, role, permissions, onOpenChange, onSaved }: { open: boolean; role: TeamRole | null; permissions: Array<[string, string]>; onOpenChange(open: boolean): void; onSaved(role: TeamRole): void }) {
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const permissionCodes = form.getAll('permissions').map(String); setSubmitting(true);
    try {
      let saved: TeamRole;
      if (role) { await updateRole(role.id, { name: String(form.get('name')), description: String(form.get('description')) || null }); saved = await updateRolePermissions(role.id, permissionCodes); }
      else { saved = await createRole({ code: String(form.get('code')), name: String(form.get('name')), description: String(form.get('description')) || undefined, permissionCodes }); }
      onSaved(saved); onOpenChange(false); toast.success('Rol guardado.');
    } catch (error) { toast.error(message(error)); } finally { setSubmitting(false); }
  }
  const selected = new Set(role?.permissions.map(({ code }) => code) ?? []);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto"><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>{role ? 'Editar rol' : 'Crear rol'}</DialogTitle><DialogDescription>Los permisos se aplican en la API y revocan las sesiones afectadas.</DialogDescription></DialogHeader>
    {!role && <div><Label htmlFor="role-code">Código</Label><Input id="role-code" name="code" placeholder="NUEVO_ROL" required /></div>}
    <div><Label htmlFor="role-name">Nombre</Label><Input id="role-name" name="name" defaultValue={role?.name} required /></div><div><Label htmlFor="role-description">Descripción</Label><Input id="role-description" name="description" defaultValue={role?.description ?? ''} /></div>
    <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="mb-2 font-medium">Permisos</legend>{permissions.map(([code, description]) => <label key={code} className="flex gap-2 rounded-md border p-2 text-sm"><input type="checkbox" name="permissions" value={code} defaultChecked={selected.has(code)} /><span><strong className="block">{code}</strong><span className="text-stone-500">{description}</span></span></label>)}</fieldset>
    <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar rol'}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

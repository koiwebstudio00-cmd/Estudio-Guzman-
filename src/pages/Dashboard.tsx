import { useEffect, useState } from 'react';
import { AlertCircle, CheckSquare, Clock, Scale, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { getDashboard } from '../features/dashboard/api';
import type { DashboardData } from '../features/dashboard/types';
import { auditActionLabel } from '../features/audit/labels';
import { ApiProblem } from '../lib/api';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo cargar el dashboard.';
const date = (value: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const due = (value: string | null) => value ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(value)) : 'Sin fecha';

export const Dashboard = () => {
  const { user } = useAuth(); const [data, setData] = useState<DashboardData | null>(null); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void getDashboard().then((value) => { if (active) setData(value); }).catch((requestError) => { if (active) setError(errorMessage(requestError)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  if (loading) return <DashboardSkeleton />;
  if (!data) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  const cards = [
    { label: 'Juicios activos', value: data.kpis.activeCases, icon: Scale },
    { label: 'Tareas abiertas', value: data.kpis.openTasks, detail: data.kpis.dueToday === null ? undefined : `${data.kpis.dueToday} para hoy`, icon: CheckSquare },
    { label: 'Tareas vencidas', value: data.kpis.overdueTasks, icon: AlertCircle, alert: (data.kpis.overdueTasks ?? 0) > 0 },
    { label: 'Clientes activos', value: data.kpis.activeClients, icon: Users },
  ];
  return <div className="space-y-6"><header><h1 className="text-3xl font-semibold">Inicio</h1><p className="text-stone-500">Bienvenido/a, {user?.name}. Estos datos vienen de la base del estudio.</p></header>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, detail, icon: Icon, alert }) => <Card key={label} className={alert ? 'border-red-200' : ''}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">{label}</CardTitle><Icon className={`h-4 w-4 ${alert ? 'text-red-500' : 'text-stone-500'}`} /></CardHeader><CardContent><p className={`text-2xl font-bold ${alert ? 'text-red-600' : ''}`}>{value ?? '—'}</p>{detail ? <p className="text-xs text-stone-500">{detail}</p> : null}</CardContent></Card>)}</div>
    <div className="grid gap-4 lg:grid-cols-7">
      <Card className="h-[450px] max-h-[450px] lg:col-span-4">
        <CardHeader className="shrink-0">
          <CardTitle>Mis tareas ({data.myTasks.length})</CardTitle>
          <CardDescription>Asignaciones abiertas ordenadas por vencimiento.</CardDescription>
        </CardHeader>
        <CardContent aria-label="Lista de mis tareas" className="min-h-0 flex-1 overflow-y-auto">
          {data.myTasks.length ? <div className="space-y-4">{data.myTasks.map((task) => <div key={task.id} className="flex justify-between gap-4 border-b pb-3 last:border-0"><div><Link to="/tareas" className="font-medium hover:underline">{task.title}</Link>{task.legalCase ? <Link to={`/juicios/${task.legalCase.id}`} className="block text-xs text-stone-500 hover:underline">{task.legalCase.caseNumber} · {task.legalCase.title}</Link> : null}</div><span className={`text-xs ${task.dueDate && new Date(task.dueDate) < new Date() ? 'font-medium text-red-600' : 'text-stone-500'}`}><Clock className="mr-1 inline h-3 w-3" />{due(task.dueDate)}</span></div>)}</div> : <p className="py-8 text-center text-sm text-stone-500">No tenés tareas pendientes.</p>}
        </CardContent>
      </Card>
      <Card className="h-[450px] max-h-[450px] lg:col-span-3">
        <CardHeader className="shrink-0">
          <div className="flex items-start justify-between gap-3"><div><CardTitle>Actividad reciente</CardTitle><CardDescription>Movimientos relevantes del estudio.</CardDescription></div>{user?.permissions.includes('audit.read') ? <Link to="/actividad" className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline">Ver todo</Link> : null}</div>
        </CardHeader>
        <CardContent aria-label="Lista de actividad reciente" className="min-h-0 flex-1 overflow-y-auto">
          {data.activity.length ? <div className="space-y-5">{data.activity.map((item) => <div key={item.id} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-stone-100 text-xs">{item.actor?.name.charAt(0) ?? '?'}</span><div><p className="text-sm"><strong>{item.actor?.name ?? 'Sistema'}</strong> {auditActionLabel(item.action)}</p><time className="text-xs text-stone-400">{date(item.createdAt)}</time></div></div>)}</div> : <p className="py-8 text-center text-sm text-stone-500">Sin actividad visible.</p>}
        </CardContent>
      </Card>
    </div>
  </div>;
};

function DashboardSkeleton() { return <div aria-label="Cargando dashboard" className="animate-pulse space-y-6"><div className="h-16 w-72 rounded bg-stone-200" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-xl bg-stone-200" />)}</div><div className="h-80 rounded-xl bg-stone-200" /></div>; }

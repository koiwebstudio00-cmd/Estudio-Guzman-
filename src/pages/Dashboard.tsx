import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Scale, CheckSquare, AlertCircle, Clock, Users } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { cases, tasks, contacts, currentUser, logs, users } = useAppStore();

  const activeCasesCount = cases.filter(c => c.status === 'Activo').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completada').length;
  const overdueTasksCount = tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && t.status !== 'Completada').length;
  const todayTasksCount = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)) && t.status !== 'Completada').length;
  const clientsCount = contacts.filter(c => c.type === 'Cliente').length;

  const myTasks = tasks.filter(t => t.responsibleId === currentUser?.id && t.status !== 'Completada');
  const recentLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const getLogUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Inicio</h1>
        <p className="text-stone-500">Bienvenido/a, {currentUser?.name}. Aquí tienes un resumen de la actividad.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Juicios Activos</CardTitle>
            <Scale className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCasesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <CheckSquare className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="text-xs text-stone-500 mt-1">
              {todayTasksCount} para hoy
            </p>
          </CardContent>
        </Card>
        <Card className={overdueTasksCount > 0 ? "border-red-200" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Vencidas</CardTitle>
            <AlertCircle className={cn("h-4 w-4", overdueTasksCount > 0 ? "text-red-500" : "text-stone-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", overdueTasksCount > 0 ? "text-red-600" : "")}>{overdueTasksCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-stone-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Mis Tareas ({myTasks.length})</CardTitle>
            <CardDescription>Tareas asignadas a ti que requieren atención.</CardDescription>
          </CardHeader>
          <CardContent>
            {myTasks.length > 0 ? (
              <div className="space-y-4">
                {myTasks.slice(0, 5).map(task => {
                  const relatedCase = cases.find(c => c.id === task.caseId);
                  return (
                    <div key={task.id} className="flex items-start justify-between border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-1">
                        <Link to={`/tareas`} className="font-medium text-stone-900 hover:underline">{task.title}</Link>
                        {relatedCase && (
                          <Link to={`/juicios/${relatedCase.id}`} className="text-xs text-stone-500 hover:underline">
                            Exp. {relatedCase.caseNumber} - {relatedCase.title}
                          </Link>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          task.priority === 'Urgente' ? "bg-red-100 text-red-700" :
                          task.priority === 'Alta' ? "bg-orange-100 text-orange-700" :
                          "bg-stone-100 text-stone-700"
                        )}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={cn("text-xs flex items-center gap-1", 
                            isPast(parseISO(task.dueDate)) ? "text-red-500 font-medium" : "text-stone-500"
                          )}>
                            <Clock className="h-3 w-3" />
                            {format(parseISO(task.dueDate), "d MMM", { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500 text-sm">
                No tienes tareas pendientes. ¡Buen trabajo!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 flex flex-col min-h-0 overflow-hidden max-h-[500px] lg:max-h-none">
          <CardHeader className="shrink-0">
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {recentLogs.map((log) => {
                const user = users.find(u => u.id === log.userId);
                const userName = user ? user.name : 'Alguien';
                
                return (
                  <div key={log.id} className="flex gap-3">
                    <div className="relative mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 border border-stone-200">
                      <span className="text-xs font-medium text-stone-600">{userName.charAt(0)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm text-stone-600">
                        <span className="font-medium text-stone-900">{userName}</span> {log.action}
                      </p>
                      <time className="text-xs text-stone-400">
                        {format(parseISO(log.timestamp), "d MMM, HH:mm", { locale: es })}
                      </time>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper inside file until we have a proper utility
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

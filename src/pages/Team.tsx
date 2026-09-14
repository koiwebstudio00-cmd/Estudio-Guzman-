import React from 'react';
import { useAppStore } from '../store/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Scale, CheckSquare, Clock } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

export const Team: React.FC = () => {
  const { users, tasks, cases } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Equipo</h1>
        <p className="text-stone-500">Métricas y asignaciones de los integrantes del estudio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => {
          const userTasks = tasks.filter(t => t.responsibleId === user.id && t.status !== 'Completada');
          const overdueTasks = userTasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)));
          const userCases = cases.filter(c => c.responsibleId === user.id && c.status === 'Activo');

          return (
            <Card key={user.id} className="hover:border-stone-400 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-lg font-semibold text-stone-700 border-2 border-stone-200 group-hover:border-stone-400 transition-colors">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <p className="text-sm text-stone-500">{user.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Scale className="h-4 w-4" /> Juicios activos
                  </div>
                  <span className="font-semibold">{userCases.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-stone-600">
                    <CheckSquare className="h-4 w-4" /> Tareas pendientes
                  </div>
                  <span className="font-semibold">{userTasks.length}</span>
                </div>
                {overdueTasks.length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                      <Clock className="h-4 w-4" /> Tareas vencidas
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">{overdueTasks.length}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

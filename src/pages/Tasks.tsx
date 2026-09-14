import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Button } from '../components/ui/button';
import { Plus, LayoutGrid, List, CalendarIcon, User, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Task, TaskPriority, TaskStatus } from '../types';

export const Tasks: React.FC = () => {
  const { tasks, users, cases, currentUser, addTask, updateTask } = useAppStore();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const initialForm = {
    title: '',
    description: '',
    responsibleId: 'none',
    dueDate: '',
    priority: 'Media' as TaskPriority,
    status: 'Pendiente' as TaskStatus,
    caseId: 'none'
  };
  const [formData, setFormData] = useState(initialForm);

  const getAssignee = (id: string) => (users || []).find(u => u.id === id)?.name || 'Sin asignar';
  const getCaseName = (id?: string) => (cases || []).find(c => c.id === id)?.title;

  const safeFormatDate = (dateStr: string | undefined, fmt: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), fmt, { locale: es });
    } catch (e) {
      return '-';
    }
  };

  const handleCreateTask = () => {
    if (!formData.title || !formData.responsibleId) return;

    addTask({
      title: formData.title,
      description: formData.description,
      responsibleId: formData.responsibleId,
      createdById: currentUser?.id || users[0]?.id,
      dueDate: formData.dueDate || undefined,
      priority: formData.priority,
      status: formData.status,
      caseId: formData.caseId !== 'none' ? formData.caseId : undefined,
    });
    setNewTaskOpen(false);
    setFormData(initialForm);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div 
      onClick={() => setSelectedTask(task)}
      className="bg-white p-3 rounded-lg shadow-sm border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <Badge variant="outline" className={
          task.priority === 'Urgente' ? 'bg-red-50 text-red-700' :
          task.priority === 'Alta' ? 'bg-orange-50 text-orange-700' : ''
        }>
          {task.priority}
        </Badge>
        {task.dueDate && <span className="text-xs text-stone-500">{safeFormatDate(task.dueDate, "dd/MM")}</span>}
      </div>
      <h4 className="font-medium text-stone-900 text-sm mb-2">{task.title}</h4>
      {task.caseId && (
        <p className="text-xs text-stone-500 truncate mb-3 hover:text-stone-700 hover:underline">
          {getCaseName(task.caseId)}
        </p>
      )}
      <div className="flex justify-between items-center mt-auto">
        <div className="h-6 w-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-medium border border-stone-200" title={getAssignee(task.responsibleId)}>
          {getAssignee(task.responsibleId)?.charAt(0) || '?'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tareas</h1>
          <p className="text-stone-500">Gestión de actividades y vencimientos.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-stone-100 p-1 rounded-lg flex">
            <button 
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-white shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button className="gap-2 ml-auto sm:ml-0" onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex-1 min-h-0 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="flex sm:grid sm:grid-cols-3 gap-6 h-full pb-4 sm:pb-0 w-max sm:w-auto">
            {(['Pendiente', 'En progreso', 'Completada'] as TaskStatus[]).map(status => {
              const columnTasks = (tasks || []).filter(t => t.status === status);
              return (
                <div key={status} className="bg-stone-50/50 rounded-xl p-4 flex flex-col border border-stone-100 overflow-hidden h-full w-[85vw] sm:w-auto shrink-0 max-w-sm sm:max-w-none">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="font-semibold text-stone-700">{status}</h3>
                    <Badge variant="secondary" className="bg-stone-200 text-stone-700">{columnTasks.length}</Badge>
                  </div>
                  <div className="space-y-3 overflow-y-auto pr-1 pb-4 flex-1">
                    {columnTasks.map(t => <TaskCard key={t.id} task={t} />)}
                    {columnTasks.length === 0 && (
                      <div className="border-2 border-dashed border-stone-200 rounded-lg h-24 flex items-center justify-center text-sm text-stone-400">
                        Sin tareas
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-8 text-center text-stone-500">
            Vista de lista en desarrollo. (Usar la vista de tablero Kanban mientras tanto)
          </div>
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
            <DialogDescription>
              Crea una nueva tarea y asígnala a un miembro del equipo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Título de la tarea *</label>
              <Input 
                placeholder="Ej. Revisar demanda..." 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Descripción</label>
              <Textarea 
                placeholder="Detalles adicionales..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Responsable *</label>
                <Select value={formData.responsibleId} onValueChange={v => setFormData({...formData, responsibleId: v})}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {(users || []).map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Fecha de Vencimiento</label>
                <Input 
                  type="date" 
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Prioridad</label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v as TaskPriority})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Expediente (Opcional)</label>
                <Select value={formData.caseId} onValueChange={v => setFormData({...formData, caseId: v})}>
                  <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {(cases || []).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateTask} disabled={!formData.title || formData.responsibleId === 'none'}>
              Crear Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={
                    selectedTask.priority === 'Urgente' ? 'bg-red-50 text-red-700 border-red-200' :
                    selectedTask.priority === 'Alta' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-stone-50'
                  }>
                    {selectedTask.priority}
                  </Badge>
                  <Badge variant="secondary" className="bg-stone-100 text-stone-600">
                    {selectedTask.status}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-6">
                {/* Meta details */}
                <div className="flex flex-wrap gap-4 p-4 bg-stone-50 rounded-lg border border-stone-100 text-sm">
                  <div className="flex items-center gap-2 text-stone-600">
                    <User className="h-4 w-4 text-stone-400" />
                    <span>Responsable: <span className="font-medium text-stone-900">{getAssignee(selectedTask.responsibleId)}</span></span>
                  </div>
                  {selectedTask.dueDate && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <CalendarIcon className="h-4 w-4 text-stone-400" />
                      <span>Vence: <span className="font-medium text-stone-900">{safeFormatDate(selectedTask.dueDate, "dd MMMM, yyyy")}</span></span>
                    </div>
                  )}
                  {selectedTask.caseId && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Briefcase className="h-4 w-4 text-stone-400" />
                      <span className="truncate max-w-[200px]">Caso: <span className="font-medium text-stone-900">{getCaseName(selectedTask.caseId)}</span></span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                    <FileText className="h-4 w-4 text-stone-500" />
                    Descripción
                  </h4>
                  <div className="text-sm text-stone-700 bg-white border border-stone-200 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap">
                    {selectedTask.description || <span className="text-stone-400 italic">No hay descripción proporcionada.</span>}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between items-center">
                <div className="flex gap-2">
                  <Select 
                    value={selectedTask.status} 
                    onValueChange={(v) => handleStatusChange(selectedTask.id, v as TaskStatus)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En progreso">En progreso</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="default" onClick={() => setSelectedTask(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

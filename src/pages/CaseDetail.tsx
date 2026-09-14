import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { FileText, ArrowLeft, Plus, FolderOpen, AlertCircle, CheckSquare, Clock, Download, FileUp, Edit } from 'lucide-react';
import { CaseAction, SubCase, Task, Note, ActionType } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, contacts, users, courts, offices, actions, subCases, tasks, notes, addAction, addNote } = useAppStore();
  const [activeTab, setActiveTab] = useState('expediente');
  
  // Modals state
  const [newActionOpen, setNewActionOpen] = useState(false);
  const [newNoteOpen, setNewNoteOpen] = useState(false);

  const legalCase = (cases || []).find(c => c.id === id);

  if (!legalCase) {
    return <div className="p-8 text-center text-stone-500">Juicio no encontrado</div>;
  }

  const client = (contacts || []).find(c => c.id === legalCase.clientId);
  const opponent = (contacts || []).find(c => c.id === legalCase.opponentId);
  const court = (courts || []).find(c => c.id === legalCase.courtId);
  const office = (offices || []).find(c => c.id === legalCase.managementOfficeId);
  const responsible = (users || []).find(u => u.id === legalCase.responsibleId);

  // Filter related data
  const caseActions = (actions || []).filter(a => a.caseId === id && !a.subCaseId).sort((a, b) => new Date(b.documentDate || 0).getTime() - new Date(a.documentDate || 0).getTime());
  const casePruebas = (subCases || []).filter(s => s.caseId === id && s.type === 'Prueba');
  const caseIncidentes = (subCases || []).filter(s => s.caseId === id && s.type === 'Incidente');
  const caseTasks = (tasks || []).filter(t => t.caseId === id);
  const caseNotes = (notes || []).filter(n => n.caseId === id).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Activo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cerrado': return 'bg-stone-200 text-stone-800 border-stone-300';
      case 'Archivado': return 'bg-stone-100 text-stone-500 border-stone-200';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'Demanda':
      case 'Contestación': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'Resolución':
      case 'Decreto': return <AlertCircle className="h-5 w-5 text-purple-500" />;
      case 'Cédula':
      case 'Notificación': return <FileUp className="h-5 w-5 text-amber-500" />;
      default: return <FileText className="h-5 w-5 text-stone-500" />;
    }
  };

  const safeFormatDate = (dateStr: string | undefined, fmt: string) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), fmt, { locale: es });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/juicios')} className="-ml-3 text-stone-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Juicios
        </Button>
      </div>

      {/* Header section */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-800" />
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-stone-100 text-stone-600 font-medium px-2.5 py-0.5">
                Exp. {legalCase.caseNumber}
              </Badge>
              <Badge variant="outline" className={getStatusColor(legalCase.status)}>
                {legalCase.status}
              </Badge>
              <span className="text-sm font-medium text-stone-500 border-l border-stone-200 pl-3">
                {legalCase.type}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 leading-tight mb-1">
                {legalCase.title}
              </h1>
              <p className="text-stone-500 flex items-center gap-2">
                <span className="font-medium text-stone-700">{client?.firstName} {client?.lastName}</span> c/ <span className="font-medium text-stone-700">{opponent?.firstName} {opponent?.lastName || ''}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[200px] shrink-0">
            <Button onClick={() => setNewActionOpen(true)} className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Agregar actuación
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setNewNoteOpen(true)}>Nota</Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate('/tareas')}>Tarea</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-stone-100 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Juzgado</span>
            <span className="text-sm font-medium text-stone-800 line-clamp-2">{court?.name || '-'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Oficina de Gestión</span>
            <span className="text-sm font-medium text-stone-800 line-clamp-2">{office?.name || '-'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Inicio</span>
            <span className="text-sm font-medium text-stone-800">{safeFormatDate(legalCase.startDate, "d MMM yyyy")}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Responsable</span>
            <span className="text-sm font-medium text-stone-800">{responsible?.name || 'Sin asignar'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-stone-100 rounded-lg overflow-x-auto flex-nowrap hide-scrollbar">
          <TabsTrigger value="expediente" className="py-2.5 px-4 text-sm">Expediente Principal</TabsTrigger>
          <TabsTrigger value="pruebas" className="py-2.5 px-4 text-sm">Pruebas ({casePruebas.length})</TabsTrigger>
          <TabsTrigger value="incidentes" className="py-2.5 px-4 text-sm">Incidentes ({caseIncidentes.length})</TabsTrigger>
          <TabsTrigger value="tareas" className="py-2.5 px-4 text-sm">Tareas ({caseTasks.filter(t=>t.status!=='Completada').length})</TabsTrigger>
          <TabsTrigger value="notas" className="py-2.5 px-4 text-sm">Notas</TabsTrigger>
          <TabsTrigger value="info" className="py-2.5 px-4 text-sm">Información</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="expediente" className="m-0 focus-visible:outline-none">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Línea de tiempo</h3>
            </div>
            
            <div className="space-y-4">
              {caseActions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40 text-stone-500">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    <p>No hay actuaciones en el expediente principal.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative border-l-2 border-stone-200 ml-4 pl-6 space-y-8 py-2">
                  {caseActions.map((action, index) => {
                    const uploader = users.find(u => u.id === action.uploadedById);
                    return (
                      <div key={action.id} className="relative">
                        <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-stone-400" />
                        </div>
                        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                                {getActionIcon(action.type)}
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-600 hover:bg-stone-200 border-transparent">
                                    {action.type}
                                  </Badge>
                                  <span className="text-xs text-stone-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {safeFormatDate(action.documentDate, "dd/MM/yyyy HH:mm")}
                                  </span>
                                </div>
                                <h4 className="text-base font-semibold text-stone-900">{action.title}</h4>
                                {action.description && (
                                  <p className="text-sm text-stone-600 mt-2">{action.description}</p>
                                )}
                                <div className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                                  Cargado por <span className="font-medium text-stone-700">{uploader?.name || 'Sistema'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {action.hasFile && (
                              <Button variant="outline" size="sm" className="shrink-0" onClick={() => toast.success('Descargando documento...')}>
                                <Download className="h-4 w-4 mr-2" />
                                Ver PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Additional tab contents will go here, keeping simple for now */}
          <TabsContent value="pruebas" className="m-0 space-y-4">
             <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Cuadernos de Prueba</h3>
              <Button variant="outline" size="sm" onClick={() => toast('Funcionalidad en desarrollo')}><Plus className="h-4 w-4 mr-2" /> Nuevo Cuaderno</Button>
            </div>
            {casePruebas.length === 0 ? (
              <div className="text-center p-8 text-stone-500 bg-white rounded-xl border border-stone-200">No hay cuadernos de prueba.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {casePruebas.map(prueba => (
                  <Card key={prueba.id} className="hover:border-stone-400 cursor-pointer transition-colors" onClick={() => toast('Abriendo cuaderno...')}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className={prueba.status === 'Activo' ? 'bg-green-50 text-green-700' : ''}>{prueba.status}</Badge>
                      </div>
                      <CardTitle className="mt-3 text-lg">{prueba.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-stone-500">Clic para ver actuaciones de prueba</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tareas" className="m-0 space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
               <div className="p-4 border-b border-stone-100 font-semibold bg-stone-50">Tareas del juicio</div>
               <div className="divide-y divide-stone-100">
                  {caseTasks.length === 0 && <div className="p-8 text-center text-stone-500">No hay tareas asociadas.</div>}
                  {caseTasks.map(task => {
                    const resp = users.find(u => u.id === task.responsibleId);
                    return (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-stone-50">
                        <div className="flex items-center gap-3">
                          <CheckSquare className={task.status === 'Completada' ? "text-green-500" : "text-stone-400"} />
                          <div className={task.status === 'Completada' ? "line-through text-stone-400" : "font-medium"}>
                            {task.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-stone-500">{resp?.name}</span>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      </div>
                    )
                  })}
               </div>
            </div>
          </TabsContent>

          <TabsContent value="notas" className="m-0 space-y-4">
            <div className="space-y-4">
              {caseNotes.map(note => {
                const author = users.find(u => u.id === note.authorId);
                return (
                  <div key={note.id} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                    <p className="text-stone-800 whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-medium">{author?.name}</span>
                      <span>{safeFormatDate(note.createdAt, "dd/MM/yyyy HH:mm")}</span>
                    </div>
                  </div>
                )
              })}
              {caseNotes.length === 0 && (
                 <div className="text-center p-8 text-stone-500 bg-white rounded-xl border border-stone-200">No hay notas.</div>
              )}
            </div>
          </TabsContent>
          
        </div>
      </Tabs>

      {/* New Action Modal implementation */}
      <NewActionModal 
        open={newActionOpen} 
        onOpenChange={setNewActionOpen} 
        caseId={legalCase.id} 
      />

      <NewNoteModal
        open={newNoteOpen}
        onOpenChange={setNewNoteOpen}
        caseId={legalCase.id}
      />
    </div>
  );
};

// Extracted Modals for clean code
const NewActionModal = ({ open, onOpenChange, caseId }: { open: boolean, onOpenChange: (v: boolean) => void, caseId: string }) => {
  const { addAction, currentUser } = useAppStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActionType>('Presentación');
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !currentUser) return;
    
    addAction({
      caseId,
      title,
      type,
      documentDate: new Date(date).toISOString(),
      uploadedById: currentUser.id,
      hasFile: true // mock
    });
    
    toast.success('Actuación agregada correctamente');
    onOpenChange(false);
    setTitle('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Actuación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del documento</Label>
            <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Contestación de demanda" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Demanda">Demanda</SelectItem>
                  <SelectItem value="Contestación">Contestación</SelectItem>
                  <SelectItem value="Cédula">Cédula</SelectItem>
                  <SelectItem value="Decreto">Decreto</SelectItem>
                  <SelectItem value="Resolución">Resolución</SelectItem>
                  <SelectItem value="Presentación">Presentación</SelectItem>
                  <SelectItem value="Oficio">Oficio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha del documento</Label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-stone-100 mt-4">
            <Label>Archivo PDF</Label>
            <div className="border-2 border-dashed border-stone-200 rounded-lg p-6 flex flex-col items-center justify-center text-stone-500 bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors">
              <FileUp className="h-8 w-8 mb-2 text-stone-400" />
              <p className="text-sm font-medium">Hacé clic o arrastrá el PDF aquí</p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Guardar actuación</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NewNoteModal = ({ open, onOpenChange, caseId }: { open: boolean, onOpenChange: (v: boolean) => void, caseId: string }) => {
  const { addNote, currentUser } = useAppStore();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !currentUser) return;
    
    addNote({
      caseId,
      content,
      authorId: currentUser.id,
    });
    
    toast.success('Nota agregada');
    onOpenChange(false);
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Nota Interna</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Textarea 
            placeholder="Escribe la nota aquí. Será visible para el equipo." 
            className="min-h-[150px] bg-amber-50 border-amber-200 focus-visible:ring-amber-500"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Guardar nota</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

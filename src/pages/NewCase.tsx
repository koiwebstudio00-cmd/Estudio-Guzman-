import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const NewCase: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, courts, offices, users, currentUser, addCase } = useAppStore();

  const [formData, setFormData] = useState({
    title: '',
    caseNumber: '',
    type: 'Laboral',
    status: 'Activo',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    courtId: '',
    managementOfficeId: '',
    clientId: '',
    opponentId: '',
    responsibleId: 'none',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId || !formData.caseNumber) {
      toast.error('Completá los campos obligatorios.');
      return;
    }

    const newCase = addCase({
      title: formData.title,
      caseNumber: formData.caseNumber,
      type: formData.type as any,
      status: formData.status as any,
      startDate: new Date(formData.startDate).toISOString(),
      courtId: formData.courtId,
      managementOfficeId: formData.managementOfficeId,
      clientId: formData.clientId,
      opponentId: formData.opponentId || undefined,
      responsibleId: formData.responsibleId,
    });

    toast.success('Juicio creado exitosamente');
    navigate(`/juicios/${newCase.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/juicios')} className="-ml-3 text-stone-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Juicios
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Nuevo Juicio</h1>
        <p className="text-stone-500">Completá la información inicial del expediente.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del expediente</CardTitle>
            <CardDescription>Datos principales de la carátula y estado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Carátula *</Label>
                <Input id="title" required placeholder="Ej. Díaz c/ Panini S.A." value={formData.title} onChange={e => handleChange('title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Número de expediente *</Label>
                <Input id="caseNumber" required placeholder="Ej. 123456/2026" value={formData.caseNumber} onChange={e => handleChange('caseNumber', e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Fuero</Label>
                <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laboral">Laboral</SelectItem>
                    <SelectItem value="Civil y Comercial">Civil y Comercial</SelectItem>
                    <SelectItem value="Penal">Penal</SelectItem>
                    <SelectItem value="Familia">Familia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha de inicio</Label>
                <Input type="date" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partes</CardTitle>
            <CardDescription>Seleccioná o creá las personas/empresas involucradas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente / Actor *</Label>
                <Select value={formData.clientId} onValueChange={v => handleChange('clientId', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {(contacts || []).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-stone-500">Podés crear nuevos contactos desde el módulo Contactos.</p>
              </div>
              <div className="space-y-2">
                <Label>Contraparte / Demandado</Label>
                <Select value={formData.opponentId} onValueChange={v => handleChange('opponentId', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar demandado (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {(contacts || []).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Radicación y Asignación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Juzgado / Tribunal</Label>
                <Select value={formData.courtId} onValueChange={v => handleChange('courtId', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar juzgado" /></SelectTrigger>
                  <SelectContent>
                    {(courts || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Oficina de Gestión</Label>
                <Select value={formData.managementOfficeId} onValueChange={v => handleChange('managementOfficeId', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar OGA" /></SelectTrigger>
                  <SelectContent>
                    {(offices || []).map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 max-w-sm">
              <Label>Responsable interno</Label>
              <Select value={formData.responsibleId} onValueChange={v => handleChange('responsibleId', v)}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {(users || []).map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/juicios')}>Cancelar</Button>
          <Button type="submit">Crear Juicio</Button>
        </div>
      </form>
    </div>
  );
};

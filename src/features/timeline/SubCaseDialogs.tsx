import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ApiProblem } from '../../lib/api';
import { createSubCase, transitionSubCase, updateSubCase } from './api';
import type { SubCase } from './types';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo guardar el cuaderno.';

interface SubCaseDialogProps {
  open: boolean;
  caseId: string;
  subCase?: SubCase;
  onOpenChange(open: boolean): void;
  onSaved(value: SubCase): void;
}

export function SubCaseDialog({ open, caseId, subCase, onOpenChange, onSaved }: SubCaseDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const description = String(form.get('description') ?? '').trim();
    setSubmitting(true);
    try {
      const saved = subCase
        ? await updateSubCase(subCase.id, {
            version: subCase.version,
            title: String(form.get('title')),
            description: description || null,
          })
        : await createSubCase(caseId, {
            type: String(form.get('type')) as SubCase['type'],
            title: String(form.get('title')),
            description,
          });
      onSaved(saved);
      onOpenChange(false);
      toast.success(subCase ? 'Cuaderno actualizado.' : 'Cuaderno creado.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form key={subCase?.id ?? 'new-subcase'} onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{subCase ? 'Editar cuaderno' : 'Nuevo cuaderno o incidente'}</DialogTitle>
            <DialogDescription>{subCase ? 'Actualizá la información descriptiva del cuaderno.' : 'Definí el tipo y los datos iniciales.'}</DialogDescription>
          </DialogHeader>
          {!subCase ? <><Label htmlFor="subcase-type">Tipo</Label><select id="subcase-type" name="type" className="h-9 w-full rounded-md border px-3"><option value="EVIDENCE">Prueba</option><option value="INCIDENT">Incidente</option></select></> : null}
          <Label htmlFor="subcase-title">Título</Label>
          <Input id="subcase-title" name="title" defaultValue={subCase?.title} required />
          <Label htmlFor="subcase-description">Descripción</Label>
          <Textarea id="subcase-description" name="description" defaultValue={subCase?.description ?? ''} rows={4} />
          <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const statusLabels: Record<SubCase['status'], string> = { ACTIVE: 'Activo', RESOLVED: 'Resuelto', CLOSED: 'Cerrado' };
const nextStatuses: Record<SubCase['status'], SubCase['status'][]> = {
  ACTIVE: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['ACTIVE', 'CLOSED'],
  CLOSED: ['ACTIVE'],
};

interface SubCaseStatusDialogProps {
  open: boolean;
  subCase: SubCase;
  canReopen: boolean;
  onOpenChange(open: boolean): void;
  onSaved(value: SubCase): void;
}

export function SubCaseStatusDialog({ open, subCase, canReopen, onOpenChange, onSaved }: SubCaseStatusDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const options = subCase.status === 'CLOSED' && !canReopen ? [] : nextStatuses[subCase.status];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const saved = await transitionSubCase(subCase.id, {
        version: subCase.version,
        toStatus: String(form.get('toStatus')) as SubCase['status'],
        reason: String(form.get('reason')),
      });
      onSaved(saved);
      onOpenChange(false);
      toast.success('Estado del cuaderno actualizado.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form key={`${subCase.id}-${subCase.version}`} onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Cambiar estado del cuaderno</DialogTitle>
            <DialogDescription>El cambio quedará registrado en el historial del juicio. Un cuaderno cerrado pasa a modo de sólo lectura.</DialogDescription>
          </DialogHeader>
          <Label htmlFor="subcase-next-status">Nuevo estado</Label>
          <select id="subcase-next-status" name="toStatus" className="h-9 w-full rounded-md border px-3" required>{options.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>
          <Label htmlFor="subcase-status-reason">Motivo</Label>
          <Textarea id="subcase-status-reason" name="reason" rows={3} required />
          <DialogFooter><Button type="submit" disabled={submitting || options.length === 0}>{submitting ? 'Actualizando…' : 'Confirmar cambio'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

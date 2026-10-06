import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { Catalogs } from '../contacts/types';
import { ApiProblem } from '../../lib/api';
import { createAction, updateAction } from './api';
import type { CaseAction, SubCase } from './types';

const localDateValue = (value = new Date()) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const documentDateToIso = (value: string) => new Date(`${value}T12:00:00`).toISOString();
const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo registrar la actuación.';

interface ActionDialogProps {
  open: boolean;
  caseId: string;
  subcases: SubCase[];
  catalogs: Catalogs | null;
  fixedSubCase?: SubCase;
  action?: CaseAction;
  onOpenChange(open: boolean): void;
  onSaved(action: CaseAction): void;
}

export function ActionDialog({ open, caseId, subcases, catalogs, fixedSubCase, action, onOpenChange, onSaved }: ActionDialogProps) {
  const [documentDate, setDocumentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setDocumentDate(action ? localDateValue(new Date(action.documentAt)) : '');
  }, [action, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedSubCaseId = fixedSubCase?.id ?? String(form.get('subCaseId') ?? '');
    setSubmitting(true);
    try {
      const description = String(form.get('description') ?? '').trim();
      const saved = action
        ? await updateAction(action.id, {
            version: action.version,
            title: String(form.get('title')),
            type: String(form.get('type')),
            documentAt: documentDateToIso(documentDate),
            description: description || null,
          })
        : await createAction(caseId, {
            title: String(form.get('title')),
            type: String(form.get('type')),
            documentAt: documentDateToIso(documentDate),
            subCaseId: selectedSubCaseId || null,
            description,
          });
      onSaved(saved);
      onOpenChange(false);
      toast.success(action ? 'Actuación actualizada.' : 'Actuación registrada.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form key={action?.id ?? 'new-action'} onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>{action ? 'Editar actuación' : 'Nueva actuación'}</DialogTitle><DialogDescription>{action ? 'Corregí los datos de la actuación. El juicio y el cuaderno de destino no se modifican.' : fixedSubCase ? `Se registrará dentro de “${fixedSubCase.title}”.` : 'Puede asociarse al expediente principal o a un cuaderno abierto.'}</DialogDescription></DialogHeader><Label htmlFor="action-title">Título</Label><Input id="action-title" name="title" defaultValue={action?.title} required /><Label htmlFor="action-type">Tipo</Label><select id="action-type" name="type" defaultValue={action?.type} className="h-9 w-full rounded-md border px-3">{catalogs?.actionTypes?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{action?.subCase || fixedSubCase ? <div className="rounded-lg border bg-stone-50 p-3"><p className="text-xs font-medium uppercase text-stone-500">Cuaderno</p><p className="mt-1 font-medium">{action?.subCase?.title ?? fixedSubCase?.title}</p></div> : action ? <div className="rounded-lg border bg-stone-50 p-3"><p className="text-xs font-medium uppercase text-stone-500">Ubicación</p><p className="mt-1 font-medium">Expediente principal</p></div> : <><Label htmlFor="action-subcase">Cuaderno</Label><select id="action-subcase" name="subCaseId" className="h-9 w-full rounded-md border px-3"><option value="">Expediente principal</option>{subcases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></>}<div className="flex items-center justify-between"><Label htmlFor="action-date">Fecha</Label><Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setDocumentDate(localDateValue())}>Hoy</Button></div><Input id="action-date" name="documentAt" type="date" value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} required /><Label htmlFor="action-description">Descripción</Label><Input id="action-description" name="description" defaultValue={action?.description ?? ''} /><DialogFooter><Button type="submit" disabled={submitting}>{submitting ? 'Guardando…' : action ? 'Guardar cambios' : 'Registrar'}</Button></DialogFooter></form></DialogContent></Dialog>;
}

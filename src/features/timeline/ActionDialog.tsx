import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { Catalogs } from '../contacts/types';
import { ApiProblem } from '../../lib/api';
import { createAction } from './api';
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
  onOpenChange(open: boolean): void;
  onSaved(action: CaseAction): void;
}

export function ActionDialog({ open, caseId, subcases, catalogs, fixedSubCase, onOpenChange, onSaved }: ActionDialogProps) {
  const [documentDate, setDocumentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) setDocumentDate('');
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedSubCaseId = fixedSubCase?.id ?? String(form.get('subCaseId') ?? '');
    setSubmitting(true);
    try {
      const action = await createAction(caseId, {
        title: String(form.get('title')),
        type: String(form.get('type')),
        documentAt: documentDateToIso(documentDate),
        subCaseId: selectedSubCaseId || null,
        description: String(form.get('description') ?? ''),
      });
      onSaved(action);
      onOpenChange(false);
      toast.success('Actuación registrada.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>Nueva actuación</DialogTitle><DialogDescription>{fixedSubCase ? `Se registrará dentro de “${fixedSubCase.title}”.` : 'Puede asociarse al expediente principal o a un cuaderno abierto.'}</DialogDescription></DialogHeader><Label htmlFor="action-title">Título</Label><Input id="action-title" name="title" required /><Label htmlFor="action-type">Tipo</Label><select id="action-type" name="type" className="h-9 w-full rounded-md border px-3">{catalogs?.actionTypes?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{fixedSubCase ? <div className="rounded-lg border bg-stone-50 p-3"><p className="text-xs font-medium uppercase text-stone-500">Cuaderno</p><p className="mt-1 font-medium">{fixedSubCase.title}</p></div> : <><Label htmlFor="action-subcase">Cuaderno</Label><select id="action-subcase" name="subCaseId" className="h-9 w-full rounded-md border px-3"><option value="">Expediente principal</option>{subcases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></>}<div className="flex items-center justify-between"><Label htmlFor="action-date">Fecha</Label><Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setDocumentDate(localDateValue())}>Hoy</Button></div><Input id="action-date" name="documentAt" type="date" value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} required /><Label htmlFor="action-description">Descripción</Label><Input id="action-description" name="description" /><DialogFooter><Button type="submit" disabled={submitting}>{submitting ? 'Registrando…' : 'Registrar'}</Button></DialogFooter></form></DialogContent></Dialog>;
}

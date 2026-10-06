import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, CalendarDays, Edit, FileText, FolderOpen, Trash2, UserRound } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { DeleteResourceDialog } from '../components/DeleteResourceDialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getCase } from '../features/cases/api';
import type { LegalCase } from '../features/cases/types';
import { getCatalogs } from '../features/contacts/api';
import type { CatalogOption, Catalogs } from '../features/contacts/types';
import { CaseDocuments } from '../features/documents/CaseDocuments';
import { ActionDialog } from '../features/timeline/ActionDialog';
import { deleteAction, getAction } from '../features/timeline/api';
import type { CaseAction } from '../features/timeline/types';
import { ApiProblem } from '../lib/api';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo cargar la actuación.';
const date = (value: string | null) => value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(value)) : '—';

export function ActionDetail() {
  const { id: caseId, subCaseId, actionId } = useParams<{ id: string; subCaseId: string; actionId: string }>();
  const navigate = useNavigate();
  const { can, user } = useAuth();
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [action, setAction] = useState<CaseAction | null>(null);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId || !actionId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void Promise.all([getCase(caseId), getAction(actionId, controller.signal), getCatalogs()]).then(([nextCase, nextAction, nextCatalogs]) => {
      if (controller.signal.aborted) return;
      if (nextAction.caseId !== nextCase.id || (subCaseId && nextAction.subCase?.id !== subCaseId)) throw new Error('La actuación no pertenece a este cuaderno.');
      setLegalCase(nextCase);
      setAction(nextAction);
      setCatalogs(nextCatalogs);
    }).catch((requestError) => {
      if (!controller.signal.aborted) setError(errorMessage(requestError));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [actionId, caseId, subCaseId]);

  const labels = useMemo(() => {
    const result = new Map<string, string>();
    (Object.values(catalogs ?? {}) as CatalogOption[][]).flat().forEach((item) => result.set(item.value, item.label));
    return result;
  }, [catalogs]);

  if (loading) return <p className="text-stone-500">Cargando actuación…</p>;
  if (!caseId || !actionId || !legalCase || !action) return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error ?? 'Actuación no encontrada.'}</div>;

  const backTo = subCaseId ? `/juicios/${caseId}/cuadernos/${subCaseId}` : `/juicios/${caseId}`;
  const readOnly = legalCase.status === 'ARCHIVED' || action.subCase?.status === 'CLOSED';
  const canEdit = can('actions.update') && !readOnly && (can('cases.update') || (action.uploadedBy.id === user?.id && legalCase.status !== 'CLOSED'));
  const canDelete = can('actions.delete') && !readOnly && (can('cases.archive') || (action.uploadedBy.id === user?.id && action.documentCount === 0 && legalCase.status !== 'CLOSED'));
  return <div className="mx-auto max-w-4xl space-y-6 pb-12">
    <Button variant="ghost" asChild><Link to={backTo}><ArrowLeft className="h-4 w-4" /> Volver a {subCaseId ? 'cuaderno' : 'juicio'}</Link></Button>
    <header className="rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><Badge>{labels.get(action.type) ?? action.type}</Badge>{action.subCase ? <Badge variant="outline">{action.subCase.title}</Badge> : null}</div><p className="mt-4 text-sm text-stone-500">{legalCase.caseNumber} · {legalCase.title}</p><h1 className="mt-1 text-2xl font-bold">{action.title}</h1></div><div className="flex flex-wrap items-center gap-2">{canEdit ? <Button variant="outline" onClick={() => setEditOpen(true)}><Edit className="h-4 w-4" /> Editar actuación</Button> : null}{canDelete ? <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4" /> Eliminar actuación</Button> : null}<FileText className="h-9 w-9 text-stone-300" /></div></div>
      <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-3"><Meta icon={<CalendarDays className="h-4 w-4" />} label="Fecha" value={date(action.documentAt)} /><Meta icon={<UserRound className="h-4 w-4" />} label="Registrada por" value={action.uploadedBy.name} /><Meta icon={<FolderOpen className="h-4 w-4" />} label="Ubicación" value={action.subCase?.title ?? 'Expediente principal'} /></div>
    </header>
    <Card><CardHeader><CardTitle>Detalle</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-stone-700">{action.description ?? 'La actuación no tiene una descripción adicional.'}</p></CardContent></Card>
    <Card><CardContent className="p-6"><CaseDocuments caseId={caseId} actionId={actionId} readOnly={readOnly} compact /></CardContent></Card>
    {readOnly ? <p className="rounded-lg border bg-stone-50 p-4 text-sm text-stone-600">Esta actuación pertenece a un contenido cerrado o archivado y está disponible sólo para consulta.</p> : null}
    <ActionDialog open={editOpen} caseId={caseId} subcases={[]} fixedSubCase={undefined} action={action} catalogs={catalogs} onOpenChange={setEditOpen} onSaved={setAction} />
    <DeleteResourceDialog open={deleteOpen} title="Eliminar actuación" description="Indicá el motivo de la baja. La actuación se quitará del timeline y del cuaderno; el sistema conservará el registro de auditoría." confirmLabel="Eliminar actuación" reasonRequired submitting={deleting} onOpenChange={setDeleteOpen} onConfirm={async (reason) => { if (!reason) return; setDeleting(true); try { await deleteAction(actionId, reason); toast.success('Actuación eliminada.'); navigate(backTo); } catch (requestError) { toast.error(errorMessage(requestError)); } finally { setDeleting(false); } }} />
  </div>;
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex gap-3 rounded-lg bg-stone-50 p-3"><span className="mt-0.5 text-stone-500">{icon}</span><div><p className="text-xs uppercase text-stone-400">{label}</p><p className="font-medium">{value}</p></div></div>;
}

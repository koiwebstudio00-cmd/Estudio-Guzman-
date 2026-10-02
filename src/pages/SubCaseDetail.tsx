import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, CalendarDays, ChevronRight, FileText, Files, NotebookTabs, Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getCase } from '../features/cases/api';
import type { LegalCase } from '../features/cases/types';
import { getCatalogs } from '../features/contacts/api';
import type { CatalogOption, Catalogs } from '../features/contacts/types';
import { CaseDocuments } from '../features/documents/CaseDocuments';
import { ActionDialog } from '../features/timeline/ActionDialog';
import { getActions, getSubCase } from '../features/timeline/api';
import type { CaseAction, SubCase } from '../features/timeline/types';
import { ApiProblem } from '../lib/api';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo cargar el cuaderno.';
const date = (value: string | null) => value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value)) : '—';

export function SubCaseDetail() {
  const { id: caseId, subCaseId } = useParams<{ id: string; subCaseId: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [legalCase, setLegalCase] = useState<LegalCase | null>(null);
  const [subCase, setSubCase] = useState<SubCase | null>(null);
  const [actions, setActions] = useState<CaseAction[]>([]);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId || !subCaseId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void Promise.all([
      getCase(caseId),
      getSubCase(subCaseId, controller.signal),
      getActions(caseId, { subCaseId, signal: controller.signal }),
      getCatalogs(),
    ]).then(([nextCase, nextSubCase, nextActions, nextCatalogs]) => {
      if (controller.signal.aborted) return;
      if (nextSubCase.caseId !== nextCase.id) throw new Error('El cuaderno no pertenece al expediente.');
      setLegalCase(nextCase);
      setSubCase(nextSubCase);
      setActions(nextActions);
      setCatalogs(nextCatalogs);
    }).catch((requestError) => {
      if (!controller.signal.aborted) setError(errorMessage(requestError));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [caseId, subCaseId]);

  const labels = useMemo(() => {
    const result = new Map<string, string>();
    (Object.values(catalogs ?? {}) as CatalogOption[][]).flat().forEach((item) => result.set(item.value, item.label));
    return result;
  }, [catalogs]);

  if (loading) return <p className="text-stone-500">Cargando cuaderno…</p>;
  if (!caseId || !subCaseId || !legalCase || !subCase) return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error ?? 'Cuaderno no encontrado.'}</div>;

  const readOnly = legalCase.status === 'ARCHIVED' || subCase.status === 'CLOSED';
  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <Button variant="ghost" asChild><Link to={`/juicios/${caseId}`}><ArrowLeft className="h-4 w-4" /> Volver al juicio</Link></Button>
    <header className="rounded-xl border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2"><Badge variant="outline">{subCase.type === 'EVIDENCE' ? 'Cuaderno de prueba' : 'Incidente'}</Badge><Badge>{labels.get(subCase.status) ?? subCase.status}</Badge></div>
          <div><p className="text-sm text-stone-500">{legalCase.caseNumber} · {legalCase.title}</p><h1 className="mt-1 text-2xl font-bold">{subCase.title}</h1></div>
          <p className="max-w-3xl text-stone-600">{subCase.description ?? 'Sin descripción.'}</p>
        </div>
        {can('actions.create') && !readOnly ? <Button onClick={() => setActionOpen(true)}><Plus className="h-4 w-4" /> Nueva actuación</Button> : null}
      </div>
      <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-4">
        <Summary icon={<FileText className="h-4 w-4" />} label="Actuaciones" value={actions.length} />
        <Summary icon={<Files className="h-4 w-4" />} label="Documentos" value={subCase.summary.documents} />
        <Summary icon={<NotebookTabs className="h-4 w-4" />} label="Tareas y notas" value={subCase.summary.tasks + subCase.summary.notes} />
        <Summary icon={<CalendarDays className="h-4 w-4" />} label="Apertura" value={date(subCase.openedOn)} />
      </div>
    </header>
    <Tabs defaultValue="actions">
      <TabsList><TabsTrigger value="actions">Actuaciones ({actions.length})</TabsTrigger><TabsTrigger value="documents">Documentos ({subCase.summary.documents})</TabsTrigger></TabsList>
      <TabsContent value="actions" className="space-y-4">
        {actions.length ? <div className="space-y-3">{actions.map((action) => <Link key={action.id} to={`/juicios/${caseId}/cuadernos/${subCaseId}/actuaciones/${action.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"><Card className="transition-colors hover:bg-stone-50"><CardContent className="flex items-start justify-between gap-4 p-4"><div className="flex gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" /><div><strong>{action.title}</strong><p className="mt-1 text-sm text-stone-500">{labels.get(action.type) ?? action.type} · {date(action.documentAt)} · {action.uploadedBy.name}</p>{action.description ? <p className="mt-2 text-sm text-stone-600">{action.description}</p> : null}<p className="mt-2 text-xs text-stone-500">{action.documentCount} {action.documentCount === 1 ? 'documento adjunto' : 'documentos adjuntos'}</p></div></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-stone-400" /></CardContent></Card></Link>)}</div> : <div className="rounded-xl border bg-white p-10 text-center"><FileText className="mx-auto mb-3 h-9 w-9 text-stone-400" /><h2 className="font-semibold">El cuaderno todavía no tiene actuaciones</h2><p className="mt-1 text-sm text-stone-500">Registrá la primera actuación sin volver al timeline general.</p>{can('actions.create') && !readOnly ? <Button className="mt-4" onClick={() => setActionOpen(true)}><Plus className="h-4 w-4" /> Cargar primera actuación</Button> : null}</div>}
      </TabsContent>
      <TabsContent value="documents"><CaseDocuments caseId={caseId} subCaseId={subCaseId} readOnly={readOnly} /></TabsContent>
    </Tabs>
    <ActionDialog open={actionOpen} caseId={caseId} subcases={[]} fixedSubCase={subCase} catalogs={catalogs} onOpenChange={setActionOpen} onSaved={(action) => navigate(`/juicios/${caseId}/cuadernos/${subCaseId}/actuaciones/${action.id}`)} />
  </div>;
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <div className="flex items-center gap-3 rounded-lg bg-stone-50 p-3"><span className="text-stone-500">{icon}</span><div><p className="text-xs uppercase text-stone-400">{label}</p><p className="font-semibold">{value}</p></div></div>;
}

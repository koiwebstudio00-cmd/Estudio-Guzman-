import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Download, FilePlus2, Files, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ApiProblem } from '../../lib/api';
import { getActions } from '../timeline/api';
import type { CaseAction } from '../timeline/types';
import { downloadDocumentVersion, getDocuments, uploadDocument, uploadDocumentVersion, type DocumentContext } from './api';
import type { DocumentCategory, LegalDocument, ScanStatus } from './types';

const categories: Array<{ value: DocumentCategory; label: string }> = [{ value: 'PLEADING', label: 'Escrito' }, { value: 'COURT_ORDER', label: 'Resolución judicial' }, { value: 'EVIDENCE', label: 'Prueba' }, { value: 'NOTICE', label: 'Notificación' }, { value: 'POWER_OF_ATTORNEY', label: 'Poder' }, { value: 'IDENTITY', label: 'Identidad' }, { value: 'INTERNAL', label: 'Interno' }, { value: 'OTHER', label: 'Otro' }];
const scanLabel: Record<ScanStatus, string> = { PENDING: 'Analizando', CLEAN: 'Seguro', INFECTED: 'Bloqueado', FAILED: 'Análisis fallido', SKIPPED: 'Sin scanner local' };
const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : error instanceof Error ? error.message : 'No se pudo completar la operación.';
const size = (bytes: number) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

interface CaseDocumentsProps {
  caseId: string;
  readOnly: boolean;
  subCaseId?: string;
  actionId?: string;
  compact?: boolean;
}

export function CaseDocuments({ caseId, readOnly, subCaseId, actionId, compact = false }: CaseDocumentsProps) {
  const { can } = useAuth();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [actions, setActions] = useState<CaseAction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [versionTarget, setVersionTarget] = useState<LegalDocument | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const context = useMemo<DocumentContext>(() => actionId ? { actionId } : subCaseId ? { subCaseId } : { caseId }, [actionId, caseId, subCaseId]);
  const actionById = useMemo(() => new Map(actions.map((action) => [action.id, action])), [actions]);

  const load = useCallback(async (signal?: AbortSignal) => {
    const actionsPromise = actionId ? Promise.resolve([]) : getActions(caseId, { subCaseId, signal });
    const [documentPage, caseActions] = await Promise.all([getDocuments(context, undefined, signal), actionsPromise]);
    if (signal?.aborted) return;
    setDocuments(documentPage.data);
    setNextCursor(documentPage.meta.nextCursor);
    setActions(caseActions);
  }, [actionId, caseId, context, subCaseId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void load(controller.signal).catch((requestError) => {
      if (!controller.signal.aborted) setError(errorMessage(requestError));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [load]);

  async function more() {
    if (!nextCursor) return;
    try {
      const page = await getDocuments(context, nextCursor);
      setDocuments((current) => [...current, ...page.data]);
      setNextCursor(page.meta.nextCursor);
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    }
  }

  async function download(document: LegalDocument, version: LegalDocument['versions'][number]) {
    try { await downloadDocumentVersion(document.id, version); } catch (requestError) { toast.error(errorMessage(requestError)); }
  }

  if (loading) return <p className="text-stone-500">Cargando documentos…</p>;
  if (error) return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;

  const heading = actionId ? 'Documentos de la actuación' : subCaseId ? 'Documentos del cuaderno' : 'Documentos privados';
  return <div className="space-y-4"><div className="flex items-center justify-between gap-4"><div><h2 className={compact ? 'text-lg font-semibold' : 'text-xl font-semibold'}>{heading}</h2>{compact ? null : <p className="text-sm text-stone-500">PDF versionados; los paths físicos nunca se exponen.</p>}</div>{can('documents.create') && !readOnly ? <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" /> Adjuntar PDF</Button> : null}</div>{documents.length ? <div className="space-y-4">{documents.map((document) => { const linkedAction = document.actionId ? actionById.get(document.actionId) : null; return <Card key={document.id}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{document.title}</CardTitle><p className="mt-1 text-sm text-stone-500">{categories.find((item) => item.value === document.category)?.label ?? document.category}{linkedAction ? ` · Actuación: ${linkedAction.title}` : document.actionId ? ' · Actuación vinculada' : ''}</p></div>{can('documents.version') && !readOnly ? <Button variant="outline" size="sm" onClick={() => setVersionTarget(document)}><FilePlus2 className="h-4 w-4" /> Nueva versión</Button> : null}</div></CardHeader><CardContent className="space-y-2">{document.description ? <p className="text-sm">{document.description}</p> : null}{document.versions.map((version) => <div key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><strong className="text-sm">v{version.versionNumber} · {version.originalName}</strong><p className="text-xs text-stone-500">{size(version.sizeBytes)} · {version.createdBy.name} · SHA-256 {version.sha256.slice(0, 12)}…</p></div><div className="flex items-center gap-2"><Badge variant="outline">{scanLabel[version.scanStatus]}</Badge><Button size="sm" variant="outline" disabled={!['CLEAN', 'SKIPPED'].includes(version.scanStatus)} onClick={() => void download(document, version)}><Download className="h-4 w-4" /> Descargar</Button></div></div>)}</CardContent></Card>; })}</div> : <div className="rounded-xl border bg-white p-8 text-center text-stone-500"><Files className="mx-auto mb-2 h-8 w-8" />Todavía no hay documentos.</div>}{nextCursor ? <Button variant="outline" onClick={() => void more()}>Cargar más</Button> : null}<UploadDialog open={uploadOpen} context={context} actions={actions} progress={progress} onOpenChange={setUploadOpen} onSubmit={async (form) => { setProgress(0); try { await uploadDocument(form, setProgress); await load(); setUploadOpen(false); toast.success('Documento subido.'); } catch (requestError) { toast.error(errorMessage(requestError)); } finally { setProgress(null); } }} /><VersionDialog document={versionTarget} progress={progress} onOpenChange={(open) => { if (!open) setVersionTarget(null); }} onSubmit={async (file) => { if (!versionTarget) return; setProgress(0); try { await uploadDocumentVersion(versionTarget.id, file, setProgress); await load(); setVersionTarget(null); toast.success('Nueva versión creada.'); } catch (requestError) { toast.error(errorMessage(requestError)); } finally { setProgress(null); } }} /></div>;
}

function appendContext(form: FormData, context: DocumentContext) {
  const [key, value] = Object.entries(context)[0];
  form.append(key, value);
}

function UploadDialog({ open, context, actions, progress, onOpenChange, onSubmit }: { open: boolean; context: DocumentContext; actions: CaseAction[]; progress: number | null; onOpenChange(open: boolean): void; onSubmit(form: FormData): Promise<void> }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const source = new FormData(event.currentTarget);
    const file = source.get('file');
    if (!(file instanceof File) || !file.name) return;
    const target = String(source.get('target') ?? 'scope');
    const form = new FormData();
    form.append('title', String(source.get('title')));
    form.append('category', String(source.get('category')));
    const description = String(source.get('description') ?? '').trim();
    if (description) form.append('description', description);
    if (target === 'scope') appendContext(form, context); else form.append('actionId', target);
    form.append('file', file);
    await onSubmit(form);
  }
  const isActionContext = 'actionId' in context;
  const scopeLabel = 'subCaseId' in context ? 'Cuaderno' : 'Expediente principal';
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><form className="space-y-4" onSubmit={submit}><DialogHeader><DialogTitle>Subir documento PDF</DialogTitle><DialogDescription>Máximo 50 MB. El servidor verifica bytes, checksum y tipo real.</DialogDescription></DialogHeader><Label htmlFor="document-title">Título</Label><Input id="document-title" name="title" required /><Label htmlFor="document-category">Categoría</Label><select id="document-category" name="category" className="h-9 w-full rounded-md border px-3">{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{isActionContext ? <div className="rounded-lg border bg-stone-50 p-3 text-sm">El archivo quedará vinculado a esta actuación.</div> : <><Label htmlFor="document-target">Vincular a</Label><select id="document-target" name="target" className="h-9 w-full rounded-md border px-3"><option value="scope">{scopeLabel}</option>{actions.map((action) => <option key={action.id} value={action.id}>Actuación: {action.title}</option>)}</select></>}<Label htmlFor="document-description">Descripción</Label><Input id="document-description" name="description" /><Label htmlFor="document-file">Archivo</Label><Input id="document-file" name="file" type="file" accept="application/pdf,.pdf" required />{progress !== null ? <p role="status" className="text-sm text-stone-600">Subiendo… {progress}%</p> : null}<DialogFooter><Button type="submit" disabled={progress !== null}>Subir</Button></DialogFooter></form></DialogContent></Dialog>;
}

function VersionDialog({ document, progress, onOpenChange, onSubmit }: { document: LegalDocument | null; progress: number | null; onOpenChange(open: boolean): void; onSubmit(file: File): Promise<void> }) {
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const file = new FormData(event.currentTarget).get('file'); if (file instanceof File && file.name) await onSubmit(file); }
  return <Dialog open={Boolean(document)} onOpenChange={onOpenChange}><DialogContent><form className="space-y-4" onSubmit={submit}><DialogHeader><DialogTitle>Nueva versión</DialogTitle><DialogDescription>{document?.title}. La versión anterior se conserva sin cambios.</DialogDescription></DialogHeader><Label htmlFor="version-file">Archivo PDF</Label><Input id="version-file" name="file" type="file" accept="application/pdf,.pdf" required />{progress !== null ? <p role="status" className="text-sm text-stone-600">Subiendo… {progress}%</p> : null}<DialogFooter><Button type="submit" disabled={progress !== null}>Crear versión</Button></DialogFooter></form></DialogContent></Dialog>;
}

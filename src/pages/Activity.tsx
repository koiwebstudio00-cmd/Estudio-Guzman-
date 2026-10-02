import { useEffect, useState, type FormEvent } from 'react';
import { Filter, History, RotateCcw } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ActorAvatar } from '../components/ActorAvatar';
import { getAuditLogs } from '../features/audit/api';
import { auditActionLabel, auditEntityLabel, auditEntityOptions } from '../features/audit/labels';
import type { AuditFilters, AuditJson, AuditLog } from '../features/audit/types';
import { ApiProblem } from '../lib/api';

const dateTime = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
const emptyFilters: AuditFilters = {};
const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo cargar la actividad.';

export const Activity = () => {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [draft, setDraft] = useState<AuditFilters>(emptyFilters);
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void getAuditLogs(filters, undefined, controller.signal)
      .then((page) => {
        setItems(page.data);
        setNextCursor(page.meta.nextCursor);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.from && draft.to && draft.from > draft.to) {
      setError('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    setFilters({ ...draft });
  }

  function resetFilters() {
    setError(null);
    setDraft({});
    setFilters({});
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getAuditLogs(filters, nextCursor);
      setItems((current) => [...current, ...page.data]);
      setNextCursor(page.meta.nextCursor);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-semibold"><History className="h-7 w-7" /> Actividad</h1>
        <p className="mt-1 text-stone-500">Historial completo de movimientos y accesos al sistema.</p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <form className="grid items-end gap-4 md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_auto]" onSubmit={applyFilters}>
            <label className="space-y-1 text-sm font-medium">
              Tipo
              <select
                aria-label="Tipo de actividad"
                className="h-9 w-full rounded-md border bg-white px-3 font-normal"
                value={draft.entityType ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, entityType: event.target.value || undefined }))}
              >
                <option value="">Todos los tipos</option>
                {auditEntityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">
              Desde
              <Input aria-label="Actividad desde" type="date" value={draft.from ?? ''} onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value || undefined }))} />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Hasta
              <Input aria-label="Actividad hasta" type="date" value={draft.to ?? ''} onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value || undefined }))} />
            </label>
            <div className="flex gap-2">
              <Button type="submit"><Filter className="h-4 w-4" /> Aplicar</Button>
              <Button type="button" variant="outline" aria-label="Limpiar filtros" onClick={resetFilters}><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {loading ? <ActivitySkeleton /> : items.length ? (
        <div className="space-y-3">
          {items.map((item) => <div key={item.id} className="contents"><ActivityRow item={item} /></div>)}
          {nextCursor ? <Button type="button" variant="outline" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? 'Cargando…' : 'Cargar más movimientos'}</Button> : null}
        </div>
      ) : <div className="rounded-xl border bg-white p-10 text-center text-stone-500">No hay movimientos para los filtros seleccionados.</div>}
    </div>
  );
};

function ActivityRow({ item }: { item: AuditLog }) {
  const hasDetails = item.before !== null || item.after !== null || item.metadata !== null || item.entityId || item.requestId || item.ipAddress || item.userAgent;
  return (
    <article className="rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <ActorAvatar name={item.actor?.name ?? 'Sistema'} avatarUrl={item.actor?.avatarUrl ?? null} />
          <div className="min-w-0">
            <p><strong>{item.actor?.name ?? 'Sistema'}</strong> {auditActionLabel(item.action)}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{auditEntityLabel(item.entityType)}</Badge>
              {item.actor?.email ? <span className="text-xs text-stone-500">{item.actor.email}</span> : null}
            </div>
          </div>
        </div>
        <time className="shrink-0 text-sm text-stone-500" dateTime={item.createdAt}>{dateTime.format(new Date(item.createdAt))}</time>
      </div>
      {hasDetails ? (
        <details className="mt-3 border-t pt-3 text-sm">
          <summary className="cursor-pointer select-none text-stone-600">Ver detalles técnicos</summary>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {item.entityId ? <Detail label="Entidad" value={`${item.entityType} · ${item.entityId}`} /> : null}
            {item.requestId ? <Detail label="Solicitud" value={item.requestId} /> : null}
            {item.ipAddress ? <Detail label="Dirección IP" value={item.ipAddress} /> : null}
            {item.userAgent ? <Detail label="Navegador" value={item.userAgent} /> : null}
            {item.before !== null ? <JsonDetail label="Antes" value={item.before} /> : null}
            {item.after !== null ? <JsonDetail label="Después" value={item.after} /> : null}
            {item.metadata !== null ? <JsonDetail label="Metadatos" value={item.metadata} /> : null}
          </dl>
        </details>
      ) : null}
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-medium uppercase text-stone-400">{label}</dt><dd className="break-all text-stone-700">{value}</dd></div>;
}

function JsonDetail({ label, value }: { label: string; value: AuditJson }) {
  return <div className="min-w-0 sm:col-span-2"><dt className="text-xs font-medium uppercase text-stone-400">{label}</dt><dd><pre className="mt-1 overflow-x-auto rounded-md bg-stone-50 p-3 text-xs text-stone-700">{JSON.stringify(value, null, 2)}</pre></dd></div>;
}

function ActivitySkeleton() {
  return <div aria-label="Cargando actividad" className="animate-pulse space-y-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-24 rounded-xl bg-stone-200" />)}</div>;
}

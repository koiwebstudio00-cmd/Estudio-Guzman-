import { useEffect, useState, type FormEvent } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { createFeedback, getFeedback, updateFeedback, type Feedback as FeedbackItem } from '../features/feedback/api';

const labels = { OPEN: 'Abierta', IN_REVIEW: 'En revisión', RESOLVED: 'Resuelta', REJECTED: 'Rechazada' } as const;

export const Feedback = () => {
  const { can } = useAuth();
  const canCreate = can('feedback.create');
  const canManage = can('feedback.manage');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(canManage);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canManage) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    void getFeedback(status)
      .then((data) => { if (active) setItems(data); })
      .catch(() => toast.error('No se pudieron cargar las sugerencias.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManage, status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = message.trim();
    if (value.length < 5) return;
    setSubmitting(true);
    try {
      const saved = await createFeedback(value);
      if (canManage) setItems((current) => [saved, ...current]);
      setMessage('');
      setFormOpen(false);
      toast.success('Sugerencia enviada correctamente.');
    } catch {
      toast.error('No se pudo enviar la sugerencia.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resolve(item: FeedbackItem, next: 'RESOLVED' | 'REJECTED') {
    const resolution = window.prompt(next === 'RESOLVED' ? 'Resolución aplicada:' : 'Motivo del rechazo:')?.trim();
    if (!resolution) return;
    try {
      const saved = await updateFeedback(item.id, { status: next, resolution });
      setItems((current) => current.map((value) => value.id === saved.id ? saved : value));
    } catch {
      toast.error('No se pudo actualizar la sugerencia.');
    }
  }

  return <div className="space-y-6">
    <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="text-3xl font-semibold">Sugerencias</h1><p className="text-stone-500">Compartí mejoras para la plataforma y seguí su resolución.</p></div>
      {canCreate ? <Button onClick={() => setFormOpen(true)}><MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Sugerir mejora</Button> : null}
    </header>
    {canManage ? <>
      <select aria-label="Filtrar sugerencias" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border px-3"><option value="">Todos los estados</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      {loading ? <p className="text-stone-500">Cargando sugerencias…</p> : items.length ? <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-xl border bg-white p-4"><div className="flex justify-between gap-3"><div><strong>{item.submittedBy?.name ?? 'Usuario eliminado'}</strong><p className="mt-2 whitespace-pre-wrap">{item.message}</p>{item.resolution ? <p className="mt-3 rounded bg-stone-50 p-2 text-sm">Resolución: {item.resolution}</p> : null}</div><span className="text-sm text-stone-500">{labels[item.status]}</span></div>{!['RESOLVED', 'REJECTED'].includes(item.status) ? <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => void resolve(item, 'RESOLVED')}>Resolver</Button><Button size="sm" variant="outline" onClick={() => void resolve(item, 'REJECTED')}>Rechazar</Button></div> : null}</article>)}</div> : <p className="rounded-xl border bg-white p-8 text-center text-stone-500">No hay sugerencias para este filtro.</p>}
    </> : <div className="rounded-xl border bg-white p-8 text-center"><MessageSquarePlus className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" /><p className="mt-3 font-medium">¿Tenés una idea para mejorar la plataforma?</p><p className="mt-1 text-sm text-stone-500">Enviála desde acá para que el equipo pueda evaluarla.</p>{canCreate ? <Button className="mt-4" onClick={() => setFormOpen(true)}>Sugerir mejora</Button> : null}</div>}
    <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent><form onSubmit={submit}><DialogHeader><DialogTitle>Sugerir mejora</DialogTitle><DialogDescription>Contanos qué funcionalidad te gustaría agregar o qué problema encontraste.</DialogDescription></DialogHeader><div className="py-4"><Textarea aria-label="Sugerencia" placeholder="Escribí tu sugerencia…" className="min-h-28" value={message} onChange={(event) => setMessage(event.target.value)} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit" disabled={submitting || message.trim().length < 5}>{submitting ? 'Enviando…' : 'Enviar sugerencia'}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
};

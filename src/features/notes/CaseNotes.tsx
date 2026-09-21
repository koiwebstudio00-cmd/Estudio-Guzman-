import { useEffect, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { ApiProblem } from '../../lib/api';
import { createNote, getNotes } from './api';
import type { Note } from './types';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo completar la operación.';
export function CaseNotes({ caseId, readOnly }: { caseId: string; readOnly: boolean }) {
  const { can } = useAuth(); const [notes, setNotes] = useState<Note[]>([]); const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { let active = true; setLoading(true); void getNotes({ caseId }).then((page) => { if (active) setNotes(page.data); }).catch((error) => { if (active) toast.error(errorMessage(error)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [caseId]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const content = String(new FormData(form).get('content') ?? '').trim(); if (!content) return; setSubmitting(true); try { const value = await createNote({ caseId, content }); setNotes((current) => [value, ...current]); form.reset(); toast.success('Nota agregada.'); } catch (error) { toast.error(errorMessage(error)); } finally { setSubmitting(false); } }
  return <div className="space-y-4">{can('notes.create') && !readOnly ? <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-4"><label htmlFor="case-note" className="text-sm font-medium">Nueva nota interna</label><Textarea id="case-note" name="content" required placeholder="Escribí una observación para el equipo…" /><Button type="submit" disabled={submitting}><Plus className="h-4 w-4" /> Agregar nota</Button></form> : null}{loading ? <p className="text-stone-500">Cargando notas…</p> : notes.length ? <div className="space-y-3">{notes.map((note) => <article key={note.id} className="rounded-xl border bg-white p-4"><p className="whitespace-pre-wrap">{note.content}</p><p className="mt-3 text-xs text-stone-500">{note.author.name} · {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(note.createdAt))}</p></article>)}</div> : <div className="rounded-xl border bg-white p-8 text-center text-stone-500">Todavía no hay notas internas.</div>}</div>;
}

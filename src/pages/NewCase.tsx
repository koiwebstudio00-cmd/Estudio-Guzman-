import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { createCase } from '../features/cases/api';
import { CourtCombobox } from '../features/cases/CourtCombobox';
import type { CaseType } from '../features/cases/types';
import { ContactSelector } from '../features/contacts/ContactSelector';
import { getCatalogs } from '../features/contacts/api';
import type { Catalogs } from '../features/contacts/types';
import { getUsers } from '../features/team/api';
import type { TeamUser } from '../features/team/types';
import { ApiProblem } from '../lib/api';

interface ParticipantRow { key: string; contactId: string; role: string; side: string; isClient: boolean }
const newRow = (client = false): ParticipantRow => ({ key: crypto.randomUUID(), contactId: '', role: client ? 'CLAIMANT' : 'DEFENDANT', side: client ? 'OUR_SIDE' : 'COUNTERPART', isClient: client });
const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo crear el expediente.';
const courtOptions = [
  'Juzgado Civil y Comercial Común - I Nominación',
  'Juzgado Civil y Comercial Común - II Nominación',
  'Juzgado Civil y Comercial Común - III Nominación',
  'Juzgado Civil y Comercial Común - IV Nominación',
  'Juzgado Civil y Comercial Común - V Nominación',
  'Juzgado Civil y Comercial Común - VI Nominación',
  'Juzgado Civil y Comercial Común - VII Nominación',
  'Juzgado Civil y Comercial Común - VIII Nominación',
  'Juzgado Civil y Comercial Común - IX Nominación',
  'Juzgado Civil y Comercial Común - X Nominación',
  'Juzgado Civil y Comercial Común - XI Nominación',
  'Juzgado Civil y Comercial Común - XII Nominación',
  'Juzgado Civil y Comercial Común - XIII Nominación',
  'Juzgado Civil y Comercial Común - XIV Nominación',
  'Juzgado Civil y Comercial Común - XV Nominación',
  'Juzgado Civil y Comercial Común - XVI Nominación',
  'Juzgado del Trabajo - I Nominación',
  'Juzgado del Trabajo - II Nominación',
  'Juzgado del Trabajo - III Nominación',
  'Juzgado del Trabajo - IV Nominación',
  'Juzgado del Trabajo - V Nominación',
  'Juzgado del Trabajo - VI Nominación',
  'Juzgado del Trabajo - VII Nominación',
  'Juzgado del Trabajo - VIII Nominación',
  'Juzgado del Trabajo - IX Nominación',
  'Juzgado del Trabajo - X Nominación',
  'Juzgado del Trabajo - XI Nominación',
  'Juzgado del Trabajo - XII Nominación',
  'Juzgado Civil en Familia y Sucesiones - I Nominación',
  'Juzgado Civil en Familia y Sucesiones - II Nominación',
  'Juzgado Civil en Familia y Sucesiones - III Nominación',
  'Juzgado Civil en Familia y Sucesiones - IV Nominación',
  'Juzgado Civil en Familia y Sucesiones - V Nominación',
  'Juzgado Civil en Familia y Sucesiones - VI Nominación',
  'Juzgado Civil en Familia y Sucesiones - VII Nominación',
  'Juzgado Civil en Familia y Sucesiones - VIII Nominación',
  'Juzgado Civil en Familia y Sucesiones - IX Nominación',
  'Juzgado Civil en Familia y Sucesiones - X Nominación',
  'Juzgado Civil en Familia y Sucesiones - XI Nominación',
  'Juzgado Civil en Familia y Sucesiones - XII Nominación',
  'Juzgado Civil en Familia y Sucesiones - XIII Nominación',
  'Juzgado Civil en Documentos y Locaciones - I Nominación',
  'Juzgado Civil en Documentos y Locaciones - II Nominación',
  'Juzgado Civil en Documentos y Locaciones - III Nominación',
  'Juzgado Civil en Documentos y Locaciones - IV Nominación',
  'Juzgado Civil en Documentos y Locaciones - V Nominación',
  'Juzgado Civil en Documentos y Locaciones - VI Nominación',
  'Juzgado Civil en Documentos y Locaciones - VII Nominación',
  'Juzgado Civil en Documentos y Locaciones - VIII Nominación',
  'Juzgado Civil en Documentos y Locaciones - IX Nominación',
  'Juzgado Civil en Cobros y Apremios - I Nominación',
  'Juzgado Civil en Cobros y Apremios - II Nominación',
] as const;
const managementOfficeOptions = ['1', '2', '3', '4', '5'] as const;

export const NewCase = () => {
  const navigate = useNavigate(); const { user } = useAuth();
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null); const [users, setUsers] = useState<TeamUser[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>(() => [newRow(true), newRow(false)]); const [responsibleId, setResponsibleId] = useState(user?.id ?? ''); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { let active = true; void Promise.all([getCatalogs(), getUsers()]).then(([nextCatalogs, nextUsers]) => { if (!active) return; setCatalogs(nextCatalogs); setUsers(nextUsers.filter((item) => item.status === 'ACTIVE')); setResponsibleId((current) => current || user?.id || nextUsers[0]?.id || ''); }).catch((error) => toast.error(errorMessage(error))); return () => { active = false; }; }, [user?.id]);
  const updateParticipant = (key: string, patch: Partial<ParticipantRow>) => setParticipants((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const valid = participants.filter((item) => item.contactId); if (!valid.some((item) => item.isClient)) { toast.error('Debe existir al menos una parte cliente.'); return; } if (!responsibleId) { toast.error('Seleccioná un responsable principal.'); return; } setSubmitting(true); try { const courtName = String(form.get('courtName') ?? '').trim(); const managementOfficeName = String(form.get('managementOfficeName') ?? '').trim(); const created = await createCase({ caseNumber: String(form.get('caseNumber')), title: String(form.get('title')), type: String(form.get('type')) as CaseType, status: String(form.get('status')) as 'PENDING' | 'ACTIVE', startDate: String(form.get('startDate')), courtName: courtName || null, managementOfficeName: managementOfficeName || null, participants: valid.map(({ contactId, role, side, isClient }, index) => ({ contactId, role, side, isClient, sortOrder: index })), representations: [], team: [{ userId: responsibleId, role: 'PRIMARY' }] }); toast.success('Juicio creado.'); navigate(`/juicios/${created.id}`); } catch (error) { toast.error(errorMessage(error)); } finally { setSubmitting(false); } }
  return <div className="mx-auto max-w-4xl space-y-6 pb-12"><Button variant="ghost" onClick={() => navigate('/juicios')}><ArrowLeft className="h-4 w-4" /> Volver a juicios</Button><div><h1 className="text-3xl font-semibold">Nuevo juicio</h1><p className="text-stone-500">Alta atómica del expediente, sus partes y equipo.</p></div>
    <form onSubmit={submit} className="space-y-6"><Card><CardHeader><CardTitle>Expediente</CardTitle><CardDescription>Carátula, número y estado inicial.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="case-title">Carátula</Label><Input id="case-title" name="title" required /></div><div><Label htmlFor="case-number">Número</Label><Input id="case-number" name="caseNumber" required /></div><div><Label htmlFor="case-type">Fuero</Label><select id="case-type" name="type" className="mt-1 h-9 w-full rounded-md border bg-white px-3">{catalogs?.caseTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div><Label htmlFor="case-status">Estado inicial</Label><select id="case-status" name="status" className="mt-1 h-9 w-full rounded-md border bg-white px-3"><option value="ACTIVE">Activo</option><option value="PENDING">Pendiente</option></select></div><div><Label htmlFor="case-start">Fecha de inicio</Label><Input id="case-start" name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></div></CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle>Partes</CardTitle><CardDescription>Se admiten múltiples partes y clientes representados.</CardDescription></div><Button type="button" variant="outline" size="sm" onClick={() => setParticipants((current) => [...current, newRow()])}><Plus className="h-4 w-4" /> Agregar</Button></CardHeader><CardContent className="space-y-4">{participants.map((item, index) => <div key={item.key} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_1fr_1fr_auto]"><ContactSelector label={`Parte ${index + 1}`} value={item.contactId} onChange={(contactId) => updateParticipant(item.key, { contactId })} required={index === 0} /><div><Label>Rol</Label><select aria-label={`Rol parte ${index + 1}`} className="mt-1 h-9 w-full rounded-md border bg-white px-2" value={item.role} onChange={(event) => updateParticipant(item.key, { role: event.target.value })}>{catalogs?.participantRoles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div><Label>Lado</Label><select aria-label={`Lado parte ${index + 1}`} className="mt-1 h-9 w-full rounded-md border bg-white px-2" value={item.side} onChange={(event) => updateParticipant(item.key, { side: event.target.value })}>{catalogs?.partySides.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><label className="mt-2 flex gap-2 text-sm"><input type="checkbox" checked={item.isClient} onChange={(event) => updateParticipant(item.key, { isClient: event.target.checked })} /> Es cliente</label></div><Button aria-label={`Quitar parte ${index + 1}`} type="button" variant="ghost" size="icon" disabled={participants.length === 1} onClick={() => setParticipants((current) => current.filter(({ key }) => key !== item.key))}><Trash2 className="h-4 w-4" /></Button></div>)}</CardContent></Card>
      <Card><CardHeader><CardTitle>Radicación y equipo</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><div><Label htmlFor="court-name">Juzgado</Label><CourtCombobox id="court-name" name="courtName" options={courtOptions} placeholder="Buscar juzgado…" maxLength={240} /></div><div><Label htmlFor="office-name">OFICINA DE GESTION ASOCIADA</Label><select id="office-name" name="managementOfficeName" className="mt-1 h-9 w-full rounded-md border bg-white px-3"><option value="">Seleccionar…</option>{managementOfficeOptions.map((office) => <option key={office} value={office}>{office}</option>)}</select></div><div><Label htmlFor="responsible">Responsable principal</Label><select id="responsible" className="mt-1 h-9 w-full rounded-md border bg-white px-2" value={responsibleId} onChange={(event) => setResponsibleId(event.target.value)} required><option value="">Seleccionar…</option>{users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></CardContent></Card>
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => navigate('/juicios')}>Cancelar</Button><Button type="submit" disabled={submitting}>{submitting ? 'Creando…' : 'Crear juicio'}</Button></div>
    </form></div>;
};

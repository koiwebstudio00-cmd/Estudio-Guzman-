import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Filter, Mail, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { createContact, createContactChannel, deleteContact, deleteContactChannel, getCatalogs, getContact, getContacts, updateContact, updateContactChannel } from '../features/contacts/api';
import type { Catalogs, Contact, ContactCategory, ContactInput, ContactKind } from '../features/contacts/types';
import { ApiProblem } from '../lib/api';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo completar la operación.';

export const Contacts = () => {
  const { can } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);

  async function load(reset = true) {
    setLoading(true); setError(null);
    try {
      const [page, nextCatalogs] = await Promise.all([
        getContacts({ q: query || undefined, kind: kind || undefined, category: category || undefined, cursor: reset ? undefined : nextCursor ?? undefined, limit: 25 }),
        catalogs ? Promise.resolve(catalogs) : getCatalogs()
      ]);
      setContacts((current) => reset ? page.data : [...current, ...page.data]);
      setNextCursor(page.meta.nextCursor); setCatalogs(nextCatalogs);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(true); }, 250);
    return () => window.clearTimeout(timer);
  // Filters deliberately trigger a fresh server query; catalogs are cached after the first response.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, kind, category]);

  const categoryLabels = useMemo(() => new Map(catalogs?.contactCategories.map((option) => [option.value, option.label]) ?? []), [catalogs]);

  async function openDetail(contactId: string) {
    try { setSelected(await getContact(contactId)); } catch (requestError) { toast.error(errorMessage(requestError)); }
  }

  async function remove(contact: Contact) {
    if (!window.confirm(`¿Dar de baja a ${contact.displayName}?`)) return;
    try { await deleteContact(contact.id); setContacts((current) => current.filter(({ id }) => id !== contact.id)); setSelected(null); toast.success('Contacto dado de baja.'); }
    catch (requestError) { toast.error(errorMessage(requestError)); }
  }

  return <div className="flex h-full flex-col space-y-6">
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="text-3xl font-semibold tracking-tight">Contactos</h1><p className="text-stone-500">Directorio real de personas y organizaciones.</p></div>
      {can('contacts.create') ? <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Nuevo contacto</Button> : null}
    </div>

    <div className="flex flex-col items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row">
      <div className="relative w-full flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Input aria-label="Buscar contactos" placeholder="Buscar por nombre, DNI, CUIT, email o teléfono…" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <Filter className="hidden h-4 w-4 text-stone-400 sm:block" />
      <select aria-label="Tipo de contacto" className="h-9 w-full rounded-md border bg-white px-3 sm:w-48" value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Todos los tipos</option>{catalogs?.contactKinds.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      <select aria-label="Categoría" className="h-9 w-full rounded-md border bg-white px-3 sm:w-48" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas las categorías</option>{catalogs?.contactCategories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    </div>

    {error ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div> : null}
    <div className="flex-1 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <Table><TableHeader className="bg-stone-50"><TableRow><TableHead>Nombre / Razón social</TableHead><TableHead>Categorías</TableHead><TableHead>Identificación</TableHead><TableHead>Contacto</TableHead><TableHead className="text-right">Expedientes</TableHead></TableRow></TableHeader>
        <TableBody>{contacts.map((contact) => <TableRow key={contact.id}>
          <TableCell className="font-medium"><button type="button" className="text-left hover:underline" onClick={() => void openDetail(contact.id)}>{contact.displayName}</button></TableCell>
          <TableCell className="space-x-1">{contact.categories.map((item) => <Badge key={item} variant="secondary" className="font-normal">{categoryLabels.get(item) ?? item}</Badge>)}</TableCell>
          <TableCell className="text-stone-500">{contact.documentNumber ? `DNI ${contact.documentNumber}` : contact.taxId ? `CUIT ${contact.taxId}` : '—'}</TableCell>
          <TableCell><ContactLinks contact={contact} /></TableCell><TableCell className="text-right text-stone-500">{contact.relations.cases}</TableCell>
        </TableRow>)}</TableBody></Table>
      {!loading && contacts.length === 0 ? <p className="p-8 text-center text-stone-500">No se encontraron contactos.</p> : null}
      {loading ? <p className="p-4 text-center text-stone-500">Cargando…</p> : null}
      {!loading && nextCursor ? <div className="border-t p-3 text-center"><Button variant="outline" onClick={() => void load(false)}>Cargar más</Button></div> : null}
    </div>

    {formOpen ? <ContactFormDialog open={formOpen} contact={editing} catalogs={catalogs} onOpenChange={setFormOpen} onSaved={(saved) => { setContacts((current) => current.some(({ id }) => id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); setSelected(saved); }} /> : null}
    <ContactDetailDialog contact={selected} canEdit={can('contacts.update')} canDelete={can('contacts.delete')} categoryLabels={categoryLabels} onOpenChange={(open) => { if (!open) setSelected(null); }} onEdit={() => { setEditing(selected); setFormOpen(true); }} onDelete={() => { if (selected) void remove(selected); }} />
  </div>;
};

function ContactLinks({ contact }: { contact: Contact }) {
  const phone = contact.channels.find(({ type, isPrimary }) => isPrimary && (type === 'PHONE' || type === 'WHATSAPP')) ?? contact.channels.find(({ type }) => type === 'PHONE' || type === 'WHATSAPP');
  const email = contact.channels.find(({ type, isPrimary }) => isPrimary && type === 'EMAIL') ?? contact.channels.find(({ type }) => type === 'EMAIL');
  return <div className="flex items-center gap-3">{phone ? <a href={`tel:${phone.value}`} title={phone.value} aria-label={`Llamar a ${contact.displayName}`}><Phone className="h-4 w-4 text-stone-500" /></a> : null}{email ? <a href={`mailto:${email.value}`} title={email.value} aria-label={`Enviar email a ${contact.displayName}`}><Mail className="h-4 w-4 text-stone-500" /></a> : null}</div>;
}

function ContactFormDialog({ open, contact, catalogs, onOpenChange, onSaved }: { open: boolean; contact: Contact | null; catalogs: Catalogs | null; onOpenChange(open: boolean): void; onSaved(contact: Contact): void }) {
  const [kind, setKind] = useState<ContactKind>(contact?.kind ?? 'PERSON');
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSubmitting(true);
    const categories = form.getAll('categories').map(String) as ContactCategory[];
    const empty = (name: string) => String(form.get(name) ?? '').trim() || null;
    const phone = empty('phone');
    const input: ContactInput = { kind, firstName: empty('firstName'), lastName: empty('lastName'), legalName: empty('legalName'), documentNumber: empty('documentNumber'), taxId: empty('taxId'), notes: empty('notes'), categories, channels: [] };
    if (!contact) {
      const email = empty('email');
      input.channels = [...(email ? [{ type: 'EMAIL' as const, value: email, isPrimary: true }] : []), ...(phone ? [{ type: 'PHONE' as const, value: phone, isPrimary: true }] : [])];
    }
    try {
      let saved: Contact;
      if (contact) {
        const existingPhone = contact.channels.find((channel) => channel.type === 'PHONE' && channel.isPrimary) ?? contact.channels.find((channel) => channel.type === 'PHONE');
        await updateContact(contact.id, { version: contact.version, firstName: input.firstName, lastName: input.lastName, legalName: input.legalName, documentNumber: input.documentNumber, taxId: input.taxId, notes: input.notes, categories });
        if (existingPhone && phone) await updateContactChannel(contact.id, existingPhone.id, { value: phone, isPrimary: true });
        else if (existingPhone) await deleteContactChannel(contact.id, existingPhone.id);
        else if (phone) await createContactChannel(contact.id, { type: 'PHONE', value: phone, isPrimary: true });
        saved = await getContact(contact.id);
      } else saved = await createContact(input);
      onSaved(saved); onOpenChange(false); toast.success(contact ? 'Contacto actualizado.' : 'Contacto creado.');
    }
    catch (requestError) { toast.error(errorMessage(requestError)); } finally { setSubmitting(false); }
  }
  const selectedCategories = new Set(contact?.categories ?? ['CLIENT']);
  const existingPhone = contact?.channels.find((channel) => channel.type === 'PHONE' && channel.isPrimary) ?? contact?.channels.find((channel) => channel.type === 'PHONE');
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>{contact ? 'Editar contacto' : 'Nuevo contacto'}</DialogTitle><DialogDescription>Los documentos, CUIT y canales se normalizan para evitar duplicados.</DialogDescription></DialogHeader>
    <div><Label htmlFor="contact-kind">Tipo</Label><select id="contact-kind" className="mt-1 h-9 w-full rounded-md border bg-white px-3" value={kind} disabled={Boolean(contact)} onChange={(event) => setKind(event.target.value as ContactKind)}>{catalogs?.contactKinds.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    {kind === 'PERSON' ? <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="first-name">Nombre</Label><Input id="first-name" name="firstName" defaultValue={contact?.firstName ?? ''} required /></div><div><Label htmlFor="last-name">Apellido</Label><Input id="last-name" name="lastName" defaultValue={contact?.lastName ?? ''} /></div></div> : <div><Label htmlFor="legal-name">Razón social</Label><Input id="legal-name" name="legalName" defaultValue={contact?.legalName ?? ''} required /></div>}
    <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="document-number">DNI / documento</Label><Input id="document-number" name="documentNumber" defaultValue={contact?.documentNumber ?? ''} /></div><div><Label htmlFor="tax-id">CUIT</Label><Input id="tax-id" name="taxId" defaultValue={contact?.taxId ?? ''} /></div></div>
    <div className="grid gap-4 sm:grid-cols-2">{!contact ? <div><Label htmlFor="contact-email">Email</Label><Input id="contact-email" name="email" type="email" /></div> : null}<div><Label htmlFor="contact-phone">Teléfono</Label><Input id="contact-phone" name="phone" type="tel" defaultValue={existingPhone?.value ?? ''} /></div></div>
    <fieldset><legend className="mb-2 text-sm font-medium">Categorías</legend><div className="grid gap-2 sm:grid-cols-3">{catalogs?.contactCategories.map((option) => <label key={option.value} className="flex items-center gap-2 rounded border p-2 text-sm"><input type="checkbox" name="categories" value={option.value} defaultChecked={selectedCategories.has(option.value as ContactCategory)} />{option.label}</label>)}</div></fieldset>
    <div><Label htmlFor="contact-notes">Notas</Label><textarea id="contact-notes" name="notes" defaultValue={contact?.notes ?? ''} className="mt-1 min-h-20 w-full rounded-md border p-3" /></div>
    <DialogFooter><Button type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar'}</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

function ContactDetailDialog({ contact, canEdit, canDelete, categoryLabels, onOpenChange, onEdit, onDelete }: { contact: Contact | null; canEdit: boolean; canDelete: boolean; categoryLabels: Map<string, string>; onOpenChange(open: boolean): void; onEdit(): void; onDelete(): void }) {
  return <Dialog open={Boolean(contact)} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{contact?.displayName}</DialogTitle><DialogDescription>{contact?.kind === 'PERSON' ? 'Persona' : 'Organización'} · versión {contact?.version}</DialogDescription></DialogHeader>
    {contact ? <div className="space-y-4"><div className="flex flex-wrap gap-2">{contact.categories.map((item) => <Badge key={item}>{categoryLabels.get(item) ?? item}</Badge>)}</div><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-stone-500">Documento</dt><dd>{contact.documentNumber ?? '—'}</dd></div><div><dt className="text-stone-500">CUIT</dt><dd>{contact.taxId ?? '—'}</dd></div><div><dt className="text-stone-500">Expedientes</dt><dd>{contact.relations.cases}</dd></div><div><dt className="text-stone-500">Representaciones</dt><dd>{contact.relations.representations}</dd></div></dl><div><h3 className="font-medium">Canales</h3>{contact.channels.length ? contact.channels.map((channel) => <p key={channel.id} className="text-sm text-stone-600">{channel.type}: {channel.value}{channel.isPrimary ? ' · principal' : ''}</p>) : <p className="text-sm text-stone-500">Sin canales cargados.</p>}</div>{contact.notes ? <p className="whitespace-pre-wrap text-sm">{contact.notes}</p> : null}</div> : null}
    <DialogFooter>{canDelete ? <Button type="button" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /> Dar de baja</Button> : null}{canEdit ? <Button type="button" onClick={onEdit}><Pencil className="h-4 w-4" /> Editar</Button> : null}</DialogFooter>
  </DialogContent></Dialog>;
}

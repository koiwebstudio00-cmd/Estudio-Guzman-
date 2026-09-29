import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getCatalogs, getContact } from '../features/contacts/api';
import type { Catalogs, Contact } from '../features/contacts/types';
import { ApiProblem } from '../lib/api';

const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudo cargar el contacto.';

export function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    void Promise.all([getContact(id), getCatalogs()])
      .then(([nextContact, nextCatalogs]) => { if (active) { setContact(nextContact); setCatalogs(nextCatalogs); } })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const categoryLabels = useMemo(() => new Map(catalogs?.contactCategories.map((option) => [option.value, option.label]) ?? []), [catalogs]);

  if (loading) return <p className="text-stone-500">Cargando contacto…</p>;
  if (!contact) return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error ?? 'Contacto no encontrado.'}</div>;

  const ContactIcon = contact.kind === 'PERSON' ? UserRound : Building2;
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Volver</Button>
      <header className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-stone-100"><ContactIcon className="h-6 w-6 text-stone-600" aria-hidden="true" /></div>
        <div><h1 className="text-3xl font-semibold tracking-tight">{contact.displayName}</h1><p className="text-stone-500">{contact.kind === 'PERSON' ? 'Persona' : 'Organización'}</p></div>
      </header>

      <div className="flex flex-wrap gap-2">{contact.categories.map((category) => <Badge key={category}>{categoryLabels.get(category) ?? category}</Badge>)}</div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Identificación</CardTitle></CardHeader>
          <CardContent><dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-stone-500">Documento</dt><dd className="font-medium">{contact.documentNumber ?? '—'}</dd></div><div><dt className="text-stone-500">CUIT</dt><dd className="font-medium">{contact.taxId ?? '—'}</dd></div><div><dt className="text-stone-500">Expedientes</dt><dd className="font-medium">{contact.relations.cases}</dd></div><div><dt className="text-stone-500">Representaciones</dt><dd className="font-medium">{contact.relations.representations}</dd></div></dl></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Datos de contacto</CardTitle></CardHeader>
          <CardContent className="space-y-3">{contact.channels.length ? contact.channels.map((channel) => <div key={channel.id} className="flex items-center gap-3 text-sm">{channel.type === 'EMAIL' ? <Mail className="h-4 w-4 text-stone-400" aria-hidden="true" /> : <Phone className="h-4 w-4 text-stone-400" aria-hidden="true" />}<span>{channel.value}</span>{channel.isPrimary ? <Badge variant="secondary">Principal</Badge> : null}</div>) : <p className="text-sm text-stone-500">Sin canales cargados.</p>}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Direcciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">{contact.addresses.length ? contact.addresses.map((address) => <div key={address.id} className="flex items-start gap-3 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" /><span>{[address.line1, address.line2, address.city, address.province, address.postalCode].filter(Boolean).join(', ')}</span></div>) : <p className="text-sm text-stone-500">Sin direcciones cargadas.</p>}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm text-stone-600">{contact.notes ?? 'Sin notas cargadas.'}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

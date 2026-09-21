import { useEffect, useId, useState } from 'react';
import { getContacts } from './api';
import type { Contact } from './types';

export function ContactSelector({ value, onChange, label = 'Contacto', required = false }: { value?: string; onChange(contactId: string): void; label?: string; required?: boolean }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const inputId = useId();

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void getContacts({ q: query || undefined, limit: 25 }).then((page) => { if (active) setContacts(page.data); }).catch(() => { if (active) setContacts([]); }).finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  return <div className="space-y-1">
    <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
    <input id={inputId} className="h-9 w-full rounded-md border px-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contacto…" />
    <select aria-label={label} className="h-9 w-full rounded-md border bg-white px-3" value={value ?? ''} onChange={(event) => onChange(event.target.value)} required={required}>
      <option value="">{loading ? 'Buscando…' : 'Seleccionar…'}</option>
      {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.displayName}</option>)}
    </select>
  </div>;
}

import { useEffect, useState } from 'react';
import { ArrowRight, Filter, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getCatalogs } from '../features/contacts/api';
import type { Catalogs } from '../features/contacts/types';
import { getCases } from '../features/cases/api';
import type { LegalCase } from '../features/cases/types';
import { ApiProblem } from '../lib/api';

const statusClasses: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-800', PENDING: 'bg-amber-100 text-amber-800', SUSPENDED: 'bg-orange-100 text-orange-800', CLOSED: 'bg-stone-200 text-stone-800', ARCHIVED: 'bg-stone-100 text-stone-500' };
const errorMessage = (error: unknown) => error instanceof ApiProblem ? error.message : 'No se pudieron cargar los expedientes.';

export const CasesList = () => {
  const navigate = useNavigate(); const { can } = useAuth();
  const [cases, setCases] = useState<LegalCase[]>([]); const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [query, setQuery] = useState(''); const [status, setStatus] = useState(''); const [type, setType] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  async function load(reset = true) { setLoading(true); setError(null); try { const [page, nextCatalogs] = await Promise.all([getCases({ q: query || undefined, status: status || undefined, type: type || undefined, cursor: reset ? undefined : nextCursor ?? undefined, limit: 25 }), catalogs ? Promise.resolve(catalogs) : getCatalogs()]); setCases((current) => reset ? page.data : [...current, ...page.data]); setNextCursor(page.meta.nextCursor); setCatalogs(nextCatalogs); } catch (requestError) { setError(errorMessage(requestError)); } finally { setLoading(false); } }
  useEffect(() => { const timer = window.setTimeout(() => { void load(true); }, 250); return () => window.clearTimeout(timer); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [query, status, type]);
  const label = (group: keyof Catalogs, value: string) => catalogs?.[group]?.find((item) => item.value === value)?.label ?? value;
  return <div className="flex h-full flex-col space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-semibold">Juicios</h1><p className="text-stone-500">Expedientes, partes y responsables del estudio.</p></div>{can('cases.create') ? <Button onClick={() => navigate('/juicios/nuevo')}><Plus className="h-4 w-4" /> Nuevo juicio</Button> : null}</div>
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-4 sm:flex-row"><div className="relative w-full flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Input aria-label="Buscar expedientes" className="pl-9" placeholder="Carátula o número…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Filter className="hidden h-4 w-4 text-stone-400 sm:block" /><select aria-label="Estado" className="h-9 rounded-md border bg-white px-3" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{catalogs?.caseStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Fuero" className="h-9 rounded-md border bg-white px-3" value={type} onChange={(event) => setType(event.target.value)}><option value="">Todos los fueros</option>{catalogs?.caseTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
    {error ? <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div> : null}
    <div className="flex-1 overflow-hidden rounded-xl border bg-white"><Table><TableHeader><TableRow><TableHead>Expediente</TableHead><TableHead>Carátula</TableHead><TableHead>Clientes</TableHead><TableHead>Juzgado</TableHead><TableHead>Estado</TableHead><TableHead>Responsable</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader><TableBody>{cases.map((legalCase) => <TableRow key={legalCase.id}><TableCell>{legalCase.caseNumber}</TableCell><TableCell className="font-semibold">{legalCase.title}</TableCell><TableCell>{legalCase.participants.filter((item) => item.isClient && !item.activeUntil).map((item) => item.contact.displayName).join(', ') || '—'}</TableCell><TableCell>{legalCase.courtName ?? '—'}</TableCell><TableCell><Badge className={statusClasses[legalCase.status]}>{label('caseStatuses', legalCase.status)}</Badge></TableCell><TableCell>{legalCase.team.find((item) => item.role === 'PRIMARY' && !item.unassignedAt)?.user.name ?? '—'}</TableCell><TableCell className="text-right"><Button aria-label={`Ver juicio ${legalCase.caseNumber}`} variant="outline" size="sm" onClick={() => navigate(`/juicios/${legalCase.id}`)}>Ver juicio <ArrowRight className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody></Table>{loading ? <p className="p-4 text-center text-stone-500">Cargando…</p> : null}{!loading && cases.length === 0 ? <p className="p-8 text-center text-stone-500">No se encontraron expedientes.</p> : null}{!loading && nextCursor ? <div className="border-t p-3 text-center"><Button variant="outline" onClick={() => void load(false)}>Cargar más</Button></div> : null}</div>
  </div>;
};

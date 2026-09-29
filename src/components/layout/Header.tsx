import { useEffect, useState } from 'react';
import { FileText, Menu, Scale, Search, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { globalSearch } from '../../features/dashboard/api';
import type { SearchResult } from '../../features/dashboard/types';
import { NotificationsButton } from '../../features/notifications/NotificationsButton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState(''); const [results, setResults] = useState<SearchResult[]>([]); const [searching, setSearching] = useState(false); const [searchError, setSearchError] = useState(false);

  useEffect(() => { if (query.trim().length < 2) { setResults([]); setSearching(false); setSearchError(false); return; } let active = true; const timer = window.setTimeout(() => { setSearching(true); setSearchError(false); void globalSearch(query).then((items) => { if (active) setResults(items); }).catch(() => { if (active) setSearchError(true); }).finally(() => { if (active) setSearching(false); }); }, 250); return () => { active = false; window.clearTimeout(timer); }; }, [query]);
  const open = (result: SearchResult) => { setQuery(''); setResults([]); navigate(result.path); };

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="md:hidden text-stone-500 hover:text-stone-900">
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input 
            type="search" 
            placeholder="Buscar juicio, expediente, cliente..." 
            className="pl-9 bg-stone-50 border-transparent focus-visible:bg-white w-full rounded-full"
            aria-label="Búsqueda global"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query.trim().length >= 2 ? <div className="absolute top-11 z-50 max-h-96 w-full overflow-y-auto rounded-xl border bg-white p-2 shadow-xl">{searching ? <p className="p-3 text-sm text-stone-500">Buscando…</p> : searchError ? <p role="alert" className="p-3 text-sm text-red-600">La búsqueda no está disponible.</p> : results.length ? results.map((result) => { const Icon = result.type === 'CASE' ? Scale : result.type === 'CONTACT' ? User : FileText; return <button key={`${result.type}:${result.id}`} type="button" className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-stone-50" onClick={() => open(result)}><Icon className="h-4 w-4 shrink-0 text-stone-500" /><span className="min-w-0"><strong className="block truncate text-sm">{result.title}</strong><span className="block truncate text-xs text-stone-500">{result.subtitle}</span></span></button>; }) : <p className="p-3 text-sm text-stone-500">Sin resultados.</p>}</div> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationsButton />
        <Button
          type="button"
          variant="ghost"
          className="h-auto gap-3 px-2 py-1"
          aria-label={`Abrir mi cuenta de ${user?.name ?? 'usuario'}`}
          onClick={() => navigate('/perfil')}
        >
          <Avatar className="h-9 w-9">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block"><span className="block text-sm font-medium text-stone-800">{user?.name}</span><span className="block text-xs font-normal text-stone-500">{user?.role.name}</span></span>
        </Button>
      </div>
    </header>
  );
};

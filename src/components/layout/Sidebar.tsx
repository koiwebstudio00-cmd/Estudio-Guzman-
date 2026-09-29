import type { FC } from 'react';
import { CheckSquare, History, Home, LogOut, MessageSquarePlus, Scale, Users, UserSquare, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export const Sidebar: FC<{ isOpen: boolean; setIsOpen: (value: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { can, logout } = useAuth();

  const navItems = [
    { name: 'Inicio', path: '/', icon: Home, visible: can('dashboard.read') },
    { name: 'Juicios', path: '/juicios', icon: Scale, visible: can('cases.read') },
    { name: 'Tareas', path: '/tareas', icon: CheckSquare, visible: can('tasks.read') },
    { name: 'Contactos', path: '/contactos', icon: Users, visible: can('contacts.read') },
    { name: 'Equipo', path: '/equipo', icon: UserSquare, visible: can('users.read') },
    { name: 'Actividad', path: '/actividad', icon: History, visible: can('audit.read') },
    { name: 'Sugerencias', path: '/sugerencias', icon: MessageSquarePlus, visible: can('feedback.create') || can('feedback.manage') },
  ].filter((item) => item.visible);

  const navClass = ({ isActive }: { isActive: boolean }) => cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-stone-900 text-stone-50' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
  );

  async function handleLogout() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('No se pudo cerrar la sesión correctamente.');
    }
  }

  return (
    <>
      {isOpen ? <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} /> : null}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 ease-in-out md:static', isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="flex h-16 items-center justify-between border-b border-stone-100 px-4 md:px-6">
          <img src="/images/guzman-logo.webp" alt="Estudio Guzmán" className="h-16 object-contain" />
          <button type="button" aria-label="Cerrar menú" className="text-stone-500 md:hidden" onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => <NavLink key={item.path} to={item.path} className={navClass} onClick={() => setIsOpen(false)}><item.icon className="h-5 w-5" aria-hidden="true" />{item.name}</NavLink>)}
        </nav>
        <div className="border-t border-stone-100 p-4">
          <Button type="button" variant="ghost" className="w-full justify-start text-stone-600" onClick={() => void handleLogout()}><LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión</Button>
        </div>
      </aside>
    </>
  );
};

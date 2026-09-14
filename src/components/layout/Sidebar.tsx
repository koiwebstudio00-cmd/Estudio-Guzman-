import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Scale, CheckSquare, Users, UserSquare, MessageSquarePlus, X } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

export const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (val: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const [suggestionOpen, setSuggestionOpen] = React.useState(false);
  const { currentUser } = useAppStore();

  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Juicios', path: '/juicios', icon: Scale },
    { name: 'Tareas', path: '/tareas', icon: CheckSquare },
    { name: 'Contactos', path: '/contactos', icon: Users },
    { name: 'Equipo', path: '/equipo', icon: UserSquare },
  ];

  const handleSuggestionSubmit = () => {
    setSuggestionOpen(false);
    toast.success('Sugerencia enviada correctamente.');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
    isActive ? "bg-stone-900 text-stone-50" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200 flex flex-col transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <img src="/images/guzman-logo.webp" alt="Estudio Guzmán" className="h-16 object-contain" />
          </div>
          <button className="md:hidden text-stone-500" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={navClass} onClick={() => setIsOpen(false)}>
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={() => setSuggestionOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors text-sm font-medium"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Sugerir mejora
          </button>
          
          <div className="mt-4 px-3 flex flex-col gap-1">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Usuario Actual</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium text-stone-700">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-stone-900 leading-none">{currentUser?.name}</span>
                <span className="text-xs text-stone-500 mt-0.5 leading-none">{currentUser?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <Dialog open={suggestionOpen} onOpenChange={setSuggestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugerir mejora</DialogTitle>
            <DialogDescription>
              Coméntanos qué funcionalidad te gustaría agregar o qué problema encontraste en la demo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea placeholder="Escribe tu sugerencia aquí..." className="min-h-[100px]" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuggestionOpen(false)}>Cancelar</Button>
            <Button onClick={handleSuggestionSubmit}>Enviar sugerencia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

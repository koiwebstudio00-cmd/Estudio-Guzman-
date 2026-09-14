import React from 'react';
import { Menu, Search, Settings } from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { users, currentUser, setCurrentUser, resetData } = useAppStore();
  const navigate = useNavigate();

  const handleReset = () => {
    resetData();
    toast.success('Datos de demostración restablecidos.');
    navigate('/');
  };

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
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-stone-400">
            <Settings className="h-5 w-5 text-stone-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Simular Usuario</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {users.map(user => (
              <DropdownMenuItem 
                key={user.id} 
                onClick={() => {
                  setCurrentUser(user);
                  toast.success(`Sesión cambiada a ${user.name}`);
                }}
                className="flex items-center justify-between"
              >
                <span>{user.name} <span className="text-stone-400 text-xs ml-1">({user.role})</span></span>
                {currentUser?.id === user.id && <div className="h-2 w-2 rounded-full bg-green-500" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReset} className="text-red-600 focus:text-red-600 focus:bg-red-50">
              Restablecer datos demo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

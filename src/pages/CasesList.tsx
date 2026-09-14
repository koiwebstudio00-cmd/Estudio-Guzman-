import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const CasesList: React.FC = () => {
  const { cases, contacts, users, courts } = useAppStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const matchesType = typeFilter === 'Todos' || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getClientName = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    return contact ? (contact.firstName + (contact.lastName ? ` ${contact.lastName}` : '')) : 'Desconocido';
  };

  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Sin asignar';
  };

  const getCourtName = (id?: string) => {
    if (!id) return '-';
    const court = courts.find(c => c.id === id);
    return court ? court.name : '-';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Activo': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
      case 'Pendiente': return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100';
      case 'Cerrado': return 'bg-stone-200 text-stone-800 border-stone-300 hover:bg-stone-200';
      case 'Archivado': return 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-100';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Juicios</h1>
          <p className="text-stone-500">Gestión de expedientes y causas activas.</p>
        </div>
        <Button onClick={() => navigate('/juicios/nuevo')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Juicio
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input 
            placeholder="Buscar por carátula o expediente..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-stone-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Cerrado">Cerrado</SelectItem>
              <SelectItem value="Archivado">Archivado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Fuero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los fueros</SelectItem>
              <SelectItem value="Laboral">Laboral</SelectItem>
              <SelectItem value="Civil y Comercial">Civil y Comercial</SelectItem>
              <SelectItem value="Penal">Penal</SelectItem>
              <SelectItem value="Familia">Familia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden flex-1 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="w-[120px]">Expediente</TableHead>
                <TableHead className="min-w-[250px]">Carátula</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Juzgado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Responsable</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-stone-500">
                    No se encontraron juicios que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((c) => (
                  <TableRow key={c.id} className="group cursor-pointer hover:bg-stone-50" onClick={() => navigate(`/juicios/${c.id}`)}>
                    <TableCell className="font-medium text-stone-600">{c.caseNumber}</TableCell>
                    <TableCell className="font-semibold text-stone-900">{c.title}</TableCell>
                    <TableCell>{getClientName(c.clientId)}</TableCell>
                    <TableCell className="hidden md:table-cell text-stone-500 text-sm truncate max-w-[200px]" title={getCourtName(c.courtId)}>
                      {getCourtName(c.courtId)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(c.status)}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-stone-500">
                      {getUserName(c.responsibleId)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="group-hover:bg-stone-200">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

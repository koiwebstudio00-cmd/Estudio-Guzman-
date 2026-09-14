import React, { useState } from 'react';
import { useAppStore } from '../store/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Plus, Filter, Mail, Phone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const Contacts: React.FC = () => {
  const { contacts, cases } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');

  const filteredContacts = contacts.filter(c => {
    const name = `${c.firstName} ${c.lastName || ''}`.toLowerCase();
    const doc = (c.dni || c.cuit || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || doc.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Todos' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getRelatedCasesCount = (contactId: string) => {
    return cases.filter(c => c.clientId === contactId || c.opponentId === contactId).length;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Contactos</h1>
          <p className="text-stone-500">Directorio de clientes, abogados, empresas y más.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Contacto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
          <Input 
            placeholder="Buscar por nombre, DNI o CUIT..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-stone-400" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de contacto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los tipos</SelectItem>
              <SelectItem value="Cliente">Cliente</SelectItem>
              <SelectItem value="Abogado">Abogado</SelectItem>
              <SelectItem value="Empresa">Empresa</SelectItem>
              <SelectItem value="Perito">Perito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden flex-1 shadow-sm">
        <Table>
          <TableHeader className="bg-stone-50">
            <TableRow>
              <TableHead>Nombre / Razón Social</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Juicios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map(c => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-stone-50">
                <TableCell className="font-medium text-stone-900">
                  {c.firstName} {c.lastName}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">{c.type}</Badge>
                </TableCell>
                <TableCell className="text-stone-500">
                  {c.dni ? `DNI ${c.dni}` : c.cuit ? `CUIT ${c.cuit}` : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {c.phone && <a href={`tel:${c.phone}`} className="text-stone-400 hover:text-stone-800" title={c.phone}><Phone className="h-4 w-4" /></a>}
                    {c.email && <a href={`mailto:${c.email}`} className="text-stone-400 hover:text-stone-800" title={c.email}><Mail className="h-4 w-4" /></a>}
                  </div>
                </TableCell>
                <TableCell className="text-right text-stone-500">
                  {getRelatedCasesCount(c.id)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

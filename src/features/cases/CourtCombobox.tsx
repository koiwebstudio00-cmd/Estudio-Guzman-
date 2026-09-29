import { useState } from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { Check, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/input';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
const matchesSearch = (court: string, query: string) => {
  const normalizedCourt = normalize(court);
  return normalize(query).trim().split(/\s+/).filter(Boolean).every((term) => normalizedCourt.includes(term));
};

interface CourtComboboxProps { id: string; name: string; options: readonly string[]; placeholder?: string; maxLength?: number }

export function CourtCombobox({ id, name, options, placeholder, maxLength }: CourtComboboxProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  return <Combobox.Root
    items={options}
    value={selectedValue}
    inputValue={inputValue}
    filter={matchesSearch}
    limit={8}
    autoHighlight
    onInputValueChange={(nextValue, details) => {
      setInputValue(nextValue);
      if (details.reason === 'input-change' || details.reason === 'input-clear') setSelectedValue(null);
    }}
    onValueChange={(nextValue) => { setSelectedValue(nextValue); setInputValue(nextValue ?? ''); }}
  >
    <div className="relative mt-1">
      <Combobox.Input id={id} name={name} render={<Input placeholder={placeholder} maxLength={maxLength} autoComplete="off" className="pr-9" />} />
      <Combobox.Trigger aria-label="Mostrar opciones de radicación" className="group absolute right-0 top-0 flex h-8 w-9 items-center justify-center rounded-r-lg text-stone-500 outline-none hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-stone-400">
        <ChevronDown className="h-4 w-4 transition-transform group-data-[popup-open]:rotate-180" />
      </Combobox.Trigger>
    </div>
    <Combobox.Portal>
      <Combobox.Positioner sideOffset={4} align="start" className="isolate z-50">
        <Combobox.Popup className="z-50 max-h-[min(20rem,var(--available-height))] w-[min(36rem,calc(100vw-2rem))] min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Combobox.Empty className="text-sm text-muted-foreground"><span className="block px-3 py-3">Sin coincidencias. Podés ingresar el texto libremente.</span></Combobox.Empty>
          <Combobox.List className="max-h-[min(20rem,var(--available-height))] overflow-y-auto p-1">
            {(court: string, index: number) => <Combobox.Item key={court} value={court} index={index} className="relative flex cursor-default items-center rounded-md py-2 pr-8 pl-3 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground">
              <span className="leading-snug">{court}</span>
              <Combobox.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center"><Check className="size-4" /></Combobox.ItemIndicator>
            </Combobox.Item>}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>;
}

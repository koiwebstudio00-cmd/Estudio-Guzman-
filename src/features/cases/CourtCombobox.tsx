import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/input';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

interface CourtComboboxProps { id: string; name: string; options: readonly string[]; placeholder?: string; maxLength?: number }

export function CourtCombobox({ id, name, options, placeholder, maxLength }: CourtComboboxProps) {
  const listboxId = useId();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestions = useMemo(() => {
    const terms = normalize(value).trim().split(/\s+/).filter(Boolean);
    return options.filter((option) => terms.every((term) => normalize(option).includes(term))).slice(0, 12);
  }, [options, value]);

  const select = (option: string) => { setValue(option); setOpen(false); setActiveIndex(-1); };
  const show = () => { setOpen(true); setActiveIndex(-1); };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((current) => Math.max(current - 1, 0)); }
    if (event.key === 'Enter' && open && activeIndex >= 0) { event.preventDefault(); select(suggestions[activeIndex]); }
    if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); }
  };

  return <div className="relative mt-1">
    <Input id={id} name={name} value={value} placeholder={placeholder} maxLength={maxLength} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listboxId} aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined} className="pr-9" onFocus={show} onChange={(event) => { setValue(event.target.value); setOpen(true); setActiveIndex(-1); }} onKeyDown={keyDown} onBlur={() => window.setTimeout(() => setOpen(false), 100)} />
    <button type="button" aria-label="Mostrar opciones de radicación" className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-stone-500" onMouseDown={(event) => event.preventDefault()} onClick={() => setOpen((current) => !current)}><ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></button>
    {open ? <div id={listboxId} role="listbox" aria-label="Sugerencias de juzgados" className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-white p-1 shadow-lg">{suggestions.length ? suggestions.map((option, index) => <button id={`${listboxId}-${index}`} type="button" role="option" aria-selected={index === activeIndex} key={option} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${index === activeIndex ? 'bg-stone-100' : 'hover:bg-stone-50'}`} onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActiveIndex(index)} onClick={() => select(option)}>{option}</button>) : <p className="px-3 py-2 text-sm text-stone-500">Sin coincidencias. Podés ingresar el texto libremente.</p>}</div> : null}
  </div>;
}

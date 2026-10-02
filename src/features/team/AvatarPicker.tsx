export const avatarOptions = [
  { label: 'Avatar 1', url: 'https://i.pinimg.com/736x/26/82/78/2682787e9d8241a3164a67748ac505b6.jpg' },
  { label: 'Avatar 2', url: 'https://i.pinimg.com/1200x/ca/f2/65/caf2651168131bf1615a1079dd411c62.jpg' },
  { label: 'Avatar 3', url: 'https://i.pinimg.com/736x/64/f8/37/64f837cd7c77b0e335174410ed3ca6f9.jpg' },
  { label: 'Koi Studio', url: 'https://i.postimg.cc/brBnVNx5/koi-logo.webp' },
] as const;

interface AvatarPickerProps {
  value: string;
  onChange(value: string): void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return <fieldset><legend className="mb-2 text-sm font-medium">Avatar</legend><div className="grid grid-cols-4 gap-3">{avatarOptions.map((option) => { const selected = value === option.url; return <label key={option.url} className={`relative cursor-pointer rounded-xl border-2 p-1 transition-colors ${selected ? 'border-stone-900 ring-2 ring-stone-200' : 'border-stone-200 hover:border-stone-400'}`}><input aria-label={option.label} className="sr-only" type="radio" name="avatarUrl" value={option.url} checked={selected} onChange={() => onChange(option.url)} /><img src={option.url} alt="" className="aspect-square w-full rounded-lg object-cover" />{selected ? <span className="absolute bottom-2 right-2 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium text-white">Elegido</span> : null}</label>; })}</div></fieldset>;
}

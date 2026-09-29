import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../../components/ui/popover';
import { getNotificationPreferences, getNotifications, readAllNotifications, readNotification, saveNotificationPreferences } from './api';
import { notificationsChangedEvent, notifyNotificationsChanged } from './events';
import type { Notification, NotificationPreference } from './types';

const defaults: NotificationPreference = { taskAssigned: true, taskDueSoon: true, taskOverdue: true, caseStatusChanged: true, emailEnabled: false, dueSoonLeadDays: 1 };
const formatDate = (value: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export function NotificationsButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [preferences, setPreferences] = useState(defaults);

  const load = useCallback(async () => {
    try {
      const response = await getNotifications({ limit: 7 });
      setItems(response.data);
      setUnread(response.meta.unreadCount);
    } catch { /* the header remains usable */ }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    window.addEventListener(notificationsChangedEvent, load);
    return () => { window.clearInterval(timer); window.removeEventListener(notificationsChangedEvent, load); };
  }, [load]);

  async function mark(item: Notification) {
    if (item.readAt) return;
    await readNotification(item.id);
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, readAt: new Date().toISOString() } : value));
    setUnread((value) => Math.max(0, value - 1));
    notifyNotificationsChanged();
  }

  async function all() {
    await readAllNotifications();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    setUnread(0);
    notifyNotificationsChanged();
  }

  async function openSettings() {
    try {
      setPreferences(await getNotificationPreferences());
      setOpen(false);
      setSettings(true);
    } catch { toast.error('No se pudieron cargar las preferencias.'); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      setPreferences(await saveNotificationPreferences({ taskAssigned: data.has('taskAssigned'), taskDueSoon: data.has('taskDueSoon'), taskOverdue: data.has('taskOverdue'), caseStatusChanged: data.has('caseStatusChanged'), dueSoonLeadDays: Number(data.get('dueSoonLeadDays')) }));
      setSettings(false);
      toast.success('Preferencias guardadas.');
    } catch { toast.error('No se pudieron guardar las preferencias.'); }
  }

  return <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="ghost" size="icon" aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`} className="relative" />}>
        <Bell className="h-5 w-5" />
        {unread ? <span className="absolute right-0 top-0 min-w-4 rounded-full bg-red-600 px-1 text-[10px] text-white">{unread}</span> : null}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(24rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <PopoverTitle className="font-semibold">Notificaciones</PopoverTitle>
          <div className="flex items-center">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Preferencias de notificaciones" onClick={() => void openSettings()}><Settings /></Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Marcar todas como leídas" disabled={!unread} onClick={() => void all()}><CheckCheck /></Button>
          </div>
        </div>
        {items.length ? <div className="max-h-[28rem] overflow-y-auto">{items.map((item) => <button type="button" key={item.id} onClick={() => void mark(item)} className={`relative block w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-stone-50 ${item.readAt ? 'bg-white' : 'bg-stone-50/80'}`}>
          {!item.readAt ? <span className="absolute left-1.5 top-5 h-2 w-2 rounded-full bg-stone-900" aria-label="Sin leer" /> : null}
          <strong className="block text-sm">{item.title}</strong>
          {item.body ? <span className="mt-0.5 block text-sm text-stone-600">{item.body}</span> : null}
          <time className="mt-1 block text-xs text-stone-400">{formatDate(item.createdAt)}</time>
        </button>)}</div> : <p className="px-4 py-8 text-center text-sm text-stone-500">No hay notificaciones.</p>}
        <div className="border-t p-2"><Button type="button" variant="ghost" className="w-full" onClick={() => { setOpen(false); navigate('/notificaciones'); }}>Ver todas</Button></div>
      </PopoverContent>
    </Popover>
    <Dialog open={settings} onOpenChange={setSettings}><DialogContent><form onSubmit={save} className="space-y-4"><DialogHeader><DialogTitle>Preferencias</DialogTitle></DialogHeader>{([['taskAssigned', 'Tareas asignadas'], ['taskDueSoon', 'Próximas a vencer'], ['taskOverdue', 'Tareas vencidas'], ['caseStatusChanged', 'Cambios de expediente']] as const).map(([name, label]) => <label key={name} className="flex gap-2"><input type="checkbox" name={name} defaultChecked={preferences[name]} /> {label}</label>)}<label htmlFor="lead-days">Avisar con días de anticipación</label><Input id="lead-days" name="dueSoonLeadDays" type="number" min="0" max="30" defaultValue={preferences.dueSoonLeadDays} /><DialogFooter><Button type="submit">Guardar</Button></DialogFooter></form></DialogContent></Dialog>
  </>;
}

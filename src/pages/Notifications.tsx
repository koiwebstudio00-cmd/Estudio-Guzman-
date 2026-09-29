import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { getNotifications, readAllNotifications, readNotification } from '../features/notifications/api';
import { notifyNotificationsChanged } from '../features/notifications/events';
import type { Notification } from '../features/notifications/types';

const formatDate = (value: string) => new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNotifications({ limit: 25 });
      setItems(response.data);
      setNextCursor(response.meta.nextCursor);
      setUnreadCount(response.meta.unreadCount);
    } catch { toast.error('No se pudieron cargar las notificaciones.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const response = await getNotifications({ cursor: nextCursor, limit: 25 });
      setItems((current) => [...current, ...response.data]);
      setNextCursor(response.meta.nextCursor);
      setUnreadCount(response.meta.unreadCount);
    } catch { toast.error('No se pudieron cargar más notificaciones.'); }
    finally { setLoadingMore(false); }
  }

  async function mark(item: Notification) {
    if (item.readAt) return;
    try {
      await readNotification(item.id);
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, readAt: new Date().toISOString() } : value));
      setUnreadCount((value) => Math.max(0, value - 1));
      notifyNotificationsChanged();
    } catch { toast.error('No se pudo marcar la notificación como leída.'); }
  }

  async function markAll() {
    try {
      await readAllNotifications();
      const now = new Date().toISOString();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? now })));
      setUnreadCount(0);
      notifyNotificationsChanged();
    } catch { toast.error('No se pudieron marcar las notificaciones.'); }
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold">Notificaciones</h1><p className="text-stone-500">{unreadCount ? `${unreadCount} sin leer` : 'Estás al día.'}</p></div><Button type="button" variant="outline" disabled={!unreadCount} onClick={() => void markAll()}><CheckCheck /> Marcar todas como leídas</Button></div>
    <Card><CardContent className="p-0">{loading ? <p className="p-8 text-center text-stone-500">Cargando…</p> : items.length ? <div>{items.map((item) => <button type="button" key={item.id} onClick={() => void mark(item)} className={`relative block w-full border-b px-6 py-4 text-left transition-colors last:border-b-0 hover:bg-stone-50 ${item.readAt ? 'bg-white' : 'bg-stone-50/80'}`}>
      {!item.readAt ? <span className="absolute left-2.5 top-6 h-2 w-2 rounded-full bg-stone-900" aria-label="Sin leer" /> : null}
      <span className="flex items-start gap-3"><Bell className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" /><span><strong className="block text-sm">{item.title}</strong>{item.body ? <span className="mt-0.5 block text-sm text-stone-600">{item.body}</span> : null}<time className="mt-1 block text-xs text-stone-400">{formatDate(item.createdAt)}</time></span></span>
    </button>)}</div> : <p className="p-10 text-center text-stone-500">No hay notificaciones.</p>}</CardContent></Card>
    {nextCursor ? <div className="flex justify-center"><Button type="button" variant="outline" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? 'Cargando…' : 'Cargar más'}</Button></div> : null}
  </div>;
}

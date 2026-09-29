export const notificationsChangedEvent = 'estudio-guzman:notifications-changed';

export const notifyNotificationsChanged = () => window.dispatchEvent(new Event(notificationsChangedEvent));

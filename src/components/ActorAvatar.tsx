import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ActorAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: 'default' | 'sm';
}

export function ActorAvatar({ name, avatarUrl, size = 'default' }: ActorAvatarProps) {
  return (
    <Avatar size={size} aria-hidden="true">
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

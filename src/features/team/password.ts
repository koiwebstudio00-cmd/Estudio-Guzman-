const CHARACTER_GROUPS = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  'abcdefghijkmnopqrstuvwxyz',
  '23456789',
  '!@#$%&*+-=?'
] as const;

const ALL_CHARACTERS = CHARACTER_GROUPS.join('');

function secureIndex(max: number): number {
  const limit = 256 - (256 % max);
  const value = new Uint8Array(1);
  do crypto.getRandomValues(value); while (value[0]! >= limit);
  return value[0]! % max;
}

function pick(characters: string): string {
  return characters[secureIndex(characters.length)]!;
}

export function generateSecurePassword(length = 20): string {
  if (length < CHARACTER_GROUPS.length) throw new Error('La contraseña generada es demasiado corta.');
  const password = CHARACTER_GROUPS.map(pick);
  while (password.length < length) password.push(pick(ALL_CHARACTERS));
  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureIndex(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex]!, password[index]!];
  }
  return password.join('');
}

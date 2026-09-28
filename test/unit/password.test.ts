import { describe, expect, it } from 'vitest';
import { generateSecurePassword } from '@/features/team/password';

describe('generateSecurePassword', () => {
  it('generates a 20-character password with every required character group', () => {
    const password = generateSecurePassword();
    expect(password).toHaveLength(20);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%&*+\-=?]/);
  });
});

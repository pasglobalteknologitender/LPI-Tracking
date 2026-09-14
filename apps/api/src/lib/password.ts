import { hash } from '@node-rs/argon2';

export const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

export function hashPassword(password: string) {
  return hash(password, ARGON2_OPTIONS);
}

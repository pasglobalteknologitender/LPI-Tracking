import { SignJWT, jwtVerify } from 'jose';
import { config } from '../config.js';

const accessKey = new TextEncoder().encode(config.jwtAccessSecret);

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTtlSeconds}s`)
    .sign(accessKey);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, accessKey);
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Invalid access token subject');
  }

  return {
    sub: payload.sub,
    email: String(payload.email ?? ''),
    role: String(payload.role ?? ''),
  };
}

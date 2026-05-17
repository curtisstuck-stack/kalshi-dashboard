/**
 * Edge-runtime JWT helpers (HS256) for the shared-password gate.
 * No external deps — uses Web Crypto, which is available in the Vercel Edge runtime.
 */

const COOKIE_NAME = "dash_jwt";
const TTL_SECONDS = 12 * 60 * 60; // 12h per HANDOFF §5.4

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const s = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

// Web Crypto wants a BufferSource; TS 6's generic Uint8Array needs a nudge.
function buf(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    buf(enc.encode(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

interface Payload {
  sub: string;
  iat: number;
  exp: number;
}

/** Sign a 12h session token. */
export async function signToken(secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: Payload = { sub: "dashboard", iat: now, exp: now + TTL_SECONDS };
  const head = b64urlEncode(enc.encode(JSON.stringify(header)));
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const signingInput = `${head}.${body}`;
  const key = await hmacKey(secret);
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, buf(enc.encode(signingInput))),
  );
  return `${signingInput}.${b64urlEncode(sig)}`;
}

/** Verify a token's signature and expiry. Returns true only if both pass. */
export async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [head, body, sig] = parts;
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    buf(b64urlDecode(sig)),
    buf(enc.encode(`${head}.${body}`)),
  );
  if (!ok) return false;
  try {
    const payload = JSON.parse(dec.decode(b64urlDecode(body))) as Payload;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Constant-time string compare to avoid leaking the password via timing. */
export function timingSafeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare against a fixed length so length itself isn't a side channel.
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

/** Read the dash_jwt cookie value from a request, or null. */
export function readSessionCookie(req: Request): string | null {
  const raw = req.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE_NAME) return v.join("=");
  }
  return null;
}

/** Validate the request's session cookie against JWT_SECRET. */
export async function validateAuth(
  req: Request,
): Promise<{ ok: boolean }> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return { ok: false };
  const token = readSessionCookie(req);
  if (!token) return { ok: false };
  return { ok: await verifyToken(token, secret) };
}

export function sessionCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${TTL_SECONDS}`,
  ].join("; ");
}

export function clearCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export { COOKIE_NAME };

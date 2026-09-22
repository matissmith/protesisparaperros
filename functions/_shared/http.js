export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

export async function readJson(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) throw new HttpError(415, 'El contenido debe ser JSON.');
  try { return await request.json(); } catch { throw new HttpError(400, 'JSON inválido.'); }
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function errorResponse(error) {
  const status = error instanceof HttpError ? error.status : 500;
  return json({ ok: false, error: status === 500 ? 'Error interno del preview.' : error.message }, status);
}

export function requireDb(env) {
  if (!env.EVALUATOR_DB) throw new HttpError(503, 'La base de datos de preview no está configurada.');
  return env.EVALUATOR_DB;
}

export function cleanText(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function booleanInt(value) { return value === true ? 1 : 0; }

export function timingSafeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

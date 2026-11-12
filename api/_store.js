// Storage: Upstash Redis (added from the Vercel dashboard: Storage → Upstash Redis → connect to project).
// Falls back to memory for local testing only. Memory does NOT work on Vercel.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const mem = globalThis.__paanchMem || (globalThis.__paanchMem = new Map());

function memCmd([c, k, ...a]) {
  c = c.toUpperCase();
  if (c === "GET") return mem.has(k) ? mem.get(k) : null;
  if (c === "SET") { mem.set(k, a[0]); return "OK"; }
  if (c === "DEL") { mem.delete(k); return 1; }
  if (c === "EXPIRE") return 1;
  if (c === "RPUSH") { const l = mem.get(k) || []; l.push(...a); mem.set(k, l); return l.length; }
  if (c === "LRANGE") { const l = mem.get(k) || []; return l.slice(Number(a[0]), Number(a[1]) === -1 ? undefined : Number(a[1]) + 1); }
  if (c === "HSET") { const h = mem.get(k) || {}; h[a[0]] = a[1]; mem.set(k, h); return 1; }
  if (c === "HGETALL") { const h = mem.get(k) || {}; return Object.entries(h).flat(); }
  throw new Error("unsupported " + c);
}

async function cmd(...args) {
  if (!URL_) return memCmd(args.map(String));
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(args.map(String)),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
module.exports = { cmd, kind: URL_ ? "upstash" : "memory" };

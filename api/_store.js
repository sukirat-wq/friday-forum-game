// Storage: Supabase (free plan, no card). Tables are created by supabase.sql.
// Needs two Vercel environment variables: SUPABASE_URL and SUPABASE_SECRET_KEY.
// Without them it falls back to memory, which is for local testing only and does NOT work on Vercel.
// Also accepts the names Vercel's Supabase integration adds, including any custom prefix (e.g. STORAGE_SUPABASE_URL).
function env(...suffixes) {
  for (const s of suffixes) if (process.env[s]) return process.env[s];
  for (const s of suffixes) {
    const k = Object.keys(process.env).find((name) => name.endsWith("_" + s) && process.env[name]);
    if (k) return process.env[k];
  }
  return "";
}
const BASE = env("SUPABASE_URL").replace(/\/+$/, "");
const KEY = env("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
const kind = BASE && KEY ? "supabase" : "memory";

async function rest(method, path, body, prefer) {
  const headers = { apikey: KEY, "Content-Type": "application/json" };
  // Legacy service_role keys are JWTs ("eyJ..."); the newer "sb_secret_..." keys go in apikey only.
  if (KEY.startsWith("eyJ")) headers.Authorization = "Bearer " + KEY;
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(BASE + "/rest/v1/" + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) {
    let msg = text;
    try { msg = JSON.parse(text).message || text; } catch (e) {}
    throw new Error("Supabase " + r.status + ": " + String(msg).slice(0, 200));
  }
  return text ? JSON.parse(text) : null;
}

// ---- memory fallback (local testing) ----
const mem = globalThis.__paanchMem || (globalThis.__paanchMem = { state: null, players: {}, answers: [] });

const store = {
  kind,
  async getState() {
    if (kind === "memory") return mem.state;
    const rows = await rest("GET", "paanch_state?id=eq.1&select=state");
    return rows && rows[0] ? rows[0].state : null;
  },
  async setState(state) {
    if (kind === "memory") { mem.state = state; return; }
    await rest("POST", "paanch_state", { id: 1, state }, "resolution=merge-duplicates,return=minimal");
  },
  async resetPlayersAndAnswers() {
    if (kind === "memory") { mem.players = {}; mem.answers = []; return; }
    await rest("DELETE", "paanch_players?nick=not.is.null", undefined, "return=minimal");
    await rest("DELETE", "paanch_answers?id=gt.0", undefined, "return=minimal");
  },
  async touchPlayer(nick) {
    if (kind === "memory") { mem.players[nick] = Date.now(); return; }
    await rest("POST", "paanch_players", { nick, seen_at: Date.now() }, "resolution=merge-duplicates,return=minimal");
  },
  async addAnswer(a) {
    if (kind === "memory") { mem.answers.push(a); return; }
    await rest("POST", "paanch_answers", a, "return=minimal");
  },
  async listAnswers(k) {
    if (kind === "memory") return mem.answers.filter((a) => a.k === k);
    return rest("GET", "paanch_answers?k=eq." + encodeURIComponent(k) + "&select=nick,n,g,h,t&order=id.asc");
  },
  async listPlayers() {
    if (kind === "memory") return Object.keys(mem.players);
    const rows = await rest("GET", "paanch_players?select=nick&order=seen_at.asc");
    return (rows || []).map((r) => r.nick);
  },
};
module.exports = store;

// One endpoint for the whole game: /api/game?a=state|join|answer|answers|deck
const store = require("./_store");
const DECK = require("./_deck");
const HOST_PIN = process.env.HOST_PIN || "";

const clean = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);

module.exports = async (req, res) => {
  const q = req.query || {};
  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const a = q.a;
  const isHost = !!HOST_PIN && String(q.pin || body.pin || "") === HOST_PIN;
  const ok = (data, cache) => { res.setHeader("Cache-Control", cache || "no-store"); res.status(200).json(data); };
  const no = (code, msg) => { res.setHeader("Cache-Control", "no-store"); res.status(code).json({ error: msg }); };
  try {
    if (a === "state" && req.method === "GET") {
      return ok(await store.getState(), "public, s-maxage=1, stale-while-revalidate=1");
    }
    if (a === "state" && req.method === "POST") {
      if (!isHost) return no(403, "Wrong host PIN");
      if (!body.state || typeof body.state !== "object") return no(400, "No state");
      await store.setState(body.state);
      if (body.reset) await store.resetPlayersAndAnswers();
      return ok({ ok: true });
    }
    if (a === "join" && req.method === "POST") {
      const nick = clean(body.nick, 24);
      if (!nick) return no(400, "Name missing");
      await store.touchPlayer(nick);
      return ok({ ok: true });
    }
    if (a === "answer" && req.method === "POST") {
      const nick = clean(body.nick, 24), k = clean(body.k, 40), g = clean(body.g, 140);
      const n = Number(body.n), h = Number(body.h);
      if (!nick || !k || !g || !(n >= 1 && n <= 2)) return no(400, "Incomplete answer");
      await store.addAnswer({ k, nick, n, g, h: h >= 1 && h <= 5 ? h : null, t: Date.now() });
      await store.touchPlayer(nick);
      return ok({ ok: true });
    }
    if (a === "answers" && req.method === "GET") {
      if (!isHost) return no(403, "Wrong host PIN");
      const [answers, players] = await Promise.all([store.listAnswers(clean(q.k, 40)), store.listPlayers()]);
      return ok({ answers: answers || [], players, store: store.kind });
    }
    if (a === "deck" && req.method === "GET") {
      if (!HOST_PIN) return no(500, "HOST_PIN is not set in Vercel");
      if (!isHost) return no(403, "Wrong host PIN");
      return ok({ deck: DECK, store: store.kind });
    }
    return no(404, "Unknown action");
  } catch (e) {
    return no(500, "Server error: " + e.message);
  }
};

# Paanch Clue on Vercel + Supabase

Both are free and need no card.

## 1. Create the database (Supabase, about 3 minutes)
1. Go to https://supabase.com, sign in with GitHub, and create a **New project** on the Free plan. Any name and region; save the database password somewhere (you won't need it here).
2. When it's ready, open **SQL Editor → New query**, paste the whole of `supabase.sql` from this repo, and click **Run**. It should say "Success. No rows returned".
3. Open **Project Settings → API Keys** (or **Data API**) and copy:
   - the **Project URL**, like `https://abcdxyz.supabase.co`
   - the **secret** key (`sb_secret_...`). On older projects it's called **service_role**. Do not use the publishable/anon key.

## 2. Add the environment variables (Vercel)
In the Vercel project: **Settings → Environment Variables**, add these three for all environments:

| Key | Value |
|---|---|
| `SUPABASE_URL` | the Project URL |
| `SUPABASE_SECRET_KEY` | the secret (or service_role) key |
| `HOST_PIN` | the PIN the host types to run the game |

Then **Deployments → ⋯ → Redeploy**. Variables only take effect after a redeploy.

## 3. Run the game
- Host: open `https://<your-site>/#host` and enter the host PIN. Open a second tab at `https://<your-site>/#screen` and share that tab on the call.
- Players: open `https://<your-site>/`, type their name and play. No login needed.

## Check it works
- `https://<your-site>/api/game?a=deck&pin=0` should say `Wrong host PIN`. If it says `HOST_PIN is not set`, the PIN variable is missing or you haven't redeployed.
- The host page shows "Live · answers checked Xs ago" under the main button. A red warning there means Supabase isn't connected yet; the message says why.
- In Supabase → Table Editor, `paanch_answers` fills up as people answer.

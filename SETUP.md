# Paanch Clue on Vercel

## Deploy (about 5 minutes)
1. Deploy this folder to Vercel. In a Claude session with the Vercel connector, ask it to deploy `paanch-clue`. Alternatively, push the folder to a GitHub repo and import it in Vercel (Add New → Project).
2. In the Vercel project: **Storage → Create → Upstash Redis (free) → Connect to project**. This adds the database keys automatically.
3. **Redeploy** once, so the site picks up the database.

## Run the game
- Host: open `https://<your-site>/#host` and enter the host PIN. Open a second tab at `https://<your-site>/#screen` and share that tab on the call.
- Players: open `https://<your-site>/`, type their name and play. No login needed.
- The host PIN comes from the `HOST_PIN` environment variable in Vercel (Settings → Environment Variables). Set it before deploying; without it, host sign-in is refused. To change it, edit the variable and redeploy.

## Check it works
The host page shows "Live · answers checked Xs ago" under the main button. A red warning there means the database isn't connected yet.

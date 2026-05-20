# Kalshi Dashboard — Ops

## What this repo is

Web dashboard for the Prediction Markets engine. Vite + React SPA at
**https://predict.watch**.

## Where it lives

| Concern | Location |
|---|---|
| Canonical source | GitHub: `curtisstuck-stack/kalshi-dashboard` |
| Local working copy | `~/Documents/Claude/Projects/Prediction Markets/kalshi-dashboard/` |
| Hosting | Vercel project `kalshi-dashboard` (team `curtisstuck-stacks-projects`) |
| Production domain | `predict.watch` |
| Engine that feeds it | `curtisstuck-stack/prediction-market` (the `kalshi-mm` checkout) |

## How it deploys

GitHub-driven via Vercel auto-deploy on push to `main` (verify in Vercel
project settings; if not yet connected, run `vercel git connect` from this
directory).

### Do NOT
- Run `vercel --prod` from this directory while a different project is linked.
  The 2026-05-16 incident published this dashboard's build to `meridianridge.golf`
  because a stale `.vercel/project.json` pointed at the wrong project.
- Touch the Meridian Ridge Vercel project from this repo — they are separate.

## Required environment variables

(Set in Vercel — Production. Refer to `.env.example` for current expectations.)

## Roll back

```bash
vercel ls                              # find a good prior deployment
vercel promote <deployment-url>        # promote it to production
```

## Do NOT

- Confuse this repo with `crypto-dashboard` (the Investing tree). Different
  Vercel project, different domain, different data feed.
- Edit `Prediction Markets/dashboard/` (planning docs only) or
  `Prediction Markets/kalshi-mm/dashboard/` (stale static HTML) — both pending
  archival.

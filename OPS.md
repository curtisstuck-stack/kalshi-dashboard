# Kalshi Dashboard — Ops

> **⚠️ STALE — this repo no longer serves `predict.watch`.** As of the
> 2026-05 monorepo migration, the canonical dashboard source is
> `curtisstuck-stack/Predict_Watch_Crypto` at `apps/web/`, deployed by the
> Vercel project `predictwatch` (same projectId, renamed from
> `kalshi-dashboard`, root dir repointed to `apps/web`). Pushes to this
> repo's `main` no longer reach production. Edit in the monorepo.

## What this repo is

Legacy standalone checkout of the Vite + React SPA at **https://predict.watch**.
Kept for history. Canonical lives in `Predict_Watch_Crypto/apps/web/`.

## Where it lives (current truth)

| Concern | Location |
|---|---|
| Canonical source | GitHub: `curtisstuck-stack/Predict_Watch_Crypto`, `apps/web/` |
| Local working copy | `~/dev/Predict_Watch_Crypto/apps/web/` |
| Hosting | Vercel project `predictwatch` (team `curtisstuck-stacks-projects`) — same projectId as the old `kalshi-dashboard` project, renamed |
| Production domain | `predict.watch` |
| Engine that feeds it | `curtisstuck-stack/prediction-market` (the `kalshi-mm` checkout) |
| This standalone repo | `curtisstuck-stack/kalshi-dashboard` — legacy, not deployed |

## How it deploys

GitHub-driven via Vercel auto-deploy on push to `main` **of the monorepo**
(`Predict_Watch_Crypto`). The `predictwatch` Vercel project's root dir is
`apps/web`, so changes outside that subtree don't trigger redeploys.

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

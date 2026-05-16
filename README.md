# Kalshi Dashboard

Private, read-only operator console for the Kalshi market-maker bot and its research engine.
**It never places orders.**

Design docs (the contract): `../dashboard/PLAN.md` (why) and `../dashboard/HANDOFF.md` (how).

## Stack

React 19 + TypeScript + Vite + Tailwind + shadcn/ui + Recharts, deployed on Vercel.
Edge Functions under `api/` proxy a private GitHub data repo; a shared-password JWT gate
(`middleware.ts`) protects every route.

> Version note: HANDOFF §1 locks React 18 / Vite 5 / react-router 6. The
> `web-artifacts-builder` scaffold ships React 19 / Vite 8 / react-router 7; we kept the
> newer versions (approved deviation, 2026-05-16). react-query v5 and TanStack Table v8
> match the spec.

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # vitest
pnpm build        # tsc -b && vite build
pnpm gen:types    # regenerate src/types from contracts/
```

`vercel dev` (run on a real machine, not the sandbox) is needed to exercise the
`api/` edge functions and the auth middleware locally.

## Data flow

The droplet commits JSON snapshots to the private `kalshi-dashboard-data` repo.
`api/data/*` edge functions fetch those files via the **GitHub Contents API**
(`api.github.com/repos/{owner}/{repo}/contents/{path}` with `Accept: application/vnd.github.raw`)
— a documented deviation from HANDOFF §5.3, which specified `raw.githubusercontent.com`
(bearer tokens do not work on raw for private repos). Responses are edge-cached 60s.

## Data contracts

`contracts/*.schema.json` is the single source of truth for every data shape.
`pnpm gen:types` compiles them into `src/types/index.ts` — never hand-edit that file.
To change a schema: edit the contract, run `pnpm gen:types`, and update the droplet
pusher's validation in the same change.

## Environment variables

See `.env.example`. Set real values in Vercel → Settings → Environment Variables:
`SITE_PASSWORD`, `JWT_SECRET`, `GITHUB_TOKEN_DASHBOARD_DATA`.

## Adding a new data source

1. Add a `contracts/<name>.schema.json`.
2. Run `pnpm gen:types`.
3. Add an `api/data/<route>.ts` edge function.
4. Add a `src/hooks/use<Name>.ts` React Query hook.
5. Teach the droplet pusher to write + validate the new file.

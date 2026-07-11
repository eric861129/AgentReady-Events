# Deployment candidate and author decision

The reviewed artifact is vendor-neutral: build the Vite client and bundled Express server, bind `0.0.0.0:$PORT`, keep API and UI same-origin, and expose `/health/live`. `npm run smoke:deployment` verifies the exact production entry point locally. The container uses Node 22 because the repository engine requirement is Node 22.12 or newer.

## Current host comparison (checked 2026-07-12)

| Host | Small single service | Docker / secrets / HTTPS | Fit |
| --- | --- | --- | --- |
| Render | Free is $0/month; Starter is $7/month for 512 MB / 0.5 CPU | Git or prebuilt Docker; dashboard environment variables and secrets; managed TLS and `onrender.com` URL | Simplest author-operated demo; free tier limitations must be accepted |
| Fly.io | Usage based; Tokyo shared-cpu-1x 256 MB is listed at about $2.02/month before transfer, with card required | `fly deploy` builds a Dockerfile; encrypted app secrets; Fly Proxy terminates TLS | More deployment control, but more operational choices |

Official references: https://render.com/pricing, https://render.com/docs/web-services, https://fly.io/docs/about/pricing/, https://fly.io/docs/launch/deploy/, and https://fly.io/docs/apps/secrets/.

## Boundary

No public service has been created. The author must choose a host, accept billing/free-tier behavior, authorize account access and provide the resulting HTTPS URL. Until then evidence must say `local-production-candidate`, never “deployed production.”

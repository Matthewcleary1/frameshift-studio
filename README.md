# FRAME/SHIFT — hybrid production agency

Next.js App Router, TypeScript, Supabase and Vercel. FRAME/SHIFT is a provisional agency name. The portfolio visuals are original AI-generated concept studies, visibly labelled in the interface. They are not actual client commissions, testimonials or endorsements.

## Live status

- Website: https://frameshift-studio.vercel.app
- GitHub: https://github.com/Matthewcleary1/frameshift-studio
- Supabase project: `frameshift-studio` (`mcwblzbttlionsuwvxbb`), Paris / `eu-west-3`
- Production application deployment: Vercel deployment `dpl_81SACdtmJ8XFrD38sGnBWGB3Zms5`
- Validated application source commit: `238f6c8c69117c9c55fae72c1b6e9956286c0c51`

The application, portfolio database, storage assets and enquiry backend are live. The canonical homepage, project page and project brief page have been smoke-tested in production and return 200 responses. The production build passes TypeScript and Vercel reports no runtime-error clusters after deployment.

Search engine indexing remains intentionally disabled while the brand and launch content are provisional.

## What is implemented

- Responsive agency homepage with original cinematic concept imagery, production approaches, process and FAQs.
- Portfolio filters and individually addressable concept pages.
- Three-stage project brief with Zod validation, retained form state, accessible errors, a honeypot and idempotent request IDs.
- Dedicated Supabase Postgres database for portfolio content and private enquiries.
- Public Supabase Storage bucket for the three WebP portfolio assets.
- Supabase Edge Function for enquiry validation and submission.
- Service-only PostgreSQL RPC for atomic enquiry insertion, idempotent retries and shared rate limiting.
- Database constraints, explicit grants and RLS on every application table.
- Reduced-motion support, keyboard navigation, local font assets, metadata and custom error/404 pages.
- Security headers including `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and a restrictive `Permissions-Policy`.

## Architecture

### Portfolio

`agency_projects` stores portfolio metadata. Visitors using the public Supabase role can select rows only when `published = true`; drafts remain hidden by RLS.

The three current concept images live in the public `portfolio` Storage bucket. Next.js reads the published project rows from Supabase and optimizes the corresponding Storage images through `next/image`.

### Enquiries

The browser submits project briefs directly to the `submit-enquiry` Supabase Edge Function. Only public Supabase credentials are sent to the browser; no service-role credential is stored in or exposed by Vercel.

The Edge Function:

1. Restricts browser origins to FRAME/SHIFT production, FRAME/SHIFT Vercel previews and local development.
2. Handles CORS preflight explicitly.
3. Limits request size and validates every field again at the edge.
4. Rejects the honeypot field when populated.
5. Hashes the client IP before storage.
6. Calls the service-only `agency_submit_enquiry` PostgreSQL function using Supabase's internal service credential.

`agency_submit_enquiry` uses advisory transaction locks so retries are idempotent and concurrent requests cannot bypass the shared rate limits. Limits are currently 3 accepted submissions per email address per hour and 10 per hashed IP per hour.

### Database access

Verified permission matrix:

- `anon` / `authenticated`: may select published `agency_projects` only.
- `anon` / `authenticated`: cannot select or insert `agency_enquiries`.
- `anon` / `authenticated`: cannot execute `agency_submit_enquiry`.
- `service_role`: may execute `agency_submit_enquiry`.

The Supabase security advisor reports the absence of a public policy on `agency_enquiries` as informational; that is deliberate because the table is intended to have no public row access. The rate-limit indexes may initially appear as unused on a new database but are required by the submission checks.

## Database setup

The reviewed schema is source-controlled as:

- `supabase/schema.sql`
- `supabase/migrations/20260909214600_agency_schema.sql`

The versioned migration has been applied to the live FRAME/SHIFT Supabase project and `supabase/seed.sql` has been run. The seed currently publishes three labelled concept studies:

- `beyond-the-road`
- `a-different-current`
- `a-new-nature`

`node --experimental-strip-types scripts/generate-seed.mjs` can regenerate the seed from `lib/projects.ts`.

### Main database objects

`agency_projects`: published/unpublished portfolio entries. Only published rows are readable by visitors.

`agency_enquiries`: private incoming project briefs. Status values are `new`, `reviewing`, `contacted`, `closed`. There is no public admin account or web inbox in this scope.

`agency_submit_enquiry`: service-role-only RPC using `SECURITY INVOKER`, an empty search path, explicit grants, idempotency and shared rate limits.

## Verification completed

The live backend has been tested end to end with a clearly marked synthetic enquiry:

- CORS preflight returned 204 with the production origin allowed.
- Submission returned 201 and a valid `FS-...` reference.
- The expected row was verified in `agency_enquiries` exactly once.
- The marked test row was then deleted.
- A separate transaction-only RPC smoke test was rolled back after returning a valid reference.
- Portfolio Storage assets were checked against the source WebP byte sizes after import.
- Supabase grants/RLS were queried directly to verify the permission matrix above.
- Vercel production build, TypeScript, route generation and canonical URL smoke tests passed.

Temporary import/test endpoints used during provisioning have been disabled after verification.

## Local setup

Requires Node 24. Dependencies are pinned and `package-lock.json` is committed.

```sh
npm ci
npm run build
npm test
```

For local development:

```sh
cp .env.example .env.local
npm run dev
```

The production app has safe public fallbacks for the Supabase URL and public keys. The environment variables below are therefore optional overrides rather than secrets:

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical full origin for local/config use |
| `SUPABASE_URL` | Supabase project URL override |
| `SUPABASE_PUBLISHABLE_KEY` | Public Data API key override |
| `SUPABASE_EDGE_AUTH_KEY` | Public legacy anon JWT used to authenticate Edge Function requests |

Do not add a Supabase service-role/secret key to browser code or a `NEXT_PUBLIC_*` variable. The privileged credential used by the enquiry workflow remains inside Supabase's Edge Function environment.

## GitHub and Vercel

The source repository is `Matthewcleary1/frameshift-studio`. The existing Vercel project is `frameshift-studio` and production is hosted at `frameshift-studio.vercel.app`.

Native Vercel Git integration is not yet connected. The validated production release was deployed to the existing Vercel project from an immutable GitHub commit archive, so the running application code is tied to commit `238f6c8c69117c9c55fae72c1b6e9956286c0c51`. This README update is documentation-only and does not alter the deployed application.

For normal future continuous deployment, connect this GitHub repository to the existing Vercel project and use `main` as the production branch. Until then, a GitHub push alone should not be assumed to update production.

## Before public launch

The technical submission path is live, but the site remains deliberately `noindex, nofollow`. Before treating it as the final public agency launch, confirm the final brand name, company/contact/privacy details and portfolio content, then enable indexing. Real commissioned work can replace or supplement the clearly labelled concept studies when available.

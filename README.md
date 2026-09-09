# FRAME/SHIFT — hybrid production agency

Next.js App Router, TypeScript, Supabase and Vercel. FRAME/SHIFT is a provisional agency name. The three portfolio visuals are original AI-generated concept studies, visibly labelled in the interface. They are not actual client commissions, testimonials or endorsements.

## What is implemented

- Responsive agency homepage with original cinematic images, production approaches, process and FAQs.
- Portfolio filters and individually addressable concept pages.
- Three-stage project brief with browser and server validation, retained form data when navigating between steps, accessible errors and explicit confirmation after a successful database insert.
- Server-only Supabase integration for public published projects and private enquiries.
- A service-only PostgreSQL function for atomic enquiry insertion, idempotent retries and shared rate limiting across server instances.
- Database constraints, explicit grants, RLS on every table and no public enquiry access.
- Reduced-motion support, keyboard navigation, local font assets, metadata and custom error/404 pages.

## Deployment status

Live site: https://frameshift-studio.vercel.app

GitHub: https://github.com/Matthewcleary1/frameshift-studio

The dedicated Supabase project is not yet provisioned. Creation was blocked by the account's two-active-free-project limit. No existing database was paused, deleted or modified. A free project slot or a plan upgrade is required to continue with a separate database.

Until the database is connected, the site remains a concept preview. The enquiry form clearly reports that submissions are closed and does not send or save the draft. It never fakes successful submission. Search engine indexing is disabled while branding and content are provisional.

The database schema is prepared in `supabase/schema.sql`. It has not yet been applied to a live database.

## Local setup

Requires Node 24. Dependencies are pinned and `package-lock.json` is committed.

```sh
npm ci
npm run build
npm test
```

For local development, copy `.env.example` to `.env.local`, fill the required values after provisioning and linking the new Vercel project, then run `npm run dev`. No environment secrets belong in Git.

## Supabase setup

Use a dedicated new project for this agency. The owner has confirmed the target organisation; provisioning awaits an available project slot or a plan upgrade. Recheck pricing before creating any paid resource.

1. Create and wait for the confirmed project to become healthy.
2. With an installed Supabase CLI, inspect `supabase migration --help` and `supabase migration new --help`; create a migration with `supabase migration new agency_schema` and put the contents of `supabase/schema.sql` in the CLI-created file. Apply it to the confirmed project with the Supabase migration tool. For a remote MCP-only flow, apply the reviewed SQL as the named `agency_schema` migration and preserve its returned migration version in source.
3. Run `supabase/seed.sql` once to add the explicitly labelled concepts. `node --experimental-strip-types scripts/generate-seed.mjs` regenerates this file from `lib/projects.ts`.
4. Run Supabase security advisors. Verify published projects can be read with the publishable key, drafts cannot be read and both enquiry table access and the submission function are denied to `anon` and `authenticated`.
5. Copy the project URL, publishable key and secret key into Vercel environment variables through the account's secure controls. The secret is server-only and must never be prefixed `NEXT_PUBLIC_`.
6. Submit one clearly marked test brief from the deployed website, verify exactly one database row, and retry the same request ID to verify idempotency. Verify malformed payloads and excessive submissions are rejected. Keep or delete only the known test record as explicitly authorised.

### Tables

`agency_projects`: publish/unpublish portfolio entries from Supabase Table Editor; only published rows can be read by visitors. Images refer to versioned assets in `public/images`.

`agency_enquiries`: private incoming project briefs, accessible through the authenticated Supabase project dashboard and the server's secret-key client. Status values: `new`, `reviewing`, `contacted`, `closed`. There is no public admin account or web inbox in this scope.

`agency_submit_enquiry`: only executable by `service_role`; `SECURITY INVOKER`, an empty search path and explicit grants. The function shares rate limits across application instances (3 requests per email/hour, 10 per hashed IP/hour) and returns the existing reference when a request is retried.

### Environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical full origin, without a trailing slash |
| `SUPABASE_URL` | Dedicated Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Public portfolio access, still used server-side |
| `SUPABASE_SECRET_KEY` | Private server-side enquiry insert via service-only RPC |

Vercel's trusted `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL` are also accepted as request origins. Origin checks prevent ordinary cross-site browser submission; they are not presented as bot protection. The database rate limits and honeypot provide basic abuse controls. For higher-volume campaigns, add a managed challenge or upstream rate limiting.

## GitHub and Vercel

The source repository is `Matthewcleary1/frameshift-studio`. Connect it to the existing `frameshift-studio` project in Vercel as a Next.js application. Production branch: `main`. Use Node 24 and the committed lockfile. Add the environment values to production and preview, then redeploy. Subsequent pushes deploy through Vercel's native Git integration.

Before inviting enquiries, replace provisional branding, confirm agency contact and privacy details, apply the schema, set the environment, and verify the database flow. Real client work can replace the concept rows when supplied. Enable indexing only after final content is approved. Email notifications and client authentication are not included; incoming briefs are reviewed in Supabase.

## Verification

`npm run build` compiles production routes and checks TypeScript. `npm test` checks field boundaries, permitted options, consent, normalization and exclusion of client-supplied status/ownership fields. Hosted Supabase persistence and RLS testing remain pending until the new database exists.

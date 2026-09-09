# FRAME/SHIFT — hybrid production agency

Next.js App Router, TypeScript, Supabase and Vercel. FRAME/SHIFT is a provisional agency name. The portfolio visuals are original AI-generated concept studies, visibly labelled in the interface. They are not actual client commissions, testimonials or endorsements.

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

The application is deployed successfully on Vercel and the production build passes TypeScript. The dedicated Supabase project is not yet provisioned, so the site currently uses the source-controlled concept portfolio and keeps enquiry submission disabled rather than pretending to save a brief.

A fresh Supabase project cost check for the target `mcleary.app` organisation reports €0/month. Provisioning remains intentionally pending until that zero-cost creation is explicitly confirmed. No existing Supabase project or user record is modified by this repository.

Search engine indexing remains disabled while branding and content are provisional.

The reviewed database schema is source-controlled both as `supabase/schema.sql` and as the versioned migration `supabase/migrations/20260909214600_agency_schema.sql`. It has not yet been applied to a live database.

## Local setup

Requires Node 24. Dependencies are pinned and `package-lock.json` is committed.

```sh
npm ci
npm run build
npm test
```

For local development, copy `.env.example` to `.env.local`, fill the required values after provisioning Supabase, then run `npm run dev`. No environment secrets belong in Git.

## Supabase setup

Use a dedicated project for this agency. Recheck pricing immediately before provisioning and create only after the owner confirms the displayed cost.

1. Create the confirmed project in the target organisation and wait until it is healthy.
2. Apply `supabase/migrations/20260909214600_agency_schema.sql` through Supabase's migration workflow. Do not paste an untracked variation into production.
3. Run `supabase/seed.sql` once to add the explicitly labelled concept portfolio. `node --experimental-strip-types scripts/generate-seed.mjs` regenerates the seed from `lib/projects.ts`.
4. Run Supabase security advisors. Verify published projects can be read with the publishable key, drafts cannot be read, and both enquiry table access and the submission function are denied to `anon` and `authenticated`.
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

The source repository is `Matthewcleary1/frameshift-studio`. The existing Vercel project is `frameshift-studio`, with production hosted at `frameshift-studio.vercel.app`. The current production deployment was built successfully with Next.js 16.3.4 and Node 24.

The Vercel project is not yet using native Git integration, so the current production deployment and the GitHub repository should be treated as separate until the repository is connected to the existing Vercel project. Once connected, use `main` as the production branch and let subsequent pushes deploy through Vercel's Git integration.

Before inviting enquiries, replace provisional branding where needed, confirm agency contact and privacy details, apply the Supabase migration and seed, set the environment variables, redeploy, and verify the database flow. Real client work can replace the concept rows when supplied. Enable indexing only after final content is approved. Email notifications and client authentication are not included; incoming briefs are reviewed in Supabase.

## Verification

`npm run build` compiles production routes and checks TypeScript. `npm test` checks field boundaries, permitted options, consent, normalization and exclusion of client-supplied status/ownership fields.

The latest Vercel production build completed successfully, TypeScript passed, `/`, `/start`, `/privacy`, `/work/[slug]`, and `/api/enquiries` were generated, and Vercel reported no runtime error clusters in the last 24 hours. Hosted Supabase persistence and RLS testing remain pending until the dedicated database exists.

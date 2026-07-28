# Supabase integration

The homepage contains four optional Edge Functions:

- `track-paper-click` records paper-link clicks and coarse IP-derived location.
- `track-page-visit` records homepage visits and coarse country/region location.
- `paper-click-summary` exposes read-only country and continent aggregates for
  homepage visits, plus the five most-clicked papers.
- `reveal-contact` validates Cloudflare Turnstile before returning the protected
  email address.

These integrations do not run until a Supabase project is connected and the
public project values are added to `_config.yml`.

## Privacy and security

- Raw IP addresses are never inserted into the database.
- Optional repeat-visitor analysis uses a salted SHA-256 hash.
- Country, region, and city are resolved server-side through IPinfo.
- Homepage visits and paper clicks are stored separately.
- The public summary returns country/region-level visit aggregates only, never
  city, visitor hashes, or individual event records.
- A hashed visitor is capped at 120 stored clicks and 60 homepage visits per
  rolling hour.
- Both analytics tables have RLS enabled and grant no browser role direct
  access.
- Supabase secret keys, the Turnstile secret, the IPinfo token, the hash salt,
  and the contact email must only exist as Edge Function secrets.

## Connect a project

1. Link the Supabase CLI to the intended project.
2. Apply all files under `supabase/migrations/` with `supabase db push`.
3. Deploy all four functions with JWT verification disabled, as configured in
   `supabase/config.toml`.
4. Copy `supabase/functions/.env.example` to an ignored local env file and set
   the required Edge Function secrets:

   - `IPINFO_TOKEN` (optional; enables coarse country/region/city)
   - `IP_HASH_SALT` (optional; enables a repeat-visitor hash)
   - `TURNSTILE_SECRET`
   - `TURNSTILE_EXPECTED_HOSTNAME=phenixace.github.io`
   - `TURNSTILE_EXPECTED_ACTION=contact_email`
   - `CONTACT_EMAIL`

5. Add the Supabase project URL and publishable key under both
   `paper_analytics` and `contact` in `_config.yml`.
6. Add the public Cloudflare Turnstile site key under `contact`.

## Read the analytics

The migration creates two server-only views:

- `paper_click_summary`: total clicks and hashed visitor estimates by paper.
- `paper_click_locations`: total clicks and hashed visitor estimates by coarse
  country, region, and city.

The page-visit migration creates:

- `page_visit_summary`: total homepage visits and hashed visitor estimates.
- `page_visit_locations`: homepage visits grouped by country and region.

When `IP_HASH_SALT` is blank, visits and clicks are still counted but the hashed
visitor estimate remains null. When `IPINFO_TOKEN` is blank, events are still
counted without location fields.

The publishable key and Turnstile site key are browser-safe. A Supabase secret,
legacy service-role key, Turnstile secret, IPinfo token, hash salt, or contact
email must never be committed or placed in browser configuration.

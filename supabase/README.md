# Supabase integration

The homepage contains three optional Edge Functions:

- `track-paper-click` records paper-link clicks and coarse IP-derived location.
- `paper-click-summary` exposes read-only country and continent aggregates for
  the homepage map and the five most-clicked papers.
- `reveal-contact` validates Cloudflare Turnstile before returning the protected
  email address.

Neither integration runs until a Supabase project is connected and the public
project values are added to `_config.yml`.

## Privacy and security

- Raw IP addresses are never inserted into the database.
- Optional repeat-visitor analysis uses a salted SHA-256 hash.
- Country, region, and city are resolved server-side through IPinfo.
- The public summary returns country/region-level aggregates only, never city,
  visitor hashes, or individual event records.
- A hashed visitor is capped at 120 stored clicks per rolling hour.
- The database table has RLS enabled and grants no browser role direct access.
- Supabase secret keys, the Turnstile secret, the IPinfo token, the hash salt,
  and the contact email must only exist as Edge Function secrets.

## Connect a project

1. Link the Supabase CLI to the intended project.
2. Apply `supabase/migrations/20260727000000_create_paper_clicks.sql`.
3. Deploy all three functions with JWT verification disabled, as configured in
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

When `IP_HASH_SALT` is blank, clicks are still counted but the hashed visitor
estimate remains null. When `IPINFO_TOKEN` is blank, clicks are still counted
without location fields.

The publishable key and Turnstile site key are browser-safe. A Supabase secret,
legacy service-role key, Turnstile secret, IPinfo token, hash salt, or contact
email must never be committed or placed in browser configuration.

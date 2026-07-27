# Supabase integration

The homepage contains two optional Edge Functions:

- `track-paper-click` records paper-link clicks and coarse IP-derived location.
- `send-contact` validates Cloudflare Turnstile and sends protected contact mail.

Neither integration runs until a Supabase project is connected and the public
project values are added to `_config.yml`.

## Privacy and security

- Raw IP addresses are never inserted into the database.
- Optional repeat-visitor analysis uses a salted SHA-256 hash.
- Country, region, and city are resolved server-side through IPinfo.
- The database table has RLS enabled and grants no browser role direct access.
- Supabase secret keys, the Turnstile secret, the IPinfo token, the hash salt,
  the Resend key, and the destination email must only exist as Edge Function
  secrets.

## Connect a project

1. Link the Supabase CLI to the intended project.
2. Apply `supabase/migrations/20260727000000_create_paper_clicks.sql`.
3. Deploy both functions with JWT verification disabled, as configured in
   `supabase/config.toml`.
4. Set these Edge Function secrets:

   - `IPINFO_TOKEN`
   - `IP_HASH_SALT`
   - `TURNSTILE_SECRET`
   - `TURNSTILE_EXPECTED_HOSTNAME=phenixace.github.io`
   - `RESEND_API_KEY`
   - `CONTACT_FROM_EMAIL`
   - `CONTACT_TO_EMAIL`

5. Add the Supabase project URL and publishable key under both
   `paper_analytics` and `contact` in `_config.yml`.
6. Add the public Cloudflare Turnstile site key under `contact`.

The publishable key is browser-safe when the database is protected by RLS. A
Supabase secret or legacy service-role key must never be committed or placed in
the browser configuration.

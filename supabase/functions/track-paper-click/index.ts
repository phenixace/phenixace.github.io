import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://phenixace.github.io",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
]);

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin ?? "")
      ? origin!
      : "https://phenixace.github.io",
    "Access-Control-Allow-Headers": "apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function secretKey() {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      return JSON.parse(modern).default as string;
    } catch {
      // Fall through to the legacy key.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  if (request.method !== "POST" || !allowedOrigins.has(origin ?? "")) {
    return new Response(JSON.stringify({ error: "not_allowed" }), {
      status: 403,
      headers,
    });
  }

  try {
    const body = await request.json();
    const paperTitle = String(body.paperTitle ?? "").trim().slice(0, 500);
    const targetUrl = String(body.targetUrl ?? "").trim().slice(0, 2000);
    const sourcePath = String(body.sourcePath ?? "").trim().slice(0, 500);
    const parsedTarget = new URL(targetUrl);

    if (
      !paperTitle ||
      !sourcePath.startsWith("/") ||
      !["http:", "https:"].includes(parsedTarget.protocol)
    ) {
      throw new Error("invalid_payload");
    }

    const forwarded = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwarded.split(",")[0].trim();
    const location = {
      country: null as string | null,
      region: null as string | null,
      city: null as string | null,
    };
    const ipinfoToken = Deno.env.get("IPINFO_TOKEN");

    if (ip && ipinfoToken) {
      const response = await fetch(
        `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(ipinfoToken)}`,
        { signal: AbortSignal.timeout(2500) },
      );
      if (response.ok) {
        const data = await response.json();
        location.country = String(data.country ?? "").slice(0, 3) || null;
        location.region = String(data.region ?? "").slice(0, 180) || null;
        location.city = String(data.city ?? "").slice(0, 180) || null;
      }
    }

    const salt = Deno.env.get("IP_HASH_SALT");
    const ipHash = ip && salt ? await sha256(`${salt}:${ip}`) : null;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const key = secretKey();
    const supabase = createClient(supabaseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("paper_clicks").insert({
      paper_title: paperTitle,
      target_url: targetUrl,
      source_path: sourcePath,
      country_code: location.country,
      region: location.region,
      city: location.city,
      ip_hash: ipHash,
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers,
    });
  }
});

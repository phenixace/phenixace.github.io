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

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string>,
) {
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  if (request.method !== "POST" || !allowedOrigins.has(origin ?? "")) {
    return jsonResponse({ error: "not_allowed" }, 403, headers);
  }

  try {
    const body = await request.json();
    const token = String(body.turnstileToken ?? "").trim().slice(0, 2048);
    const secret = Deno.env.get("TURNSTILE_SECRET") ?? "";
    const email = (Deno.env.get("CONTACT_EMAIL") ?? "").trim();

    if (
      !token ||
      !secret ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonResponse({ error: "not_configured" }, 503, headers);
    }

    const ip = (request.headers.get("x-forwarded-for") ?? "")
      .split(",")[0]
      .trim();
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: ip || undefined,
          idempotency_key: crypto.randomUUID(),
        }),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!verification.ok) {
      return jsonResponse({ error: "verification_unavailable" }, 502, headers);
    }

    const outcome = await verification.json();
    const expectedHostname =
      Deno.env.get("TURNSTILE_EXPECTED_HOSTNAME") ?? "";
    const expectedAction =
      Deno.env.get("TURNSTILE_EXPECTED_ACTION") ?? "contact_email";

    if (
      !outcome.success ||
      (expectedHostname && outcome.hostname !== expectedHostname) ||
      outcome.action !== expectedAction
    ) {
      return jsonResponse({ error: "verification_failed" }, 403, headers);
    }

    return jsonResponse({ ok: true, email }, 200, headers);
  } catch {
    return jsonResponse({ error: "invalid_request" }, 400, headers);
  }
});

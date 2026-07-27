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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    const name = String(body.name ?? "").trim().slice(0, 100);
    const email = String(body.email ?? "").trim().slice(0, 180);
    const subject = String(body.subject ?? "").trim().slice(0, 180);
    const message = String(body.message ?? "").trim().slice(0, 5000);
    const honeypot = String(body.company ?? "").trim();
    const token = String(body.turnstileToken ?? "");

    if (
      honeypot ||
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !subject ||
      message.length < 20 ||
      !token
    ) {
      throw new Error("invalid_payload");
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
          secret: Deno.env.get("TURNSTILE_SECRET"),
          response: token,
          remoteip: ip || undefined,
          idempotency_key: crypto.randomUUID(),
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    const outcome = await verification.json();
    const expectedHostname = Deno.env.get("TURNSTILE_EXPECTED_HOSTNAME");

    if (
      !outcome.success ||
      (expectedHostname && outcome.hostname !== expectedHostname)
    ) {
      return new Response(JSON.stringify({ error: "verification_failed" }), {
        status: 403,
        headers,
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("CONTACT_FROM_EMAIL"),
        to: [Deno.env.get("CONTACT_TO_EMAIL")],
        reply_to: email,
        subject: `[Homepage] ${subject}`,
        html: `
          <h2>${escapeHtml(subject)}</h2>
          <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!resendResponse.ok) throw new Error("email_failed");
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: "invalid_request" }), {
      status: 400,
      headers,
    });
  }
});

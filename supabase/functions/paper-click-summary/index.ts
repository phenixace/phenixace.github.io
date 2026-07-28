import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://phenixace.github.io",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
]);

const continentCodes: Record<string, Set<string>> = {
  NA: new Set("AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI".split(" ")),
  SA: new Set("AR BO BR CL CO EC FK GF GY PE PY SR UY VE".split(" ")),
  EU: new Set("AD AL AT AX BA BE BG BY CH CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA XK".split(" ")),
  AF: new Set("AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW".split(" ")),
  AS: new Set("AE AF AM AZ BD BH BN BT CC CN CX CY GE HK ID IL IN IO IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE".split(" ")),
  OC: new Set("AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS".split(" ")),
};

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin ?? "")
      ? origin!
      : "https://phenixace.github.io",
    "Access-Control-Allow-Headers": "apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-store",
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

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function continentFor(countryCode: string) {
  return Object.entries(continentCodes).find(([, codes]) =>
    codes.has(countryCode)
  )?.[0] ?? null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers });
  }
  if (request.method !== "GET" || !allowedOrigins.has(origin ?? "")) {
    return new Response(JSON.stringify({ error: "not_allowed" }), {
      status: 403,
      headers,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabase = createClient(supabaseUrl, secretKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [paperResult, locationResult] = await Promise.all([
      supabase
        .from("paper_click_summary")
        .select("paper_title,target_url,click_count,hashed_visitor_count")
        .order("click_count", { ascending: false })
        .limit(5),
      supabase
        .from("page_visit_locations")
        .select("country_code,region,visit_count,hashed_visitor_count")
        .not("country_code", "is", null)
        .limit(1000),
    ]);

    if (paperResult.error) throw paperResult.error;
    if (locationResult.error) throw locationResult.error;

    const papers = (paperResult.data ?? []).map((paper) => ({
      title: String(paper.paper_title),
      url: String(paper.target_url),
      clicks: numberValue(paper.click_count),
      visitors: numberValue(paper.hashed_visitor_count),
    }));

    const locationTotals = new Map<
      string,
      {
        countryCode: string;
        region: string | null;
        clicks: number;
        visitors: number;
      }
    >();
    const continentTotals = new Map<string, { clicks: number; visitors: number }>();

    for (const row of locationResult.data ?? []) {
      const code = String(row.country_code ?? "").trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(code)) continue;
      const region = String(row.region ?? "").trim().slice(0, 180) || null;
      const clicks = numberValue(row.visit_count);
      const visitors = numberValue(row.hashed_visitor_count);
      const locationKey = `${code}:${region ?? ""}`;
      const location = locationTotals.get(locationKey) ?? {
        countryCode: code,
        region,
        clicks: 0,
        visitors: 0,
      };
      location.clicks += clicks;
      location.visitors += visitors;
      locationTotals.set(locationKey, location);

      const continent = continentFor(code);
      if (!continent) continue;
      const current = continentTotals.get(continent) ?? {
        clicks: 0,
        visitors: 0,
      };
      current.clicks += clicks;
      current.visitors += visitors;
      continentTotals.set(continent, current);
    }

    const locations = Array.from(locationTotals.values())
      .sort(
        (a, b) =>
          b.clicks - a.clicks ||
          a.countryCode.localeCompare(b.countryCode) ||
          (a.region ?? "").localeCompare(b.region ?? ""),
      )
      .slice(0, 8);

    const continents = Object.keys(continentCodes).map((id) => ({
      id,
      clicks: continentTotals.get(id)?.clicks ?? 0,
      visitors: continentTotals.get(id)?.visitors ?? 0,
    }));

    return new Response(
      JSON.stringify({
        papers,
        locations,
        continents,
        originMetric: "homepage_visits",
        locationEnabled: Boolean(Deno.env.get("IPINFO_TOKEN")),
      }),
      { headers },
    );
  } catch {
    return new Response(JSON.stringify({ error: "summary_unavailable" }), {
      status: 503,
      headers,
    });
  }
});

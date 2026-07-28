(function () {
  var root = document.querySelector("[data-paper-insights]");
  var urlMeta = document.querySelector("meta[name='paper-analytics-url']");
  var keyMeta = document.querySelector("meta[name='paper-analytics-key']");
  var functionMeta = document.querySelector(
    "meta[name='paper-analytics-summary-function']"
  );

  if (!root || !urlMeta || !keyMeta || !functionMeta) return;

  var endpoint =
    urlMeta.content.replace(/\/$/, "") +
    "/functions/v1/" +
    encodeURIComponent(functionMeta.content);
  var topPapers = root.querySelector("[data-top-papers]");
  var clickOrigins = root.querySelector("[data-click-origins]");
  var readerMap = root.querySelector("[data-reader-map]");
  var cacheKey = "jiatong-paper-insights-v3";
  var hasRenderedData = false;
  var requestInFlight = false;
  var lastRequestedAt = 0;
  var continentNames = {
    NA: "North America",
    SA: "South America",
    EU: "Europe",
    AF: "Africa",
    AS: "Asia",
    OC: "Oceania",
  };

  function formatCount(value, singular, plural) {
    var count = Number(value) || 0;
    return count + " " + (count === 1 ? singular : plural);
  }

  function countryName(code) {
    try {
      if (window.Intl && Intl.DisplayNames) {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(code);
      }
    } catch (_) {
      // Keep the ISO code as a compact fallback.
    }
    return code;
  }

  function renderPapers(papers) {
    topPapers.replaceChildren();
    if (!papers.length) {
      var empty = document.createElement("li");
      empty.className = "insight-list__status";
      empty.textContent = "Paper rankings will appear after the first click.";
      topPapers.appendChild(empty);
      return;
    }

    papers.forEach(function (paper, index) {
      var item = document.createElement("li");
      var rank = document.createElement("span");
      var text = document.createElement("span");
      var link = document.createElement("a");
      var stats = document.createElement("small");

      item.className = "insight-list__item";
      rank.className = "insight-list__rank";
      rank.textContent = String(index + 1).padStart(2, "0");
      text.className = "insight-list__text";
      link.href = paper.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.dataset.paperLink = "";
      link.dataset.paperTitle = paper.title;
      link.textContent = paper.title;
      stats.textContent =
        formatCount(paper.clicks, "click", "clicks") +
        " · " +
        formatCount(paper.visitors, "reader", "readers");

      text.append(link, stats);
      item.append(rank, text);
      topPapers.appendChild(item);
    });
  }

  function renderMap(continents, locations, locationEnabled) {
    var maxClicks = Math.max(
      1,
      continents.reduce(function (max, continent) {
        return Math.max(max, Number(continent.clicks) || 0);
      }, 0)
    );
    var totalClicks = 0;

    Object.keys(continentNames).forEach(function (id) {
      var data = continents.find(function (continent) {
        return continent.id === id;
      }) || { clicks: 0, visitors: 0 };
      var shape = readerMap.querySelector("[data-continent='" + id + "']");
      var clicks = Number(data.clicks) || 0;
      var heat = clicks ? 0.28 + 0.72 * (clicks / maxClicks) : 0;
      totalClicks += clicks;

      shape.style.setProperty("--heat", heat.toFixed(3));
      shape.style.setProperty(
        "--continent-opacity",
        (0.24 + heat * 0.76).toFixed(3)
      );
      shape.classList.toggle("has-clicks", clicks > 0);
      shape.querySelector("em").textContent = String(clicks);
      shape.title =
        continentNames[id] + " · " + formatCount(clicks, "visit", "visits");
    });

    readerMap.setAttribute(
      "aria-label",
      totalClicks
        ? "Homepage visitor map showing " +
            formatCount(totalClicks, "geolocated visit", "geolocated visits") +
            " across six continents"
        : "No geolocated homepage visits yet"
    );

    clickOrigins.replaceChildren();
    if (!locations.length) {
      var empty = document.createElement("li");
      empty.className = "insight-list__status";
      empty.textContent = locationEnabled
        ? "Location tracking is ready; new homepage visits will light up the map."
        : "Location enrichment is not enabled yet.";
      clickOrigins.appendChild(empty);
      return;
    }

    locations.slice(0, 4).forEach(function (location) {
      var item = document.createElement("li");
      var badge = document.createElement("span");
      var label = document.createElement("span");
      var count = document.createElement("strong");
      var country = countryName(location.countryCode);
      var region = String(location.region || "").trim();
      var distinctRegion =
        region && region.toLocaleLowerCase() !== country.toLocaleLowerCase();

      badge.className = "location-list__badge";
      badge.textContent = location.countryCode;
      label.textContent = distinctRegion ? region + " · " + country : country;
      count.textContent = formatCount(location.clicks, "visit", "visits");
      item.append(badge, label, count);
      clickOrigins.appendChild(item);
    });
  }

  function renderInsights(data, state) {
    renderPapers(Array.isArray(data.papers) ? data.papers : []);
    renderMap(
      Array.isArray(data.continents) ? data.continents : [],
      Array.isArray(data.locations) ? data.locations : [],
      Boolean(data.locationEnabled)
    );
    root.dataset.insightsState = state;
    hasRenderedData = true;
  }

  function readCache() {
    try {
      var cached = JSON.parse(window.localStorage.getItem(cacheKey));
      if (!cached || !cached.data || !Array.isArray(cached.data.papers)) {
        return null;
      }
      return cached.data;
    } catch (_) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({ savedAt: Date.now(), data: data })
      );
    } catch (_) {
      // Storage can be unavailable in strict privacy modes; live data still works.
    }
  }

  var cachedData = readCache();
  if (cachedData) renderInsights(cachedData, "cached");

  function loadInsights(force) {
    var now = Date.now();
    if (requestInFlight || (!force && now - lastRequestedAt < 2500)) return;
    requestInFlight = true;
    lastRequestedAt = now;

    fetch(endpoint + "?fresh=" + now, {
      method: "GET",
      cache: "no-store",
      headers: { apikey: keyMeta.content },
    })
      .then(function (response) {
        if (!response.ok) throw new Error("summary_unavailable");
        return response.json();
      })
      .then(function (data) {
        renderInsights(data, "live");
        writeCache(data);
      })
      .catch(function () {
        if (hasRenderedData) {
          root.dataset.insightsState = "cached";
          return;
        }

        topPapers.replaceChildren();
        clickOrigins.replaceChildren();

        var papersError = document.createElement("li");
        var locationsError = document.createElement("li");
        papersError.className = "insight-list__status";
        locationsError.className = "insight-list__status";
        papersError.textContent = "Live ranking is taking a short break.";
        locationsError.textContent = "The reader map will be back shortly.";
        topPapers.appendChild(papersError);
        clickOrigins.appendChild(locationsError);
      })
      .then(
        function () {
          requestInFlight = false;
        },
        function () {
          requestInFlight = false;
        }
      );
  }

  loadInsights(true);

  window.addEventListener("paperanalytics:updated", function () {
    window.setTimeout(function () {
      loadInsights(true);
    }, 300);
  });

  window.addEventListener("siteanalytics:updated", function () {
    window.setTimeout(function () {
      loadInsights(true);
    }, 300);
  });

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) loadInsights(true);
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) loadInsights(false);
  });
})();

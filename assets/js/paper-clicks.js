(function () {
  var urlMeta = document.querySelector("meta[name='paper-analytics-url']");
  var keyMeta = document.querySelector("meta[name='paper-analytics-key']");
  var functionMeta = document.querySelector(
    "meta[name='paper-analytics-function']"
  );
  if (!urlMeta || !keyMeta || !functionMeta) return;

  var endpoint =
    urlMeta.content.replace(/\/$/, "") +
    "/functions/v1/" +
    encodeURIComponent(functionMeta.content);

  document.addEventListener("click", function (event) {
    var link = event.target.closest(
      "[data-paper-link], .featured-paper a[href], .publication-list a[href]"
    );
    if (!link || !link.href) return;

    var card = link.closest(".featured-paper, .publication-list li, .archive__item");
    var titleElement = card
      ? card.querySelector("h2, h3, [data-paper-title]")
      : null;
    var paperTitle =
      link.dataset.paperTitle ||
      (titleElement && titleElement.textContent.trim()) ||
      link.textContent.trim();

    fetch(endpoint, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: keyMeta.content,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paperTitle: paperTitle.slice(0, 500),
        targetUrl: link.href.slice(0, 2000),
        sourcePath: window.location.pathname.slice(0, 500),
      }),
    })
      .then(function (response) {
        if (response.ok) {
          window.dispatchEvent(new Event("paperanalytics:updated"));
        }
      })
      .catch(function () {
        // Analytics must never interrupt navigation.
      });
  });
})();

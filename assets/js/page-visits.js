(function () {
  var urlMeta = document.querySelector("meta[name='paper-analytics-url']");
  var keyMeta = document.querySelector("meta[name='paper-analytics-key']");
  var functionMeta = document.querySelector(
    "meta[name='page-analytics-function']"
  );

  if (
    !urlMeta ||
    !keyMeta ||
    !functionMeta ||
    window.location.pathname !== "/"
  ) {
    return;
  }

  var endpoint =
    urlMeta.content.replace(/\/$/, "") +
    "/functions/v1/" +
    encodeURIComponent(functionMeta.content);

  fetch(endpoint, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: keyMeta.content,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourcePath: "/" }),
  })
    .then(function (response) {
      if (response.ok) {
        window.dispatchEvent(new Event("siteanalytics:updated"));
      }
    })
    .catch(function () {
      // Analytics must never interrupt the homepage.
    });
})();

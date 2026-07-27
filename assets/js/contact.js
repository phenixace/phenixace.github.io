(function () {
  var root = document.querySelector("[data-contact-root]");
  if (!root) return;

  var form = root.querySelector("[data-secure-contact-form]");
  var fallback = root.querySelector("[data-email-fallback]");
  var revealButton = root.querySelector("[data-reveal-email]");
  var emailLink = root.querySelector("[data-email-link]");
  var status = root.querySelector("[data-contact-status]");
  var config = {
    url: root.dataset.supabaseUrl,
    key: root.dataset.publishableKey,
    functionName: root.dataset.functionName || "send-contact",
    siteKey: root.dataset.turnstileSiteKey,
  };
  var secureFormReady =
    config.url && config.key && config.functionName && config.siteKey;

  function revealEmail() {
    var user = atob("amlhdG9uZy5saQ==");
    var domain = atob("Y29ubmVjdC5wb2x5dS5oaw==");
    var address = user + "@" + domain;
    emailLink.href = "mailto:" + address;
    emailLink.textContent = address;
    emailLink.hidden = false;
    revealButton.hidden = true;
  }

  revealButton.addEventListener("click", revealEmail);

  if (!secureFormReady) return;

  fallback.hidden = true;
  form.hidden = false;

  function renderTurnstile(attempt) {
    if (window.turnstile) {
      window.turnstile.render(root.querySelector("[data-turnstile-container]"), {
        sitekey: config.siteKey,
        theme: "light",
        size: "flexible",
      });
      return;
    }
    if (attempt < 30) {
      window.setTimeout(function () {
        renderTurnstile(attempt + 1);
      }, 150);
    }
  }

  renderTurnstile(0);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var submit = form.querySelector("[type='submit']");
    var formData = new FormData(form);
    var token = formData.get("cf-turnstile-response");

    if (!token) {
      status.textContent = "Please complete the verification first.";
      return;
    }

    submit.disabled = true;
    status.textContent = "Sending…";

    fetch(
      config.url.replace(/\/$/, "") +
        "/functions/v1/" +
        encodeURIComponent(config.functionName),
      {
        method: "POST",
        headers: {
          apikey: config.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          company: formData.get("company"),
          turnstileToken: token,
        }),
      }
    )
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        form.reset();
        status.textContent = "Message sent. Thank you!";
        if (window.turnstile) window.turnstile.reset();
      })
      .catch(function () {
        status.textContent =
          "The message could not be sent. Please retry or use the email fallback.";
        fallback.hidden = false;
      })
      .finally(function () {
        submit.disabled = false;
      });
  });
})();

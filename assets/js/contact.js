(function () {
  var root = document.querySelector("[data-contact-root]");
  if (!root) return;

  var gate = root.querySelector("[data-contact-gate]");
  var revealButton = root.querySelector("[data-reveal-email]");
  var emailLink = root.querySelector("[data-email-link]");
  var status = root.querySelector("[data-contact-status]");
  var config = {
    url: root.dataset.supabaseUrl,
    key: root.dataset.publishableKey,
    functionName: root.dataset.functionName || "reveal-contact",
    siteKey: root.dataset.turnstileSiteKey,
  };
  var secureRevealReady =
    config.url && config.key && config.functionName && config.siteKey;
  var turnstileToken = "";

  function resetVerification(message) {
    turnstileToken = "";
    revealButton.disabled = true;
    revealButton.innerHTML =
      '<i class="fas fa-lock" aria-hidden="true"></i> Verify to reveal email';
    if (message) status.textContent = message;
    if (window.turnstile) window.turnstile.reset();
  }

  if (!secureRevealReady) {
    gate.hidden = true;
    status.textContent = "Protected contact is temporarily unavailable.";
    return;
  }

  function renderTurnstile(attempt) {
    if (window.turnstile) {
      window.turnstile.render(root.querySelector("[data-turnstile-container]"), {
        sitekey: config.siteKey,
        theme: "light",
        size: "flexible",
        action: "contact_email",
        callback: function (token) {
          turnstileToken = token;
          revealButton.disabled = false;
          revealButton.innerHTML =
            '<i class="fas fa-unlock" aria-hidden="true"></i> Reveal email';
          status.textContent = "Verification complete.";
        },
        "expired-callback": function () {
          resetVerification("Verification expired. Please try again.");
        },
        "error-callback": function () {
          resetVerification("Verification could not be completed.");
        },
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

  revealButton.addEventListener("click", function () {
    if (!turnstileToken) {
      status.textContent = "Please complete the verification first.";
      return;
    }

    revealButton.disabled = true;
    status.textContent = "Unlocking…";

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
          turnstileToken: turnstileToken,
        }),
      }
    )
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then(function (result) {
        if (!result.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
          throw new Error("Invalid response");
        }
        emailLink.href = "mailto:" + result.email;
        emailLink.textContent = result.email;
        emailLink.hidden = false;
        revealButton.hidden = true;
        status.textContent = "Email unlocked.";
      })
      .catch(function () {
        status.textContent =
          "The address could not be unlocked. Please complete a new verification.";
        resetVerification();
      })
      .finally(function () {
        if (!revealButton.hidden && turnstileToken) {
          revealButton.disabled = false;
        }
      });
  });
})();

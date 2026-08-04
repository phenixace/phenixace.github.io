(function () {
  "use strict";

  var pet = document.querySelector("[data-phoenix-pet]");
  if (!pet) return;

  var button = pet.querySelector("[data-phoenix-button]");
  var rail = pet.querySelector("[data-phoenix-progress]");
  var fill = pet.querySelector("[data-phoenix-fill]");
  var bubble = pet.querySelector("[data-phoenix-bubble]");
  var percentLabel = pet.querySelector("[data-phoenix-percent]");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section"));
  var frame = null;
  var chatTimer = null;
  var milestoneTimer = null;
  var lastMilestone = 0;
  var messageIndex = 0;

  var messages = [
    "Tiny wings, big research energy 🧪",
    "One more scroll for science! ✨",
    "Molecular curiosity: activated 🔬",
    "Phenix says: keep exploring 💗"
  ];

  function currentSectionName() {
    var marker = window.scrollY + window.innerHeight * 0.42;
    var current = "Welcome";

    sections.forEach(function (section) {
      if (section.offsetTop <= marker) {
        var heading = section.querySelector("h2, h1");
        if (heading) current = heading.textContent.trim();
      }
    });

    return current;
  }

  function showChat(message, duration) {
    window.clearTimeout(chatTimer);
    bubble.textContent = message;
    pet.classList.add("is-chatting");
    button.setAttribute("aria-expanded", "true");

    chatTimer = window.setTimeout(function () {
      pet.classList.remove("is-chatting");
      button.setAttribute("aria-expanded", "false");
    }, duration || 2200);
  }

  function celebrate() {
    pet.classList.remove("is-celebrating");
    void pet.offsetWidth;
    pet.classList.add("is-celebrating");
    window.setTimeout(function () {
      pet.classList.remove("is-celebrating");
    }, 850);
  }

  function update() {
    frame = null;

    var documentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    var scrollable = Math.max(1, documentHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    var percent = Math.round(progress * 100);
    var travel = Math.max(0, pet.clientHeight - button.offsetHeight);
    var offset = progress * travel;

    button.style.transform = "translate3d(-50%, " + offset + "px, 0)";
    fill.style.height = Math.min(pet.clientHeight, offset + button.offsetHeight / 2) + "px";
    percentLabel.textContent = percent + "%";
    rail.setAttribute("aria-valuenow", String(percent));
    button.setAttribute(
      "aria-label",
      "Scroll progress " + percent + " percent, near " + currentSectionName() + ". Click the phoenix for a message."
    );

    var milestone = Math.floor(percent / 25) * 25;
    if (milestone > 0 && milestone !== lastMilestone) {
      lastMilestone = milestone;
      pet.classList.add("is-milestone");
      window.clearTimeout(milestoneTimer);
      milestoneTimer = window.setTimeout(function () {
        pet.classList.remove("is-milestone");
      }, 650);

      if (milestone === 100) {
        showChat("You reached the tail feathers! 🎉", 2800);
        celebrate();
      }
    }
  }

  function requestUpdate() {
    if (frame === null) frame = window.requestAnimationFrame(update);
  }

  button.addEventListener("click", function () {
    var progressText = percentLabel.textContent;
    var message = messages[messageIndex % messages.length];
    messageIndex += 1;
    showChat(progressText + " · " + message, 2600);
    celebrate();
  });

  button.addEventListener("mouseenter", function () {
    bubble.textContent = percentLabel.textContent + " · " + currentSectionName();
  });

  button.addEventListener("focus", function () {
    bubble.textContent = percentLabel.textContent + " · " + currentSectionName();
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
  requestUpdate();
})();

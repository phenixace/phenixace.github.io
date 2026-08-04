(function () {
  "use strict";

  var pet = document.querySelector("[data-phoenix-pet]");
  if (!pet) return;

  var button = pet.querySelector("[data-phoenix-button]");
  var rail = pet.querySelector("[data-phoenix-progress]");
  var fill = pet.querySelector("[data-phoenix-fill]");
  var bubble = pet.querySelector("[data-phoenix-bubble]");
  var percentLabel = pet.querySelector("[data-phoenix-percent]");
  var mode = pet.getAttribute("data-phoenix-mode") || "page";
  var tools = pet.querySelector("[data-phoenix-tools]");
  var closeButton = pet.querySelector("[data-phoenix-close]");
  var searchInput = pet.querySelector("[data-phoenix-search]");
  var resultsLabel = pet.querySelector("[data-phoenix-results]");
  var actionButtons = Array.prototype.slice.call(pet.querySelectorAll("[data-phoenix-action]"));
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-phoenix-item]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section, #main section"));
  var pageHeading = document.querySelector("main h1, #main h1");
  var pageName = pageHeading
    ? pageHeading.textContent.trim()
    : document.title.split(" - ")[0].trim();
  var frame = null;
  var chatTimer = null;
  var milestoneTimer = null;
  var lastMilestone = 0;
  var messageIndex = 0;
  var activeResult = -1;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var messages = [
    "Tiny wings, big research energy 🧪",
    "One more scroll for science! ✨",
    "Molecular curiosity: activated 🔬",
    "Phenix says: keep exploring 💗"
  ];

  function currentSectionName() {
    var marker = window.scrollY + window.innerHeight * 0.42;
    var current = pageName || "Welcome";

    sections.forEach(function (section) {
      if (section.offsetTop <= marker) {
        var heading = section.querySelector("h2, h1");
        if (heading) current = heading.textContent.trim();
      }
    });

    items.forEach(function (item) {
      if (!item.hidden && item.offsetTop <= marker) {
        var heading = item.querySelector("h2, h3");
        if (heading) current = heading.textContent.trim();
      }
    });

    return current;
  }

  function visibleItems() {
    return items.filter(function (item) {
      return !item.hidden;
    });
  }

  function itemLabel(count) {
    if (mode === "publications") return count === 1 ? "publication" : "publications";
    return count === 1 ? "tutorial" : "tutorials";
  }

  function updateResults() {
    if (!resultsLabel) return;

    var matches = visibleItems();
    var query = searchInput ? searchInput.value.trim() : "";
    resultsLabel.textContent = query
      ? matches.length + " of " + items.length + " " + itemLabel(items.length) + " match “" + query + "”."
      : items.length + " " + itemLabel(items.length) + " ready to explore.";

    actionButtons.forEach(function (actionButton) {
      if (actionButton.getAttribute("data-phoenix-action") === "next") {
        actionButton.disabled = matches.length === 0;
      }
    });
  }

  function filterItems() {
    if (!searchInput) return;

    var query = searchInput.value.trim().toLocaleLowerCase();
    items.forEach(function (item) {
      item.hidden = query !== "" && item.textContent.toLocaleLowerCase().indexOf(query) === -1;
      item.classList.remove("is-phoenix-focused");
    });
    activeResult = -1;
    updateResults();
    requestUpdate();
  }

  function focusNextResult() {
    var matches = visibleItems();
    if (!matches.length) return;

    items.forEach(function (item) {
      item.classList.remove("is-phoenix-focused");
    });
    activeResult = (activeResult + 1) % matches.length;
    var nextItem = matches[activeResult];
    nextItem.classList.add("is-phoenix-focused");
    nextItem.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center"
    });
  }

  function positionTools() {
    if (!tools || tools.hidden) return;

    var buttonRect = button.getBoundingClientRect();
    var toolsHeight = tools.offsetHeight;
    var preferredTop = buttonRect.top + buttonRect.height / 2 - toolsHeight / 2;
    var minTop = window.innerWidth <= 767 ? 72 : 86;
    var maxTop = Math.max(minTop, window.innerHeight - toolsHeight - 16);
    tools.style.top = Math.max(minTop, Math.min(preferredTop, maxTop)) + "px";
  }

  function openTools(focusSearch) {
    if (!tools) return;

    window.clearTimeout(chatTimer);
    pet.classList.remove("is-chatting");
    tools.hidden = false;
    pet.classList.add("is-tools-open");
    button.setAttribute("aria-expanded", "true");
    positionTools();
    updateResults();

    if (focusSearch && searchInput) {
      window.requestAnimationFrame(function () {
        searchInput.focus();
      });
    }
  }

  function closeTools(restoreFocus) {
    if (!tools) return;

    tools.hidden = true;
    pet.classList.remove("is-tools-open");
    button.setAttribute("aria-expanded", "false");
    if (restoreFocus) button.focus();
  }

  function showChat(message, duration) {
    window.clearTimeout(chatTimer);
    bubble.textContent = message;
    pet.classList.add("is-chatting");
    if (!tools) button.setAttribute("aria-expanded", "true");

    chatTimer = window.setTimeout(function () {
      pet.classList.remove("is-chatting");
      if (!tools) button.setAttribute("aria-expanded", "false");
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
      "Scroll progress " + percent + " percent, near " + currentSectionName() + ". Click the phoenix " +
        (tools ? "to open page tools." : "for a message.")
    );

    positionTools();

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
    if (tools) {
      if (tools.hidden) openTools(true);
      else closeTools(false);
      return;
    }

    var progressText = percentLabel.textContent;
    var message = messages[messageIndex % messages.length];
    messageIndex += 1;
    showChat(progressText + " · " + message, 2600);
    celebrate();
  });

  button.addEventListener("mouseenter", function () {
    bubble.textContent = tools
      ? percentLabel.textContent + " · Click to search this page"
      : percentLabel.textContent + " · " + currentSectionName();
  });

  button.addEventListener("focus", function () {
    bubble.textContent = tools
      ? percentLabel.textContent + " · Click to search this page"
      : percentLabel.textContent + " · " + currentSectionName();
  });

  if (tools && searchInput) {
    searchInput.addEventListener("input", filterItems);
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        focusNextResult();
      }
    });

    closeButton.addEventListener("click", function () {
      closeTools(true);
    });

    actionButtons.forEach(function (actionButton) {
      actionButton.addEventListener("click", function () {
        var action = actionButton.getAttribute("data-phoenix-action");

        if (action === "next") focusNextResult();
        if (action === "clear") {
          searchInput.value = "";
          filterItems();
          searchInput.focus();
        }
        if (action === "top") {
          closeTools(false);
          window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!tools.hidden && !pet.contains(event.target)) closeTools(false);
    });

    document.addEventListener("keydown", function (event) {
      var target = event.target;
      var isTyping = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      );

      if (event.key === "/" && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        openTools(true);
      }
      if (event.key === "Escape" && !tools.hidden) closeTools(true);
    });

    updateResults();
    window.setTimeout(function () {
      if (tools.hidden) {
        showChat(
          mode === "publications"
            ? "Tap me to search all publications 🔎"
            : "Tap me to find a tutorial ✨",
          3200
        );
      }
    }, 650);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
  requestUpdate();
})();

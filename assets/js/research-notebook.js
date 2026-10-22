(function () {
  "use strict";

  var notebook = document.querySelector("[data-research-notebook]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // All research pages are rendered in HTML. Tabs are a progressive enhancement.
  if (notebook) {
    var map = notebook.querySelector("[data-research-map]");
    var tabs = Array.prototype.slice.call(notebook.querySelectorAll("[data-research-tab]"));
    var panels = Array.prototype.slice.call(notebook.querySelectorAll("[data-research-panel]"));

    function selectDirection(tab, focus) {
      var id = tab.getAttribute("data-research-tab");
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-research-panel") !== id;
      });
      if (focus) tab.focus({ preventScroll: true });
      window.dispatchEvent(new Event("resize"));
    }

    map.setAttribute("role", "tablist");
    tabs.forEach(function (tab, index) {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "research-" + tab.getAttribute("data-research-tab"));
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        selectDirection(tab, false);
      });
      tab.addEventListener("keydown", function (event) {
        var next;
        // The two-column map follows the same order on desktop and mobile.
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") next = (index + 2) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (event.key === " ") next = index;
        if (next !== undefined) {
          event.preventDefault();
          selectDirection(tabs[next], true);
        }
      });
    });
    panels.forEach(function (panel) {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "tab-" + panel.getAttribute("data-research-panel"));
      panel.tabIndex = 0;
    });
    notebook.classList.add("is-interactive");

    function selectHash() {
      var target = tabs.filter(function (tab) { return tab.hash === window.location.hash; })[0];
      if (target) selectDirection(target, false);
      return target;
    }
    if (!selectHash()) selectDirection(tabs[0], false);
    window.addEventListener("hashchange", selectHash);
  }

  var gallery = document.querySelector("[data-paper-gallery]");
  if (gallery) {
    var track = gallery.querySelector("[data-paper-track]");
    var papers = Array.prototype.slice.call(track.querySelectorAll(".notebook-paper"));
    var previous = gallery.querySelector("[data-gallery-previous]");
    var next = gallery.querySelector("[data-gallery-next]");
    var position = gallery.querySelector("[data-gallery-position]");
    var timer;

    function pad(number) { return number < 10 ? "0" + number : String(number); }

    function leadingIndex() {
      var left = track.getBoundingClientRect().left;
      var index = 0;
      papers.forEach(function (paper, i) {
        if (paper.getBoundingClientRect().left <= left + 10) index = i;
      });
      return index;
    }

    function updateGallery() {
      var bounds = track.getBoundingClientRect();
      var visible = [];
      papers.forEach(function (paper, index) {
        var rect = paper.getBoundingClientRect();
        var overlap = Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left);
        if (overlap > rect.width * 0.5) visible.push(index + 1);
      });
      if (visible.length) {
        position.textContent = pad(visible[0]) + (visible.length > 1 ? "–" + pad(visible[visible.length - 1]) : "") + " / " + pad(papers.length);
      }
      previous.disabled = track.scrollLeft < 3;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 3;
    }

    function goToPaper(index) {
      var paper = papers[Math.max(0, Math.min(papers.length - 1, index))];
      track.scrollTo({ left: paper.offsetLeft - papers[0].offsetLeft, behavior: reducedMotion.matches ? "auto" : "smooth" });
    }
    previous.addEventListener("click", function () { goToPaper(leadingIndex() - 1); });
    next.addEventListener("click", function () { goToPaper(leadingIndex() + 1); });
    track.addEventListener("keydown", function (event) {
      if (event.target !== track) return;
      var index;
      if (event.key === "ArrowRight") index = leadingIndex() + 1;
      if (event.key === "ArrowLeft") index = leadingIndex() - 1;
      if (event.key === "Home") index = 0;
      if (event.key === "End") index = papers.length - 1;
      if (index !== undefined) {
        event.preventDefault();
        goToPaper(index);
      }
    });
    track.addEventListener("scroll", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(updateGallery, 100);
    }, { passive: true });
    window.addEventListener("resize", updateGallery);
    gallery.querySelector("[data-gallery-controls]").hidden = false;
    updateGallery();
  }

  document.querySelectorAll(".news-archive, .paper-context").forEach(function (details) {
    details.addEventListener("toggle", function () { window.dispatchEvent(new Event("resize")); });
  });
})();

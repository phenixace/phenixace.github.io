(function () {
  function escapeBib(value) {
    return (value || "")
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/([&%#_])/g, "\\$1")
      .replace(/[{}]/g, "");
  }

  function extractAuthors(citation, year) {
    var marker = new RegExp("\\.\\s*\\(" + year + "\\)\\.");
    var authors = (citation || "").split(marker)[0].trim();
    authors = authors.replace(/\*/g, "").replace(/\bet al\.\s*$/i, "others");

    var parts = authors.split(",").map(function (part) {
      return part.trim().replace(/^&\s*/, "");
    });
    var looksLikeInitials =
      parts.length >= 4 &&
      parts.filter(function (part, index) {
        return index % 2 === 1 && /^[A-Z](?:\.[A-Z]?)*\.?$/.test(part);
      }).length >= Math.floor(parts.length / 3);

    if (looksLikeInitials) {
      var paired = [];
      for (var index = 0; index < parts.length; index += 2) {
        var surname = parts[index];
        var initials = parts[index + 1] || "";
        paired.push((surname + ", " + initials).trim());
      }
      return paired.join(" and ");
    }

    return authors
      .replace(/,\s*(?:and|&)\s+/gi, " and ")
      .replace(/,\s+/g, " and ")
      .replace(/\s+and\s+others$/i, " and others");
  }

  function makeBibTeX(container) {
    var data = container.dataset;
    var venue = data.venue || "";
    var isPreprint = /arxiv|preprint/i.test(venue);
    var isConference =
      /KDD|ICLR|CVPR|ACL|WWW|IJCAI|CCL|CBDCom|AAAI|ICML|NeurIPS|AISTATS|PRICAI|INLG/i.test(
        venue
      );
    var type = isPreprint ? "misc" : isConference ? "inproceedings" : "article";
    var key = data.key || "publication-" + (data.year || "nd");
    var fields = [
      "  author = {" + escapeBib(extractAuthors(data.citation, data.year)) + "}",
      "  title = {" + escapeBib(data.title) + "}",
      "  year = {" + escapeBib(data.year) + "}",
    ];

    if (venue) {
      var venueField =
        type === "article"
          ? "journal"
          : type === "inproceedings"
            ? "booktitle"
            : "howpublished";
      fields.push(
        "  " + venueField + " = {" + escapeBib(venue) + "}"
      );
    }

    if (data.url) {
      fields.push("  url = {" + escapeBib(data.url) + "}");
    }

    return "@" + type + "{" + key + ",\n" + fields.join(",\n") + "\n}";
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }

    var textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return Promise.resolve();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy-citation]");
    if (!button) return;

    var container = button.closest("[data-citation-actions]");
    var format = button.getAttribute("data-copy-citation");
    var value =
      format === "bibtex" ? makeBibTeX(container) : container.dataset.citation;
    var status = container.querySelector(".citation-actions__status");
    var original = button.innerHTML;

    copyText(value)
      .then(function () {
        button.classList.add("is-copied");
        button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied';
        status.textContent =
          format === "bibtex" ? "BibTeX copied." : "Word citation copied.";
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          button.innerHTML = original;
          status.textContent = "";
        }, 1800);
      })
      .catch(function () {
        status.textContent = "Copy failed. Please try again.";
      });
  });
})();

---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: false
phoenix_mode: publications
notebook_section: publications
---

{% assign publication_years = site.publications | group_by_exp: "paper", "paper.date | date: '%Y'" | sort: "name" | reverse %}
<div class="publication-index">
  <nav class="year-index" aria-label="Publication years">
    {% for year in publication_years %}<a href="#papers-{{ year.name }}">{{ year.name }} <span>{{ year.items.size }}</span></a>{% endfor %}
  </nav>
  <a class="notebook-text-link" href="https://scholar.google.com/citations?user=ml9hh18AAAAJ" target="_blank" rel="noopener">Google Scholar <span aria-hidden="true">↗</span></a>
</div>
<p class="notebook-index-hint"><i class="fas fa-search" aria-hidden="true"></i> The little phoenix can help you find a paper by title or topic.</p>
{% for year in publication_years %}
<section class="publication-year" id="papers-{{ year.name }}" aria-labelledby="year-{{ year.name }}">
  <h2 class="notebook-year-heading" id="year-{{ year.name }}">{{ year.name }} <span>{{ year.items.size }} papers</span></h2>
  {% assign year_papers = year.items | sort: 'date' | reverse %}
  {% for post in year_papers %}
    {% include notebook-publication.html %}
  {% endfor %}
</section>
{% endfor %}

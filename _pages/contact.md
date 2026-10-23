---
layout: archive
title: "Contact"
permalink: /contact/
author_profile: false
notebook_section: contact
---

<div
  class="protected-contact"
  data-contact-root
  data-supabase-url="{{ site.contact.supabase_url | default: '' | escape }}"
  data-publishable-key="{{ site.contact.publishable_key | default: '' | escape }}"
  data-function-name="{{ site.contact.function_name | default: 'reveal-contact' | escape }}"
  data-turnstile-site-key="{{ site.contact.turnstile_site_key | default: '' | escape }}"
>
  <div class="protected-contact__intro">
    <span class="protected-contact__icon" aria-hidden="true"><i class="fas fa-envelope"></i></span>
    <div>
      <p class="section-kicker">A note to Jiatong</p>
      <h2>What are you working on?</h2>
      <p>I’d be happy to hear about your research, discuss a collaboration, or join a conversation about AI for science.</p>
    </div>
  </div>

  <div class="contact-gate" data-contact-gate>
    <p>Complete the verification below to view my email address.</p>
    <div class="contact-turnstile" data-turnstile-container></div>
    <button type="button" data-reveal-email disabled>
      <i class="fas fa-lock" aria-hidden="true"></i>
      Show email
    </button>
    <a data-email-link hidden></a>
    <p class="contact-gate__status" data-contact-status role="status" aria-live="polite"></p>
  </div>

  <p class="contact-privacy">The verification helps keep automated spam out of my inbox.</p>
</div>

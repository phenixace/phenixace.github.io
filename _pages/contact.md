---
layout: archive
title: "Contact"
permalink: /contact/
author_profile: false
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
      <p class="section-kicker">Protected contact</p>
      <h2>Let’s talk about scientific AI.</h2>
      <p>For research discussions, collaboration, or speaking invitations, complete the quick verification to reveal my email address.</p>
    </div>
  </div>

  <div class="contact-gate" data-contact-gate>
    <p>Your browser completes a bot check before the address is requested from the server.</p>
    <div class="cf-turnstile" data-turnstile-container></div>
    <button type="button" data-reveal-email disabled>
      <i class="fas fa-lock" aria-hidden="true"></i>
      Verify to reveal email
    </button>
    <a data-email-link hidden></a>
    <p class="contact-gate__status" data-contact-status role="status" aria-live="polite"></p>
  </div>

  <p class="contact-privacy">Cloudflare Turnstile is verified server-side. The email address is not embedded in this page, and raw IP addresses are not stored by this site.</p>
</div>

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
  data-function-name="{{ site.contact.function_name | default: 'send-contact' | escape }}"
  data-turnstile-site-key="{{ site.contact.turnstile_site_key | default: '' | escape }}"
>
  <div class="protected-contact__intro">
    <span class="protected-contact__icon" aria-hidden="true"><i class="fas fa-envelope"></i></span>
    <div>
      <p class="section-kicker">Protected contact</p>
      <h2>Let’s talk about scientific AI.</h2>
      <p>For research discussions, collaboration, or speaking invitations, send a concise note and I will get back to you.</p>
    </div>
  </div>

  <form class="contact-form" data-secure-contact-form hidden>
    <div class="contact-form__grid">
      <label>
        <span>Name</span>
        <input name="name" type="text" autocomplete="name" maxlength="100" required>
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" autocomplete="email" maxlength="180" required>
      </label>
    </div>
    <label>
      <span>Subject</span>
      <input name="subject" type="text" maxlength="180" required>
    </label>
    <label>
      <span>Message</span>
      <textarea name="message" rows="7" minlength="20" maxlength="5000" required></textarea>
    </label>
    <label class="contact-form__honeypot" aria-hidden="true">
      <span>Company</span>
      <input name="company" type="text" tabindex="-1" autocomplete="off">
    </label>
    <div class="cf-turnstile" data-turnstile-container></div>
    <button class="contact-form__submit" type="submit">Send protected message <span aria-hidden="true">→</span></button>
    <p class="contact-form__status" data-contact-status role="status" aria-live="polite"></p>
  </form>

  <div class="email-fallback" data-email-fallback>
    <p>To protect the address from automated harvesting, it is assembled only after an intentional click.</p>
    <button type="button" data-reveal-email>
      <i class="fas fa-lock" aria-hidden="true"></i>
      Reveal email
    </button>
    <a data-email-link hidden></a>
  </div>

  <p class="contact-privacy">The protected form uses Cloudflare Turnstile for bot verification. Raw IP addresses are not stored by this site.</p>
</div>

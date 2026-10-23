# Jim's approved plan – Apex Agentics site refresh

> **Later overrides from the owner (these take priority over the plan below):**
> - No owner name anywhere. Footer shows 'Apex Agentics' only; Ben's trading-name line stays in config behind `showLegalLine=false`; About shows no personal name.
> - Prices are shown as estimates labelled 'from' or 'Estimate' (replaces 'Provisional price'); 'fixed price' wording dropped.
> - No timeframes anywhere (the 'how long it takes' FAQ and [TIMESCALE TBC] are removed).
> - Styling: design direction supplied later (Ink/Bone/Signal palette, Space Grotesk / Inter Tight / Instrument Serif, GSAP/Lenis/OGL effects with reduced-motion and touch guardrails).
> VAT wording later changed by the owner to: 'No VAT is added to our prices.'
>
> Note: the 'CHECKS FOR SAM AND DANIEL' section was not in the brief this copy was made from, so it is not reproduced here. The per-step checks below are verbatim.

STEP 1, single config. Use site-config.json (or the existing content.json) for every price, the trader name, status, email and add-on prices, each with provisional: true. The page shows a small 'Provisional price' tag while it's true. Starting values: build from £595, care £19 to £39 a month. Form add-ons: Simple £49, Detailed £99, 3 for £120. The Deluxe brand review is an add-on line at [PRICE TBC]. Check: change one price in config, rebuild, and the page shows it; grep finds no price written in the HTML.

STEP 2, section order: hero (offer, price from config, one button) > proof strip > Dave Young before/after > two price cards with the Deluxe add-on line > how it works (3 steps) > what's included and you own it > FAQ > about > contact > footer. Delete the 'coming soon' testimonial placeholders. The proof strip has only true, checkable items: 'UK based', 'Fixed prices', 'You own your site', 'Phone-first design'. No numbers, counts, stars or logos. Check: the order is right, there's no testimonial block and the proof strip has no figures.

STEP 3, before/after. Describe it as a preview concept made for Dave Young, not a refresh of his live site. Two screenshots side by side, stacked on a phone, with a list of what changed taken only from real differences, and no results claimed. All of this sits behind daveYoungApproved (false by default), which shows a neutral 'Example project' placeholder instead. Build the approved version in code, but leave the flag false and keep his name and screenshots out of the deployed files (keep the images out of the deploy dir, or load them only when the flag is true). Check: the phrase 'refresh of his live site' and any result claim are absent, and with the flag false the name doesn't appear (grep the deploy dir).

STEP 4, FAQ. 'You own your site and domain. No lock-in.' shows only if ownershipConfirmed is true (default false). FAQ covers: who owns the site; how long it takes ([TIMESCALE TBC] from config); how to cancel ([CANCELLATION TBC] from config); and VAT, worded exactly 'Prices are final. No VAT is added.' Check: every answer comes from config or approved wording.

STEP 5, about, contact and footer. About uses the name and bio from config, as placeholders (Dave is confirming with the owner which name to use; don't use the owner's full name). Contact shows a visible 'Email address coming soon' placeholder with no working-looking Send button and no claim it sends. Footer: trader name, 'Sole trader', 'Not VAT registered', a contact placeholder and a [BEN PRIVACY LINE] slot. Check: the footer content comes from config and the form can't submit.

STEP 6 (low priority, do it if the rest is done): form add-on section, 'Branded forms that work on phone or laptop, save or print.', with tiers from config and Provisional tags, a [BEN DISCLAIMER] slot for risk assessment templates, and no consent form.

STEP 7, look and speed. Mobile first. Fade or slide motion only, turned off by prefers-reduced-motion. Max 2 fonts, system or self-hosted. Compressed images with width and height set, lazy loading below the fold, contrast 4.5:1. No stock photos, fake counters or 'AI-powered'. Check: Lighthouse mobile 90+ for performance and accessibility, no layout shift warnings, at 375 and 1280px (Playwright is in /workspace/daveyoung/node_modules; npx lighthouse is fine).

STEP 8, automatic tests (add to the existing ones). The build fails on: a price in HTML instead of config; a provisional value shown without its tag; 'testimonial' or 'coming soon' outside the contact placeholder (only allow that one string, and say so); 'refresh of' near Dave Young; missing noindex or robots disallow; a token-like string in the repo.

## CHECKS FOR SAM AND DANIEL (pass or fail)
1. Sections are in the order above on laptop and phone.
2. Two price cards show config prices, each tagged Provisional, and the Deluxe add-on line is present.
3. Dave Young is described as a preview concept with the before/after and change list, and claims no results.
4. There are no testimonials or placeholder testimonials.
5. 'You own your site and domain' shows only if confirmed.
6. The FAQ covers ownership, timescale, cancelling and VAT, with the exact VAT line.
7. The footer has name, sole trader and not VAT registered.
8. The contact form clearly isn't live and claims nothing.
9. The form add-on section has provisional tiers, the disclaimer slot and no consent form.
10. Motion is subtle and turns off with reduced motion, and Lighthouse mobile is 90+.
11. Nothing on the page is a figure or claim that isn't in config or approved copy.

Note: later owner overrides (top of this file) change checks 2, 6 and 7: prices are tagged Estimate, no timescale, footer shows 'Apex Agentics' only, and empty values are hidden rather than shown.

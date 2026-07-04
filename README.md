# Vestro by RA — Unlock Your Era

Handpicked kasavu & festive saree boutique. Doha ⇄ Kerala · free delivery · cash on delivery.

**Live shop:** https://infinitywomansgym.github.io/vestro/
**Admin portal:** https://infinitywomansgym.github.io/vestro/admin

## How it works

- Customers pick sarees with **Add to order** — one tap sends a WhatsApp message
  listing everything they chose (+974 6619 4953, with a follow-up button for the 2nd number).
- The owner manages everything at **/admin**: add products with photos, set prices,
  mark **Sold out**, or **Hide** items. Changes appear on the site instantly.
- No server to maintain: hosted free on GitHub Pages, products stored in
  Firebase (project `vestro-e5637`, free tier).

## Files

| File | Purpose |
|---|---|
| `index.html` / `styles.css` / `script.js` | The shop — layout, design, 3D silk animations |
| `catalog.js` | Loads products from Firebase + the WhatsApp order basket |
| `admin.html` (+ `admin/`) | Admin portal, reachable at `/admin` |
| `firebase-config.js` | Firebase keys + WhatsApp numbers |
| `logo.png` / `logo-mark.png` | Brand logo and round emblem |

## Common changes

- **WhatsApp numbers** — edit them at the bottom of `firebase-config.js`.
- **Admin logins** — Firebase console → Authentication → Users → Add user.
- **Colors** — edit the `:root` section at the top of `styles.css`.

Every push to `main` goes live automatically in ~1 minute.

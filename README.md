# Vestro by RA — Website

A premium handloom saree e-commerce site with 3D animations and interactive elements.

## 📁 Project Structure

```
vestro-by-ra/
├── index.html         (HTML markup — the page structure)
├── styles.css         (All CSS styling — colors, layout, animations)
├── script.js          (All JavaScript — interactivity, 3D animations)
├── catalog.js         (Live product catalog + WhatsApp order basket)
├── admin.html         (Admin portal — add/edit/hide products, mark sold out)
├── firebase-config.js (Firebase keys + WhatsApp numbers)
├── logo.png / logo-mark.png (Brand logo and round emblem)
└── README.md          (This file)
```

## 🛒 E-commerce (WhatsApp orders + Admin portal)

- **Customers:** every saree card has *Add to order* (pick several, one WhatsApp
  message lists them all automatically) and *Order now* (single item).
- **Owner:** open `admin.html` and sign in to add products with photos, set prices,
  mark items **Sold out**, or **Hide** them from the site entirely.
- **Setup:** already connected to Firebase project `vestro-e5637` (free tier).

## 🚀 How to Use

### Local Development (VS Code)

1. **Create a folder** called `vestro-by-ra` on your computer.
2. **Download all the files** into that folder.
3. **Open the folder in VS Code:**
   - File → Open Folder → select `vestro-by-ra`
4. **Install a live server extension** (right-click in VS Code Extensions, search "Live Server", install it)
5. **Right-click on `index.html`** → "Open with Live Server"
   - Your site opens in your browser and auto-reloads when you save changes.

### Deploy to GitHub Pages

1. **Create a GitHub repository** called `vestro-by-ra` (or any name).
2. **Upload all the files** to the repository root (drag & drop them, or use Git):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```
3. **Go to Settings → Pages → Build and deployment**
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`
   - Click **Save**
4. **Wait 1–2 minutes** — your site goes live at:
   - `https://yourusername.github.io/vestro-by-ra/`

Add this link to your **Instagram bio** under "Website."

## 🎨 What's Inside

- **index.html** — Semantic HTML, Google Fonts links, Three.js CDN, embedded SVGs for paisley ornament
- **styles.css** — Full design system with CSS variables (colors, fonts, spacing), animations, responsive media queries
- **script.js** — 
  - Navigation scroll states
  - Scroll-triggered reveals
  - 3D card tilt on hover
  - Animated parcel along the route map
  - 3D silk sash (flowing ribbon with wave physics, cursor interaction)
  - All interaction handlers

## 🛠️ Customization Tips

### Change Brand Name
- Search `Vestro` in all three files and replace with your brand name
- Update the favicon in `index.html` (line ~10)

### Update WhatsApp Number
- Find `97466194953` in all files and replace with your phone number
- Format: country code + number (no + sign, just digits)

### Change Colors
- Open `styles.css` and edit the `:root` section at the top:
  ```css
  --maroon: #6b1f2a;    /* deep wine — change this */
  --gold: #b98a3e;      /* antique gold — change this */
  --paper: #f7f1e5;     /* page background — change this */
  ```
- All colors automatically update across the entire site.

### Adjust the 3D Sash
In `script.js`, find the "SILK SASH" section and tweak:
- `wave()` function: change `0.36`, `0.27`, `0.13` for twist intensity
- `hover` multiplier: change `1.05` to make the swell more/less dramatic
- Animation speed: change `*0.001` to `*0.0015` for faster waves

### Change Font Pairs
In `index.html`, replace the Google Fonts import (line ~13):
- `Gloock` → serif display font (used for headings and watermark)
- `Great Vibes` → script font (used for calligraphic watermark)
- `Jost` → clean body font (used for all body text)

## 📞 Support

**Issues with the site?**
- Check the browser console: Right-click → Inspect → Console tab (look for red errors)
- Make sure all the files are in the same folder
- Clear your browser cache (Ctrl+Shift+Delete) and reload

**Missing Three.js?**
- The site loads Three.js from a CDN link in `index.html`. If it's blocked, download `three.min.js` and place it in the folder, then update the link in `index.html`.

## ✨ Features

- **3D Flowing Silk Sash** — Responds to cursor, runs only when visible (battery-efficient)
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Scroll Reveals** — Content fades and slides in as you scroll
- **3D Product Cards** — Tilt on hover with specular sheen
- **Animated Route Map** — Glowing parcel travels from Kerala to Doha
- **Reduced Motion Support** — Respects `prefers-reduced-motion` setting
- **Calligraphic Watermarks** — Elegant "Vestro" and "with love" signatures behind sections
- **WhatsApp Integration** — Pre-filled chat links for every product

---

**Built with:** HTML5, CSS3, JavaScript (vanilla), Three.js  
**Design approach:** Luxury minimalism with 3D depth and interactive subtlety

Enjoy! 🧵✨

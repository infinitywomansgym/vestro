# 🔥 Connect the Admin Portal — One-Time Setup (~10 minutes, free)

The admin portal (`admin.html`) saves your products online using **Firebase** — a free
Google service. You do this **once**; after that you add/edit/hide sarees from any
phone or computer and the site updates instantly.

> Until you finish this, the website still works and shows the 4 starter sarees.

---

## Step 1 — Create the Firebase project (free)

1. Go to **https://console.firebase.google.com** and sign in with any Google account.
2. Click **"Create a project"** (or "Add project").
3. Project name: `vestro` → click **Continue**.
4. Google Analytics: turn it **OFF** (not needed) → click **Create project** → **Continue**.

## Step 2 — Turn on the product database (Firestore)

1. In the left menu click **Build → Firestore Database**.
2. Click **Create database**.
3. Location: choose **asia-south1 (Mumbai)** (closest to Doha/Kerala) → **Next**.
4. Choose **Start in production mode** → **Create**.
5. Open the **Rules** tab at the top, delete everything there, paste this, then click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

*(This means: anyone can see the products, but only you — signed in — can change them.)*

## Step 3 — Create your admin login

1. Left menu: **Build → Authentication** → click **Get started**.
2. Click **Email/Password** → switch the first toggle **ON** → **Save**.
3. Open the **Users** tab → click **Add user**.
4. Enter your email and a strong password (this is your admin portal login — save it somewhere safe) → **Add user**.

## Step 4 — Copy your config into the website

1. Click the **⚙️ gear icon** (top-left, next to "Project Overview") → **Project settings**.
2. Scroll down to **"Your apps"** → click the **`</>`** (Web) icon.
3. App nickname: `vestro-site` → click **Register app** (don't tick Firebase Hosting).
4. You'll see a code box containing something like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy....",
  authDomain: "vestro-xxxx.firebaseapp.com",
  projectId: "vestro-xxxx",
  storageBucket: "vestro-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
```

5. Open the file **`firebase-config.js`** in this folder and replace each
   `PASTE_...` value with your values (keep the quotes). Save the file.
6. If you deployed on GitHub Pages: upload the updated `firebase-config.js` there too.

## Step 5 — Done! Try it

1. Open **`admin.html`** (or `yoursite.github.io/vestro/admin.html`).
2. Sign in with the email + password from Step 3.
3. Click **"Load the 4 starter sarees"**, then add your own with photos.

---

## Daily use (after setup)

| You want to… | Do this in the admin portal |
|---|---|
| Add a new saree | **+ Add product** → photo, name, price → Save |
| Mark one as sold out | Change its dropdown to **Sold out** |
| Remove one from the site | Change its dropdown to **Hidden** |
| Bring it back | Change the dropdown back to **Available** |
| Change price/photo/name | **Edit** |

Changes appear on the live site **immediately** (customers may need to refresh).

## How customers order

- Each saree card has **"Add to order"** — they can pick several, then one button sends
  you a WhatsApp message listing everything they chose, automatically.
- **"Order now"** on a card sends a WhatsApp message for just that saree.
- Sold-out sarees show a "Sold out" badge and can't be ordered.

## If something doesn't work

- **Admin says "setup needed"** → `firebase-config.js` still has `PASTE_...` values, or the file wasn't uploaded to GitHub.
- **"Wrong email or password"** → check the user you created in Authentication → Users.
- **Products don't save** → make sure you published the Rules from Step 2 exactly.
- **Site shows only the starter sarees** → your products list in Firestore is empty, or the config isn't uploaded — open the browser console (F12) for a hint.

## Cost

Firebase's free tier allows ~50,000 reads/day. A small boutique site uses a tiny
fraction of that. You will **not** be charged — no credit card is ever entered.

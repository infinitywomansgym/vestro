/* ==========================================================================
   VESTRO — FIREBASE CONFIG
   Paste your own Firebase project config here (see SETUP-FIREBASE.md).
   Until you do, the site still works and shows the 4 built-in sarees,
   but the admin portal will ask you to finish the setup.
   ========================================================================== */
window.VESTRO_FIREBASE_CONFIG = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

/* Your WhatsApp numbers — country code + number, digits only.
   Orders open a chat with the first number; customers then get an
   "Also send to our 2nd number" button for the second one. */
window.VESTRO_WHATSAPP = "97466194953";
window.VESTRO_WHATSAPP_2 = "97466192509";   /* leave "" if not needed */

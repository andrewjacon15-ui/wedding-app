# 🥂 Cheers to Us! — Wedding Drink Tracker

A mobile-friendly web app for wedding guests to log the drinks they grab from
your curated bar menu, see their own total liquid volume consumed, and check
a live leaderboard against everyone else. No app install required — it's a
website guests open on their phone.

## Features

- **Curated bar menu** — you (the admin) add exactly the drinks being served,
  each with its own pour size, so totals are accurate to your actual bar.
- **One-tap logging** — guests pick their name once, then tap a drink each
  time they grab one. Includes instant "Undo" if they misclick.
- **My stats** — running total in fl oz or mL, drink count, and live rank.
- **Leaderboard** — everyone's total liquid volume, ranked live, with medals
  for the top 3.
- **Admin tab** — passcode-gated menu and event-title management, right from
  a phone. No app install or deploy step needed to curate the bar.
- **Mobile-first** — big tap targets, bottom tab nav, works great added to a
  phone's home screen.

## How it works

This is a static site (plain HTML/CSS/JS, no build step) backed by
[Firebase Firestore](https://firebase.google.com/docs/firestore) so every
guest's phone sees the same live menu, totals, and leaderboard. There's no
real user login — guests just type their name, which keeps it frictionless
for a party.

## One-time setup (~5 minutes)

The repo ships with `firebase-config.js` empty on purpose (an app with a
teammate's live database keys baked into a public repo is a bad default).
Point it at your own free Firebase project:

1. Go to the [Firebase console](https://console.firebase.google.com) → **Add
   project** (the free "Spark" plan is plenty for this — no credit card).
2. In your new project, click the `</>` (web) icon to register a web app,
   then copy the `firebaseConfig` object it gives you.
3. Paste those values into [`firebase-config.js`](firebase-config.js) in this
   repo (`apiKey`, `authDomain`, `projectId`, etc.).
4. In the Firebase console, go to **Firestore Database** → **Create database**
   (start in production mode), then go to the **Rules** tab and paste in the
   contents of [`firestore.rules`](firestore.rules) from this repo.
5. In both the rules you just pasted AND in `firebase-config.js`, set the
   passcode: replace the two `"YOUR_WEDDING_CODE"` placeholders in the rules
   with a passcode of your choice, click **Publish**, then set
   `window.WEDDING_CODE` in `firebase-config.js` to that **exact same** value.
6. Commit and push both files.

### Load your bar menu

Open the site, go to the **Admin** tab, enter your passcode, and either:

- Click **"Load starter menu"** for 12 common wedding-bar drinks (beer, wine,
  champagne, a few cocktails, a shot, water, a mocktail) and edit from there, or
- Add your own drinks one by one — name, emoji, pour size in fl oz, category.

Toggle any item off any time (e.g. once the bar runs out) — it disappears
from the guest menu without losing its history.

## Running it locally

No build step — just serve the folder statically, e.g.:

```bash
python -m http.server 8420
```

Then open `http://localhost:8420`.

## Deploying

Any static host works. Easiest with GitHub Pages, already set up for this
repo — go to **Settings → Pages** on GitHub, set the source to the `main`
branch (root), and your guests' link will be:

```
https://<your-github-username>.github.io/wedding-drink-tracker/
```

Put that link on a table card, your wedding website, or a QR code at the bar.

## Notes on the lightweight security model

There's no real authentication — guests identify themselves by typing a name
(no password), and the Admin tab is gated by a shared passcode rather than a
login. That's a deliberate tradeoff for a zero-friction party app: anyone
with your wedding link can log drinks and see the leaderboard; only people
with your passcode can edit the bar menu or event title. Firestore security
rules (`firestore.rules`) enforce that split server-side. Don't reuse a
sensitive passcode here — it's visible to anyone who views the page source.

Please drink responsibly, and look out for each other. 🥂

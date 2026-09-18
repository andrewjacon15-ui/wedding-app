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
- **5-minute pacing cooldown** — after logging a drink, the menu locks with a
  live countdown until the next one unlocks. Undoing a mis-tap clears it
  immediately.
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

## One-time setup

`firebase-config.js` is already wired to the `wedding-drink-tracker` Firebase
project's web app config, and the admin passcode is `cheers2026` (change it —
see below). Two things still need doing in the Firebase console before the
app can actually read/write data:

1. Go to the [Firebase console](https://console.firebase.google.com/project/wedding-drink-tracker/firestore)
   → **Firestore Database** → **Create database** (production mode is fine,
   pick any region) if you haven't already.
2. Go to the **Rules** tab and paste in the contents of
   [`firestore.rules`](firestore.rules) from this repo, then **Publish**.
   Without this step every read/write gets a `permission-denied` error.

To change the admin passcode from the `cheers2026` default: edit it in both
`firestore.rules` (two spots) and `firebase-config.js` (`window.WEDDING_CODE`)
to the same new value, publish the rules in the console, and commit + push
the file.

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

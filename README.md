# Andrew & Lydia — Wedding Weekend App

A mobile-friendly web app for our wedding weekend (November 6–7, 2026). Right now it includes a
drink tracker (log drinks from the curated bar menu, see your total, and check
a live leaderboard), optional notes with each drink, and a shared photo
gallery, with room to add more. No app install required: it's a website
guests open on their phone.

## Features

- **Curated bar menu** — you (the admin) add exactly the drinks being served,
  each with its own pour size, so totals are accurate to your actual bar.
- **One-tap logging** — guests pick their name once, then tap a drink each
  time they grab one. Includes instant "Undo" if they misclick.
- **5-minute pacing cooldown** — after logging a drink, the menu locks with a
  live countdown until the next one unlocks. Undoing a mis-tap clears it
  immediately.
- **My stats** — running total in fl oz or mL, drink count, and live rank.
- **Share my weekend** — every guest can turn their stats into a cute
  story-sized image (1080x1920) with their total, rank, a fun title like "Hop
  Head" or "Hydration Hero", and their signature drink. On phones it opens the
  share sheet (straight to Instagram Stories); elsewhere it saves the image.
- **Leaderboard** — everyone's total liquid volume, ranked live, with a
  **Drink of the Weekend** card showing the most-logged drink and how many.
- **Water check** — after every 3rd drink a guest logs, a cheeky "Water check?"
  reminder pops up (skipped when the drink was non-alcoholic).
- **Agenda tab** — a link to the wedding website, the Friday welcome party, the Saturday order of the day, shuttle times, and a note that
  rideshare doesn't operate in the county. Edit the times directly in `index.html` (search for "Order of the Weekend").
- **Export & share (Admin)** — download the final stats, all notes, or the
  complete drink log as CSV, or a shareable results card image (top 5,
  Drink of the Night, totals, and your latest photos).
- **Drink notes** — an optional 140-character note can ride along with any
  drink. Notes show in My Recent Drinks and in a "Notes from the Bar" feed on
  the Leaderboard tab; admins can hide any note. Swear words are masked but
  stay readable (`f*ck`, `sh*t`), including common workarounds (`fuq`, `sh1t`,
  `a$$`, `f.u.c.k`, spaced-out letters), plus sexual innuendo (`m*torboat`,
  `s*x`) and drug references (`c*caine`, `w*ed`; Coke, method and heroine are
  left alone). Notes telling someone to hurt themselves
  are dropped entirely (the drink still logs). It is a word filter, so it can't
  catch every innuendo; use Hide for anything it misses.
- **Guest photos** — a Photos tab where anyone can snap or pick photos (up to
  10 at a time). Photos are shrunk on the phone and stored in Firestore, so
  no paid Storage plan is needed. Tap a photo to view it larger; admins can
  permanently delete any photo (Admin is the small link under the footer).
- **Grandparent check** — after picking photos, and before anything uploads, a
  "Photo check" popup shows the photo with one of 12 rotating prompts ("Would you
  want your grandparents to see this?", "Pause. Would Nana approve?", ...) and
  Post it / Never mind buttons. Edit `GRANDPARENT_LINES` in `index.html` to add
  your own.
- **Photo screening** — every photo, whether taken with the camera or picked
  from the library, is checked on the guest's phone by an open-source model
  ([NSFW.js](https://github.com/infinitered/nsfwjs), self-hosted in `vendor/nsfw/`)
  before it is uploaded. Nudity and explicit images are blocked with a friendly
  message, and if the check can't run the photo is not uploaded. It is a
  best-effort filter, not a guarantee: it runs in the guest's browser (a
  determined person could bypass it) and no model is perfect, so keep an eye on
  the gallery and use Admin Delete for anything that slips through. The first
  photo check downloads about 7 MB once per phone. Thresholds are deliberately
  lenient so drinks, toasts, dancing and kisses go through; tune `NSFW_EXPLICIT_LIMIT`
  and `NSFW_SEXY_LIMIT` in `index.html` if you want it stricter.
- **Matches the wedding website** — cream and taupe palette, Amarante
  headings, and Crimson Text body copy, to look like part of the same site.
- **Admin tab** — passcode-gated menu, event-title, and guest management,
  right from a phone. No app install or deploy step needed to curate the bar.
- **Purge / remove guests** — "Purge all" permanently deletes every guest, drink,
  total and note (photos are kept), so the leaderboard, ranks and cooldowns
  start truly fresh. It asks you to type PURGE first and can't be undone. To
  remove just one guest instead, use Remove next to their name: that one is a
  soft delete, so their history isn't destroyed and they reappear starting
  fresh if they log another drink.
- **Mobile-first** — big tap targets, a five-tab bottom bar (Admin lives in a
  small footer link so the bar never feels cramped), works great added to a
  phone's home screen.

## How it works

This is a static site (plain HTML/CSS/JS, no build step) backed by
[Firebase Firestore](https://firebase.google.com/docs/firestore) so every
guest's phone sees the same live menu, totals, and leaderboard. There's no
real user login — guests just type their name, which keeps it frictionless
for a party.

## One-time setup

`firebase-config.js` is already wired to the `wedding-drink-tracker` Firebase
project's web app config (the project keeps that ID because Firebase project
IDs can't be renamed, and the database collections keep their `weddingDrink*`
names so existing data stays intact), and the admin passcode is `cheers2026` (change it —
see below). Two things still need doing in the Firebase console before the
app can actually read/write data:

1. Go to the [Firebase console](https://console.firebase.google.com/project/wedding-drink-tracker/firestore)
   → **Firestore Database** → **Create database** (production mode is fine,
   pick any region) if you haven't already.
2. Go to the **Rules** tab and paste in the contents of
   [`firestore.rules`](firestore.rules) from this repo, then **Publish**.
   Without this step every read/write gets a `permission-denied` error.
   Re-paste and re-publish any time `firestore.rules` changes in this repo —
   the file in the console doesn't update itself, unless you deploy it with
   `firebase deploy --only firestore:rules --project wedding-drink-tracker`
   (uses the included `firebase.json`). (It changed most recently
   to add the Photos collections.)

To change the admin passcode from the `cheers2026` default: edit it in both
`firestore.rules` (two spots) and `firebase-config.js` (`window.WEDDING_CODE`)
to the same new value, publish the rules in the console, and commit + push
the file.

### Load your bar menu

Open the site, go to the **Admin** tab, enter your passcode, and either:

- Click **"Load starter menu"** for 7 basics (IPA, light beer, red and white
  wine, champagne, water, a mocktail) and edit from there, or
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
https://<your-github-username>.github.io/wedding-app/
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

A guest's identity is a random ID generated once per device and stored in
that browser's local storage — it is *not* derived from the name they type.
Renaming yourself (fixing a typo, or trying to dodge the drink cooldown or
start the leaderboard over) just relabels your existing record; it doesn't
create a fresh one. The only way to actually get a clean slate on the same
device is clearing that browser's site data, which is a real enough hurdle
to stop casual cooldown-dodging without adding any login.

Please drink responsibly, and look out for each other. 🥂

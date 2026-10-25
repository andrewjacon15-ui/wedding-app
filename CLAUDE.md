# Wedding app: style guidelines

## Logos and icons

- **Every logo and icon is a minimalist line logo. Never an emoji.** This applies
  to drink logos, the favicon, popups, share cards, empty states and anything new.
- Logos are the small inline SVGs in the `LOGOS` registry in `index.html`:
  24x24 grid, 1.5 stroke, round caps, drawn in the app palette (`--taupe-dark`
  line, `--peach` soft fill). Class `a` = peach fill, `b` = solid mark,
  `c` = peach cut-out.
- Drink logos are inspired by the brand or the style of drink (crown for Corona,
  moon for High Life, cow on the Spotted Cow bottle, hop cone for an IPA, claw
  marks on a can for White Claw...). They are original and simple, not copies of
  real brand logos.
- Menu items store an `icon` key only (no `emoji` field). Anything without a
  logo falls back to the generic `cocktail` logo, never to an emoji.
- New drinks must be given a logo in Admin > Add a Drink. If none of the 23
  logos fits, draw a new one in the same style and add it to `LOGOS`.
- Canvas share cards draw logos as images (`logoDataUrl`), not as emoji text.
- Decorative sparkles on cards are drawn shapes, not text glyphs.

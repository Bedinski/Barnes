# Koala & Panda Reading

A web-based reading game for Kindergarteners (going into 1st grade) to
practice **sight words** and **reading complete sentences**, starring
animated baby koalas and pandas.

Built with vanilla HTML / CSS / ES modules — no build step, no framework,
no runtime dependencies. The shipped site is just static files.

## Game modes

1. **Find the Word** — tap the koala or panda holding the spoken word.
2. **Match the Story** — read the sentence, tap the picture that fits.
3. **Build a Sentence** — drag word tiles in order to describe the picture.

## Run locally

Any static file server works. Two quick options:

```bash
# Python 3 (built-in)
python3 -m http.server 8000

# Or, if you have npm
npm run serve
```

Then open <http://localhost:8000>.

## Run the tests

The unit tests use Node's built-in test runner with `jsdom` for DOM/SVG
simulation. Requires Node 20+.

```bash
npm install   # installs the only dev dep, jsdom
npm test
```

## Deploy to GitHub Pages

The repo includes `.github/workflows/pages.yml`, which on every push to
`main`:

1. Runs `npm test`.
2. If tests pass, publishes the repo root to GitHub Pages.

**One-time repo setup** (do this once in GitHub UI):

> **Settings → Pages → Build and deployment → Source: GitHub Actions**

After that, pushes to `main` deploy automatically. The site will be live
at `https://<your-user>.github.io/<repo-name>/`.

## Editing the word list

Open `js/data/words.js` and edit the `KINDERGARTEN` and `FIRST_GRADE`
arrays. The game cycles through them in order. To add new sentences,
edit `js/data/sentences.js` (each sentence references a `sceneId` defined
in `js/characters/sceneArt.js`).

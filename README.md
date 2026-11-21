# ⚽ FIFA Nights

A static website for our FIFA tournaments: standings, hall of fame, player profiles, head-to-head and a countdown to the next night. Data lives in Excel files; GitHub Pages hosts it for free.

## Adding a new tournament (the everyday job)

1. Create an Excel file in the `data/` folder named exactly like:
   `Fifa Tournement 4 (March 2027).xlsx`  → number **4**, month **March 2027**
2. Put one match per row in the **first column** of the first sheet, as `Home HomeGoals AwayGoals Away`:
   ```
   Murat 3 1 Salman
   Arian 2 2 Mehdi
   ```
   (Names must be spelled identically everywhere. A single word per name, no spaces.)
3. New player? Add `public/avatars/<Name>.png` (case-sensitive, square, ~512px). Without it, initials are shown.
4. Update `data/next-night.json` with the date of the next night (`"2026-12-12T13:00:00+01:00"`, +01:00 winter / +02:00 summer in Norway).
5. Commit and push. On GitHub's website: **Add file → Upload files** in `data/` works from a phone. The site rebuilds in about a minute.

If a row can't be read, or two tournaments use the same number, the build fails and the Actions log says which file and row.

## Run locally

```
npm install
npm run dev      # converts Excel -> JSON, starts http://localhost:5173
npm test         # checks the table logic
npm run build    # production build into dist/
```

## One-time GitHub Pages setup

1. Create a repository on GitHub and push this folder to the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push (or run the workflow from the **Actions** tab). The site appears at `https://<your-user>.github.io/<repo-name>/`.

## Rules used

- Win 3 points, draw 1, loss 0.
- Table order: points → goal difference → goals scored → head-to-head → name.
- All-time ranking uses **points per game** so missing tournaments doesn't penalise anyone.
- The first name in a row is *not* treated as "home" (the data isn't consistent), so there are no home/away stats.

# Contributing to Better San Jose

Thanks for helping. This is a civic portal for San Jose City, Nueva Ecija, so accuracy matters as
much as code: every figure, hotline and official on the site should trace back to an official
source.

## Setup

1. Install [Node.js 22](https://nodejs.org/) (see `.nvmrc`) and, for the live weather station, PHP 8
   on your PATH.
2. Clone the repository and install dependencies:

   ```bash
   npm ci
   ```

3. Copy `.env.example` to `.env`. Ask a maintainer for `KCLOUD_API_KEY`; without it the weather
   card falls back to the Open-Meteo forecast and everything else works.
4. Start the dev server at http://localhost:3000:

   ```bash
   npm run dev
   ```

## Before you open a pull request

```bash
npm run check   # format check, typecheck, and production build
```

CI runs the same command on every pull request. `npm run format` fixes formatting.

- Branch from `main` and keep each pull request to one change.
- Write commit messages in the imperative: "Add barangay hotlines", not "Added hotlines".
- If you change what visitors see, include a screenshot at desktop and phone width.
- This site is a static export (`output: 'export'`). Server features such as API routes, Server
  Actions or `cookies()` won't work in production. The only server code is
  `public/api/weather-station.php`.
- This project uses Next.js 16, which differs from older versions. Check
  `node_modules/next/dist/docs/` before relying on an API you remember.

## Changing data

| What                     | Where                             | Rule                                                                                                            |
| ------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Tax and fee figures      | `src/data/revenue.ts`             | Copy exactly as printed. If a row looks wrong, keep it and add a `notes` entry. Update the schedule's `source`. |
| PSIC list                | `src/data/psic.json`              | Never edit by hand. Regenerate it with `scripts/psic-to-json.py` (see README).                                  |
| PSIC to tax code mapping | `RULES` in `src/lib/estimator.ts` | Explain each rule in its `why` text, citing the code or law it relies on.                                       |
| News, officials, budget  | `src/data/*.json`                 | Link the official source in the pull request.                                                                   |
| Placeholders             | search for `TODO(data)`           | Replace only with verified official data.                                                                       |

Source documents (PDFs, Excel files) stay out of the repository and off the site. Keep them in
`sources/`, which git ignores, and commit only what you derive from them. Say in the pull request
where the document came from.

## Secrets

Never commit `.env` or paste an API key into code, issues or pull requests. If a key is exposed,
tell a maintainer so it can be revoked and replaced.

## License

By contributing, you agree that your code is released under the MIT license and your content
under CC BY 4.0, as described in `LICENSE`.

<p align="center">
	<img src="https://img.shields.io/badge/English-0066cc?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PGNsaXBQYXRoIGlkPSJ0Ij48cGF0aCBkPSJNMzAsMTVoMzB2MTV6djE1aC0zMHpoLTMwdi0xNXp2LTE1aDMweiIvPjwvY2xpcFBhdGg+PHBhdGggZD0iTTAsMHYzMGg2MHYtMzB6IiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIGNsaXAtcGF0aD0idXJsKCN0KSIgc3Ryb2tlPSIjQzgxMDJFIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNDODEwMkUiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==" alt="English">
	<a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-555?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoOXYzSDB6Ii8+PHBhdGggZmlsbD0iIzAwMzlhNiIgZD0iTTAgMmg5djJIMHoiLz48cGF0aCBmaWxsPSIjZDUyYjFlIiBkPSJNMCA0aDl2MkgweiIvPjwvc3ZnPg==" alt="Русский"></a>
</p>

<p align="center">
	<a href="https://sorebody.aimuzov.online"><img src=".github/assets/banner.en.jpg" alt="Sorebody, a sports pain reference: how common each kind of pain is in CrossFit, padel, football, running, basketball and hiking, its symptoms, when to see a doctor and how to adapt training, with links to the research." width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov/sorebody/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov/sorebody/deploy.yml?branch=main&label=release" alt="Release"></a>
	<a href="https://sorebody.aimuzov.online"><img src="https://img.shields.io/website?url=https%3A%2F%2Fsorebody.aimuzov.online&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov%2Fsorebody%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov/sorebody/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov/sorebody/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov/sorebody" alt="License"></a>
</p>

<h3 align="center">Sorebody, a sports pain reference: how common each kind of pain is in CrossFit, padel, football, running, basketball and hiking, its symptoms, when to see a doctor and how to adapt training, with links to the research.</h3>

<!-- Uncomment once the screenshots are in .github/assets.
<table>
	<tr>
		<td width="50%" align="center"><img src=".github/assets/home.jpg" alt="Home page"><br><b>Home</b> for visitors</td>
		<td width="50%" align="center"><img src=".github/assets/screen.jpg" alt="Second screen"><br><b>Screen</b> what it shows</td>
	</tr>
</table>
-->

<p>Lives at <a href="https://sorebody.aimuzov.online">sorebody.aimuzov.online</a>. A static <a href="https://astro.build">Astro</a> site, interactive islands are written in <a href="https://svelte.dev">Svelte</a>.</p>

The site is in Russian, so the names below are translated.

## What's inside

- **Sport home** (`/` for CrossFit, `/<sport>/`): a 3D body with pain zones, search and filters. The sport is switched from a list in the heading, each one has its own color ([`src/frontend/data/sports.ts`](src/frontend/data/sports.ts)).
- **Article** (`/<sport>/<injury>/`): the shared part of an injury plus the take for the sport. The shared part on its own is at `/injuries/<injury>/`.
- **About**, **What's new** and **404** have no sport, their accent is graphite.
- **Brand**: the "pain point" mark in [`logo.svelte`](src/frontend/components/logo.svelte); the favicon, icons, OG image and README banner are rendered by [`scripts/brand/render.mjs`](scripts/brand/render.mjs). The name and descriptor live in [`site.ts`](src/frontend/data/site.ts).
- **Public MCP** at `/mcp` (Streamable HTTP, no sessions, read-only): search over the articles, an article by sections, red flags, the catalog. The base is `/knowledge.json`, which the site build emits; the server is [`src/backend/mcp.ts`](src/backend/mcp.ts).
- **Footer**: the author credit from [infra-site-kit](https://github.com/aimuzov/infra-site-kit) with a link to the source code, `repo` in [`site.ts`](src/frontend/data/site.ts).

## How it is built

Everything lives in `src/`:

- [`src/frontend`](src/frontend): the Astro site, it is the `srcDir` in `astro.config.mjs`. Imports go through `#frontend/*`.
- [`src/backend`](src/backend): the API next to the site, the way shkatova-psychologist and prestige-logist do it: plain Node running TypeScript, no build, imports through `#backend/*`. Code both sides need is in [`src/shared`](src/shared) (`#shared/*`), the image is [`deploy/backend.Dockerfile`](deploy/backend.Dockerfile), the `api` service in `deploy/docker-compose.yml`. The site never imports from `src/backend`.

Everything about the server is in [`deploy`](deploy): the Dockerfile, compose and nginx. The deploy script is shared by all sites and lives in [infra-server](https://github.com/aimuzov/infra-server).

Every file, components included, is named in kebab-case: `base.astro`, `section-photo.astro`. The name used in markup comes from the import (`import Base from '#frontend/layouts/base.astro'`), and the `unicorn/filename-case` rule in oxlint keeps file names in line.

## Running

Stack and layout follow [infra-site-template](https://github.com/aimuzov/infra-site-template): Astro + Svelte 5, Prettier, oxlint, stylelint (BEM), `node --test` for unit tests, Playwright for e2e. The Prettier, stylelint, oxlint and Playwright configs and the CI steps come from [infra-site-kit](https://github.com/aimuzov/infra-site-kit). Node comes from [`mise.toml`](mise.toml), the same version is pinned in `package.json` and [`deploy/frontend.Dockerfile`](deploy/frontend.Dockerfile).

```sh
cp .env.example .env   # may stay empty, but the file has to exist
npm ci
npm run dev
```

Before committing, the same checks as in CI:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check && npm test && npm run build
```

E2E tests in [`e2e`](e2e) build the site and open it in Chromium: every sitemap page answers without console errors and passes axe. CI runs them after the checks. The browser is installed once with `npx playwright install chromium`.

```sh
npm run test:e2e
```

The API and MCP run on Node without a build, the base comes from `dist/knowledge.json`, so build the site first. `npm run api` serves `/mcp` on port 8787; `npm run mcp:stdio` is the same server over stdio, for Claude Desktop or `npx @modelcontextprotocol/inspector`.

```sh
npm run build && npm run api
```

## Mobile

Safari on iPhone zooms the page in when you tap a field whose text is under 16px, and never zooms back out. So `input`, `textarea` and `select` on touch screens (`@media (--touch)`) get at least `1rem`: the base rule lives in [`global.css`](src/frontend/styles/global.css), and a component that sets its own `font-size` on a field has to repeat it.

Zoom as a whole is not turned off with `maximum-scale=1` or `user-scalable=no` in the viewport: that leaves people with poor eyesight no way to enlarge small text.

## Content Security Policy

The build puts a CSP with hashes of Astro's scripts and styles into every page (the `security.csp` option in `astro.config.mjs`). `npm run dev` has no policy, so violations only show up after `npm run build && npm run preview` and in production.

- No `style=""` attributes or handlers like `onclick`: styles go through classes and rules in `<style>`, handlers live in `<script>`.
- An external script, image or request (a widget, a map, a font from a CDN) has to be allowed in `security.csp` first. Out of the box it allows only the site itself.
- After such changes, check the browser console in `npm run preview`: the browser reports everything it blocks there.

## Deployment

With `DEPLOY_FROM_GHCR=true`, GitHub Actions builds the site and API images and publishes them to GHCR. The restricted deploy key starts [`infra-server/deploy/site.sh`](https://github.com/aimuzov/infra-server/blob/main/deploy/site.sh), which verifies image revisions, updates containers through systemd and retains rollback images. Shared Caddy serves the domain and TLS.

The deploy job runs only when the repository variable `DEPLOY_ENABLED` is `true`, and the SSH key is the `DEPLOY_SSH_KEY` secret. Until the server is set up, a release only runs the checks.

To roll back fast, run Release by hand with the previous tag: `gh workflow run deploy.yml -f tag=v1.2.3`. A fix of the bad commit goes out through the release PR like any change.

Production settings live in GitHub Actions Variables. `CHAT` and `PUBLIC_SENTRY_DSN` go into site builds. `CHAT_ENABLED`, `CHAT_MODEL`, `CHAT_ORIGINS` and `CHAT_*` quota variables configure the API.

`OPENROUTER_API_KEY` and `API_CONFIG_SSH_KEY` are Actions Secrets. Before deployment, CI sends settings over SSH. The receiver only accepts known keys and atomically replaces `/srv/sorebody/api.env` with mode `0600`.

Install `deploy/api-config.py` as a root-owned file at `/usr/local/lib/sorebody/api-config.py`. Restrict the dedicated key in `authorized_keys`: `command="/usr/bin/python3 /usr/local/lib/sorebody/api-config.py",restrict`. Settings reach containers on the next deployment. Local development uses the example env files.

### What's new page

`CHANGELOG.md` is for developers and release-please writes it. The [/changelog](src/frontend/pages/changelog.astro) page tells readers the same story in plain Russian, and its entries live in [`src/frontend/data/changelog.ts`](src/frontend/data/changelog.ts). Before merging a release PR, add an entry at the top: the version and date from its `CHANGELOG.md`, a short title and what a reader will notice. Leave out CI, refactoring and dependencies. A link inside an item is written `[text](/path)`, and a test checks that every link leads to an existing page. Another test fails the release PR until its version has an entry.

## License

The code is licensed under [MIT](LICENSE). Site content (texts, images, names and contacts) is not covered by it: all rights reserved.

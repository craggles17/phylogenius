# CI/CD

`ci.yml` runs on every push and pull request:

- **`test`** — `npm ci` + `npm test` (`node --test`) on Node 22. The headless
  puppeteer smoke tests run too; they self-skip if Chrome can't launch.
- **`deploy`** — runs only on a push to `main`, and only after `test` passes.
  Builds `dist/game` and pushes it into the live Pages repo
  (`craggles17/craggles17.github.io` → `games/phylogenius/`), keeping the URL
  https://craggles17.github.io/games/phylogenius/ unchanged.

## One-time setup: `PAGES_DEPLOY_TOKEN`

The deploy job pushes to a **separate** repo, so it needs a token with write
access to it (the built-in `GITHUB_TOKEN` only covers this repo).

1. **Create a token** — GitHub → Settings → Developer settings → **Personal
   access tokens → Fine-grained tokens** → *Generate new token*:
   - Resource owner: `craggles17`
   - Repository access: **Only select repositories** → `craggles17/craggles17.github.io`
   - Permissions: **Contents → Read and write**
   - (Classic token also works: scope `repo`.)
2. **Add it as a secret** — in **this** repo (`craggles17/phylogenius`):
   Settings → Secrets and variables → **Actions** → *New repository secret*:
   - Name: `PAGES_DEPLOY_TOKEN`
   - Value: the token from step 1.

Until the secret exists, the `deploy` job fails fast with a clear message; the
`test` job is unaffected. After adding it, the next push to `main` deploys
automatically.

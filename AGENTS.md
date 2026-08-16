<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Local development

This project requires Node.js `24.19.0`. Before running the frontend, select the required version with nvm:

```bash
nvm use 24.19.0
npm run dev
```

If nvm is not loaded in the current shell, run `source ~/.nvm/nvm.sh` first. The development server is available at http://localhost:3000.

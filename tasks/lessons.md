# Lessons

Checkable rules from corrections in this project. Review at session start.

- Before acting on files in this repo, verify current directory state first; the operator reorganizes the folder directly (2026-07-09: discovery material was removed and restored outside agent control).
- Never run npm install against the mounted folder; it dies on the host-VM bridge. Work copy lives at /tmp/work: sync with `tar --exclude=node_modules --exclude=.git --exclude=.next --exclude=package.json --exclude=package-lock.json -cf - . | tar -xf - -C /tmp/work`, install/build/test there, copy package*.json back to the mount after dependency changes.
- `binaries.prisma.sh` is blocked in the sandbox. Run prisma generate as `PRISMA_SCHEMA_ENGINE_BINARY=/tmp/fake-engine npx prisma generate` (fake file must exist). CI and the operator's Mac need no workaround.
- `next/font/google` fails in sandbox builds (fonts.googleapis.com blocked) and phones Google in every build; use the npm `geist` package (self-hosted, EU-friendly).
- The Prisma client lives in gitignored src/generated/: every fresh install needs `prisma generate` (now wired as postinstall). In the sandbox, run installs as `npm install --ignore-scripts` and generate manually with the fake-engine env var; the operator's npm blocks dependency install scripts (allow-scripts), so tell them to run `npx prisma generate` if the module is missing.

#!/usr/bin/env bash
#
# One-shot local setup for this template.
#   ./scripts/setup.sh
#
# - installs npm dependencies
# - creates .env.local from the template if missing
# - optionally sets up Entire.io AI-session capture for this repo
#
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf "\n\033[1;36m==>\033[0m %s\n" "$1"; }

say "Installing dependencies"
npm install

if [ ! -f .env.local ]; then
  say "Creating .env.local from .env.example (fill in the values!)"
  cp .env.example .env.local
else
  echo ".env.local already exists — leaving it alone."
fi

# --- Entire.io: capture AI coding sessions alongside your commits -----------
# Entire (https://entire.io) records Claude Code / agent sessions, prompts, and
# tool calls as git-linked checkpoints. It's a dev-workflow tool, not an app
# dependency. Install the CLI, then this enables it for the repo.
if command -v entire >/dev/null 2>&1; then
  say "Enabling Entire for this repository"
  entire enable || echo "  (skipped: 'entire enable' failed — run it manually later)"
  entire agent setup || echo "  (skipped: 'entire agent setup' failed — run it manually later)"
else
  cat <<'EOF'

Entire CLI not found. To capture AI coding sessions (optional):
  macOS:   brew install --cask entireio/tap/entire
  Linux:   curl -fsSL https://entire.com/install.sh | bash
  Windows: irm https://entire.com/install.ps1 | iex

Then re-run this script, or run:  entire enable && entire agent setup
EOF
fi

say "Done. Next:"
cat <<'EOF'
  1. Fill in .env.local (Supabase URL + anon key at minimum).
  2. Start Supabase locally:   supabase start   (needs the Supabase CLI + Docker)
     ...or point .env.local at a hosted Supabase project.
  3. Run the app:              npm run dev
EOF

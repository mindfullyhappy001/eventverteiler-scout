#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo "Created server/.env (please adjust values)"
fi

echo "Installing frontend deps with bun..."
bun install

echo "Installing server deps with bun..."
(cd server && bun install && bun run prisma:generate)

echo "Running Prisma migrate (dev)..."
(cd server && bun run prisma:migrate || true)

echo "Installing bots deps with bun..."
(cd bots && bun install && bun run install:pw)

echo "All set. Start server with: (cd server && bun run dev) and open the frontend." 
